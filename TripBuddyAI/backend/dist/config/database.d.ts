import { Pool } from 'pg';
export declare const pool: Pool;
export declare function initDatabase(): Promise<void>;
export declare function query(text: string, params?: any[]): Promise<import("pg").QueryResult<any>>;
//# sourceMappingURL=database.d.ts.map