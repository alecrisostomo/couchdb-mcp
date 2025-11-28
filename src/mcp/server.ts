import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { getAvailableTools } from './tools.js';
import { validateMangoTool } from './handlers.js';
import {
  handleCreateDatabase,
  handleListDatabases,
  handleDeleteDatabase,
  handleCreateDocument,
  handleGetDocument,
  handleCreateMangoIndex,
  handleDeleteMangoIndex,
  handleListMangoIndexes,
  handleFindDocuments,
  handleQueryDocuments,
} from './handlers.js';

export class CouchDBServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'couchdb-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = await getAvailableTools();
      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      await validateMangoTool(request.params.name);

      switch (request.params.name) {
        case 'createDatabase':
          return handleCreateDatabase(request.params.arguments);
        case 'listDatabases':
          return handleListDatabases();
        case 'deleteDatabase':
          return handleDeleteDatabase(request.params.arguments);
        case 'createDocument':
          return handleCreateDocument(request.params.arguments);
        case 'getDocument':
          return handleGetDocument(request.params.arguments);
        case 'createMangoIndex':
          return handleCreateMangoIndex(request.params.arguments);
        case 'deleteMangoIndex':
          return handleDeleteMangoIndex(request.params.arguments);
        case 'listMangoIndexes':
          return handleListMangoIndexes(request.params.arguments);
        case 'findDocuments':
          return handleFindDocuments(request.params.arguments);
        case 'queryDocuments':
          return handleQueryDocuments(request.params.arguments);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
      }
    });
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}


