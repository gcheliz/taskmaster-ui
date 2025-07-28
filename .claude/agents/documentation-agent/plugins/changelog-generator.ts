/**
 * Changelog Generator Plugin
 * 
 * Generates changelog from git commits following conventional commits format
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  DocumentationPlugin,
  DocumentationType,
  PluginContext,
  DocumentationItem
} from '../core-engine';

const execAsync = promisify(exec);

interface GitCommit {
  hash: string;
  date: Date;
  author: string;
  email: string;
  subject: string;
  body: string;
  type?: string;
  scope?: string;
  breaking?: boolean;
  closes?: string[];
}

interface ChangelogEntry {
  version: string;
  date: Date;
  commits: GitCommit[];
  breaking: GitCommit[];
  features: GitCommit[];
  fixes: GitCommit[];
  performance: GitCommit[];
  refactors: GitCommit[];
  docs: GitCommit[];
  styles: GitCommit[];
  tests: GitCommit[];
  chores: GitCommit[];
  others: GitCommit[];
}

interface VersionInfo {
  version: string;
  tag?: string;
  date: Date;
  commitCount: number;
}

export class ChangelogGeneratorPlugin implements DocumentationPlugin {
  name = 'changelog-generator';
  type = DocumentationType.CHANGELOG;
  description = 'Generates changelog from git commits using conventional commits format';

  private commits: GitCommit[] = [];
  private versions: VersionInfo[] = [];
  private currentVersion: string = '1.0.0';

  async generate(context: PluginContext): Promise<DocumentationItem[]> {
    // Reset state
    this.commits = [];
    this.versions = [];

    // Get current version from package.json
    await this.getCurrentVersion(context.projectRoot);

    // Fetch git commits
    await this.fetchGitCommits(context.projectRoot);

    // Fetch version tags
    await this.fetchVersionTags(context.projectRoot);

    // Generate changelog entries
    const entries = this.generateChangelogEntries();

    // Format changelog
    const changelogContent = this.formatChangelog(entries);

    // Create documentation items
    const items: DocumentationItem[] = [];

    // Main CHANGELOG
    items.push({
      id: 'changelog-main',
      name: 'CHANGELOG.md',
      type: 'changelog',
      category: 'Release Documentation',
      description: 'Project changelog with version history',
      tags: ['changelog', 'releases', 'versions'],
      metadata: {
        content: changelogContent,
        versions: this.versions.map(v => v.version),
        format: 'markdown',
        convention: 'conventional-commits'
      }
    });

    // Generate release notes for latest version
    if (entries.length > 0) {
      const latestRelease = this.generateReleaseNotes(entries[0]);
      items.push({
        id: 'release-latest',
        name: 'Latest Release Notes',
        type: 'changelog',
        category: 'Release Documentation',
        description: `Release notes for version ${entries[0].version}`,
        tags: ['release', 'latest', entries[0].version],
        metadata: {
          content: latestRelease,
          version: entries[0].version,
          date: entries[0].date
        }
      });
    }

    return items;
  }

  /**
   * Get current version from package.json
   */
  private async getCurrentVersion(projectRoot: string): Promise<void> {
    try {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      this.currentVersion = packageJson.version || '1.0.0';
    } catch (error) {
      console.warn('Failed to read package.json version:', error);
    }
  }

  /**
   * Fetch git commits
   */
  private async fetchGitCommits(projectRoot: string): Promise<void> {
    try {
      // Get commit log with specific format
      const format = '%H|%aI|%an|%ae|%s|%b|%n--END--';
      const { stdout } = await execAsync(
        `git log --format="${format}"`,
        { cwd: projectRoot, maxBuffer: 10 * 1024 * 1024 }
      );

      // Parse commits
      const commitStrings = stdout.split('\n--END--\n').filter(Boolean);
      
      this.commits = commitStrings.map(commitStr => {
        const parts = commitStr.trim().split('|');
        if (parts.length < 6) return null;

        const [hash, dateStr, author, email, subject, ...bodyParts] = parts;
        const body = bodyParts.join('|').trim();

        // Parse conventional commit
        const parsed = this.parseConventionalCommit(subject, body);

        return {
          hash,
          date: new Date(dateStr),
          author,
          email,
          subject,
          body,
          ...parsed
        };
      }).filter(Boolean) as GitCommit[];

    } catch (error) {
      console.warn('Failed to fetch git commits:', error);
      // Generate mock commits for demo
      this.commits = this.generateMockCommits();
    }
  }

  /**
   * Parse conventional commit message
   */
  private parseConventionalCommit(subject: string, body: string): Partial<GitCommit> {
    // Conventional commit regex: type(scope): subject
    const regex = /^(\w+)(?:\(([^)]+)\))?: (.+)$/;
    const match = subject.match(regex);

    if (!match) {
      return { type: 'other' };
    }

    const [, type, scope, description] = match;
    
    // Check for breaking changes
    const breaking = subject.includes('!') || body.toLowerCase().includes('breaking change');
    
    // Extract closes/fixes references
    const closes: string[] = [];
    const closeRegex = /(?:closes?|fix(?:es)?|resolves?)\s+#(\d+)/gi;
    let closeMatch;
    while ((closeMatch = closeRegex.exec(body)) !== null) {
      closes.push(closeMatch[1]);
    }

    return {
      type: type.toLowerCase(),
      scope,
      breaking,
      closes: closes.length > 0 ? closes : undefined
    };
  }

  /**
   * Fetch version tags
   */
  private async fetchVersionTags(projectRoot: string): Promise<void> {
    try {
      // Get all tags
      const { stdout } = await execAsync(
        'git tag -l --sort=-version:refname --format="%(refname:short)|%(creatordate:iso)|%(subject)"',
        { cwd: projectRoot }
      );

      if (!stdout.trim()) {
        // No tags, create versions based on commit count
        this.createVersionsFromCommits();
        return;
      }

      // Parse tags
      const tagLines = stdout.trim().split('\n');
      this.versions = tagLines.map(line => {
        const [tag, dateStr] = line.split('|');
        return {
          version: tag.replace(/^v/, ''),
          tag,
          date: new Date(dateStr),
          commitCount: 0
        };
      });

      // Add unreleased version if there are new commits
      if (this.commits.length > 0 && this.commits[0].date > this.versions[0].date) {
        this.versions.unshift({
          version: 'Unreleased',
          date: new Date(),
          commitCount: 0
        });
      }

    } catch (error) {
      console.warn('Failed to fetch git tags:', error);
      this.createVersionsFromCommits();
    }
  }

  /**
   * Create versions from commits when no tags exist
   */
  private createVersionsFromCommits(): void {
    if (this.commits.length === 0) return;

    // Group commits by month
    const monthGroups = new Map<string, GitCommit[]>();
    
    for (const commit of this.commits) {
      const monthKey = `${commit.date.getFullYear()}-${commit.date.getMonth() + 1}`;
      if (!monthGroups.has(monthKey)) {
        monthGroups.set(monthKey, []);
      }
      monthGroups.get(monthKey)!.push(commit);
    }

    // Create versions for each month
    let versionNumber = 1;
    const sortedMonths = Array.from(monthGroups.keys()).sort().reverse();
    
    this.versions = sortedMonths.map((monthKey, index) => {
      const commits = monthGroups.get(monthKey)!;
      const isLatest = index === 0;
      
      return {
        version: isLatest ? 'Unreleased' : `0.${versionNumber++}.0`,
        date: commits[0].date,
        commitCount: commits.length
      };
    });
  }

  /**
   * Generate changelog entries
   */
  private generateChangelogEntries(): ChangelogEntry[] {
    const entries: ChangelogEntry[] = [];

    for (let i = 0; i < this.versions.length; i++) {
      const version = this.versions[i];
      const previousVersion = this.versions[i + 1];
      
      // Get commits for this version
      const versionCommits = this.getCommitsForVersion(version, previousVersion);
      
      if (versionCommits.length === 0) continue;

      // Categorize commits
      const entry: ChangelogEntry = {
        version: version.version,
        date: version.date,
        commits: versionCommits,
        breaking: [],
        features: [],
        fixes: [],
        performance: [],
        refactors: [],
        docs: [],
        styles: [],
        tests: [],
        chores: [],
        others: []
      };

      // Sort commits by type
      for (const commit of versionCommits) {
        if (commit.breaking) {
          entry.breaking.push(commit);
        }

        switch (commit.type) {
          case 'feat':
          case 'feature':
            entry.features.push(commit);
            break;
          case 'fix':
          case 'bugfix':
            entry.fixes.push(commit);
            break;
          case 'perf':
          case 'performance':
            entry.performance.push(commit);
            break;
          case 'refactor':
            entry.refactors.push(commit);
            break;
          case 'docs':
          case 'documentation':
            entry.docs.push(commit);
            break;
          case 'style':
            entry.styles.push(commit);
            break;
          case 'test':
          case 'tests':
            entry.tests.push(commit);
            break;
          case 'chore':
          case 'build':
          case 'ci':
            entry.chores.push(commit);
            break;
          default:
            entry.others.push(commit);
        }
      }

      entries.push(entry);
    }

    return entries;
  }

  /**
   * Get commits for a specific version
   */
  private getCommitsForVersion(version: VersionInfo, previousVersion?: VersionInfo): GitCommit[] {
    return this.commits.filter(commit => {
      if (previousVersion) {
        return commit.date <= version.date && commit.date > previousVersion.date;
      }
      return commit.date <= version.date;
    });
  }

  /**
   * Format changelog
   */
  private formatChangelog(entries: ChangelogEntry[]): string {
    const lines: string[] = [];

    // Header
    lines.push('# Changelog');
    lines.push('');
    lines.push('All notable changes to this project will be documented in this file.');
    lines.push('');
    lines.push('The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),');
    lines.push('and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).');
    lines.push('');

    // Entries
    for (const entry of entries) {
      lines.push(`## [${entry.version}] - ${this.formatDate(entry.date)}`);
      lines.push('');

      // Breaking changes
      if (entry.breaking.length > 0) {
        lines.push('### ⚠️ BREAKING CHANGES');
        lines.push('');
        for (const commit of entry.breaking) {
          lines.push(`- ${this.formatCommitMessage(commit)}`);
        }
        lines.push('');
      }

      // Features
      if (entry.features.length > 0) {
        lines.push('### ✨ Features');
        lines.push('');
        for (const commit of entry.features) {
          lines.push(`- ${this.formatCommitMessage(commit)}`);
        }
        lines.push('');
      }

      // Bug fixes
      if (entry.fixes.length > 0) {
        lines.push('### 🐛 Bug Fixes');
        lines.push('');
        for (const commit of entry.fixes) {
          lines.push(`- ${this.formatCommitMessage(commit)}`);
        }
        lines.push('');
      }

      // Performance
      if (entry.performance.length > 0) {
        lines.push('### ⚡ Performance Improvements');
        lines.push('');
        for (const commit of entry.performance) {
          lines.push(`- ${this.formatCommitMessage(commit)}`);
        }
        lines.push('');
      }

      // Refactoring
      if (entry.refactors.length > 0) {
        lines.push('### ♻️ Code Refactoring');
        lines.push('');
        for (const commit of entry.refactors) {
          lines.push(`- ${this.formatCommitMessage(commit)}`);
        }
        lines.push('');
      }

      // Documentation
      if (entry.docs.length > 0) {
        lines.push('### 📚 Documentation');
        lines.push('');
        for (const commit of entry.docs) {
          lines.push(`- ${this.formatCommitMessage(commit)}`);
        }
        lines.push('');
      }

      // Tests
      if (entry.tests.length > 0) {
        lines.push('### 🧪 Tests');
        lines.push('');
        for (const commit of entry.tests) {
          lines.push(`- ${this.formatCommitMessage(commit)}`);
        }
        lines.push('');
      }

      // Chores
      if (entry.chores.length > 0) {
        lines.push('### 🔧 Chores');
        lines.push('');
        for (const commit of entry.chores) {
          lines.push(`- ${this.formatCommitMessage(commit)}`);
        }
        lines.push('');
      }

      // Others
      if (entry.others.length > 0) {
        lines.push('### 📦 Other Changes');
        lines.push('');
        for (const commit of entry.others) {
          lines.push(`- ${this.formatCommitMessage(commit)}`);
        }
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    }

    // Footer with links
    lines.push('## Links');
    lines.push('');
    for (let i = 0; i < entries.length - 1; i++) {
      const current = entries[i];
      const previous = entries[i + 1];
      if (current.version !== 'Unreleased') {
        lines.push(`[${current.version}]: https://github.com/owner/repo/compare/v${previous.version}...v${current.version}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Format commit message
   */
  private formatCommitMessage(commit: GitCommit): string {
    let message = commit.subject;

    // Remove conventional commit prefix
    if (commit.type && commit.scope) {
      message = message.replace(`${commit.type}(${commit.scope}): `, '');
    } else if (commit.type) {
      message = message.replace(`${commit.type}: `, '');
    }

    // Add scope if present
    if (commit.scope) {
      message = `**${commit.scope}:** ${message}`;
    }

    // Add commit hash
    message += ` ([${commit.hash.substring(0, 7)}](https://github.com/owner/repo/commit/${commit.hash}))`;

    // Add closes references
    if (commit.closes && commit.closes.length > 0) {
      const closes = commit.closes.map(issue => `[#${issue}](https://github.com/owner/repo/issues/${issue})`);
      message += `, closes ${closes.join(', ')}`;
    }

    return message;
  }

  /**
   * Format date
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate release notes for a specific version
   */
  private generateReleaseNotes(entry: ChangelogEntry): string {
    const lines: string[] = [];

    // Header
    lines.push(`# Release Notes - v${entry.version}`);
    lines.push('');
    lines.push(`📅 **Release Date:** ${this.formatDate(entry.date)}`);
    lines.push(`📦 **Total Changes:** ${entry.commits.length}`);
    lines.push('');

    // Summary
    lines.push('## 📊 Summary');
    lines.push('');
    
    const summary: string[] = [];
    if (entry.breaking.length > 0) summary.push(`⚠️ ${entry.breaking.length} breaking changes`);
    if (entry.features.length > 0) summary.push(`✨ ${entry.features.length} new features`);
    if (entry.fixes.length > 0) summary.push(`🐛 ${entry.fixes.length} bug fixes`);
    if (entry.performance.length > 0) summary.push(`⚡ ${entry.performance.length} performance improvements`);
    
    lines.push(summary.join(' | '));
    lines.push('');

    // Highlights
    if (entry.features.length > 0 || entry.breaking.length > 0) {
      lines.push('## 🎯 Highlights');
      lines.push('');
      
      // Top features
      const topFeatures = entry.features.slice(0, 3);
      for (const feature of topFeatures) {
        lines.push(`- ${this.formatCommitMessage(feature)}`);
      }
      
      // Breaking changes
      for (const breaking of entry.breaking) {
        lines.push(`- ⚠️ **BREAKING:** ${this.formatCommitMessage(breaking)}`);
      }
      
      lines.push('');
    }

    // Migration guide for breaking changes
    if (entry.breaking.length > 0) {
      lines.push('## 🔄 Migration Guide');
      lines.push('');
      lines.push('This release contains breaking changes. Please review the following:');
      lines.push('');
      
      for (const breaking of entry.breaking) {
        lines.push(`### ${this.formatCommitMessage(breaking)}`);
        lines.push('');
        if (breaking.body) {
          lines.push(breaking.body);
          lines.push('');
        }
      }
    }

    // Detailed changes
    lines.push('## 📝 Detailed Changes');
    lines.push('');

    // Add all sections
    const sections = [
      { title: '### ✨ New Features', items: entry.features },
      { title: '### 🐛 Bug Fixes', items: entry.fixes },
      { title: '### ⚡ Performance Improvements', items: entry.performance },
      { title: '### ♻️ Code Refactoring', items: entry.refactors },
      { title: '### 📚 Documentation Updates', items: entry.docs },
      { title: '### 🧪 Test Improvements', items: entry.tests }
    ];

    for (const section of sections) {
      if (section.items.length > 0) {
        lines.push(section.title);
        lines.push('');
        for (const item of section.items) {
          lines.push(`- ${this.formatCommitMessage(item)}`);
        }
        lines.push('');
      }
    }

    // Contributors
    const contributors = new Set(entry.commits.map(c => c.author));
    if (contributors.size > 0) {
      lines.push('## 👥 Contributors');
      lines.push('');
      lines.push('Thank you to all contributors who made this release possible:');
      lines.push('');
      lines.push(Array.from(contributors).map(c => `- ${c}`).join('\n'));
      lines.push('');
    }

    // Footer
    lines.push('---');
    lines.push('');
    lines.push('For the complete changelog, see [CHANGELOG.md](./CHANGELOG.md)');

    return lines.join('\n');
  }

  /**
   * Generate mock commits for demo
   */
  private generateMockCommits(): GitCommit[] {
    const now = new Date();
    const commits: GitCommit[] = [];

    // Recent commits
    commits.push({
      hash: 'abc1234',
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      author: 'John Doe',
      email: 'john@example.com',
      subject: 'feat: add user authentication system',
      body: 'Implement JWT-based authentication with refresh tokens',
      type: 'feat',
      scope: 'auth',
      breaking: false
    });

    commits.push({
      hash: 'def5678',
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      author: 'Jane Smith',
      email: 'jane@example.com',
      subject: 'fix(api): resolve database connection timeout',
      body: 'Increase connection pool size and add retry logic\n\nCloses #123',
      type: 'fix',
      scope: 'api',
      breaking: false,
      closes: ['123']
    });

    commits.push({
      hash: 'ghi9012',
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      author: 'Bob Johnson',
      email: 'bob@example.com',
      subject: 'feat!: migrate to TypeScript strict mode',
      body: 'BREAKING CHANGE: All components now require explicit type annotations',
      type: 'feat',
      scope: undefined,
      breaking: true
    });

    // Older commits
    commits.push({
      hash: 'jkl3456',
      date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      author: 'Alice Brown',
      email: 'alice@example.com',
      subject: 'perf: optimize image loading with lazy loading',
      body: 'Implement intersection observer for image lazy loading',
      type: 'perf',
      breaking: false
    });

    commits.push({
      hash: 'mno7890',
      date: new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000),
      author: 'Charlie Davis',
      email: 'charlie@example.com',
      subject: 'docs: update API documentation',
      body: 'Add examples for all API endpoints',
      type: 'docs',
      breaking: false
    });

    return commits;
  }
}

// Export singleton instance
export const changelogPlugin = new ChangelogGeneratorPlugin();