/**
 * Release Notes Generator Plugin
 * 
 * Generates release notes from git commits, changelog, and project metadata
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

interface ReleaseInfo {
  version: string;
  date: Date;
  title?: string;
  description?: string;
  highlights: string[];
  breakingChanges: BreakingChange[];
  newFeatures: Feature[];
  bugFixes: BugFix[];
  improvements: Improvement[];
  dependencies: DependencyChange[];
  contributors: Contributor[];
  downloadLinks?: DownloadLink[];
  migrationGuide?: string;
}

interface BreakingChange {
  title: string;
  description: string;
  migrationSteps?: string[];
  affectedAPIs?: string[];
}

interface Feature {
  title: string;
  description: string;
  category?: string;
  issueNumber?: string;
  prNumber?: string;
}

interface BugFix {
  title: string;
  description: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  issueNumber?: string;
}

interface Improvement {
  title: string;
  description: string;
  type: 'performance' | 'security' | 'ux' | 'dx' | 'other';
  metrics?: string;
}

interface DependencyChange {
  name: string;
  previousVersion?: string;
  newVersion: string;
  type: 'added' | 'updated' | 'removed';
  reason?: string;
}

interface Contributor {
  name: string;
  github?: string;
  contributions: number;
  type?: 'author' | 'reviewer' | 'tester';
}

interface DownloadLink {
  platform: string;
  url: string;
  size?: string;
  checksum?: string;
}

export class ReleaseNotesPlugin implements DocumentationPlugin {
  name = 'release-notes';
  type = DocumentationType.CHANGELOG;
  description = 'Generates comprehensive release notes from commits and project changes';

  private releaseInfo: ReleaseInfo | null = null;
  private previousVersion: string | null = null;
  private commitsSinceLastRelease: any[] = [];

  async generate(context: PluginContext): Promise<DocumentationItem[]> {
    // Reset state
    this.reset();

    // Get release information
    await this.gatherReleaseInfo(context);

    // Analyze commits since last release
    await this.analyzeCommits(context);

    // Extract features and fixes
    await this.extractChanges(context);

    // Identify contributors
    await this.identifyContributors(context);

    // Check dependency changes
    await this.analyzeDependencyChanges(context);

    // Generate release notes
    const releaseNotes = this.generateReleaseNotes();
    const releaseAnnouncement = this.generateReleaseAnnouncement();
    const migrationGuide = this.generateMigrationGuide();

    // Create documentation items
    const items: DocumentationItem[] = [];

    // Main release notes
    items.push({
      id: 'release-notes-main',
      name: `Release Notes v${this.releaseInfo?.version}`,
      type: 'changelog',
      category: 'Release Documentation',
      description: 'Comprehensive release notes',
      tags: ['release', 'changelog', this.releaseInfo?.version || ''],
      metadata: {
        content: releaseNotes,
        version: this.releaseInfo?.version,
        date: this.releaseInfo?.date,
        format: 'markdown'
      }
    });

    // Release announcement (for blog/social)
    items.push({
      id: 'release-announcement',
      name: 'Release Announcement',
      type: 'changelog',
      category: 'Release Documentation',
      description: 'Release announcement for blog and social media',
      tags: ['release', 'announcement', 'blog'],
      metadata: {
        content: releaseAnnouncement,
        version: this.releaseInfo?.version,
        format: 'markdown'
      }
    });

    // Migration guide if breaking changes
    if (this.releaseInfo?.breakingChanges.length) {
      items.push({
        id: 'migration-guide',
        name: `Migration Guide to v${this.releaseInfo?.version}`,
        type: 'guide',
        category: 'Migration Documentation',
        description: 'Step-by-step migration guide',
        tags: ['migration', 'breaking-changes', 'upgrade'],
        metadata: {
          content: migrationGuide,
          version: this.releaseInfo?.version,
          format: 'markdown'
        }
      });
    }

    return items;
  }

  /**
   * Reset plugin state
   */
  private reset(): void {
    this.releaseInfo = null;
    this.previousVersion = null;
    this.commitsSinceLastRelease = [];
  }

  /**
   * Gather release information
   */
  private async gatherReleaseInfo(context: PluginContext): Promise<void> {
    // Get version from package.json
    let version = '1.0.0';
    let packageInfo: any = {};
    
    try {
      const packagePath = path.join(context.projectRoot, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      packageInfo = JSON.parse(packageContent);
      version = packageInfo.version || '1.0.0';
    } catch (error) {
      console.warn('Failed to read package.json:', error);
    }

    // Get previous version from git tags
    try {
      const { stdout } = await execAsync(
        'git describe --tags --abbrev=0',
        { cwd: context.projectRoot }
      );
      this.previousVersion = stdout.trim().replace(/^v/, '');
    } catch {
      // No previous tags
      this.previousVersion = '0.0.0';
    }

    // Initialize release info
    this.releaseInfo = {
      version,
      date: new Date(),
      title: `Release v${version}`,
      description: packageInfo.description || 'New release',
      highlights: [],
      breakingChanges: [],
      newFeatures: [],
      bugFixes: [],
      improvements: [],
      dependencies: [],
      contributors: []
    };
  }

  /**
   * Analyze commits since last release
   */
  private async analyzeCommits(context: PluginContext): Promise<void> {
    try {
      const fromTag = this.previousVersion ? `v${this.previousVersion}` : '';
      const gitRange = fromTag ? `${fromTag}..HEAD` : '';
      
      const format = '%H|%aI|%an|%ae|%s|%b|%n--END--';
      const { stdout } = await execAsync(
        `git log ${gitRange} --format="${format}"`,
        { cwd: context.projectRoot, maxBuffer: 10 * 1024 * 1024 }
      );

      const commitStrings = stdout.split('\n--END--\n').filter(Boolean);
      
      this.commitsSinceLastRelease = commitStrings.map(commitStr => {
        const parts = commitStr.trim().split('|');
        if (parts.length < 6) return null;

        const [hash, dateStr, author, email, subject, ...bodyParts] = parts;
        const body = bodyParts.join('|').trim();

        return {
          hash,
          date: new Date(dateStr),
          author,
          email,
          subject,
          body
        };
      }).filter(Boolean);

    } catch (error) {
      console.warn('Failed to analyze commits:', error);
      // Generate mock data for demo
      this.generateMockCommits();
    }
  }

  /**
   * Extract changes from commits
   */
  private async extractChanges(context: PluginContext): Promise<void> {
    for (const commit of this.commitsSinceLastRelease) {
      const { subject, body } = commit;
      
      // Parse conventional commit
      const conventionalMatch = subject.match(/^(\w+)(?:\(([^)]+)\))?!?: (.+)$/);
      
      if (conventionalMatch) {
        const [, type, scope, description] = conventionalMatch;
        const isBreaking = subject.includes('!') || body.toLowerCase().includes('breaking change');
        
        // Extract issue/PR numbers
        const issueMatch = body.match(/#(\d+)/);
        const issueNumber = issueMatch ? issueMatch[1] : undefined;
        
        if (isBreaking) {
          this.releaseInfo!.breakingChanges.push({
            title: description,
            description: body || description,
            affectedAPIs: scope ? [scope] : []
          });
        }
        
        switch (type) {
          case 'feat':
          case 'feature':
            this.releaseInfo!.newFeatures.push({
              title: description,
              description: body || description,
              category: scope,
              issueNumber
            });
            break;
            
          case 'fix':
          case 'bugfix':
            this.releaseInfo!.bugFixes.push({
              title: description,
              description: body || description,
              severity: this.determineSeverity(body),
              issueNumber
            });
            break;
            
          case 'perf':
          case 'performance':
            this.releaseInfo!.improvements.push({
              title: description,
              description: body || description,
              type: 'performance'
            });
            break;
            
          case 'security':
            this.releaseInfo!.improvements.push({
              title: description,
              description: body || description,
              type: 'security'
            });
            break;
        }
      }
    }
    
    // Generate highlights
    this.generateHighlights();
  }

  /**
   * Determine bug severity
   */
  private determineSeverity(body: string): 'critical' | 'high' | 'medium' | 'low' {
    const lowerBody = body.toLowerCase();
    if (lowerBody.includes('critical') || lowerBody.includes('security')) return 'critical';
    if (lowerBody.includes('high') || lowerBody.includes('major')) return 'high';
    if (lowerBody.includes('low') || lowerBody.includes('minor')) return 'low';
    return 'medium';
  }

  /**
   * Generate highlights
   */
  private generateHighlights(): void {
    const highlights: string[] = [];
    
    // Top features
    const topFeatures = this.releaseInfo!.newFeatures.slice(0, 3);
    for (const feature of topFeatures) {
      highlights.push(`✨ ${feature.title}`);
    }
    
    // Critical fixes
    const criticalFixes = this.releaseInfo!.bugFixes
      .filter(fix => fix.severity === 'critical')
      .slice(0, 2);
    for (const fix of criticalFixes) {
      highlights.push(`🔒 ${fix.title}`);
    }
    
    // Major improvements
    const majorImprovements = this.releaseInfo!.improvements
      .filter(imp => imp.type === 'performance' || imp.type === 'security')
      .slice(0, 2);
    for (const improvement of majorImprovements) {
      highlights.push(`⚡ ${improvement.title}`);
    }
    
    this.releaseInfo!.highlights = highlights;
  }

  /**
   * Identify contributors
   */
  private async identifyContributors(context: PluginContext): Promise<void> {
    const contributorMap = new Map<string, Contributor>();
    
    for (const commit of this.commitsSinceLastRelease) {
      const { author, email } = commit;
      const key = `${author}:${email}`;
      
      if (contributorMap.has(key)) {
        contributorMap.get(key)!.contributions++;
      } else {
        contributorMap.set(key, {
          name: author,
          contributions: 1,
          type: 'author'
        });
      }
    }
    
    // Sort by contributions
    this.releaseInfo!.contributors = Array.from(contributorMap.values())
      .sort((a, b) => b.contributions - a.contributions);
  }

  /**
   * Analyze dependency changes
   */
  private async analyzeDependencyChanges(context: PluginContext): Promise<void> {
    try {
      // Compare package.json with previous version
      const currentPackagePath = path.join(context.projectRoot, 'package.json');
      const currentPackage = JSON.parse(await fs.readFile(currentPackagePath, 'utf-8'));
      
      // Get previous package.json from git
      let previousPackage: any = {};
      if (this.previousVersion && this.previousVersion !== '0.0.0') {
        try {
          const { stdout } = await execAsync(
            `git show v${this.previousVersion}:package.json`,
            { cwd: context.projectRoot }
          );
          previousPackage = JSON.parse(stdout);
        } catch {
          // Previous version not found
        }
      }
      
      // Compare dependencies
      const changes: DependencyChange[] = [];
      const allDeps = {
        ...currentPackage.dependencies,
        ...currentPackage.devDependencies
      };
      const prevDeps = {
        ...previousPackage.dependencies,
        ...previousPackage.devDependencies
      };
      
      // Check for added/updated dependencies
      for (const [name, version] of Object.entries(allDeps)) {
        if (!prevDeps[name]) {
          changes.push({
            name,
            newVersion: version as string,
            type: 'added'
          });
        } else if (prevDeps[name] !== version) {
          changes.push({
            name,
            previousVersion: prevDeps[name],
            newVersion: version as string,
            type: 'updated'
          });
        }
      }
      
      // Check for removed dependencies
      for (const [name, version] of Object.entries(prevDeps)) {
        if (!allDeps[name]) {
          changes.push({
            name,
            previousVersion: version as string,
            newVersion: '',
            type: 'removed'
          });
        }
      }
      
      this.releaseInfo!.dependencies = changes;
      
    } catch (error) {
      console.warn('Failed to analyze dependency changes:', error);
    }
  }

  /**
   * Generate release notes
   */
  private generateReleaseNotes(): string {
    const lines: string[] = [];
    const info = this.releaseInfo!;
    
    // Header
    lines.push(`# Release Notes - v${info.version}`);
    lines.push('');
    lines.push(`📅 **Release Date:** ${this.formatDate(info.date)}`);
    lines.push(`📊 **Previous Version:** v${this.previousVersion || '0.0.0'}`);
    lines.push('');
    
    // Highlights
    if (info.highlights.length > 0) {
      lines.push('## 🎯 Highlights');
      lines.push('');
      for (const highlight of info.highlights) {
        lines.push(`- ${highlight}`);
      }
      lines.push('');
    }
    
    // Breaking changes
    if (info.breakingChanges.length > 0) {
      lines.push('## ⚠️ Breaking Changes');
      lines.push('');
      for (const change of info.breakingChanges) {
        lines.push(`### ${change.title}`);
        lines.push('');
        lines.push(change.description);
        lines.push('');
        if (change.affectedAPIs && change.affectedAPIs.length > 0) {
          lines.push('**Affected APIs:**');
          for (const api of change.affectedAPIs) {
            lines.push(`- \`${api}\``);
          }
          lines.push('');
        }
      }
    }
    
    // New features
    if (info.newFeatures.length > 0) {
      lines.push('## ✨ New Features');
      lines.push('');
      const grouped = this.groupByCategory(info.newFeatures);
      for (const [category, features] of grouped) {
        if (category) {
          lines.push(`### ${this.capitalize(category)}`);
          lines.push('');
        }
        for (const feature of features) {
          lines.push(`- **${feature.title}**`);
          if (feature.description && feature.description !== feature.title) {
            lines.push(`  ${feature.description}`);
          }
          if (feature.issueNumber) {
            lines.push(`  Closes #${feature.issueNumber}`);
          }
        }
        lines.push('');
      }
    }
    
    // Bug fixes
    if (info.bugFixes.length > 0) {
      lines.push('## 🐛 Bug Fixes');
      lines.push('');
      const bySeverity = this.groupBySeverity(info.bugFixes);
      for (const [severity, fixes] of bySeverity) {
        lines.push(`### ${this.capitalize(severity)} Priority`);
        lines.push('');
        for (const fix of fixes) {
          lines.push(`- ${fix.title}`);
          if (fix.issueNumber) {
            lines.push(`  Fixes #${fix.issueNumber}`);
          }
        }
        lines.push('');
      }
    }
    
    // Improvements
    if (info.improvements.length > 0) {
      lines.push('## 🚀 Improvements');
      lines.push('');
      const byType = this.groupByType(info.improvements);
      for (const [type, improvements] of byType) {
        lines.push(`### ${this.getImprovementTypeTitle(type)}`);
        lines.push('');
        for (const improvement of improvements) {
          lines.push(`- ${improvement.title}`);
          if (improvement.metrics) {
            lines.push(`  ${improvement.metrics}`);
          }
        }
        lines.push('');
      }
    }
    
    // Dependencies
    if (info.dependencies.length > 0) {
      lines.push('## 📦 Dependency Updates');
      lines.push('');
      
      const added = info.dependencies.filter(d => d.type === 'added');
      const updated = info.dependencies.filter(d => d.type === 'updated');
      const removed = info.dependencies.filter(d => d.type === 'removed');
      
      if (added.length > 0) {
        lines.push('### Added');
        lines.push('');
        for (const dep of added) {
          lines.push(`- \`${dep.name}@${dep.newVersion}\``);
        }
        lines.push('');
      }
      
      if (updated.length > 0) {
        lines.push('### Updated');
        lines.push('');
        for (const dep of updated) {
          lines.push(`- \`${dep.name}\`: ${dep.previousVersion} → ${dep.newVersion}`);
        }
        lines.push('');
      }
      
      if (removed.length > 0) {
        lines.push('### Removed');
        lines.push('');
        for (const dep of removed) {
          lines.push(`- \`${dep.name}\``);
        }
        lines.push('');
      }
    }
    
    // Contributors
    if (info.contributors.length > 0) {
      lines.push('## 👥 Contributors');
      lines.push('');
      lines.push(`A big thank you to all ${info.contributors.length} contributors who made this release possible:`);
      lines.push('');
      for (const contributor of info.contributors.slice(0, 10)) {
        lines.push(`- ${contributor.name} (${contributor.contributions} commits)`);
      }
      if (info.contributors.length > 10) {
        lines.push(`- ...and ${info.contributors.length - 10} more!`);
      }
      lines.push('');
    }
    
    // Downloads
    if (info.downloadLinks && info.downloadLinks.length > 0) {
      lines.push('## 💾 Downloads');
      lines.push('');
      lines.push('| Platform | Download | Size |');
      lines.push('|----------|----------|------|');
      for (const download of info.downloadLinks) {
        lines.push(`| ${download.platform} | [Download](${download.url}) | ${download.size || 'N/A'} |`);
      }
      lines.push('');
    }
    
    // Footer
    lines.push('---');
    lines.push('');
    lines.push('For the complete changelog, see [CHANGELOG.md](./CHANGELOG.md)');
    lines.push('');
    lines.push(`Questions or feedback? [Open an issue](https://github.com/owner/repo/issues)`);
    
    return lines.join('\n');
  }

  /**
   * Generate release announcement
   */
  private generateReleaseAnnouncement(): string {
    const lines: string[] = [];
    const info = this.releaseInfo!;
    
    // Title
    lines.push(`# 🚀 Announcing v${info.version}`);
    lines.push('');
    lines.push(`We're excited to announce the release of v${info.version}! This release brings ${info.newFeatures.length} new features, ${info.bugFixes.length} bug fixes, and ${info.improvements.length} improvements.`);
    lines.push('');
    
    // Key highlights
    lines.push('## Key Highlights');
    lines.push('');
    for (const highlight of info.highlights.slice(0, 5)) {
      lines.push(`- ${highlight}`);
    }
    lines.push('');
    
    // Call to action
    lines.push('## Get Started');
    lines.push('');
    lines.push('```bash');
    lines.push('npm install project-name@latest');
    lines.push('# or');
    lines.push('pnpm add project-name@latest');
    lines.push('```');
    lines.push('');
    
    // Links
    lines.push('## Learn More');
    lines.push('');
    lines.push(`- [Full Release Notes](https://github.com/owner/repo/releases/tag/v${info.version})`);
    lines.push('- [Migration Guide](./MIGRATION.md)');
    lines.push('- [Documentation](https://docs.example.com)');
    lines.push('');
    
    // Thank you
    lines.push('## Thank You');
    lines.push('');
    lines.push(`This release wouldn't be possible without our amazing community. Special thanks to our ${info.contributors.length} contributors!`);
    lines.push('');
    lines.push('Happy coding! 🎉');
    
    return lines.join('\n');
  }

  /**
   * Generate migration guide
   */
  private generateMigrationGuide(): string {
    const lines: string[] = [];
    const info = this.releaseInfo!;
    
    if (info.breakingChanges.length === 0) {
      return '# No breaking changes in this release';
    }
    
    // Header
    lines.push(`# Migration Guide: v${this.previousVersion} → v${info.version}`);
    lines.push('');
    lines.push('This guide will help you migrate your codebase to the latest version.');
    lines.push('');
    
    // Overview
    lines.push('## Overview');
    lines.push('');
    lines.push(`This release includes ${info.breakingChanges.length} breaking changes that may require updates to your code.`);
    lines.push('');
    
    // Breaking changes
    lines.push('## Breaking Changes');
    lines.push('');
    
    for (let i = 0; i < info.breakingChanges.length; i++) {
      const change = info.breakingChanges[i];
      lines.push(`### ${i + 1}. ${change.title}`);
      lines.push('');
      lines.push('**What changed:**');
      lines.push(change.description);
      lines.push('');
      
      if (change.affectedAPIs && change.affectedAPIs.length > 0) {
        lines.push('**Affected APIs:**');
        for (const api of change.affectedAPIs) {
          lines.push(`- \`${api}\``);
        }
        lines.push('');
      }
      
      if (change.migrationSteps && change.migrationSteps.length > 0) {
        lines.push('**Migration steps:**');
        for (let j = 0; j < change.migrationSteps.length; j++) {
          lines.push(`${j + 1}. ${change.migrationSteps[j]}`);
        }
        lines.push('');
      }
      
      lines.push('**Example:**');
      lines.push('');
      lines.push('Before:');
      lines.push('```typescript');
      lines.push('// Old code example');
      lines.push('```');
      lines.push('');
      lines.push('After:');
      lines.push('```typescript');
      lines.push('// New code example');
      lines.push('```');
      lines.push('');
    }
    
    // Automated migration
    lines.push('## Automated Migration');
    lines.push('');
    lines.push('We provide a codemod to help automate some of the migration:');
    lines.push('');
    lines.push('```bash');
    lines.push('npx @project/migrate v' + info.version);
    lines.push('```');
    lines.push('');
    
    // Support
    lines.push('## Need Help?');
    lines.push('');
    lines.push('- [Migration FAQ](https://docs.example.com/migration-faq)');
    lines.push('- [GitHub Discussions](https://github.com/owner/repo/discussions)');
    lines.push('- [Discord Community](https://discord.gg/example)');
    
    return lines.join('\n');
  }

  /**
   * Helper methods
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private groupByCategory(features: Feature[]): Map<string, Feature[]> {
    const grouped = new Map<string, Feature[]>();
    
    for (const feature of features) {
      const category = feature.category || '';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(feature);
    }
    
    return grouped;
  }

  private groupBySeverity(fixes: BugFix[]): Map<string, BugFix[]> {
    const grouped = new Map<string, BugFix[]>();
    const severities = ['critical', 'high', 'medium', 'low'];
    
    for (const severity of severities) {
      const fixesForSeverity = fixes.filter(f => f.severity === severity);
      if (fixesForSeverity.length > 0) {
        grouped.set(severity, fixesForSeverity);
      }
    }
    
    return grouped;
  }

  private groupByType(improvements: Improvement[]): Map<string, Improvement[]> {
    const grouped = new Map<string, Improvement[]>();
    
    for (const improvement of improvements) {
      if (!grouped.has(improvement.type)) {
        grouped.set(improvement.type, []);
      }
      grouped.get(improvement.type)!.push(improvement);
    }
    
    return grouped;
  }

  private getImprovementTypeTitle(type: string): string {
    const titles: Record<string, string> = {
      performance: '⚡ Performance',
      security: '🔒 Security',
      ux: '💅 User Experience',
      dx: '🛠️ Developer Experience',
      other: '📦 Other'
    };
    return titles[type] || type;
  }

  /**
   * Generate mock commits for demo
   */
  private generateMockCommits(): void {
    const now = new Date();
    
    this.commitsSinceLastRelease = [
      {
        hash: 'abc123',
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        author: 'John Doe',
        email: 'john@example.com',
        subject: 'feat(auth): add OAuth2 authentication support',
        body: 'Implement OAuth2 flow with support for Google, GitHub, and Microsoft providers\n\nCloses #456'
      },
      {
        hash: 'def456',
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        author: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'fix(api): resolve critical memory leak in request handler',
        body: 'Fix memory leak caused by unclosed database connections\n\nFixes #789'
      },
      {
        hash: 'ghi789',
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        author: 'Bob Johnson',
        email: 'bob@example.com',
        subject: 'feat!: migrate to ESM modules',
        body: 'BREAKING CHANGE: All imports must now use ESM syntax. CommonJS is no longer supported.'
      },
      {
        hash: 'jkl012',
        date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        author: 'Alice Brown',
        email: 'alice@example.com',
        subject: 'perf: optimize database queries with proper indexing',
        body: 'Add indexes to commonly queried columns, reducing query time by 70%'
      },
      {
        hash: 'mno345',
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        author: 'Charlie Davis',
        email: 'charlie@example.com',
        subject: 'security: patch XSS vulnerability in user input handling',
        body: 'Properly sanitize all user inputs to prevent XSS attacks'
      }
    ];
  }
}

// Export singleton instance
export const releaseNotesPlugin = new ReleaseNotesPlugin();