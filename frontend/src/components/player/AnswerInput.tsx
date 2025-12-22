import { useState } from 'react';
import { Send, Loader2, Edit3 } from 'lucide-react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export default function AnswerInput({
  onSubmit,
  isSubmitting = false,
  disabled = false,
  placeholder = 'Type your answer here...',
  maxLength = 500,
  showCharCount = true,
}: AnswerInputProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer.trim() || isSubmitting || disabled) {
      return;
    }

    onSubmit(answer.trim());
    setAnswer(''); // Clear input after submission
  };

  const remainingChars = maxLength - answer.length;
  const isNearLimit = remainingChars <= maxLength * 0.1; // Warning when < 10% remaining

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border-2 border-purple-500/30">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Edit3 className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-cyan-400">Your Answer</h3>
        {disabled && (
          <span className="ml-auto px-3 py-1 bg-gray-600 text-gray-300 rounded-full text-xs font-semibold">
            Not Your Turn
          </span>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Text Input */}
        <div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value.slice(0, maxLength))}
            placeholder={placeholder}
            disabled={isSubmitting || disabled}
            className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            rows={4}
            maxLength={maxLength}
          />

          {/* Character Count */}
          {showCharCount && (
            <div className="flex justify-end mt-2">
              <span
                className={`text-xs font-semibold ${
                  isNearLimit ? 'text-yellow-400' : 'text-gray-400'
                }`}
              >
                {answer.length} / {maxLength}
                {isNearLimit && ' ⚠️'}
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!answer.trim() || isSubmitting || disabled}
          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Submit Answer</span>
            </>
          )}
        </button>
      </form>

      {/* Instructions */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-sm text-center">
          💡 <strong>Tip:</strong> Be as specific as possible in your answer for maximum
          points!
        </p>
      </div>
    </div>
  );
}
