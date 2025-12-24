import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { GameSession } from '../types/game';

export type GameSessionUpdateHandler = (session: GameSession) => void;

export class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private sessionSubscriptions: Map<string, StompSubscription> = new Map();
  private connectPromise: Promise<void> | null = null;

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    // Return existing connection promise if already connecting
    if (this.connectPromise) {
      return this.connectPromise;
    }

    // Already connected
    if (this.connected && this.client) {
      return Promise.resolve();
    }

    this.connectPromise = new Promise((resolve, reject) => {
      const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

      this.client = new Client({
        webSocketFactory: () => new SockJS(wsUrl) as any,
        debug: (str) => {
          console.log('[WebSocket]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        console.log('✅ WebSocket Connected');
        this.connected = true;
        this.connectPromise = null;
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('❌ STOMP Error:', frame.headers['message']);
        this.connected = false;
        this.connectPromise = null;
        reject(new Error(frame.headers['message'] || 'WebSocket connection error'));
      };

      this.client.onWebSocketClose = () => {
        console.log('⚠️ WebSocket connection closed');
        this.connected = false;
        this.connectPromise = null;
      };

      this.client.activate();
    });

    return this.connectPromise;
  }

  /**
   * Subscribe to game session updates
   */
  async subscribeToGameSession(
    sessionId: string,
    onUpdate: GameSessionUpdateHandler
  ): Promise<() => void> {
    // Ensure connection
    if (!this.connected) {
      await this.connect();
    }

    if (!this.client) {
      throw new Error('WebSocket client not initialized');
    }

    // Unsubscribe if already subscribed to this session
    if (this.sessionSubscriptions.has(sessionId)) {
      this.unsubscribeFromGameSession(sessionId);
    }

    console.log(`📡 Subscribing to /topic/game/${sessionId}`);

    const subscription = this.client.subscribe(
      `/topic/game/${sessionId}`,
      (message: IMessage) => {
        try {
          const gameSession: GameSession = JSON.parse(message.body);
          console.log('📥 Game session update received');
          onUpdate(gameSession);
        } catch (error) {
          console.error('Error parsing game session update:', error);
        }
      }
    );

    this.sessionSubscriptions.set(sessionId, subscription);

    // Return unsubscribe function
    return () => this.unsubscribeFromGameSession(sessionId);
  }

  /**
   * Unsubscribe from a specific game session
   */
  unsubscribeFromGameSession(sessionId: string) {
    const subscription = this.sessionSubscriptions.get(sessionId);
    if (subscription) {
      console.log(`🔌 Unsubscribing from /topic/game/${sessionId}`);
      subscription.unsubscribe();
      this.sessionSubscriptions.delete(sessionId);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.client) {
      console.log('🔌 Disconnecting WebSocket...');

      // Unsubscribe from all sessions
      this.sessionSubscriptions.forEach(sub => sub.unsubscribe());
      this.sessionSubscriptions.clear();

      this.client.deactivate();
      this.connected = false;
      this.client = null;
      this.connectPromise = null;
    }
  }

  /**
   * Send a message to a destination
   */
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

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

// Singleton instance
export const wsService = new WebSocketService();
