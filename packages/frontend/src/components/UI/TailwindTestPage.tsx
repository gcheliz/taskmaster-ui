// Comprehensive Tailwind CSS Test Page
import React from 'react';
import ColorShowcase from './ColorShowcase';
import TypographyShowcase from './TypographyShowcase';

export interface TailwindTestPageProps {
  className?: string;
}

export const TailwindTestPage: React.FC<TailwindTestPageProps> = ({ className = '' }) => {
  return (
    <div className={`min-h-screen bg-secondary-50 ${className}`}>
      {/* Header */}
      <header className="bg-brand-gradient text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-display-large text-center">
            TaskMaster Design System Test
          </h1>
          <p className="text-body-large text-center mt-4 opacity-90">
            Comprehensive test of all Tailwind CSS utilities and custom components
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="surface-2 sticky top-0 z-sticky">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-6">
              <a href="#colors" className="text-interactive">Colors</a>
              <a href="#typography" className="text-interactive">Typography</a>
              <a href="#components" className="text-interactive">Components</a>
              <a href="#responsive" className="text-interactive">Responsive</a>
            </div>
            <div className="flex space-x-2">
              <button className="btn-secondary">Settings</button>
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-16">
        
        {/* Component Showcase */}
        <section id="components" className="space-y-8">
          <h2 className="text-display-medium">Component Showcase</h2>
          
          {/* Buttons */}
          <div className="card-elevated">
            <h3 className="text-headline-large mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary Button</button>
              <button className="btn-primary" disabled>Disabled Primary</button>
              <button className="btn-secondary" disabled>Disabled Secondary</button>
            </div>
          </div>

          {/* Inputs */}
          <div className="card-elevated">
            <h3 className="text-headline-large mb-4">Form Inputs</h3>
            <div className="space-y-4">
              <input 
                className="input-base" 
                placeholder="Enter your email..." 
                type="email"
              />
              <input 
                className="input-base" 
                placeholder="Disabled input" 
                disabled
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="input-base" placeholder="First name" />
                <input className="input-base" placeholder="Last name" />
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-elevated">
              <h3 className="text-headline-medium mb-3">Elevated Card</h3>
              <p className="text-body-large text-secondary-600">
                This card uses elevated styling with prominent shadows.
              </p>
            </div>
            <div className="card-flat">
              <h3 className="text-headline-medium mb-3">Flat Card</h3>
              <p className="text-body-large text-secondary-600">
                This card uses flat styling with minimal shadows.
              </p>
            </div>
          </div>

          {/* Task Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="task-card priority-high">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-headline-small">Critical Bug Fix</h4>
                <span className="status-blocked px-2 py-1 rounded text-xs">Blocked</span>
              </div>
              <p className="text-body-medium text-secondary-600 mb-3">
                Fix authentication issue preventing user login.
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary-500">Due: Today</span>
                <span className="text-error-600 font-medium">High Priority</span>
              </div>
            </div>

            <div className="task-card priority-medium">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-headline-small">Update Documentation</h4>
                <span className="status-in-progress px-2 py-1 rounded text-xs">In Progress</span>
              </div>
              <p className="text-body-medium text-secondary-600 mb-3">
                Update API documentation with new endpoints.
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary-500">Due: Jan 25</span>
                <span className="text-warning-600 font-medium">Medium Priority</span>
              </div>
            </div>

            <div className="task-card priority-low">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-headline-small">Refactor Components</h4>
                <span className="status-done px-2 py-1 rounded text-xs">Done</span>
              </div>
              <p className="text-body-medium text-secondary-600 mb-3">
                Clean up legacy component code.
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary-500">Completed</span>
                <span className="text-success-600 font-medium">Low Priority</span>
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Test */}
        <section id="responsive" className="space-y-8">
          <h2 className="text-display-medium">Responsive Design</h2>
          <div className="card-elevated">
            <h3 className="text-headline-large mb-4">Breakpoint Test</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="bg-primary-100 p-4 rounded text-center">
                <span className="text-body-small">Base</span>
              </div>
              <div className="bg-primary-200 p-4 rounded text-center hidden sm:block">
                <span className="text-body-small">SM+</span>
              </div>
              <div className="bg-primary-300 p-4 rounded text-center hidden md:block">
                <span className="text-body-small">MD+</span>
              </div>
              <div className="bg-primary-400 p-4 rounded text-center hidden lg:block">
                <span className="text-body-small text-white">LG+</span>
              </div>
              <div className="bg-primary-500 p-4 rounded text-center hidden xl:block">
                <span className="text-body-small text-white">XL+</span>
              </div>
              <div className="bg-primary-600 p-4 rounded text-center hidden 2xl:block">
                <span className="text-body-small text-white">2XL+</span>
              </div>
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="space-y-8">
          <h2 className="text-display-medium">Animations</h2>
          <div className="card-elevated">
            <h3 className="text-headline-large mb-4">Animation Tests</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="animate-fade-in bg-primary-100 p-6 rounded text-center">
                <span className="text-body-medium">Fade In</span>
              </div>
              <div className="animate-slide-in bg-success-100 p-6 rounded text-center">
                <span className="text-body-medium">Slide In</span>
              </div>
              <div className="animate-bounce-soft bg-warning-100 p-6 rounded text-center">
                <span className="text-body-medium">Bounce Soft</span>
              </div>
              <div className="animate-pulse-soft bg-error-100 p-6 rounded text-center">
                <span className="text-body-medium">Pulse Soft</span>
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility */}
        <section className="space-y-8">
          <h2 className="text-display-medium">Accessibility Features</h2>
          <div className="card-elevated">
            <h3 className="text-headline-large mb-4">Screen Reader Support</h3>
            <div className="space-y-4">
              <button className="btn-primary focus-ring">
                <span className="sr-only">Save document</span>
                💾 Save
              </button>
              <p className="text-body-large">
                This button has hidden text for screen readers:
                <span className="sr-only">Additional context for screen readers only</span>
              </p>
            </div>
          </div>
        </section>

        {/* Color Showcase */}
        <section id="colors">
          <ColorShowcase />
        </section>

        {/* Typography Showcase */}
        <section id="typography">
          <TypographyShowcase />
        </section>
      </main>

      {/* Footer */}
      <footer className="surface-3 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-body-medium text-secondary-600">
            TaskMaster Design System • Built with Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TailwindTestPage;