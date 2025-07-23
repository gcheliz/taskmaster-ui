import React from 'react'
import { Button } from '../components/ui/Button'
import {
  Palette,
  Bell,
  Globe,
  Shield,
  Code2,
  Download,
  Moon,
  Sun,
  Monitor,
  Save,
  Key,
  LogOut,
  User,
  Mail,
  Smartphone,
  Volume2,
  Check,
} from 'lucide-react'
import { PageHeader } from '../components/Layout'

const Settings: React.FC = () => {
  return (
    <>
      <PageHeader 
        title="Settings" 
        subtitle="Manage your preferences"
        actions={
          <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        }
      />
      <div className="bg-white p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appearance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                <ThemeOption icon={<Sun />} label="Light" value="light" selected />
                <ThemeOption icon={<Moon />} label="Dark" value="dark" />
                <ThemeOption icon={<Monitor />} label="System" value="system" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Accent Color</label>
              <div className="flex space-x-3">
                <ColorOption color="bg-blue-500" selected />
                <ColorOption color="bg-purple-500" />
                <ColorOption color="bg-green-500" />
                <ColorOption color="bg-amber-500" />
                <ColorOption color="bg-pink-500" />
                <ColorOption color="bg-red-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Font Size</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>Small</option>
                <option selected>Medium</option>
                <option>Large</option>
                <option>Extra Large</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <ToggleSetting
              icon={<Mail className="w-4 h-4" />}
              label="Email Notifications"
              description="Receive task updates via email"
              defaultChecked
            />
            <ToggleSetting
              icon={<Smartphone className="w-4 h-4" />}
              label="Push Notifications"
              description="Get real-time updates in your browser"
              defaultChecked
            />
            <ToggleSetting
              icon={<Volume2 className="w-4 h-4" />}
              label="Sound Alerts"
              description="Play sound for important notifications"
            />
            <ToggleSetting
              icon={<Bell className="w-4 h-4" />}
              label="Task Reminders"
              description="Get reminded about upcoming deadlines"
              defaultChecked
            />
          </div>
        </div>

        {/* General */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">General</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Japanese</option>
                <option>Chinese (Simplified)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>UTC-08:00 Pacific Time</option>
                <option>UTC-05:00 Eastern Time</option>
                <option>UTC+00:00 GMT</option>
                <option>UTC+01:00 Central European Time</option>
                <option>UTC+09:00 Japan Standard Time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-save Interval
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  defaultValue="30"
                  min="10"
                  max="300"
                  step="10"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <span className="text-sm text-gray-600">seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Security</h2>
          </div>

          <div className="space-y-4">
            <ToggleSetting
              icon={<Shield className="w-4 h-4" />}
              label="Two-Factor Authentication"
              description="Add an extra layer of security"
            />
            <ToggleSetting
              icon={<LogOut className="w-4 h-4" />}
              label="Session Timeout"
              description="Auto logout after 30 min of inactivity"
              defaultChecked
            />
            <ToggleSetting
              icon={<User className="w-4 h-4" />}
              label="Login Notifications"
              description="Alert when account is accessed"
              defaultChecked
            />

            <div className="pt-4 space-y-3">
              <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 hover:shadow-md hover:-translate-y-0.5">
                <Key className="w-4 h-4" />
                Change Password
              </button>
              <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 hover:shadow-md hover:-translate-y-0.5">
                <Download className="w-4 h-4" />
                Download Security Log
              </button>
            </div>
          </div>
        </div>

        {/* Developer */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Developer</h2>
          </div>

          <div className="space-y-4">
            <ToggleSetting
              icon={<Code2 className="w-4 h-4" />}
              label="Debug Mode"
              description="Show debugging information"
            />
            <ToggleSetting
              icon={<Globe className="w-4 h-4" />}
              label="API Logging"
              description="Log API requests to console"
            />
            <ToggleSetting
              icon={<Shield className="w-4 h-4" />}
              label="Verbose Errors"
              description="Show detailed error messages"
            />

            <div className="pt-4 space-y-3">
              <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 hover:shadow-md hover:-translate-y-0.5">
                <Download className="w-4 h-4" />
                Export Settings
              </button>
              <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 hover:shadow-md hover:-translate-y-0.5">
                <Download className="w-4 h-4" />
                Download Logs
              </button>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Account</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <input
                type="text"
                defaultValue="Gonzalo"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                defaultValue="gonzalo@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value="Administrator"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div className="pt-4">
              <button className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4 pb-8">
        <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium hover:shadow-md">
          Cancel
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
        </div>
      </div>
    </>
  )
}

// Theme Option Component
const ThemeOption: React.FC<{
  icon: React.ReactNode
  label: string
  value: string
  selected?: boolean
}> = ({ icon, label, value, selected = false }) => (
  <button
    className={`
    p-4 rounded-lg border-2 transition-all duration-200 relative
    ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}
  `}
  >
    {selected && (
      <div className="absolute top-2 right-2">
        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      </div>
    )}
    <div className="flex flex-col items-center space-y-2">
      <div className={selected ? 'text-blue-600' : 'text-gray-500'}>{icon}</div>
      <span className={`text-sm font-medium ${selected ? 'text-gray-900' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  </button>
)

// Color Option Component
const ColorOption: React.FC<{
  color: string
  selected?: boolean
}> = ({ color, selected = false }) => (
  <button
    className={`
    w-10 h-10 rounded-full ${color} relative transition-all duration-200
    ${selected ? 'ring-2 ring-offset-2 ring-blue-500 ring-offset-white scale-110' : 'hover:scale-105'}
  `}
  >
    {selected && (
      <div className="absolute inset-0 flex items-center justify-center">
        <Check className="w-4 h-4 text-white" />
      </div>
    )}
  </button>
)

// Toggle Setting Component
const ToggleSetting: React.FC<{
  icon?: React.ReactNode
  label: string
  description: string
  defaultChecked?: boolean
}> = ({ icon, label, description, defaultChecked = false }) => {
  const [checked, setChecked] = React.useState(defaultChecked)

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-start space-x-3">
        {icon && <div className="text-gray-400 mt-0.5">{icon}</div>}
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${checked ? 'bg-blue-600' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
        />
      </button>
    </div>
  )
}

export default Settings
