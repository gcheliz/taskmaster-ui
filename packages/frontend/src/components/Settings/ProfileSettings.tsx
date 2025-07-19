import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { FormField } from '../ui/molecules/FormField';
import { Button } from '../ui/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/molecules/Card';
import { Badge } from '../ui/atoms/Badge';
import { useSettings } from '../../contexts/SettingsContext';

export interface ProfileSettingsProps {
  /**
   * Callback when settings are saved
   */
  onSave?: (settings: ProfileSettingsData) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface ProfileSettingsData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  bio: string;
  jobTitle: string;
  company: string;
  location: string;
  website: string;
  timezone: string;
  language: string;
}

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'zh', label: '中文' },
];

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  onSave,
  className,
}) => {
  const { state, updateCategory, getSetting } = useSettings();
  const [formData, setFormData] = useState<ProfileSettingsData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    bio: '',
    jobTitle: '',
    company: '',
    location: '',
    website: '',
    timezone: 'UTC',
    language: 'en',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load settings data when component mounts or settings change
  useEffect(() => {
    if (state.settings) {
      setFormData({
        firstName: state.settings.firstName || '',
        lastName: state.settings.lastName || '',
        email: 'user@example.com', // This should come from user context, not settings
        username: 'username', // This should come from user context, not settings
        bio: state.settings.bio || '',
        jobTitle: state.settings.jobTitle || '',
        company: state.settings.company || '',
        location: state.settings.location || '',
        website: state.settings.website || '',
        timezone: state.settings.timezone || 'UTC',
        language: state.settings.language || 'en',
      });
    }
  }, [state.settings]);

  const handleInputChange = (
    field: keyof ProfileSettingsData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateCategory('profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        jobTitle: formData.jobTitle,
        company: formData.company,
        location: formData.location,
        website: formData.website,
        timezone: formData.timezone,
        language: formData.language,
      });

      onSave?.(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save profile settings:', error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Profile Picture Section */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                {formData.firstName.charAt(0)}
                {formData.lastName.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Upload a new profile picture or choose from your existing photos
              </p>
              <div className="flex space-x-3">
                <Button size="sm" variant="outline">
                  Upload Photo
                </Button>
                <Button size="sm" variant="ghost">
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="First Name"
              value={formData.firstName}
              onChange={e => handleInputChange('firstName', e.target.value)}
              required
            />
            <FormField
              label="Last Name"
              value={formData.lastName}
              onChange={e => handleInputChange('lastName', e.target.value)}
              required
            />
          </div>

          <FormField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            required
            rightIcon={
              <Badge variant="success" size="sm">
                Verified
              </Badge>
            }
          />

          <FormField
            label="Username"
            value={formData.username}
            onChange={e => handleInputChange('username', e.target.value)}
            required
            helpText="This will be your unique identifier and cannot be changed later"
          />
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Job Title"
              value={formData.jobTitle}
              onChange={e => handleInputChange('jobTitle', e.target.value)}
              placeholder="e.g. Senior Software Engineer"
            />
            <FormField
              label="Company"
              value={formData.company}
              onChange={e => handleInputChange('company', e.target.value)}
              placeholder="e.g. TaskMaster Inc."
            />
          </div>

          <FormField
            label="Bio"
            value={formData.bio}
            onChange={e => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            helpText="A brief description about yourself and your role"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Location"
              value={formData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              placeholder="e.g. San Francisco, CA"
            />
            <FormField
              label="Website"
              type="url"
              value={formData.website}
              onChange={e => handleInputChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="bg-white/50 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={e => handleInputChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={e => handleInputChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button variant="outline">Cancel</Button>
        <Button
          onClick={handleSave}
          loading={isLoading}
          className={cn(
            'transition-all duration-200',
            isSaved && 'bg-green-600 hover:bg-green-700'
          )}
        >
          {isSaved ? (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Saved
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
