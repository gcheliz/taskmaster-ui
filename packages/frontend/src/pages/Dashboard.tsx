import React from 'react'
import { PageHeader } from '../components/layouts/PageHeader'
import { Grid, GridItem } from '../components/layouts/Grid'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'

const Dashboard = () => {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your projects."
      />
      
      <Grid cols={1} md={2} lg={4} gap={6}>
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
              <CardTitle>In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">24</p>
              <p className="text-sm text-secondary-600">8 near deadline</p>
            </CardContent>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardHeader>
              <CardTitle>Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">92</p>
              <p className="text-sm text-secondary-600">This month</p>
            </CardContent>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-secondary-600">3 online now</p>
            </CardContent>
          </Card>
        </GridItem>
      </Grid>
    </>
  )
}

export default Dashboard