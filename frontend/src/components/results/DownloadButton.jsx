import { useState } from 'react';
import { getDownloadUrl } from '../../api/endpoints';

export default function DownloadButton({ sessionId, onReset }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const url = await getDownloadUrl(sessionId);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'seo-optimized-images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Failed to get download URL:", e);
      alert("Failed to prepare download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isDownloading ? 'Preparing Download...' : 'Download Optimized Images (.zip)'}
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
