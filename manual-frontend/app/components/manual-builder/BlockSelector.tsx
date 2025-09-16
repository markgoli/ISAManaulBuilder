"use client";

import { ContentBlockType } from "../../../lib/api";

interface BlockSelectorProps {
  onAddBlock: (type: ContentBlockType) => void;
}

interface BlockType {
  type: ContentBlockType;
  icon: string;
  title: string;
  description: string;
  color: string;
}

const blockTypes: BlockType[] = [
  {
    type: 'TEXT',
    icon: '📝',
    title: 'Text Block',
    description: 'Add formatted text content',
    color: 'blue',
  },
  {
    type: 'IMAGE',
    icon: '🖼️',
    title: 'Image',
    description: 'Upload and display images',
    color: 'green',
  },
  {
    type: 'LIST',
    icon: '📋',
    title: 'List',
    description: 'Create bullet, numbered, or checklists',
    color: 'purple',
  },
  {
    type: 'TABLE',
    icon: '📊',
    title: 'Table',
    description: 'Organize data in rows and columns',
    color: 'orange',
  },
  {
    type: 'VIDEO',
    icon: '📹',
    title: 'Video',
    description: 'Embed video content',
    color: 'red',
  },
  {
    type: 'CODE',
    icon: '💻',
    title: 'Code Block',
    description: 'Display code with syntax highlighting',
    color: 'gray',
  },
  {
    type: 'QUOTE',
    icon: '💬',
    title: 'Quote',
    description: 'Highlight important quotes',
    color: 'yellow',
  },
  {
    type: 'DIVIDER',
    icon: '➖',
    title: 'Divider',
    description: 'Add section dividers',
    color: 'indigo',
  },
];

export default function BlockSelector({ onAddBlock }: BlockSelectorProps) {
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900',
      green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-900',
      purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900',
      orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-900',
      red: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-900',
      gray: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900',
      yellow: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-900',
      indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900 mb-3">Add Content Block</h3>
      <div className="grid grid-cols-1 gap-2">
        {blockTypes.map((blockType) => (
          <button
            key={blockType.type}
            onClick={() => onAddBlock(blockType.type)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${getColorClasses(blockType.color)}`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{blockType.icon}</span>
              <div>
                <div className="font-medium">{blockType.title}</div>
                <div className="text-sm opacity-75">{blockType.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
