'use client';

import { User } from '../dashboard/types';
import Image from 'next/image';

interface ViewUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

export default function ViewUserModal({ isOpen, user, onClose }: ViewUserModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold">Detalhes do Usuário</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 active:text-gray-300 transition-colors p-2 sm:p-2 hover:bg-white/20 rounded-lg touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Fechar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* Avatar, nome e email */}
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4 flex flex-col items-center">
            <Image
              src={user.picture?.large || '/default-avatar.png'}
              alt={`${user.name.first} ${user.name.last}`}
              width={96}
              height={96}
              className="w-24 h-24 mb-4 rounded-full border"
              unoptimized
            />
            <h3 className="text-xl font-semibold mb-2">
              {user.name.title} {user.name.first} {user.name.last}
            </h3>
            <p className="text-gray-500">{user.email}</p>
          </div>

          {/* Dados Básicos */}
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Gênero</p>
                <p className="text-sm text-gray-900 font-medium">
                  {user.gender === 'male' ? 'Masculino' : user.gender === 'female' ? 'Feminino' : user.gender}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Data de Nascimento</p>
                <p className="text-sm text-gray-900 font-medium">
                  {new Date(user.dob.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Idade</p>
                <p className="text-sm text-gray-900 font-medium">
                  {user.dob.age} anos
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Criado em</p>
                <p className="text-sm text-gray-900 font-medium">
                  {new Date(user.registered.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Tempo de Registro</p>
                <p className="text-sm text-gray-900 font-medium">
                  {user.registered.age} anos
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Nacionalidade</p>
                <p className="text-sm text-gray-900 font-medium">
                  {user.nat}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Telefone</p>
                <p className="text-sm text-gray-900 font-medium">
                  {user.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Celular</p>
                <p className="text-sm text-gray-900 font-medium">
                  {user.cell}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Documento</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.id_info?.name} {user.id_info?.value}
                </p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
            <h4 className="font-semibold mb-2">Endereço Completo</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Rua</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.location.street.number} {user.location.street.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cidade</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.location.city}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Estado</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.location.state}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">País</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.location.country}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">CEP</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.location.postcode}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Coordenadas</p>
                <p className="text-sm font-medium text-gray-900">
                  Lat: {user.location.coordinates?.latitude}, Lng: {user.location.coordinates?.longitude}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Fuso horário</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.location.timezone?.offset} ({user.location.timezone?.description})
                </p>
              </div>
            </div>
          </div>

          {/* Login/Hashes */}
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
            <h4 className="font-semibold mb-2">Acesso/Login</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Usuário</p>
                <p className="text-sm text-gray-900 font-medium">
                  {user.login.username}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 sm:py-2 min-h-[44px] bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors touch-manipulation active:scale-95 font-medium w-full sm:w-auto"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}