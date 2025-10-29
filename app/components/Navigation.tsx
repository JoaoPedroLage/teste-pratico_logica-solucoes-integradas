'use client';

interface NavigationProps {
  activeView: 'api' | 'saved' | 'search';
  setActiveView: (view: 'api' | 'saved' | 'search') => void;
}

/**
 * Componente de navegação principal
 * Permite alternar entre as diferentes views da aplicação
 */
export default function Navigation({ activeView, setActiveView }: NavigationProps) {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveView('api')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeView === 'api'
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            Consumir API
          </button>
          <button
            onClick={() => setActiveView('saved')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeView === 'saved'
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            Usuários Salvos
          </button>
          <button
            onClick={() => setActiveView('search')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeView === 'search'
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            Pesquisar
          </button>
        </div>
      </div>
    </nav>
  );
}
