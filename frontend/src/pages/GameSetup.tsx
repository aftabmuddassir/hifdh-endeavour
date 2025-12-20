import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import type { CreateGameRequest, Difficulty, GameMode, Reciter, QuestionType } from '../types/game';
import { Zap, Users, User, BookOpen, Sparkles, Trophy } from 'lucide-react';

export default function GameSetup() {
  const navigate = useNavigate();

  // Form state
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('individual');
  const [rangeType, setRangeType] = useState<'surah' | 'juz'>('surah');
  const [surahStart, setSurahStart] = useState(1);
  const [surahEnd, setSurahEnd] = useState(114);
  const [juzNumber, setJuzNumber] = useState(1);
  const [selectedReciterId, setSelectedReciterId] = useState<number | undefined>();
  const [scoreboardLimit, setScoreboardLimit] = useState(5);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>('guess_meaning');

  // Data state
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reciters on mount
  useEffect(() => {
    loadReciters();
  }, []);

  const loadReciters = async () => {
    try {
      const data = await apiService.getAllReciters();
      setReciters(data);
      if (data.length > 0) {
        setSelectedReciterId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load reciters:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const request: CreateGameRequest = {
      difficulty,
      gameMode,
      scoreboardLimit,
      reciterId: selectedReciterId,
      selectedQuestionTypes: [selectedQuestionType], // Single question type as array
    };

    if (rangeType === 'surah') {
      request.surahRangeStart = surahStart;
      request.surahRangeEnd = surahEnd;
    } else {
      request.juzNumber = juzNumber;
    }

    setLoading(true);

    try {
      const gameSession = await apiService.createGame(request);
      console.log('Game created:', gameSession);

      // Navigate to admin screen (creator has admin controls)
      navigate(`/admin/${gameSession.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create game');
      console.error('Error creating game:', err);
    } finally {
      setLoading(false);
    }
  };

  const difficultyConfig = {
    easy: {
      label: 'Easy',
      time: '90s',
      color: 'from-green-500 to-emerald-600',
      icon: <Sparkles className="w-6 h-6" />
    },
    medium: {
      label: 'Medium',
      time: '60s',
      color: 'from-yellow-500 to-orange-500',
      icon: <Zap className="w-6 h-6" />
    },
    hard: {
      label: 'Hard',
      time: '30s',
      color: 'from-red-500 to-pink-600',
      icon: <Trophy className="w-6 h-6" />
    },
  };

  const questionTypeConfig: Record<QuestionType, { label: string; points: number; emoji: string; color: string }> = {
    guess_surah: {
      label: 'Guess Surah',
      points: 10,
      emoji: '📖',
      color: 'from-blue-500 to-cyan-600',
    },
    guess_meaning: {
      label: 'Guess Meaning',
      points: 15,
      emoji: '💭',
      color: 'from-purple-500 to-pink-600',
    },
    guess_next_ayat: {
      label: 'Guess Next Ayah',
      points: 20,
      emoji: '➡️',
      color: 'from-green-500 to-emerald-600',
    },
    guess_previous_ayat: {
      label: 'Guess Previous Ayah',
      points: 25,
      emoji: '⬅️',
      color: 'from-orange-500 to-red-600',
    },
    guess_reciter: {
      label: 'Guess Reciter',
      points: 15,
      emoji: '🎙️',
      color: 'from-indigo-500 to-purple-600',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-1 rounded-2xl">
              <div className="bg-gray-900 px-8 py-4 rounded-xl">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  ⚡ Hifdh Quest ⚡
                </h1>
              </div>
            </div>
          </div>
          <p className="text-cyan-300 text-xl font-semibold animate-pulse">
            🎮 Create Your Game Session 🎮
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-2 border-purple-500/30">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
                <span className="block sm:inline font-semibold">⚠️ {error}</span>
              </div>
            )}

            {/* Difficulty Selection */}
            <div>
              <label className="block text-lg font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-4">
                🎯 DIFFICULTY LEVEL
              </label>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(difficultyConfig).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDifficulty(key as Difficulty)}
                    className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      difficulty === key
                        ? `border-transparent bg-gradient-to-br ${config.color} text-white shadow-lg shadow-${key === 'easy' ? 'green' : key === 'medium' ? 'yellow' : 'red'}-500/50`
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {config.icon}
                      <div className="font-bold text-lg">{config.label}</div>
                      <div className="text-sm opacity-90">{config.time}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Game Mode Selection */}
            <div>
              <label className="block text-lg font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-4">
                🎮 GAME MODE
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setGameMode('individual')}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    gameMode === 'individual'
                      ? 'border-transparent bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <User className="w-6 h-6" />
                    <div className="font-bold text-lg">Individual</div>
                    <div className="text-sm opacity-90">Solo Competition</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setGameMode('team')}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    gameMode === 'team'
                      ? 'border-transparent bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-6 h-6" />
                    <div className="font-bold text-lg">Team</div>
                    <div className="text-sm opacity-90">Collaborate Together</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Question Type Selection */}
            <div>
              <label className="block text-lg font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-4">
                ❓ QUESTION TYPE
              </label>
              <p className="text-sm text-gray-400 mb-4">Select ONE question type for this game</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['guess_surah', 'guess_meaning', 'guess_next_ayat', 'guess_previous_ayat'] as QuestionType[]).map(
                  (questionType) => {
                    const config = questionTypeConfig[questionType];
                    const isSelected = selectedQuestionType === questionType;
                    return (
                      <button
                        key={questionType}
                        type="button"
                        onClick={() => setSelectedQuestionType(questionType)}
                        className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          isSelected
                            ? `border-transparent bg-gradient-to-br ${config.color} text-white shadow-lg`
                            : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl">{config.emoji}</span>
                          <div className="font-bold text-base">{config.label}</div>
                          <div className="text-sm opacity-90">{config.points} points</div>
                          {isSelected && (
                            <div className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                              ✓ Selected
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Range Type Selection */}
            <div>
              <label className="block text-lg font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-4">
                📖 VERSE SELECTION
              </label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setRangeType('surah')}
                  className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    rangeType === 'surah'
                      ? 'border-transparent bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-bold">Surah Range</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRangeType('juz')}
                  className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    rangeType === 'juz'
                      ? 'border-transparent bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-bold">Juz Number</span>
                  </div>
                </button>
              </div>

              {/* Surah Range Inputs */}
              {rangeType === 'surah' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">Start Surah</label>
                    <input
                      type="number"
                      min="1"
                      max="114"
                      value={surahStart}
                      onChange={(e) => setSurahStart(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-700/70 border-2 border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">End Surah</label>
                    <input
                      type="number"
                      min="1"
                      max="114"
                      value={surahEnd}
                      onChange={(e) => setSurahEnd(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-700/70 border-2 border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
              )}

              {/* Juz Input */}
              {rangeType === 'juz' && (
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-2">Juz Number (1-30)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={juzNumber}
                    onChange={(e) => setJuzNumber(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-700/70 border-2 border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder-gray-400"
                  />
                </div>
              )}
            </div>

            {/* Reciter Selection */}
            {reciters.length > 0 && (
              <div>
                <label className="block text-lg font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-4">
                  🎙️ RECITER
                </label>
                <select
                  value={selectedReciterId}
                  onChange={(e) => setSelectedReciterId(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-700/70 border-2 border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-medium cursor-pointer"
                >
                  {reciters.map((reciter) => (
                    <option key={reciter.id} value={reciter.id} className="bg-gray-800">
                      {reciter.name} ({reciter.country})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Scoreboard Limit */}
            <div>
              <label className="block text-lg font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-4">
                🏆 SCOREBOARD LIMIT
              </label>
              <input
                type="number"
                min="3"
                max="20"
                value={scoreboardLimit}
                onChange={(e) => setScoreboardLimit(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-700/70 border-2 border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder-gray-400 font-medium"
              />
              <p className="mt-2 text-sm text-gray-400">Number of top players to display on the scoreboard</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 text-white font-bold text-xl rounded-xl hover:from-green-600 hover:via-emerald-600 hover:to-cyan-600 transition-all transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:transform-none shadow-2xl shadow-green-500/50 hover:shadow-green-400/60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Creating Game...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🚀 START HIFDH QUEST 🚀
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
