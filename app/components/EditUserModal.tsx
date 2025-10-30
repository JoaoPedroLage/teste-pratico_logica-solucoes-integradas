'use client';

import { useState, useEffect } from 'react';
import { User } from '../dashboard/types';
import Image from 'next/image';

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onSave: (user: User) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function EditUserModal({ isOpen, user, onSave, onCancel, loading = false }: EditUserModalProps) {
  const [formData, setFormData] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    }
  }, [user]);

  if (!isOpen || !formData) return null;

  const setDeepValue = (obj: any, path: string[], value: any) => {
    if (path.length === 0) return obj;
    const [head, ...rest] = path;
    return {
      ...obj,
      [head]: rest.length === 0 ? value : setDeepValue(obj?.[head] ?? {}, rest, value),
    };
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      if (!prev) return prev;
      if (!field.includes('.')) {
        return { ...prev, [field]: value } as User;
      }
      const segments = field.split('.');
      return setDeepValue(prev, segments, value) as User;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center sm:items-center justify-center p-2 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onCancel} />
        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto transform transition-all">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-white">Editar Usuário</h2>
              <button
                onClick={onCancel}
                className="text-white hover:text-gray-200 active:text-gray-300 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center p-2"
                disabled={loading}
                aria-label="Fechar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Avatar / Foto */}
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold mb-3">Foto do Usuário</h3>
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="flex flex-col items-center">
                    <Image
                      src={formData.picture?.large || '/default-avatar.png'}
                      alt={`${formData.name.first} ${formData.name.last}`}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-full border object-cover bg-white"
                      unoptimized
                    />
                    <p className="text-xs text-gray-500 mt-2">Pré-visualização</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 flex-1">
                    <div>
                      <label className="block text-xs mb-1 text-gray-500">URL (thumbnail)</label>
                      <input
                        type="text"
                        value={formData.picture?.large || ''}
                        onChange={e => handleChange('picture.thumbnail', e.target.value)}
                        className="w-full px-3 py-2 rounded border"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações pessoais */}
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold mb-3">Informações Pessoais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Título</label>
                    <input type="text" value={formData.name?.title || ''} onChange={e => handleChange('name.title', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Nome</label>
                    <input type="text" value={formData.name?.first || ''} onChange={e => handleChange('name.first', e.target.value)} className="w-full px-3 py-2 rounded border" required />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Sobrenome</label>
                    <input type="text" value={formData.name?.last || ''} onChange={e => handleChange('name.last', e.target.value)} className="w-full px-3 py-2 rounded border" required />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Usuário</label>
                    <input type="text" value={formData.login?.username || ''} onChange={e => handleChange('login.username', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Email</label>
                    <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="w-full px-3 py-2 rounded border" required />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Telefone</label>
                    <input type="text" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Celular</label>
                    <input type="text" value={formData.cell} onChange={e => handleChange('cell', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Gênero</label>
                    <select value={formData.gender} onChange={e => handleChange('gender', e.target.value)} className="w-full px-3 py-2 rounded border">
                      <option value="">Selecione...</option>
                      <option value="male">Masculino</option>
                      <option value="female">Feminino</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Data de Nascimento</label>
                    <input type="date" value={formData.dob?.date?.slice(0, 10) || ''} onChange={e => handleChange('dob.date', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                </div>
              </div>

              {/* Endereço completo */}
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold mb-2">Endereço Completo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Rua</label>
                    <input type="text" value={formData.location?.street?.name || ''} onChange={e => handleChange('location.street.name', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Número</label>
                    <input type="number" value={formData.location?.street?.number ?? ''} onChange={e => handleChange('location.street.number', Number(e.target.value))} className="w-full px-3 py-2 rounded border" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Cidade</label>
                    <input type="text" value={formData.location?.city || ''} onChange={e => handleChange('location.city', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Estado</label>
                    <input type="text" value={formData.location?.state || ''} onChange={e => handleChange('location.state', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">País</label>
                    <input type="text" value={formData.location?.country || ''} onChange={e => handleChange('location.country', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">CEP</label>
                    <input type="text" value={formData.location?.postcode || ''} onChange={e => handleChange('location.postcode', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Coordenadas (Lat)</label>
                    <input type="text" value={formData.location?.coordinates?.latitude || ''} onChange={e => handleChange('location.coordinates.latitude', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Coordenadas (Lng)</label>
                    <input type="text" value={formData.location?.coordinates?.longitude || ''} onChange={e => handleChange('location.coordinates.longitude', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Fuso horário (offset)</label>
                    <input type="text" value={formData.location?.timezone?.offset || ''} onChange={e => handleChange('location.timezone.offset', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Fuso horário (descrição)</label>
                    <input type="text" value={formData.location?.timezone?.description || ''} onChange={e => handleChange('location.timezone.description', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                </div>
              </div>

              {/* Outros campos */}
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold mb-2">Documentos e Nacionalidade</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs mb-1 text-gray-500">Nacionalidade</label>
                    <input type="text" value={formData.nat || ''} onChange={e => handleChange('nat', e.target.value)} className="w-full px-3 py-2 rounded border" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-t p-3 sm:p-4 sticky bottom-0 z-10 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

