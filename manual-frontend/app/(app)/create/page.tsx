"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { createManual, getManual, createContentBlock, listCategories, listTags, ContentBlockType, Category, Tag } from "../../../lib/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import BlockSelector from "../../components/manual-builder/BlockSelector";
import DragDropContainer from "../../components/manual-builder/DragDropContainer";
import { ContentBlockData } from "../../components/manual-builder/ContentBlock";

export default function CreateManualPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [manualData, setManualData] = useState({
    title: "",
    description: "",
    department: "",
    category: "",
    tags: "",
  });

  const [contentBlocks, setContentBlocks] = useState<ContentBlockData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesData, tagsData] = await Promise.all([
        listCategories(),
        listTags(),
      ]);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err) {
      setError("Failed to load initial data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateBlockId = () => {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const addContentBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlockData = {
      id: generateBlockId(),
      type,
      content: getDefaultContent(type),
      order: contentBlocks.length,
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const getDefaultContent = (type: ContentBlockType) => {
    switch (type) {
      case 'TEXT':
        return { title: '', text: '' };
      case 'IMAGE':
        return { src: '', alt: '', caption: '' };
      case 'LIST':
        return { title: '', listType: 'bullet', items: [] };
      case 'TABLE':
        return { title: '', csvData: '' };
      case 'VIDEO':
        return { title: '', url: '' };
      case 'CODE':
        return { title: '', code: '', language: 'javascript' };
      case 'QUOTE':
        return { quote: '', author: '' };
      case 'DIVIDER':
        return {};
      default:
        return {};
    }
  };

  const handleSaveDraft = async () => {
    if (!manualData.title.trim()) {
      setError("Please enter a manual title");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Create the manual (this automatically creates version 1)
      const manual = await createManual({
        title: manualData.title,
        slug: generateSlug(manualData.title),
        department: manualData.department,
      });

      // Get the manual with its current version (auto-created by backend)
      const fullManual = await getManual(manual.id);
      
      if (fullManual.current_version) {
        // Create content blocks for the existing version
        for (const block of contentBlocks) {
          await createContentBlock({
            version: fullManual.current_version,
            type: block.type,
            data: block.content,
            order: block.order,
          });
        }
      }

      // Redirect to manual view
      router.push(`/manuals/${manual.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to save manual");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    // First save as draft, then submit for review
    await handleSaveDraft();
    // Additional logic for submitting for review would go here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Manual</h1>
          <p className="text-gray-600 mt-1">Create a new documentation manual</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleSaveDraft}
            loading={saving}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            💾 Save Draft
          </Button>
          <Button 
            onClick={handleSubmitForReview}
            loading={saving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            📤 Submit for Review
          </Button>
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
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
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

          {/* Content Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Content Builder</CardTitle>
              <p className="text-sm text-gray-600">
                Build your manual using drag-and-drop content blocks. Add blocks from the sidebar and arrange them as needed.
              </p>
            </CardHeader>
            <CardContent>
              <DragDropContainer
                blocks={contentBlocks}
                onUpdateBlocks={setContentBlocks}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Content Blocks */}
          <Card>
            <CardHeader>
              <CardTitle>Content Blocks</CardTitle>
            </CardHeader>
            <CardContent>
              <BlockSelector onAddBlock={addContentBlock} />
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    addContentBlock('TEXT');
                    addContentBlock('LIST');
                    addContentBlock('TEXT');
                  }}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-medium text-gray-900">📋 Process Flow</div>
                  <div className="text-sm text-gray-600">Title + Steps + Description</div>
                </button>
                <button 
                  onClick={() => {
                    addContentBlock('TEXT');
                    addContentBlock('QUOTE');
                    addContentBlock('LIST');
                  }}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-medium text-gray-900">📜 Policy Document</div>
                  <div className="text-sm text-gray-600">Introduction + Quote + Rules</div>
                </button>
                <button 
                  onClick={() => {
                    addContentBlock('TEXT');
                    addContentBlock('IMAGE');
                    addContentBlock('LIST');
                    addContentBlock('VIDEO');
                  }}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="font-medium text-gray-900">🎓 Training Guide</div>
                  <div className="text-sm text-gray-600">Text + Image + Steps + Video</div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Manual Info */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Content Blocks:</span>
                  <span className="font-medium">{contentBlocks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Reading:</span>
                  <span className="font-medium">
                    {Math.max(1, Math.ceil(contentBlocks.length * 0.5))} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-yellow-600">Draft</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
