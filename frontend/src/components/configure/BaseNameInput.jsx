export default function BaseNameInput({ value, onChange }) {
  return (
    <div className="animate-fade-in">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Base Keyword for Filenames
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Buy-leather-bags"
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
      />
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        Images will be renamed: base-keyword.jpg, base-keyword-2.jpg, etc.
      </p>
    </div>
  );
}
