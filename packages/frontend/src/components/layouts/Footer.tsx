import React from 'react'
import { cn } from '../../utils/cn'
import { Github, Twitter, Linkedin, Heart } from 'lucide-react'

export interface FooterProps {
  className?: string
  showSocial?: boolean
  showCredits?: boolean
}

export const Footer: React.FC<FooterProps> = ({
  className,
  showSocial = true,
  showCredits = true,
}) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={cn(
        'bg-white border-t border-secondary-200',
        'px-4 sm:px-6 lg:px-8 py-6',
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-sm text-secondary-600">
            <p>© {currentYear} TaskMaster UI. All rights reserved.</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center space-x-6 text-sm">
            <a
              href="/privacy"
              className="text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/docs"
              className="text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              Documentation
            </a>
            <a
              href="/support"
              className="text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              Support
            </a>
          </div>

          {/* Social links */}
          {showSocial && (
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-secondary-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-secondary-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-secondary-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          )}
        </div>

        {/* Credits */}
        {showCredits && (
          <div className="mt-6 pt-6 border-t border-secondary-200">
            <p className="text-xs text-secondary-500 text-center md:text-left flex items-center justify-center md:justify-start">
              Made with <Heart className="h-3 w-3 mx-1 text-error-500" fill="currentColor" /> by the TaskMaster Team
            </p>
          </div>
        )}
      </div>
    </footer>
  )
}