'use client';

import Image from 'next/image';

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

interface UserListProps {
  users: User[];
  selectable?: boolean;
  selectedUsers?: User[];
  setSelectedUsers?: (users: User[]) => void;
  onEdit?: (user: User) => void;
  onDelete?: (id: number) => void;
  loading?: boolean;
}

/**
 * Componente para exibir lista de usuários
 * Suporta seleção múltipla, edição e exclusão
 */
export default function UserList({
  users,
  selectable = false,
  selectedUsers = [],
  setSelectedUsers,
  onEdit,
  onDelete,
  loading = false,
}: UserListProps) {
  const handleSelectUser = (user: User) => {
    if (!setSelectedUsers) return;

    const isSelected = selectedUsers.some((u) => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const isUserSelected = (user: User) => {
    return selectedUsers.some((u) => u.id === user.id);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Nenhum usuário encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {selectable && <th className="px-4 py-3 text-left">Selecionar</th>}
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Avatar</th>
            <th className="px-4 py-3 text-left">Nome</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Telefone</th>
            <th className="px-4 py-3 text-left">Cidade</th>
            <th className="px-4 py-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t hover:bg-gray-50">
              {selectable && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isUserSelected(user)}
                    onChange={() => handleSelectUser(user)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </td>
              )}
              <td className="px-4 py-3">{user.id}</td>
              <td className="px-4 py-3">
                <Image
                  src={user.avatar || '/default-avatar.png'}
                  alt={`${user.first_name} ${user.last_name}`}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(`${user.first_name} ${user.last_name}`);
                  }}
                />
              </td>
              <td className="px-4 py-3">
                {user.first_name} {user.last_name}
              </td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.phone_number}</td>
              <td className="px-4 py-3">{user.address?.city || 'N/A'}</td>
              <td className="px-4 py-3">
                <div className="flex space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(user)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(user.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
