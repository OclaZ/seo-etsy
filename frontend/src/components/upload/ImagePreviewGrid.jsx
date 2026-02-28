import ImageThumbnail from './ImageThumbnail';

export default function ImagePreviewGrid({ files, onRemove }) {
  if (files.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Uploaded Images
        </h3>
        <span className="text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full font-medium">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {files.map((file, i) => (
          <ImageThumbnail key={`${file.name}-${i}`} file={file} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}
