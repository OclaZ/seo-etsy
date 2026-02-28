import { useState } from 'react';

export default function KeywordUploader({
  keywords,
  onFileUpload,
  onTextSubmit,
  disabled,
}) {
  const [mode, setMode] = useState('file');
  const [text, setText] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  const handleTextSubmit = () => {
    if (text.trim()) onTextSubmit(text);
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        SEO Keywords
      </h3>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMode('file')}
          className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${
            mode === 'file'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode('text')}
          className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${
            mode === 'text'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Type Keywords
        </button>
      </div>

      {mode === 'file' ? (
        <div className="flex items-center gap-3">
          <label
            className={`flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-orange-400 transition-colors ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled}
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Choose a .txt file (one keyword per line)
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter keywords, one per line..."
            rows={5}
            disabled={disabled}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none disabled:opacity-50"
          />
          <button
            onClick={handleTextSubmit}
            disabled={disabled || !text.trim()}
            className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Keywords
          </button>
        </div>
      )}

      {keywords.length > 0 && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">
            ✓ {keywords.length} keywords loaded
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {keywords.slice(0, 10).map((kw, i) => (
              <span
                key={i}
                className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full"
              >
                {kw}
              </span>
            ))}
            {keywords.length > 10 && (
              <span className="text-xs text-green-500">
                +{keywords.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
