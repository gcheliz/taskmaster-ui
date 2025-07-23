import React, { useState } from 'react';
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
  User
} from 'lucide-react';

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
}

const TaskBoard: React.FC = () => {
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Setup React Router',
      description: 'Add navigation between different views',
      priority: 'high',
      complexity: 5,
      assignee: { name: 'Gonzalo', initials: 'GZ', color: 'bg-blue-600' },
      column: 'todo'
    },
    {
      id: '2',
      title: 'Create Task Board UI',
      description: 'Design and implement the task board interface',
      priority: 'medium',
      complexity: 7,
      assignee: { name: 'Alex M', initials: 'AM', color: 'bg-green-600' },
      column: 'todo'
    },
    {
      id: '3',
      title: 'Add drag and drop',
      description: 'Implement drag and drop functionality',
      priority: 'medium',
      complexity: 6,
      assignee: { name: 'John S', initials: 'JS', color: 'bg-purple-600' },
      column: 'todo'
    },
    {
      id: '4',
      title: 'Fix navigation links',
      description: 'Make sidebar navigation functional',
      priority: 'high',
      complexity: 4,
      assignee: { name: 'Gonzalo', initials: 'GZ', color: 'bg-blue-600' },
      column: 'in-progress',
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
      progress: 100
    }
  ]);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-600' },
    { id: 'review', title: 'Review', color: 'bg-purple-600' },
    { id: 'testing', title: 'Testing', color: 'bg-amber-600' },
    { id: 'done', title: 'Done', color: 'bg-green-600' }
  ];

  const getTasksByColumn = (columnId: string) => {
    return tasks.filter(task => task.column === columnId);
  };

  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(t => t.column !== 'done').length;
  const completedTasks = tasks.filter(t => t.column === 'done').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Task Board</h1>
        <p className="text-gray-600 mt-1">Manage your tasks with a Kanban-style board</p>
      </div>

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
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex space-x-6 pb-6" style={{ minWidth: '1200px' }}>
          {columns.map(column => (
            <div key={column.id} className="flex-shrink-0 w-80">
              {/* Column Header */}
              <div className="bg-gray-100 rounded-t-lg p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${column.color} rounded-full`}></div>
                    <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                      {getTasksByColumn(column.id).length}
                    </span>
                    <button className="text-gray-500 hover:text-gray-700 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Column Content */}
              <div className="bg-gray-50 rounded-b-lg p-4 space-y-3 min-h-[400px]">
                {getTasksByColumn(column.id).map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                
                {/* Empty State */}
                {getTasksByColumn(column.id).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No tasks in this column</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
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
    <div className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab hover:-translate-y-0.5 ${priorityStyles.border}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-gray-900 font-medium text-sm flex-1 pr-2">{task.title}</h4>
        <div className="flex items-center space-x-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyles.badge}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
      
      <div className="flex items-center justify-between">
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
        <div className="mt-3 flex items-center justify-between">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <span className="text-gray-500 text-xs ml-2">{task.progress}%</span>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;