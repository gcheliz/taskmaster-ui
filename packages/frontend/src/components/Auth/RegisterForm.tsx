import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/atoms/Button';
import { Input } from '../ui/atoms/Input';
import { Label } from '../ui/atoms/Label';
import { Checkbox } from '../ui/atoms/Checkbox';
import { SocialLoginButtons } from './SocialLoginButtons';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { 
  Icon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon,
} from '../ui/atoms/Icon';

export interface RegisterFormProps {
  /**
   * Callback when registration is successful
   */
  onSuccess?: (data: { email: string; name: string; token: string }) => void;
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

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  newsletter: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  showSocialLogins = true,
  className,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    newsletter: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    if (!password) return { score: 0, feedback: [] };

    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) {
      score += 25;
    } else {
      feedback.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 25;
    } else {
      feedback.push('One uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 25;
    } else {
      feedback.push('One lowercase letter');
    }

    // Number or special character
    if (/[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      score += 25;
    } else {
      feedback.push('One number or special character');
    }

    return { score, feedback };
  }, [formData.password]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrength.score < 75) {
      newErrors.password = 'Password is too weak';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful registration
      const mockToken = 'mock-jwt-token-' + Date.now();
      onSuccess?.({
        email: formData.email,
        name: formData.name,
        token: mockToken,
      });
    } catch (error) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
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
              <span className="bg-white px-2 text-slate-500">Or create account with email</span>
            </div>
          </div>
        </>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-slate-700">
            Full Name
          </Label>
          <div className="relative">
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={!!errors.name}
              leftIcon={<Icon icon={UserIcon} size="sm" className="text-slate-400" />}
              className={cn(
                'pl-10 bg-white/60 backdrop-blur-sm',
                'border-slate-200/60',
                'focus:bg-white/80 focus:border-blue-300',
                'transition-all duration-300'
              )}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
        </div>

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
              leftIcon={<Icon icon={EnvelopeIcon} size="sm" className="text-slate-400" />}
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
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              leftIcon={<Icon icon={LockClosedIcon} size="sm" className="text-slate-400" />}
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
              <Icon 
                icon={showPassword ? EyeSlashIcon : EyeIcon} 
                size="sm" 
              />
            </button>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <PasswordStrengthIndicator 
              password={formData.password}
              strength={passwordStrength}
            />
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={!!errors.confirmPassword}
              leftIcon={<Icon icon={LockClosedIcon} size="sm" className="text-slate-400" />}
              className={cn(
                'pl-10 pr-10 bg-white/60 backdrop-blur-sm',
                'border-slate-200/60',
                'focus:bg-white/80 focus:border-blue-300',
                'transition-all duration-300'
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Icon 
                icon={showConfirmPassword ? EyeSlashIcon : EyeIcon} 
                size="sm" 
              />
            </button>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Terms and Newsletter */}
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange('acceptTerms')}
              className="mt-0.5"
            />
            <Label htmlFor="acceptTerms" className="text-sm text-slate-600 leading-relaxed">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </a>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-red-500">{errors.acceptTerms}</p>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              checked={formData.newsletter}
              onChange={handleInputChange('newsletter')}
            />
            <Label htmlFor="newsletter" className="text-sm text-slate-600">
              Send me product updates and newsletters
            </Label>
          </div>
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
            'bg-gradient-to-r from-purple-600 to-pink-600',
            'hover:from-purple-700 hover:to-pink-700',
            'shadow-lg hover:shadow-xl',
            'backdrop-blur-sm',
            'transition-all duration-300'
          )}
          size="lg"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      {/* Additional Help */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-700">
            Sign in instead
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;