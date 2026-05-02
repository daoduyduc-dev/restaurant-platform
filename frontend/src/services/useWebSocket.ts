import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from './config';

const MAX_RETRY_ATTEMPTS = 5;

export function useWebSocket<T>(topic: string | string[], onMessage: (msg: T) => void) {
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  const clientRef = useRef<Client | null>(null);
  const { token: accessToken } = useAuthStore();

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!accessToken) {
      setConnected(false);
      return;
    }

    const socketUrl = `${resolveSocketUrl()}?token=${encodeURIComponent(accessToken)}`;
    let retryCount = 0;

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onStompError: (frame) => {
        console.error('WebSocket error:', frame.headers['message']);
        setConnected(false);
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onWebSocketClose: () => {
        setConnected(false);
        retryCount += 1;
        if (retryCount > MAX_RETRY_ATTEMPTS) {
          console.error('Stop reconnecting WebSocket');
          client.deactivate();
        }
      },
    });

    client.onConnect = () => {
      retryCount = 0;
      setConnected(true);

      const topics = Array.isArray(topic) ? topic : [topic];

      topics.forEach((t) => {
        try {
          client.subscribe(t, (message: IMessage) => {
            if (message.body && onMessageRef.current) {
              try {
                const parsed = JSON.parse(message.body);
                onMessageRef.current(parsed as T);
              } catch (e) {
                console.error('Failed to parse WebSocket message:', e);
              }
            }
          });
        } catch (err) {
          console.error('Failed to subscribe to topic', t, err);
        }
      });
    };

    clientRef.current = client;
    client.activate();

    return () => {
      clientRef.current?.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [accessToken, topic]);

  return { connected };
}

function resolveSocketUrl() {
  const resolvedApiUrl = new URL(API_BASE_URL, window.location.origin);
  return new URL('/ws', resolvedApiUrl.origin).toString();
}
