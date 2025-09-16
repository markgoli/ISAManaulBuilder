"use client";

import { useState, useRef } from "react";
import ContentBlock, { ContentBlockData } from "./ContentBlock";

interface DragDropContainerProps {
  blocks: ContentBlockData[];
  onUpdateBlocks: (blocks: ContentBlockData[]) => void;
}

export default function DragDropContainer({ blocks, onUpdateBlocks }: DragDropContainerProps) {
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (blockId: string) => {
    setDraggedBlock(blockId);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedBlock) return;

    const draggedIndex = blocks.findIndex(block => block.id === draggedBlock);
    if (draggedIndex === -1) return;

    const newBlocks = [...blocks];
    const [draggedItem] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedItem);

    // Update order values
    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index,
    }));

    onUpdateBlocks(updatedBlocks);
    setDraggedBlock(null);
    setDragOverIndex(null);
  };

  const updateBlock = (blockId: string, content: any) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, content } : block
    );
    onUpdateBlocks(updatedBlocks);
  };

  const deleteBlock = (blockId: string) => {
    const filteredBlocks = blocks
      .filter(block => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index }));
    onUpdateBlocks(filteredBlocks);
  };

  const moveBlockUp = (blockId: string) => {
    const currentIndex = blocks.findIndex(block => block.id === blockId);
    if (currentIndex <= 0) return;

    const newBlocks = [...blocks];
    [newBlocks[currentIndex - 1], newBlocks[currentIndex]] = 
    [newBlocks[currentIndex], newBlocks[currentIndex - 1]];

    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index,
    }));

    onUpdateBlocks(updatedBlocks);
  };

  const moveBlockDown = (blockId: string) => {
    const currentIndex = blocks.findIndex(block => block.id === blockId);
    if (currentIndex >= blocks.length - 1) return;

    const newBlocks = [...blocks];
    [newBlocks[currentIndex], newBlocks[currentIndex + 1]] = 
    [newBlocks[currentIndex + 1], newBlocks[currentIndex]];

    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index,
    }));

    onUpdateBlocks(updatedBlocks);
  };

  if (blocks.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div className="text-4xl text-gray-400 mb-4">📄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Start building your manual</h3>
        <p className="text-gray-600">Add content blocks from the sidebar to get started.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {blocks.map((block, index) => (
        <div
          key={block.id}
          draggable
          onDragStart={() => handleDragStart(block.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          className={`
            transition-all duration-200
            ${draggedBlock === block.id ? 'opacity-50 scale-95' : ''}
            ${dragOverIndex === index ? 'transform translate-y-1' : ''}
          `}
        >
          {/* Drop indicator */}
          {dragOverIndex === index && draggedBlock && draggedBlock !== block.id && (
            <div className="h-1 bg-blue-400 rounded-full mb-2 transition-all duration-200" />
          )}
          
          <ContentBlock
            block={block}
            onUpdate={updateBlock}
            onDelete={deleteBlock}
            onMoveUp={moveBlockUp}
            onMoveDown={moveBlockDown}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
          />
        </div>
      ))}
      
      {/* Drop zone at the end */}
      <div
        onDragOver={(e) => handleDragOver(e, blocks.length)}
        onDrop={(e) => handleDrop(e, blocks.length)}
        className={`
          h-8 border-2 border-dashed border-transparent rounded-lg transition-all duration-200
          ${dragOverIndex === blocks.length ? 'border-blue-400 bg-blue-50' : ''}
        `}
      />
    </div>
  );
}
