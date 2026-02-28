import ThemeToggle from '../ui/ThemeToggle';

export default function Header({ dark, onToggleTheme, currentPage, onNavigate }) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-0">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <button
          onClick={() => onNavigate('app')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/imgs/Logotipo_Carrito_de_Compras_de_Supermercado_Minimalista_Naranja_y_Rojo-removebg-preview.png"
            alt="SEO Injecter Logo"
            className="h-20 w-auto -my-4"
          />
        </button>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => onNavigate('scraper')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              currentPage === 'scraper'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
            }`}
          >
            Image Scraper
          </button>
          <button
            onClick={() => onNavigate('converter')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              currentPage === 'converter'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
            }`}
          >
            Converter
          </button>
          <button
            onClick={() => onNavigate('metadata')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              currentPage === 'metadata'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
            }`}
          >
            Check Metadata
          </button>
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
