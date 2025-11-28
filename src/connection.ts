import nano, { ServerScope, DocumentScope, MangoQuery } from 'nano';
import * as dotenv from 'dotenv';

dotenv.config();

const couchdbUrl = process.env.COUCHDB_URL || 'http://localhost:5984';
const couch: ServerScope = nano(couchdbUrl);

let couchdbVersion: string | null = null;

export async function detectVersion(): Promise<string> {
  if (!couchdbVersion) {
    const info = await couch.info();
    couchdbVersion = info.version;
  }
  return couchdbVersion;
}

export async function isVersion3OrHigher(): Promise<boolean> {
  const version = await detectVersion();
  return parseInt(version.split('.')[0]) >= 3;
}

export async function getDatabase(dbName: string): Promise<DocumentScope<any>> {
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

export async function createMangoIndex(dbName: string, indexName: string, fields: string[]): Promise<any> {
  const db = await getDatabase(dbName);
  return db.createIndex({
    name: indexName,
    index: { fields: fields }
  });
}

export async function deleteMangoIndex(dbName: string, designDoc: string, indexName: string): Promise<any> {
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

export async function findDocuments(dbName: string, query: MangoQuery): Promise<any> {
  const db = await getDatabase(dbName);
  return db.find(query);
}

interface Filter {
  field: string;
  value: any;
  operator?: string;
}

interface Sort {
  field: string;
  order?: 'asc' | 'desc';
}

export async function queryDocuments(
  dbName: string,
  filters: Filter[],
  limit?: number,
  skip?: number,
  fields?: string[],
  sort?: Sort[],
  returnIdsOnly?: boolean
): Promise<any> {
  const db = await getDatabase(dbName);
  const selector: any = {};
  
  for (const filter of filters) {
    const { field, value, operator = '==' } = filter;
    switch (operator) {
      case '==':
        selector[field] = value;
        break;
      case '!=':
        selector[field] = { $ne: value };
        break;
      case '>':
        selector[field] = { $gt: value };
        break;
      case '<':
        selector[field] = { $lt: value };
        break;
      case '>=':
        selector[field] = { $gte: value };
        break;
      case '<=':
        selector[field] = { $lte: value };
        break;
      case 'in':
        selector[field] = { $in: Array.isArray(value) ? value : [value] };
        break;
      case 'nin':
        selector[field] = { $nin: Array.isArray(value) ? value : [value] };
        break;
      case 'exists':
        selector[field] = { $exists: value };
        break;
      case 'type':
        selector[field] = { $type: value };
        break;
      case 'regex':
        selector[field] = { $regex: value };
        break;
      default:
        selector[field] = value;
    }
  }
  
  const query: MangoQuery = { selector };
  if (limit !== undefined) query.limit = limit;
  if (skip !== undefined) query.skip = skip;
  if (fields && fields.length > 0) query.fields = fields;
  if (sort && sort.length > 0) {
    query.sort = sort.map(s => {
      const sortObj: any = {};
      sortObj[s.field] = s.order === 'desc' ? 'desc' : 'asc';
      return sortObj;
    });
  }
  
  const result = await db.find(query);
  if (returnIdsOnly) {
    return {
      docs: result.docs.map((doc: any) => doc._id),
      bookmark: result.bookmark,
      warning: result.warning,
    };
  }
  return result;
}

export default couch;
