import type {
  RepositoryHealthMetrics,
  RepositoryStatistics,
} from '../services/repositoryService';

/**
 * Branch status types for repository health calculation
 */
export type BranchStatus =
  | 'up-to-date'
  | 'ahead'
  | 'behind'
  | 'ahead-behind'
  | 'conflicted'
  | 'unknown';

/**
 * Repository health score levels
 */
export type HealthLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

/**
 * Branch status information
 */
export interface BranchStatusInfo {
  status: BranchStatus;
  ahead: number;
  behind: number;
  isClean: boolean;
  hasConflicts: boolean;
  lastCommitAge: number; // in hours
  color: string;
  label: string;
  description: string;
}

/**
 * Repository health score result
 */
export interface RepositoryHealthScore {
  score: number; // 0-100
  level: HealthLevel;
  color: string;
  factors: {
    branchStatus: number; // 0-25 points
    commitActivity: number; // 0-25 points
    codeQuality: number; // 0-25 points
    maintenance: number; // 0-25 points
  };
  issues: string[];
  recommendations: string[];
}

/**
 * Calculate branch status from Git status information
 */
export const calculateBranchStatus = (
  ahead: number = 0,
  behind: number = 0,
  isClean: boolean = true,
  conflicted: number = 0,
  lastCommitDate: string
): BranchStatusInfo => {
  // Calculate age of last commit in hours
  const lastCommitAge =
    (Date.now() - new Date(lastCommitDate).getTime()) / (1000 * 60 * 60);

  // Determine if there are conflicts
  const hasConflicts = conflicted > 0;

  // Determine branch status
  let status: BranchStatus;
  let color: string;
  let label: string;
  let description: string;

  if (hasConflicts) {
    status = 'conflicted';
    color = 'bg-red-500';
    label = 'Conflicted';
    description = `${conflicted} conflict${conflicted > 1 ? 's' : ''} need resolution`;
  } else if (ahead > 0 && behind > 0) {
    status = 'ahead-behind';
    color = 'bg-yellow-500';
    label = 'Diverged';
    description = `${ahead} ahead, ${behind} behind`;
  } else if (ahead > 0) {
    status = 'ahead';
    color = 'bg-blue-500';
    label = 'Ahead';
    description = `${ahead} commit${ahead > 1 ? 's' : ''} ahead of remote`;
  } else if (behind > 0) {
    status = 'behind';
    color = 'bg-orange-500';
    label = 'Behind';
    description = `${behind} commit${behind > 1 ? 's' : ''} behind remote`;
  } else if (ahead === 0 && behind === 0) {
    status = 'up-to-date';
    color = isClean ? 'bg-green-500' : 'bg-yellow-400';
    label = isClean ? 'Up to Date' : 'Up to Date*';
    description = isClean
      ? 'Branch is synchronized and clean'
      : 'Branch is synchronized but has local changes';
  } else {
    status = 'unknown';
    color = 'bg-gray-500';
    label = 'Unknown';
    description = 'Branch status could not be determined';
  }

  return {
    status,
    ahead,
    behind,
    isClean,
    hasConflicts,
    lastCommitAge,
    color,
    label,
    description,
  };
};

/**
 * Calculate repository health score based on multiple factors
 */
export const calculateRepositoryHealth = (
  branchStatusInfo: BranchStatusInfo,
  statistics?: RepositoryStatistics,
  healthMetrics?: RepositoryHealthMetrics
): RepositoryHealthScore => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Factor 1: Branch Status (0-25 points)
  let branchScore = 0;

  switch (branchStatusInfo.status) {
    case 'up-to-date':
      branchScore = branchStatusInfo.isClean ? 25 : 20;
      if (!branchStatusInfo.isClean) {
        issues.push('Working directory has uncommitted changes');
        recommendations.push('Commit or stash your changes');
      }
      break;
    case 'ahead':
      branchScore = branchStatusInfo.ahead <= 3 ? 20 : 15;
      if (branchStatusInfo.ahead > 5) {
        issues.push('Many commits ahead of remote');
        recommendations.push('Push your changes to sync with remote');
      }
      break;
    case 'behind':
      branchScore = branchStatusInfo.behind <= 5 ? 15 : 10;
      if (branchStatusInfo.behind > 10) {
        issues.push('Significantly behind remote branch');
        recommendations.push('Pull latest changes from remote');
      }
      break;
    case 'ahead-behind':
      branchScore = 10;
      issues.push('Branch has diverged from remote');
      recommendations.push('Consider rebasing or merging with remote');
      break;
    case 'conflicted':
      branchScore = 0;
      issues.push('Branch has merge conflicts');
      recommendations.push('Resolve conflicts before continuing');
      break;
    default:
      branchScore = 5;
      issues.push('Branch status unknown');
  }

  // Factor 2: Commit Activity (0-25 points)
  let commitScore = 15; // Default moderate score

  if (statistics?.commits) {
    const recentCommits = statistics.commits.thisWeek;
    const totalCommits = statistics.commits.total;

    if (branchStatusInfo.lastCommitAge > 30 * 24) {
      // 30 days
      commitScore = 5;
      issues.push('No recent commit activity (30+ days)');
      recommendations.push('Consider archiving if project is inactive');
    } else if (branchStatusInfo.lastCommitAge > 7 * 24) {
      // 7 days
      commitScore = 10;
      issues.push('Limited recent activity');
    } else if (recentCommits > 0) {
      commitScore = Math.min(25, 15 + recentCommits * 2);
    }

    if (totalCommits < 10) {
      commitScore = Math.max(5, commitScore - 5);
      issues.push('Limited commit history');
    }
  }

  // Factor 3: Code Quality (0-25 points)
  let qualityScore = 15; // Default moderate score

  if (healthMetrics?.metrics?.codeQuality) {
    const quality = healthMetrics.metrics.codeQuality;
    qualityScore = Math.round((quality.score / 100) * 25);

    if (quality.complexity > 15) {
      issues.push('High code complexity detected');
      recommendations.push('Consider refactoring complex functions');
    }

    if (quality.duplication > 5) {
      issues.push('Code duplication detected');
      recommendations.push('Reduce code duplication');
    }

    if (quality.maintainabilityIndex < 60) {
      issues.push('Low maintainability index');
      recommendations.push('Improve code structure and documentation');
    }
  }

  // Factor 4: Maintenance (0-25 points)
  let maintenanceScore = 15; // Default moderate score

  if (healthMetrics?.metrics) {
    const { security, testing } = healthMetrics.metrics;

    if (security?.vulnerabilities && security.vulnerabilities > 0) {
      maintenanceScore -= Math.min(10, security.vulnerabilities * 2);
      issues.push(`${security.vulnerabilities} security vulnerabilities found`);
      recommendations.push('Update dependencies to fix security issues');
    }

    if (security?.outdatedDependencies && security.outdatedDependencies > 10) {
      maintenanceScore -= 5;
      issues.push('Many outdated dependencies');
      recommendations.push('Update dependencies regularly');
    }

    if (testing?.coverage && testing.coverage < 50) {
      maintenanceScore -= 5;
      issues.push('Low test coverage');
      recommendations.push('Increase test coverage');
    } else if (testing?.coverage && testing.coverage > 80) {
      maintenanceScore = Math.min(25, maintenanceScore + 5);
    }
  }

  // Calculate total score
  const totalScore = Math.max(
    0,
    Math.min(100, branchScore + commitScore + qualityScore + maintenanceScore)
  );

  // Determine health level and color
  let level: HealthLevel;
  let color: string;

  if (totalScore >= 90) {
    level = 'excellent';
    color = 'text-green-600 bg-green-50 border-green-200';
  } else if (totalScore >= 75) {
    level = 'good';
    color = 'text-blue-600 bg-blue-50 border-blue-200';
  } else if (totalScore >= 60) {
    level = 'fair';
    color = 'text-yellow-600 bg-yellow-50 border-yellow-200';
  } else if (totalScore >= 40) {
    level = 'poor';
    color = 'text-orange-600 bg-orange-50 border-orange-200';
  } else {
    level = 'critical';
    color = 'text-red-600 bg-red-50 border-red-200';
  }

  return {
    score: totalScore,
    level,
    color,
    factors: {
      branchStatus: branchScore,
      commitActivity: commitScore,
      codeQuality: qualityScore,
      maintenance: maintenanceScore,
    },
    issues,
    recommendations,
  };
};

/**
 * Get branch status badge variant based on status
 */
export const getBranchStatusBadge = (
  status: BranchStatus
): {
  variant:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'success'
    | 'warning'
    | 'error';
  label: string;
} => {
  switch (status) {
    case 'up-to-date':
      return { variant: 'success', label: 'Up to Date' };
    case 'ahead':
      return { variant: 'default', label: 'Ahead' };
    case 'behind':
      return { variant: 'warning', label: 'Behind' };
    case 'ahead-behind':
      return { variant: 'warning', label: 'Diverged' };
    case 'conflicted':
      return { variant: 'error', label: 'Conflicts' };
    default:
      return { variant: 'secondary', label: 'Unknown' };
  }
};

/**
 * Get health score badge variant based on level
 */
export const getHealthScoreBadge = (
  level: HealthLevel
): {
  variant:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'success'
    | 'warning'
    | 'error';
  label: string;
} => {
  switch (level) {
    case 'excellent':
      return { variant: 'success', label: 'Excellent' };
    case 'good':
      return { variant: 'default', label: 'Good' };
    case 'fair':
      return { variant: 'outline', label: 'Fair' };
    case 'poor':
      return { variant: 'warning', label: 'Poor' };
    case 'critical':
      return { variant: 'error', label: 'Critical' };
    default:
      return { variant: 'secondary', label: 'Unknown' };
  }
};

/**
 * Format relative time for commit age display
 */
export const formatCommitAge = (ageInHours: number): string => {
  if (ageInHours < 1) {
    return 'just now';
  } else if (ageInHours < 24) {
    const hours = Math.floor(ageInHours);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (ageInHours < 24 * 7) {
    const days = Math.floor(ageInHours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (ageInHours < 24 * 30) {
    const weeks = Math.floor(ageInHours / (24 * 7));
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(ageInHours / (24 * 30));
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
};
