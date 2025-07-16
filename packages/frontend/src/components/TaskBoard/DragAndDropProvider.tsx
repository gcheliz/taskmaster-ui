import React, { useState, useCallback } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  TouchSensor,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { TaskStatus } from '../../types/task';

export interface DragAndDropProviderProps {
  /** Children components to wrap with drag and drop context */
  children: React.ReactNode;
  /** Callback when a task is moved between columns */
  onTaskMove?: (taskId: number, fromStatus: TaskStatus, toStatus: TaskStatus) => void;
  /** Optional drag overlay component */
  dragOverlay?: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
}

export interface DragData {
  type: 'task';
  taskId: number;
  status: TaskStatus;
}

export interface DropData {
  type: 'column';
  status: TaskStatus;
}

/**
 * Drag and Drop Provider Component
 * 
 * Provides drag and drop context for the task board using dnd-kit.
 * Handles drag events, accessibility, and provides the necessary context
 * for draggable tasks and droppable columns.
 */
export const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({
  children,
  onTaskMove,
  dragOverlay,
  className = ''
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for different input methods
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Add visual feedback
    document.body.style.cursor = 'grabbing';
    
    // Optional: Add custom drag start logic
    console.log('Drag started:', active.id);
  }, []);

  // Handle drag over (for visual feedback)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) {
      return;
    }
    
    // Optional: Add custom drag over logic
    console.log('Drag over:', { active: active.id, over: over.id });
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    // Clean up
    setActiveId(null);
    document.body.style.cursor = '';
    
    if (!over) {
      console.log('Drag ended without drop target');
      return;
    }
    
    const activeData = active.data.current as DragData;
    const overData = over.data.current as DropData;
    
    // Validate drag data
    if (!activeData || activeData.type !== 'task') {
      console.error('Invalid drag data:', activeData);
      return;
    }
    
    // Validate drop data
    if (!overData || overData.type !== 'column') {
      console.error('Invalid drop data:', overData);
      return;
    }
    
    const { taskId, status: fromStatus } = activeData;
    const { status: toStatus } = overData;
    
    // Don't move if status is the same
    if (fromStatus === toStatus) {
      console.log('Task already in the same column');
      return;
    }
    
    // Call the onTaskMove callback
    if (onTaskMove) {
      console.log('Moving task:', { taskId, fromStatus, toStatus });
      onTaskMove(taskId, fromStatus, toStatus);
    }
  }, [onTaskMove]);

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    document.body.style.cursor = '';
    console.log('Drag cancelled');
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={`drag-drop-provider ${className}`}>
        {children}
        
        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeId ? (
            dragOverlay || (
              <div className="drag-overlay">
                <div className="drag-overlay-content">
                  <span className="drag-overlay-icon">🔄</span>
                  <span className="drag-overlay-text">Moving task...</span>
                </div>
              </div>
            )
          ) : null}
        </DragOverlay>
      </div>
      
      <style>{`
        .drag-drop-provider {
          position: relative;
          height: 100%;
          width: 100%;
        }
        
        .drag-overlay {
          background: rgba(0, 123, 255, 0.1);
          border: 2px dashed #007bff;
          border-radius: 8px;
          padding: 16px;
          pointer-events: none;
          transform: rotate(5deg);
          opacity: 0.8;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
        
        .drag-overlay-content {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #007bff;
          font-weight: 500;
        }
        
        .drag-overlay-icon {
          font-size: 16px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .drag-overlay-text {
          white-space: nowrap;
        }
        
        /* Global drag state styles */
        :global(.dragging) {
          cursor: grabbing !important;
        }
        
        :global(.drag-over) {
          background-color: rgba(0, 123, 255, 0.05);
          border-color: #007bff;
        }
      `}</style>
    </DndContext>
  );
};

export default DragAndDropProvider;