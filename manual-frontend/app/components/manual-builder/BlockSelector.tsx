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
    title: 'Text',
    description: 'Add formatted text',
    color: 'blue',
  },
  {
    type: 'IMAGE',
    icon: '🖼️',
    title: 'Image',
    description: 'Upload images',
    color: 'green',
  },
  {
    type: 'VIDEO',
    icon: '📹',
    title: 'Video',
    description: 'Embed videos',
    color: 'red',
  },
  {
    type: 'TABLE',
    icon: '📊',
    title: 'Table',
    description: 'Data in rows/columns',
    color: 'orange',
  },
  {
    type: 'LIST',
    icon: '📋',
    title: 'List',
    description: 'Bullet/numbered lists',
    color: 'purple',
  },
  {
    type: 'CODE',
    icon: '💻',
    title: 'Code',
    description: 'Code with syntax',
    color: 'gray',
  },
  {
    type: 'QUOTE',
    icon: '💬',
    title: 'Quote',
    description: 'Highlight quotes',
    color: 'yellow',
  },
  {
    type: 'DIVIDER',
    icon: '➖',
    title: 'Divider',
    description: 'Section separator',
    color: 'indigo',
  },
  {
    type: 'CHECKLIST',
    icon: '✅',
    title: 'Checklist',
    description: 'Interactive tasks',
    color: 'emerald',
  },
];

export default function BlockSelector({ onAddBlock }: BlockSelectorProps) {
  const getColorClasses = () => {
    // Uniform color scheme for all tiles with better contrast
    return 'bg-white hover:bg-blue-50 border-2 border-slate-300 text-slate-800 hover:border-blue-400 hover:text-blue-800 shadow-sm';
  };

  return (
    <div className="space-y-3">
      <h3 className="font-small text-blue-700 mb-3 text-sm">Click to add a block</h3>
      <div className="grid grid-cols-3 gap-2">
        {blockTypes.map((blockType) => (
          <button
            key={blockType.type}
            onClick={() => onAddBlock(blockType.type)}
            className={`group relative aspect-square p-2 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${getColorClasses()}`}
            title={blockType.description}
          >
            <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-1 pointer-events-none">
              <div className="text-2xl mb-1">
                {blockType.icon}
              </div>
              <div className="text-center">
                <div className="font-bold text-xs text-slate-700">
                  {blockType.title}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
