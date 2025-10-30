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
import EditUserModal from '../components/EditUserModal';

// Tipo para usuários que vêm do nosso banco de dados (API /api/users)
// Eles têm a mesma estrutura do User, mas com um db_id
type SavedUser = User & { db_id: number };

export default function DashboardContent() {
  const { user: authUser, token, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]); // Usuários da API externa
  const [savedUsers, setSavedUsers] = useState<SavedUser[]>([]); // Usuários do nosso DB
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'api' | 'saved' | 'search'>('api');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]); // Seleção da API externa
  const [selectedSavedUsers, setSelectedSavedUsers] = useState<SavedUser[]>([]); // Seleção do nosso DB
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SavedUser[]>([]); // Resultados da busca no nosso DB
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId?: number; // Este será o db_id
    userIds?: number[]; // Este será um array de db_ids
    message?: string;
  }>({ isOpen: false });
  const [editingUser, setEditingUser] = useState<SavedUser | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getBackendApiUrl().then(url => {
      setApiBaseUrl(url);
    }).catch(() => {
      const port = process.env.NEXT_PUBLIC_BACKEND_PORT || '3001';
      setApiBaseUrl(`http://localhost:${port}/api/users`);
    });
  }, []);

  // Busca simples por quantidade (sem filtros)
  const fetchSimpleAmount = async (size?: number) => {
    const finalSize = Number(size) > 0 ? Number(size) : 20; // default se não especificado
    await fetchUsersFromApi(finalSize);
  };

  // Busca com filtros suportados pela Random User API (gender/nat)
  const fetchWithFilter = async (size?: number, gender?: string, nat?: string) => {
    const finalSize = Number(size) > 0 ? Number(size) : 20;
    await fetchUsersFromApi(finalSize, gender, nat);
  };

  // Função base usada pela ApiTab
  const fetchUsersFromApi = async (size?: number, gender?: string, nat?: string) => {
    setLoading(true);
    try {
      const url = await getBackendApiUrl();
      setApiBaseUrl(url);
      const params: string[] = [];
      const finalSize = Number(size) > 0 ? Number(size) : 20;
      params.push(`size=${finalSize}`);
      if (gender) params.push(`gender=${encodeURIComponent(gender)}`);
      if (nat) params.push(`nat=${encodeURIComponent(nat)}`);
      const query = params.length ? `?${params.join('&')}` : '';
      const apiUrl = `${url}/api${query}`;
      const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'x-owner-id': authUser?.id || '0'
        },
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
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'x-owner-id': authUser?.id || '0'
        },
      });
      if (response.data) {
        setSavedUsers(Array.isArray(response.data) ? response.data : response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários salvos:', error);
    }
  }, [token, authUser]);

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
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'x-owner-id': authUser?.id || '0'
        },
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
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'x-owner-id': authUser?.id || '0'
        },
      });

      if (response.data) {
        setSearchResults(Array.isArray(response.data) ? response.data : response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar:', error);
    }
  }, [token, authUser]);

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
      userIds: selectedSavedUsers.map(u => u.db_id),
      message: `Tem certeza que deseja excluir ${selectedSavedUsers.length} usuário(s) selecionado(s)?`,
    });
  };

  const toggleSavedUserSelection = (user: SavedUser) => {
    setSelectedSavedUsers(prev =>
      prev.some(u => u.db_id === user.db_id)
        ? prev.filter(u => u.db_id !== user.db_id)
        : [...prev, user]
    );
  };

  const toggleSelectAllSavedUsers = () => {
    if (selectedSavedUsers.length === savedUsers.length) {
      setSelectedSavedUsers([]);
    } else {
      setSelectedSavedUsers(savedUsers);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleting || loading) return;

    // Deletar múltiplos usuários
    if (confirmDialog.userIds && confirmDialog.userIds.length > 0) {
      setDeleting(true);
      // Fecha o diálogo imediatamente para evitar cliques duplicados
      setConfirmDialog({ isOpen: false });
      try {
        const url = await getBackendApiUrl();
        const deletePromises = confirmDialog.userIds.map(id =>
          axios.delete(`${url}/${id}`, {
            headers: { 
              Authorization: `Bearer ${token || ''}`,
              'x-owner-id': authUser?.id || '0'
            },
          })
        );
        const results = await Promise.allSettled(deletePromises);
        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.length - succeeded;
        if (succeeded > 0 && failed === 0) {
          showToast(`${succeeded} usuário(s) excluído(s) com sucesso!`, 'success');
        } else if (succeeded > 0 && failed > 0) {
          showToast(`${succeeded} excluído(s), ${failed} falhou(aram).`, 'warning');
        } else {
          showToast('Falha ao excluir usuários selecionados.', 'error');
        }
        setSelectedSavedUsers([]);
        await loadSavedUsers();
        if (activeTab === 'search') {
          await searchUsers(searchTerm);
        }
      } catch (error) {
        console.error('Erro ao excluir usuários:', error);
        showToast('Erro ao excluir usuários', 'error');
      } finally {
        setDeleting(false);
      }
      return;
    }

    // Deletar um único usuário (o ID é db_id)
    if (!confirmDialog.userId) return;

    setDeleting(true);
    setConfirmDialog({ isOpen: false });
    try {
      const url = await getBackendApiUrl();
      await axios.delete(`${url}/${confirmDialog.userId}`, {
        headers: { 
          Authorization: `Bearer ${token || ''}`,
          'x-owner-id': authUser?.id || '0'
        },
      });
      showToast('Usuário excluído com sucesso!', 'success');
      await loadSavedUsers();
      if (activeTab === 'search') {
        await searchUsers(searchTerm);
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      showToast('Erro ao excluir usuário', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (user: SavedUser) => {
    setEditingUser(user);
  };

  const handleSaveEdit = async (updatedUser: SavedUser) => {
    setSavingEdit(true);
    try {
      const url = await getBackendApiUrl();
      await axios.put(`${url}/${updatedUser.db_id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'x-owner-id': authUser?.id || '0'
        },
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
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'x-owner-id': authUser?.id || '0'
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `users_${authUser?.id || 'export'}.csv`;
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
                    if (selectedUsers.some(u => u.login.uuid === user.login.uuid)) {
                      setSelectedUsers(selectedUsers.filter(u => u.login.uuid !== user.login.uuid));
                    } else {
                      setSelectedUsers([...selectedUsers, user]);
                    }
                  }}
                  onSaveUsers={saveUsers}
                />
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

              {activeTab === 'search' && (
                <SearchTab
                  searchTerm={searchTerm}
                  searchResults={searchResults}
                  onSearchTermChange={setSearchTerm}
                  onEditClick={handleEditClick}
                  onDeleteClick={handleDeleteClick}
                />
              )}

              {activeTab === 'search' && editingUser && (
                <EditUserModal
                  isOpen={!!editingUser}
                  user={editingUser}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditingUser(null)}
                  loading={savingEdit}
                />
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