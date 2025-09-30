"use client";

import { Manual, ManualVersion, ContentBlock } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import Button from "../ui/Button";

interface ManualViewerProps {
  manual: Manual;
  version?: ManualVersion;
  contentBlocks?: ContentBlock[];
  onEdit?: () => void;
}

export default function ManualViewer({ manual, version, contentBlocks, onEdit }: ManualViewerProps) {
  const { user } = useAuth();
  
  // Check if current user can edit this manual
  const canEdit = user && (
    manual.created_by === user.id || 
    user.role === 'ADMIN' || 
    user.role === 'REVIEWER'
  );

  const renderContentBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'TEXT':
        return (
          <div className="space-y-2">
            {block.data?.title && (
              <h3 className="text-xl font-semibold text-gray-900">{block.data.title}</h3>
            )}
            {block.data?.text && (
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{block.data.text}</p>
            )}
          </div>
        );

      case 'IMAGE':
        return (
          <div className="space-y-2">
            {block.data?.src && (
              <div className="text-center">
                <img
                  src={block.data.src}
                  alt={block.data.alt || 'Manual image'}
                  className="max-w-full h-auto rounded-lg shadow-sm mx-auto"
                />
                {block.data?.caption && (
                  <p className="text-sm text-gray-600 mt-2 italic">{block.data.caption}</p>
                )}
              </div>
            )}
          </div>
        );

      case 'LIST':
        return (
          <div className="space-y-2">
            {block.data?.title && (
              <h3 className="text-lg font-medium text-gray-900">{block.data.title}</h3>
            )}
            {block.data?.items?.length > 0 && (
              <div className="ml-4">
                {block.data.listType === 'numbered' ? (
                  <ol className="list-decimal list-inside space-y-1">
                    {block.data.items.map((item: string, index: number) => (
                      <li key={index} className="text-gray-700">{item}</li>
                    ))}
                  </ol>
                ) : block.data.listType === 'checklist' ? (
                  <div className="space-y-2">
                    {block.data.items.map((item: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" readOnly />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {block.data.items.map((item: string, index: number) => (
                      <li key={index} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );

      case 'TABLE':
        return (
          <div className="space-y-2">
            {block.data?.title && (
              <h3 className="text-lg font-medium text-gray-900">{block.data.title}</h3>
            )}
            {block.data?.csvData && (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 rounded-lg">
                  <tbody>
                    {block.data.csvData.split('\n').map((row: string, rowIndex: number) => (
                      <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                        {row.split(',').map((cell: string, cellIndex: number) => (
                          rowIndex === 0 ? (
                            <th key={cellIndex} className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              {cell.trim()}
                            </th>
                          ) : (
                            <td key={cellIndex} className="border border-gray-300 px-4 py-3 text-gray-700">
                              {cell.trim()}
                            </td>
                          )
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'CODE':
        return (
          <div className="space-y-2">
            {block.data?.title && (
              <h3 className="text-lg font-medium text-gray-900">{block.data.title}</h3>
            )}
            {block.data?.code && (
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">{block.data.language || 'Code'}</span>
                </div>
                <pre className="text-sm">
                  <code>{block.data.code}</code>
                </pre>
              </div>
            )}
          </div>
        );

      case 'QUOTE':
        return (
          <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
            {block.data?.quote && (
              <blockquote className="text-gray-700 italic text-lg">
                "{block.data.quote}"
              </blockquote>
            )}
            {block.data?.author && (
              <cite className="text-gray-600 text-sm block mt-2">— {block.data.author}</cite>
            )}
          </div>
        );

      case 'VIDEO':
        return (
          <div className="space-y-2">
            {block.data?.title && (
              <h3 className="text-lg font-medium text-gray-900">{block.data.title}</h3>
            )}
            {block.data?.url && (
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={block.data.url}
                  title={block.data.title || 'Video'}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        );

      case 'DIVIDER':
        return (
          <div className="py-6">
            <hr className="border-gray-300" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{manual.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Department: {manual.department}</span>
              <span>Status: {manual.status}</span>
              <span>Created: {new Date(manual.created_at).toLocaleDateString()}</span>
              {version && (
                <span>Version: {version.version_number}</span>
              )}
            </div>
          </div>
          {canEdit && onEdit && (
            <Button
              onClick={onEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              ✏️ Edit Manual
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {contentBlocks && contentBlocks.length > 0 ? (
          contentBlocks
            .sort((a, b) => a.order - b.order)
            .map((block, index) => (
              <div key={block.id || index} className="content-block">
                {renderContentBlock(block)}
              </div>
            ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📄</div>
            <p>This manual doesn't have any content yet.</p>
            {canEdit && (
              <p className="mt-2">Click "Edit Manual" to add content.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Generated by Axora</p>
        <p>Last updated: {new Date(manual.updated_at).toLocaleString()}</p>
      </div>
    </div>
  );
}
