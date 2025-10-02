"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { getManual, getVersion, listContentBlocks, Manual, ManualVersion, ContentBlock } from "../../../../lib/api";
import ManualViewer from "../../../components/manual-builder/ManualViewer";
import Button from "../../../components/ui/Button";

export default function ManualViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [manual, setManual] = useState<Manual | null>(null);
  const [version, setVersion] = useState<ManualVersion | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
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
      
      console.log("Attempting to load manual with slug:", manualSlug);
      
      // Load manual data
      const manualData = await getManual(manualSlug);
      console.log("Manual data loaded:", manualData);
      setManual(manualData);

      // Load current version
      if (manualData.current_version) {
        console.log("Loading version:", manualData.current_version);
        const versionData = await getVersion(manualData.current_version);
        console.log("Version data loaded:", versionData);
        setVersion(versionData);

        // Load content blocks for this version
        const blocksData = await listContentBlocks();
        const versionBlocks = blocksData.filter(block => block.version === versionData.id);
        console.log("Content blocks loaded:", versionBlocks);
        setContentBlocks(versionBlocks);
      } else {
        console.log("No current version found for manual");
      }
    } catch (err: any) {
      console.error("Error loading manual:", err);
      console.error("Error details:", {
        message: err.message,
        manualSlug: params.slug as string,
        url: `/api/manuals/${params.slug as string}/`
      });
      setError(err.message || "Failed to load manual");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/manuals/${params.slug}/edit`);
  };

  const handleBack = () => {
    router.push('/manuals');
  };

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

  if (error || !manual) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Manual Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The requested manual could not be found."}</p>
          <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white">
            ← Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="w-full mx-auto flex items-center justify-between">
          <Button
            onClick={handleBack}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700"
          >
            ← Back
          </Button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Manual ID: {manual.id}</span>
            {version && <span>• Version: {version.version_number}</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full mx-auto px-6 py-8">
        <ManualViewer
          manual={manual}
          version={version || undefined}
          contentBlocks={contentBlocks}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
}
