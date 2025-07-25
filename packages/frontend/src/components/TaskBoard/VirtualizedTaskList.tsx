import React from 'react';
import type { Task } from '../../types/task';
import { TaskCard } from './TaskCard';
import { VirtualizedList } from '../common/VirtualizedList';
import { useRenderTime } from '../Performance/WebVitals';

interface VirtualizedTaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  height?: number | string;
  itemHeight?: number;
  className?: string;
}

export const VirtualizedTaskList: React.FC<VirtualizedTaskListProps> = ({
  tasks,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
  height = '600px',
  itemHeight = 120,
  className,
}) => {
  useRenderTime('VirtualizedTaskList');

  const renderTask = (task: Task) => (
    <div className="px-4 py-2">
      <TaskCard
        task={task}
        onClick={() => onTaskClick?.(task)}
        onUpdate={onTaskUpdate}
        onDelete={() => onTaskDelete?.(task.id)}
      />
    </div>
  );

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <VirtualizedList
      items={tasks}
      height={height}
      itemHeight={itemHeight}
      renderItem={renderTask}
      className={className}
      gap={8}
      overscan={3}
    />
  );
};

// Table view with virtualization
export const VirtualizedTaskTable: React.FC<VirtualizedTaskListProps> = ({
  tasks,
  onTaskClick,
  height = '600px',
  className,
}) => {
  useRenderTime('VirtualizedTaskTable');

  const renderRow = (task: Task) => (
    <tr
      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onTaskClick?.(task)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{task.title}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs rounded-full
          ${task.priority === 'high' ? 'bg-red-100 text-red-800' : ''}
          ${task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${task.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
        `}>
          {task.priority}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs rounded-full
          ${task.status === 'done' ? 'bg-green-100 text-green-800' : ''}
          ${task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
          ${task.status === 'pending' ? 'bg-gray-100 text-gray-800' : ''}
        `}>
          {task.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(task.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );

  return (
    <div className={className}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
          </tr>
        </thead>
      </table>
      <VirtualizedList
        items={tasks}
        height={height}
        itemHeight={65}
        renderItem={(task) => (
          <table className="min-w-full">
            <tbody>
              {renderRow(task)}
            </tbody>
          </table>
        )}
        overscan={10}
      />
    </div>
  );
};