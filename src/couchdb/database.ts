import { couch } from './client.js';
import type { DocumentScope } from 'nano';

export async function ensureDatabase(dbName: string): Promise<DocumentScope<any>> {
  try {
    await couch.db.get(dbName);
  } catch (error: any) {
    if (error.statusCode === 404) {
      await couch.db.create(dbName);
    } else {
      throw error;
    }
  }
  return couch.use(dbName);
}

export async function listDatabases(): Promise<string[]> {
  return couch.db.list();
}

export async function deleteDatabase(dbName: string): Promise<void> {
  await couch.db.destroy(dbName);
}


