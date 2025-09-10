"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { api, listManuals, createManual, Manual } from "../../../lib/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Select from "../../components/ui/Select";

// Manual interface is now imported from api.ts

export default function ManualsPage() {
  const { user } = useAuth();
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
    department: ""
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchManuals();
  }, []);

  const fetchManuals = async () => {
    try {
      setLoading(true);
      const data = await listManuals();
      setManuals(data);
    } catch (err) {
      setError("Failed to fetch manuals");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createManualHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await createManual(newManual);
      setNewManual({ title: "", description: "", department: "" });
      setShowCreateModal(false);
      fetchManuals();
    } catch (err) {
      setError("Failed to create manual");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const filteredManuals = manuals.filter(manual => {
    const matchesSearch = manual.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (manual.description && manual.description.toLowerCase().includes(searchTerm.toLowerCase()));
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
          <h1 className="text-2xl font-bold text-gray-900">Manuals</h1>
          <p className="text-gray-600 mt-1">Manage your documentation manuals</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          + New Manual
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search manuals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
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
              label="Department"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Manuals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredManuals.map((manual) => (
          <Card key={manual.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{manual.title}</CardTitle>
                <Badge color={getStatusColor(manual.status)}>{manual.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{manual.description || 'No description'}</p>
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex justify-between">
                  <span>Department:</span>
                  <span>{manual.department || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated:</span>
                  <span>{new Date(manual.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 text-sm">Edit</Button>
                {manual.status === 'DRAFT' && (
                  <Button className="flex-1 text-sm bg-blue-600 hover:bg-blue-700">Submit</Button>
                )}
                {manual.status === 'PUBLISHED' && (
                  <Button className="flex-1 text-sm bg-green-600 hover:bg-green-700">View</Button>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Manual</h2>
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
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={creating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Create Manual
                </Button>
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
