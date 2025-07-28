/**
 * Review Cache System
 * 
 * Caches review results to avoid re-analyzing unchanged files
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { ReviewFinding } from './core-engine';

export interface CacheEntry {
  fileHash: string;
  analyzers: string[];
  findings: ReviewFinding[];
  timestamp: number;
  fileSize: number;
  lastModified: string;
}

export interface CacheStats {
  entries: number;
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

export class ReviewCache {
  private cacheDir = '.claude/review-cache';
  private cacheIndex = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0
  };
  private maxCacheSize = 100 * 1024 * 1024; // 100MB
  private maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor(cacheDir?: string) {
    if (cacheDir) {
      this.cacheDir = cacheDir;
    }
  }

  /**
   * Initialize cache
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.cacheDir, { recursive: true });
    await this.loadCacheIndex();
    await this.cleanupExpiredEntries();
  }

  /**
   * Get cached findings for a file
   */
  async getCachedFindings(
    filePath: string,
    analyzers: string[]
  ): Promise<ReviewFinding[] | null> {
    try {
      // Generate cache key
      const cacheKey = await this.generateCacheKey(filePath, analyzers);
      const entry = this.cacheIndex.get(cacheKey);

      if (!entry) {
        this.stats.misses++;
        return null;
      }

      // Check if file has been modified
      const fileStats = await fs.stat(filePath);
      const fileHash = await this.hashFile(filePath);

      if (fileHash !== entry.fileHash || 
          fileStats.mtime.toISOString() !== entry.lastModified) {
        // File has changed, invalidate cache
        await this.invalidateEntry(cacheKey);
        this.stats.misses++;
        return null;
      }

      // Check if cache is expired
      if (Date.now() - entry.timestamp > this.maxCacheAge) {
        await this.invalidateEntry(cacheKey);
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return entry.findings;
    } catch (error) {
      // File might not exist or be inaccessible
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Cache findings for a file
   */
  async cacheFindings(
    filePath: string,
    analyzers: string[],
    findings: ReviewFinding[]
  ): Promise<void> {
    try {
      const fileStats = await fs.stat(filePath);
      const fileHash = await this.hashFile(filePath);
      const cacheKey = await this.generateCacheKey(filePath, analyzers);

      const entry: CacheEntry = {
        fileHash,
        analyzers,
        findings,
        timestamp: Date.now(),
        fileSize: fileStats.size,
        lastModified: fileStats.mtime.toISOString()
      };

      // Save to cache
      this.cacheIndex.set(cacheKey, entry);
      await this.saveCacheEntry(cacheKey, entry);

      // Check cache size and cleanup if needed
      await this.enforceMaxCacheSize();
    } catch (error) {
      console.error(`Failed to cache findings for ${filePath}:`, error);
    }
  }

  /**
   * Invalidate cache for specific files
   */
  async invalidateFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      const keysToRemove: string[] = [];
      
      for (const [key, entry] of this.cacheIndex) {
        if (key.startsWith(filePath)) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        await this.invalidateEntry(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  async clearCache(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(this.cacheDir, file));
        }
      }

      this.cacheIndex.clear();
      this.stats = { hits: 0, misses: 0 };
      
      await this.saveCacheIndex();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = this.cacheIndex.size;
    let totalSize = 0;

    for (const entry of this.cacheIndex.values()) {
      totalSize += entry.fileSize;
    }

    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      entries,
      size: totalSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate
    };
  }

  /**
   * Generate cache key
   */
  private async generateCacheKey(filePath: string, analyzers: string[]): Promise<string> {
    const normalizedPath = path.normalize(filePath);
    const analyzerKey = analyzers.sort().join(',');
    return `${normalizedPath}:${analyzerKey}`;
  }

  /**
   * Hash file contents
   */
  private async hashFile(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Load cache index
   */
  private async loadCacheIndex(): Promise<void> {
    try {
      const indexPath = path.join(this.cacheDir, 'index.json');
      const data = await fs.readFile(indexPath, 'utf-8');
      const index = JSON.parse(data);
      
      this.cacheIndex = new Map(Object.entries(index));
    } catch {
      // Index doesn't exist or is corrupted
      this.cacheIndex = new Map();
    }
  }

  /**
   * Save cache index
   */
  private async saveCacheIndex(): Promise<void> {
    const indexPath = path.join(this.cacheDir, 'index.json');
    const index = Object.fromEntries(this.cacheIndex);
    
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  }

  /**
   * Save cache entry
   */
  private async saveCacheEntry(key: string, entry: CacheEntry): Promise<void> {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    const entryPath = path.join(this.cacheDir, `${hash}.json`);
    
    await fs.writeFile(entryPath, JSON.stringify(entry, null, 2));
    await this.saveCacheIndex();
  }

  /**
   * Invalidate cache entry
   */
  private async invalidateEntry(key: string): Promise<void> {
    this.cacheIndex.delete(key);
    
    const hash = crypto.createHash('md5').update(key).digest('hex');
    const entryPath = path.join(this.cacheDir, `${hash}.json`);
    
    try {
      await fs.unlink(entryPath);
    } catch {
      // File might not exist
    }
    
    await this.saveCacheIndex();
  }

  /**
   * Clean up expired entries
   */
  private async cleanupExpiredEntries(): Promise<void> {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (const [key, entry] of this.cacheIndex) {
      if (now - entry.timestamp > this.maxCacheAge) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      await this.invalidateEntry(key);
    }
  }

  /**
   * Enforce maximum cache size
   */
  private async enforceMaxCacheSize(): Promise<void> {
    let totalSize = 0;
    const entries = Array.from(this.cacheIndex.entries());

    // Calculate total size
    for (const [, entry] of entries) {
      totalSize += entry.fileSize;
    }

    if (totalSize <= this.maxCacheSize) {
      return;
    }

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest entries until under limit
    for (const [key, entry] of entries) {
      if (totalSize <= this.maxCacheSize) {
        break;
      }

      await this.invalidateEntry(key);
      totalSize -= entry.fileSize;
    }
  }

  /**
   * Warm up cache for specific files
   */
  async warmupCache(filePaths: string[], analyzers: string[]): Promise<void> {
    console.log(`Warming up cache for ${filePaths.length} files...`);
    
    for (const filePath of filePaths) {
      try {
        const cacheKey = await this.generateCacheKey(filePath, analyzers);
        
        if (!this.cacheIndex.has(cacheKey)) {
          // File not in cache, it will be analyzed and cached on first review
          continue;
        }
      } catch (error) {
        // Skip files that can't be accessed
      }
    }
  }

  /**
   * Export cache for debugging
   */
  async exportCache(outputPath: string): Promise<void> {
    const cacheData = {
      stats: this.getStats(),
      index: Object.fromEntries(this.cacheIndex),
      metadata: {
        cacheDir: this.cacheDir,
        maxCacheSize: this.maxCacheSize,
        maxCacheAge: this.maxCacheAge,
        exported: new Date().toISOString()
      }
    };

    await fs.writeFile(outputPath, JSON.stringify(cacheData, null, 2));
  }
}

// Export singleton instance
export const reviewCache = new ReviewCache();