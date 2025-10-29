'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import SearchBar from './components/SearchBar';
import Navigation from './components/Navigation';

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

  const API_BASE_URL = 'http://localhost:3001/api/users';

  // Busca usuários da API
  const fetchUsersFromApi = async (size: number = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api?size=${size}`);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      alert('Erro ao buscar usuários da API');
    } finally {
      setLoading(false);
    }
  };

  // Carrega usuários salvos do CSV
  const loadSavedUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE_URL);
      setSavedUsers(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar usuários salvos:', error);
      alert('Erro ao carregar usuários salvos');
    } finally {
      setLoading(false);
    }
  };

  // Salva usuários no CSV
  const saveUsers = async () => {
    if (selectedUsers.length === 0) {
      alert('Selecione pelo menos um usuário para salvar');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/save`, { users: selectedUsers });
      alert(`${selectedUsers.length} usuário(s) salvo(s) com sucesso!`);
      setSelectedUsers([]);
      await loadSavedUsers();
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
      alert('Erro ao salvar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Remove usuário
  const deleteUser = async (id: number) => {
    if (!confirm('Deseja realmente excluir este usuário?')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      alert('Usuário excluído com sucesso!');
      await loadSavedUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };

  // Atualiza usuário
  const updateUser = async (user: User) => {
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/${user.id}`, user);
      alert('Usuário atualizado com sucesso!');
      setEditingUser(null);
      await loadSavedUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  // Busca usuários
  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/search?q=${encodeURIComponent(searchTerm)}&fields=first_name,last_name,email`);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      alert('Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'saved') {
      loadSavedUsers();
    }
  }, [activeView]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeView === 'search' && searchTerm.trim()) {
        searchUsers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeView]);

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
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Carregando...' : 'Buscar 10 Usuários'}
                </button>
                <button
                  onClick={() => fetchUsersFromApi(20)}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Carregando...' : 'Buscar 20 Usuários'}
                </button>
              </div>
            </div>

            {users.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={saveUsers}
                  disabled={loading || selectedUsers.length === 0}
                  className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  Salvar {selectedUsers.length > 0 ? `${selectedUsers.length} ` : ''}Usuário(s) no CSV
                </button>
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
