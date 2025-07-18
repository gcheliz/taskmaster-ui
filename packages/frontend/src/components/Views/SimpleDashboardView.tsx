import React, { useState } from 'react';

export const SimpleDashboardView: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h1>Welcome to TaskMaster UI</h1>
        <p>Your comprehensive task management dashboard</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="card">
            <h2>📊 Dashboard Overview</h2>
            <p>
              This is the main dashboard where you can manage your tasks and
              repositories.
            </p>

            <div className="demo-section">
              <h3>Demo Counter</h3>
              <button
                onClick={() => setCount(count => count + 1)}
                className="demo-button"
              >
                Count is {count}
              </button>
              <p>This demonstrates React state management and routing.</p>
            </div>
          </div>

          <div className="card">
            <h2>📈 Quick Stats</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <h4>Active Tasks</h4>
                <span className="stat-number">12</span>
              </div>
              <div className="stat-item">
                <h4>Repositories</h4>
                <span className="stat-number">3</span>
              </div>
              <div className="stat-item">
                <h4>Completed Today</h4>
                <span className="stat-number">5</span>
              </div>
              <div className="stat-item">
                <h4>In Progress</h4>
                <span className="stat-number">7</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>🚀 Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-time">2 minutes ago</span>
                <span className="activity-desc">
                  Task "Fix navigation" completed
                </span>
              </div>
              <div className="activity-item">
                <span className="activity-time">15 minutes ago</span>
                <span className="activity-desc">
                  Repository "taskmaster-ui" updated
                </span>
              </div>
              <div className="activity-item">
                <span className="activity-time">1 hour ago</span>
                <span className="activity-desc">
                  New task "Add routing" created
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>🎯 Project Health</h2>
            <div className="health-indicators">
              <div className="health-item">
                <span className="health-label">Overall Health</span>
                <div className="health-bar">
                  <div
                    className="health-fill"
                    style={{ width: '85%', backgroundColor: '#22c55e' }}
                  ></div>
                </div>
                <span className="health-score">85%</span>
              </div>
              <div className="health-item">
                <span className="health-label">Task Completion</span>
                <div className="health-bar">
                  <div
                    className="health-fill"
                    style={{ width: '72%', backgroundColor: '#3b82f6' }}
                  ></div>
                </div>
                <span className="health-score">72%</span>
              </div>
              <div className="health-item">
                <span className="health-label">Code Quality</span>
                <div className="health-bar">
                  <div
                    className="health-fill"
                    style={{ width: '91%', backgroundColor: '#10b981' }}
                  ></div>
                </div>
                <span className="health-score">91%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboardView;
