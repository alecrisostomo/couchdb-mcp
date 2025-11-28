import { ensureDatabase } from './database.js';
import type { MangoQuery } from 'nano';

export interface QueryFilter {
  field: string;
  value: any;
  operator?: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'nin' | 'exists' | 'type' | 'regex';
}

export interface QuerySort {
  field: string;
  order?: 'asc' | 'desc';
}

export async function findDocuments(
  dbName: string,
  query: MangoQuery
): Promise<any> {
  const db = await ensureDatabase(dbName);
  return db.find(query);
}

export async function queryDocuments(
  dbName: string,
  filters: QueryFilter[],
  limit?: number,
  skip?: number,
  fields?: string[],
  sort?: QuerySort[],
  returnIdsOnly?: boolean
): Promise<any> {
  const db = await ensureDatabase(dbName);
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


