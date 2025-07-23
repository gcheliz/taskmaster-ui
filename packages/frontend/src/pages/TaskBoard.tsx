import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Plus,
  Filter,
  ArrowUpDown,
  Grid3x3,
  User,
  GripVertical,
  Wifi,
  WifiOff,
  X,
  ChevronDown,
  Edit2,
  MoreVertical
} from 'lucide-react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';
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
import type { Task as WebSocketTask } from '../types/websocket';
import { TaskModal, type TaskModalMode } from '../components/TaskBoard/TaskModal';
import type { Task as LocalTask } from '../types/task';

interface Task extends Omit<WebSocketTask, 'status' | 'priority' | 'assignee'> {
  description: string; // Make required for UI
  priority: 'low' | 'medium' | 'high'; // Exclude 'critical' for now
  complexity: number; // Make required
  assignee: {
    name: string;
    initials: string;
    color: string;
  };
  progress?: number;
  status?: string; // Make optional for compatibility
}

interface FilterOptions {
  priorities: string[];
  assignees: string[];
  columns: string[];
}

type SortOption = 'priority' | 'complexity' | 'assignee' | 'created' | 'updated';
type SortDirection = 'asc' | 'desc';

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

// Helper to convert between local Task and WebSocketTask
const convertToWebSocketTask = (task: Task): WebSocketTask => ({
  ...task,
  status: (task.status || 'pending') as WebSocketTask['status'],
  priority: task.priority as WebSocketTask['priority'],
  description: task.description,
  assignee: task.assignee ? {
    id: task.assignee.name.toLowerCase().replace(/\s/g, '-'),
    name: task.assignee.name,
    email: `${task.assignee.name.toLowerCase().replace(/\s/g, '.')}@example.com`,
    color: task.assignee.color
  } : undefined
});

const convertFromWebSocketTask = (task: WebSocketTask): Task => ({
  ...task,
  description: task.description || '',
  priority: (task.priority === 'critical' ? 'high' : task.priority) as Task['priority'],
  complexity: task.complexity || 5,
  assignee: task.assignee ? {
    name: task.assignee.name,
    initials: task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    color: task.assignee.color || 'bg-gray-600'
  } : {
    name: 'Unassigned',
    initials: 'NA',
    color: 'bg-gray-400'
  },
  status: task.status
});

// Get the board context for task interactions
const TaskBoardContext = React.createContext<{
  handleTaskClick: (task: Task) => void;
  handleTaskEdit: (task: Task, e: React.MouseEvent) => void;
  isDraggingRef: React.MutableRefObject<boolean>;
  handleTaskDelete?: (task: Task) => void;
} | null>(null);

const TaskBoard: React.FC = () => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priorities: [],
    assignees: [],
    columns: []
  });
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<TaskModalMode>('create');
  const [selectedTask, setSelectedTask] = useState<LocalTask | undefined>();
  
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
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Create Task Board UI',
      description: 'Design and implement the task board interface',
      priority: 'medium',
      complexity: 7,
      assignee: { name: 'Alex M', initials: 'AM', color: 'bg-green-600' },
      column: 'todo',
      position: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Add drag and drop',
      description: 'Implement drag and drop functionality',
      priority: 'medium',
      complexity: 6,
      assignee: { name: 'John S', initials: 'JS', color: 'bg-purple-600' },
      column: 'todo',
      position: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
      progress: 75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
      progress: 25,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
      progress: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
      progress: 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
      progress: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // WebSocket integration
  const { state: wsState, isConnected, error: wsError } = useWebSocket({
    url: process.env.VITE_WS_URL || 'ws://localhost:3001',
    autoConnect: false, // Disable auto-connect for now
    user: {
      id: 'user-1',
      name: 'Gonzalo',
      email: 'gonzalo@example.com',
      avatar: ''
    }
  });

  const {
    tasks: wsTasksRaw,
    moveTask,
    updateTask,
    connectedUsers,
    lastUpdate,
    error: taskError
  } = useTaskCollaboration(initialTasks.map(convertToWebSocketTask));
  
  // Convert WebSocket tasks to local format
  const tasks = wsTasksRaw.map(convertFromWebSocketTask);

  const [columns, setColumns] = useState<Column[]>([
    { id: 'todo', title: 'To Do', color: 'bg-gray-500', tasks: [] },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-600', tasks: [] },
    { id: 'review', title: 'Review', color: 'bg-purple-600', tasks: [] },
    { id: 'testing', title: 'Testing', color: 'bg-amber-600', tasks: [] },
    { id: 'done', title: 'Done', color: 'bg-green-600', tasks: [] }
  ]);

  // Get unique values for filter options
  const getUniqueAssignees = () => {
    return Array.from(new Set(tasks.map(task => task.assignee?.name || 'Unassigned').filter(name => name !== 'Unassigned'))).sort();
  };

  // Filter and sort tasks
  const getFilteredAndSortedTasks = useCallback((columnTasks: Task[]) => {
    let filtered = [...columnTasks];

    // Apply filters
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(task => filters.priorities.includes(task.priority));
    }
    if (filters.assignees.length > 0) {
      filtered = filtered.filter(task => task.assignee && filters.assignees.includes(task.assignee.name));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'complexity':
          compareValue = a.complexity - b.complexity;
          break;
        case 'assignee':
          const aName = a.assignee?.name || '';
          const bName = b.assignee?.name || '';
          compareValue = aName.localeCompare(bName);
          break;
        case 'created':
          compareValue = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'updated':
          compareValue = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
          break;
        default:
          compareValue = a.position - b.position;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [filters, sortBy, sortDirection]);

  // Update columns when tasks, filters, or sorting change
  useEffect(() => {
    setColumns(prevColumns => {
      return prevColumns.map(column => {
        const columnTasks = tasks.filter(task => task.column === column.id);
        const filteredAndSorted = getFilteredAndSortedTasks(columnTasks);
        
        return {
          ...column,
          tasks: filteredAndSorted
        };
      });
    });
  }, [tasks, filters, sortBy, sortDirection, getFilteredAndSortedTasks]);

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
    isDraggingRef.current = true;
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
    // Reset dragging state after a short delay to prevent click conflicts
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  const getTaskById = (id: UniqueIdentifier): Task | undefined => {
    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === id);
      if (task) return task;
    }
    return undefined;
  };

  // Handle task click for viewing details
  const handleTaskClick = (task: Task) => {
    const localTask: LocalTask = {
      id: Number(task.id),
      title: task.title,
      description: task.description || '',
      priority: task.priority as LocalTask['priority'],
      status: (task.column === 'todo' ? 'pending' : task.column === 'in-progress' ? 'in-progress' : 'done') as LocalTask['status'],
      assignedTo: task.assignee?.name,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      tags: [],
      dependencies: [],
    };
    setSelectedTask(localTask);
    setModalMode('view');
    setIsModalOpen(true);
  };

  // Handle task edit
  const handleTaskEdit = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const localTask: LocalTask = {
      id: Number(task.id),
      title: task.title,
      description: task.description || '',
      priority: task.priority as LocalTask['priority'],
      status: (task.column === 'todo' ? 'pending' : task.column === 'in-progress' ? 'in-progress' : 'done') as LocalTask['status'],
      assignedTo: task.assignee?.name,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      tags: [],
      dependencies: [],
    };
    setSelectedTask(localTask);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Handle new task creation
  const handleAddTask = () => {
    setSelectedTask(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Handle task save from modal
  const handleTaskSave = async (taskData: Partial<LocalTask>) => {
    // Convert LocalTask to Task format
    const taskUpdate: Partial<Task> = {
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority as Task['priority'],
      assignee: taskData.assignedTo ? {
        name: taskData.assignedTo,
        initials: taskData.assignedTo.split(' ').map(n => n[0]).join('').toUpperCase(),
        color: 'bg-blue-600' // Default color, could be mapped from user data
      } : {
        name: 'Unassigned',
        initials: 'NA',
        color: 'bg-gray-400'
      }
    };

    if (modalMode === 'edit' && selectedTask) {
      // Update existing task
      const taskId = selectedTask.id.toString();
      if (isConnected) {
        updateTask(taskId, convertToWebSocketTask(taskUpdate as Task));
      }
    } else {
      // Create new task - for now, just add to todo column
      const newTask: Task = {
        ...taskUpdate as Task,
        id: Date.now().toString(),
        column: 'todo',
        position: columns.find(col => col.id === 'todo')?.tasks.length || 0,
        complexity: 5, // Default complexity
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to local state
      setColumns(prevColumns => 
        prevColumns.map(col => 
          col.id === 'todo' 
            ? { ...col, tasks: [...col.tasks, newTask] }
            : col
        )
      );
    }
    
    if (isMobile) {
      setShowBottomSheet(false);
    } else {
      setIsModalOpen(false);
    }
  };

  // Handle task deletion
  const handleTaskDelete = async () => {
    if (!selectedTask) return;
    
    // Remove from local state
    setColumns(prevColumns => 
      prevColumns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.id !== selectedTask.id.toString())
      }))
    );
    
    if (isMobile) {
      setShowBottomSheet(false);
    } else {
      setIsModalOpen(false);
    }
  };

  // Handle quick task delete (for swipe action)
  const handleQuickTaskDelete = (task: Task) => {
    // Remove from local state
    setColumns(prevColumns => 
      prevColumns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.id !== task.id)
      }))
    );
    setSwipedCardId(null);
  };

  // Handle filter toggle
  const toggleFilter = (type: keyof FilterOptions, value: string) => {
    setFilters(prev => {
      const currentValues = prev[type];
      const isSelected = currentValues.includes(value);
      
      return {
        ...prev,
        [type]: isSelected 
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      };
    });
  };

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('desc');
    }
    setShowSortMenu(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      priorities: [],
      assignees: [],
      columns: []
    });
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allTasks = tasks.length;
  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);
  const activeTasks = columns
    .filter(col => col.id !== 'done')
    .reduce((sum, col) => sum + col.tasks.length, 0);
  const completedTasks = columns.find(col => col.id === 'done')?.tasks.length || 0;
  const activeFiltersCount = filters.priorities.length + filters.assignees.length + filters.columns.length;
  const filteredOutCount = allTasks - totalTasks;

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
        
        {/* Error Display */}
        {(wsError || taskError) && (
          <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
            {wsError || taskError}
          </div>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Add Task Button */}
            <button 
              onClick={handleAddTask}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus size={20} />
              <span>Add Task</span>
            </button>

            {/* Filter Button */}
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`bg-white border ${activeFiltersCount > 0 ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-700'} px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2`}>
                <Filter size={18} />
                <span>Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown size={16} className={`transform transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Filter Menu */}
              {showFilterMenu && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Filter Tasks</h3>
                      <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Clear all
                      </button>
                    </div>
                    
                    {/* Priority Filter */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                      <div className="space-y-2">
                        {['high', 'medium', 'low'].map(priority => (
                          <label key={priority} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.priorities.includes(priority)}
                              onChange={() => toggleFilter('priorities', priority)}
                              className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700 capitalize">{priority}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* Assignee Filter */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Assignee</h4>
                      <div className="space-y-2">
                        {getUniqueAssignees().map(assignee => (
                          <label key={assignee} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.assignees.includes(assignee)}
                              onChange={() => toggleFilter('assignees', assignee)}
                              className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{assignee}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Button */}
            <div className="relative" ref={sortRef}>
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <ArrowUpDown size={18} />
                <span>Sort</span>
                <ChevronDown size={16} className={`transform transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Sort Menu */}
              {showSortMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    {[
                      { value: 'priority' as SortOption, label: 'Priority' },
                      { value: 'complexity' as SortOption, label: 'Complexity' },
                      { value: 'assignee' as SortOption, label: 'Assignee' },
                      { value: 'created' as SortOption, label: 'Date Created' },
                      { value: 'updated' as SortOption, label: 'Last Updated' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 flex items-center justify-between ${sortBy === option.value ? 'bg-gray-100 text-blue-600' : 'text-gray-700'}`}
                      >
                        <span>{option.label}</span>
                        {sortBy === option.value && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Task Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Active:</span>
              <span className="font-semibold text-gray-900">{activeTasks}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Completed:</span>
              <span className="font-semibold text-green-600">{completedTasks}</span>
            </div>
            {filteredOutCount > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Filtered:</span>
                <span className="font-semibold text-amber-600">{filteredOutCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Board */}
      <TaskBoardContext.Provider value={{ handleTaskClick, handleTaskEdit, isDraggingRef, handleTaskDelete: handleQuickTaskDelete }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div 
            ref={boardRef}
            className={`${isMobile ? 'space-y-4' : 'flex space-x-6 overflow-x-auto pb-4'}`}
          >
            {columns.map((column) => (
              <Column 
                key={column.id} 
                column={column} 
                isMobile={isMobile}
                isCollapsed={collapsedColumns.includes(column.id)}
                onToggleCollapse={() => toggleColumnCollapse(column.id)}
                swipedCardId={swipedCardId}
                onCardSwipe={handleCardSwipe}
              />
            ))}
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
      </TaskBoardContext.Provider>
      
      {/* Task Modal - Desktop */}
      {!isMobile && (
        <TaskModal
          isOpen={isModalOpen}
          mode={modalMode}
          task={selectedTask}
          availableTasks={tasks.map(t => ({
            id: Number(t.id),
            title: t.title,
            description: t.description || '',
            priority: t.priority as LocalTask['priority'],
            status: (t.column === 'todo' ? 'pending' : t.column === 'in-progress' ? 'in-progress' : 'done') as LocalTask['status'],
            assignedTo: t.assignee?.name !== 'Unassigned' ? t.assignee?.name : undefined,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            position: t.position,
            tags: [],
            dependencies: [],
          }))}
          onClose={() => setIsModalOpen(false)}
          onSave={handleTaskSave}
          onDelete={selectedTask ? handleTaskDelete : undefined}
          onEdit={() => {
            setModalMode('edit');
          }}
        />
      )}
      
      {/* Bottom Sheet Modal - Mobile */}
      {isMobile && (
        <MobileBottomSheet
          isOpen={showBottomSheet}
          onClose={() => {
            setShowBottomSheet(false);
            setSwipedCardId(null);
          }}
          mode={modalMode}
          task={selectedTask}
          onSave={handleTaskSave}
          onDelete={selectedTask ? handleTaskDelete : undefined}
          onEdit={() => {
            setModalMode('edit');
          }}
        />
      )}
    </div>
  );
};

// Mobile Bottom Sheet Component
interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode: TaskModalMode;
  task?: LocalTask;
  onSave: (task: Partial<LocalTask>) => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  mode,
  task,
  onSave,
  onDelete,
  onEdit
}) => {
  const [formData, setFormData] = useState<Partial<LocalTask>>({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: undefined,
    tags: [],
    dependencies: []
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: undefined,
        tags: [],
        dependencies: []
      });
    }
  }, [task]);

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="relative bg-white w-full max-w-lg rounded-t-2xl shadow-xl animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            {mode === 'create' ? 'New Task' : mode === 'edit' ? 'Edit Task' : 'Task Details'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {mode === 'view' ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium">{task?.title}</h4>
                <p className="text-gray-600 mt-1">{task?.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    task?.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task?.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {task?.priority?.charAt(0).toUpperCase()}{task?.priority?.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Assigned to:</span>
                  <span className="ml-2">{task?.assignedTo || 'Unassigned'}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button
                  onClick={onEdit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as LocalTask['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo || ''}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter name"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {mode === 'create' ? 'Create Task' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Column Component
interface ColumnProps {
  column: Column;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  swipedCardId?: string | null;
  onCardSwipe?: (taskId: string, direction: 'left' | 'right') => void;
}

const Column: React.FC<ColumnProps> = ({ 
  column, 
  isMobile = false, 
  isCollapsed = false,
  onToggleCollapse,
  swipedCardId,
  onCardSwipe
}) => {
  const getColumnStats = () => {
    const totalComplexity = column.tasks.reduce((sum, task) => sum + task.complexity, 0);
    const avgComplexity = column.tasks.length > 0 ? (totalComplexity / column.tasks.length).toFixed(1) : '0';
    const highPriority = column.tasks.filter(task => task.priority === 'high').length;
    
    return { avgComplexity, highPriority };
  };

  const stats = getColumnStats();

  const columnClasses = isMobile 
    ? "w-full bg-white rounded-lg shadow-sm border border-gray-200 mb-4"
    : "flex-shrink-0 w-80";

  return (
    <div className={columnClasses}>
      {/* Column Header */}
      <div className={`${isMobile ? 'p-4' : 'bg-gray-100 rounded-t-lg p-4 border-b border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 ${column.color} rounded-full`}></div>
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {column.tasks.length}
            </span>
            {isMobile && (
              <button
                onClick={onToggleCollapse}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <span>Avg complexity:</span>
            <span className="font-medium">{stats.avgComplexity}</span>
          </div>
          {stats.highPriority > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-red-600">High:</span>
              <span className="font-medium text-red-600">{stats.highPriority}</span>
            </div>
          )}
        </div>
      </div>

      {/* Column Tasks */}
      {(!isMobile || !isCollapsed) && (
        <div className={`${isMobile ? 'p-4 pt-0' : 'bg-gray-50 rounded-b-lg p-4 min-h-[400px]'} space-y-3`}>
          <SortableContext
            items={column.tasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.tasks.map((task) => (
              <SortableTaskCard 
                key={task.id} 
                task={task} 
                isMobile={isMobile}
                isCardSwiped={swipedCardId === task.id}
                onSwipe={onCardSwipe}
              />
            ))}
          </SortableContext>
          
          {/* Empty State */}
          {column.tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No tasks in this column</p>
              <p className="text-xs mt-1">{isMobile ? 'Tap + to add tasks' : 'Drag tasks here to update their status'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Sortable Task Card Wrapper
interface SortableTaskCardProps {
  task: Task;
  isMobile?: boolean;
  isCardSwiped?: boolean;
  onSwipe?: (taskId: string, direction: 'left' | 'right') => void;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ 
  task, 
  isMobile = false,
  isCardSwiped = false,
  onSwipe
}) => {
  const context = React.useContext(TaskBoardContext);
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
      <TaskCard 
        task={task} 
        attributes={attributes} 
        listeners={listeners}
        onClick={context?.handleTaskClick}
        onEdit={context?.handleTaskEdit}
        isMobile={isMobile}
        isCardSwiped={isCardSwiped}
        onSwipe={onSwipe}
      />
    </div>
  );
};

// Task Card Component
interface TaskCardProps {
  task: Task; 
  isDragging?: boolean;
  attributes?: any;
  listeners?: any;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task, e: React.MouseEvent) => void;
  isMobile?: boolean;
  isCardSwiped?: boolean;
  onSwipe?: (taskId: string, direction: 'left' | 'right') => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  isDragging = false, 
  attributes, 
  listeners, 
  onClick, 
  onEdit,
  isMobile = false,
  isCardSwiped = false,
  onSwipe
}) => {
  const context = React.useContext(TaskBoardContext);
  const cardRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !onSwipe) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !onSwipe || touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    // Update swipe offset for visual feedback
    const distance = touchStart - currentTouch;
    if (Math.abs(distance) > 20) {
      setSwipeOffset(-distance);
    }
  };

  const onTouchEnd = () => {
    if (!isMobile || !onSwipe || !touchStart || !touchEnd) {
      setSwipeOffset(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      onSwipe(task.id, 'left');
    } else if (isRightSwipe) {
      onSwipe(task.id, 'right');
    }
    
    setSwipeOffset(0);
  };
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
    <div 
      ref={cardRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Prevent click when dragging or swiped
        if (isDragging || isCardSwiped) return;
        onClick?.(task);
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: swipeOffset === 0 ? 'transform 0.3s ease' : 'none'
      }}
      className={`relative bg-white rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-200 ${isMobile ? '' : 'cursor-grab active:cursor-grabbing'} group select-none ${priorityStyles.border} ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}`}>
      
      {/* Swipe Actions - Mobile Only */}
      {isMobile && isCardSwiped && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center bg-red-500 rounded-r-lg px-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle delete
              if (context?.handleTaskDelete) {
                context.handleTaskDelete(task);
              }
            }}
            className="text-white"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          {!isMobile && <GripVertical className="w-4 h-4 text-gray-400 mt-1" />}
          <h4 className="text-gray-900 font-medium text-sm flex-1 line-clamp-2">{task.title}</h4>
        </div>
        <div className="flex items-center space-x-1">
          {!isMobile && (
            <button
              onClick={(e) => onEdit?.(task, e)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
              title="Edit task"
            >
              <Edit2 size={14} className="text-gray-500" />
            </button>
          )}
          <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium ${priorityStyles.badge}`}>
            {isMobile ? task.priority.charAt(0).toUpperCase() : task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
      </div>
      
      <p className={`text-gray-600 text-xs md:text-sm mb-3 ${isMobile ? '' : 'pl-6'} select-none line-clamp-2`}>{task.description}</p>
      
      <div className={`flex items-center justify-between ${isMobile ? '' : 'pl-6'}`}>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 text-xs hidden sm:inline">Complexity:</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 ${getComplexityColor(task.complexity)} rounded-full`}></div>
            <span className="text-gray-600 text-xs font-medium">{task.complexity}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-5 h-5 md:w-6 md:h-6 ${task.assignee.color} rounded-full flex items-center justify-center`}>
            <span className="text-white text-xs font-medium">{task.assignee.initials}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {task.progress !== undefined && (
        <div className={`mt-3 flex items-center justify-between ${isMobile ? '' : 'pl-6'}`}>
          <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
            <div 
              className="bg-blue-600 h-1.5 md:h-2 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <span className="text-gray-500 text-xs ml-2">{task.progress}%</span>
        </div>
      )}

      {/* Mobile Action Buttons */}
      {isMobile && (
        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(task, e);
            }}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // More options can be added here
            }}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// Track last update for real-time indication
let lastUpdate: string | null = null;

export default TaskBoard;