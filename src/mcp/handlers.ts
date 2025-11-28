import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { ensureDatabase, listDatabases, deleteDatabase } from '../couchdb/database.js';
import { createDocument, getDocument } from '../couchdb/document.js';
import { createMangoIndex, deleteMangoIndex, listMangoIndexes } from '../couchdb/mango.js';
import { findDocuments, queryDocuments } from '../couchdb/query.js';
import { isVersion3OrHigher } from '../couchdb/version.js';
import { MANGO_TOOL_NAMES } from './tools.js';

export async function handleCreateDatabase(args: any) {
  if (!args.dbName || typeof args.dbName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'Invalid database name');
  }
  try {
    await ensureDatabase(args.dbName);
    return { content: [{ type: 'text', text: `Database ${args.dbName} created successfully` }] };
  } catch (error: any) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
}

export async function handleListDatabases() {
  try {
    const databases = await listDatabases();
    return { content: [{ type: 'text', text: JSON.stringify(databases, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
}

export async function handleDeleteDatabase(args: any) {
  if (!args.dbName || typeof args.dbName !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'Invalid database name');
  }
  try {
    await deleteDatabase(args.dbName);
    return { content: [{ type: 'text', text: `Database ${args.dbName} deleted successfully` }] };
  } catch (error: any) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
}

export async function handleCreateDocument(args: any) {
  if (!args.dbName || !args.docId || !args.data) {
    throw new McpError(ErrorCode.InvalidParams, 'Missing required parameters');
  }
  try {
    const response = await createDocument(args.dbName, args.docId, args.data);
    return { content: [{ type: 'text', text: JSON.stringify(response) }] };
  } catch (error: any) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
}

export async function handleGetDocument(args: any) {
  if (!args.dbName || !args.docId) {
    throw new McpError(ErrorCode.InvalidParams, 'Missing required parameters');
  }
  try {
    const doc = await getDocument(args.dbName, args.docId);
    return { content: [{ type: 'text', text: JSON.stringify(doc, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
}

export async function handleCreateMangoIndex(args: any) {
  if (!args.dbName || !args.indexName || !args.fields) {
    throw new McpError(ErrorCode.InvalidParams, 'Missing required parameters');
  }
  try {
    const result = await createMangoIndex(args.dbName, args.indexName, args.fields);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
}

export async function handleDeleteMangoIndex(args: any) {
  if (!args.dbName || !args.designDoc || !args.indexName) {
    throw new McpError(ErrorCode.InvalidParams, 'Missing required parameters');
  }
  try {
    const result = await deleteMangoIndex(args.dbName, args.designDoc, args.indexName);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
}

export async function handleListMangoIndexes(args: any) {
  if (!args.dbName) {
    throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter');
  }
  try {
    const result = await listMangoIndexes(args.dbName);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
}

export async function handleFindDocuments(args: any) {
  if (!args.dbName || !args.query) {
    throw new McpError(ErrorCode.InvalidParams, 'Missing required parameters');
  }
  try {
    const result = await findDocuments(args.dbName, args.query);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
}

export async function handleQueryDocuments(args: any) {
  if (!args.dbName || !args.filters || !Array.isArray(args.filters)) {
    throw new McpError(ErrorCode.InvalidParams, 'Missing required parameters');
  }
  try {
    const result = await queryDocuments(
      args.dbName,
      args.filters,
      args.limit,
      args.skip,
      args.fields,
      args.sort,
      args.returnIdsOnly
    );
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
  }
}

export async function validateMangoTool(toolName: string): Promise<void> {
  if (MANGO_TOOL_NAMES.includes(toolName)) {
    const isV3 = await isVersion3OrHigher();
    if (!isV3) {
      throw new McpError(ErrorCode.MethodNotFound, `Tool ${toolName} requires CouchDB 3.x or higher`);
    }
  }
}


