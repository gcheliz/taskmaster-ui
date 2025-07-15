export interface Migration {
    version: number;
    description: string;
    up: string;
    down: string;
}
export declare const migrations: Migration[];
//# sourceMappingURL=migrations.d.ts.map