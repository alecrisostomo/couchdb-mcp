import { couch } from './client.js';
import { ensureDatabase } from './database.js';

export async function createMangoIndex(
  dbName: string,
  indexName: string,
  fields: string[]
): Promise<any> {
  const db = await ensureDatabase(dbName);
  return db.createIndex({
    name: indexName,
    index: { fields: fields }
  });
}

export async function deleteMangoIndex(
  dbName: string,
  designDoc: string,
  indexName: string
): Promise<any> {
  return await couch.request({
    db: dbName,
    method: 'delete',
    path: `_index/_design/${designDoc}/json/${indexName}`
  });
}

export async function listMangoIndexes(dbName: string): Promise<any> {
  return await couch.request({
    db: dbName,
    method: 'get',
    path: '_index'
  });
}


