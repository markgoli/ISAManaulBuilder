'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import FormError from '../components/ui/FormError';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, loading, updateProfile, changePassword } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user?.profile) {
      setDisplayName(user.profile.display_name || '');
      setPhone(user.profile.phone_number || '');
    }
  }, [user]);

  if (!user) return null;

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await updateProfile({ display_name: displayName, phone_number: phone });
      setMessage('Profile updated');
    } catch (e: any) {
      setError(e.message || 'Failed to update profile');
    }
  }

  async function onChangePwd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await changePassword(oldPwd, newPwd);
      setMessage('Password changed');
      setOldPwd('');
      setNewPwd('');
    } catch (e: any) {
      setError(e.message || 'Failed to change password');
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-28 w-full p-6 border rounded bg-white flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Profile</h1>
        <form onSubmit={onSaveProfile} className="flex flex-col gap-3">
          <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button type="submit">Save profile</Button>
        </form>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Change password</h2>
        <form onSubmit={onChangePwd} className="flex flex-col gap-3">
          <Input label="Current password" type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
          <Input label="New password" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          <Button type="submit">Change password</Button>
        </form>
      </div>
      <FormError message={error} />
      {message && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{message}</div>}
    </div>
  );
}


