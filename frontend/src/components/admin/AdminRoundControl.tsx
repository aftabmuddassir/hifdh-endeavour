import { useState } from 'react';
import { Play, BookOpen, Volume2, Clock } from 'lucide-react';
import type { RoundStartedEvent } from '../../hooks/usePlayerWebSocket';

interface AdminRoundControlProps {
  currentRound: RoundStartedEvent | null;
  onStartRound: (questionType: string, reciterId?: number) => void;
  timerSeconds: number;
}

export default function AdminRoundControl({
  currentRound,
  onStartRound,
  timerSeconds,
}: AdminRoundControlProps) {
  const [selectedQuestionType, setSelectedQuestionType] = useState('guess_surah');
  const [selectedReciter, setSelectedReciter] = useState(1);

  const questionTypes = [
    { value: 'guess_surah', label: 'Guess Surah', points: 10 },
    { value: 'guess_meaning', label: 'Guess Meaning', points: 15 },
    { value: 'guess_next_ayat', label: 'Guess Next Ayat', points: 20 },
    { value: 'guess_previous_ayat', label: 'Guess Previous Ayat', points: 25 },
    { value: 'guess_reciter', label: 'Guess Reciter', points: 15 },
  ];

  const reciters = [
    { id: 1, name: 'AbdulBaset AbdulSamad (Mujawwad)' },
    { id: 2, name: 'Abdullah Basfar' },
    { id: 3, name: 'Mishary Rashid Al-Afasy' },
  ];

  if (!currentRound) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-2 border-purple-500/30">
        <div className="flex items-center gap-3 mb-6">
          <Play className="w-7 h-7 text-green-400" />
          <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
            Start New Round
          </h2>
        </div>

        <div className="space-y-6">
          {/* Question Type Selection */}
          <div>
            <label className="block text-lg font-bold text-cyan-300 mb-3">Question Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {questionTypes.map((qt) => (
                <button
                  key={qt.value}
                  onClick={() => setSelectedQuestionType(qt.value)}
                  className={`
                    p-4 rounded-lg font-bold text-left transition-all transform hover:scale-105
                    ${
                      selectedQuestionType === qt.value
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{qt.label}</span>
                    <span className="text-sm bg-white/20 px-2 py-1 rounded">+{qt.points}pts</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reciter Selection */}
          <div>
            <label className="block text-lg font-bold text-cyan-300 mb-3">Reciter</label>
            <select
              value={selectedReciter}
              onChange={(e) => setSelectedReciter(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-medium"
            >
              {reciters.map((reciter) => (
                <option key={reciter.id} value={reciter.id}>
                  {reciter.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Round Button */}
          <button
            onClick={() => onStartRound(selectedQuestionType, selectedReciter)}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-2xl shadow-green-500/50"
          >
            <Play className="w-6 h-6 inline-block mr-2" />
            START ROUND
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border-2 border-green-500/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text">
            Round {currentRound.roundNumber} - LIVE
          </h2>
        </div>
        <div className="flex items-center gap-2 text-cyan-300">
          <Clock className="w-5 h-5" />
          <span className="font-bold">{timerSeconds}s</span>
        </div>
      </div>

      {/* Current Ayat Display */}
      <div className="bg-gray-900/50 rounded-xl p-6 mb-4 border border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span className="text-cyan-300 font-semibold">
            {currentRound.ayat.surahName} - Ayat {currentRound.ayat.ayatNumber}
          </span>
        </div>

        {/* Arabic Text */}
        <div className="text-right mb-4">
          <p className="text-2xl text-white font-arabic leading-loose">
            {currentRound.ayat.arabicText}
          </p>
        </div>

        {/* Translation */}
        {currentRound.ayat.translationEn && (
          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-300 text-sm italic">{currentRound.ayat.translationEn}</p>
          </div>
        )}
      </div>

      {/* Question Type & Audio */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Question Type</div>
          <div className="text-white font-bold capitalize">{currentRound.questionType.replace('_', ' ')}</div>
        </div>

        {currentRound.audioUrl && (
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Audio</div>
            <audio controls className="w-full h-8">
              <source src={currentRound.audioUrl} type="audio/mpeg" />
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}
