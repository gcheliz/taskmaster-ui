// Color Showcase Component - For testing and documenting design tokens
import React from 'react';

export interface ColorShowcaseProps {
  className?: string;
}

export const ColorShowcase: React.FC<ColorShowcaseProps> = ({ className = '' }) => {
  return (
    <div className={`p-8 space-y-8 ${className}`}>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">TaskMaster Design System</h2>
      
      {/* Primary Colors */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Primary Colors</h3>
        <div className="grid grid-cols-10 gap-2">
          <div className="bg-primary-50 h-16 rounded flex items-end justify-center pb-1">
            <span className="text-xs text-gray-700">50</span>
          </div>
          <div className="bg-primary-100 h-16 rounded flex items-end justify-center pb-1">
            <span className="text-xs text-gray-700">100</span>
          </div>
          <div className="bg-primary-200 h-16 rounded flex items-end justify-center pb-1">
            <span className="text-xs text-gray-700">200</span>
          </div>
          <div className="bg-primary-300 h-16 rounded flex items-end justify-center pb-1">
            <span className="text-xs text-white">300</span>
          </div>
          <div className="bg-primary-400 h-16 rounded flex items-end justify-center pb-1">
            <span className="text-xs text-white">400</span>
          </div>
          <div className="bg-primary-500 h-16 rounded flex items-end justify-center pb-1">
            <span className="text-xs text-white">500</span>
          </div>
          <div className="bg-primary-600 h-16 rounded flex items-end justify-center pb-1">
            <span className="text-xs text-white">600</span>
          </div>
          <div className="bg-primary-700 h-16 rounded flex items-end justify-center pb-1">
            <span className="text-xs text-white">700</span>
          </div>
          <div className="bg-primary-800 h-16 rounded flex items-end justify-center pb-1">
            <span className="text-xs text-white">800</span>
          </div>
          <div className="bg-primary-900 h-16 rounded flex items-end justify-center pb-1">
            <span className="text-xs text-white">900</span>
          </div>
        </div>
      </section>

      {/* Status Colors */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Status Colors</h3>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className="status-pending h-16 rounded flex items-center justify-center mb-2">
              <span className="text-sm font-medium">Pending</span>
            </div>
            <span className="text-xs text-gray-600">Pending Tasks</span>
          </div>
          <div className="text-center">
            <div className="status-in-progress h-16 rounded flex items-center justify-center mb-2">
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <span className="text-xs text-gray-600">Active Tasks</span>
          </div>
          <div className="text-center">
            <div className="status-done h-16 rounded flex items-center justify-center mb-2">
              <span className="text-sm font-medium">Done</span>
            </div>
            <span className="text-xs text-gray-600">Completed</span>
          </div>
          <div className="text-center">
            <div className="status-blocked h-16 rounded flex items-center justify-center mb-2">
              <span className="text-sm font-medium">Blocked</span>
            </div>
            <span className="text-xs text-gray-600">Blocked Tasks</span>
          </div>
          <div className="text-center">
            <div className="status-deferred h-16 rounded flex items-center justify-center mb-2">
              <span className="text-sm font-medium">Deferred</span>
            </div>
            <span className="text-xs text-gray-600">Deferred</span>
          </div>
        </div>
      </section>

      {/* Priority Indicators */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Priority Indicators</h3>
        <div className="space-y-3">
          <div className="priority-low p-4 bg-white rounded shadow">
            <span className="font-medium">Low Priority Task</span>
          </div>
          <div className="priority-medium p-4 bg-white rounded shadow">
            <span className="font-medium">Medium Priority Task</span>
          </div>
          <div className="priority-high p-4 bg-white rounded shadow">
            <span className="font-medium">High Priority Task</span>
          </div>
        </div>
      </section>

      {/* Surface Elevations */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Surface Elevations</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="surface-1 p-6 rounded">
            <h4 className="font-medium mb-2">Surface 1</h4>
            <p className="text-sm text-gray-600">Basic elevation for cards and panels</p>
          </div>
          <div className="surface-2 p-6 rounded">
            <h4 className="font-medium mb-2">Surface 2</h4>
            <p className="text-sm text-gray-600">Medium elevation for modals</p>
          </div>
          <div className="surface-3 p-6 rounded">
            <h4 className="font-medium mb-2">Surface 3</h4>
            <p className="text-sm text-gray-600">High elevation for tooltips</p>
          </div>
        </div>
      </section>

      {/* Task Card Example */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Component Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="task-card">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Implement User Authentication</h4>
              <span className="status-in-progress px-2 py-1 rounded text-xs">In Progress</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Set up JWT-based authentication system with login and registration.
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Due: Jan 15, 2024</span>
              <span className="priority-high px-2 py-1 bg-red-50 rounded">High Priority</span>
            </div>
          </div>
          
          <div className="task-card priority-medium">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Design System Documentation</h4>
              <span className="status-pending px-2 py-1 rounded text-xs">Pending</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Create comprehensive documentation for the design system.
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Due: Jan 20, 2024</span>
              <span className="text-orange-600">Medium Priority</span>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Gradient */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Brand Elements</h3>
        <div className="bg-brand-gradient h-24 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg font-semibold">TaskMaster Brand Gradient</span>
        </div>
      </section>
    </div>
  );
};

export default ColorShowcase;