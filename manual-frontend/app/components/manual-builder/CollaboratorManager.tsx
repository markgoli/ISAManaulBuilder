'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faTrash, faUsers, faEye, faEdit } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Badge from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useToast } from '../ui/Toast';
import { 
  Manual, 
  ManualCollaborator, 
  CollaboratorRole, 
  User,
  addCollaborator, 
  removeCollaborator, 
  listCollaborators,
  listUsers 
} from '../../../lib/api';

interface CollaboratorManagerProps {
  manual: Manual;
  onUpdate?: () => void;
}

const CollaboratorManager: React.FC<CollaboratorManagerProps> = ({ manual, onUpdate }) => {
  const { showSuccess, showError } = useToast();
  const [collaborators, setCollaborators] = useState<ManualCollaborator[]>(manual.collaborators || []);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingCollaborator, setAddingCollaborator] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  
  // Add collaborator form state
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<CollaboratorRole>('EDITOR');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchCollaborators();
  }, [manual.id]);

  const fetchUsers = async () => {
    try {
      const allUsers = await listUsers();
      // Filter out the manual creator and existing collaborators
      const availableUsers = allUsers.filter(user => 
        user.id !== manual.created_by && 
        !collaborators.some(collab => collab.user_id === user.id)
      );
      setUsers(availableUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showError('Error', 'Failed to load users');
    }
  };

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const collabs = await listCollaborators(manual.slug);
      setCollaborators(collabs);
    } catch (error) {
      console.error('Failed to fetch collaborators:', error);
      showError('Error', 'Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!selectedUserId) {
      showError('Validation Error', 'Please select a user to add as collaborator');
      return;
    }

    try {
      setAddingCollaborator(true);
      await addCollaborator(manual.slug, parseInt(selectedUserId), selectedRole);
      await fetchCollaborators();
      await fetchUsers(); // Refresh available users
      setSelectedUserId('');
      setSelectedRole('EDITOR');
      showSuccess('Collaborator Added', 'User has been successfully added as a collaborator');
      onUpdate?.();
    } catch (error: any) {
      console.error('Failed to add collaborator:', error);
      showError('Failed to Add Collaborator', error.message || 'Please try again');
    } finally {
      setAddingCollaborator(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: number, username: string) => {
    if (!confirm(`Remove ${username} as a collaborator?`)) {
      return;
    }

    try {
      setRemovingId(collaboratorId);
      await removeCollaborator(manual.slug, collaboratorId);
      await fetchCollaborators();
      await fetchUsers(); // Refresh available users
      showSuccess('Collaborator Removed', `${username} has been removed as a collaborator`);
      onUpdate?.();
    } catch (error: any) {
      console.error('Failed to remove collaborator:', error);
      showError('Failed to Remove Collaborator', error.message || 'Please try again');
    } finally {
      setRemovingId(null);
    }
  };

  const getRoleIcon = (role: CollaboratorRole) => {
    return role === 'EDITOR' ? faEdit : faEye;
  };

  const getRoleColor = (role: CollaboratorRole) => {
    return role === 'EDITOR' ? 'blue' : 'gray';
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
          Collaborators ({collaborators.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Collaborator Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700">Add New Collaborator</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search users by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
              <Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={filteredUsers.length === 0}
              >
                <option value="">
                  {filteredUsers.length === 0 ? 'No available users' : 'Select a user to add...'}
                </option>
                {filteredUsers.map(user => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.first_name} {user.last_name} ({user.username}) - {user.email}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="space-y-2">
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as CollaboratorRole)}
              >
                <option value="EDITOR">Editor (Can edit)</option>
                <option value="VIEWER">Viewer (Read only)</option>
              </Select>
              
              <Button
                onClick={handleAddCollaborator}
                disabled={!selectedUserId || addingCollaborator}
                className="w-full"
                size="sm"
              >
                <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                {addingCollaborator ? 'Adding...' : 'Add Collaborator'}
              </Button>
            </div>
          </div>
        </div>

        {/* Current Collaborators List */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700">Current Collaborators</h4>
          
          {loading ? (
            <div className="text-center py-4 text-slate-500">Loading collaborators...</div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FontAwesomeIcon icon={faUsers} className="text-4xl mb-2 opacity-50" />
              <p>No collaborators added yet</p>
              <p className="text-sm">Add team members to collaborate on this manual</p>
            </div>
          ) : (
            <div className="space-y-3">
              {collaborators.map(collaborator => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon 
                        icon={getRoleIcon(collaborator.role)} 
                        className={`text-sm ${collaborator.role === 'EDITOR' ? 'text-blue-600' : 'text-slate-600'}`}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {collaborator.user_first_name} {collaborator.user_last_name}
                      </div>
                      <div className="text-sm text-slate-600">
                        @{collaborator.user_username} • {collaborator.user_email}
                      </div>
                      <div className="text-xs text-slate-500">
                        Added by {collaborator.added_by_username} on{' '}
                        {new Date(collaborator.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge color={getRoleColor(collaborator.role)} size="sm">
                      {collaborator.role}
                    </Badge>
                    <Button
                      onClick={() => handleRemoveCollaborator(collaborator.id, collaborator.user_username)}
                      disabled={removingId === collaborator.id}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <FontAwesomeIcon 
                        icon={faTrash} 
                        className={removingId === collaborator.id ? 'animate-spin' : ''}
                      />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CollaboratorManager;
