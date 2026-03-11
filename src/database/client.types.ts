export interface DatabaseClient {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, ...params: unknown[]): Promise<{ changes: number; lastInsertRowId: number | bigint }>;
  getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]>;
  getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}
