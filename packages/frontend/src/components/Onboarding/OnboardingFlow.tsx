import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { Button } from '../ui/atoms/Button'
import { Card } from '../ui/atoms/Card'
import { Icon } from '../ui/IconWrapper'
import { motion, AnimatePresence } from 'framer-motion'

export interface OnboardingFlowProps {
  userRole: string
  userName: string
  onComplete?: () => void
  className?: string
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
}

const roleBasedSteps: Record<string, OnboardingStep[]> = {
  developer: [
    {
      id: 'welcome',
      title: 'Welcome to TaskMaster!',
      description: 'Let\'s get you set up for productive development',
      icon: <Icon name="sparkles" className="w-8 h-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Hi there, Developer! 👋</h3>
          <p className="text-gray-600">
            TaskMaster helps you manage your development tasks, track progress, and collaborate with your team.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icon name="code" className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium">Code Tasks</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icon name="git-branch" className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-medium">Git Integration</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icon name="terminal" className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm font-medium">Terminal Access</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'workspace',
      title: 'Set Up Your Workspace',
      description: 'Connect your repositories and configure your environment',
      icon: <Icon name="folder" className="w-8 h-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Connect Your First Repository</h3>
          <p className="text-gray-600">
            You can connect local Git repositories to TaskMaster for seamless integration.
          </p>
          <Card className="p-4 bg-gray-50">
            <div className="flex items-center space-x-3">
              <Icon name="git" className="w-6 h-6 text-orange-500" />
              <div>
                <p className="font-medium">Quick Tip:</p>
                <p className="text-sm text-gray-600">
                  Navigate to Repositories and click "Add Repository" to get started
                </p>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 'features',
      title: 'Key Features for Developers',
      description: 'Tools designed to boost your productivity',
      icon: <Icon name="rocket" className="w-8 h-8 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Your Developer Toolkit</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Icon name="check-circle" className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Task Board</p>
                <p className="text-sm text-gray-600">Kanban-style task management with drag & drop</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Icon name="check-circle" className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Integrated Terminal</p>
                <p className="text-sm text-gray-600">Run commands directly from your browser</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Icon name="check-circle" className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Real-time Collaboration</p>
                <p className="text-sm text-gray-600">See what your team is working on in real-time</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ],
  'project-manager': [
    {
      id: 'welcome',
      title: 'Welcome to TaskMaster!',
      description: 'Your command center for project success',
      icon: <Icon name="briefcase" className="w-8 h-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Hello, Project Manager! 🎯</h3>
          <p className="text-gray-600">
            TaskMaster gives you complete visibility into your projects and helps you keep your team on track.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icon name="chart-bar" className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium">Analytics</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icon name="users" className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-medium">Team Management</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icon name="calendar" className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm font-medium">Timeline View</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Your Project Dashboard',
      description: 'Everything you need at a glance',
      icon: <Icon name="dashboard" className="w-8 h-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Dashboard Overview</h3>
          <p className="text-gray-600">
            Your dashboard provides real-time insights into project health and team productivity.
          </p>
          <Card className="p-4 bg-gray-50">
            <div className="space-y-2">
              <p className="font-medium">Key Metrics:</p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Task completion rates</li>
                <li>• Team velocity trends</li>
                <li>• Upcoming deadlines</li>
                <li>• Resource allocation</li>
              </ul>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 'features',
      title: 'Management Tools',
      description: 'Features designed for project leaders',
      icon: <Icon name="settings" className="w-8 h-8 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Your Management Toolkit</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Icon name="check-circle" className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Team Analytics</p>
                <p className="text-sm text-gray-600">Track performance and identify bottlenecks</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Icon name="check-circle" className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Resource Planning</p>
                <p className="text-sm text-gray-600">Optimize team allocation across projects</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Icon name="check-circle" className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Automated Reports</p>
                <p className="text-sm text-gray-600">Generate progress reports with one click</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ],
}

// Default steps for other roles
const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to TaskMaster!',
    description: 'Let\'s get you started',
    icon: <Icon name="hand-wave" className="w-8 h-8 text-blue-500" />,
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Welcome aboard! 🚀</h3>
        <p className="text-gray-600">
          TaskMaster is your all-in-one platform for managing tasks, collaborating with your team, and tracking progress.
        </p>
      </div>
    ),
  },
  {
    id: 'explore',
    title: 'Explore TaskMaster',
    description: 'Discover what you can do',
    icon: <Icon name="compass" className="w-8 h-8 text-green-500" />,
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Key Features</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Icon name="check-circle" className="w-5 h-5 text-green-500" />
            <p>Task management with Kanban boards</p>
          </div>
          <div className="flex items-center space-x-3">
            <Icon name="check-circle" className="w-5 h-5 text-green-500" />
            <p>Real-time collaboration</p>
          </div>
          <div className="flex items-center space-x-3">
            <Icon name="check-circle" className="w-5 h-5 text-green-500" />
            <p>Repository integration</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    description: 'Start using TaskMaster',
    icon: <Icon name="check-circle" className="w-8 h-8 text-purple-500" />,
    content: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Ready to Go!</h3>
        <p className="text-gray-600">
          You're all set up and ready to start using TaskMaster. Click "Get Started" to go to your dashboard.
        </p>
      </div>
    ),
  },
]

export const OnboardingFlow = ({
  userRole,
  userName,
  onComplete,
  className,
}: OnboardingFlowProps) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  
  const steps = roleBasedSteps[userRole] || defaultSteps
  const totalSteps = steps.length
  
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const handleSkip = () => {
    handleComplete()
  }
  
  const handleComplete = () => {
    setIsExiting(true)
    setTimeout(() => {
      onComplete?.()
      navigate('/dashboard')
    }, 300)
  }
  
  const progress = ((currentStep + 1) / totalSteps) * 100
  const step = steps[currentStep]
  
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center p-4',
        'bg-gradient-to-br from-blue-50 via-white to-purple-50',
        className
      )}
    >
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {!isExiting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 shadow-2xl backdrop-blur-sm bg-white/95">
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Step {currentStep + 1} of {totalSteps}
                    </span>
                    <button
                      onClick={handleSkip}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Skip onboarding
                    </button>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                
                {/* Step Content */}
                <div className="text-center mb-8">
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-4">{step.icon}</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
                    <p className="text-gray-600 mb-6">{step.description}</p>
                  </motion.div>
                </div>
                
                {/* Dynamic Content */}
                <motion.div
                  key={`content-${step.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="mb-8"
                >
                  {step.content}
                </motion.div>
                
                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="min-w-[100px]"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex space-x-2">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={cn(
                          'w-2 h-2 rounded-full transition-[background-color,transform] duration-300',
                          index === currentStep
                            ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                            : 'bg-gray-300 hover:bg-gray-400'
                        )}
                      />
                    ))}
                  </div>
                  
                  <Button
                    onClick={handleNext}
                    className="min-w-[100px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {currentStep === totalSteps - 1 ? 'Get Started' : 'Next'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default OnboardingFlow