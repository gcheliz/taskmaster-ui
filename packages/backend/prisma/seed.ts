import { PrismaClient, Priority, TaskStatus } from '@prisma/client'

const prisma = new PrismaClient()

interface SeedOptions {
  skipClean?: boolean;
  minimal?: boolean;
  verbose?: boolean;
}

/**
 * Enhanced database seeding with comprehensive sample data
 */
async function main() {
  const args = process.argv.slice(2);
  const options: SeedOptions = {
    skipClean: args.includes('--skip-clean'),
    minimal: args.includes('--minimal'),
    verbose: args.includes('--verbose')
  };

  console.log('🌱 Starting database seeding...')
  if (options.verbose) {
    console.log('Options:', options);
  }
  
  try {
    // Clean existing data (unless skipped)
    if (!options.skipClean) {
      await cleanDatabase(options.verbose)
    }
    
    // Create sample project
    const project = await createSampleProject(options)
    console.log(`✅ Created project: ${project.name}`)
    
    // Create sample repository
    const repository = await createSampleRepository(project.id, options)
    console.log(`✅ Created repository: ${repository.name}`)
    
    // Create sample tasks
    const tasks = await createSampleTasks(project.id, options)
    console.log(`✅ Created ${tasks.length} sample tasks`)
    
    // Create sample commits
    const commits = await createSampleCommits(repository.id, options)
    console.log(`✅ Created ${commits.length} sample commits`)
    
    // Display summary
    await displaySeedingSummary(options)
    
    console.log('🎉 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during seeding:', (error as Error).message)
    if (options.verbose) {
      console.error('Full error:', error)
    }
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function cleanDatabase(verbose = false) {
  console.log('🧹 Cleaning existing data...')
  
  try {
    // Get counts before deletion for reporting
    const [commitCount, taskCount, repoCount, projectCount] = await Promise.all([
      prisma.commit.count(),
      prisma.task.count(),
      prisma.repository.count(),
      prisma.project.count()
    ]);

    if (verbose && (commitCount + taskCount + repoCount + projectCount > 0)) {
      console.log(`   Removing: ${projectCount} projects, ${repoCount} repositories, ${taskCount} tasks, ${commitCount} commits`);
    }

    // Delete in correct order to respect foreign key constraints
    await prisma.commit.deleteMany({})
    await prisma.task.deleteMany({})
    await prisma.repository.deleteMany({})
    await prisma.project.deleteMany({})
    
    console.log('✅ Database cleaned')
  } catch (error) {
    console.error('❌ Failed to clean database:', (error as Error).message);
    throw error;
  }
}

async function createSampleProject(options: SeedOptions) {
  const projects = [
    {
      name: 'TaskMaster UI Sample',
      description: 'Sample project for TaskMaster UI development and testing',
      path: '/Users/dev/projects/taskmaster-ui'
    }
  ];

  if (!options.minimal) {
    projects.push(
      {
        name: 'Mobile App Backend',
        description: 'REST API backend for mobile application',
        path: '/Users/dev/projects/mobile-backend'
      },
      {
        name: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution with payment integration',
        path: '/Users/dev/projects/ecommerce'
      }
    );
  }

  const createdProjects = [];
  for (const projectData of projects) {
    const project = await prisma.project.create({ data: projectData });
    createdProjects.push(project);
    if (options.verbose) {
      console.log(`   Created project: ${project.name}`);
    }
  }

  return createdProjects[0]; // Return main project
}

async function createSampleRepository(projectId: string, options: SeedOptions) {
  const repositories = [
    {
      name: 'taskmaster-ui',
      url: 'https://github.com/example/taskmaster-ui',
      path: '/Users/dev/projects/taskmaster-ui',
      branch: 'main',
      projectId: projectId
    }
  ];

  if (!options.minimal) {
    repositories.push(
      {
        name: 'taskmaster-mobile',
        url: 'https://github.com/example/taskmaster-mobile',
        path: '/Users/dev/projects/taskmaster-mobile',
        branch: 'develop',
        projectId: projectId
      }
    );
  }

  const createdRepositories = [];
  for (const repoData of repositories) {
    const repository = await prisma.repository.create({ data: repoData });
    createdRepositories.push(repository);
    if (options.verbose) {
      console.log(`   Created repository: ${repository.name}`);
    }
  }

  return createdRepositories[0]; // Return main repository
}

async function createSampleTasks(projectId: string, options: SeedOptions) {
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

  // If minimal mode, only create first 3 tasks
  const tasksToCreate = options.minimal ? tasksData.slice(0, 3) : tasksData;
  
  const tasks = []
  for (const taskData of tasksToCreate) {
    const task = await prisma.task.create({
      data: taskData
    })
    tasks.push(task)
    if (options.verbose) {
      console.log(`   Created task: ${task.title}`);
    }
  }
  
  return tasks
}

async function createSampleCommits(repositoryId: string, options: SeedOptions) {
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

  // If minimal mode, only create first 2 commits
  const commitsToCreate = options.minimal ? commitsData.slice(0, 2) : commitsData;
  
  const commits = []
  for (const commitData of commitsToCreate) {
    const commit = await prisma.commit.create({
      data: commitData
    })
    commits.push(commit)
    if (options.verbose) {
      console.log(`   Created commit: ${commit.hash} - ${commit.message}`);
    }
  }
  
  return commits
}

/**
 * Display seeding summary with database statistics
 */
async function displaySeedingSummary(options: SeedOptions) {
  try {
    const [projectCount, repoCount, taskCount, commitCount] = await Promise.all([
      prisma.project.count(),
      prisma.repository.count(),
      prisma.task.count(),
      prisma.commit.count()
    ]);

    console.log('\n📊 Seeding Summary:');
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Repositories: ${repoCount}`);
    console.log(`   Tasks: ${taskCount}`);
    console.log(`   Commits: ${commitCount}`);
    
    if (options.verbose) {
      // Show task status breakdown
      const [pendingTasks, inProgressTasks, completedTasks] = await Promise.all([
        prisma.task.count({ where: { status: TaskStatus.PENDING } }),
        prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
        prisma.task.count({ where: { status: TaskStatus.COMPLETED } })
      ]);

      console.log('\n📋 Task Status Breakdown:');
      console.log(`   Pending: ${pendingTasks}`);
      console.log(`   In Progress: ${inProgressTasks}`);
      console.log(`   Completed: ${completedTasks}`);
    }
  } catch (error) {
    console.warn('⚠️ Could not generate seeding summary:', (error as Error).message);
  }
}

// Add seeding script options support
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Database Seeding Script');
    console.log('');
    console.log('Usage: pnpm db:seed [options]');
    console.log('');
    console.log('Options:');
    console.log('  --minimal       Create minimal sample data');
    console.log('  --skip-clean    Skip cleaning existing data');
    console.log('  --verbose       Show verbose output');
    console.log('  --help, -h      Show this help message');
    process.exit(0);
  }

  main()
    .catch((e) => {
      console.error('❌ Seeding failed:', e.message)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}