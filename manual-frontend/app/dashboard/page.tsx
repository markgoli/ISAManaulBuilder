'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Manual, listManuals, createManual } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Manual[]>([]);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/dashboard');
  }, [loading, user, router]);

  useEffect(() => {
    listManuals().then(setItems).catch(() => {});
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await createManual({ title, slug: slugify(title), department });
      setItems((prev) => [created, ...prev]);
      setTitle('');
      setDepartment('');
    } catch (e: any) {
      setError(e.message || 'Failed to create manual');
    } finally {
      setBusy(false);
    }
  }

  function colorForStatus(status: Manual['status']): 'gray' | 'blue' | 'green' | 'yellow' | 'red' {
    switch (status) {
      case 'DRAFT':
        return 'gray';
      case 'SUBMITTED':
        return 'yellow';
      case 'APPROVED':
        return 'blue';
      case 'PUBLISHED':
        return 'green';
      case 'REJECTED':
        return 'red';
      default:
        return 'gray';
    }
  }

  return (
    <div className="max-w-5xl mx-auto mt-28 p-4">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <form onSubmit={onCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end mb-8 bg-white/60 p-4 rounded border">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
        <Button type="submit" loading={busy} className="h-[42px]">Create Manual</Button>
        {error && <div className="col-span-full text-sm text-red-600">{error}</div>}
      </form>

      <div className="bg-white rounded border overflow-hidden">
        <div className="grid grid-cols-5 gap-2 px-4 py-2 text-sm font-medium border-b bg-gray-50">
          <div className="col-span-2">Title</div>
          <div>Department</div>
          <div>Status</div>
          <div>Updated</div>
        </div>
        {items.map((m) => (
          <div key={m.id} className="grid grid-cols-5 gap-2 px-4 py-3 items-center border-b last:border-b-0">
            <div className="col-span-2 font-medium text-gray-800">{m.title}</div>
            <div className="text-gray-600">{m.department || '-'}</div>
            <div><Badge color={colorForStatus(m.status)}>{m.status}</Badge></div>
            <div className="text-sm text-gray-500">{new Date(m.updated_at).toLocaleDateString()}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-6 text-center text-gray-500">No manuals yet. Create one above.</div>
        )}
      </div>
    </div>
  );
}


