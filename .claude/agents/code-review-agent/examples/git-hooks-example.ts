/**
 * Example: Setting up and using Git hooks with Code Review Agent
 */

import { gitHooksIntegration } from '../git-hooks';
import { prReviewIntegration } from '../pr-review';
import { codeReviewEngine } from '../core-engine';

async function setupExample() {
  console.log('📚 Code Review Git Hooks Example\n');

  // 1. Setup Git hooks with custom configuration
  console.log('1. Setting up Git hooks...');
  await gitHooksIntegration.setupGitIntegration('.', {
    lightweight: true,
    analyzers: ['eslint', 'typescript', 'security'],
    maxFiles: 15,
    timeoutMs: 8000,
    bypassPatterns: ['WIP:', 'DRAFT:', 'EMERGENCY:']
  });

  console.log('\n2. Reviewing staged files (pre-commit simulation)...');
  // This would normally run automatically on git commit
  const stagedReview = await gitHooksIntegration.reviewChangedFiles({
    staged: true
  });
  
  if (stagedReview.findings.filter(f => f.severity === 'error').length > 0) {
    console.log('❌ Pre-commit review failed - errors found');
    console.log(codeReviewEngine.formatResults(stagedReview));
  } else {
    console.log('✅ Pre-commit review passed');
  }

  console.log('\n3. Reviewing PR changes...');
  // Review changes between main and current branch
  const prReview = await prReviewIntegration.reviewPullRequest({
    baseBranch: 'main',
    analyzers: ['eslint', 'typescript', 'security', 'performance', 'architecture']
  });
  
  console.log(prReviewIntegration.formatPRReview(prReview));

  console.log('\n4. Reviewing specific commit...');
  // Review the last commit
  const commitReview = await gitHooksIntegration.reviewChangedFiles({
    commit: 'HEAD'
  });
  
  console.log(`Found ${commitReview.findings.length} issues in last commit`);
}

// Example webhook handler for GitHub
export async function handleGitHubWebhook(payload: any) {
  const { action, pull_request, repository } = payload;
  
  if (!['opened', 'synchronize'].includes(action)) {
    return { message: 'Ignoring non-PR event' };
  }

  // Run PR review
  const review = await prReviewIntegration.reviewPullRequest({
    owner: repository.owner.login,
    repo: repository.name,
    prNumber: pull_request.number,
    baseBranch: pull_request.base.ref,
    headBranch: pull_request.head.ref,
    postComments: true,
    requestChangesOnError: true,
    approveOnSuccess: true
  });

  // In a real implementation, you would post these comments to GitHub
  console.log(`Review completed: ${review.status}`);
  console.log(`${review.comments.length} comments generated`);

  return {
    status: review.status,
    summary: review.summary,
    commentCount: review.comments.length
  };
}

// Run example if called directly
if (require.main === module) {
  setupExample().catch(console.error);
}