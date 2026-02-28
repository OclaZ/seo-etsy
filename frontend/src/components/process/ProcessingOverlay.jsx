import { useEffect, useState } from 'react';

const PHASES = [
  { key: 'renaming', label: 'Renaming files', statKey: 'renamedCount' },
  { key: 'injecting', label: 'Injecting SEO metadata', statKey: 'injectedCount' },
  { key: 'verifying', label: 'Verifying results', statKey: null },
];

function phaseProgress(phase) {
  switch (phase) {
    case 'renaming': return 20;
    case 'injecting-selected': return 50;
    case 'injecting-unselected': return 75;
    case 'done': return 100;
    case 'error': return 100;
    default: return 0;
  }
}

function phaseIndex(phase) {
  if (phase === 'renaming') return 0;
  if (phase === 'injecting-selected' || phase === 'injecting-unselected') return 1;
  if (phase === 'done' || phase === 'error') return 2;
  return -1;
}

function SpinnerIcon() {
  return (
    <svg className="w-6 h-6 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function LargeCheckIcon() {
  return (
    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4 animate-bounce-in">
      <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

function LargeWarningIcon() {
  return (
    <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4 animate-bounce-in">
      <svg className="w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
}

export default function ProcessingOverlay({ status, onComplete }) {
  const { phase, totalImages, renamedCount, injectedCount, errors, errorMessage } = status;
  const currentPhaseIdx = phaseIndex(phase);
  const progress = phaseProgress(phase);
  const [showSummary, setShowSummary] = useState(false);

  // Show summary with a small delay after done
  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(() => setShowSummary(true), 400);
      return () => clearTimeout(t);
    }
    setShowSummary(false);
  }, [phase]);

  // Auto-transition after showing summary
  useEffect(() => {
    if (showSummary && phase === 'done') {
      const t = setTimeout(onComplete, 3000);
      return () => clearTimeout(t);
    }
  }, [showSummary, phase, onComplete]);

  const hasErrors = errors && errors.length > 0;

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
        {phase === 'done' ? 'Optimization Complete' : phase === 'error' ? 'Processing Error' : 'Optimizing Your Images...'}
      </h2>

      {/* Phase error */}
      {phase === 'error' && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <ErrorIcon />
            <p className="font-semibold text-red-700 dark:text-red-400">Processing failed</p>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 ml-9">{errorMessage || 'An unexpected error occurred.'}</p>
          <button
            onClick={onComplete}
            className="mt-4 ml-9 px-5 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Phase steps list */}
      {phase !== 'error' && (
        <>
          <div className="space-y-3 mb-6">
            {PHASES.map((p, i) => {
              const isActive = i === currentPhaseIdx;
              const isComplete = i < currentPhaseIdx || (i === currentPhaseIdx && phase === 'done');
              const isPending = i > currentPhaseIdx;

              let countText = '';
              if (isComplete || isActive) {
                if (p.statKey === 'renamedCount') countText = `${renamedCount} / ${totalImages}`;
                if (p.statKey === 'injectedCount') countText = `${injectedCount} / ${totalImages}`;
              }

              return (
                <div
                  key={p.key}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50' :
                    isComplete ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50' :
                    'bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50'
                  }`}
                >
                  {isComplete ? <CheckIcon /> : isActive ? <SpinnerIcon /> : <CircleIcon />}
                  <span className={`flex-1 text-sm font-medium ${
                    isActive ? 'text-orange-700 dark:text-orange-400' :
                    isComplete ? 'text-green-700 dark:text-green-400' :
                    'text-gray-400 dark:text-gray-500'
                  }`}>
                    {p.label}
                  </span>
                  {countText && (
                    <span className={`text-sm font-semibold ${
                      isComplete ? 'text-green-600 dark:text-green-400' : 'text-orange-500'
                    }`}>
                      {countText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {phase === 'done' ? 'Complete' : 'Processing...'}
              </span>
              <span className="text-sm text-orange-500 font-semibold">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  phase === 'done'
                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                    : 'bg-gradient-to-r from-orange-400 to-orange-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* Verification summary */}
      {showSummary && phase === 'done' && (
        <div className="animate-fade-in">
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            {hasErrors ? <LargeWarningIcon /> : <LargeCheckIcon />}
            <h3 className="text-center text-lg font-bold text-gray-900 dark:text-white mb-1">
              {hasErrors
                ? `${totalImages - errors.length} of ${totalImages} images optimized`
                : `All ${totalImages} images optimized successfully!`}
            </h3>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-5">
              SEO metadata has been injected into your images
            </p>

            {/* Stat cards */}
            <div className={`grid gap-3 mb-6 ${hasErrors ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{renamedCount}</p>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 font-medium mt-1">Renamed</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{injectedCount}</p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 font-medium mt-1">Metadata Injected</p>
              </div>
              {hasErrors && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{errors.length}</p>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70 font-medium mt-1">Errors</p>
                </div>
              )}
            </div>

            {/* CTA button */}
            <button
              onClick={onComplete}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30 transition-all active:scale-[0.98]"
            >
              View Results & Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
