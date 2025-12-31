/**
 * Google Analytics 4 (GA4) utility
 * Tracks page views and custom events
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Initialize Google Analytics
 * Call this once when the app loads
 */
export const initGA = (): void => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics Measurement ID not found. Analytics will not be tracked.');
    return;
  }

  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true,
  });

  console.log('Google Analytics initialized');
};

/**
 * Track a page view
 * @param path - The page path (e.g., '/setup', '/game/123')
 * @param title - Optional page title
 */
export const trackPageView = (path: string, title?: string): void => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
};

/**
 * Track custom events
 * @param eventName - Name of the event
 * @param params - Event parameters
 */
export const trackEvent = (eventName: string, params?: Record<string, any>): void => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;

  window.gtag('event', eventName, params);
};

/**
 * Predefined event trackers for common actions
 */
export const analytics = {
  // Game events
  gameCreated: (difficulty: string, gameMode: string, questionType: string) => {
    trackEvent('game_created', {
      difficulty,
      game_mode: gameMode,
      question_type: questionType,
    });
  },

  gameStarted: (sessionId: string, participantCount: number) => {
    trackEvent('game_started', {
      session_id: sessionId,
      participant_count: participantCount,
    });
  },

  roundCompleted: (roundNumber: number, questionType: string) => {
    trackEvent('round_completed', {
      round_number: roundNumber,
      question_type: questionType,
    });
  },

  gameCompleted: (sessionId: string, totalRounds: number) => {
    trackEvent('game_completed', {
      session_id: sessionId,
      total_rounds: totalRounds,
    });
  },

  participantJoined: (sessionId: string, participantName: string) => {
    trackEvent('participant_joined', {
      session_id: sessionId,
      participant_name: participantName,
    });
  },

  buzzerPressed: (participantName: string, pressOrder: number) => {
    trackEvent('buzzer_pressed', {
      participant_name: participantName,
      press_order: pressOrder,
    });
  },

  answerSubmitted: (isCorrect: boolean, questionType: string) => {
    trackEvent('answer_submitted', {
      is_correct: isCorrect,
      question_type: questionType,
    });
  },
};
