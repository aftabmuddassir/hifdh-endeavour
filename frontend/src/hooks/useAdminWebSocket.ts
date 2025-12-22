import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type {
  GameEvent,
  RoundStartedEvent,
  BuzzerPressedEvent,
  TimerStoppedEvent,
  AnswerValidatedEvent,
  ScoreboardUpdateEvent,
} from './usePlayerWebSocket';

export interface AdminWebSocketCallbacks {
  onRoundStarted?: (event: RoundStartedEvent) => void;
  onBuzzerPressed?: (event: BuzzerPressedEvent) => void;
  onTimerStopped?: (event: TimerStoppedEvent) => void;
  onAnswerValidated?: (event: AnswerValidatedEvent) => void;
  onScoreboardUpdate?: (event: ScoreboardUpdateEvent) => void;
  onError?: (error: string) => void;
}

export function useAdminWebSocket(
  sessionId: string,
  callbacks: AdminWebSocketCallbacks = {}
) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Array<{ unsubscribe: () => void }>>([]);

  // Start a new round
  const startRound = useCallback(
    (questionType: string, reciterId?: number) => {
      if (!clientRef.current || !isConnected) {
        console.error('Cannot start round - not connected');
        return;
      }

      const message = {
        sessionId,
        questionType,
        reciterId: reciterId || null,
      };

      console.log('🎮 Starting new round:', message);

      clientRef.current.publish({
        destination: '/app/admin/start-round',
        body: JSON.stringify(message),
      });
    },
    [sessionId, isConnected]
  );

  // Validate an answer
  const validateAnswer = useCallback(
    (participantId: number, roundId: string, isCorrect: boolean, pointsAwarded: number) => {
      if (!clientRef.current || !isConnected) {
        console.error('Cannot validate answer - not connected');
        return;
      }

      const message = {
        sessionId,
        roundId,
        participantId,
        isCorrect,
        pointsAwarded,
      };

      console.log('✅ Validating answer:', message);

      clientRef.current.publish({
        destination: '/app/admin/validate-answer',
        body: JSON.stringify(message),
      });
    },
    [sessionId, isConnected]
  );

  // End current round
  const endRound = useCallback(
    (roundId: string) => {
      if (!clientRef.current || !isConnected) {
        console.error('Cannot end round - not connected');
        return;
      }

      const message = {
        sessionId,
        roundId,
      };

      console.log('🏁 Ending round:', message);

      clientRef.current.publish({
        destination: '/app/admin/end-round',
        body: JSON.stringify(message),
      });
    },
    [sessionId, isConnected]
  );

  // Setup WebSocket connection
  useEffect(() => {
    if (!sessionId) return;

    setIsConnecting(true);

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws') as any,
      debug: (str) => {
        console.log('[Admin WS]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ Admin WebSocket Connected');
      setIsConnected(true);
      setIsConnecting(false);

      // Subscribe to game events
      const topic = `/topic/game/${sessionId}/events`;
      console.log('🎯 Admin subscribing to:', topic);

      const eventsSubscription = client.subscribe(
        topic,
        (message: IMessage) => {
          try {
            console.log('📨 Admin received RAW message:', message.body);
            const event: GameEvent = JSON.parse(message.body);
            console.log('📥 Admin received event:', event.type, event);

            // Route to appropriate callback
            switch (event.type) {
              case 'ROUND_STARTED':
                console.log('🎮 Calling onRoundStarted');
                callbacks.onRoundStarted?.(event as RoundStartedEvent);
                break;
              case 'BUZZER_PRESSED':
                console.log('🔔 Calling onBuzzerPressed');
                callbacks.onBuzzerPressed?.(event as BuzzerPressedEvent);
                break;
              case 'TIMER_STOPPED':
                console.log('⏱️ Calling onTimerStopped');
                callbacks.onTimerStopped?.(event as TimerStoppedEvent);
                break;
              case 'ANSWER_VALIDATED':
                console.log('✅ Calling onAnswerValidated');
                callbacks.onAnswerValidated?.(event as AnswerValidatedEvent);
                break;
              case 'SCOREBOARD_UPDATE':
                console.log('🏆 Calling onScoreboardUpdate');
                callbacks.onScoreboardUpdate?.(event as ScoreboardUpdateEvent);
                break;
              default:
                console.warn('⚠️ Unknown event type:', event.type);
            }
          } catch (error) {
            console.error('❌ Error parsing game event:', error);
            callbacks.onError?.('Failed to parse game event');
          }
        }
      );

      console.log('✅ Admin subscription created');
      subscriptionsRef.current.push(eventsSubscription);
    };

    client.onStompError = (frame) => {
      console.error('❌ Admin WebSocket Error:', frame.headers['message']);
      setIsConnected(false);
      setIsConnecting(false);
      callbacks.onError?.(frame.headers['message'] || 'WebSocket error');
    };

    client.onWebSocketClose = () => {
      console.log('⚠️ Admin WebSocket closed');
      setIsConnected(false);
      setIsConnecting(false);
    };

    client.activate();
    clientRef.current = client;

    // Cleanup
    return () => {
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current = [];
      client.deactivate();
    };
  }, [sessionId]); // Only recreate if sessionId changes

  return {
    isConnected,
    isConnecting,
    startRound,
    validateAnswer,
    endRound,
  };
}
