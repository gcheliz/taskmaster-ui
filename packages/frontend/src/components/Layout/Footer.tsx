import React from 'react';
import './Footer.css';

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`app-footer ${className}`.trim()} role="contentinfo">
      <div className="footer-content">
        <div className="footer-left">
          <p>&copy; 2025 TaskMaster UI. All rights reserved.</p>
        </div>
        <div className="footer-center">
          <span className="app-status" role="status" aria-live="polite">Status: Online</span>
        </div>
        <div className="footer-right">
          <span className="app-version" aria-label="Application version 1.0.0">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};