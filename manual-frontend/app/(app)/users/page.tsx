"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import { 
  User, 
  UserRole, 
  CreateUserPayload, 
  UpdateUserPayload,
  listUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  resetUserPassword, 
  toggleUserActive 
} from "../../../lib/api";

export default function UsersPage() {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [newUser, setNewUser] = useState<CreateUserPayload>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "USER",
    department: ""
  });

  const [editUser, setEditUser] = useState<UpdateUserPayload>({});

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersList = await listUsers();
      setUsers(usersList);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(-1); // Use -1 for create action
      await createUser(newUser);
      setNewUser({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        role: "USER",
        department: ""
      });
      setShowCreateUser(false);
      await loadUsers(); // Reload users
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      setActionLoading(editingUser.id);
      await updateUser(editingUser.id, editUser);
      setShowEditUser(false);
      setEditingUser(null);
      setEditUser({});
      await loadUsers(); // Reload users
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    
    try {
      setActionLoading(userId);
      await deleteUser(userId);
      await loadUsers(); // Reload users
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (userId: number) => {
    if (!confirm("Reset this user's password to 'temp123'? They will be required to change it on next login.")) {
      return;
    }
    
    try {
      setActionLoading(userId);
      await resetUserPassword(userId);
      await loadUsers(); // Reload users
      setError(null);
      showSuccess("Password Reset", "Password reset successfully. User will be prompted to change password on next login.");
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (userId: number) => {
    try {
      setActionLoading(userId);
      await toggleUserActive(userId);
      await loadUsers(); // Reload users
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to toggle user status");
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditUser({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      department: user.department
    });
    setShowEditUser(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && user.is_active) ||
                         (statusFilter === "inactive" && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: UserRole): "blue" | "green" | "red" | "yellow" | "gray" => {
    switch (role) {
      case 'ADMIN': return 'red';
      case 'CHIEF_MANAGER': return 'red';
      case 'MANAGER': return 'blue';
      case 'SUPERVISOR': return 'yellow';
      case 'ANALYST': return 'green';
      case 'USER': return 'gray';
      default: return 'gray';
    }
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'USER': return 'User';
      case 'ANALYST': return 'Analyst';
      case 'SUPERVISOR': return 'Supervisor';
      case 'MANAGER': return 'Manager';
      case 'CHIEF_MANAGER': return 'Chief Manager';
      case 'ADMIN': return 'Admin';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
              <Button 
                onClick={loadUsers}
                className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users and their permissions</p>
        </div>
        <Button 
          onClick={() => setShowCreateUser(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          + Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-700">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-blue-500 text-xl">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{users.filter(u => u.is_active).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <span className="text-green-500 text-xl">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'MANAGER' || u.role === 'CHIEF_MANAGER').length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-blue-500 text-xl">👔</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-red-600">{users.filter(u => u.role === 'ADMIN').length}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <span className="text-red-500 text-xl">🔐</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              // label="Role"
            >
              <option value="all">All Roles</option>
              <option value="USER">User</option>
              <option value="ANALYST">Analyst</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="MANAGER">Manager</option>
              <option value="CHIEF_MANAGER">Chief Manager</option>
              <option value="ADMIN">Admin</option>
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              // label="Status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Last Login</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">
                            {(user.first_name || user.username).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : user.username}
                          </div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{user.email}</td>
                    <td className="py-4 px-4">
                      <Badge color={getRoleColor(user.role)}>{getRoleDisplayName(user.role)}</Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{user.department || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <Badge color={user.is_active ? 'green' : 'red'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1 flex-wrap">
                        <Button 
                          onClick={() => openEditModal(user)}
                          className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white"
                          loading={actionLoading === user.id}
                          title="Edit User"
                        >
                          ✏️
                        </Button>
                        <Button 
                          onClick={() => handleToggleActive(user.id)}
                          className={`text-xs px-2 py-1 ${user.is_active ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                          loading={actionLoading === user.id}
                          title={user.is_active ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.is_active ? '🔒' : '🔓'}
                        </Button>
                        <Button 
                          onClick={() => handleResetPassword(user.id)}
                          className="text-xs px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                          loading={actionLoading === user.id}
                          title="Reset Password"
                        >
                          🔑
                        </Button>
                        <Button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white"
                          loading={actionLoading === user.id}
                          title="Delete User"
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-blue-950/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Add New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                  required
                />
                <Input
                  label="Last Name"
                  value={newUser.last_name}
                  onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                label="Role"
              >
                <option value="USER">User</option>
                <option value="ANALYST">Analyst</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="MANAGER">Manager</option>
                <option value="CHIEF_MANAGER">Chief Manager</option>
                <option value="ADMIN">Admin</option>
              </Select>
              <Input
                label="Department"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                required
              />
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Default Password:</strong> temp123
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  User will be required to change password on first login.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={actionLoading === -1}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && editingUser && (
        <div className="fixed inset-0 bg-blue-950/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Edit User</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={editUser.first_name || ''}
                  onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
                  required
                />
                <Input
                  label="Last Name"
                  value={editUser.last_name || ''}
                  onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Username"
                value={editUser.username || ''}
                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={editUser.email || ''}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                required
              />
              <Select
                value={editUser.role || 'USER'}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value as UserRole })}
                label="Role"
              >
                <option value="USER">User</option>
                <option value="ANALYST">Analyst</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="MANAGER">Manager</option>
                <option value="CHIEF_MANAGER">Chief Manager</option>
                <option value="ADMIN">Admin</option>
              </Select>
              <Input
                label="Department"
                value={editUser.department || ''}
                onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                required
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowEditUser(false);
                    setEditingUser(null);
                    setEditUser({});
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={actionLoading === editingUser.id}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
