/**
 * Security Analyzer
 * 
 * Scans code for security vulnerabilities and unsafe patterns
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  Analyzer, 
  AnalyzerOptions, 
  ReviewFinding, 
  Severity
} from '../core-engine';

interface SecurityRule {
  id: string;
  name: string;
  pattern: RegExp;
  message: string;
  severity: Severity;
  documentation?: string;
  fileTypes?: string[];
}

export class SecurityAnalyzer implements Analyzer {
  name = 'security';
  description = 'Security vulnerability scanner for common security issues';
  canFix = false; // Security issues should be fixed manually with careful consideration

  private securityRules: SecurityRule[] = [
    // SQL Injection
    {
      id: 'sql-injection',
      name: 'SQL Injection Risk',
      pattern: /query\s*\(\s*['"`].*\$\{.*\}.*['"`]\s*\)|query\s*\(\s*['"`].*\+.*['"`]\s*\)/gi,
      message: 'Potential SQL injection vulnerability. Use parameterized queries instead of string concatenation',
      severity: Severity.ERROR,
      documentation: 'https://owasp.org/www-community/attacks/SQL_Injection'
    },
    // XSS
    {
      id: 'xss-innerHTML',
      name: 'XSS via innerHTML',
      pattern: /\.innerHTML\s*=\s*[^'"`]/gi,
      message: 'Potential XSS vulnerability. Avoid using innerHTML with user input. Use textContent or sanitize input',
      severity: Severity.ERROR,
      documentation: 'https://owasp.org/www-community/attacks/xss/',
      fileTypes: ['.js', '.jsx', '.ts', '.tsx']
    },
    {
      id: 'xss-dangerouslySetInnerHTML',
      name: 'XSS via dangerouslySetInnerHTML',
      pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:\s*[^}]+\}\s*\}/gi,
      message: 'Using dangerouslySetInnerHTML without sanitization can lead to XSS. Ensure content is sanitized',
      severity: Severity.WARNING,
      documentation: 'https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html',
      fileTypes: ['.jsx', '.tsx']
    },
    // Hardcoded Secrets
    {
      id: 'hardcoded-secret',
      name: 'Hardcoded Secret',
      pattern: /(api[_-]?key|apikey|secret|password|pwd|token|auth)\s*[:=]\s*['"`][a-zA-Z0-9+/=]{16,}['"`]/gi,
      message: 'Potential hardcoded secret detected. Use environment variables instead',
      severity: Severity.ERROR,
      documentation: 'https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password'
    },
    {
      id: 'jwt-secret',
      name: 'Hardcoded JWT Secret',
      pattern: /jwt\.sign\([^,]+,\s*['"`][^'"`]+['"`]/gi,
      message: 'JWT secret should not be hardcoded. Use environment variables',
      severity: Severity.ERROR
    },
    // Insecure Random
    {
      id: 'insecure-random',
      name: 'Insecure Random Number Generation',
      pattern: /Math\.random\(\)\s*\*[^;]*(?:token|password|secret|key|auth)/gi,
      message: 'Math.random() is not cryptographically secure. Use crypto.randomBytes() for security-sensitive operations',
      severity: Severity.WARNING,
      documentation: 'https://nodejs.org/api/crypto.html#cryptorandombytessize-callback'
    },
    // Path Traversal
    {
      id: 'path-traversal',
      name: 'Path Traversal Risk',
      pattern: /path\.join\([^)]*req\.|readFile\([^)]*req\.|require\([^)]*req\./gi,
      message: 'Potential path traversal vulnerability. Validate and sanitize user input used in file paths',
      severity: Severity.ERROR,
      documentation: 'https://owasp.org/www-community/attacks/Path_Traversal'
    },
    // Command Injection
    {
      id: 'command-injection',
      name: 'Command Injection Risk',
      pattern: /exec\(|execSync\(|spawn\([^,)]*\$\{|child_process\.[a-z]+\([^)]*\+/gi,
      message: 'Potential command injection vulnerability. Avoid using user input in system commands',
      severity: Severity.ERROR,
      documentation: 'https://owasp.org/www-community/attacks/Command_Injection'
    },
    // Insecure Deserialization
    {
      id: 'insecure-deserialization',
      name: 'Insecure Deserialization',
      pattern: /JSON\.parse\([^)]*req\.|eval\(|new Function\(/gi,
      message: 'Potential insecure deserialization. Validate input before parsing and avoid eval()',
      severity: Severity.ERROR,
      documentation: 'https://owasp.org/www-community/vulnerabilities/Deserialization_of_untrusted_data'
    },
    // CORS Misconfiguration
    {
      id: 'cors-wildcard',
      name: 'CORS Wildcard',
      pattern: /Access-Control-Allow-Origin['":\s]+\*/gi,
      message: 'CORS wildcard (*) allows any origin. Consider restricting to specific domains',
      severity: Severity.WARNING,
      documentation: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS'
    },
    // Sensitive Data Exposure
    {
      id: 'console-log-sensitive',
      name: 'Sensitive Data in Logs',
      pattern: /console\.(log|error|warn|info)\([^)]*(?:password|token|secret|key|auth)[^)]*\)/gi,
      message: 'Avoid logging sensitive information. Remove or redact sensitive data from logs',
      severity: Severity.WARNING
    },
    // Weak Cryptography
    {
      id: 'weak-crypto',
      name: 'Weak Cryptography',
      pattern: /createHash\(['"`](?:md5|sha1)['"`]\)|crypto\.(?:createCipher|createDecipher)\(/gi,
      message: 'Weak cryptographic algorithm detected. Use SHA-256 or stronger algorithms',
      severity: Severity.ERROR,
      documentation: 'https://nodejs.org/api/crypto.html#cryptohashalgorithm-options'
    },
    // Unsafe Regex
    {
      id: 'regex-dos',
      name: 'ReDoS Risk',
      pattern: /\(\[\^[^\]]*\]\*\)\+|\(\[\^[^\]]*\]\+\)\*/gi,
      message: 'Potential Regular Expression Denial of Service (ReDoS). Review regex for exponential backtracking',
      severity: Severity.WARNING,
      documentation: 'https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS'
    }
  ];

  /**
   * Analyze files for security vulnerabilities
   */
  async analyze(files: string[], options: AnalyzerOptions): Promise<ReviewFinding[]> {
    const findings: ReviewFinding[] = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const fileFindings = await this.analyzeFile(file, content, options);
        findings.push(...fileFindings);
      } catch (error) {
        console.error(`Failed to analyze ${file}: ${error}`);
      }
    }

    // Check for additional security concerns
    const configFindings = await this.checkSecurityConfigurations(files);
    findings.push(...configFindings);

    return findings;
  }

  /**
   * Analyze a single file
   */
  private async analyzeFile(filePath: string, content: string, options: AnalyzerOptions): Promise<ReviewFinding[]> {
    const findings: ReviewFinding[] = [];
    const lines = content.split('\n');
    const fileExt = path.extname(filePath);

    for (const rule of this.securityRules) {
      // Skip if rule doesn't apply to this file type
      if (rule.fileTypes && !rule.fileTypes.includes(fileExt)) {
        continue;
      }

      // Skip ignored rules
      if (options.ignoreRules?.includes(rule.id)) {
        continue;
      }

      // Search for pattern matches
      let match;
      while ((match = rule.pattern.exec(content)) !== null) {
        const position = this.getLineAndColumn(content, match.index);
        
        findings.push({
          analyzer: this.name,
          severity: options.severityOverrides?.[rule.id] || rule.severity,
          file: filePath,
          line: position.line,
          column: position.column,
          message: rule.message,
          rule: rule.id,
          documentation: rule.documentation
        });
      }
    }

    // Additional context-aware checks
    findings.push(...this.performContextAwareChecks(filePath, content, lines));

    return findings;
  }

  /**
   * Get line and column from index
   */
  private getLineAndColumn(content: string, index: number): { line: number; column: number } {
    const lines = content.substring(0, index).split('\n');
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    };
  }

  /**
   * Perform context-aware security checks
   */
  private performContextAwareChecks(filePath: string, content: string, lines: string[]): ReviewFinding[] {
    const findings: ReviewFinding[] = [];

    // Check for environment variable usage
    if (content.includes('process.env')) {
      lines.forEach((line, index) => {
        // Check for default values that might be secrets
        const envMatch = line.match(/process\.env\.[A-Z_]+\s*\|\|\s*['"`]([^'"`]+)['"`]/);
        if (envMatch && envMatch[1].length > 10 && /[a-zA-Z0-9+/=]{16,}/.test(envMatch[1])) {
          findings.push({
            analyzer: this.name,
            severity: Severity.WARNING,
            file: filePath,
            line: index + 1,
            column: line.indexOf(envMatch[0]) + 1,
            message: 'Avoid hardcoding default values for environment variables that might be secrets',
            rule: 'env-var-default'
          });
        }
      });
    }

    // Check for HTTP instead of HTTPS
    const httpPattern = /https?:\/\/[^'"` ]+/gi;
    let match;
    while ((match = httpPattern.exec(content)) !== null) {
      if (match[0].startsWith('http://') && !match[0].includes('localhost') && !match[0].includes('127.0.0.1')) {
        const position = this.getLineAndColumn(content, match.index);
        findings.push({
          analyzer: this.name,
          severity: Severity.WARNING,
          file: filePath,
          line: position.line,
          column: position.column,
          message: 'Use HTTPS instead of HTTP for external resources',
          rule: 'insecure-http'
        });
      }
    }

    return findings;
  }

  /**
   * Check security-related configurations
   */
  private async checkSecurityConfigurations(files: string[]): Promise<ReviewFinding[]> {
    const findings: ReviewFinding[] = [];

    // Check for .env file in version control
    const envFile = files.find(f => f.endsWith('.env') && !f.includes('.example'));
    if (envFile) {
      findings.push({
        analyzer: this.name,
        severity: Severity.ERROR,
        file: envFile,
        message: '.env file should not be committed to version control. Add it to .gitignore',
        rule: 'env-in-vcs'
      });
    }

    // Check package.json for known vulnerable dependencies
    const packageJsonFile = files.find(f => f.endsWith('package.json'));
    if (packageJsonFile) {
      try {
        const content = await fs.readFile(packageJsonFile, 'utf-8');
        const packageJson = JSON.parse(content);
        
        // Check for outdated security-critical packages
        const securityPackages = ['jsonwebtoken', 'bcrypt', 'helmet', 'express-rate-limit'];
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        for (const pkg of securityPackages) {
          if (deps[pkg]) {
            findings.push({
              analyzer: this.name,
              severity: Severity.INFO,
              file: packageJsonFile,
              message: `Security-critical package "${pkg}" is installed. Ensure it's up to date`,
              rule: 'security-package-version'
            });
          }
        }
      } catch (error) {
        // Ignore parse errors
      }
    }

    return findings;
  }
}

// Export singleton instance
export const securityAnalyzer = new SecurityAnalyzer();