'use client';

import { useState } from 'react';
import { User } from './types';
import ViewUserModal from '../components/ViewUserModal';

interface ApiTabProps {
  users: User[];
  selectedUsers: User[];
  loading: boolean;
  onFetchUsers: (size: number) => Promise<void>;
  onToggleSelection: (user: User) => void;
  onSaveUsers: () => Promise<void>;
}

export default function ApiTab({
  users,
  selectedUsers,
  loading,
  onFetchUsers,
  onToggleSelection,
  onSaveUsers,
}: ApiTabProps) {
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [customSize, setCustomSize] = useState<string>('50');

  const handleCustomFetch = () => {
    const size = parseInt(customSize, 10);
    if (size > 0 && size <= 100) {
      onFetchUsers(size);
    }
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Usuários da API Externa</h2>
          
          <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:flex-wrap sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <label htmlFor="user-count" className="text-sm font-medium text-gray-700 whitespace-nowrap hidden sm:block">
                Quantidade:
              </label>
              <input
                id="user-count"
                type="number"
                inputMode="numeric"
                min="1"
                max="100"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                disabled={loading}
                className="flex-1 sm:w-20 px-3 sm:px-3 py-3 sm:py-2 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-center text-base sm:text-sm"
                placeholder="50"
              />
              <button
                onClick={handleCustomFetch}
                disabled={loading || !customSize || parseInt(customSize, 10) < 1 || parseInt(customSize, 10) > 100}
                className="px-4 sm:px-4 py-3 sm:py-2 min-h-[44px] bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation active:scale-95 font-medium text-sm sm:text-base"
              >
                {loading ? '...' : 'Buscar'}
              </button>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  onFetchUsers(10);
                  setCustomSize('10');
                }}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-3 sm:py-2 min-h-[44px] bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation active:scale-95 font-medium text-sm sm:text-base"
              >
                {loading ? '...' : 'Buscar 10'}
              </button>
              <button
                onClick={() => {
                  onFetchUsers(20);
                  setCustomSize('20');
                }}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-3 sm:py-2 min-h-[44px] bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation active:scale-95 font-medium text-sm sm:text-base"
              >
                {loading ? '...' : 'Buscar 20'}
              </button>
            </div>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-blue-800 font-medium text-sm sm:text-base text-center sm:text-left">
              {selectedUsers.length} usuário(s) selecionado(s)
            </span>
            <button
              onClick={onSaveUsers}
              disabled={loading}
              className="px-4 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95 font-medium text-sm sm:text-base w-full sm:w-auto"
            >
              Salvar Selecionados
            </button>
          </div>
        )}

        {users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className={`border-2 rounded-xl p-4 sm:p-4 cursor-pointer transition-all touch-manipulation active:scale-[0.98] ${selectedUsers.some(u => u.id === user.id)
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 active:border-gray-300 active:shadow-md'
                  }`}
                onClick={() => onToggleSelection(user)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                    {user.first_name[0]}{user.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-sm font-medium text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{user.employment?.title || 'Sem título'}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setViewingUser(user)}
                    className="text-blue-600 hover:text-blue-700 active:text-blue-800 p-2.5 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Visualizar detalhes"
                    aria-label="Visualizar detalhes"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewingUser && (
        <ViewUserModal
          isOpen={!!viewingUser}
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}
    </>
  );
}
