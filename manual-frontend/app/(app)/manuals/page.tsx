"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useSearchParams } from "next/navigation";
import { api, listManuals, createManual, Manual } from "../../../lib/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Select from "../../components/ui/Select";

// Manual interface is now imported from api.ts

export default function ManualsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  
  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newManual, setNewManual] = useState({
    title: "",
    description: "",
    department: "",
    slug: ""
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchManuals();
    
    // Check for search parameter from global search
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  const fetchManuals = async () => {
    try {
      setLoading(true);
      const data = await listManuals();
      console.log("Manuals loaded:", data);
      console.log("Number of manuals:", data.length);
      setManuals(data);
    } catch (err) {
      setError("Failed to fetch manuals");
      console.error("Error loading manuals:", err);
    } finally {
      setLoading(false);
    }
  };

  const createManualHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await createManual({
        title: newManual.title,
        slug: generateSlug(newManual.title),
        department: newManual.department,
      });
      setNewManual({ title: "", description: "", department: "", slug: "" });
      setShowCreateModal(false);
      fetchManuals();
    } catch (err) {
      setError("Failed to create manual");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const filteredManuals = manuals.filter(manual => {
    const matchesSearch = manual.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || manual.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || manual.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = [...new Set(manuals.map(m => m.department).filter(Boolean))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'gray';
      case 'SUBMITTED': return 'blue';
      case 'APPROVED': return 'green';
      case 'PUBLISHED': return 'green';
      case 'REJECTED': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading manuals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Manuals</h1>
          <p className="text-gray-600 mt-1">Manage your documentation & manuals</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md font-medium"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Manual
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by title or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              className="md:col-span-2 bg-slate-50 border-slate-200 focus:bg-white"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border-slate-200 focus:bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
            </Select>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-50 border-slate-200 focus:bg-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </Select>
          </div>
          
          {/* Active Filters */}
          {(searchTerm || statusFilter !== 'all' || departmentFilter !== 'all') && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-600">Active filters:</span>
                {searchTerm && (
                  <Badge variant="outline" color="blue" size="sm">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="outline" color="blue" size="sm">
                    Status: {statusFilter}
                  </Badge>
                )}
                {departmentFilter !== 'all' && (
                  <Badge variant="outline" color="blue" size="sm">
                    Department: {departmentFilter}
                  </Badge>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDepartmentFilter('all');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 underline ml-2"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Manuals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredManuals.map((manual) => (
          <Card key={manual.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border border-slate-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-blue-700 leading-tight">{manual.title}</h3>
                <Badge 
                  color={getStatusColor(manual.status)}
                  variant="solid"
                  size="sm"
                  className="ml-2 flex-shrink-0"
                >
                  {manual.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Manual #{manual.id} • {manual.department || 'General'}
              </p>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Manual Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600 font-medium">Department:</span>
                  <span className="text-sm text-slate-700 font-semibold">
                    {manual.department || 'Not assigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-600 font-medium">Updated:</span>
                  <span className="text-sm text-slate-700 font-semibold">
                    {new Date(manual.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Clean Icon-Only Action Buttons */}
              <div className="flex gap-2 justify-end">
                {/* View Button */}
                <button
                  onClick={() => window.location.href = `/manuals/${manual.id}`}
                  title="View Manual"
                  className="p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                
                {user && (manual.created_by === user.id || user.role === 'ADMIN' || user.role === 'REVIEWER') && (
                  <button
                    onClick={() => window.location.href = `/manuals/${manual.id}/edit`}
                    title="Edit Manual"
                    className="p-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                
                {manual.status === 'DRAFT' && user && manual.created_by === user.id && (
                  <button
                    title="Submit for Review"
                    className="p-2.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredManuals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-blue-700 mb-2">
              {manuals.length === 0 ? 'No manuals yet' : 'No manuals match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {manuals.length === 0 
                ? 'Get started by creating your first manual.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {manuals.length === 0 && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Manual
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Create New Manual</h2>
            <form onSubmit={createManualHandler} className="space-y-4">
              <Input
                label="Title"
                value={newManual.title}
                onChange={(e) => setNewManual({ ...newManual, title: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={newManual.description}
                  onChange={(e) => setNewManual({ ...newManual, description: e.target.value })}
                  placeholder="Brief description of the manual..."
                />
              </div>
              <Input
                label="Department"
                value={newManual.department}
                onChange={(e) => setNewManual({ ...newManual, department: e.target.value })}
                placeholder="e.g., HR, IT, Operations"
              />
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Manual'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}
    </div>
  );
}
