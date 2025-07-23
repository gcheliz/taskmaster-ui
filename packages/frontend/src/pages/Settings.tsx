import React from 'react';
import { 
  Palette, 
  Bell, 
  Globe, 
  Shield, 
  Code2, 
  Download,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-2">Configure your TaskMaster UI preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Appearance */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="w-5 h-5 text-accent-primary" />
            <h2 className="text-xl font-semibold text-white">Appearance</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-4">
                <ThemeOption icon={<Sun />} label="Light" value="light" />
                <ThemeOption icon={<Moon />} label="Dark" value="dark" selected />
                <ThemeOption icon={<Monitor />} label="System" value="system" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Accent Color
              </label>
              <div className="flex space-x-3">
                <ColorOption color="bg-blue-500" selected />
                <ColorOption color="bg-purple-500" />
                <ColorOption color="bg-green-500" />
                <ColorOption color="bg-orange-500" />
                <ColorOption color="bg-pink-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-5 h-5 text-accent-primary" />
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <ToggleSetting
              label="Email Notifications"
              description="Receive task updates via email"
              defaultChecked
            />
            <ToggleSetting
              label="Push Notifications"
              description="Get real-time updates in your browser"
              defaultChecked
            />
            <ToggleSetting
              label="Sound Alerts"
              description="Play sound for important notifications"
            />
            <ToggleSetting
              label="Task Reminders"
              description="Get reminded about upcoming deadlines"
              defaultChecked
            />
          </div>
        </div>

        {/* General */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-5 h-5 text-accent-primary" />
            <h2 className="text-xl font-semibold text-white">General</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Language
              </label>
              <select className="form-input">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Timezone
              </label>
              <select className="form-input">
                <option>UTC-08:00 Pacific Time</option>
                <option>UTC-05:00 Eastern Time</option>
                <option>UTC+00:00 GMT</option>
                <option>UTC+01:00 Central European Time</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Auto-save Interval (seconds)
              </label>
              <input
                type="number"
                defaultValue="30"
                min="10"
                max="300"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-5 h-5 text-accent-primary" />
            <h2 className="text-xl font-semibold text-white">Security</h2>
          </div>
          
          <div className="space-y-4">
            <ToggleSetting
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
            />
            <ToggleSetting
              label="Session Timeout"
              description="Automatically log out after 30 minutes of inactivity"
              defaultChecked
            />
            <div>
              <button className="btn btn-secondary">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Developer */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Code2 className="w-5 h-5 text-accent-primary" />
            <h2 className="text-xl font-semibold text-white">Developer</h2>
          </div>
          
          <div className="space-y-4">
            <ToggleSetting
              label="Debug Mode"
              description="Show additional debugging information"
            />
            <ToggleSetting
              label="API Logging"
              description="Log all API requests to console"
            />
            <div>
              <button className="btn btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Theme Option Component
const ThemeOption: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  selected?: boolean;
}> = ({ icon, label, value, selected = false }) => (
  <button className={`
    p-4 rounded-lg border-2 transition-all duration-200
    ${selected 
      ? 'border-accent-primary bg-accent-primary/10' 
      : 'border-slate-700 hover:border-slate-600'
    }
  `}>
    <div className="flex flex-col items-center space-y-2">
      <div className={selected ? 'text-accent-primary' : 'text-slate-400'}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${selected ? 'text-white' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  </button>
);

// Color Option Component
const ColorOption: React.FC<{
  color: string;
  selected?: boolean;
}> = ({ color, selected = false }) => (
  <button className={`
    w-8 h-8 rounded-full ${color} relative
    ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''}
  `}>
    {selected && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>
    )}
  </button>
);

// Toggle Setting Component
const ToggleSetting: React.FC<{
  label: string;
  description: string;
  defaultChecked?: boolean;
}> = ({ label, description, defaultChecked = false }) => {
  const [checked, setChecked] = React.useState(defaultChecked);
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${checked ? 'bg-accent-primary' : 'bg-slate-700'}
        `}
      >
        <span className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `} />
      </button>
    </div>
  );
};

export default Settings;