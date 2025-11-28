import { isVersion3OrHigher } from '../couchdb/version.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

const BASE_TOOLS: ToolDefinition[] = [
  {
    name: 'createDatabase',
    description: 'Create a new CouchDB database',
    inputSchema: {
      type: 'object',
      properties: {
        dbName: { type: 'string', description: 'Database name' },
      },
      required: ['dbName'],
    },
  },
  {
    name: 'listDatabases',
    description: 'List all CouchDB databases',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'deleteDatabase',
    description: 'Delete a CouchDB database',
    inputSchema: {
      type: 'object',
      properties: {
        dbName: { type: 'string', description: 'Database name to delete' },
      },
      required: ['dbName'],
    },
  },
  {
    name: 'createDocument',
    description: 'Create a new document or update an existing document in a database',
    inputSchema: {
      type: 'object',
      properties: {
        dbName: { type: 'string', description: 'Database name' },
        docId: { type: 'string', description: 'Document ID' },
        data: { type: 'object', description: 'Document data' },
      },
      required: ['dbName', 'docId', 'data'],
    },
  },
  {
    name: 'getDocument',
    description: 'Get a document from a database',
    inputSchema: {
      type: 'object',
      properties: {
        dbName: { type: 'string', description: 'Database name' },
        docId: { type: 'string', description: 'Document ID' },
      },
      required: ['dbName', 'docId'],
    },
  },
];

const MANGO_TOOLS: ToolDefinition[] = [
  {
    name: 'createMangoIndex',
    description: 'Create a new Mango index (CouchDB 3.x+)',
    inputSchema: {
      type: 'object',
      properties: {
        dbName: { type: 'string', description: 'Database name' },
        indexName: { type: 'string', description: 'Name of the index' },
        fields: { type: 'array', items: { type: 'string' }, description: 'Fields to index' },
      },
      required: ['dbName', 'indexName', 'fields'],
    },
  },
  {
    name: 'deleteMangoIndex',
    description: 'Delete a Mango index (CouchDB 3.x+)',
    inputSchema: {
      type: 'object',
      properties: {
        dbName: { type: 'string', description: 'Database name' },
        designDoc: { type: 'string', description: 'Design document name' },
        indexName: { type: 'string', description: 'Name of the index' },
      },
      required: ['dbName', 'designDoc', 'indexName'],
    },
  },
  {
    name: 'listMangoIndexes',
    description: 'List all Mango indexes in a database (CouchDB 3.x+)',
    inputSchema: {
      type: 'object',
      properties: {
        dbName: { type: 'string', description: 'Database name' },
      },
      required: ['dbName'],
    },
  },
  {
    name: 'findDocuments',
    description: 'Query documents using Mango query (CouchDB 3.x+)',
    inputSchema: {
      type: 'object',
      properties: {
        dbName: { type: 'string', description: 'Database name' },
        query: { type: 'object', description: 'Mango query object' },
      },
      required: ['dbName', 'query'],
    },
  },
  {
    name: 'queryDocuments',
    description: 'Query documents using simplified parameters (CouchDB 3.x+)',
    inputSchema: {
      type: 'object',
      properties: {
        dbName: { type: 'string', description: 'Database name' },
        filters: {
          type: 'array',
          description: 'Array of filter objects with field, value, and optional operator',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', description: 'Field name to filter by' },
              value: { description: 'Value to compare against' },
              operator: {
                type: 'string',
                enum: ['==', '!=', '>', '<', '>=', '<=', 'in', 'nin', 'exists', 'type', 'regex'],
                default: '==',
              },
            },
            required: ['field', 'value'],
          },
        },
        limit: { type: 'number', description: 'Maximum number of documents to return' },
        skip: { type: 'number', description: 'Number of documents to skip' },
        fields: { type: 'array', items: { type: 'string' }, description: 'Field names to return' },
        sort: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', description: 'Field name to sort by' },
              order: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
            },
            required: ['field'],
          },
        },
        returnIdsOnly: { type: 'boolean', default: false },
      },
      required: ['dbName', 'filters'],
    },
  },
];

export async function getAvailableTools(): Promise<ToolDefinition[]> {
  const isV3Plus = await isVersion3OrHigher().catch(() => false);
  return isV3Plus ? [...BASE_TOOLS, ...MANGO_TOOLS] : BASE_TOOLS;
}

export const MANGO_TOOL_NAMES = [
  'createMangoIndex',
  'deleteMangoIndex',
  'listMangoIndexes',
  'findDocuments',
  'queryDocuments',
];


