import { useState, useEffect } from 'react';
import { scrapeImages, downloadScrapedImages } from '../../api/endpoints';

function ImageCard({ image, selected, onToggle }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-xl border overflow-hidden transition-all duration-200 ${
        selected
          ? 'border-orange-400 dark:border-orange-500 ring-2 ring-orange-400/30 shadow-md'
          : 'border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm cursor-pointer"
        style={{
          borderColor: selected ? '#f97316' : '#d1d5db',
          backgroundColor: selected ? '#f97316' : undefined,
        }}
      >
        {selected && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Open in new tab */}
      <a
        href={image.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-3.5 h-3.5 text-gray-500 hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      {/* Image */}
      <div
        className="aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={onToggle}
      >
        {failed ? (
          <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-600 p-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Failed to load</span>
          </div>
        ) : (
          <img
            src={image.url}
            alt={image.filename}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <div className="px-3 py-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate block" title={image.filename}>
          {image.filename}
        </span>
      </div>
    </div>
  );
}

export default function ImageScraperPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleScrape = async (e) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setResults(null);
    setError(null);
    setSelected(new Set());

    try {
      const data = await scrapeImages(trimmed);
      setResults(data);
      // Select all by default
      setSelected(new Set(data.images.map((_, i) => i)));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to scrape website');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setResults(null);
    setError(null);
    setSelected(new Set());
  };

  const toggleSelect = (index) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectAll = () => {
    if (results) setSelected(new Set(results.images.map((_, i) => i)));
  };

  const deselectAll = () => {
    setSelected(new Set());
  };

  const handleDownload = async () => {
    if (!results || selected.size === 0) return;

    const selectedImages = results.images.filter((_, i) => selected.has(i));
    setDownloading(true);

    try {
      const blob = await downloadScrapedImages(selectedImages);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `scraped-${selectedImages.length}images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.response?.data?.detail || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4">
      {/* Page Header */}
      <div className="text-center py-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          Image Scraper
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Extract Images from Any Website
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Enter a website URL to automatically find and extract all images from the page
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 animate-fade-in">

        {/* URL Input Form */}
        {!results && !loading && !error && (
          <form onSubmit={handleScrape} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Website URL
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!url.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none whitespace-nowrap"
                >
                  Scrape Images
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Enter any public website URL to extract all images (JPG, PNG, GIF, WebP, SVG...)
              </p>
            </div>
          </form>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
            <div className="w-12 h-12 border-4 border-orange-200 dark:border-orange-900/50 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Scanning website for images...
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 truncate max-w-md">
              {url}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !results && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results State */}
        {results && (
          <div className="animate-fade-in">
            {/* Stats bar + selection controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-bold rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {results.image_count} found
                </span>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {selected.size} selected
                </span>
              </div>
              {results.image_count > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              )}
            </div>

            {/* Source URL */}
            <a
              href={results.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-gray-400 dark:text-gray-500 hover:text-orange-500 truncate max-w-full mb-4 transition-colors"
              title={results.url}
            >
              {results.url}
            </a>

            {/* Download error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Image grid */}
            {results.image_count > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {results.images.map((image, i) => (
                  <ImageCard
                    key={`${image.url}-${i}`}
                    image={image}
                    selected={selected.has(i)}
                    onToggle={() => toggleSelect(i)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No images found on this page.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Try a different URL or a page with more visual content.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              {results.image_count > 0 && (
                <button
                  onClick={handleDownload}
                  disabled={selected.size === 0 || downloading}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {downloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download {selected.size} Images (.zip)
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleReset}
                className="py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Scrape Another
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
