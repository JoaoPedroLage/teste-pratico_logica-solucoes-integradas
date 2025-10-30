'use client';

import { User } from '../dashboard/types';

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
          {/* Informações Pessoais */}
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Nome Completo</p>
                <p className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Username</p>
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Telefone</p>
                <p className="text-sm font-medium text-gray-900">{user.phone_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Data de Nascimento</p>
                <p className="text-sm font-medium text-gray-900">{user.date_of_birth}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Gênero</p>
                <p className="text-sm font-medium text-gray-900">{user.gender}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">UID</p>
                <p className="text-sm font-medium text-gray-900 break-all">{user.uid}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Número de Seguro Social</p>
                <p className="text-sm font-medium text-gray-900">{user.social_insurance_number}</p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Endereço
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Rua</p>
                <p className="text-sm font-medium text-gray-900">{user.address.street_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Número</p>
                <p className="text-sm font-medium text-gray-900">{user.address.street_address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cidade</p>
                <p className="text-sm font-medium text-gray-900">{user.address.city}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Estado</p>
                <p className="text-sm font-medium text-gray-900">{user.address.state}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">CEP</p>
                <p className="text-sm font-medium text-gray-900">{user.address.zip_code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">País</p>
                <p className="text-sm font-medium text-gray-900">{user.address.country}</p>
              </div>
            </div>
          </div>

          {/* Emprego */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 12H8m-4 0h.01M8 12h.01M12 12h.01M16 12h.01M20 12h.01m-4-8h4a2 2 0 012 2v16a2 2 0 01-2 2h-4a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
              Informações Profissionais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Cargo</p>
                <p className="text-sm font-medium text-gray-900">{user.employment.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Habilidade Principal</p>
                <p className="text-sm font-medium text-gray-900">{user.employment.key_skill}</p>
              </div>
            </div>
          </div>

          {/* Cartão de Crédito e Assinatura */}
          {(user.credit_card || user.subscription) && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pagamento e Assinatura
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {user.credit_card && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cartão de Crédito</p>
                    <p className="text-sm font-medium text-gray-900">{user.credit_card.cc_number}</p>
                  </div>
                )}
                {user.subscription && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Plano</p>
                      <p className="text-sm font-medium text-gray-900">{user.subscription.plan}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p className="text-sm font-medium text-gray-900">{user.subscription.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Método de Pagamento</p>
                      <p className="text-sm font-medium text-gray-900">{user.subscription.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Termo</p>
                      <p className="text-sm font-medium text-gray-900">{user.subscription.term}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

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

