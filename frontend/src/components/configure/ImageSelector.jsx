import { useMemo } from 'react';

function ImageCheckbox({ file, index, selected, onToggle }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  return (
    <button
      type="button"
      onClick={() => onToggle(index)}
      className={`
        relative group rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer
        ${selected
          ? 'border-orange-500 shadow-md shadow-orange-500/20 ring-2 ring-orange-500/30'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 opacity-50'
        }
      `}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-800">
        <img
          src={url}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Checkbox overlay */}
      <div className="absolute top-1.5 right-1.5">
        <div
          className={`
            w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200
            ${selected
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-white/80 dark:bg-gray-900/80 border border-gray-300 dark:border-gray-600'
            }
          `}
        >
          {selected && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Selection overlay for deselected */}
      {!selected && (
        <div className="absolute inset-0 bg-gray-900/20 dark:bg-gray-900/40" />
      )}

      {/* Filename */}
      <div className="px-2 py-1.5 bg-white dark:bg-gray-900">
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate font-medium">
          {file.name}
        </p>
      </div>
    </button>
  );
}

export default function ImageSelector({ images, selectedImages, onToggle, onSelectAll, onDeselectAll }) {
  if (images.length === 0) return null;

  const allSelected = selectedImages.length === images.length;
  const noneSelected = selectedImages.length === 0;
  const selectedCount = selectedImages.length;

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
            Select Images to Optimize
          </h3>
        </div>
        <span className="text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full">
          {selectedCount} / {images.length} selected
        </span>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={onSelectAll}
          disabled={allSelected}
          className="px-3 py-1 text-xs font-medium rounded-md
            bg-orange-100 text-orange-700 hover:bg-orange-200
            dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50
            disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={onDeselectAll}
          disabled={noneSelected}
          className="px-3 py-1 text-xs font-medium rounded-md
            bg-gray-100 text-gray-600 hover:bg-gray-200
            dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700
            disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Deselect All
        </button>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((file, i) => (
          <ImageCheckbox
            key={`${file.name}-${i}`}
            file={file}
            index={i}
            selected={selectedImages.includes(i)}
            onToggle={onToggle}
          />
        ))}
      </div>

      {noneSelected && (
        <p className="text-xs text-red-500 mt-2">
          Select at least one image to inject metadata
        </p>
      )}
    </div>
  );
}
