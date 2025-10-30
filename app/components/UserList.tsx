'use client';

import Image from 'next/image';

interface User {
  gender: string;
  name: { title: string; first: string; last: string };
  location: {
    street: { number: number; name: string };
    city: string; state: string; country: string; postcode: string | number;
    coordinates?: { latitude: string; longitude: string };
    timezone?: { offset: string; description: string }
  };
  email: string;
  login: { uuid: string; username: string };
  dob: { date: string; age: number };
  registered: { date: string; age: number };
  phone: string;
  cell: string;
  id: { name: string; value: string };
  picture: { large: string; medium: string; thumbnail: string };
  nat: string;
}

interface UserListProps {
  users: User[];
  selectable?: boolean;
  selectedUsers?: User[];
  setSelectedUsers?: (users: User[]) => void;
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
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

    const isSelected = selectedUsers.some((u) => u.login.uuid === user.login.uuid);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter((u) => u.login.uuid !== user.login.uuid));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const isUserSelected = (user: User) => {
    return selectedUsers.some((u) => u.login.uuid === user.login.uuid);
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
            <th className="px-4 py-3 text-left">Nome</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Telefone</th>
            <th className="px-4 py-3 text-left">Cidade</th>
            <th className="px-4 py-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.login.uuid || idx} className="border-t hover:bg-gray-50">
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
              <td className="px-4 py-3 flex items-center gap-2">
                <Image
                  src={user.picture.large}
                  alt={`${user.name.first} ${user.name.last}`}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                  }}
                  unoptimized
                />
                <span>{user.name.first} {user.name.last}</span>
              </td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.phone}</td>
              <td className="px-4 py-3">{user.location.city}</td>
              <td className="px-4 py-3">
                <div className="flex space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(user)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >Editar</button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(user.login.uuid)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >Excluir</button>
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
