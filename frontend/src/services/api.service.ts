/**
 * API service for making HTTP requests to the backend
 */

import type { CreateGameRequest, GameSession, Reciter, Participant } from '../types/game';

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
