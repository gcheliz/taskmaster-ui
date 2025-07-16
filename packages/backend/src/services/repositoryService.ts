import { DatabaseService } from './database';

export interface Repository {
  id: string;
  path: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Repository Service
 * 
 * Handles repository data persistence and retrieval from the database.
 * Provides CRUD operations for repository management.
 */
export class RepositoryService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * Get repository by ID
   */
  async getRepositoryById(id: string): Promise<Repository | null> {
    try {
      const result = await this.dbService.get(
        'SELECT * FROM repositories WHERE id = ?',
        [id]
      );
      return result || null;
    } catch (error) {
      console.error('Error getting repository by ID:', error);
      throw error;
    }
  }

  /**
   * Get all repositories
   */
  async getAllRepositories(): Promise<Repository[]> {
    try {
      const results = await this.dbService.all('SELECT * FROM repositories ORDER BY created_at DESC');
      return results || [];
    } catch (error) {
      console.error('Error getting all repositories:', error);
      throw error;
    }
  }

  /**
   * Get repository by path
   */
  async getRepositoryByPath(path: string): Promise<Repository | null> {
    try {
      const result = await this.dbService.get(
        'SELECT * FROM repositories WHERE path = ?',
        [path]
      );
      return result || null;
    } catch (error) {
      console.error('Error getting repository by path:', error);
      throw error;
    }
  }

  /**
   * Create a new repository
   */
  async createRepository(path: string, name: string): Promise<Repository> {
    try {
      const id = `repo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await this.dbService.run(
        'INSERT INTO repositories (id, path, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [id, path, name, now, now]
      );

      return {
        id,
        path,
        name,
        created_at: now,
        updated_at: now
      };
    } catch (error) {
      console.error('Error creating repository:', error);
      throw error;
    }
  }

  /**
   * Update repository
   */
  async updateRepository(id: string, updates: Partial<Pick<Repository, 'path' | 'name'>>): Promise<Repository | null> {
    try {
      const existing = await this.getRepositoryById(id);
      if (!existing) {
        return null;
      }

      const now = new Date().toISOString();
      const setClause: string[] = [];
      const values: any[] = [];

      if (updates.path !== undefined) {
        setClause.push('path = ?');
        values.push(updates.path);
      }
      
      if (updates.name !== undefined) {
        setClause.push('name = ?');
        values.push(updates.name);
      }

      if (setClause.length === 0) {
        return existing;
      }

      setClause.push('updated_at = ?');
      values.push(now);
      values.push(id);

      await this.dbService.run(
        `UPDATE repositories SET ${setClause.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getRepositoryById(id);
    } catch (error) {
      console.error('Error updating repository:', error);
      throw error;
    }
  }

  /**
   * Delete repository
   */
  async deleteRepository(id: string): Promise<boolean> {
    try {
      const result = await this.dbService.run('DELETE FROM repositories WHERE id = ?', [id]);
      return (result.changes || 0) > 0;
    } catch (error) {
      console.error('Error deleting repository:', error);
      throw error;
    }
  }

  /**
   * Check if repository exists by path
   */
  async repositoryExistsByPath(path: string): Promise<boolean> {
    try {
      const result = await this.getRepositoryByPath(path);
      return result !== null;
    } catch (error) {
      console.error('Error checking repository existence:', error);
      throw error;
    }
  }

  /**
   * Count total repositories
   */
  async getRepositoryCount(): Promise<number> {
    try {
      const result = await this.dbService.get('SELECT COUNT(*) as count FROM repositories');
      return result?.count || 0;
    } catch (error) {
      console.error('Error counting repositories:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const repositoryService = new RepositoryService();