import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Filter,
  ArrowUpDown,
  Grid3x3,
  MoreVertical,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  User,
  GripVertical,
  Wifi,
  WifiOff
} from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskCollaboration, useWebSocket } from '../hooks/useWebSocket';
import { WebSocketState } from '../types/websocket';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  complexity: number;
  assignee: {
    name: string;
    initials: string;
    color: string;
  };
  progress?: number;
  column: string;
  position: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

const TaskBoard: React.FC = () => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  
  // Initial tasks for demo purposes
  const initialTasks: Task[] = [
    {
      id: '1',
      title: 'Setup React Router',
      description: 'Add navigation between different views',
      priority: 'high',
      complexity: 5,
      assignee: { name: 'Gonzalo', initials: 'GZ', color: 'bg-blue-600' },
      column: 'todo',
      position: 0
    },
    {
      id: '2',
      title: 'Create Task Board UI',
      description: 'Design and implement the task board interface',
      priority: 'medium',
      complexity: 7,
      assignee: { name: 'Alex M', initials: 'AM', color: 'bg-green-600' },
      column: 'todo',
      position: 1
    },
    {
      id: '3',
      title: 'Add drag and drop',
      description: 'Implement drag and drop functionality',
      priority: 'medium',
      complexity: 6,
      assignee: { name: 'John S', initials: 'JS', color: 'bg-purple-600' },
      column: 'todo',
      position: 2
    },
    {
      id: '4',
      title: 'Fix navigation links',
      description: 'Make sidebar navigation functional',
      priority: 'high',
      complexity: 4,
      assignee: { name: 'Gonzalo', initials: 'GZ', color: 'bg-blue-600' },
      column: 'in-progress',
      position: 0,
      progress: 75
    },
    {
      id: '5',
      title: 'Add Repository Integration',
      description: 'Connect to Git repositories',
      priority: 'medium',
      complexity: 8,
      assignee: { name: 'Alex M', initials: 'AM', color: 'bg-green-600' },
      column: 'in-progress',
      position: 1,
      progress: 25
    },
    {
      id: '6',
      title: 'API Endpoint Setup',
      description: 'Create RESTful API endpoints',
      priority: 'high',
      complexity: 6,
      assignee: { name: 'John S', initials: 'JS', color: 'bg-purple-600' },
      column: 'review',
      position: 0,
      progress: 90
    },
    {
      id: '7',
      title: 'Unit Test Coverage',
      description: 'Add comprehensive unit tests',
      priority: 'medium',
      complexity: 5,
      assignee: { name: 'Gonzalo', initials: 'GZ', color: 'bg-blue-600' },
      column: 'testing',
      position: 0,
      progress: 60
    },
    {
      id: '8',
      title: 'Authentication Flow',
      description: 'Implement user authentication',
      priority: 'high',
      complexity: 7,
      assignee: { name: 'Alex M', initials: 'AM', color: 'bg-green-600' },
      column: 'done',
      position: 0,
      progress: 100
    }
  ];

  // WebSocket integration
  const { state: wsState, isConnected, error: wsError } = useWebSocket({
    url: process.env.VITE_WS_URL || 'ws://localhost:3001',
    autoConnect: true,
    user: {
      id: 'user-1',
      name: 'Gonzalo',
      email: 'gonzalo@example.com',
      avatar: '',
      role: 'admin'
    }
  });

  const {
    tasks,
    moveTask,
    updateTask,
    connectedUsers,
    lastUpdate,
    error: taskError
  } = useTaskCollaboration(initialTasks);

  const [columns, setColumns] = useState<Column[]>([
    { id: 'todo', title: 'To Do', color: 'bg-gray-500', tasks: [] },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-600', tasks: [] },
    { id: 'review', title: 'Review', color: 'bg-purple-600', tasks: [] },
    { id: 'testing', title: 'Testing', color: 'bg-amber-600', tasks: [] },
    { id: 'done', title: 'Done', color: 'bg-green-600', tasks: [] }
  ]);

  // Update columns when tasks change
  useEffect(() => {
    const newColumns = columns.map(column => ({
      ...column,
      tasks: tasks
        .filter(task => task.column === column.id)
        .sort((a, b) => a.position - b.position)
    }));
    setColumns(newColumns);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = (id: UniqueIdentifier) => {
    const column = columns.find((col) => col.id === id);
    if (column) return column;
    
    return columns.find((col) => col.tasks.some((task) => task.id === id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColumn = findColumn(active.id);
    const overColumn = findColumn(over.id);

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setColumns((cols) => {
      const activeItems = activeColumn.tasks;
      const overItems = overColumn.tasks;
      const activeIndex = activeItems.findIndex((i) => i.id === active.id);
      const overIndex = overItems.findIndex((i) => i.id === over.id);

      let newIndex: number;
      if (over.id in overColumn.tasks) {
        newIndex = overIndex >= 0 ? overIndex : overItems.length;
      } else {
        newIndex = overItems.length;
      }

      return cols.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            tasks: col.tasks.filter((task) => task.id !== active.id),
          };
        } else if (col.id === overColumn.id) {
          const movedTask = activeColumn.tasks[activeIndex];
          const updatedTask = { ...movedTask, column: col.id };
          const newTasks = [...col.tasks];
          newTasks.splice(newIndex, 0, updatedTask);
          return {
            ...col,
            tasks: newTasks,
          };
        }
        return col;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColumn = findColumn(active.id);
    const overColumn = findColumn(over.id);

    if (!activeColumn || !overColumn) return;

    const activeIndex = activeColumn.tasks.findIndex((i) => i.id === active.id);
    const overIndex = overColumn.tasks.findIndex((i) => i.id === over.id);

    if (activeColumn.id !== overColumn.id) {
      // Task moved to different column - update via WebSocket
      const taskId = active.id as string;
      const newPosition = overIndex >= 0 ? overIndex : overColumn.tasks.length;
      
      // Send real-time update
      if (isConnected) {
        moveTask(taskId, overColumn.id, newPosition);
      }
    } else if (activeIndex !== overIndex) {
      // Task reordered within same column
      const taskId = active.id as string;
      const newPosition = overIndex;
      
      // Send real-time update
      if (isConnected) {
        moveTask(taskId, activeColumn.id, newPosition);
      }
      
      setColumns((cols) =>
        cols.map((col) =>
          col.id === activeColumn.id
            ? { ...col, tasks: arrayMove(col.tasks, activeIndex, overIndex) }
            : col
        )
      );
    }

    setActiveId(null);
  };

  const getTaskById = (id: UniqueIdentifier): Task | undefined => {
    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === id);
      if (task) return task;
    }
    return undefined;
  };

  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);
  const activeTasks = columns
    .filter(col => col.id !== 'done')
    .reduce((sum, col) => sum + col.tasks.length, 0);
  const completedTasks = columns.find(col => col.id === 'done')?.tasks.length || 0;

  const getConnectionStatusColor = () => {
    switch (wsState) {
      case WebSocketState.CONNECTED:
        return 'text-green-600';
      case WebSocketState.CONNECTING:
      case WebSocketState.RECONNECTING:
        return 'text-amber-600';
      default:
        return 'text-red-600';
    }
  };

  const getConnectionStatusText = () => {
    switch (wsState) {
      case WebSocketState.CONNECTED:
        return 'Connected';
      case WebSocketState.CONNECTING:
        return 'Connecting...';
      case WebSocketState.RECONNECTING:
        return 'Reconnecting...';
      case WebSocketState.DISCONNECTED:
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Task Board</h1>
            <p className="text-gray-600 mt-1">Drag and drop tasks between columns to update their status</p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 text-sm ${getConnectionStatusColor()}`}>
              {isConnected ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              <span>{getConnectionStatusText()}</span>
            </div>
            
            {connectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Active users:</span>
                <div className="flex -space-x-2">
                  {connectedUsers.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      title={user.name}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {connectedUsers.length > 3 && (
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                      +{connectedUsers.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Last Update Indicator */}
        {lastUpdate && (
          <div className="mt-2 text-xs text-gray-500">
            Last update: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Error Messages */}
      {(wsError || taskError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{wsError?.message || taskError?.message}</p>
        </div>
      )}

      {/* Board Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-1">
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-1">
            <Grid3x3 className="w-4 h-4" />
            View
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Total: {totalTasks}</span>
            <span>•</span>
            <span>Active: {activeTasks}</span>
            <span>•</span>
            <span>Done: {completedTasks}</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <div className="flex space-x-6 pb-6" style={{ minWidth: '1200px' }}>
            {columns.map((column) => (
              <DroppableColumn key={column.id} column={column} />
            ))}
          </div>
        </div>
        
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}
        >
          {activeId ? <TaskCard task={getTaskById(activeId)!} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

// Droppable Column Component
const DroppableColumn: React.FC<{ column: Column }> = ({ column }) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: 'column',
    },
  });

  return (
    <div className="flex-shrink-0 w-80">
      {/* Column Header */}
      <div className="bg-gray-100 rounded-t-lg p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 ${column.color} rounded-full`}></div>
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {column.tasks.length}
            </span>
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div 
        ref={setNodeRef}
        className="bg-gray-50 rounded-b-lg p-4 space-y-3 min-h-[400px]"
      >
        <SortableContext
          items={column.tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {/* Empty State */}
        {column.tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No tasks in this column</p>
            <p className="text-xs mt-1">Drag tasks here to update their status</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sortable Task Card Wrapper
const SortableTaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard task={task} attributes={attributes} listeners={listeners} />
    </div>
  );
};

// Task Card Component
const TaskCard: React.FC<{ 
  task: Task; 
  isDragging?: boolean;
  attributes?: any;
  listeners?: any;
}> = ({ task, isDragging = false, attributes, listeners }) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          border: 'border-l-4 border-red-500',
          badge: 'bg-red-100 text-red-700'
        };
      case 'medium':
        return {
          border: 'border-l-4 border-amber-500',
          badge: 'bg-amber-100 text-amber-700'
        };
      case 'low':
        return {
          border: 'border-l-4 border-green-500',
          badge: 'bg-green-100 text-green-700'
        };
      default:
        return {
          border: '',
          badge: ''
        };
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity >= 7) return 'bg-red-500';
    if (complexity >= 5) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const priorityStyles = getPriorityStyles(task.priority);

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing ${priorityStyles.border} ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <h4 className="text-gray-900 font-medium text-sm flex-1">{task.title}</h4>
        </div>
        <div className="flex items-center space-x-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyles.badge}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-3 pl-6">{task.description}</p>
      
      <div className="flex items-center justify-between pl-6">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 text-xs">Complexity:</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 ${getComplexityColor(task.complexity)} rounded-full`}></div>
            <span className="text-gray-600 text-xs font-medium">{task.complexity}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-6 h-6 ${task.assignee.color} rounded-full flex items-center justify-center`}>
            <span className="text-white text-xs font-medium">{task.assignee.initials}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {task.progress !== undefined && (
        <div className="mt-3 flex items-center justify-between pl-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <span className="text-gray-500 text-xs ml-2">{task.progress}%</span>
        </div>
      )}

      {/* Real-time Indicator */}
      {task.updatedAt && new Date(task.updatedAt).getTime() > Date.now() - 3000 && (
        <div className="mt-2 pl-6">
          <span className="text-xs text-blue-600 animate-pulse">Just updated</span>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;