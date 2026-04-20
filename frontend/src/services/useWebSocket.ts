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


    const socketUrl = `http://localhost:8080/ws?token=${encodeURIComponent(accessToken)}`;

    let retryCount = 0;
    const MAX_RETRY = 5;

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,

      onWebSocketClose: () => {
        retryCount++;
        if (retryCount > MAX_RETRY) {
          console.error("Stop reconnecting WebSocket");
          client.deactivate(); // 🔥 chặn vòng lặp
        }
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
      clientRef.current?.deactivate(); // luôn gọi
      clientRef.current = null;
      setConnected(false);
    };
  }, [topic, accessToken]);

  return { connected };
}
