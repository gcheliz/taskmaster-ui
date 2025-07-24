import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TaskListSkeleton } from '../components/ui/loading';
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
import { TaskModal, type TaskModalMode } from '../components/TaskBoard/TaskModal';
import type { Task as LocalTask } from '../types/task';
import { PageHeader } from '../components/Layout';

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
  status?: string;
  column: string;
  position: number;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
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


// Get the board context for task interactions
const TaskBoardContext = React.createContext<{
  handleTaskClick: (task: Task) => void;
  handleTaskEdit: (task: Task, e: React.MouseEvent) => void;
  isDraggingRef: React.MutableRefObject<boolean>;
} | null>(null);

const TaskBoard: React.FC = () => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [loading, setLoading] = useState(true);
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

  // Local state management
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const baseColumns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-600' },
    { id: 'review', title: 'Review', color: 'bg-purple-600' },
    { id: 'testing', title: 'Testing', color: 'bg-amber-600' },
    { id: 'done', title: 'Done', color: 'bg-green-600' }
  ];

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
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        }
        case 'complexity':
          compareValue = a.complexity - b.complexity;
          break;
        case 'assignee': {
          const aName = a.assignee?.name || '';
          const bName = b.assignee?.name || '';
          compareValue = aName.localeCompare(bName);
          break;
        }
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

  // Compute columns with filtered and sorted tasks
  const columns: Column[] = baseColumns.map(column => {
    const columnTasks = tasks.filter(task => task.column === column.id);
    const filteredAndSorted = getFilteredAndSortedTasks(columnTasks);
    
    return {
      ...column,
      tasks: filteredAndSorted
    };
  });

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
    // Visual feedback is handled by DragOverlay
    // Actual updates happen via WebSocket in handleDragEnd
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
      // Task moved to different column
      const taskId = active.id as string;
      const newPosition = overIndex >= 0 ? overIndex : overColumn.tasks.length;
      
      // Update local state
      setTasks(prevTasks => {
        return prevTasks.map(task => {
          if (task.id === taskId) {
            return { ...task, column: overColumn.id, position: newPosition };
          }
          return task;
        });
      });
    } else if (activeIndex !== overIndex) {
      // Task reordered within same column
      const taskId = active.id as string;
      const newPosition = overIndex;
      
      // Update local state
      setTasks(prevTasks => {
        const newTasks = [...prevTasks];
        const columnTasks = newTasks.filter(t => t.column === activeColumn.id);
        const sortedTasks = arrayMove(columnTasks, activeIndex, newPosition);
        
        // Update positions
        sortedTasks.forEach((task, index) => {
          const originalTask = newTasks.find(t => t.id === task.id);
          if (originalTask) {
            originalTask.position = index;
          }
        });
        
        return newTasks;
      });
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
    if (modalMode === 'create') {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskData.title || 'New Task',
        description: taskData.description || '',
        priority: (taskData.priority || 'medium') as Task['priority'],
        complexity: 5,
        assignee: taskData.assignedTo ? {
          name: taskData.assignedTo,
          initials: taskData.assignedTo.split(' ').map(n => n[0]).join('').toUpperCase(),
          color: 'bg-' + ['blue', 'green', 'purple', 'amber', 'red'][Math.floor(Math.random() * 5)] + '-600',
        } : {
          name: 'Unassigned',
          initials: 'NA',
          color: 'bg-gray-400'
        },
        column: taskData.status === 'pending' ? 'todo' : taskData.status === 'in-progress' ? 'in-progress' : 'done',
        position: 0, // Position will be managed by drag and drop
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add new task to state
      setTasks(prevTasks => [...prevTasks, newTask]);
    } else if (modalMode === 'edit' && selectedTask) {
      // Update existing task
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === selectedTask.id.toString()) {
          return {
            ...task,
            title: taskData.title || task.title,
            description: taskData.description || task.description,
            priority: (taskData.priority || task.priority) as Task['priority'],
            assignee: taskData.assignedTo ? {
              name: taskData.assignedTo,
              initials: taskData.assignedTo.split(' ').map(n => n[0]).join('').toUpperCase(),
              color: task.assignee?.color || 'bg-gray-400'
            } : task.assignee,
            updatedAt: new Date().toISOString()
          };
        }
        return task;
      }));
    }
    setIsModalOpen(false);
  };

  // Handle task delete from modal
  const handleTaskDelete = async (taskId: number) => {
    // Remove task from state
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId.toString()));
    setIsModalOpen(false);
  };

  // Close dropdowns when clicking outside
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


  // Simulate loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader 
          title="Task Board" 
          subtitle="Loading tasks..."
        />
        <div className="bg-white p-4 sm:p-6 md:p-8">
          <div className="max-w-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="w-32 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex space-x-6 overflow-x-auto scrollbar-thin">
              {[1, 2, 3, 4, 5].map((col) => (
                <div key={col} className="flex-shrink-0 w-80">
                  <div className="bg-gray-100 rounded-t-lg p-4 border-b border-gray-200">
                    <div className="w-32 h-6 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  <div className="bg-gray-50 rounded-b-lg p-4 min-h-[200px] space-y-3">
                    <TaskListSkeleton count={3} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader 
        title="Task Board" 
        subtitle="Drag and drop tasks between columns to update their status"
      />
      <div className="bg-white p-4 sm:p-6 md:p-8">
        <div className="max-w-full space-y-6">


      {/* Board Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-3 py-1.5 ${activeFiltersCount > 0 ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700'} rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-1`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilterMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Filters</h3>
                    <button
                      onClick={() => setFilters({ priorities: [], assignees: [], columns: [] })}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Clear all
                    </button>
                  </div>
                  
                  {/* Priority Filter */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                    <div className="space-y-1">
                      {['high', 'medium', 'low'].map(priority => (
                        <label key={priority} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={filters.priorities.includes(priority)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({ ...prev, priorities: [...prev.priorities, priority] }));
                              } else {
                                setFilters(prev => ({ ...prev, priorities: prev.priorities.filter(p => p !== priority) }));
                              }
                            }}
                            className="mr-2 rounded text-blue-600"
                          />
                          <span className="text-sm text-gray-700 capitalize">{priority}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Assignee Filter */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Assignee</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                      {getUniqueAssignees().map(assignee => (
                        <label key={assignee} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={filters.assignees.includes(assignee)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({ ...prev, assignees: [...prev.assignees, assignee] }));
                              } else {
                                setFilters(prev => ({ ...prev, assignees: prev.assignees.filter(a => a !== assignee) }));
                              }
                            }}
                            className="mr-2 rounded text-blue-600"
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

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-1"
            >
              <ArrowUpDown className="w-4 h-4" />
              Sort
              <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showSortMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  {[
                    { value: 'priority', label: 'Priority' },
                    { value: 'complexity', label: 'Complexity' },
                    { value: 'assignee', label: 'Assignee' },
                    { value: 'created', label: 'Date Created' },
                    { value: 'updated', label: 'Last Updated' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (sortBy === option.value) {
                          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy(option.value as SortOption);
                          setSortDirection('desc');
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between"
                    >
                      <span>{option.label}</span>
                      {sortBy === option.value && (
                        <span className="text-blue-600">
                          {sortDirection === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

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
          <button 
            onClick={handleAddTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Active Filters Message */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <div className="flex items-center space-x-2 text-sm">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-blue-900">
              Showing {totalTasks} of {allTasks} tasks
              {filteredOutCount > 0 && ` (${filteredOutCount} hidden by filters)`}
            </span>
            <div className="flex items-center space-x-2 ml-4">
              {filters.priorities.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                  Priority: {filters.priorities.join(', ')}
                </span>
              )}
              {filters.assignees.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                  Assignee: {filters.assignees.join(', ')}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setFilters({ priorities: [], assignees: [], columns: [] })}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear filters
          </button>
        </div>
      )}

      {/* Kanban Board */}
      <TaskBoardContext.Provider value={{ handleTaskClick, handleTaskEdit, isDraggingRef }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto scrollbar-thin">
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
      </TaskBoardContext.Provider>
      
      {/* Task Modal */}
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
        </div>
      </div>
    </>
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
      />
    </div>
  );
};

// Task Card Component
const TaskCard: React.FC<{ 
  task: Task; 
  isDragging?: boolean;
  attributes?: any;
  listeners?: any;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task, e: React.MouseEvent) => void;
}> = ({ task, isDragging = false, attributes, listeners, onClick, onEdit }) => {
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
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Prevent click when dragging
        if (isDragging) return;
        onClick?.(task);
      }}
      className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-[box-shadow] duration-200 cursor-grab active:cursor-grabbing group select-none ${priorityStyles.border} ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          <GripVertical className="w-4 h-4 text-gray-400 mt-1" />
          <h4 className="text-gray-900 font-medium text-sm flex-1">{task.title}</h4>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => onEdit?.(task, e)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
            title="Edit task"
          >
            <Edit2 size={14} className="text-gray-500" />
          </button>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyles.badge}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-3 pl-6 select-none">{task.description}</p>
      
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
              className="bg-blue-600 h-2 rounded-full transition-[width] duration-300"
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