import ThemeToggle from '../ui/ThemeToggle';

export default function Header({ dark, onToggleTheme, currentPage, onNavigate }) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <button
          onClick={() => onNavigate('app')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
            S
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            SEO Image Toolkit
          </h1>
        </button>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => onNavigate('howto')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              currentPage === 'howto'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
            }`}
          >
            How to Use
          </button>
          <ThemeToggle dark={dark} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
