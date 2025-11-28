import { ensureDatabase } from './database.js';

export async function createDocument(
  dbName: string,
  docId: string,
  data: any
): Promise<any> {
  const db = await ensureDatabase(dbName);
  return db.insert(data, docId);
}

export async function getDocument(dbName: string, docId: string): Promise<any> {
  const db = await ensureDatabase(dbName);
  return db.get(docId);
}


