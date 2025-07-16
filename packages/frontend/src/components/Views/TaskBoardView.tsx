import React from 'react';
import './TaskBoardView.css';

export interface TaskBoardViewProps {
  className?: string;
}

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`task-board-view ${className}`.trim()}>
      <div className="view-header">
        <h1>Task Board</h1>
        <p className="view-description">
          Organize and track your tasks with a visual Kanban-style board interface.
        </p>
      </div>
      
      <div className="view-content">
        <div className="placeholder-message">
          <h2>Coming Soon</h2>
          <p>Task board features will be implemented here.</p>
          <ul className="feature-list">
            <li>Kanban-style task organization</li>
            <li>Drag-and-drop task management</li>
            <li>Task status tracking</li>
            <li>Repository-linked task updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};