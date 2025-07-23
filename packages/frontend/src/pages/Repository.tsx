import React from 'react';
import { 
  GitBranch, 
  GitCommit, 
  GitPullRequest,
  Plus,
  RefreshCw,
  Activity,
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  MoreVertical
} from 'lucide-react';

interface Repository {
  id: string;
  name: string;
  description: string;
  path: string;
  status: 'active' | 'inactive' | 'error';
  commits: number;
  branches: number;
  lastActivity: string;
  currentBranch: string;
}

const Repository: React.FC = () => {
  const repositories: Repository[] = [
    {
      id: '1',
      name: 'taskmaster-ui',
      description: 'Main project repository',
      path: '/Users/gonzalo/workspace/taskmaster-ui',
      status: 'active',
      commits: 15,
      branches: 3,
      lastActivity: '2 minutes ago',
      currentBranch: 'main'
    },
    {
      id: '2',
      name: 'taskmaster-cli',
      description: 'Command line interface',
      path: '/Users/gonzalo/workspace/taskmaster-cli',
      status: 'inactive',
      commits: 8,
      branches: 2,
      lastActivity: '3 hours ago',
      currentBranch: 'develop'
    },
    {
      id: '3',
      name: 'taskmaster-backend',
      description: 'Backend API service',
      path: '/Users/gonzalo/workspace/taskmaster-backend',
      status: 'active',
      commits: 42,
      branches: 5,
      lastActivity: '15 minutes ago',
      currentBranch: 'feature/auth'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Repository Management</h1>
          <p className="text-slate-400 mt-2">Connect and manage your Git repositories</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn btn-secondary flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh All</span>
          </button>
          <button className="btn btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Repository</span>
          </button>
        </div>
      </div>

      {/* Repository Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {repositories.map((repo) => (
          <RepositoryCard key={repo.id} repo={repo} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            icon={<GitPullRequest className="w-5 h-5" />}
            label="Pull Latest"
            color="primary"
          />
          <QuickAction
            icon={<GitBranch className="w-5 h-5" />}
            label="Switch Branch"
            color="success"
          />
          <QuickAction
            icon={<Activity className="w-5 h-5" />}
            label="View Status"
            color="warning"
          />
          <QuickAction
            icon={<GitCommit className="w-5 h-5" />}
            label="Commit Changes"
            color="error"
          />
        </div>
      </div>
    </div>
  );
};

// Repository Card Component
const RepositoryCard: React.FC<{ repo: Repository }> = ({ repo }) => {
  const getStatusIcon = () => {
    switch (repo.status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-accent-success" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-slate-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-accent-error" />;
    }
  };

  const getStatusColor = () => {
    switch (repo.status) {
      case 'active':
        return 'text-accent-success';
      case 'inactive':
        return 'text-slate-400';
      case 'error':
        return 'text-accent-error';
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
              <FolderGit2 className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{repo.name}</h3>
              <p className="text-sm text-slate-400">{repo.description}</p>
            </div>
          </div>
          <button className="p-1 text-slate-400 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Path */}
        <div className="bg-slate-900 rounded-lg p-3">
          <p className="text-xs text-slate-400 font-mono truncate">{repo.path}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{repo.commits}</p>
            <p className="text-xs text-slate-400">Commits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{repo.branches}</p>
            <p className="text-xs text-slate-400">Branches</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              {getStatusIcon()}
              <p className={`text-sm font-medium capitalize ${getStatusColor()}`}>
                {repo.status}
              </p>
            </div>
            <p className="text-xs text-slate-400">Status</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">{repo.currentBranch}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{repo.lastActivity}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button className="flex-1 btn btn-secondary btn-sm">
            View Details
          </button>
          <button className="p-2 text-slate-400 hover:text-white">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick Action Component
const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  color: 'primary' | 'success' | 'warning' | 'error';
}> = ({ icon, label, color }) => {
  const colorClasses = {
    primary: 'bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20',
    success: 'bg-accent-success/10 text-accent-success hover:bg-accent-success/20',
    warning: 'bg-accent-warning/10 text-accent-warning hover:bg-accent-warning/20',
    error: 'bg-accent-error/10 text-accent-error hover:bg-accent-error/20',
  };

  return (
    <button className={`
      ${colorClasses[color]}
      p-4 rounded-lg flex flex-col items-center justify-center space-y-2
      transition-all duration-200 hover:scale-105
    `}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default Repository;