"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useSearchParams } from "next/navigation";
import { api, listManuals, createManual, submitManualForReview, deleteManual, Manual } from "../../../lib/api";
import { useToast } from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Select from "../../components/ui/Select";

// Manual interface is now imported from api.ts

export default function ManualsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const searchParams = useSearchParams();
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  
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

  const handleSubmitForReview = async (manualSlug: string) => {
    try {
      setSubmittingId(manualSlug);
      await submitManualForReview(manualSlug);
      // Refresh the manuals list to show updated status
      await fetchManuals();
      showSuccess("Manual Submitted", "Manual has been successfully submitted for review.");
    } catch (err) {
      console.error("Failed to submit manual for review:", err);
      showError("Submission Failed", "Failed to submit manual for review. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteConfirm = (manual: Manual) => {
    setDeleteConfirm({ id: manual.slug, title: manual.title });
  };

  const handleDeleteManual = async (manualSlug: string) => {
    try {
      setDeletingId(manualSlug);
      await deleteManual(manualSlug);
      // Refresh the manuals list
      await fetchManuals();
      setDeleteConfirm(null);
      showSuccess("Manual Deleted", "Manual has been successfully deleted.");
    } catch (err) {
      console.error("Failed to delete manual:", err);
      showError("Deletion Failed", "Failed to delete manual. Please try again.");
    } finally {
      setDeletingId(null);
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
          <p className="text-gray-600 mt-1">
            Showing approved manuals, your own manuals, and collaborative manuals
          </p>
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
                Manual #{manual.reference} • {manual.department || 'General'}
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
                
                {/* Collaboration Status */}
                {manual.collaborators && manual.collaborators.length > 0 && (
                  <div className="flex items-center justify-between py-2 border-t border-slate-100">
                    <span className="text-sm text-slate-600 font-medium">Collaborators:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-slate-700 font-semibold">
                        {manual.collaborators.length}
                      </span>
                      <div className="flex -space-x-1">
                        {manual.collaborators.slice(0, 3).map((collab, index) => (
                          <div
                            key={collab.id}
                            className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white text-xs font-medium text-blue-600"
                            title={`${collab.user_first_name} ${collab.user_last_name} (${collab.role})`}
                          >
                            {collab.user_first_name.charAt(0)}{collab.user_last_name.charAt(0)}
                          </div>
                        ))}
                        {manual.collaborators.length > 3 && (
                          <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center border-2 border-white text-xs font-medium text-slate-600">
                            +{manual.collaborators.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* User's Role Indicator */}
                {user && manual.collaborators && manual.collaborators.some(collab => collab.user_id === user.id) && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-600 font-medium">Your Role:</span>
                    <Badge 
                      color={manual.collaborators.find(collab => collab.user_id === user.id)?.role === 'EDITOR' ? 'blue' : 'gray'} 
                      size="sm"
                    >
                      {manual.collaborators.find(collab => collab.user_id === user.id)?.role}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Clean Icon-Only Action Buttons */}
              <div className="flex gap-2 justify-end">
                {/* View Button */}
                <button
                  onClick={() => window.location.href = `/manuals/${manual.slug}`}
                  title="View Manual"
                  className="p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                
                {user && (manual.created_by === user.id || user.role === 'ADMIN' || user.role === 'MANAGER' || manual.can_edit) && (
                  <button
                    onClick={() => window.location.href = `/manuals/${manual.slug}/edit`}
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
                    onClick={() => handleSubmitForReview(manual.slug)}
                    disabled={submittingId === manual.slug}
                    title={submittingId === manual.slug ? "Submitting..." : "Submit for Review"}
                    className={`p-2.5 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md ${
                      submittingId === manual.slug 
                        ? 'bg-orange-400 cursor-not-allowed' 
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {submittingId === manual.slug ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Delete Button - Only for manual creators on DRAFT or REJECTED manuals */}
                {user && manual.created_by === user.id && (manual.status === 'DRAFT' || manual.status === 'REJECTED') && (
                  <button
                    onClick={() => handleDeleteConfirm(manual)}
                    title="Delete Manual"
                    className="p-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        <div className="fixed inset-0 bg-blue-950/20 bg-opacity-50 flex items-center justify-center z-50">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700"
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
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200 font-medium"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl border-red-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <CardTitle className="text-xl text-red-700">Delete Manual</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-gray-600">
                  Are you sure you want to delete this manual?
                </p>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="font-medium text-red-800">
                    {deleteConfirm.title}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setDeleteConfirm(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteManual(deleteConfirm.id)}
                  disabled={deletingId === deleteConfirm.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {deletingId === deleteConfirm.id ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Manual'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
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
