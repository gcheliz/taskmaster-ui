// Typography Showcase Component - For testing and documenting typography system
import React from 'react';

export interface TypographyShowcaseProps {
  className?: string;
}

export const TypographyShowcase: React.FC<TypographyShowcaseProps> = ({ className = '' }) => {
  return (
    <div className={`p-8 space-y-12 ${className}`}>
      <h1 className="text-display-large">Typography System</h1>
      
      {/* Display Typography */}
      <section>
        <h2 className="text-headline-large mb-6">Display Typography</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-display-large">Display Large</h3>
            <p className="text-body-medium text-gray-600">Used for hero sections and primary headings</p>
          </div>
          <div>
            <h3 className="text-display-medium">Display Medium</h3>
            <p className="text-body-medium text-gray-600">Used for section headers and important headings</p>
          </div>
          <div>
            <h3 className="text-display-small">Display Small</h3>
            <p className="text-body-medium text-gray-600">Used for subsection headers</p>
          </div>
        </div>
      </section>

      {/* Headline Typography */}
      <section>
        <h2 className="text-headline-large mb-6">Headlines</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-headline-large">Headline Large</h3>
            <p className="text-body-medium text-gray-600">Used for card titles and component headers</p>
          </div>
          <div>
            <h4 className="text-headline-medium">Headline Medium</h4>
            <p className="text-body-medium text-gray-600">Used for modal titles and form sections</p>
          </div>
          <div>
            <h5 className="text-headline-small">Headline Small</h5>
            <p className="text-body-medium text-gray-600">Used for list item titles and metadata labels</p>
          </div>
        </div>
      </section>

      {/* Body Typography */}
      <section>
        <h2 className="text-headline-large mb-6">Body Text</h2>
        <div className="space-y-6">
          <div>
            <p className="text-body-large mb-2">
              <strong>Body Large:</strong> This is the primary body text used for main content, 
              descriptions, and general reading. It provides optimal readability and is the 
              foundation of our content hierarchy.
            </p>
          </div>
          <div>
            <p className="text-body-medium mb-2">
              <strong>Body Medium:</strong> This is used for secondary content, captions, 
              and supporting information. It's slightly smaller but maintains excellent readability.
            </p>
          </div>
          <div>
            <p className="text-body-small mb-2">
              <strong>Body Small:</strong> Used for metadata, timestamps, and fine print. 
              Should be used sparingly to maintain accessibility.
            </p>
          </div>
        </div>
      </section>

      {/* Code Typography */}
      <section>
        <h2 className="text-headline-large mb-6">Code & Monospace</h2>
        <div className="space-y-4">
          <div>
            <p className="text-body-large mb-2">
              Inline code: <code className="text-code">npm install tailwindcss</code>
            </p>
          </div>
          <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm">
            <div className="mb-2 text-gray-400">// Code block example</div>
            <div>const config = &#123;</div>
            <div className="ml-4">content: ['./src/**/*.&#123;js,ts,jsx,tsx&#125;'],</div>
            <div className="ml-4">theme: &#123;</div>
            <div className="ml-8">extend: &#123;&#125;</div>
            <div className="ml-4">&#125;</div>
            <div>&#125;</div>
          </div>
        </div>
      </section>

      {/* Interactive Text */}
      <section>
        <h2 className="text-headline-large mb-6">Interactive Elements</h2>
        <div className="space-y-4">
          <div>
            <p className="text-body-large">
              You can <span className="text-interactive">click on this link</span> to see 
              the interactive text styling with hover effects.
            </p>
          </div>
          <div>
            <button className="text-interactive text-body-large border-none bg-transparent">
              Interactive Button Text
            </button>
          </div>
        </div>
      </section>

      {/* Font Weights */}
      <section>
        <h2 className="text-headline-large mb-6">Font Weights</h2>
        <div className="space-y-2">
          <p className="text-body-large font-thin">Thin (100)</p>
          <p className="text-body-large font-light">Light (300)</p>
          <p className="text-body-large font-normal">Normal (400)</p>
          <p className="text-body-large font-medium">Medium (500)</p>
          <p className="text-body-large font-semibold">Semibold (600)</p>
          <p className="text-body-large font-bold">Bold (700)</p>
          <p className="text-body-large font-extrabold">Extrabold (800)</p>
          <p className="text-body-large font-black">Black (900)</p>
        </div>
      </section>

      {/* Letter Spacing */}
      <section>
        <h2 className="text-headline-large mb-6">Letter Spacing</h2>
        <div className="space-y-2">
          <p className="text-body-large tracking-tighter">Tighter Letter Spacing</p>
          <p className="text-body-large tracking-tight">Tight Letter Spacing</p>
          <p className="text-body-large tracking-normal">Normal Letter Spacing</p>
          <p className="text-body-large tracking-wide">Wide Letter Spacing</p>
          <p className="text-body-large tracking-wider">Wider Letter Spacing</p>
          <p className="text-body-large tracking-widest">Widest Letter Spacing</p>
        </div>
      </section>

      {/* Spacing Examples */}
      <section>
        <h2 className="text-headline-large mb-6">Spacing Scale</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="bg-primary-100 h-1 w-1"></div>
            <span className="text-body-small text-gray-600">1 (0.25rem / 4px)</span>
          </div>
          <div className="space-y-1">
            <div className="bg-primary-200 h-2 w-2"></div>
            <span className="text-body-small text-gray-600">2 (0.5rem / 8px)</span>
          </div>
          <div className="space-y-1">
            <div className="bg-primary-300 h-4 w-4"></div>
            <span className="text-body-small text-gray-600">4 (1rem / 16px)</span>
          </div>
          <div className="space-y-1">
            <div className="bg-primary-400 h-8 w-8"></div>
            <span className="text-body-small text-gray-600">8 (2rem / 32px)</span>
          </div>
          <div className="space-y-1">
            <div className="bg-primary-500 h-16 w-16"></div>
            <span className="text-body-small text-gray-600">16 (4rem / 64px)</span>
          </div>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section>
        <h2 className="text-headline-large mb-6">Usage Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="surface-1 p-6 rounded">
            <h3 className="text-headline-medium mb-3">Do</h3>
            <ul className="text-body-medium space-y-2 text-gray-700">
              <li>• Use consistent typography scales</li>
              <li>• Maintain proper contrast ratios</li>
              <li>• Use appropriate line heights</li>
              <li>• Follow the established hierarchy</li>
            </ul>
          </div>
          <div className="surface-1 p-6 rounded">
            <h3 className="text-headline-medium mb-3">Don't</h3>
            <ul className="text-body-medium space-y-2 text-gray-700">
              <li>• Mix different font families randomly</li>
              <li>• Use too many font sizes on one page</li>
              <li>• Ignore accessibility guidelines</li>
              <li>• Use extremely small text for important content</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TypographyShowcase;