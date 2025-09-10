"use client";

import { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";

interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  manualCount: number;
}

interface Tag {
  id: number;
  name: string;
  color: string;
  manualCount: number;
}

const mockCategories: Category[] = [
  { id: 1, name: "Process Documentation", description: "Step-by-step process guides", color: "blue", manualCount: 12 },
  { id: 2, name: "Policy Manuals", description: "Company policies and procedures", color: "green", manualCount: 8 },
  { id: 3, name: "Training Materials", description: "Employee training documentation", color: "purple", manualCount: 15 },
  { id: 4, name: "Technical Guides", description: "Technical documentation and guides", color: "orange", manualCount: 6 },
  { id: 5, name: "Standard Operating Procedures", description: "SOPs for various operations", color: "red", manualCount: 10 }
];

const mockTags: Tag[] = [
  { id: 1, name: "HR", color: "blue", manualCount: 18 },
  { id: 2, name: "IT", color: "green", manualCount: 12 },
  { id: 3, name: "Finance", color: "yellow", manualCount: 8 },
  { id: 4, name: "Operations", color: "purple", manualCount: 15 },
  { id: 5, name: "Security", color: "red", manualCount: 7 },
  { id: 6, name: "Compliance", color: "orange", manualCount: 9 },
  { id: 7, name: "Training", color: "indigo", manualCount: 20 },
  { id: 8, name: "Onboarding", color: "pink", manualCount: 5 }
];

export default function CategoriesPage() {
  const [categories] = useState<Category[]>(mockCategories);
  const [tags] = useState<Tag[]>(mockTags);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "blue"
  });
  
  const [newTag, setNewTag] = useState({
    name: "",
    color: "blue"
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories & Tags</h1>
          <p className="text-gray-600 mt-1">Organize your manuals with categories and tags</p>
        </div>
      </div>

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
                      <Badge color={category.color as "blue" | "green" | "red" | "yellow" | "gray"}>{category.manualCount} manuals</Badge>
                      <div className="flex space-x-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600">✏️</button>
                        <button className="p-1 text-gray-400 hover:text-red-600">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Create Category Modal */}
          {showCreateCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Create Category</h2>
                <form className="space-y-4">
                  <Input
                    label="Name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    />
                  </div>
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
                      <span className="text-sm text-gray-600">{tag.manualCount} manuals</span>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600">✏️</button>
                      <button className="p-1 text-gray-400 hover:text-red-600">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Create Tag Modal */}
          {showCreateTag && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Create Tag</h2>
                <form className="space-y-4">
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
    </div>
  );
}
