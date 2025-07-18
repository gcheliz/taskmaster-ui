import React from 'react';

export const SimpleTaskBoardView: React.FC = () => {
  return (
    <div className="task-board-view">
      <div className="view-header">
        <h1>📋 Task Board</h1>
        <p>Manage your tasks with a Kanban-style board</p>
      </div>
      
      <div className="view-content">
        <div className="board-container">
          <div className="task-column">
            <div className="column-header">
              <h3>📝 To Do</h3>
              <span className="task-count">3</span>
            </div>
            <div className="task-list">
              <div className="task-card">
                <h4>Setup React Router</h4>
                <p>Add navigation between different views</p>
                <div className="task-meta">
                  <span className="priority high">High</span>
                  <span className="complexity">● 5</span>
                </div>
              </div>
              <div className="task-card">
                <h4>Create Task Board UI</h4>
                <p>Design and implement the task board interface</p>
                <div className="task-meta">
                  <span className="priority medium">Medium</span>
                  <span className="complexity">● 7</span>
                </div>
              </div>
              <div className="task-card">
                <h4>Add drag and drop</h4>
                <p>Implement drag and drop functionality</p>
                <div className="task-meta">
                  <span className="priority medium">Medium</span>
                  <span className="complexity">● 6</span>
                </div>
              </div>
            </div>
          </div>

          <div className="task-column">
            <div className="column-header">
              <h3>🔄 In Progress</h3>
              <span className="task-count">2</span>
            </div>
            <div className="task-list">
              <div className="task-card">
                <h4>Fix navigation links</h4>
                <p>Make sidebar navigation functional</p>
                <div className="task-meta">
                  <span className="priority high">High</span>
                  <span className="complexity">● 4</span>
                </div>
              </div>
              <div className="task-card">
                <h4>Add Repository Integration</h4>
                <p>Connect to Git repositories</p>
                <div className="task-meta">
                  <span className="priority medium">Medium</span>
                  <span className="complexity">● 8</span>
                </div>
              </div>
            </div>
          </div>

          <div className="task-column">
            <div className="column-header">
              <h3>✅ Done</h3>
              <span className="task-count">4</span>
            </div>
            <div className="task-list">
              <div className="task-card completed">
                <h4>Setup Project Structure</h4>
                <p>Initialize monorepo with frontend and backend</p>
                <div className="task-meta">
                  <span className="priority high">High</span>
                  <span className="complexity">● 6</span>
                </div>
              </div>
              <div className="task-card completed">
                <h4>Configure Docker</h4>
                <p>Setup Docker development environment</p>
                <div className="task-meta">
                  <span className="priority high">High</span>
                  <span className="complexity">● 5</span>
                </div>
              </div>
              <div className="task-card completed">
                <h4>Create UI Components</h4>
                <p>Build reusable UI components</p>
                <div className="task-meta">
                  <span className="priority medium">Medium</span>
                  <span className="complexity">● 7</span>
                </div>
              </div>
              <div className="task-card completed">
                <h4>Setup Security</h4>
                <p>Implement security best practices</p>
                <div className="task-meta">
                  <span className="priority high">High</span>
                  <span className="complexity">● 8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleTaskBoardView;