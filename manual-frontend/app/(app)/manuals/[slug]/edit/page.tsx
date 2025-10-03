"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../context/AuthContext";
import { 
  getManual, 
  getVersion, 
  listContentBlocks, 
  updateManual, 
  createVersion, 
  createContentBlock, 
  updateContentBlock, 
  deleteContentBlock,
  Manual, 
  ManualVersion, 
  ContentBlock,
  ContentBlockType 
} from "../../../../../lib/api";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/Card";
import BlockSelector from "../../../../components/manual-builder/BlockSelector";
import DragDropContainer from "../../../../components/manual-builder/DragDropContainer";
import CollaboratorManager from "../../../../components/manual-builder/CollaboratorManager";
import { ContentBlockData } from "../../../../components/manual-builder/ContentBlock";

export default function EditManualPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [manual, setManual] = useState<Manual | null>(null);
  const [manualData, setManualData] = useState({
    title: "",
    description: "",
    department: "",
  });
  const [contentBlocks, setContentBlocks] = useState<ContentBlockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.slug) {
      loadManual();
    }
  }, [params.slug]);

  const loadManual = async () => {
    try {
      setLoading(true);
      const manualSlug = params.slug as string;
      
      // Load manual data
      const manualData = await getManual(manualSlug);
      setManual(manualData);
      setManualData({
        title: manualData.title,
        description: "",
        department: manualData.department,
      });

      // Load current version and content blocks
      if (manualData.current_version) {
        const versionData = await getVersion(manualData.current_version);
        const blocksData = await listContentBlocks();
        const versionBlocks = blocksData
          .filter(block => block.version === versionData.id)
          .sort((a, b) => a.order - b.order)
          .map(block => ({
            id: block.id.toString(),
            type: (block.data?.originalType || block.type) as ContentBlockType,
            content: block.data,
            order: block.order,
          }));
        setContentBlocks(versionBlocks);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load manual");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateBlockId = () => {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Map frontend block types to backend-compatible types
  const mapToBackendType = (frontendType: ContentBlockType): string => {
    const typeMapping: Record<ContentBlockType, string> = {
      'TEXT': 'TEXT',
      'IMAGE': 'IMAGE', 
      'VIDEO': 'VIDEO',
      'TABLE': 'TABLE',
      'LIST': 'LIST',
      'CODE': 'CODE',
      'QUOTE': 'QUOTE',
      'DIVIDER': 'DIVIDER',
      'CHECKLIST': 'LIST',
      'DIAGRAM': 'DIAGRAM',
      'TABS': 'TABS'
    };
    return typeMapping[frontendType] || 'TEXT';
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

  const handleSave = async () => {
    if (!manual || !manualData.title.trim()) {
      setError("Please enter a manual title");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update manual basic info
      const updatedManual = await updateManual(manual.slug, {
        title: manualData.title,
        department: manualData.department,
      });

      // Create a new version with descriptive changelog
      const newVersion = await createVersion({
        manual: manual.id,
        changelog: `Updated manual: ${contentBlocks.length} content blocks`,
      });

      // Create all content blocks for the new version
      // This includes both existing blocks (with changes) and new blocks
      // Each edit creates a new version that inherits all previous content plus changes
      for (const block of contentBlocks) {
        await createContentBlock({
          version: newVersion.id,
          type: mapToBackendType(block.type) as any,
          data: { 
            ...block.content, 
            originalType: block.type // Store original frontend type
          },
          order: block.order,
        });
      }

      // Redirect to manual view
      router.push(`/manuals/${manual.slug}`);
    } catch (err: any) {
      setError(err.message || "Failed to save manual");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/manuals/${params.slug}`);
  };

  // Check if user can edit this manual
  const canEdit = user && manual && (
    manual.created_by === user.id || 
    user.role === 'ADMIN' || 
    user.role === 'MANAGER' ||
    manual.can_edit === true
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading manual...</p>
        </div>
      </div>
    );
  }

  if (error && !manual) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Manual</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/manuals')} className="bg-blue-600 hover:bg-blue-700 text-white">
            ← Back to Manuals
          </Button>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl text-yellow-500 mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to edit this manual.</p>
          <Button onClick={() => router.push(`/manuals/${params.slug}`)} className="bg-blue-600 hover:bg-blue-700 text-white">
            ← Back to Manual
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Edit Manual</h1>
          <p className="text-gray-600 mt-1">Make changes to your documentation manual</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            loading={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            💾 Save Changes
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Main Content - Scrollable */}
        <div className="lg:col-span-2 overflow-y-auto scrollbar-hide">
          <div className="space-y-6 pb-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Title"
                    value={manualData.title}
                    onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                    placeholder="Enter manual title..."
                    required
                  />
                  

                  <Input
                    label="Department"
                    value={manualData.department}
                    onChange={(e) => setManualData({ ...manualData, department: e.target.value })}
                    placeholder="e.g., HR, IT, Operations"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Content Builder</span>
                  {contentBlocks.length > 0 && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {contentBlocks.length} block{contentBlocks.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Edit your manual using drag-and-drop content blocks. Add, remove, or rearrange blocks as needed.
                  {contentBlocks.length > 3 && (
                    <span className="block mt-1 text-blue-600 font-medium">
                      💡 Scroll to see all blocks - sidebar stays accessible
                    </span>
                  )}
                </p>
              </CardHeader>
              <CardContent>
                <DragDropContainer
                  blocks={contentBlocks}
                  onUpdateBlocks={setContentBlocks}
                />
              </CardContent>
            </Card>

            {/* Collaborator Management - Only for manual creator */}
            {manual && user && manual.created_by === user.id && (
              <CollaboratorManager 
                manual={manual} 
                onUpdate={() => {
                  // Refresh manual data to get updated collaborators
                  loadManual();
                }}
              />
            )}
          </div>
        </div>

        {/* Sidebar - Fixed Height */}
        <div className="space-y-6 overflow-y-auto h-full scrollbar-hide">
          {/* Content Blocks */}
          <Card>
            <CardHeader>
              <CardTitle>Add Content Blocks</CardTitle>
            </CardHeader>
            <CardContent>
              <BlockSelector onAddBlock={addContentBlock} />
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
                  <span className="text-gray-600">Current Status:</span>
                  <span className="font-medium text-blue-600">{manual?.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {manual ? new Date(manual.updated_at).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
