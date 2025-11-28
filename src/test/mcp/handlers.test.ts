import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import * as handlers from '../../mcp/handlers.js';
import * as database from '../../couchdb/database.js';
import * as document from '../../couchdb/document.js';
import * as mango from '../../couchdb/mango.js';
import * as query from '../../couchdb/query.js';
import * as version from '../../couchdb/version.js';

vi.mock('../../couchdb/database.js');
vi.mock('../../couchdb/document.js');
vi.mock('../../couchdb/mango.js');
vi.mock('../../couchdb/query.js');
vi.mock('../../couchdb/version.js');

describe('handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleCreateDatabase', () => {
    it('should create a database successfully', async () => {
      vi.mocked(database.ensureDatabase).mockResolvedValue({} as any);
      
      const result = await handlers.handleCreateDatabase({ dbName: 'testdb' });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('created successfully');
      expect(database.ensureDatabase).toHaveBeenCalledWith('testdb');
    });

    it('should return error for invalid database name', async () => {
      await expect(handlers.handleCreateDatabase({})).rejects.toThrow(McpError);
      await expect(handlers.handleCreateDatabase({ dbName: 123 })).rejects.toThrow(McpError);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(database.ensureDatabase).mockRejectedValue(new Error('Database error'));
      
      const result = await handlers.handleCreateDatabase({ dbName: 'testdb' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error: Database error');
    });
  });

  describe('handleListDatabases', () => {
    it('should list databases successfully', async () => {
      const mockDatabases = ['db1', 'db2', 'db3'];
      vi.mocked(database.listDatabases).mockResolvedValue(mockDatabases);
      
      const result = await handlers.handleListDatabases();
      
      expect(result.isError).toBeUndefined();
      expect(JSON.parse(result.content[0].text)).toEqual(mockDatabases);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(database.listDatabases).mockRejectedValue(new Error('List error'));
      
      const result = await handlers.handleListDatabases();
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error: List error');
    });
  });

  describe('handleDeleteDatabase', () => {
    it('should delete a database successfully', async () => {
      vi.mocked(database.deleteDatabase).mockResolvedValue();
      
      const result = await handlers.handleDeleteDatabase({ dbName: 'testdb' });
      
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('deleted successfully');
      expect(database.deleteDatabase).toHaveBeenCalledWith('testdb');
    });

    it('should return error for invalid database name', async () => {
      await expect(handlers.handleDeleteDatabase({})).rejects.toThrow(McpError);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(database.deleteDatabase).mockRejectedValue(new Error('Delete error'));
      
      const result = await handlers.handleDeleteDatabase({ dbName: 'testdb' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error: Delete error');
    });
  });

  describe('handleCreateDocument', () => {
    it('should create a document successfully', async () => {
      const mockResponse = { id: 'doc1', rev: '1-abc' };
      vi.mocked(document.createDocument).mockResolvedValue(mockResponse);
      
      const result = await handlers.handleCreateDocument({
        dbName: 'testdb',
        docId: 'doc1',
        data: { name: 'test' }
      });
      
      expect(result.isError).toBeUndefined();
      expect(JSON.parse(result.content[0].text)).toEqual(mockResponse);
      expect(document.createDocument).toHaveBeenCalledWith('testdb', 'doc1', { name: 'test' });
    });

    it('should return error for missing parameters', async () => {
      await expect(handlers.handleCreateDocument({})).rejects.toThrow(McpError);
      await expect(handlers.handleCreateDocument({ dbName: 'testdb' })).rejects.toThrow(McpError);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(document.createDocument).mockRejectedValue(new Error('Create error'));
      
      const result = await handlers.handleCreateDocument({
        dbName: 'testdb',
        docId: 'doc1',
        data: {}
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error: Create error');
    });
  });

  describe('handleGetDocument', () => {
    it('should get a document successfully', async () => {
      const mockDoc = { _id: 'doc1', _rev: '1-abc', name: 'test' };
      vi.mocked(document.getDocument).mockResolvedValue(mockDoc);
      
      const result = await handlers.handleGetDocument({
        dbName: 'testdb',
        docId: 'doc1'
      });
      
      expect(result.isError).toBeUndefined();
      expect(JSON.parse(result.content[0].text)).toEqual(mockDoc);
      expect(document.getDocument).toHaveBeenCalledWith('testdb', 'doc1');
    });

    it('should return error for missing parameters', async () => {
      await expect(handlers.handleGetDocument({})).rejects.toThrow(McpError);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(document.getDocument).mockRejectedValue(new Error('Get error'));
      
      const result = await handlers.handleGetDocument({
        dbName: 'testdb',
        docId: 'doc1'
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error: Get error');
    });
  });

  describe('handleCreateMangoIndex', () => {
    it('should create a mango index successfully', async () => {
      const mockResult = { result: 'created' };
      vi.mocked(mango.createMangoIndex).mockResolvedValue(mockResult);
      
      const result = await handlers.handleCreateMangoIndex({
        dbName: 'testdb',
        indexName: 'idx1',
        fields: ['field1', 'field2']
      });
      
      expect(result.isError).toBeUndefined();
      expect(JSON.parse(result.content[0].text)).toEqual(mockResult);
      expect(mango.createMangoIndex).toHaveBeenCalledWith('testdb', 'idx1', ['field1', 'field2']);
    });

    it('should return error for missing parameters', async () => {
      await expect(handlers.handleCreateMangoIndex({})).rejects.toThrow(McpError);
    });
  });

  describe('handleQueryDocuments', () => {
    it('should query documents successfully', async () => {
      const mockResult = { docs: [{ _id: 'doc1', name: 'test' }] };
      vi.mocked(query.queryDocuments).mockResolvedValue(mockResult);
      
      const result = await handlers.handleQueryDocuments({
        dbName: 'testdb',
        filters: [{ field: 'name', value: 'test' }]
      });
      
      expect(result.isError).toBeUndefined();
      expect(JSON.parse(result.content[0].text)).toEqual(mockResult);
    });

    it('should return error for missing parameters', async () => {
      await expect(handlers.handleQueryDocuments({})).rejects.toThrow(McpError);
      await expect(handlers.handleQueryDocuments({ dbName: 'testdb' })).rejects.toThrow(McpError);
    });
  });

  describe('validateMangoTool', () => {
    it('should validate mango tool for CouchDB 3.x+', async () => {
      vi.mocked(version.isVersion3OrHigher).mockResolvedValue(true);
      
      await expect(handlers.validateMangoTool('createMangoIndex')).resolves.not.toThrow();
    });

    it('should throw error for mango tool on older CouchDB', async () => {
      vi.mocked(version.isVersion3OrHigher).mockResolvedValue(false);
      
      await expect(handlers.validateMangoTool('createMangoIndex')).rejects.toThrow(McpError);
    });

    it('should not validate non-mango tools', async () => {
      await expect(handlers.validateMangoTool('createDatabase')).resolves.not.toThrow();
      expect(version.isVersion3OrHigher).not.toHaveBeenCalled();
    });
  });
});

