export default function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
      aria-label="Toggle dark mode"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center text-sm ${
          dark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {dark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
