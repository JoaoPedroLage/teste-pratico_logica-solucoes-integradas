'use client';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
  loading?: boolean;
}

/**
 * Componente de barra de pesquisa
 * Permite buscar usuários por múltiplos campos
 */
export default function SearchBar({
  searchTerm,
  setSearchTerm,
  onSearch,
  loading = false,
}: SearchBarProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, sobrenome ou email..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={onSearch}
          disabled={loading || !searchTerm.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        A busca é realizada nos campos: Nome, Sobrenome e Email
      </p>
    </div>
  );
}
