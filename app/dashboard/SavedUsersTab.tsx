'use client';

import { User } from './types';
import EditUserModal from '../components/EditUserModal';

interface SavedUsersTabProps {
  savedUsers: User[];
  selectedSavedUsers: number[];
  loading: boolean;
  savingEdit: boolean;
  onToggleSelection: (userId: number) => void;
  onSelectAll: () => void;
  onDeleteMultiple: () => void;
  onDeleteClick: (id: number) => void;
  onEditClick: (user: User) => void;
  onSaveEdit: (user: User) => Promise<void>;
  onDownloadCsv: () => Promise<void>;
  editingUser: User | null;
  onCloseEdit: () => void;
}

export default function SavedUsersTab({
  savedUsers,
  selectedSavedUsers,
  loading,
  savingEdit,
  onToggleSelection,
  onSelectAll,
  onDeleteMultiple,
  onDeleteClick,
  onEditClick,
  onSaveEdit,
  onDownloadCsv,
  editingUser,
  onCloseEdit,
}: SavedUsersTabProps) {
  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Usuários Salvos</h2>
            {savedUsers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={onDownloadCsv}
                  disabled={loading}
                  className="px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 touch-manipulation active:scale-95 text-sm sm:text-base"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Baixar CSV</span>
                  <span className="sm:hidden">CSV</span>
                </button>


                <button
                  onClick={onSelectAll}
                  className="px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors touch-manipulation active:scale-95"
                >
                  <span className="hidden sm:inline">{selectedSavedUsers.length === savedUsers.length ? 'Desselecionar Todos' : 'Selecionar Todos'}</span>
                  <span className="sm:hidden">{selectedSavedUsers.length === savedUsers.length ? 'Desmarcar' : 'Marcar Todos'}</span>
                </button>

                {selectedSavedUsers.length > 0 && (
                  <button
                    onClick={onDeleteMultiple}
                    disabled={loading}
                    className="px-3 sm:px-4 py-2.5 sm:py-2 min-h-[44px] bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 touch-manipulation active:scale-95 text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="hidden sm:inline">Excluir Selecionados ({selectedSavedUsers.length})</span>
                    <span className="sm:hidden">Excluir ({selectedSavedUsers.length})</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {savedUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-4">Nenhum usuário salvo ainda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {savedUsers.map((user) => {
              const isSelected = selectedSavedUsers.includes(user.id);
              return (
                <div
                  key={user.id}
                  className={`border rounded-xl p-4 sm:p-4 active:shadow-lg transition-all cursor-pointer touch-manipulation active:scale-[0.98] ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200'
                    }`}
                  onClick={() => onToggleSelection(user.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelection(user.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 sm:w-5 sm:h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer touch-manipulation min-w-[20px] min-h-[20px]"
                        style={{ display: isSelected ? 'block' : 'none' }}
                      />
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {user.first_name[0]}{user.last_name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick(user);
                        }}
                        className="text-blue-600 hover:text-blue-700 active:text-blue-800 p-2.5 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Editar usuário"
                        aria-label="Editar usuário"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(user.id);
                        }}
                        className="text-red-600 hover:text-red-700 active:text-red-800 p-2.5 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
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
              );
            })}
          </div>
        )}
      </div>

      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          user={editingUser}
          onSave={onSaveEdit}
          onCancel={onCloseEdit}
          loading={savingEdit}
        />
      )}
    </>
  );
}

