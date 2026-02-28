import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { checkMetadata } from '../../api/endpoints';

/* ─── Section config ─── */
const SECTIONS = [
  {
    key: 'xp_tags',
    title: 'Windows XP Tags (SEO)',
    description: 'Title, Subject, Keywords, Comments — fields Etsy reads for search ranking',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    key: 'exif_0th',
    title: 'Image Info (IFD0)',
    description: 'Camera make, orientation, resolution, software',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: 'exif_details',
    title: 'EXIF Details',
    description: 'Exposure, ISO, focal length, date taken',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: 'gps',
    title: 'GPS Location',
    description: 'Geolocation data embedded by the camera',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: 'exif_1st',
    title: 'Thumbnail IFD',
    description: 'Properties of the embedded EXIF thumbnail',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'png_text_chunks',
    title: 'PNG Text Chunks',
    description: 'Text metadata stored in tEXt / iTXt / zTXt chunks',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

/* ─── Collapsible metadata section ─── */
function MetadataSection({ title, description, icon, data, defaultOpen }) {
  const [expanded, setExpanded] = useState(defaultOpen ?? false);
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden animate-fade-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>
          </div>
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
            {entries.length}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:items-start px-4 py-3 gap-1 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-1/3 sm:flex-shrink-0 break-all">
                {key}
              </span>
              <span className="text-sm text-gray-900 dark:text-white break-all flex-1 font-mono">
                {String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Image info header with preview + stats ─── */
function ImageInfoHeader({ preview, fileName, basicInfo }) {
  const stats = [
    { label: 'Format', value: basicInfo.format },
    { label: 'Dimensions', value: `${basicInfo.width} x ${basicInfo.height}` },
    { label: 'File Size', value: basicInfo.file_size_human },
    { label: 'Color Mode', value: basicInfo.color_mode },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-6 mb-8 animate-fade-in">
      {/* Image preview */}
      <div className="sm:w-1/3 flex-shrink-0">
        <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <img
            src={preview}
            alt={fileName}
            className="w-full h-auto object-contain max-h-64"
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 truncate text-center font-medium">
          {fileName}
        </p>
      </div>

      {/* Stats grid */}
      <div className="flex-1 grid grid-cols-2 gap-3">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
          >
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">
              {label}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main page component ─── */
export default function MetadataCheckerPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const selectedFile = acceptedFiles[0];

    // Cleanup previous preview
    if (preview) URL.revokeObjectURL(preview);

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setMetadata(null);
    setError(null);
    setLoading(true);

    try {
      const data = await checkMetadata(selectedFile);
      setMetadata(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to read metadata');
    } finally {
      setLoading(false);
    }
  }, [preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxFiles: 1,
    multiple: false,
  });

  const handleReset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setMetadata(null);
    setError(null);
  };

  const totalTags = metadata
    ? Object.keys(metadata.xp_tags).length +
      Object.keys(metadata.exif_0th).length +
      Object.keys(metadata.exif_details).length +
      Object.keys(metadata.gps).length +
      Object.keys(metadata.exif_1st).length +
      Object.keys(metadata.png_text_chunks).length
    : 0;

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4">
      {/* Page Header */}
      <div className="text-center py-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Metadata Inspector
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Check Image Metadata
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Upload any image to inspect all its embedded metadata — EXIF, GPS, SEO tags, and more
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 animate-fade-in">
        {/* Upload State */}
        {!metadata && !loading && !error && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {isDragActive ? (
                <p className="text-orange-500 font-semibold text-lg">Drop your image here...</p>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">
                    Drag & drop an image here, or{' '}
                    <span className="text-orange-500 font-semibold">browse</span>
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Supports JPG, JPEG, PNG (max 10MB)
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
            <div className="w-12 h-12 border-4 border-orange-200 dark:border-orange-900/50 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Analyzing metadata...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
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
        {metadata && (
          <>
            {/* Image + Basic Info */}
            <ImageInfoHeader
              preview={preview}
              fileName={file.name}
              basicInfo={metadata.basic_info}
            />

            {/* Summary badge */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <span className="text-sm font-medium text-gray-400 dark:text-gray-500 px-3">
                {totalTags > 0
                  ? `${totalTags} metadata fields found`
                  : 'No metadata found'}
              </span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Metadata Sections */}
            {totalTags > 0 ? (
              <div className="space-y-3">
                {SECTIONS.map((section) => (
                  <MetadataSection
                    key={section.key}
                    title={section.title}
                    description={section.description}
                    icon={section.icon}
                    data={metadata[section.key]}
                    defaultOpen={section.key === 'xp_tags'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  This image has no embedded metadata.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Use the SEO Image Toolkit to inject keywords and metadata.
                </p>
              </div>
            )}

            {/* Thumbnail badge */}
            {metadata.has_thumbnail && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Embedded EXIF thumbnail present
              </div>
            )}

            {/* Reset button */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 active:scale-[0.98] transition-all duration-300"
              >
                Check Another Image
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
