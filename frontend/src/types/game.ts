/**
 * Type definitions for game-related data structures
 */

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'individual' | 'team';
export type GameStatus = 'setup' | 'active' | 'completed';
export type QuestionType = 'guess_surah' | 'guess_meaning' | 'guess_next_ayat' | 'guess_previous_ayat' | 'guess_reciter';

export interface Participant {
  id: number;
  name: string;
  isTeam: boolean;
  totalScore: number;
  buzzerPressCount: number;
  isBlocked: boolean;
}

export interface GameSession {
  id: string;
  adminId?: number;
  surahRangeStart: number;
  surahRangeEnd: number;
  juzNumber?: number;
  difficulty: Difficulty;
  timerSeconds: number;
  gameMode: GameMode;
  scoreboardLimit: number;
  status: GameStatus;
  createdAt: string;
  currentRoundNumber: number;
  participants: Participant[];
}

export interface CreateGameRequest {
  adminId?: number;
  surahRangeStart?: number;
  surahRangeEnd?: number;
  juzNumber?: number;
  difficulty: Difficulty;
  gameMode: GameMode;
  scoreboardLimit?: number;
  participantNames?: string[]; // Optional - for Kahoot-style join flow
  reciterId?: number;
}

export interface GameRound {
  id: number;
  roundNumber: number;
  surahNumber: number;
  ayatNumber: number;
  arabicText: string;
  translation: string;
  audioUrl: string;
  currentQuestionType: QuestionType;
  startedAt: string;
  endedAt?: string;
}

export interface BuzzerPress {
  id: number;
  roundId: number;
  participantId: number;
  participantName: string;
  pressedAt: string;
  pressOrder: number;
  gotChance: boolean;
  answerText?: string;
  isCorrect?: boolean;
}

export interface Reciter {
  id: number;
  name: string;
  everyayahCode: string;
  country: string;
}

export interface Ayat {
  id: number;
  surahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  ayatNumber: number;
  arabicText: string;
  translationEn: string;
  juzNumber: number;
  audioUrl: string;
}
