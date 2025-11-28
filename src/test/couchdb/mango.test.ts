import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as mango from '../../couchdb/mango.js';
import * as database from '../../couchdb/database.js';
import { couch } from '../../couchdb/client.js';

vi.mock('../../couchdb/database.js');
vi.mock('../../couchdb/client.js', () => ({
  couch: {
    request: vi.fn(),
  },
}));

describe('mango', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMangoIndex', () => {
    it('should create a mango index successfully', async () => {
      const mockResult = { result: 'created', id: '_design/idx1' };
      const mockDb = {
        createIndex: vi.fn().mockResolvedValue(mockResult)
      };
      vi.mocked(database.ensureDatabase).mockResolvedValue(mockDb as any);
      
      const result = await mango.createMangoIndex('testdb', 'idx1', ['field1', 'field2']);
      
      expect(database.ensureDatabase).toHaveBeenCalledWith('testdb');
      expect(mockDb.createIndex).toHaveBeenCalledWith({
        name: 'idx1',
        index: { fields: ['field1', 'field2'] }
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteMangoIndex', () => {
    it('should delete a mango index successfully', async () => {
      const mockResult = { ok: true };
      vi.mocked(couch.request).mockResolvedValue(mockResult);
      
      const result = await mango.deleteMangoIndex('testdb', 'design1', 'idx1');
      
      expect(couch.request).toHaveBeenCalledWith({
        db: 'testdb',
        method: 'delete',
        path: '_index/_design/design1/json/idx1'
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('listMangoIndexes', () => {
    it('should list all mango indexes', async () => {
      const mockResult = {
        indexes: [
          { ddoc: '_design/index1', name: 'idx1', type: 'json' }
        ]
      };
      vi.mocked(couch.request).mockResolvedValue(mockResult);
      
      const result = await mango.listMangoIndexes('testdb');
      
      expect(couch.request).toHaveBeenCalledWith({
        db: 'testdb',
        method: 'get',
        path: '_index'
      });
      expect(result).toEqual(mockResult);
    });
  });
});

