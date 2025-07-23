import React from 'react';
import { 
  GitBranch, 
  GitCommit, 
  GitPullRequest,
  GitMerge,
  Plus,
  RefreshCw,
  Activity,
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  MoreVertical,
  ArrowRight,
  Code2,
  Folder,
  ArrowUpRight
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
  language: string;
}

const Repository: React.FC = () => {
  const repositories: Repository[] = [
    {
      id: '1',
      name: 'taskmaster-ui',
      description: 'Main project repository with React frontend',
      path: '/Users/gonzalo/workspace/taskmaster-ui',
      status: 'active',
      commits: 156,
      branches: 5,
      lastActivity: '2 hours ago',
      currentBranch: 'main',
      language: 'TypeScript'
    },
    {
      id: '2',
      name: 'taskmaster-backend',
      description: 'API and backend services',
      path: '/Users/gonzalo/workspace/taskmaster-backend',
      status: 'active',
      commits: 89,
      branches: 3,
      lastActivity: '1 day ago',
      currentBranch: 'develop',
      language: 'Go'
    },
    {
      id: '3',
      name: 'taskmaster-cli',
      description: 'Command line interface tools',
      path: '/Users/gonzalo/workspace/taskmaster-cli',
      status: 'inactive',
      commits: 45,
      branches: 2,
      lastActivity: '3 days ago',
      currentBranch: 'main',
      language: 'Python'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Repository Management</h1>
        <p className="text-gray-600 mt-1">Connect and manage your Git repositories</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Repositories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Folder className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">8 synced</span>
            <span className="text-gray-500 ml-1">today</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Commits</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">342</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <GitCommit className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+28</span>
            <span className="text-gray-500 ml-1">this week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-amber-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Open PRs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">7</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <GitPullRequest className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-amber-600 font-medium">3 pending</span>
            <span className="text-gray-500 ml-1">review</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Branches</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">24</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-purple-600 font-medium">5 feature</span>
            <span className="text-gray-500 ml-1">branches</span>
          </div>
        </div>
      </div>

      {/* Repository List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Connected Repositories</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Repository
          </button>
        </div>
        <div className="space-y-4">
          {repositories.map((repo) => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))}
        </div>
      </div>

      {/* Quick Actions and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickAction
              icon={<RefreshCw className="w-4 h-4 text-blue-600" />}
              iconBg="bg-blue-100"
              label="Pull Latest"
              description="Sync all repositories"
            />
            <QuickAction
              icon={<GitBranch className="w-4 h-4 text-green-600" />}
              iconBg="bg-green-100"
              label="Switch Branch"
              description="Change active branch"
            />
            <QuickAction
              icon={<GitMerge className="w-4 h-4 text-amber-600" />}
              iconBg="bg-amber-100"
              label="Merge PR"
              description="Review and merge"
            />
            <QuickAction
              icon={<Activity className="w-4 h-4 text-purple-600" />}
              iconBg="bg-purple-100"
              label="View Activity"
              description="Recent commits"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors flex items-center gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            <ActivityItem
              icon={<GitCommit className="w-4 h-4 text-green-600" />}
              iconBg="bg-green-100"
              title="feat: Add task board component"
              subtitle="taskmaster-ui • main"
              time="2 hours ago"
            />
            <ActivityItem
              icon={<GitPullRequest className="w-4 h-4 text-blue-600" />}
              iconBg="bg-blue-100"
              title="PR #42: Update dependencies"
              subtitle="taskmaster-backend • ready for review"
              time="5 hours ago"
            />
            <ActivityItem
              icon={<GitMerge className="w-4 h-4 text-purple-600" />}
              iconBg="bg-purple-100"
              title="Merged PR #41: Fix authentication"
              subtitle="taskmaster-backend • main"
              time="1 day ago"
            />
            <ActivityItem
              icon={<GitBranch className="w-4 h-4 text-amber-600" />}
              iconBg="bg-amber-100"
              title="Created branch: feature/notifications"
              subtitle="taskmaster-ui • from main"
              time="2 days ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Repository Card Component
const RepositoryCard: React.FC<{ repo: Repository }> = ({ repo }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{repo.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              repo.status === 'active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {repo.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{repo.description}</p>
          <p className="text-xs text-gray-500 font-mono mb-3">{repo.path}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Code2 className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{repo.language}</span>
            </span>
            <span className="flex items-center gap-1">
              <GitBranch className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{repo.branches} branches</span>
            </span>
            <span className="flex items-center gap-1">
              <GitCommit className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{repo.commits} commits</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{repo.lastActivity}</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick Action Component
const QuickAction: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description: string;
}> = ({ icon, iconBg, label, description }) => {
  return (
    <button className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-left">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
    </button>
  );
};

// Activity Item Component
const ActivityItem: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  time: string;
}> = ({ icon, iconBg, title, subtitle, time }) => {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
};

export default Repository;