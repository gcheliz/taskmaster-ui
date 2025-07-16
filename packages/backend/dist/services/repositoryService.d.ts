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
export declare class RepositoryService {
    private dbService;
    constructor();
    /**
     * Get repository by ID
     */
    getRepositoryById(id: string): Promise<Repository | null>;
    /**
     * Get all repositories
     */
    getAllRepositories(): Promise<Repository[]>;
    /**
     * Get repository by path
     */
    getRepositoryByPath(path: string): Promise<Repository | null>;
    /**
     * Create a new repository
     */
    createRepository(path: string, name: string): Promise<Repository>;
    /**
     * Update repository
     */
    updateRepository(id: string, updates: Partial<Pick<Repository, 'path' | 'name'>>): Promise<Repository | null>;
    /**
     * Delete repository
     */
    deleteRepository(id: string): Promise<boolean>;
    /**
     * Check if repository exists by path
     */
    repositoryExistsByPath(path: string): Promise<boolean>;
    /**
     * Count total repositories
     */
    getRepositoryCount(): Promise<number>;
}
export declare const repositoryService: RepositoryService;
//# sourceMappingURL=repositoryService.d.ts.map