import React, { useState } from 'react';
import { 
  Plus, 
  Filter, 
  ArrowUpDown,
  LayoutGrid,
  MoreVertical,
  Calendar,
  User,
  Tag,
  Clock
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  complexity: number;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const TaskBoard: React.FC = () => {
  const [columns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        {
          id: '1',
          title: 'Setup React Router',
          description: 'Add navigation between different views',
          priority: 'high',
          complexity: 5,
          assignee: 'GZ',
          tags: ['frontend', 'routing']
        },
        {
          id: '2',
          title: 'Create Task Board UI',
          description: 'Design and implement the task board interface',
          priority: 'medium',
          complexity: 7,
          tags: ['frontend', 'ui']
        },
        {
          id: '3',
          title: 'Add drag and drop',
          description: 'Implement drag and drop functionality',
          priority: 'medium',
          complexity: 6,
          tags: ['frontend', 'feature']
        }
      ]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        {
          id: '4',
          title: 'Fix navigation links',
          description: 'Make sidebar navigation functional',
          priority: 'high',
          complexity: 4,
          assignee: 'GZ',
          dueDate: '2025-07-25',
          tags: ['bug', 'frontend']
        },
        {
          id: '5',
          title: 'Add Repository Integration',
          description: 'Connect to Git repositories',
          priority: 'medium',
          complexity: 8,
          tags: ['backend', 'integration']
        }
      ]
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        {
          id: '6',
          title: 'Setup Project Structure',
          description: 'Initialize monorepo with frontend and backend',
          priority: 'high',
          complexity: 6,
          assignee: 'GZ',
          tags: ['setup']
        },
        {
          id: '7',
          title: 'Configure Docker',
          description: 'Setup Docker development environment',
          priority: 'high',
          complexity: 5,
          tags: ['devops', 'docker']
        }
      ]
    }
  ]);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
          <p className="text-gray-500 mt-2">Manage your tasks with a Kanban-style board</p>
        </div>
        
        {/* Board Controls */}
        <div className="flex items-center space-x-3">
          <button className="btn btn-secondary flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="btn btn-secondary flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4" />
            <span>Sort</span>
          </button>
          <button className="btn btn-secondary flex items-center space-x-2">
            <LayoutGrid className="w-4 h-4" />
            <span>View</span>
          </button>
          <button className="btn btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="bg-white border border-gray-200 rounded-xl shadow-sm">
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">{column.title}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {column.tasks.length}
                  </span>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-700">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-4 space-y-3">
              {column.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              
              {/* Add Task Button */}
              <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-all duration-200 flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'border-l-gray-400';
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg border border-gray-200 ${getPriorityColor(task.priority)} hover:shadow-md transition-all duration-200 cursor-pointer`}>
      <div className="space-y-3">
        {/* Title */}
        <h4 className="text-gray-900 font-medium">{task.title}</h4>
        
        {/* Description */}
        <p className="text-gray-600 text-sm">{task.description}</p>
        
        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center space-x-1 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}
        
        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            {/* Assignee */}
            {task.assignee && (
              <div className="flex items-center space-x-1 text-gray-500">
                <User className="w-3 h-3" />
                <span>{task.assignee}</span>
              </div>
            )}
            
            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center space-x-1 text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{task.dueDate}</span>
              </div>
            )}
          </div>
          
          {/* Complexity */}
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-gray-500 font-medium">{task.complexity}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBoard;