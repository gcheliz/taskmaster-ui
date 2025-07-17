import React, { useState, useRef, useEffect } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ];

  const currentThemeOption = themeOptions.find(option => option.value === theme) || themeOptions[0];

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setIsDropdownOpen(false);
    buttonRef.current?.focus();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (variant === 'dropdown' && isDropdownOpen) {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsDropdownOpen(false);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          const nextOption = dropdownRef.current?.querySelector('[role="menuitem"]:not([aria-pressed="true"])') as HTMLButtonElement;
          nextOption?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const options = dropdownRef.current?.querySelectorAll('[role="menuitem"]');
          const lastOption = options?.[options.length - 1] as HTMLButtonElement;
          lastOption?.focus();
          break;
      }
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, option: { value: ThemeMode; label: string; icon: string }) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleThemeChange(option.value);
        break;
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        const currentIndex = themeOptions.findIndex(opt => opt.value === option.value);
        const nextIndex = (currentIndex + 1) % themeOptions.length;
        const nextButton = dropdownRef.current?.querySelector(`[data-option="${themeOptions[nextIndex].value}"]`) as HTMLButtonElement;
        nextButton?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const currentIndexUp = themeOptions.findIndex(opt => opt.value === option.value);
        const prevIndex = currentIndexUp === 0 ? themeOptions.length - 1 : currentIndexUp - 1;
        const prevButton = dropdownRef.current?.querySelector(`[data-option="${themeOptions[prevIndex].value}"]`) as HTMLButtonElement;
        prevButton?.focus();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  if (variant === 'dropdown') {
    return (
      <div 
        ref={dropdownRef}
        className={`theme-toggle theme-toggle--dropdown theme-toggle--${size} ${className}`}
        onKeyDown={handleKeyDown}
      >
        <button
          ref={buttonRef}
          type="button"
          className="theme-toggle__button"
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
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
                onKeyDown={(e) => handleOptionKeyDown(e, option)}
                role="menuitem"
                aria-pressed={theme === option.value}
                data-option={option.value}
                tabIndex={-1}
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
      ref={buttonRef}
      type="button"
      className={`theme-toggle theme-toggle--button theme-toggle--${size} ${className}`}
      onClick={() => handleThemeChange(nextTheme)}
      aria-label={`Switch to ${nextThemeOption.label.toLowerCase()} theme. Current theme is ${currentThemeOption.label.toLowerCase()}.`}
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