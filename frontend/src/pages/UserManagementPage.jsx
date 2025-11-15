/**
 * User Management Page
 * 
 * Admin page for managing users and their roles.
 * Implements hierarchical permission system.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllUsers, updateUserRole } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROLE_INFO = {
  citizen: {
    label: 'Ciudadano',
    color: 'bg-gray-100 text-gray-800',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    description: 'Puede crear y ver sus propios reportes'
  },
  operator: {
    label: 'Operador',
    color: 'bg-blue-100 text-blue-800',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    description: 'Puede gestionar reportes asignados'
  },
  supervisor: {
    label: 'Supervisor',
    color: 'bg-purple-100 text-purple-800',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    description: 'Puede asignar reportes y gestionar operadores'
  },
  admin: {
    label: 'Administrador',
    color: 'bg-red-100 text-red-800',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    description: 'Acceso completo al sistema'
  }
};

const ROLE_LEVELS = {
  citizen: 0,
  operator: 1,
  supervisor: 2,
  admin: 3
};

export default function UserManagementPage() {
  const { user: currentUser, getRoleLevel } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser || !newRole) return;

    setUpdating(true);
    try {
      await updateUserRole(selectedUser.id, newRole);
      await fetchUsers();
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (err) {
      console.error('Error updating role:', err);
      alert(err.response?.data?.detail || 'Error al actualizar el rol');
    } finally {
      setUpdating(false);
    }
  };

  const canManageUser = (targetUser) => {
    if (targetUser.id === currentUser.id) return false;
    return getRoleLevel() > ROLE_LEVELS[targetUser.role];
  };

  const getAvailableRoles = () => {
    const currentLevel = getRoleLevel();
    return Object.entries(ROLE_LEVELS)
      .filter(([_, level]) => level < currentLevel)
      .map(([role]) => role);
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-guinda"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-guinda mb-2">Gestión de Usuarios</h1>
            <p className="text-gray-600">Administra roles y permisos del sistema</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Role Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(ROLE_INFO).map(([role, info]) => (
              <motion.div
                key={role}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-md p-4 border-2 border-gray-100"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-3xl">{info.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{info.label}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${info.color}`}>
                      Nivel {ROLE_LEVELS[role]}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{info.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Usuario
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre o email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
                />
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Rol
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda focus:border-transparent"
                >
                  <option value="all">Todos los roles</option>
                  {Object.entries(ROLE_INFO).map(([role, info]) => (
                    <option key={role} value={role}>{info.icon} {info.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Usuarios ({filteredUsers.length})
              </h2>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No se encontraron usuarios</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CURP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => {
                      const roleInfo = ROLE_INFO[user.role];
                      const isCurrentUser = user.id === currentUser.id;
                      const canManage = canManageUser(user);

                      return (
                        <tr key={user.id} className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-guinda rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {user.name}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs text-blue-600 font-semibold">(Tú)</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-mono">{user.curp}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                              <span className="mr-1">{roleInfo.icon}</span>
                              {roleInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            {canManage ? (
                              <button
                                onClick={() => openRoleModal(user)}
                                className="text-guinda hover:text-guinda-dark text-sm font-medium"
                              >
                                Cambiar Rol
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">Sin permisos</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Role Change Modal */}
      <AnimatePresence>
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Cambiar Rol de Usuario
                  </h3>
                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Usuario</p>
                  <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>

                {/* Current Role */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol Actual
                  </label>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${ROLE_INFO[selectedUser.role].color}`}>
                    <span className="mr-2">{ROLE_INFO[selectedUser.role].icon}</span>
                    {ROLE_INFO[selectedUser.role].label}
                  </div>
                </div>

                {/* New Role */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo Rol
                  </label>
                  <div className="space-y-2">
                    {getAvailableRoles().map((role) => {
                      const roleInfo = ROLE_INFO[role];
                      return (
                        <label
                          key={role}
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            newRole === role
                              ? 'border-guinda bg-guinda/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role}
                            checked={newRole === role}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="mr-3 text-guinda focus:ring-guinda"
                          />
                          <span className="text-2xl mr-3">{roleInfo.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{roleInfo.label}</p>
                            <p className="text-xs text-gray-600">{roleInfo.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={updating}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRoleUpdate}
                    disabled={updating || newRole === selectedUser.role}
                    className={`px-4 py-2 bg-guinda text-white rounded-lg transition-colors ${
                      updating || newRole === selectedUser.role
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-guinda-dark'
                    }`}
                  >
                    {updating ? 'Actualizando...' : 'Actualizar Rol'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
