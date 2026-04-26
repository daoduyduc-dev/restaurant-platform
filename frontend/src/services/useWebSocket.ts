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
  const topicRef = useRef(topic);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    topicRef.current = topic;
  }, [topic]);

  useEffect(() => {
    if (!accessToken) {
      setConnected(false);
      return;
    }

    const apiBase = apiBaseUrl();
    const socketUrl = `${apiBase.replace(/\/api\/v1$/, '')}/ws?token=${encodeURIComponent(accessToken)}`;

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
      console.log('WebSocket connected to:', topicRef.current);

      const topics = Array.isArray(topicRef.current) ? topicRef.current : [topicRef.current];

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
  }, [accessToken]);

  return { connected };
}

function apiBaseUrl() {
  return 'http://localhost:8080/api/v1';
}
