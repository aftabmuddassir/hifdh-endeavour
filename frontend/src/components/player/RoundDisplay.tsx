import { BookOpen, HelpCircle, Volume2 } from 'lucide-react';

export type QuestionType =
  | 'guess_surah'
  | 'guess_meaning'
  | 'guess_next_ayat'
  | 'guess_previous_ayat';

interface RoundDisplayProps {
  roundNumber: number;
  totalRounds?: number;
  arabicText?: string;
  questionType: QuestionType;
  surahName?: string;
  ayatNumber?: number;
  translationEn?: string;
  showTranslation?: boolean;
  audioUrl?: string;
  onPlayAudio?: () => void;
  isAudioPlaying?: boolean;
}

export default function RoundDisplay({
  roundNumber,
  totalRounds,
  arabicText,
  questionType,
  surahName,
  ayatNumber,
  translationEn,
  showTranslation = false,
  audioUrl,
  onPlayAudio,
  isAudioPlaying = false,
}: RoundDisplayProps) {
  const questionTypeLabels: Record<QuestionType, string> = {
    guess_surah: 'Guess the Surah',
    guess_meaning: 'Guess the Meaning',
    guess_next_ayat: 'What Comes Next?',
    guess_previous_ayat: 'What Came Before?',
  };

  const questionTypeIcons: Record<QuestionType, string> = {
    guess_surah: '📖',
    guess_meaning: '🔍',
    guess_next_ayat: '➡️',
    guess_previous_ayat: '⬅️',
  };

  const questionTypeColors: Record<QuestionType, string> = {
    guess_surah: 'from-blue-500 to-cyan-600',
    guess_meaning: 'from-purple-500 to-pink-600',
    guess_next_ayat: 'from-green-500 to-emerald-600',
    guess_previous_ayat: 'from-orange-500 to-red-600',
  };

  return (
    <div className="space-y-4">
      {/* Round Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-cyan-400">
            Round {roundNumber}
            {totalRounds && ` of ${totalRounds}`}
          </h2>
        </div>

        {/* Audio Button */}
        {audioUrl && onPlayAudio && (
          <button
            onClick={onPlayAudio}
            className={`
              px-4 py-2 rounded-lg font-semibold flex items-center gap-2
              transition-all transform hover:scale-105
              ${
                isAudioPlaying
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700'
              }
            `}
          >
            <Volume2 className={`w-5 h-5 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">
              {isAudioPlaying ? 'Playing...' : 'Play Audio'}
            </span>
          </button>
        )}
      </div>

      {/* Question Type Badge */}
      <div className="flex justify-center">
        <div
          className={`
          inline-flex items-center gap-2 px-6 py-3 rounded-full
          bg-gradient-to-r ${questionTypeColors[questionType]}
          text-white font-bold text-lg shadow-lg
        `}
        >
          <HelpCircle className="w-6 h-6" />
          <span>
            {questionTypeIcons[questionType]} {questionTypeLabels[questionType]}
          </span>
        </div>
      </div>

      {/* Arabic Text Display */}
      {arabicText && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-2 border-purple-500/30">
          <div className="text-center">
            {/* Arabic Text - Right-to-Left */}
            <div className="mb-6">
              <p
                className="text-4xl sm:text-5xl md:text-6xl text-white leading-relaxed"
                style={{
                  fontFamily: 'Amiri, Traditional Arabic, serif',
                  direction: 'rtl',
                  unicodeBidi: 'bidi-override',
                }}
              >
                {arabicText}
              </p>
            </div>

            {/* Surah and Ayat Info */}
            {surahName && (
              <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {surahName}
                </span>
                {ayatNumber && <span>Ayah {ayatNumber}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Translation (Optional) */}
      {showTranslation && translationEn && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 border-2 border-cyan-500/30">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-2">
                Translation
              </h4>
              <p className="text-white text-lg leading-relaxed italic">
                "{translationEn}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Question Instructions */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/50 rounded-lg p-4">
        <p className="text-cyan-300 text-center">
          {getQuestionInstructions(questionType)}
        </p>
      </div>
    </div>
  );
}

// Helper function to get question-specific instructions
function getQuestionInstructions(questionType: QuestionType): string {
  const instructions: Record<QuestionType, string> = {
    guess_surah:
      '📖 Listen to the verse and identify which Surah it belongs to. Buzz in when you know the answer!',
    guess_meaning:
      '🔍 Understand the meaning of the verse and buzz in to explain its significance.',
    guess_next_ayat:
      "➡️ What comes next? Buzz in and recite or identify the following verse.",
    guess_previous_ayat:
      "⬅️ What came before this? Buzz in and recite or identify the preceding verse.",
  };
  return instructions[questionType];
}
