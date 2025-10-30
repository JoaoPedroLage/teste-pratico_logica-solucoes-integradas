'use client';

import { User } from './types';

interface SearchTabProps {
  searchTerm: string;
  searchResults: User[];
  onSearchTermChange: (term: string) => void;
  onEditClick: (user: User) => void;
  onDeleteClick: (id: number) => void;
}

export default function SearchTab({
  searchTerm,
  searchResults,
  onSearchTermChange,
  onEditClick,
  onDeleteClick,
}: SearchTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Pesquisar Usuários</h2>
      <div className="relative">
        <input
          type="text"
          inputMode="search"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Digite nome, sobrenome ou email..."
          className="w-full px-4 py-3 sm:py-3 pl-10 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
        />
        <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {searchResults.map((user) => (
            <div key={user.id} className="border border-gray-200 rounded-xl p-4 sm:p-4 active:shadow-lg transition-shadow touch-manipulation active:scale-[0.98]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.first_name[0]}{user.last_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onEditClick(user)}
                    className="text-blue-600 hover:text-blue-700 active:text-blue-800 p-2.5 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Editar usuário"
                    aria-label="Editar usuário"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteClick(user.id)}
                    className="text-red-600 hover:text-red-700 active:text-red-800 p-2.5 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Excluir usuário"
                    aria-label="Excluir usuário"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <p><span className="font-medium">Cidade:</span> {user.address?.city || 'N/A'}</p>
                <p><span className="font-medium">Cargo:</span> {user.employment?.title || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchTerm && searchResults.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Nenhum resultado encontrado</p>
        </div>
      )}
    </div>
  );
}

