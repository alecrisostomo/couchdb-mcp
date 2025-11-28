import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as tools from '../../mcp/tools.js';
import * as version from '../../couchdb/version.js';

vi.mock('../../couchdb/version.js');

describe('tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailableTools', () => {
    it('should return base tools only for CouchDB < 3.0', async () => {
      vi.mocked(version.isVersion3OrHigher).mockResolvedValue(false);
      
      const result = await tools.getAvailableTools();
      
      expect(result.length).toBe(5); // BASE_TOOLS
      expect(result.some(t => t.name === 'createDatabase')).toBe(true);
      expect(result.some(t => t.name === 'listDatabases')).toBe(true);
      expect(result.some(t => t.name === 'deleteDatabase')).toBe(true);
      expect(result.some(t => t.name === 'createDocument')).toBe(true);
      expect(result.some(t => t.name === 'getDocument')).toBe(true);
      expect(result.some(t => t.name === 'createMangoIndex')).toBe(false);
    });

    it('should return base and mango tools for CouchDB >= 3.0', async () => {
      vi.mocked(version.isVersion3OrHigher).mockResolvedValue(true);
      
      const result = await tools.getAvailableTools();
      
      expect(result.length).toBe(10); // BASE_TOOLS + MANGO_TOOLS
      expect(result.some(t => t.name === 'createDatabase')).toBe(true);
      expect(result.some(t => t.name === 'createMangoIndex')).toBe(true);
      expect(result.some(t => t.name === 'deleteMangoIndex')).toBe(true);
      expect(result.some(t => t.name === 'listMangoIndexes')).toBe(true);
      expect(result.some(t => t.name === 'findDocuments')).toBe(true);
      expect(result.some(t => t.name === 'queryDocuments')).toBe(true);
    });

    it('should return base tools on error checking version', async () => {
      vi.mocked(version.isVersion3OrHigher).mockRejectedValue(new Error('Connection error'));
      
      const result = await tools.getAvailableTools();
      
      expect(result.length).toBe(5); // BASE_TOOLS only
    });
  });

  describe('tool definitions', () => {
    it('should have correct structure for createDatabase', async () => {
      vi.mocked(version.isVersion3OrHigher).mockResolvedValue(false);
      const availableTools = await tools.getAvailableTools();
      const tool = availableTools.find((t: any) => t.name === 'createDatabase');
      
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.properties.dbName).toBeDefined();
      expect(tool?.inputSchema.required).toContain('dbName');
    });

    it('should have correct structure for queryDocuments', async () => {
      vi.mocked(version.isVersion3OrHigher).mockResolvedValue(true);
      const availableTools = await tools.getAvailableTools();
      const tool = availableTools.find((t: any) => t.name === 'queryDocuments');
      
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.properties.filters).toBeDefined();
      expect(tool?.inputSchema.properties.limit).toBeDefined();
      expect(tool?.inputSchema.properties.skip).toBeDefined();
      expect(tool?.inputSchema.properties.fields).toBeDefined();
      expect(tool?.inputSchema.properties.sort).toBeDefined();
      expect(tool?.inputSchema.required).toContain('dbName');
      expect(tool?.inputSchema.required).toContain('filters');
    });
  });
});

