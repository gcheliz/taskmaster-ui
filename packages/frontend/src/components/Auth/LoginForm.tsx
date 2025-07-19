import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/atoms/Button';
import { Input } from '../ui/atoms/Input';
import { Label } from '../ui/atoms/Label';
import { Checkbox } from '../ui/atoms/Checkbox';
import { SocialLoginButtons } from './SocialLoginButtons';
import {
  Icon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
} from '../ui/atoms/Icon';

export interface LoginFormProps {
  /**
   * Callback when login is successful
   */
  onSuccess?: (data: { email: string; token: string }) => void;
  /**
   * Whether to show social login options
   * @default true
   */
  showSocialLogins?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  showSocialLogins = true,
  className,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful login
      const mockToken = 'mock-jwt-token-' + Date.now();
      onSuccess?.({
        email: formData.email,
        token: mockToken,
      });
    } catch (error) {
      setErrors({ submit: 'Login failed. Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));

      // Clear errors when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Social Login Section */}
      {showSocialLogins && (
        <>
          <SocialLoginButtons onSuccess={onSuccess} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                Or continue with email
              </span>
            </div>
          </div>
        </>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email Address
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              leftIcon={
                <Icon icon={UserIcon} size="sm" className="text-slate-400" />
              }
              className={cn(
                'pl-10 bg-white/60 backdrop-blur-sm',
                'border-slate-200/60',
                'focus:bg-white/80 focus:border-blue-300',
                'transition-all duration-300'
              )}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-slate-700"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              leftIcon={
                <Icon
                  icon={LockClosedIcon}
                  size="sm"
                  className="text-slate-400"
                />
              }
              className={cn(
                'pl-10 pr-10 bg-white/60 backdrop-blur-sm',
                'border-slate-200/60',
                'focus:bg-white/80 focus:border-blue-300',
                'transition-all duration-300'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Icon icon={showPassword ? EyeSlashIcon : EyeIcon} size="sm" />
            </button>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange('rememberMe')}
            />
            <Label htmlFor="rememberMe" className="text-sm text-slate-600">
              Remember me
            </Label>
          </div>
          <a
            href="#"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          loading={isLoading}
          className={cn(
            'w-full',
            'bg-gradient-to-r from-blue-600 to-purple-600',
            'hover:from-blue-700 hover:to-purple-700',
            'shadow-lg hover:shadow-xl',
            'backdrop-blur-sm',
            'transition-all duration-300'
          )}
          size="lg"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      {/* Additional Help */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Don't have an account?{' '}
          <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-700">
            Create one now
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
