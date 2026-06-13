import { useState } from 'react';
import { getDownloadUrl } from '../../api/endpoints';

export default function DownloadButton({ sessionId, onReset }) {
  const [downloadState, setDownloadState] = useState('idle'); // idle | preparing | downloading | done

  const handleDownload = async () => {
    setDownloadState('preparing');
    try {
      const url = await getDownloadUrl(sessionId);
      setDownloadState('downloading');

      const link = document.createElement('a');
      link.href = url;
      link.download = 'seo-optimized-images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Brief "done" state before resetting
      setTimeout(() => setDownloadState('done'), 500);
      setTimeout(() => setDownloadState('idle'), 2500);
    } catch (e) {
      console.error("Failed to get download URL:", e);
      setDownloadState('idle');
      alert("Failed to prepare download. Please try again.");
    }
  };

  const isActive = downloadState !== 'idle' && downloadState !== 'done';

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6">
      <button
        onClick={handleDownload}
        disabled={isActive}
        className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed relative overflow-hidden ${
          downloadState === 'done'
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
            : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30 disabled:opacity-80'
        }`}
      >
        <span className="flex items-center justify-center gap-2">
          {downloadState === 'idle' && (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Optimized Images (.zip)
            </>
          )}
          {downloadState === 'preparing' && (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Preparing your ZIP...
            </>
          )}
          {downloadState === 'downloading' && (
            <>
              <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Downloading...
            </>
          )}
          {downloadState === 'done' && (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Download Complete!
            </>
          )}
        </span>

        {/* Animated shimmer when preparing */}
        {downloadState === 'preparing' && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        )}
      </button>
      <button
        onClick={onReset}
        className="py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        Start Over
      </button>
    </div>
  );
}
