import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../store/authStore';

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

    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.host;
    const socketUrl = `${protocol}//${host}/ws?token=${encodeURIComponent(accessToken)}`;

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
    });

    client.onConnect = () => {
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
      if (clientRef.current?.connected) {
        clientRef.current.deactivate();
      }
      setConnected(false);
    };
  }, [topic, accessToken]);

  return { connected };
}
