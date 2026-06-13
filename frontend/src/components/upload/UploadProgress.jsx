export default function UploadProgress({ progress }) {
  if (!progress || progress.phase === 'complete') return null;

  const { currentFile, fileIndex, totalFiles, fileProgress, overallProgress } = progress;

  return (
    <div className="mt-6 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2"
                  className="text-gray-200 dark:text-gray-700" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2"
                  className="text-orange-500"
                  strokeDasharray={`${overallProgress * 0.974} 100`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.3s ease' }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-orange-500">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Uploading images...
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                File {fileIndex + 1} of {totalFiles}
              </p>
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Overall progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Current file progress */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate" title={currentFile}>
              {currentFile}
            </p>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${fileProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
