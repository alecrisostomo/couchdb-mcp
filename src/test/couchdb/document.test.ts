import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as document from '../../couchdb/document.js';
import * as database from '../../couchdb/database.js';

vi.mock('../../couchdb/database.js');

describe('document', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDocument', () => {
    it('should create a document successfully', async () => {
      const mockDb = {
        insert: vi.fn().mockResolvedValue({ id: 'doc1', rev: '1-abc' })
      };
      vi.mocked(database.ensureDatabase).mockResolvedValue(mockDb as any);
      
      const data = { name: 'test', value: 123 };
      const result = await document.createDocument('testdb', 'doc1', data);
      
      expect(database.ensureDatabase).toHaveBeenCalledWith('testdb');
      expect(mockDb.insert).toHaveBeenCalledWith(data, 'doc1');
      expect(result).toEqual({ id: 'doc1', rev: '1-abc' });
    });
  });

  describe('getDocument', () => {
    it('should get a document successfully', async () => {
      const mockDoc = { _id: 'doc1', _rev: '1-abc', name: 'test' };
      const mockDb = {
        get: vi.fn().mockResolvedValue(mockDoc)
      };
      vi.mocked(database.ensureDatabase).mockResolvedValue(mockDb as any);
      
      const result = await document.getDocument('testdb', 'doc1');
      
      expect(database.ensureDatabase).toHaveBeenCalledWith('testdb');
      expect(mockDb.get).toHaveBeenCalledWith('doc1');
      expect(result).toEqual(mockDoc);
    });

    it('should handle errors when document does not exist', async () => {
      const mockDb = {
        get: vi.fn().mockRejectedValue(new Error('Document not found'))
      };
      vi.mocked(database.ensureDatabase).mockResolvedValue(mockDb as any);
      
      await expect(document.getDocument('testdb', 'doc1')).rejects.toThrow('Document not found');
    });
  });
});

