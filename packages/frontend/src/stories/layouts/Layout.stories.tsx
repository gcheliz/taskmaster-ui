import type { Meta, StoryObj } from '@storybook/react'
import { BrowserRouter } from 'react-router-dom'
import { Layout, DashboardLayout, AuthLayout, FullscreenLayout } from '../../components/layouts/Layout'
import { PageHeader } from '../../components/layouts/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Grid, GridItem } from '../../components/layouts/Grid'

const meta = {
  title: 'Layouts/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof Layout>

export default meta
type Story = StoryObj<typeof meta>

const SampleContent = () => (
  <div>
    <PageHeader
      title="Dashboard"
      subtitle="Welcome back! Here's what's happening with your projects."
      actions={
        <>
          <Button variant="secondary">Export</Button>
          <Button>Create New Task</Button>
        </>
      }
    />
    
    <Grid cols={1} md={2} lg={3} gap={6}>
      <GridItem>
        <Card>
          <CardHeader>
            <CardTitle>Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">128</p>
            <p className="text-sm text-secondary-600">+12% from last month</p>
          </CardContent>
        </Card>
      </GridItem>
      
      <GridItem>
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8</p>
            <p className="text-sm text-secondary-600">2 near deadline</p>
          </CardContent>
        </Card>
      </GridItem>
      
      <GridItem>
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">24</p>
            <p className="text-sm text-secondary-600">3 new this week</p>
          </CardContent>
        </Card>
      </GridItem>
    </Grid>
  </div>
)

export const Default: Story = {
  render: () => (
    <Layout>
      <SampleContent />
    </Layout>
  ),
}

export const CollapsedSidebar: Story = {
  render: () => (
    <Layout>
      <SampleContent />
    </Layout>
  ),
}

export const WithoutFooter: Story = {
  args: {
    showFooter: false,
  },
  render: (args) => (
    <Layout {...args}>
      <SampleContent />
    </Layout>
  ),
}

export const AuthenticationLayout: Story = {
  render: () => (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Authentication form would go here</p>
        </CardContent>
      </Card>
    </AuthLayout>
  ),
}

export const FullscreenLayoutExample: Story = {
  render: () => (
    <FullscreenLayout>
      <div className="h-full bg-secondary-100 flex items-center justify-center">
        <p className="text-2xl text-secondary-600">Fullscreen Content Area</p>
      </div>
    </FullscreenLayout>
  ),
}