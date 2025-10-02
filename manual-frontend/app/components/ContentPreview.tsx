'use client';

import React from 'react';
import { ContentBlock } from '@/lib/api';

interface ContentPreviewProps {
  blocks: ContentBlock[];
  className?: string;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ blocks, className = '' }) => {
  const renderContentBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'TEXT':
        return (
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: block.data.content || '' }} />
          </div>
        );

      case 'IMAGE':
        return (
          <div className="text-center">
            {block.data.url ? (
              <img 
                src={block.data.url} 
                alt={block.data.alt || 'Image'} 
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            ) : (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-gray-400 text-center">
                  <div className="text-2xl mb-2">🖼️</div>
                  <p>Image: {block.data.alt || 'No description'}</p>
                </div>
              </div>
            )}
            {block.data.caption && (
              <p className="text-sm text-gray-600 mt-2 italic">{block.data.caption}</p>
            )}
          </div>
        );

      case 'TABLE':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {block.data.headers?.map((header: string, index: number) => (
                    <th key={index} className="px-4 py-2 border border-gray-300 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.data.rows?.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2 border border-gray-300">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'LIST':
      case 'CHECKLIST':
        return (
          <div>
            {block.data.items?.filter((item: string) => item.trim()).length > 0 ? (
              <ul className={`space-y-1 ${block.type === 'CHECKLIST' ? 'list-none' : 'list-disc list-inside'}`}>
                {block.data.items.filter((item: string) => item.trim()).map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    {block.type === 'CHECKLIST' && (
                      <span className="mr-2 text-green-600">✓</span>
                    )}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No items in this list</p>
            )}
          </div>
        );

      case 'CODE':
        return (
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm">
              <code>{block.data.code || '// No code content'}</code>
            </pre>
            {block.data.language && (
              <div className="text-xs text-gray-400 mt-2">
                Language: {block.data.language}
              </div>
            )}
          </div>
        );

      case 'QUOTE':
        return (
          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 italic">
            <p className="text-gray-700">{block.data.quote || 'No quote content'}</p>
            {block.data.author && (
              <footer className="text-sm text-gray-600 mt-2">
                — {block.data.author}
              </footer>
            )}
          </blockquote>
        );

      case 'DIVIDER':
        return <hr className="border-gray-300 my-6" />;

      case 'VIDEO':
        return (
          <div className="text-center">
            {block.data.url ? (
              <video 
                controls 
                className="max-w-full h-auto rounded-lg shadow-sm"
                src={block.data.url}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-gray-400 text-center">
                  <div className="text-2xl mb-2">🎥</div>
                  <p>Video: {block.data.title || 'No title'}</p>
                </div>
              </div>
            )}
            {block.data.caption && (
              <p className="text-sm text-gray-600 mt-2 italic">{block.data.caption}</p>
            )}
          </div>
        );

      case 'DIAGRAM':
        return (
          <div className="text-center">
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8">
              <div className="text-gray-400 text-center">
                <div className="text-2xl mb-2">📊</div>
                <p>Diagram: {block.data.title || 'No title'}</p>
                {block.data.description && (
                  <p className="text-sm mt-1">{block.data.description}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'TABS':
        return (
          <div className="border border-gray-300 rounded-lg">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
              <div className="text-sm font-medium text-gray-700">
                Tabs: {block.data.tabs?.map((tab: any) => tab.title).join(', ') || 'No tabs'}
              </div>
            </div>
            <div className="p-4">
              {block.data.tabs?.map((tab: any, index: number) => (
                <div key={index} className="mb-4 last:mb-0">
                  <h4 className="font-medium text-gray-900 mb-2">{tab.title}</h4>
                  <div className="text-gray-700">{tab.content}</div>
                </div>
              ))}
            </div>
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
    <div className={`space-y-6 ${className}`}>
      {blocks.map((block, index) => (
        <div key={block.id || index} className="content-block">
          {renderContentBlock(block)}
        </div>
      ))}
    </div>
  );
};

export default ContentPreview;
