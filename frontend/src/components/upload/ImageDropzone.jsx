import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function ImageDropzone({ onDrop, disabled }) {
  const handleDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxFiles: 50,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-3xl">
          📁
        </div>
        {isDragActive ? (
          <p className="text-orange-500 font-semibold">Drop your images here...</p>
        ) : (
          <>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Drag & drop images here, or{' '}
              <span className="text-orange-500 font-semibold">browse</span>
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Supports JPG, JPEG, PNG (max 50 files, 50MB each)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
