"use client";

import { useState, useRef } from "react";
import { ContentBlockType } from "../../../lib/api";

export interface ContentBlockData {
  id: string;
  type: ContentBlockType;
  content: any;
  order: number;
}

interface ContentBlockProps {
  block: ContentBlockData;
  onUpdate: (id: string, content: any) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function ContentBlock({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: ContentBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = (newContent: any) => {
    onUpdate(block.id, newContent);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleContentChange({
          ...block.content,
          src: e.target?.result as string,
          alt: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    switch (block.type) {
      case 'TEXT':
        return (
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.content?.title || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    title: e.target.value,
                  })}
                  placeholder="Enter heading..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                />
                <textarea
                  value={block.content?.text || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    text: e.target.value,
                  })}
                  placeholder="Enter your text content..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500  text-gray-600 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div onClick={() => setIsEditing(true)} className="cursor-pointer hover:bg-gray-50 p-2 rounded">
                <h3 className="font-medium text-gray-900 mb-2">{block.content?.title || 'Click to add heading'}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{block.content?.text || 'Click to add text content'}</p>
              </div>
            )}
          </div>
        );

      case 'IMAGE':
        return (
          <div className="space-y-2">
            {block.content?.src ? (
              <div className="relative">
                <img
                  src={block.content.src}
                  alt={block.content.alt || 'Uploaded image'}
                  className="max-w-full h-auto rounded-lg"
                />
                {isEditing && (
                  <div className="absolute top-2 right-2 space-x-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Replace
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400"
              >
                <div className="text-4xl text-gray-400 mb-2">🖼️</div>
                <p className="text-gray-600">Click to upload an image</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {isEditing && block.content?.src && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.content?.alt || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    alt: e.target.value,
                  })}
                  placeholder="Image description (alt text)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={block.content?.caption || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    caption: e.target.value,
                  })}
                  placeholder="Image caption..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {block.content?.caption && (
              <p className="text-sm text-gray-600 text-center italic">{block.content.caption}</p>
            )}
          </div>
        );

      case 'LIST':
        return (
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.content?.title || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    title: e.target.value,
                  })}
                  placeholder="List title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                />
                <select
                  value={block.content?.listType || 'bullet'}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    listType: e.target.value,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500  text-gray-600 text-sm"
                >
                  <option value="bullet">Bullet List</option>
                  <option value="numbered">Numbered List</option>
                  <option value="checklist">Checklist</option>
                </select>
                <textarea
                  value={block.content?.items?.join('\n') || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    items: e.target.value.split('\n'),
                  })}
                  onKeyDown={(e) => {
                    // Allow Enter key to create new lines
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                    }
                  }}
                  placeholder="Enter list items (one per line)..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm resize-none"
                />
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <div onClick={() => setIsEditing(true)} className="cursor-pointer hover:bg-gray-50 p-2 rounded">
                <h3 className="font-medium text-gray-900 mb-2">{block.content?.title || 'Click to add list title'}</h3>
                {block.content?.items?.filter((item: string) => item.trim()).length > 0 ? (
                  block.content.listType === 'numbered' ? (
                    <ol className="list-decimal list-inside space-y-1">
                      {block.content.items.filter((item: string) => item.trim()).map((item: string, index: number) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ol>
                  ) : block.content.listType === 'checklist' ? (
                    <div className="space-y-1">
                      {block.content.items.filter((item: string) => item.trim()).map((item: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      {block.content.items.filter((item: string) => item.trim()).map((item: string, index: number) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  )
                ) : (
                  <p className="text-gray-500">Click to add list items</p>
                )}
              </div>
            )}
          </div>
        );

      case 'CHECKLIST':
        return (
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.content?.title || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    title: e.target.value,
                  })}
                  placeholder="Checklist title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500  text-gray-600 text-sm"
                />
                <textarea
                  value={block.content?.items?.join('\n') || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    items: e.target.value.split('\n'),
                  })}
                  onKeyDown={(e) => {
                    // Allow Enter key to create new lines
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                    }
                  }}
                  placeholder="Enter checklist items (one per line)..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm resize-none"
                />
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <div onClick={() => setIsEditing(true)} className="cursor-pointer hover:bg-gray-50 p-2 rounded">
                <h3 className="font-medium text-gray-900 mb-2">{block.content?.title || 'Click to add checklist title'}</h3>
                {block.content?.items?.length > 0 ? (
                  <div className="space-y-2">
                    {block.content.items.map((item: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Click to add checklist items</p>
                )}
              </div>
            )}
          </div>
        );

      case 'TABLE':
        return (
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.content?.title || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    title: e.target.value,
                  })}
                  placeholder="Table title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                />
                <textarea
                  value={block.content?.csvData || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    csvData: e.target.value,
                  })}
                  placeholder="Enter table data (CSV format)&#10;Header 1, Header 2, Header 3&#10;Row 1 Col 1, Row 1 Col 2, Row 1 Col 3&#10;Row 2 Col 1, Row 2 Col 2, Row 2 Col 3"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                />
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <div onClick={() => setIsEditing(true)} className="cursor-pointer hover:bg-gray-50 p-2 rounded">
                <h3 className="font-medium text-gray-900 mb-2">{block.content?.title || 'Click to add table title'}</h3>
                {block.content?.csvData ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                      {block.content.csvData.split('\n').map((row: string, rowIndex: number) => (
                        <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50' : ''}>
                          {row.split(',').map((cell: string, cellIndex: number) => (
                            rowIndex === 0 ? (
                              <th key={cellIndex} className="border border-gray-300 px-4 py-2 text-left font-medium">
                                {cell.trim()}
                              </th>
                            ) : (
                              <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                                {cell.trim()}
                              </td>
                            )
                          ))}
                        </tr>
                      ))}
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">Click to add table data</p>
                )}
              </div>
            )}
          </div>
        );

      case 'CODE':
        return (
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.content?.title || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    title: e.target.value,
                  })}
                  placeholder="Code block title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                />
                <select
                  value={block.content?.language || 'javascript'}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    language: e.target.value,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="sql">SQL</option>
                  <option value="bash">Bash</option>
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                </select>
                <textarea
                  value={block.content?.code || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    code: e.target.value,
                  })}
                  placeholder="Enter your code here..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <div onClick={() => setIsEditing(true)} className="cursor-pointer hover:bg-gray-50 p-2 rounded">
                <h3 className="font-medium text-gray-900 mb-2">{block.content?.title || 'Click to add code title'}</h3>
                {block.content?.code ? (
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400">{block.content.language}</span>
                    </div>
                    <pre className="text-sm">
                      <code>{block.content.code}</code>
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500">Click to add code</p>
                )}
              </div>
            )}
          </div>
        );

      case 'QUOTE':
        return (
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={block.content?.quote || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    quote: e.target.value,
                  })}
                  placeholder="Enter the quote..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                />
                <input
                  type="text"
                  value={block.content?.author || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    author: e.target.value,
                  })}
                  placeholder="Quote author..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                />
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <div onClick={() => setIsEditing(true)} className="cursor-pointer hover:bg-gray-50 p-2 rounded">
                {block.content?.quote ? (
                  <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
                    <blockquote className="text-gray-700 italic text-lg">
                      "{block.content.quote}"
                    </blockquote>
                    {block.content?.author && (
                      <cite className="text-gray-600 text-sm block mt-2">— {block.content.author}</cite>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Click to add a quote</p>
                )}
              </div>
            )}
          </div>
        );

      case 'VIDEO':
        return (
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.content?.title || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    title: e.target.value,
                  })}
                  placeholder="Video title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                />
                <input
                  type="url"
                  value={block.content?.url || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    url: e.target.value,
                  })}
                  placeholder="Video URL (YouTube, Vimeo, etc.)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                />
                <textarea
                  value={block.content?.description || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    description: e.target.value,
                  })}
                  placeholder="Video description..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                />
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <div onClick={() => setIsEditing(true)} className="cursor-pointer hover:bg-gray-50 p-2 rounded">
                <h3 className="font-medium text-gray-900 mb-2">{block.content?.title || 'Click to add video title'}</h3>
                {block.content?.url ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <iframe
                        src={block.content.url}
                        title={block.content.title || 'Video'}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div>
                    {block.content?.description && (
                      <p className="text-sm text-gray-600">{block.content.description}</p>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl text-gray-400 mb-2">📹</div>
                    <p className="text-gray-500">Click to add video URL</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'DIVIDER':
        return (
          <div className="py-4">
            <hr className="border-gray-300" />
          </div>
        );

      case 'DIAGRAM':
        return (
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.content?.title || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    title: e.target.value,
                  })}
                  placeholder="Diagram title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <select
                  value={block.content?.diagramType || 'flowchart'}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    diagramType: e.target.value,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="flowchart">Flowchart</option>
                  <option value="process">Process Diagram</option>
                  <option value="organizational">Organizational Chart</option>
                  <option value="network">Network Diagram</option>
                </select>
                <textarea
                  value={block.content?.data || ''}
                  onChange={(e) => handleContentChange({
                    ...block.content,
                    data: e.target.value,
                  })}
                  placeholder="Enter diagram description or data..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                />
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <div onClick={() => setIsEditing(true)} className="cursor-pointer hover:bg-gray-50 p-2 rounded">
                <h3 className="font-medium text-gray-900 mb-2">{block.content?.title || 'Click to add diagram title'}</h3>
                {block.content?.data ? (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-lg p-6 text-center">
                    <div className="text-4xl text-blue-500 mb-2">📈</div>
                    <div className="text-sm text-blue-600 font-medium mb-2">{block.content.diagramType}</div>
                    <p className="text-gray-700 text-sm">{block.content.data}</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl text-gray-400 mb-2">📈</div>
                    <p className="text-gray-500">Click to add diagram</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'TABS':
        return (
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Tabs</h4>
                  <button
                    onClick={() => {
                      const newTabs = [...(block.content?.tabs || []), { title: 'New Tab', content: '' }];
                      handleContentChange({ ...block.content, tabs: newTabs });
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Add Tab
                  </button>
                </div>
                {block.content?.tabs?.map((tab: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        value={tab.title || ''}
                        onChange={(e) => {
                          const newTabs = [...block.content.tabs];
                          newTabs[index] = { ...tab, title: e.target.value };
                          handleContentChange({ ...block.content, tabs: newTabs });
                        }}
                        placeholder="Tab title..."
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => {
                          const newTabs = block.content.tabs.filter((_: any, i: number) => i !== index);
                          handleContentChange({ ...block.content, tabs: newTabs });
                        }}
                        className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={tab.content || ''}
                      onChange={(e) => {
                        const newTabs = [...block.content.tabs];
                        newTabs[index] = { ...tab, content: e.target.value };
                        handleContentChange({ ...block.content, tabs: newTabs });
                      }}
                      placeholder="Tab content..."
                      rows={3}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                ))}
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <div onClick={() => setIsEditing(true)} className="cursor-pointer hover:bg-gray-50 p-2 rounded">
                {block.content?.tabs?.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex border-b border-gray-200 bg-gray-50">
                      {block.content.tabs.map((tab: any, index: number) => (
                        <div key={index} className="px-4 py-2 text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                          {tab.title || `Tab ${index + 1}`}
                        </div>
                      ))}
                    </div>
                    <div className="p-4">
                      <p className="text-gray-700 text-sm">
                        {block.content.tabs[0]?.content || 'Click to edit tab content'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl text-gray-400 mb-2">📑</div>
                    <p className="text-gray-500">Click to add tabs</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded text-center text-gray-600">
            Unsupported block type: {block.type}
          </div>
        );
    }
  };

  return (
    <div className="relative group border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      {/* Block Controls */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center space-x-1 bg-white shadow-md rounded p-1">
          {!isFirst && (
            <button
              onClick={() => onMoveUp(block.id)}
              className="p-1 text-gray-500 hover:text-blue-600"
              title="Move up"
            >
              ↑
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => onMoveDown(block.id)}
              className="p-1 text-gray-500 hover:text-blue-600"
              title="Move down"
            >
              ↓
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-gray-500 hover:text-blue-600"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1 text-gray-500 hover:text-red-600"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Block Type Badge */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          {block.type}
        </span>
      </div>

      {/* Block Content */}
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
}
