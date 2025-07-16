import React, { useState } from 'react';
import { useTheme, type ThemeMode } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

export interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  const currentThemeOption = themeOptions.find(option => option.value === theme) || themeOptions[0];

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (variant === 'dropdown') {
    return (
      <div className={`theme-toggle theme-toggle--dropdown theme-toggle--${size} ${className}`}>
        <button
          type="button"
          className="theme-toggle__button"
          onClick={toggleDropdown}
          aria-label={`Current theme: ${currentThemeOption.label}. Click to change theme.`}
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
        >
          <span className="theme-toggle__icon" aria-hidden="true">
            {currentThemeOption.icon}
          </span>
          {showLabel && (
            <span className="theme-toggle__label">
              {currentThemeOption.label}
            </span>
          )}
          <span className="theme-toggle__arrow" aria-hidden="true">
            ▼
          </span>
        </button>

        {isDropdownOpen && (
          <div className="theme-toggle__dropdown" role="menu">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`theme-toggle__option ${
                  theme === option.value ? 'theme-toggle__option--active' : ''
                }`}
                onClick={() => handleThemeChange(option.value)}
                role="menuitem"
                aria-pressed={theme === option.value}
              >
                <span className="theme-toggle__option-icon" aria-hidden="true">
                  {option.icon}
                </span>
                <span className="theme-toggle__option-label">
                  {option.label}
                </span>
                {theme === option.value && (
                  <span className="theme-toggle__check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Simple button variant - toggles between light and dark
  const getNextTheme = (): ThemeMode => {
    if (theme === 'system') {
      return resolvedTheme === 'light' ? 'dark' : 'light';
    }
    return theme === 'light' ? 'dark' : 'light';
  };

  const nextTheme = getNextTheme();
  const nextThemeOption = themeOptions.find(option => option.value === nextTheme) || themeOptions[0];

  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle--button theme-toggle--${size} ${className}`}
      onClick={() => handleThemeChange(nextTheme)}
      aria-label={`Switch to ${nextThemeOption.label.toLowerCase()} theme`}
      title={`Switch to ${nextThemeOption.label.toLowerCase()} theme`}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {resolvedTheme === 'light' ? '🌙' : '☀️'}
      </span>
      {showLabel && (
        <span className="theme-toggle__label">
          {resolvedTheme === 'light' ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;