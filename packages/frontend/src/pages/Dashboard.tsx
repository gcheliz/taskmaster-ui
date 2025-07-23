import React from 'react';
import { 
  ClipboardList, 
  GitBranch, 
  Users, 
  TrendingUp,
  Check,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Code2,
  BarChart3,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Minimalist Header */}
      <div className="border-b border-gray-100 pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, Gonzalo</p>
          </div>
          <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Quick Action
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">15</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+2</span>
            <span className="text-gray-500 ml-1">from yesterday</span>
          </div>
        </div>

        {/* Repositories */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Repositories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">3 active</span>
            <span className="text-gray-500 ml-1">deployments</span>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-amber-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">2 online</span>
            <span className="text-gray-500 ml-1">right now</span>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Performance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">92%</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+5%</span>
            <span className="text-gray-500 ml-1">from last week</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
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
              icon={<Check className="w-4 h-4 text-green-600" />}
              iconBg="bg-green-100"
              title='Task "Fix navigation routing" completed'
              time="2 minutes ago"
            />
            <ActivityItem
              icon={<GitBranch className="w-4 h-4 text-blue-600" />}
              iconBg="bg-blue-100"
              title='Repository "taskmaster-ui" updated'
              time="15 minutes ago"
            />
            <ActivityItem
              icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
              iconBg="bg-amber-100"
              title='New task "Add routing" created'
              time="1 hour ago"
            />
            <ActivityItem
              icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
              iconBg="bg-green-100"
              title="PR #42 merged to main branch"
              time="3 hours ago"
            />
          </div>
        </div>

        {/* Project Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Project Health</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
              View Details
            </button>
          </div>
          <div className="space-y-5">
            <HealthMetric label="Overall Health" value={85} color="success" />
            <HealthMetric label="Task Completion" value={72} color="primary" />
            <HealthMetric label="Code Quality" value={91} color="success" />
            <HealthMetric label="Test Coverage" value={67} color="warning" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            icon={<Plus className="w-4 h-4 text-blue-600" />}
            iconBg="bg-blue-100"
            label="Create Task"
          />
          <QuickActionButton
            icon={<GitBranch className="w-4 h-4 text-green-600" />}
            iconBg="bg-green-100"
            label="Add Repository"
          />
          <QuickActionButton
            icon={<Code2 className="w-4 h-4 text-amber-600" />}
            iconBg="bg-amber-100"
            label="Open Terminal"
          />
          <QuickActionButton
            icon={<BarChart3 className="w-4 h-4 text-purple-600" />}
            iconBg="bg-purple-100"
            label="View Analytics"
          />
        </div>
      </div>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  time: string;
}> = ({ icon, iconBg, title, time }) => {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
};

// Health Metric Component
const HealthMetric: React.FC<{
  label: string;
  value: number;
  color: 'primary' | 'success' | 'warning' | 'error';
}> = ({ label, value, color }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return {
          text: 'text-blue-600',
          bg: 'bg-blue-600'
        };
      case 'success':
        return {
          text: 'text-green-600',
          bg: 'bg-green-600'
        };
      case 'warning':
        return {
          text: 'text-amber-600',
          bg: 'bg-amber-600'
        };
      case 'error':
        return {
          text: 'text-red-600',
          bg: 'bg-red-600'
        };
      default:
        return {
          text: 'text-gray-600',
          bg: 'bg-gray-600'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-700">{label}</span>
        <span className={`text-sm font-medium ${colors.text}`}>{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`${colors.bg} h-2 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  label: string;
}> = ({ icon, iconBg, label }) => {
  return (
    <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 w-full">
      <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </button>
  );
};

export default Dashboard;