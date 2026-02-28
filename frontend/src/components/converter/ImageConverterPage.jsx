import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { convertImages } from '../../api/endpoints';

const FORMAT_OPTIONS = [
  {
    value: 'jpg',
    label: 'JPG',
    description: 'Best for photos & web images',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: 'png',
    label: 'PNG',
    description: 'Supports transparency',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    value: 'jpeg',
    label: 'JPEG',
    description: 'Same as JPG, full extension',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const ACCEPT_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/bmp': ['.bmp'],
  'image/tiff': ['.tiff', '.tif'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/avif': ['.avif'],
  'image/x-icon': ['.ico'],
  'image/svg+xml': ['.svg'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
};

function getFormatBadge(filename) {
  const ext = filename.split('.').pop()?.toUpperCase() || '?';
  const colors = {
    JPG: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    JPEG: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    PNG: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    GIF: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
    WEBP: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    BMP: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    TIFF: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400',
    TIF: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400',
    SVG: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
    AVIF: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',
    ICO: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    HEIC: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    HEIF: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  };
  return { ext, colorClass: colors[ext] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
}

function FileCard({ file, preview, onRemove }) {
  const { ext, colorClass } = getFormatBadge(file.name);

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200">
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Format badge */}
      <div className="absolute top-2 left-2 z-10">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colorClass}`}>
          {ext}
        </span>
      </div>

      {/* Thumbnail */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
        {preview ? (
          <img
            src={preview}
            alt={file.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px]">Preview N/A</span>
          </div>
        )}
      </div>
      <div className="px-3 py-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate block" title={file.name}>
          {file.name}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">
          {(file.size / 1024).toFixed(0)} KB
        </span>
      </div>
    </div>
  );
}

export default function ImageConverterPage() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [targetFormat, setTargetFormat] = useState('jpg');
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      previews.forEach((url) => { if (url) URL.revokeObjectURL(url); });
    };
  }, [previews]);

  const onDrop = useCallback((acceptedFiles) => {
    const total = files.length + acceptedFiles.length;
    if (total > 50) {
      setError(`Maximum 50 images allowed. You tried to add ${acceptedFiles.length} to ${files.length} existing.`);
      return;
    }
    setError(null);

    const newPreviews = acceptedFiles.map((f) => {
      try {
        return URL.createObjectURL(f);
      } catch {
        return null;
      }
    });

    setFiles((prev) => [...prev, ...acceptedFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, [files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT_TYPES,
    maxFiles: 50,
    multiple: true,
  });

  const removeFile = (index) => {
    if (previews[index]) URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    previews.forEach((url) => { if (url) URL.revokeObjectURL(url); });
    setFiles([]);
    setPreviews([]);
    setError(null);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setConverting(true);
    setError(null);

    try {
      const blob = await convertImages(files, targetFormat);
      setDownloadBlob(blob);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Conversion failed. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!downloadBlob) return;
    const blobUrl = URL.createObjectURL(downloadBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `converted-${files.length}images-${targetFormat}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleReset = () => {
    previews.forEach((url) => { if (url) URL.revokeObjectURL(url); });
    setFiles([]);
    setPreviews([]);
    setTargetFormat('jpg');
    setConverting(false);
    setDone(false);
    setDownloadBlob(null);
    setError(null);
  };

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4">
      {/* Page Header */}
      <div className="text-center py-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Image Converter
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Convert Images Between Formats
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Upload any image format and convert to JPG, PNG, or JPEG instantly
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 animate-fade-in">

        {/* ── DONE STATE ── */}
        {done && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Conversion Complete!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {files.length} image{files.length !== 1 ? 's' : ''} converted to <span className="font-semibold text-orange-500">{targetFormat.toUpperCase()}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Converted Images (.zip)
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all"
              >
                Convert More
              </button>
            </div>
          </div>
        )}

        {/* ── CONVERTING STATE ── */}
        {converting && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-200 dark:border-orange-900/50 border-t-orange-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
              Converting {files.length} image{files.length !== 1 ? 's' : ''} to {targetFormat.toUpperCase()}...
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              This may take a moment for large files
            </p>
          </div>
        )}

        {/* ── UPLOAD + FORMAT SELECTION STATE ── */}
        {!converting && !done && (
          <>
            {/* Error banner */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-fade-in">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Drop zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/10'
                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/5'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  isDragActive
                    ? 'bg-orange-100 dark:bg-orange-900/30'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <svg className={`w-7 h-7 ${isDragActive ? 'text-orange-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                {isDragActive ? (
                  <p className="text-orange-500 font-semibold">Drop images here...</p>
                ) : (
                  <>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      Drag & drop images here, or <span className="text-orange-500 font-semibold">click to browse</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Supports JPG, PNG, BMP, TIFF, GIF, WEBP, AVIF, SVG, ICO, HEIC — up to 50 images, 20 MB each
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Uploaded files grid */}
            {files.length > 0 && (
              <div className="mt-6 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Uploaded Images
                    <span className="ml-2 text-xs font-normal text-gray-400">({files.length})</span>
                  </h3>
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {files.map((file, i) => (
                    <FileCard
                      key={`${file.name}-${i}`}
                      file={file}
                      preview={previews[i]}
                      onRemove={() => removeFile(i)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Format selection */}
            {files.length > 0 && (
              <div className="mt-8 animate-fade-in">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Convert To
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {FORMAT_OPTIONS.map((fmt) => (
                    <button
                      key={fmt.value}
                      onClick={() => setTargetFormat(fmt.value)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${
                        targetFormat === fmt.value
                          ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 shadow-md shadow-orange-500/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-800 bg-white dark:bg-gray-800'
                      }`}
                    >
                      {targetFormat === fmt.value && (
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className={`mb-2 ${targetFormat === fmt.value ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
                        {fmt.icon}
                      </div>
                      <p className={`font-bold text-lg ${targetFormat === fmt.value ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {fmt.label}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {fmt.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Convert button */}
            {files.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                <button
                  onClick={handleConvert}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Convert {files.length} Image{files.length !== 1 ? 's' : ''} to {targetFormat.toUpperCase()}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
