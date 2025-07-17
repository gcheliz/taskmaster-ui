import { PrismaClient, Priority, TaskStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // Clean existing data
    await cleanDatabase()
    
    // Create sample project
    const project = await createSampleProject()
    console.log(`✅ Created project: ${project.name}`)
    
    // Create sample repository
    const repository = await createSampleRepository(project.id)
    console.log(`✅ Created repository: ${repository.name}`)
    
    // Create sample tasks
    const tasks = await createSampleTasks(project.id)
    console.log(`✅ Created ${tasks.length} sample tasks`)
    
    // Create sample commits
    const commits = await createSampleCommits(repository.id)
    console.log(`✅ Created ${commits.length} sample commits`)
    
    console.log('🎉 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function cleanDatabase() {
  console.log('🧹 Cleaning existing data...')
  
  // Delete in correct order to respect foreign key constraints
  await prisma.commit.deleteMany({})
  await prisma.task.deleteMany({})
  await prisma.repository.deleteMany({})
  await prisma.project.deleteMany({})
  
  console.log('✅ Database cleaned')
}

async function createSampleProject() {
  return await prisma.project.create({
    data: {
      name: 'TaskMaster UI Sample',
      description: 'Sample project for TaskMaster UI development and testing',
      path: '/Users/dev/projects/taskmaster-ui'
    }
  })
}

async function createSampleRepository(projectId: string) {
  return await prisma.repository.create({
    data: {
      name: 'taskmaster-ui',
      url: 'https://github.com/example/taskmaster-ui',
      path: '/Users/dev/projects/taskmaster-ui',
      branch: 'main',
      projectId: projectId
    }
  })
}

async function createSampleTasks(projectId: string) {
  // Sample tasks based on the frontend sample data
  const tasksData = [
    {
      title: 'Implement User Authentication',
      description: 'Create a secure user authentication system with JWT tokens and role-based access control.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      order: 1,
      dueDate: new Date('2025-01-20T17:00:00.000Z'),
      projectId: projectId
    },
    {
      title: 'Design Database Schema',
      description: 'Create a comprehensive database schema for the task management system with proper relationships and constraints.',
      status: TaskStatus.COMPLETED,
      priority: Priority.HIGH,
      order: 2,
      dueDate: new Date('2025-01-15T17:00:00.000Z'),
      projectId: projectId
    },
    {
      title: 'Create Task Board UI Component',
      description: 'Build a React component for the Kanban-style task board with drag-and-drop functionality.',
      status: TaskStatus.PENDING,
      priority: Priority.MEDIUM,
      order: 3,
      dueDate: new Date('2025-01-25T17:00:00.000Z'),
      projectId: projectId
    },
    {
      title: 'Implement Real-time Updates',
      description: 'Add WebSocket support for real-time task updates across all connected clients.',
      status: TaskStatus.PENDING,
      priority: Priority.MEDIUM,
      order: 4,
      dueDate: new Date('2025-01-30T17:00:00.000Z'),
      projectId: projectId
    },
    {
      title: 'Add Task Comments Feature',
      description: 'Allow users to add comments to tasks with rich text formatting and file attachments.',
      status: TaskStatus.PENDING,
      priority: Priority.LOW,
      order: 5,
      dueDate: new Date('2025-02-05T17:00:00.000Z'),
      projectId: projectId
    },
    {
      title: 'Setup CI/CD Pipeline',
      description: 'Create automated build and deployment pipeline using GitHub Actions.',
      status: TaskStatus.BLOCKED,
      priority: Priority.HIGH,
      order: 6,
      dueDate: new Date('2025-01-22T17:00:00.000Z'),
      projectId: projectId
    },
    {
      title: 'Create API Documentation',
      description: 'Generate comprehensive API documentation using OpenAPI/Swagger with interactive examples.',
      status: TaskStatus.PENDING,
      priority: Priority.MEDIUM,
      order: 7,
      dueDate: new Date('2025-01-28T17:00:00.000Z'),
      projectId: projectId
    },
    {
      title: 'Implement Task Filtering',
      description: 'Add advanced filtering options for tasks including status, priority, assignee, and date ranges.',
      status: TaskStatus.PENDING,
      priority: Priority.LOW,
      order: 8,
      dueDate: new Date('2025-02-10T17:00:00.000Z'),
      projectId: projectId
    },
    {
      title: 'Add Email Notifications',
      description: 'Implement email notification system for task assignments, due dates, and status changes.',
      status: TaskStatus.CANCELLED,
      priority: Priority.MEDIUM,
      order: 9,
      dueDate: new Date('2025-02-01T17:00:00.000Z'),
      projectId: projectId
    },
    {
      title: 'Mobile App Development',
      description: 'Create a React Native mobile app for task management on iOS and Android.',
      status: TaskStatus.PENDING,
      priority: Priority.LOW,
      order: 10,
      dueDate: new Date('2025-03-15T17:00:00.000Z'),
      projectId: projectId
    }
  ]
  
  const tasks = []
  for (const taskData of tasksData) {
    const task = await prisma.task.create({
      data: taskData
    })
    tasks.push(task)
  }
  
  return tasks
}

async function createSampleCommits(repositoryId: string) {
  const commitsData = [
    {
      hash: 'abc123def456',
      message: 'Initial project setup and configuration',
      author: 'John Doe <john.doe@example.com>',
      timestamp: new Date('2025-01-08T09:00:00.000Z'),
      repositoryId: repositoryId
    },
    {
      hash: 'def456ghi789',
      message: 'Add basic authentication middleware',
      author: 'John Doe <john.doe@example.com>',
      timestamp: new Date('2025-01-10T14:30:00.000Z'),
      repositoryId: repositoryId
    },
    {
      hash: 'ghi789jkl012',
      message: 'Create database schema migration',
      author: 'Jane Smith <jane.smith@example.com>',
      timestamp: new Date('2025-01-11T16:45:00.000Z'),
      repositoryId: repositoryId
    },
    {
      hash: 'jkl012mno345',
      message: 'Implement task board UI component',
      author: 'Mike Johnson <mike.johnson@example.com>',
      timestamp: new Date('2025-01-12T10:20:00.000Z'),
      repositoryId: repositoryId
    },
    {
      hash: 'mno345pqr678',
      message: 'Add WebSocket support for real-time updates',
      author: 'Sarah Wilson <sarah.wilson@example.com>',
      timestamp: new Date('2025-01-13T11:15:00.000Z'),
      repositoryId: repositoryId
    }
  ]
  
  const commits = []
  for (const commitData of commitsData) {
    const commit = await prisma.commit.create({
      data: commitData
    })
    commits.push(commit)
  }
  
  return commits
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })