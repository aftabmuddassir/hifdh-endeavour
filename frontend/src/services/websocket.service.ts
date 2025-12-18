import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;

  connect(onConnect?: () => void, onError?: (error: any) => void) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => {
        console.log('[STOMP Debug]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('WebSocket Connected!');
      this.connected = true;
      onConnect?.();
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
      this.connected = false;
      onError?.(frame);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      console.log('WebSocket Disconnected');
    }
  }

  subscribe(destination: string, callback: (message: IMessage) => void) {
    if (!this.client || !this.connected) {
      console.error('Cannot subscribe: Not connected');
      return;
    }

    return this.client.subscribe(destination, callback);
  }

  send(destination: string, body: any) {
    if (!this.client || !this.connected) {
      console.error('Cannot send: Not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// Singleton instance
export const wsService = new WebSocketService();
