import ThemeToggle from '../ui/ThemeToggle';

export default function Header({ dark, onToggleTheme }) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
            S
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            SEO Image Toolkit
          </h1>
        </div>
        <ThemeToggle dark={dark} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
