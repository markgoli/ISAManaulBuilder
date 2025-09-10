"use client";

import { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Select from "../../components/ui/Select";

export default function CreateManualPage() {
  const [manualData, setManualData] = useState({
    title: "",
    description: "",
    department: "",
    category: "",
    tags: "",
    template: ""
  });

  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    // Handle success
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Manual</h1>
          <p className="text-gray-600 mt-1">Create a new documentation manual</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-gray-500 hover:bg-gray-600 text-white">
            💾 Save Draft
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            👁️ Preview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Input
                  label="Title"
                  value={manualData.title}
                  onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                  placeholder="Enter manual title..."
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={manualData.description}
                    onChange={(e) => setManualData({ ...manualData, description: e.target.value })}
                    placeholder="Brief description of the manual..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Department"
                    value={manualData.department}
                    onChange={(e) => setManualData({ ...manualData, department: e.target.value })}
                    placeholder="e.g., HR, IT, Operations"
                  />
                  
                  <Select
                    value={manualData.category}
                    onChange={(e) => setManualData({ ...manualData, category: e.target.value })}
                    label="Category"
                  >
                    <option value="">Select category...</option>
                    <option value="process">Process Documentation</option>
                    <option value="policy">Policy Manual</option>
                    <option value="training">Training Material</option>
                    <option value="technical">Technical Guide</option>
                    <option value="sop">Standard Operating Procedure</option>
                  </Select>
                </div>

                <Input
                  label="Tags"
                  value={manualData.tags}
                  onChange={(e) => setManualData({ ...manualData, tags: e.target.value })}
                  placeholder="Enter tags separated by commas..."
                />
              </form>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Editor Toolbar */}
                <div className="flex gap-2 p-2 bg-gray-50 rounded border">
                  <button className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50">
                    <strong>B</strong>
                  </button>
                  <button className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50">
                    <em>I</em>
                  </button>
                  <button className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50">
                    <u>U</u>
                  </button>
                  <div className="border-l mx-2"></div>
                  <button className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50">
                    📝 H1
                  </button>
                  <button className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50">
                    📝 H2
                  </button>
                  <div className="border-l mx-2"></div>
                  <button className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50">
                    📋 List
                  </button>
                  <button className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50">
                    🔗 Link
                  </button>
                  <button className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50">
                    🖼️ Image
                  </button>
                </div>

                {/* Text Editor */}
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={20}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your manual content here...

You can use markdown syntax:
# Heading 1
## Heading 2
**Bold text**
*Italic text*
- Bullet points
1. Numbered lists
[Link text](URL)
"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="font-medium text-gray-900">Process Flow</div>
                  <div className="text-sm text-gray-600">Step-by-step process documentation</div>
                </button>
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="font-medium text-gray-900">Policy Document</div>
                  <div className="text-sm text-gray-600">Company policy template</div>
                </button>
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="font-medium text-gray-900">Training Guide</div>
                  <div className="text-sm text-gray-600">Employee training material</div>
                </button>
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="font-medium text-gray-900">SOP Template</div>
                  <div className="text-sm text-gray-600">Standard operating procedure</div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Content Blocks */}
          <Card>
            <CardHeader>
              <CardTitle>Content Blocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200">
                  <div className="font-medium text-blue-900">📝 Text Block</div>
                  <div className="text-sm text-blue-600">Add formatted text content</div>
                </button>
                <button className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 border border-green-200">
                  <div className="font-medium text-green-900">📊 Flowchart</div>
                  <div className="text-sm text-green-600">Create process flowchart</div>
                </button>
                <button className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 border border-purple-200">
                  <div className="font-medium text-purple-900">📋 Checklist</div>
                  <div className="text-sm text-purple-600">Add task checklist</div>
                </button>
                <button className="w-full text-left p-3 bg-orange-50 rounded-lg hover:bg-orange-100 border border-orange-200">
                  <div className="font-medium text-orange-900">🖼️ Media</div>
                  <div className="text-sm text-orange-600">Insert images or videos</div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={handleSubmit}
                  loading={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  💾 Save Draft
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  📤 Submit for Review
                </Button>
                <Button className="w-full bg-gray-500 hover:bg-gray-600">
                  👁️ Preview Manual
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
