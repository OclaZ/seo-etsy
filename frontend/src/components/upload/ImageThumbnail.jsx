export default function ImageThumbnail({ file, onRemove }) {
  const url = URL.createObjectURL(file);

  return (
    <div className="relative group animate-fade-in">
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={url}
          alt={file.name}
          className="w-full h-full object-cover"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      </div>
      <button
        onClick={() => onRemove(file)}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
      >
        ✕
      </button>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
        {file.name}
      </p>
    </div>
  );
}
