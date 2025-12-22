import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Game Event Types from backend
export interface GameEvent {
  type: string;
  sessionId: string;
  timestamp: string;
}

export interface RoundStartedEvent extends GameEvent {
  type: 'ROUND_STARTED';
  roundId: string;
  roundNumber: number;
  totalRounds?: number;
  ayat: {
    surahNumber: number;
    ayatNumber: number;
    arabicText: string;
    translationEn?: string;
    surahName: string;
  };
  questionType: string;
  audioUrl?: string;
  audioMode: string;
  autoPlayAudio: boolean;
  timerSeconds: number;
  timerStartsAt: string;
}

export interface BuzzerPressedEvent extends GameEvent {
  type: 'BUZZER_PRESSED';
  participantId: number;
  participantName: string;
  buzzRank: number;
  buzzTimeSeconds: number;
  totalBuzzesAllowed: number;
  remainingSlots: number;
  buzzerPressedAt: string;
}

export interface TimerStoppedEvent extends GameEvent {
  type: 'TIMER_STOPPED';
  reason: string;
  totalBuzzes: number;
}

export interface AnswerValidatedEvent extends GameEvent {
  type: 'ANSWER_VALIDATED';
  participantId: number;
  participantName: string;
  isCorrect: boolean;
  pointsAwarded: number;
  newTotalScore: number;
}

export interface ScoreboardUpdateEvent extends GameEvent {
  type: 'SCOREBOARD_UPDATE';
  scores: Array<{
    participantId: number;
    participantName: string;
    totalScore: number;
    rank: number | null;
    roundsWon: number;
    isConnected: boolean;
    isBlockedNextRound: boolean;
  }>;
}

export interface RoundEndedEvent extends GameEvent {
  type: 'ROUND_ENDED';
  roundId: string;
}

export interface PlayerWebSocketCallbacks {
  onRoundStarted?: (event: RoundStartedEvent) => void;
  onBuzzerPressed?: (event: BuzzerPressedEvent) => void;
  onTimerStopped?: (event: TimerStoppedEvent) => void;
  onAnswerValidated?: (event: AnswerValidatedEvent) => void;
  onScoreboardUpdate?: (event: ScoreboardUpdateEvent) => void;
  onRoundEnded?: (event: RoundEndedEvent) => void;
  onError?: (error: string) => void;
}

export function usePlayerWebSocket(
  sessionId: string,
  participantId: number,
  callbacks: PlayerWebSocketCallbacks = {}
) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Array<{ unsubscribe: () => void }>>([]);

  // Send buzzer press
  const pressBuzzer = useCallback(
    (roundId: string, clientElapsedSeconds: number) => {
      if (!clientRef.current || !isConnected) {
        console.error('Cannot send buzzer press - not connected');
        return;
      }

      const message = {
        sessionId,
        roundId,
        participantId,
        clientElapsedSeconds,
      };

      console.log('🔔 Sending buzzer press:', message);

      clientRef.current.publish({
        destination: '/app/player/buzz',
        body: JSON.stringify(message),
      });
    },
    [sessionId, participantId, isConnected]
  );

  // Submit answer
  const submitAnswer = useCallback(
    (roundId: string, answerText: string) => {
      if (!clientRef.current || !isConnected) {
        console.error('Cannot submit answer - not connected');
        return;
      }

      const message = {
        sessionId,
        roundId,
        participantId,
        answerText,
      };

      console.log('📝 Submitting answer:', message);

      clientRef.current.publish({
        destination: '/app/player/submit-answer',
        body: JSON.stringify(message),
      });
    },
    [sessionId, participantId, isConnected]
  );

  // Send heartbeat
  const sendHeartbeat = useCallback(() => {
    if (!clientRef.current || !isConnected) {
      return;
    }

    const message = {
      sessionId,
      participantId,
    };

    clientRef.current.publish({
      destination: '/app/player/heartbeat',
      body: JSON.stringify(message),
    });
  }, [sessionId, participantId, isConnected]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!sessionId || !participantId) return;

    setIsConnecting(true);

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws') as any,
      debug: (str) => {
        console.log('[Player WS]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ Player WebSocket Connected');
      setIsConnected(true);
      setIsConnecting(false);

      // Subscribe to game events
      const eventsSubscription = client.subscribe(
        `/topic/game/${sessionId}/events`,
        (message: IMessage) => {
          try {
            const event: GameEvent = JSON.parse(message.body);

            // Route to appropriate callback
            switch (event.type) {
              case 'ROUND_STARTED':
                callbacks.onRoundStarted?.(event as RoundStartedEvent);
                break;
              case 'BUZZER_PRESSED':
                callbacks.onBuzzerPressed?.(event as BuzzerPressedEvent);
                break;
              case 'TIMER_STOPPED':
                callbacks.onTimerStopped?.(event as TimerStoppedEvent);
                break;
              case 'ANSWER_VALIDATED':
                callbacks.onAnswerValidated?.(event as AnswerValidatedEvent);
                break;
              case 'SCOREBOARD_UPDATE':
                callbacks.onScoreboardUpdate?.(event as ScoreboardUpdateEvent);
                break;
              case 'ROUND_ENDED':
                callbacks.onRoundEnded?.(event as RoundEndedEvent);
                break;
            }
          } catch (error) {
            console.error('Error parsing game event:', error);
            callbacks.onError?.('Failed to parse game event');
          }
        }
      );

      subscriptionsRef.current.push(eventsSubscription);
    };

    client.onStompError = (frame) => {
      console.error('❌ Player WebSocket Error:', frame.headers['message']);
      setIsConnected(false);
      setIsConnecting(false);
      callbacks.onError?.(frame.headers['message'] || 'WebSocket error');
    };

    client.onWebSocketClose = () => {
      console.log('⚠️ Player WebSocket closed');
      setIsConnected(false);
      setIsConnecting(false);
    };

    client.activate();
    clientRef.current = client;

    // Heartbeat interval (every 30 seconds)
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 30000);

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current = [];
      client.deactivate();
    };
  }, [sessionId, participantId]); // Only recreate if sessionId or participantId changes

  return {
    isConnected,
    isConnecting,
    pressBuzzer,
    submitAnswer,
    sendHeartbeat,
  };
}
