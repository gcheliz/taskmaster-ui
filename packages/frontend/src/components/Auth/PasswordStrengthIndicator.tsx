import React from 'react';
import { cn } from '../../utils/cn';
import { Icon, CheckIcon, XMarkIcon } from '../ui/atoms/Icon';

export interface PasswordStrengthIndicatorProps {
  /**
   * The password to evaluate
   */
  password: string;
  /**
   * Strength score and feedback
   */
  strength: {
    score: number;
    feedback: string[];
  };
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength,
  className,
}) => {
  const getStrengthLevel = (score: number) => {
    if (score < 25) return { label: 'Weak', color: 'red' };
    if (score < 50) return { label: 'Fair', color: 'orange' };
    if (score < 75) return { label: 'Good', color: 'yellow' };
    return { label: 'Strong', color: 'green' };
  };

  const strengthLevel = getStrengthLevel(strength.score);

  const getProgressBarColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-500';
      case 'orange':
        return 'bg-orange-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'green':
        return 'bg-green-500';
      default:
        return 'bg-slate-300';
    }
  };

  const getTextColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'text-red-600';
      case 'orange':
        return 'text-orange-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'green':
        return 'text-green-600';
      default:
        return 'text-slate-600';
    }
  };

  // Password requirements
  const requirements = [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'One uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'One lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      label: 'One number or special character',
      met: /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    },
  ];

  if (!password) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Password Strength</span>
          <span className={cn('text-xs font-medium', getTextColor(strengthLevel.color))}>
            {strengthLevel.label}
          </span>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out',
              getProgressBarColor(strengthLevel.color),
              'shadow-sm'
            )}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-1 gap-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className={cn(
              'flex items-center justify-center w-4 h-4 rounded-full transition-all duration-300',
              req.met 
                ? 'bg-green-100 text-green-600' 
                : 'bg-slate-100 text-slate-400'
            )}>
              <Icon 
                icon={req.met ? CheckIcon : XMarkIcon} 
                size="xs" 
                className={cn(
                  'transition-all duration-300',
                  req.met ? 'text-green-600' : 'text-slate-400'
                )}
              />
            </div>
            <span className={cn(
              'text-xs transition-colors duration-300',
              req.met ? 'text-green-600' : 'text-slate-500'
            )}>
              {req.label}
            </span>
          </div>
        ))}
      </div>

      {/* Additional Feedback */}
      {strength.feedback.length > 0 && strength.score < 100 && (
        <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
          <p className="text-xs text-slate-600 mb-1">To improve your password:</p>
          <ul className="text-xs text-slate-500 space-y-0.5">
            {strength.feedback.map((feedback, index) => (
              <li key={index} className="flex items-center space-x-1">
                <span className="w-1 h-1 bg-slate-400 rounded-full flex-shrink-0" />
                <span>{feedback}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;