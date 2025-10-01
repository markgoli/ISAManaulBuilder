"use client";

import { useState, useEffect } from "react";
import { listCategories, createCategory, updateCategory, deleteCategory, listTags, createTag, updateTag, deleteTag, Category, Tag } from "../../../lib/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import TextArea from "../../components/ui/TextArea";
import Badge from "../../components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showEditTag, setShowEditTag] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ type: 'category' | 'tag', item: Category | Tag } | null>(null);
  
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "blue"
  });
  
  const [newTag, setNewTag] = useState({
    name: "",
    color: "blue"
  });

  useEffect(() => {
    loadData();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [categoriesData, tagsData] = await Promise.all([
        listCategories(),
        listTags(),
      ]);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Category CRUD operations
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      setSaving(true);
      setError(null);
      await createCategory({
        name: newCategory.name,
        slug: generateSlug(newCategory.name),
        description: newCategory.description,
        color: newCategory.color,
      });
      setNewCategory({ name: "", description: "", color: "blue" });
      setShowCreateCategory(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditCategory(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      setSaving(true);
      setError(null);
      await updateCategory(editingCategory.id, {
        name: editingCategory.name,
        slug: generateSlug(editingCategory.name),
        description: editingCategory.description,
        color: editingCategory.color,
      });
      setEditingCategory(null);
      setShowEditCategory(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  // Tag CRUD operations
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;

    try {
      setSaving(true);
      setError(null);
      await createTag({
        name: newTag.name,
        slug: generateSlug(newTag.name),
        color: newTag.color,
      });
      setNewTag({ name: "", color: "blue" });
      setShowCreateTag(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create tag");
    } finally {
      setSaving(false);
    }
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setShowEditTag(true);
  };

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;

    try {
      setSaving(true);
      setError(null);
      await updateTag(editingTag.id, {
        name: editingTag.name,
        slug: generateSlug(editingTag.name),
        color: editingTag.color,
      });
      setEditingTag(null);
      setShowEditTag(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to update tag");
    } finally {
      setSaving(false);
    }
  };

  // Delete operations
  const handleDeleteClick = (type: 'category' | 'tag', item: Category | Tag) => {
    setDeleteItem({ type, item });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      setSaving(true);
      setError(null);
      if (deleteItem.type === 'category') {
        await deleteCategory(deleteItem.item.id);
      } else {
        await deleteTag(deleteItem.item.id);
      }
      setDeleteItem(null);
      setShowDeleteConfirm(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to delete item");
    } finally {
      setSaving(false);
    }
  };

  const colorOptions = [
    { value: "blue", label: "Blue", class: "bg-blue-500" },
    { value: "green", label: "Green", class: "bg-green-500" },
    { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
    { value: "red", label: "Red", class: "bg-red-500" },
    { value: "purple", label: "Purple", class: "bg-purple-500" },
    { value: "orange", label: "Orange", class: "bg-orange-500" },
    { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
    { value: "pink", label: "Pink", class: "bg-pink-500" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories and tags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Categories & Tags</h1>
          <p className="text-gray-600 mt-1">Organize your manuals with categories and tags</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Categories</CardTitle>
                <Button 
                  onClick={() => setShowCreateCategory(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
                >
                  + Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full bg-${category.color}-500`}></div>
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge color={category.color as "blue" | "green" | "red" | "yellow" | "gray"}>
                        {category.name}
                      </Badge>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleEditCategory(category)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit category"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteClick('category', category)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete category"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Create Category Modal */}
          {showCreateCategory && (
            <div className="fixed inset-0 bg-blue-950/20 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Create Category</h2>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <Input
                    label="Name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    required
                  />
                  <TextArea
                    label="Description"
                    rows={3}
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Brief description of the category..."
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                          className={`w-full h-10 rounded-md ${color.class} ${
                            newCategory.color === color.value ? 'ring-2 ring-gray-900' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => setShowCreateCategory(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={saving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Create
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tags</CardTitle>
                <Button 
                  onClick={() => setShowCreateTag(true)}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
                >
                  + Add Tag
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge color={tag.color as "blue" | "green" | "red" | "yellow" | "gray"}>{tag.name}</Badge>
                      <span className="text-sm text-gray-600">{tag.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleEditTag(tag)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit tag"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteClick('tag', tag)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete tag"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Create Tag Modal */}
          {showCreateTag && (
            <div className="fixed inset-0 bg-blue-950/20 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Create Tag</h2>
                <form onSubmit={handleCreateTag} className="space-y-4">
                  <Input
                    label="Name"
                    value={newTag.name}
                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setNewTag({ ...newTag, color: color.value })}
                          className={`w-full h-10 rounded-md ${color.class} ${
                            newTag.color === color.value ? 'ring-2 ring-gray-900' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => setShowCreateTag(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={saving}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Create
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total Categories</span>
                  <span className="font-semibold text-gray-900">{categories.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total Tags</span>
                  <span className="font-semibold text-gray-900">{tags.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Most Used Category</span>
                  <span className="font-semibold text-gray-900">Training Materials</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Most Used Tag</span>
                  <span className="font-semibold text-gray-900">Training</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Category Modal */}
      {showEditCategory && editingCategory && (
        <div className="fixed inset-0 bg-blue-950/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Category</h2>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <Input
                label="Name"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                required
              />
              <TextArea
                label="Description"
                rows={3}
                value={editingCategory.description}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                placeholder="Brief description of the category..."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, color: color.value })}
                      className={`w-full h-10 rounded-md ${color.class} ${
                        editingCategory.color === color.value ? 'ring-2 ring-gray-900' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowEditCategory(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tag Modal */}
      {showEditTag && editingTag && (
        <div className="fixed inset-0 bg-blue-950/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Tag</h2>
            <form onSubmit={handleUpdateTag} className="space-y-4">
              <Input
                label="Name"
                value={editingTag.name}
                onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setEditingTag({ ...editingTag, color: color.value })}
                      className={`w-full h-10 rounded-md ${color.class} ${
                        editingTag.color === color.value ? 'ring-2 ring-gray-900' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowEditTag(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteItem && (
        <div className="fixed inset-0 bg-blue-950/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {deleteItem.type}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                loading={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
