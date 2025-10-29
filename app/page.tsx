'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import SearchBar from './components/SearchBar';
import Navigation from './components/Navigation';
import { getBackendApiUrl, clearBackendPortCache } from './utils/backendApi';

interface User {
  id: number;
  uid: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  avatar: string;
  gender: string;
  phone_number: string;
  social_insurance_number: string;
  date_of_birth: string;
  employment: {
    title: string;
    key_skill: string;
  };
  address: {
    city: string;
    street_name: string;
    street_address: string;
    zip_code: string;
    state: string;
    country: string;
    lng: number;
    lat: number;
  };
  credit_card: {
    cc_number: string;
  };
  subscription: {
    plan: string;
    status: string;
    payment_method: string;
    term: string;
  };
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [savedUsers, setSavedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'api' | 'saved' | 'search'>('api');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Detecta a porta do backend na inicialização
  useEffect(() => {
    getBackendApiUrl().then(url => {
      setApiBaseUrl(url);
      setError(null); // Limpa erros anteriores se conectou
    }).catch((err: Error) => {
      // Mostra erro se não conseguir conectar na inicialização
      const envPort = process.env.NEXT_PUBLIC_BACKEND_PORT || '3001';
      setApiBaseUrl(`http://localhost:${envPort}/api/users`);
      
      // Só mostra erro se for problema de conexão (não se for apenas timeout de verificação)
      if (err.message.includes('Não foi possível conectar')) {
        setError(err.message);
      }
    });
  }, []);

  // Busca usuários da API
  const fetchUsersFromApi = async (size: number = 10) => {
    setLoading(true);
    setError(null);
    setUsers([]);
    
    try {
      // Limpa cache se foi uma tentativa após erro
      if (retryCount > 0 || error) {
        clearBackendPortCache();
      }
      
      const url = await getBackendApiUrl();
      setApiBaseUrl(url); // Atualiza URL base
      setRetryCount(0); // Reset contador de retry ao ter sucesso
      const apiUrl = `${url}/api?size=${size}`;
      console.log('Buscando usuários na URL:', apiUrl);
      const response = await axios.get(apiUrl, {
        timeout: 30000, // 30 segundos de timeout
      });
      console.log('Resposta recebida, status:', response.status);
      
      if (response.data.success && response.data.data) {
        console.log(`✅ Usuários recebidos: ${response.data.data.length}`);
        setUsers(response.data.data);
        setSelectedUsers([]); // Limpa seleção anterior
      } else {
        console.error('❌ Resposta inválida:', response.data);
        const errorMsg = response.data.message || 'Resposta inválida da API';
        setError(errorMsg);
        setUsers([]);
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar usuários:', error);
      console.error('Detalhes:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMsg = 'Erro desconhecido ao buscar usuários';
      
      // Verifica o status HTTP primeiro
      if (error.response) {
        const status = error.response.status;
        
        if (status === 404) {
          errorMsg = `Rota não encontrada (404). URL tentada: ${error.config?.url || 'desconhecida'}. ` +
                     `Verifique se o backend está configurado corretamente.`;
        } else if (status === 503) {
          // Service Unavailable - serviço externo indisponível (DNS, conexão, timeout)
          if (error.response.data?.error) {
            const backendError = error.response.data.error;
            if (backendError.includes('DNS') || backendError.includes('resolver')) {
              errorMsg = `⚠️ Erro de DNS: ${backendError}`;
            } else if (backendError.includes('conectar') || backendError.includes('timeout')) {
              errorMsg = `⚠️ Serviço externo indisponível: ${backendError}`;
            } else {
              errorMsg = `Serviço temporariamente indisponível: ${backendError}`;
            }
          } else {
            errorMsg = 'O serviço externo está temporariamente indisponível. Tente novamente em alguns instantes.';
          }
        } else if (status === 500) {
          // Se for erro 500, tenta pegar a mensagem do backend
          if (error.response.data?.error) {
            // Se o erro menciona API externa, destaca isso
            const backendError = error.response.data.error;
            if (backendError.includes('API externa') || backendError.includes('conectar')) {
              errorMsg = `⚠️ ${backendError}. Verifique sua conexão com a internet.`;
            } else {
              errorMsg = `Erro no servidor: ${backendError}`;
            }
          } else if (error.response.data?.message) {
            errorMsg = `Erro no servidor: ${error.response.data.message}`;
          } else {
            errorMsg = 'Erro interno do servidor (500). Verifique os logs do backend.';
          }
        } else if (error.response.data?.error) {
          errorMsg = error.response.data.error;
        } else if (error.response.data?.message) {
          errorMsg = error.response.data.message;
        } else {
          errorMsg = `Erro HTTP ${status}: ${error.message || 'Erro desconhecido'}`;
        }
      } else if (error.code === 'ECONNREFUSED') {
        errorMsg = 'Não foi possível conectar ao backend. Certifique-se de que o servidor está rodando.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      // Mensagens mais amigáveis
      if (errorMsg.includes('Não foi possível conectar ao backend')) {
        // Mantém a mensagem detalhada se já vier de getBackendApiUrl
      } else if (errorMsg.includes('resolver o endereço') || errorMsg.includes('DNS')) {
        // Erro de DNS - problema de resolução de nome
        errorMsg = '⚠️ Erro de DNS: Não foi possível resolver o endereço da API externa. ' +
                   'Verifique sua conexão com a internet e tente novamente em alguns instantes.';
      } else if (errorMsg.includes('conectar') || errorMsg.includes('network')) {
        errorMsg = 'Não foi possível conectar ao backend. ' +
                   'Certifique-se de que o servidor está rodando executando: cd backend && npm run dev';
      } else if (errorMsg.includes('timeout')) {
        errorMsg = 'Tempo limite esgotado. A API externa pode estar lenta ou indisponível.';
      } else if (errorMsg.includes('API externa')) {
        errorMsg = 'Não foi possível conectar à API externa. Verifique sua conexão com a internet.';
      }
      
      setError(errorMsg);
      setUsers([]);
      setRetryCount(prev => prev + 1); // Incrementa contador de retry
    } finally {
      setLoading(false);
    }
  };

  // Função para tentar reconectar ao backend
  const retryConnection = () => {
    clearBackendPortCache();
    setError(null);
    setRetryCount(0);
    // Revalida conexão imediatamente
    getBackendApiUrl().then(url => {
      setApiBaseUrl(url);
      setError(null);
    }).catch((err: Error) => {
      if (err.message.includes('Não foi possível conectar')) {
        setError(err.message);
      }
    });
  };

  // Carrega usuários salvos do CSV
  const loadSavedUsers = useCallback(async () => {
    setLoading(true);
    try {
      const url = await getBackendApiUrl();
      // URL já é /api/users, não precisa adicionar nada
      const response = await axios.get(url);
      setSavedUsers(response.data.data);
    } catch (error: any) {
      console.error('Erro ao carregar usuários salvos:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Erro desconhecido';
      alert(`Erro ao carregar usuários salvos: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salva usuários no CSV
  const saveUsers = async () => {
    if (selectedUsers.length === 0) {
      alert('Selecione pelo menos um usuário para salvar');
      return;
    }

    if (!apiBaseUrl) return;

    setLoading(true);
    try {
      const url = await getBackendApiUrl();
      // URL já é /api/users, adicionar apenas /save
      await axios.post(`${url}/save`, { users: selectedUsers });
      alert(`${selectedUsers.length} usuário(s) salvo(s) com sucesso!`);
      setSelectedUsers([]);
      await loadSavedUsers();
    } catch (error: any) {
      console.error('Erro ao salvar usuários:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Erro desconhecido';
      alert(`Erro ao salvar usuários: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Remove usuário
  const deleteUser = async (id: number) => {
    if (!confirm('Deseja realmente excluir este usuário?')) {
      return;
    }

    if (!apiBaseUrl) return;

    setLoading(true);
    try {
      const url = await getBackendApiUrl();
      // URL já é /api/users, adicionar apenas /:id
      await axios.delete(`${url}/${id}`);
      alert('Usuário excluído com sucesso!');
      await loadSavedUsers();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Erro desconhecido';
      alert(`Erro ao excluir usuário: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Atualiza usuário
  const updateUser = async (user: User) => {
    if (!apiBaseUrl) return;

    setLoading(true);
    try {
      const url = await getBackendApiUrl();
      // URL já é /api/users, adicionar apenas /:id
      await axios.put(`${url}/${user.id}`, user);
      alert('Usuário atualizado com sucesso!');
      setEditingUser(null);
      await loadSavedUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Erro desconhecido';
      alert(`Erro ao atualizar usuário: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Busca usuários
  const searchUsers = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const url = await getBackendApiUrl();
      // URL já é /api/users, adicionar apenas /search
      const response = await axios.get(`${url}/search?q=${encodeURIComponent(searchTerm)}&fields=first_name,last_name,email`);
      setSearchResults(response.data.data);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Erro desconhecido';
      alert(`Erro ao buscar usuários: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (activeView === 'saved') {
      loadSavedUsers();
    }
  }, [activeView, loadSavedUsers]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeView === 'search' && searchTerm.trim()) {
        searchUsers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeView, searchUsers]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeView={activeView} setActiveView={setActiveView} />
      
      <main className="container mx-auto px-4 py-8">
        {activeView === 'api' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800">Usuários da API</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchUsersFromApi(10)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Carregando...' : 'Buscar 10 Usuários'}
                </button>
                <button
                  onClick={() => fetchUsersFromApi(20)}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Carregando...' : 'Buscar 20 Usuários'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-red-800 font-medium mb-2">⚠️ Erro ao conectar ao backend</p>
                    <p className="text-red-600 text-sm mb-3">{error}</p>
                    {error.includes('Não foi possível conectar ao backend') && (
                      <div className="mt-3 p-3 bg-white border border-red-200 rounded">
                        <p className="text-sm text-gray-700 font-medium mb-2">Para iniciar o backend:</p>
                        <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1 mb-3">
                          <li>Abra um novo terminal</li>
                          <li>Navegue até a pasta do backend: <code className="bg-gray-100 px-1 rounded">cd backend</code></li>
                          <li>Execute: <code className="bg-gray-100 px-1 rounded">npm run dev</code></li>
                        </ol>
                        <button
                          onClick={retryConnection}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          🔄 Tentar Reconectar
                        </button>
                      </div>
                    )}
                    {(error.includes('DNS') || error.includes('resolver o endereço')) && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800 font-medium mb-2">💡 Problema de DNS detectado</p>
                        <p className="text-sm text-yellow-700 mb-2">
                          O sistema não consegue resolver o endereço da API externa. Isso pode ser causado por:
                        </p>
                        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1 mb-3">
                          <li>Problema temporário com o servidor DNS</li>
                          <li>Problemas de conexão com a internet</li>
                          <li>Configurações de firewall ou proxy</li>
                        </ul>
                        <div className="text-sm text-yellow-700 mb-3">
                          <strong>Tente:</strong> Aguardar alguns instantes e tentar novamente, ou verificar sua conexão com a internet.
                        </div>
                        <button
                          onClick={() => fetchUsersFromApi(10)}
                          className="mt-2 px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                        >
                          🔄 Tentar Novamente
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="ml-4 text-red-600 hover:text-red-800 text-lg font-bold"
                    aria-label="Fechar erro"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {users.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={saveUsers}
                  disabled={loading || selectedUsers.length === 0}
                  className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar {selectedUsers.length > 0 ? `${selectedUsers.length} ` : ''}Usuário(s) no CSV
                </button>
              </div>
            )}

            {!loading && users.length === 0 && !error && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-blue-800">Clique em um dos botões acima para buscar usuários da API externa.</p>
              </div>
            )}

            <UserList
              users={users}
              selectable={true}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              onEdit={setEditingUser}
              onDelete={deleteUser}
              loading={loading}
            />
          </div>
        )}

        {activeView === 'saved' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Usuários Salvos</h1>
            <UserList
              users={savedUsers}
              selectable={false}
              onEdit={setEditingUser}
              onDelete={deleteUser}
              loading={loading}
            />
          </div>
        )}

        {activeView === 'search' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Buscar Usuários</h1>
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={searchUsers}
              loading={loading}
            />
            {searchResults.length > 0 && (
              <UserList
                users={searchResults}
                selectable={false}
                onEdit={setEditingUser}
                onDelete={deleteUser}
                loading={loading}
              />
            )}
          </div>
        )}

        {editingUser && (
          <UserForm
            user={editingUser}
            onSave={updateUser}
            onCancel={() => setEditingUser(null)}
          />
        )}
      </main>
    </div>
  );
}
