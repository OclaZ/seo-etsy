export default function ProcessButton({ onClick, disabled, processing }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || processing}
      className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 ${
        processing
          ? 'bg-orange-400 cursor-wait animate-pulse-soft'
          : disabled
          ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500'
          : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-[0.98]'
      }`}
    >
      {processing ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        'Optimize Images'
      )}
    </button>
  );
}
