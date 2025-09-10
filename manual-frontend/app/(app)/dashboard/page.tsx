'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import { Manual, listManuals, createManual } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

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
      const created = await createManual({ title, department });
      setItems((prev) => [created, ...prev]);
      setTitle('');
      setDepartment('');
    } catch (e: any) {
      setError(e.message || 'Failed to create manual');
    } finally {
      setBusy(false);
    }
  }

  // Computed values for dashboard stats
  const stats = useMemo(() => {
    const total = items.length;
    const drafts = items.filter(m => m.status === 'DRAFT').length;
    const published = items.filter(m => m.status === 'PUBLISHED').length;
    const pending = items.filter(m => m.status === 'SUBMITTED').length;
    return { total, drafts, published, pending };
  }, [items]);

  // Filtered items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.department && item.department.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || item.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [items, searchTerm, statusFilter, departmentFilter]);

  // Unique departments for filter dropdown
  const departments = useMemo(() => {
    const unique = [...new Set(items.map(m => m.department).filter(Boolean))];
    return unique.sort();
  }, [items]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentation Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your manuals and documentation workflow</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
          + Create Manual
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Manuals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-blue-500 text-xl">📚</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.drafts}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <span className="text-orange-500 text-xl">✏️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">👁️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">📝</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Create New Manual</h3>
                <p className="text-sm text-gray-600">Start a new documentation manual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Review Pending</h3>
                <p className="text-sm text-gray-600">{stats.pending} manuals awaiting review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">View Reports</h3>
                <p className="text-sm text-gray-600">Documentation analytics and insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Manuals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Manuals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.slice(0, 5).map((manual) => (
                <div key={manual.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{manual.title}</h4>
                    <p className="text-sm text-gray-600">{manual.department || 'No department'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge color={colorForStatus(manual.status)}>{manual.status}</Badge>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📚</div>
                  <p className="text-gray-600">No manuals created yet</p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Create Your First Manual</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Status */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">✏️</span>
                  </div>
                  <span className="text-gray-700">Draft Stage</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.drafts}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">👁️</span>
                  </div>
                  <span className="text-gray-700">Under Review</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.pending}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✅</span>
                  </div>
                  <span className="text-gray-700">Published</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.published}</span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Total Progress</span>
                  <span className="text-gray-900 font-semibold">{Math.round((stats.published / Math.max(stats.total, 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all" 
                    style={{ width: `${(stats.published / Math.max(stats.total, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



