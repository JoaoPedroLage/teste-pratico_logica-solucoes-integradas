'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { getBackendApiUrl } from '../utils/backendApi';
import ConfirmDialog from '../components/ConfirmDialog';
import ApiTab from './ApiTab';
import SavedUsersTab from './SavedUsersTab';
import SearchTab from './SearchTab';
import { User } from './types';


export default function DashboardContent() {
  const { user: authUser, token, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [savedUsers, setSavedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'saved' | 'search'>('api');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedSavedUsers, setSelectedSavedUsers] = useState<number[]>([]); // IDs dos usuários salvos selecionados
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId?: number;
    userIds?: number[];
    message?: string;
  }>({ isOpen: false });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    getBackendApiUrl().then(url => {
      setApiBaseUrl(url);
    }).catch(() => {
      const port = process.env.NEXT_PUBLIC_BACKEND_PORT || '3001';
      setApiBaseUrl(`http://localhost:${port}/api/users`);
    });
  }, []);

  const fetchUsersFromApi = async (size: number = 10) => {
    setLoading(true);
    try {
      const url = await getBackendApiUrl();
      setApiBaseUrl(url);
      const apiUrl = `${url}/api?size=${size}`;
      const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: { Authorization: `Bearer ${token || ''}` },
      });

      if (response.data.success && response.data.data) {
        setUsers(response.data.data);
        setSelectedUsers([]);
      }
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      showToast('Erro ao buscar usuários da API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedUsers = useCallback(async () => {
    try {
      const url = await getBackendApiUrl();
      const response = await axios.get(`${url}`, {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      if (response.data) {
        setSavedUsers(Array.isArray(response.data) ? response.data : response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários salvos:', error);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'saved') {
      loadSavedUsers();
    }
  }, [activeTab, loadSavedUsers]);

  const saveUsers = async () => {
    if (selectedUsers.length === 0) {
      showToast('Selecione pelo menos um usuário para salvar', 'warning');
      return;
    }

    setLoading(true);
    try {
      const url = await getBackendApiUrl();
      await axios.post(`${url}/save`, selectedUsers, {
        headers: { Authorization: `Bearer ${token || ''}` },
      });

      showToast(`${selectedUsers.length} usuário(s) salvo(s) com sucesso!`, 'success');
      setSelectedUsers([]);
      setUsers([]);
      loadSavedUsers();
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
      showToast('Erro ao salvar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const url = await getBackendApiUrl();
      const response = await axios.get(`${url}/search?term=${term}`, {
        headers: { Authorization: `Bearer ${token || ''}` },
      });

      if (response.data) {
        setSearchResults(Array.isArray(response.data) ? response.data : response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar:', error);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'search') {
      const timeoutId = setTimeout(() => {
        searchUsers(searchTerm);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, activeTab, searchUsers]);

  const handleDeleteClick = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      userId: id,
      message: 'Tem certeza que deseja excluir este usuário?',
    });
  };

  const handleDeleteMultipleClick = () => {
    if (selectedSavedUsers.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      userIds: selectedSavedUsers,
      message: `Tem certeza que deseja excluir ${selectedSavedUsers.length} usuário(s) selecionado(s)?`,
    });
  };

  const toggleSavedUserSelection = (userId: number) => {
    setSelectedSavedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAllSavedUsers = () => {
    if (selectedSavedUsers.length === savedUsers.length) {
      setSelectedSavedUsers([]);
    } else {
      setSelectedSavedUsers(savedUsers.map(u => u.id));
    }
  };

  const handleDeleteConfirm = async () => {
    // Deletar múltiplos usuários
    if (confirmDialog.userIds && confirmDialog.userIds.length > 0) {
      setLoading(true);
      try {
        const url = await getBackendApiUrl();
        const deletePromises = confirmDialog.userIds.map(id =>
          axios.delete(`${url}/${id}`, {
            headers: { Authorization: `Bearer ${token || ''}` },
          })
        );
        await Promise.all(deletePromises);
        showToast(`${confirmDialog.userIds.length} usuário(s) excluído(s) com sucesso!`, 'success');
        setConfirmDialog({ isOpen: false });
        setSelectedSavedUsers([]);
        loadSavedUsers();
        if (activeTab === 'search') {
          searchUsers(searchTerm);
        }
      } catch (error) {
        console.error('Erro ao excluir usuários:', error);
        showToast('Erro ao excluir usuários', 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Deletar um único usuário
    if (!confirmDialog.userId) return;

    try {
      const url = await getBackendApiUrl();
      await axios.delete(`${url}/${confirmDialog.userId}`, {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      showToast('Usuário excluído com sucesso!', 'success');
      setConfirmDialog({ isOpen: false });
      loadSavedUsers();
      if (activeTab === 'search') {
        searchUsers(searchTerm);
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      showToast('Erro ao excluir usuário', 'error');
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
  };

  const handleSaveEdit = async (updatedUser: User) => {
    setSavingEdit(true);
    try {
      const url = await getBackendApiUrl();
      await axios.put(`${url}/${updatedUser.id}`, updatedUser, {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      showToast('Usuário atualizado com sucesso!', 'success');
      setEditingUser(null);
      loadSavedUsers();
      if (activeTab === 'search') {
        searchUsers(searchTerm);
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      showToast('Erro ao atualizar usuário', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const url = await getBackendApiUrl();
      const response = await axios.get(`${url}/download/csv`, {
        headers: { Authorization: `Bearer ${token || ''}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'users.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      showToast('CSV baixado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao baixar CSV:', error);
      showToast('Erro ao baixar CSV', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 accounts0z" />
                    </svg>
                  </div>
                  <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                    <span className="hidden sm:inline">Gerenciador de Usuários</span>
                    <span className="sm:hidden">Usuários</span>
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium truncate max-w-[120px]">{authUser?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 sm:px-4 py-2 min-h-[44px] text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                  aria-label="Sair"
                >
                  <span className="hidden sm:inline">Sair</span>
                  <svg className="sm:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex space-x-1 p-1 min-w-max sm:min-w-0" aria-label="Tabs">
                {[
                  { id: 'api', label: 'API Externa', icon: '🌐', mobileLabel: 'API' },
                  { id: 'saved', label: 'Usuários Salvos', icon: '💾', mobileLabel: 'Salvos' },
                  { id: 'search', label: 'Pesquisar', icon: '🔍', mobileLabel: 'Buscar' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 sm:flex-auto min-w-[100px] sm:min-w-0 px-3 sm:px-4 py-3 min-h-[48px] text-sm font-medium rounded-lg transition-all touch-manipulation whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200'
                      }`}
                  >
                    <span className="mr-1.5 sm:mr-2">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.mobileLabel}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === 'api' && (
                <ApiTab
                  users={users}
                  selectedUsers={selectedUsers}
                  loading={loading}
                  onFetchUsers={fetchUsersFromApi}
                  onToggleSelection={(user) => {
                    if (selectedUsers.some(u => u.id === user.id)) {
                      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
                    } else {
                      setSelectedUsers([...selectedUsers, user]);
                    }
                  }}
                  onSaveUsers={saveUsers}
                />
              )}

              {activeTab === 'api' && false && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Usuários da API Externa</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchUsersFromApi(10)}
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                      >
                        {loading ? 'Carregando...' : 'Buscar 10 Usuários'}
                      </button>
                      <button
                        onClick={() => fetchUsersFromApi(20)}
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                      >
                        {loading ? 'Carregando...' : 'Buscar 20 Usuários'}
                      </button>
                    </div>
                  </div>

                  {selectedUsers.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                      <span className="text-blue-800 font-medium">
                        {selectedUsers.length} usuário(s) selecionado(s)
                      </span>
                      <button
                        onClick={saveUsers}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Salvar Selecionados
                      </button>
                    </div>
                  )}

                  {users.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedUsers.some(u => u.id === user.id)
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                          onClick={() => {
                            if (selectedUsers.some(u => u.id === user.id)) {
                              setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
                            } else {
                              setSelectedUsers([...selectedUsers, user]);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {user.first_name[0]}{user.last_name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              <p className="text-xs text-gray-400 mt-1">{user.employment?.title || 'Sem título'}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implementar visualização
                              }}
                              className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Visualizar detalhes"
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
              )}

              {activeTab === 'saved' && (
                <SavedUsersTab
                  savedUsers={savedUsers}
                  selectedSavedUsers={selectedSavedUsers}
                  loading={loading}
                  savingEdit={savingEdit}
                  onToggleSelection={toggleSavedUserSelection}
                  onSelectAll={toggleSelectAllSavedUsers}
                  onDeleteMultiple={handleDeleteMultipleClick}
                  onDeleteClick={handleDeleteClick}
                  onEditClick={handleEditClick}
                  onSaveEdit={handleSaveEdit}
                  onDownloadCsv={handleDownloadCsv}
                  editingUser={editingUser}
                  onCloseEdit={() => setEditingUser(null)}
                />
              )}

              {activeTab === 'saved' && false && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Usuários Salvos</h2>
                      {savedUsers.length > 0 && (
                        <div className="flex items-center space-x-3">
                          {/* Botão 1: Baixar CSV (Posição fixa) */}
                          <button
                            onClick={handleDownloadCsv}
                            disabled={loading}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Baixar CSV</span>
                          </button>

                          {/* Botão 2: Selecionar Todos (Posição fixa) */}
                          <button
                            onClick={toggleSelectAllSavedUsers}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          >
                            {selectedSavedUsers.length === savedUsers.length ? 'Desselecionar Todos' : 'Selecionar Todos'}
                          </button>

                          {/* Botão 3: Excluir (Aparece no final, condicionalmente) */}
                          {selectedSavedUsers.length > 0 && (
                            <button
                              onClick={handleDeleteMultipleClick}
                              disabled={loading}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Excluir Selecionados ({selectedSavedUsers.length})</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {savedUsers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-. coche293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="mt-4">Nenhum usuário salvo ainda</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedUsers.map((user) => {
                        const isSelected = selectedSavedUsers.includes(user.id);
                        return (
                          <div
                            key={user.id}
                            className={`border rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer ${isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200'
                              }`}
                            onClick={() => toggleSavedUserSelection(user.id)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3 flex-1">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSavedUserSelection(user.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
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
                                    handleEditClick(user);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Editar usuário"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(user.id);
                                  }}
                                  className="text-red-600 hover:text-red-700 p-2 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Excluir usuário"
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
              )}

              {activeTab === 'search' && (
                <SearchTab
                  searchTerm={searchTerm}
                  searchResults={searchResults}
                  onSearchTermChange={setSearchTerm}
                  onEditClick={handleEditClick}
                  onDeleteClick={handleDeleteClick}
                />
              )}

              {activeTab === 'search' && false && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Pesquisar Usuários</h2>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Digite nome, sobrenome ou email..."
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.map((user) => (
                        <div key={user.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
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
                                onClick={() => handleEditClick(user)}
                                className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar usuário"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(user.id)}
                                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir usuário"
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
              )}
            </div>
          </div>
        </main>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirmar Exclusão"
        message={confirmDialog.message || 'Tem certeza que deseja excluir este usuário?'}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false })}
      />

    </>
  );
}
