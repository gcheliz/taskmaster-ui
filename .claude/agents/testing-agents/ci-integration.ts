/**
 * CI/CD Integration for Testing Agents
 * 
 * Integrates testing agents with continuous integration pipelines
 * and provides automated test execution and reporting
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileWatcher } from './file-watcher';
import { coverageEnforcement } from './coverage-enforcement';
import { intelligentTestSystem } from './intelligent-test-system';

export interface CIIntegrationOptions {
  provider: 'github' | 'gitlab' | 'jenkins' | 'circle';
  parallel?: boolean;
  maxWorkers?: number;
  cacheEnabled?: boolean;
  artifactPaths?: string[];
  notificationChannels?: NotificationChannel[];
}

export interface NotificationChannel {
  type: 'slack' | 'email' | 'teams' | 'webhook';
  config: any;
}

export interface PipelineStage {
  name: string;
  jobs: Job[];
  parallel?: boolean;
  condition?: string;
}

export interface Job {
  name: string;
  steps: Step[];
  needs?: string[];
  timeout?: number;
  retries?: number;
}

export interface Step {
  name: string;
  run?: string;
  uses?: string;
  with?: Record<string, any>;
  env?: Record<string, string>;
}

export class CIIntegration {
  constructor(private options: CIIntegrationOptions) {
    this.options = {
      parallel: true,
      maxWorkers: 4,
      cacheEnabled: true,
      artifactPaths: ['coverage/', 'test-results/'],
      ...options,
    };
  }

  /**
   * Generate CI configuration
   */
  async generateCIConfig(projectPath: string): Promise<void> {
    const config = this.buildPipelineConfig();
    
    switch (this.options.provider) {
      case 'github':
        await this.generateGitHubActions(projectPath, config);
        break;
      case 'gitlab':
        await this.generateGitLabCI(projectPath, config);
        break;
      case 'jenkins':
        await this.generateJenkinsfile(projectPath, config);
        break;
      case 'circle':
        await this.generateCircleCI(projectPath, config);
        break;
    }
  }

  /**
   * Build pipeline configuration
   */
  private buildPipelineConfig(): PipelineStage[] {
    return [
      {
        name: 'setup',
        jobs: [{
          name: 'install',
          steps: [
            {
              name: 'Checkout code',
              uses: 'actions/checkout@v3',
            },
            {
              name: 'Setup PNPM',
              uses: 'pnpm/action-setup@v2',
              with: { version: 8 },
            },
            {
              name: 'Setup Node.js',
              uses: 'actions/setup-node@v3',
              with: {
                'node-version': 18,
                cache: 'pnpm',
              },
            },
            {
              name: 'Install dependencies',
              run: 'pnpm install --frozen-lockfile',
            },
          ],
        }],
      },
      {
        name: 'test',
        parallel: this.options.parallel,
        jobs: [
          this.createBackendTestJob(),
          this.createFrontendTestJob(),
          this.createE2ETestJob(),
        ],
      },
      {
        name: 'coverage',
        jobs: [{
          name: 'coverage-check',
          needs: ['backend-tests', 'frontend-tests'],
          steps: [
            {
              name: 'Merge coverage reports',
              run: `
                mkdir -p coverage
                pnpm run coverage:merge
              `,
            },
            {
              name: 'Check coverage thresholds',
              run: `
                node -e "
                const { coverageEnforcement } = require('.claude/agents/testing-agents/coverage-enforcement');
                coverageEnforcement.checkCoverage('.')
                  .then(report => {
                    if (!report.passed) {
                      console.error('Coverage thresholds not met!');
                      process.exit(1);
                    }
                  });
                "
              `,
            },
            {
              name: 'Upload coverage',
              uses: 'codecov/codecov-action@v3',
              with: {
                files: './coverage/lcov.info',
                flags: 'unittests',
              },
            },
          ],
        }],
      },
      {
        name: 'intelligent-tests',
        condition: "github.event_name == 'pull_request'",
        jobs: [{
          name: 'generate-missing-tests',
          steps: [
            {
              name: 'Analyze code changes',
              run: `
                git diff --name-only origin/main...HEAD > changed-files.txt
              `,
            },
            {
              name: 'Generate intelligent tests',
              run: `
                node -e "
                const fs = require('fs');
                const { intelligentTestSystem } = require('.claude/agents/testing-agents/intelligent-test-system');
                
                const files = fs.readFileSync('changed-files.txt', 'utf-8')
                  .split('\\n')
                  .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
                
                intelligentTestSystem.autoGenerateTests(files, {
                  coverage: {
                    statements: 90,
                    branches: 85,
                    functions: 95,
                    lines: 90
                  }
                });
                "
              `,
            },
          ],
        }],
      },
    ];
  }

  /**
   * Create backend test job
   */
  private createBackendTestJob(): Job {
    return {
      name: 'backend-tests',
      timeout: 15,
      retries: 2,
      steps: [
        {
          name: 'Run backend tests',
          run: 'pnpm --filter=backend run test',
          env: {
            NODE_ENV: 'test',
            CI: 'true',
          },
        },
        {
          name: 'Generate backend coverage',
          run: 'pnpm --filter=backend run test:coverage',
        },
        {
          name: 'Upload backend coverage',
          uses: 'actions/upload-artifact@v3',
          with: {
            name: 'backend-coverage',
            path: 'packages/backend/coverage/',
          },
        },
      ],
    };
  }

  /**
   * Create frontend test job
   */
  private createFrontendTestJob(): Job {
    return {
      name: 'frontend-tests',
      timeout: 20,
      retries: 2,
      steps: [
        {
          name: 'Run frontend tests',
          run: 'pnpm --filter=frontend run test',
          env: {
            NODE_ENV: 'test',
            CI: 'true',
          },
        },
        {
          name: 'Generate frontend coverage',
          run: 'pnpm --filter=frontend run test:coverage',
        },
        {
          name: 'Upload frontend coverage',
          uses: 'actions/upload-artifact@v3',
          with: {
            name: 'frontend-coverage',
            path: 'packages/frontend/coverage/',
          },
        },
      ],
    };
  }

  /**
   * Create E2E test job
   */
  private createE2ETestJob(): Job {
    return {
      name: 'e2e-tests',
      timeout: 30,
      retries: 1,
      steps: [
        {
          name: 'Install Playwright browsers',
          run: 'pnpm exec playwright install --with-deps',
        },
        {
          name: 'Run E2E tests',
          run: 'pnpm run test:e2e',
          env: {
            CI: 'true',
          },
        },
        {
          name: 'Upload E2E artifacts',
          uses: 'actions/upload-artifact@v3',
          with: {
            name: 'e2e-results',
            path: 'e2e/test-results/',
          },
        },
      ],
    };
  }

  /**
   * Generate GitHub Actions workflow
   */
  private async generateGitHubActions(
    projectPath: string,
    stages: PipelineStage[]
  ): Promise<void> {
    const workflow = {
      name: 'Test Suite',
      on: {
        push: {
          branches: ['main', 'develop'],
        },
        pull_request: {
          types: ['opened', 'synchronize', 'reopened'],
        },
      },
      env: {
        PNPM_VERSION: '8',
        NODE_VERSION: '18',
      },
      concurrency: {
        group: '${{ github.workflow }}-${{ github.ref }}',
        'cancel-in-progress': true,
      },
      jobs: this.convertToGitHubJobs(stages),
    };

    const workflowPath = path.join(projectPath, '.github', 'workflows', 'test.yml');
    await fs.mkdir(path.dirname(workflowPath), { recursive: true });
    await fs.writeFile(workflowPath, this.toYAML(workflow));
  }

  /**
   * Convert stages to GitHub Actions jobs
   */
  private convertToGitHubJobs(stages: PipelineStage[]): Record<string, any> {
    const jobs: Record<string, any> = {};

    for (const stage of stages) {
      for (const job of stage.jobs) {
        jobs[job.name] = {
          name: job.name,
          'runs-on': 'ubuntu-latest',
          needs: job.needs,
          timeout: job.timeout,
          if: stage.condition,
          steps: job.steps.map(step => this.convertStep(step)),
        };
      }
    }

    return jobs;
  }

  /**
   * Convert step to GitHub Actions format
   */
  private convertStep(step: Step): any {
    const converted: any = {
      name: step.name,
    };

    if (step.uses) {
      converted.uses = step.uses;
      if (step.with) converted.with = step.with;
    } else if (step.run) {
      converted.run = step.run;
    }

    if (step.env) {
      converted.env = step.env;
    }

    return converted;
  }

  /**
   * Generate GitLab CI configuration
   */
  private async generateGitLabCI(
    projectPath: string,
    stages: PipelineStage[]
  ): Promise<void> {
    const config = {
      stages: stages.map(s => s.name),
      variables: {
        PNPM_VERSION: '8',
        NODE_VERSION: '18',
      },
      '.setup': {
        before_script: [
          'npm install -g pnpm@${PNPM_VERSION}',
          'pnpm install --frozen-lockfile',
        ],
      },
    };

    // Add jobs
    for (const stage of stages) {
      for (const job of stage.jobs) {
        config[job.name] = {
          stage: stage.name,
          extends: '.setup',
          script: job.steps
            .filter(s => s.run)
            .map(s => s.run),
          artifacts: {
            paths: this.options.artifactPaths,
            expire_in: '1 week',
          },
          retry: job.retries || 0,
          timeout: `${job.timeout || 30}m`,
        };
      }
    }

    const configPath = path.join(projectPath, '.gitlab-ci.yml');
    await fs.writeFile(configPath, this.toYAML(config));
  }

  /**
   * Generate Jenkinsfile
   */
  private async generateJenkinsfile(
    projectPath: string,
    stages: PipelineStage[]
  ): Promise<void> {
    let jenkinsfile = `pipeline {
  agent any
  
  environment {
    PNPM_VERSION = '8'
    NODE_VERSION = '18'
  }
  
  options {
    timestamps()
    timeout(time: 1, unit: 'HOURS')
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }
  
  stages {
`;

    for (const stage of stages) {
      jenkinsfile += `    stage('${stage.name}') {\n`;
      
      if (stage.parallel && stage.jobs.length > 1) {
        jenkinsfile += '      parallel {\n';
        for (const job of stage.jobs) {
          jenkinsfile += `        stage('${job.name}') {\n`;
          jenkinsfile += '          steps {\n';
          for (const step of job.steps) {
            if (step.run) {
              jenkinsfile += `            sh '${step.run}'\n`;
            }
          }
          jenkinsfile += '          }\n';
          jenkinsfile += '        }\n';
        }
        jenkinsfile += '      }\n';
      } else {
        jenkinsfile += '      steps {\n';
        for (const job of stage.jobs) {
          for (const step of job.steps) {
            if (step.run) {
              jenkinsfile += `        sh '${step.run}'\n`;
            }
          }
        }
        jenkinsfile += '      }\n';
      }
      
      jenkinsfile += '    }\n';
    }

    jenkinsfile += `  }
  
  post {
    always {
      archiveArtifacts artifacts: '${this.options.artifactPaths.join(', ')}', allowEmptyArchive: true
      junit '**/test-results/*.xml'
    }
    failure {
      emailext (
        subject: "Build Failed: \${env.JOB_NAME} - \${env.BUILD_NUMBER}",
        body: "Build failed. Check console output at \${env.BUILD_URL}",
        to: "\${env.CHANGE_AUTHOR_EMAIL}"
      )
    }
  }
}`;

    const jenkinsfilePath = path.join(projectPath, 'Jenkinsfile');
    await fs.writeFile(jenkinsfilePath, jenkinsfile);
  }

  /**
   * Generate CircleCI configuration
   */
  private async generateCircleCI(
    projectPath: string,
    stages: PipelineStage[]
  ): Promise<void> {
    const config = {
      version: 2.1,
      executors: {
        'node-executor': {
          docker: [{ image: 'cimg/node:18.0' }],
        },
      },
      commands: {
        'setup-deps': {
          steps: [
            'checkout',
            {
              run: {
                name: 'Install PNPM',
                command: 'npm install -g pnpm@8',
              },
            },
            {
              restore_cache: {
                keys: ['pnpm-packages-{{ checksum "pnpm-lock.yaml" }}'],
              },
            },
            {
              run: {
                name: 'Install dependencies',
                command: 'pnpm install --frozen-lockfile',
              },
            },
            {
              save_cache: {
                key: 'pnpm-packages-{{ checksum "pnpm-lock.yaml" }}',
                paths: ['~/.pnpm-store'],
              },
            },
          ],
        },
      },
      jobs: {},
      workflows: {
        version: 2,
        test: {
          jobs: [],
        },
      },
    };

    // Add jobs
    for (const stage of stages) {
      for (const job of stage.jobs) {
        config.jobs[job.name] = {
          executor: 'node-executor',
          steps: [
            'setup-deps',
            ...job.steps
              .filter(s => s.run)
              .map(s => ({
                run: {
                  name: s.name,
                  command: s.run,
                },
              })),
            {
              store_artifacts: {
                path: this.options.artifactPaths[0],
              },
            },
          ],
        };
        
        config.workflows.test.jobs.push({
          [job.name]: {
            requires: job.needs || [],
          },
        });
      }
    }

    const configPath = path.join(projectPath, '.circleci', 'config.yml');
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, this.toYAML(config));
  }

  /**
   * Convert object to YAML
   */
  private toYAML(obj: any, indent = 0): string {
    let yaml = '';
    const spaces = ' '.repeat(indent);

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      yaml += `${spaces}${key}:`;

      if (typeof value === 'object' && !Array.isArray(value)) {
        yaml += '\n' + this.toYAML(value, indent + 2);
      } else if (Array.isArray(value)) {
        yaml += '\n';
        for (const item of value) {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n${this.toYAML(item, indent + 4)}`;
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        }
      } else {
        yaml += ` ${value}\n`;
      }
    }

    return yaml;
  }

  /**
   * Setup pre-commit hooks
   */
  async setupPreCommitHooks(projectPath: string): Promise<void> {
    const config = {
      repos: [
        {
          repo: 'local',
          hooks: [
            {
              id: 'test-coverage',
              name: 'Check test coverage',
              entry: 'pnpm run test:coverage:check',
              language: 'system',
              'pass_filenames': false,
              types: ['file'],
              files: '\\.(ts|tsx|js|jsx)$',
            },
            {
              id: 'intelligent-tests',
              name: 'Generate missing tests',
              entry: `node -e "
                const { intelligentTestSystem } = require('.claude/agents/testing-agents');
                const files = process.argv.slice(1);
                intelligentTestSystem.autoGenerateTests(files, {
                  coverage: { statements: 80, branches: 80, functions: 80, lines: 80 }
                });
              "`,
              language: 'system',
              types: ['file'],
              files: '\\.(ts|tsx|js|jsx)$',
              exclude: '\\.(test|spec)\\.',
            },
          ],
        },
      ],
    };

    const configPath = path.join(projectPath, '.pre-commit-config.yaml');
    await fs.writeFile(configPath, this.toYAML(config));
  }

  /**
   * Generate test scripts for package.json
   */
  generateTestScripts(): Record<string, string> {
    return {
      'test': 'pnpm run test:backend && pnpm run test:frontend',
      'test:backend': 'pnpm --filter=backend run test',
      'test:frontend': 'pnpm --filter=frontend run test',
      'test:e2e': 'pnpm exec playwright test',
      'test:coverage': 'pnpm run test:coverage:backend && pnpm run test:coverage:frontend',
      'test:coverage:backend': 'pnpm --filter=backend run test:coverage',
      'test:coverage:frontend': 'pnpm --filter=frontend run test:coverage',
      'test:coverage:check': 'node .claude/agents/testing-agents/scripts/check-coverage.js',
      'test:coverage:merge': 'nyc merge coverage coverage/merged && nyc report -t coverage/merged',
      'test:watch': 'pnpm run test:watch:backend & pnpm run test:watch:frontend',
      'test:watch:backend': 'pnpm --filter=backend run test:watch',
      'test:watch:frontend': 'pnpm --filter=frontend run test:watch',
      'test:intelligent': 'node .claude/agents/testing-agents/scripts/intelligent-test.js',
      'test:generate': 'node .claude/agents/testing-agents/scripts/generate-tests.js',
    };
  }

  /**
   * Create notification configuration
   */
  async setupNotifications(channels: NotificationChannel[]): Promise<void> {
    for (const channel of channels) {
      switch (channel.type) {
        case 'slack':
          await this.setupSlackNotification(channel.config);
          break;
        case 'email':
          await this.setupEmailNotification(channel.config);
          break;
        case 'teams':
          await this.setupTeamsNotification(channel.config);
          break;
        case 'webhook':
          await this.setupWebhookNotification(channel.config);
          break;
      }
    }
  }

  /**
   * Setup Slack notification
   */
  private async setupSlackNotification(config: any): Promise<void> {
    // Implementation would integrate with Slack webhook
    console.log('Setting up Slack notifications:', config);
  }

  /**
   * Setup email notification
   */
  private async setupEmailNotification(config: any): Promise<void> {
    // Implementation would configure email notifications
    console.log('Setting up email notifications:', config);
  }

  /**
   * Setup Teams notification
   */
  private async setupTeamsNotification(config: any): Promise<void> {
    // Implementation would integrate with Teams webhook
    console.log('Setting up Teams notifications:', config);
  }

  /**
   * Setup webhook notification
   */
  private async setupWebhookNotification(config: any): Promise<void> {
    // Implementation would configure generic webhook
    console.log('Setting up webhook notifications:', config);
  }
}

// Export instance for common CI providers
export const githubIntegration = new CIIntegration({ provider: 'github' });
export const gitlabIntegration = new CIIntegration({ provider: 'gitlab' });
export const jenkinsIntegration = new CIIntegration({ provider: 'jenkins' });
export const circleIntegration = new CIIntegration({ provider: 'circle' });