import React from 'react'
import { 
  GitBranch, 
  Star, 
  GitFork, 
  Clock, 
  Plus,
  Search,
  Filter,
  MoreVertical,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Repository {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  lastUpdated: string;
  status: 'active' | 'idle' | 'archived';
  branches: number;
  issues: number;
  pullRequests: number;
}

const repositories: Repository[] = [
  {
    id: '1',
    name: 'taskmaster-ui',
    description: 'Modern task management system with real-time collaboration',
    language: 'TypeScript',
    stars: 342,
    forks: 45,
    lastUpdated: '2 hours ago',
    status: 'active',
    branches: 5,
    issues: 12,
    pullRequests: 3
  },
  {
    id: '2',
    name: 'api-gateway',
    description: 'Microservices API gateway with authentication and rate limiting',
    language: 'Go',
    stars: 128,
    forks: 23,
    lastUpdated: '5 days ago',
    status: 'active',
    branches: 3,
    issues: 5,
    pullRequests: 1
  },
  {
    id: '3',
    name: 'data-pipeline',
    description: 'ETL pipeline for processing and analyzing large datasets',
    language: 'Python',
    stars: 89,
    forks: 15,
    lastUpdated: '1 week ago',
    status: 'idle',
    branches: 2,
    issues: 8,
    pullRequests: 0
  },
  {
    id: '4',
    name: 'mobile-app',
    description: 'Cross-platform mobile application for TaskMaster',
    language: 'React Native',
    stars: 56,
    forks: 10,
    lastUpdated: '2 weeks ago',
    status: 'archived',
    branches: 1,
    issues: 15,
    pullRequests: 0
  }
];

const Repositories = () => {
  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'TypeScript': 'bg-blue-400',
      'JavaScript': 'bg-yellow-400',
      'Python': 'bg-green-400',
      'Go': 'bg-cyan-400',
      'React Native': 'bg-purple-400',
      'Java': 'bg-orange-400',
      'Ruby': 'bg-red-400'
    };
    return colors[language] || 'bg-gray-400';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'idle':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'archived':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Repositories</h1>
          <p className="text-gray-500 mt-2">Manage your Git repositories and integrations</p>
        </div>
        
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Repository</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search repositories..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        
        <button className="btn btn-secondary flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Repository Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {repositories.map((repo) => (
          <div key={repo.id} className="stat-card hover-lift">
            {/* Repository Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="icon-container icon-container-primary">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">{repo.name}</h3>
                    {getStatusIcon(repo.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                </div>
              </div>
              <button className="icon-btn">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Repository Stats */}
            <div className="flex items-center space-x-6 mb-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`} />
                <span className="text-gray-700">{repo.language}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Star className="w-4 h-4" />
                <span>{repo.stars}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <GitFork className="w-4 h-4" />
                <span>{repo.forks}</span>
              </div>
            </div>

            {/* Activity Indicators */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 text-gray-700">
                  <GitBranch className="w-4 h-4" />
                  <span className="font-semibold">{repo.branches}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Branches</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 text-gray-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold">{repo.issues}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Issues</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 text-gray-700">
                  <GitPullRequest className="w-4 h-4" />
                  <span className="font-semibold">{repo.pullRequests}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">PRs</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Updated {repo.lastUpdated}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                  View Details
                </button>
                <button className="text-sm text-accent-primary hover:text-blue-700 font-medium">
                  Open in GitHub
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Repositories