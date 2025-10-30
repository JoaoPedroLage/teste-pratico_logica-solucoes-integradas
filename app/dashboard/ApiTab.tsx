'use client';

import { useState } from 'react';
import { User } from './types';
import ViewUserModal from '../components/ViewUserModal';
import { IoShuffle } from 'react-icons/io5';
import Image from 'next/image';

interface ApiTabProps {
  users: User[];
  selectedUsers: User[];
  loading: boolean;
  onFetchUsers: (size: number, gender?: string, nat?: string) => Promise<void>;
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
  const [searchSize, setSearchSize] = useState('20');
  const [searchField, setSearchField] = useState('gender');
  const [genderValue, setGenderValue] = useState('male');
  const [natValue, setNatValue] = useState('BR');

  const searchOptions = [
    { label: 'Gênero', value: 'gender' },
    { label: 'Nacionalidade', value: 'nat' },
  ];

  const genderOptions = [
    { label: 'Masculino', value: 'male' },
    { label: 'Feminino', value: 'female' },
  ];

  const parsedSize = parseInt((searchSize || '').trim(), 10);
  const isSizeValid = !isNaN(parsedSize) && parsedSize >= 1 && parsedSize <= 100;

  const handleSearch = () => {
    if (typeof onFetchUsers !== 'function') {
      console.error('[ApiTab] onFetchUsers prop is not a function');
      return;
    }
    if (!isSizeValid) {
      console.warn('[ApiTab] Tamanho inválido para busca via filtro:', searchSize);
      return;
    }
    const sizeNum = parsedSize;
    if (searchField === 'gender') {
      // Busca por gênero (nacionalidade aleatória)
      onFetchUsers(sizeNum, genderValue, undefined);
    } else if (searchField === 'nat') {
      // Busca por nacionalidade apenas se especificada, senão aleatório
      const trimmedNat = natValue.trim();
      onFetchUsers(sizeNum, undefined, trimmedNat || undefined);
    }
  };

  const handleSimpleAmount = () => {
    if (typeof onFetchUsers !== 'function') {
      console.error('[ApiTab] onFetchUsers prop is not a function');
      return;
    }
    if (!isSizeValid) {
      console.warn('[ApiTab] Tamanho inválido para busca simples:', searchSize);
      return;
    }
    const sizeNum = parsedSize;
    onFetchUsers(sizeNum);
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Usuários da API Externa</h2>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Botão buscar por quantidade simples */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={searchSize}
                onChange={e => setSearchSize(e.target.value)}
                className="border rounded px-3 py-2 w-20"
                disabled={loading}
              />
              <button
                onClick={handleSimpleAmount}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-5 py-2 font-medium shadow hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-[140px] flex-shrink-0"
                disabled={loading || !isSizeValid}
                title={!isSizeValid ? 'Informe uma quantidade entre 1 e 100' : undefined}
              >
                Buscar {searchSize}
                <span title="Resultado aleatório">
                  <IoShuffle size={18} />
                </span>
              </button>
            </div>
            {/* Filtro API Real */}
            <div className="flex gap-2 items-center flex-1 justify-end">
              <select
                className="border rounded px-2 py-2"
                value={searchField}
                onChange={e => setSearchField(e.target.value)}
                disabled={loading}
              >
                {searchOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {searchField === 'gender' ? (
                <select
                  className="border rounded px-3 py-2"
                  value={genderValue}
                  onChange={e => setGenderValue(e.target.value)}
                  disabled={loading}
                >
                  {genderOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Código"
                  value={natValue}
                  onChange={e => setNatValue(e.target.value)}
                  maxLength={5}
                  className="border rounded px-3 py-2 w-24 uppercase"
                  disabled={loading}
                />
              )}
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                disabled={loading || !isSizeValid}
                title={!isSizeValid ? 'Informe uma quantidade entre 1 e 100' : 'Busca usando filtro oficial da Random User API'}
              >
                Buscar
                <span title="Consulta direta via parâmetro do endpoint">
                  <IoShuffle size={18} />
                </span>
              </button>
            </div>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
            <span className="text-blue-800 font-semibold text-sm sm:text-base text-center sm:text-left flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {selectedUsers.length} usuário(s) selecionado(s)
            </span>
            <button
              onClick={onSaveUsers}
              disabled={loading}
              className="px-4 py-3 min-h-[44px] bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95 font-medium text-sm sm:text-base w-full sm:w-auto shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Salvar Selecionados
            </button>
          </div>
        )}

        {users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {users.map(user => (
              <div
                key={user.login?.uuid || user.email}
                className={`border-2 rounded-xl p-4 sm:p-4 cursor-pointer transition-all touch-manipulation active:scale-[0.98] hover:shadow-lg hover:border-blue-300 ${selectedUsers.some(u => u.login?.uuid === user.login?.uuid)
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg ring-2 ring-blue-200'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                onClick={() => onToggleSelection(user)}
              >
                <div className="flex items-center space-x-3">
                  {user.picture?.large ? (
                    <Image
                      src={user.picture.large}
                      alt={`${user.name.first} ${user.name.last}`}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-blue-100 shadow-md"
                      unoptimized
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0 shadow-md ring-2 ring-blue-200">
                      {user.name.first[0]}{user.name.last[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-sm font-medium text-gray-900 truncate">
                      {user.name.first} {user.name.last}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{user.nat || 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end" onClick={e => e.stopPropagation()}>
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
