/**
 * API service for making HTTP requests to the backend
 */

import type { CreateGameRequest, GameSession, Reciter, Participant, GameRound } from '../types/game';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ============================================
  // GAME MANAGEMENT
  // ============================================

  /**
   * Create a new game session
   */
  async createGame(request: CreateGameRequest): Promise<GameSession> {
    return this.fetch<GameSession>('/api/game/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get game session by ID
   */
  async getGameSession(sessionId: string): Promise<GameSession> {
    return this.fetch<GameSession>(`/api/game/${sessionId}`);
  }

  /**
   * Start a game session
   */
  async startGame(sessionId: string): Promise<GameSession> {
    return this.fetch<GameSession>(`/api/game/${sessionId}/start`, {
      method: 'POST',
    });
  }

  /**
   * End a game session
   */
  async endGame(sessionId: string): Promise<GameSession> {
    return this.fetch<GameSession>(`/api/game/${sessionId}/end`, {
      method: 'POST',
    });
  }

  /**
   * Get scoreboard for a game
   */
  async getScoreboard(sessionId: string): Promise<Participant[]> {
    return this.fetch<Participant[]>(`/api/game/${sessionId}/scoreboard`);
  }

  /**
   * Add participant to game
   */
  async addParticipant(sessionId: string, name: string): Promise<Participant> {
    return this.fetch<Participant>(`/api/game/${sessionId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // ============================================
  // ROUND MANAGEMENT
  // ============================================

  /**
   * Create a new round (question type is auto-selected by backend)
   */
  async createRound(
    sessionId: string,
    questionType?: string,
    reciterId?: number
  ): Promise<GameRound> {
    // Only include fields that are defined
    const body: { questionType?: string; reciterId?: number } = {};
    if (questionType !== undefined) {
      body.questionType = questionType;
    }
    if (reciterId !== undefined) {
      body.reciterId = reciterId;
    }

    return this.fetch<GameRound>(`/api/game/${sessionId}/rounds`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Get current round for a session
   */
  async getCurrentRound(sessionId: string): Promise<GameRound | null> {
    try {
      return await this.fetch<GameRound>(`/api/game/${sessionId}/rounds/current`);
    } catch (error) {
      // Return null if no current round (404)
      return null;
    }
  }

  /**
   * Get all rounds for a session
   */
  async getRounds(sessionId: string): Promise<GameRound[]> {
    return this.fetch<GameRound[]>(`/api/game/${sessionId}/rounds`);
  }

  /**
   * End a round
   */
  async endRound(roundId: number): Promise<GameRound> {
    return this.fetch<GameRound>(`/api/game/rounds/${roundId}/end`, {
      method: 'POST',
    });
  }

  /**
   * Get question points for a question type
   */
  async getQuestionPoints(questionType: string): Promise<number> {
    const response = await this.fetch<{ points: number }>(
      `/api/game/question-points/${questionType}`
    );
    return response.points;
  }

  // ============================================
  // RECITERS
  // ============================================

  /**
   * Get all reciters
   */
  async getAllReciters(): Promise<Reciter[]> {
    return this.fetch<Reciter[]>('/api/reciters');
  }

  /**
   * Get reciter by ID
   */
  async getReciterById(reciterId: number): Promise<Reciter> {
    return this.fetch<Reciter>(`/api/reciters/${reciterId}`);
  }
}

// Export singleton instance
export const apiService = new ApiService();
