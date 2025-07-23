import type { Meta, StoryObj } from '@storybook/react'
import { BranchHealthVisualization } from '../../components/Repository/BranchHealthVisualization'
import { PullRequestStatus } from '../../components/Repository/PullRequestStatus'

const meta = {
  title: 'Components/Repository/Branch & PR Management',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta

export const BranchHealth: StoryObj<typeof BranchHealthVisualization> = {
  render: () => (
    <div className="max-w-4xl">
      <BranchHealthVisualization repositoryId="1" />
    </div>
  ),
}

export const PullRequests: StoryObj<typeof PullRequestStatus> = {
  render: () => (
    <div className="max-w-4xl">
      <PullRequestStatus repositoryId="1" />
    </div>
  ),
}

export const CompleteDashboard: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">Repository Branch & PR Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BranchHealthVisualization repositoryId="1" className="lg:col-span-2" />
        <PullRequestStatus repositoryId="1" className="lg:col-span-2" />
      </div>

      <div className="border-t pt-8">
        <h3 className="text-xl font-semibold mb-4">Usage Examples</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Branch Health Visualization</h4>
            <p className="text-sm text-slate-600 mb-4">
              Shows the health status of all branches with visual indicators for:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              <li>Sync status (ahead/behind main branch)</li>
              <li>Merge conflicts</li>
              <li>Last activity date</li>
              <li>Associated pull requests</li>
              <li>Overall health score calculation</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Pull Request Status</h4>
            <p className="text-sm text-slate-600 mb-4">
              Displays comprehensive pull request information including:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              <li>PR state (open, merged, closed, draft)</li>
              <li>Review status and approvals</li>
              <li>CI/CD check results</li>
              <li>Code changes statistics</li>
              <li>Merge readiness indicators</li>
              <li>Performance metrics (merge rate, average time to merge)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
}

export const WithMaxItems: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div className="max-w-4xl">
        <h3 className="text-lg font-semibold mb-3">Showing Limited Branches (3 max)</h3>
        <BranchHealthVisualization repositoryId="1" maxBranches={3} />
      </div>
      
      <div className="max-w-4xl">
        <h3 className="text-lg font-semibold mb-3">Showing Limited PRs (3 max)</h3>
        <PullRequestStatus repositoryId="1" maxPullRequests={3} />
      </div>
    </div>
  ),
}