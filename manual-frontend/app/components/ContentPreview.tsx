'use client';

import React from 'react';
import { ContentBlock } from '@/lib/api';

interface ContentPreviewProps {
  blocks: ContentBlock[];
  className?: string;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ blocks, className = '' }) => {
  const convertToEmbedUrl = (url: string): string => {
    if (!url) return url;
    
    // YouTube URL conversion
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo URL conversion
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Return original URL if no conversion needed
    return url;
  };

  const renderContentBlock = (block: ContentBlock) => {
    // Use originalType if available, otherwise use the block type
    const blockType = block.data?.originalType || block.type;
    
    switch (blockType) {
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

      case 'CHECKLIST':
        return (
          <div className="space-y-2">
            {block.data?.title && (
              <h3 className="text-lg font-medium text-gray-900">{block.data.title}</h3>
            )}
            {block.data?.items?.length > 0 && (
              <div className="space-y-2">
                {block.data.items.map((item: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" readOnly />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
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

      case 'DIVIDER':
        return (
          <div className="py-6">
            <hr className="border-gray-300" />
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
                  src={convertToEmbedUrl(block.data.url)}
                  title={block.data.title || 'Video'}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            )}
            {block.data?.description && (
              <p className="text-sm text-gray-600 mt-2">{block.data.description}</p>
            )}
          </div>
        );

      case 'DIAGRAM':
        return (
          <div className="space-y-2">
            {block.data?.title && (
              <h3 className="text-lg font-medium text-gray-900">{block.data.title}</h3>
            )}
            {block.data?.data && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-lg p-6 text-center">
                <div className="text-4xl text-blue-500 mb-2">📈</div>
                <div className="text-sm text-blue-600 font-medium mb-2">{block.data.diagramType}</div>
                <p className="text-gray-700 text-sm">{block.data.data}</p>
              </div>
            )}
          </div>
        );

      case 'TABS':
        return (
          <div className="space-y-2">
            {block.data?.tabs?.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50">
                  {block.data.tabs.map((tab: any, index: number) => (
                    <div key={index} className="px-4 py-2 text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                      {tab.title || `Tab ${index + 1}`}
                    </div>
                  ))}
                </div>
                <div className="p-4">
                  <p className="text-gray-700 text-sm">
                    {block.data.tabs[0]?.content || 'No content'}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-800">
              <div className="font-medium">Unknown Block Type: {block.type}</div>
              <div className="text-sm mt-1">Block data: {JSON.stringify(block.data)}</div>
            </div>
          </div>
        );
    }
  };

  if (!blocks || blocks.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400">
          <div className="text-4xl mb-2">📄</div>
          <p>No content blocks available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {blocks
        .sort((a, b) => a.order - b.order)
        .map((block, index) => (
          <div key={block.id || index} className="content-block">
            {renderContentBlock(block)}
          </div>
        ))}
    </div>
  );
};

export default ContentPreview;
