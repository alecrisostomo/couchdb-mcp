import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as query from '../../couchdb/query.js';
import * as database from '../../couchdb/database.js';

vi.mock('../../couchdb/database.js');

describe('query', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findDocuments', () => {
    it('should find documents using mango query', async () => {
      const mockResult = {
        docs: [{ _id: 'doc1', name: 'test' }],
        bookmark: 'bookmark1'
      };
      const mockDb = {
        find: vi.fn().mockResolvedValue(mockResult)
      };
      vi.mocked(database.ensureDatabase).mockResolvedValue(mockDb as any);
      
      const mangoQuery = {
        selector: { name: 'test' },
        limit: 10
      };
      const result = await query.findDocuments('testdb', mangoQuery);
      
      expect(database.ensureDatabase).toHaveBeenCalledWith('testdb');
      expect(mockDb.find).toHaveBeenCalledWith(mangoQuery);
      expect(result).toEqual(mockResult);
    });
  });

  describe('queryDocuments', () => {
    it('should query documents with simple equality filter', async () => {
      const mockResult = {
        docs: [{ _id: 'doc1', name: 'test' }],
        bookmark: 'bookmark1'
      };
      const mockDb = {
        find: vi.fn().mockResolvedValue(mockResult)
      };
      vi.mocked(database.ensureDatabase).mockResolvedValue(mockDb as any);
      
      const result = await query.queryDocuments('testdb', [
        { field: 'name', value: 'test' }
      ]);
      
      expect(mockDb.find).toHaveBeenCalledWith({
        selector: { name: 'test' }
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle different operators', async () => {
      const mockDb = { find: vi.fn().mockResolvedValue({ docs: [] }) };
      vi.mocked(database.ensureDatabase).mockResolvedValue(mockDb as any);
      
      await query.queryDocuments('testdb', [
        { field: 'age', value: 18, operator: '>=' },
        { field: 'status', value: 'active', operator: '!=' },
        { field: 'tags', value: ['tag1', 'tag2'], operator: 'in' }
      ]);
      
      expect(mockDb.find).toHaveBeenCalledWith({
        selector: {
          age: { $gte: 18 },
          status: { $ne: 'active' },
          tags: { $in: ['tag1', 'tag2'] }
        }
      });
    });

    it('should handle limit and skip', async () => {
      const mockDb = { find: vi.fn().mockResolvedValue({ docs: [] }) };
      vi.mocked(database.ensureDatabase).mockResolvedValue(mockDb as any);
      
      await query.queryDocuments('testdb', [
        { field: 'name', value: 'test' }
      ], 10, 5);
      
      expect(mockDb.find).toHaveBeenCalledWith({
        selector: { name: 'test' },
        limit: 10,
        skip: 5
      });
    });

    it('should handle fields selection', async () => {
      const mockDb = { find: vi.fn().mockResolvedValue({ docs: [] }) };
      vi.mocked(database.ensureDatabase).mockResolvedValue(mockDb as any);
      
      await query.queryDocuments('testdb', [
        { field: 'name', value: 'test' }
      ], undefined, undefined, ['name', 'age']);
      
      expect(mockDb.find).toHaveBeenCalledWith({
        selector: { name: 'test' },
        fields: ['name', 'age']
      });
    });

    it('should handle sorting', async () => {
      const mockDb = { find: vi.fn().mockResolvedValue({ docs: [] }) };
      vi.mocked(database.ensureDatabase).mockResolvedValue(mockDb as any);
      
      await query.queryDocuments('testdb', [
        { field: 'name', value: 'test' }
      ], undefined, undefined, undefined, [
        { field: 'age', order: 'desc' },
        { field: 'name', order: 'asc' }
      ]);
      
      expect(mockDb.find).toHaveBeenCalledWith({
        selector: { name: 'test' },
        sort: [{ age: 'desc' }, { name: 'asc' }]
      });
    });

    it('should return only IDs when returnIdsOnly is true', async () => {
      const mockResult = {
        docs: [
          { _id: 'doc1', name: 'test' },
          { _id: 'doc2', name: 'test2' }
        ],
        bookmark: 'bookmark1'
      };
      const mockDb = {
        find: vi.fn().mockResolvedValue(mockResult)
      };
      vi.mocked(database.ensureDatabase).mockResolvedValue(mockDb as any);
      
      const result = await query.queryDocuments('testdb', [
        { field: 'name', value: 'test' }
      ], undefined, undefined, undefined, undefined, true);
      
      expect(result).toEqual({
        docs: ['doc1', 'doc2'],
        bookmark: 'bookmark1',
        warning: undefined
      });
    });

    it('should handle all operators correctly', async () => {
      const mockDb = { find: vi.fn().mockResolvedValue({ docs: [] }) };
      vi.mocked(database.ensureDatabase).mockResolvedValue(mockDb as any);
      
      await query.queryDocuments('testdb', [
        { field: 'a', value: 1, operator: '==' },
        { field: 'b', value: 2, operator: '!=' },
        { field: 'c', value: 3, operator: '>' },
        { field: 'd', value: 4, operator: '<' },
        { field: 'e', value: 5, operator: '>=' },
        { field: 'f', value: 6, operator: '<=' },
        { field: 'g', value: [7, 8], operator: 'in' },
        { field: 'h', value: [9, 10], operator: 'nin' },
        { field: 'i', value: true, operator: 'exists' },
        { field: 'j', value: 'string', operator: 'type' },
        { field: 'k', value: 'pattern', operator: 'regex' }
      ]);
      
      expect(mockDb.find).toHaveBeenCalledWith({
        selector: {
          a: 1,
          b: { $ne: 2 },
          c: { $gt: 3 },
          d: { $lt: 4 },
          e: { $gte: 5 },
          f: { $lte: 6 },
          g: { $in: [7, 8] },
          h: { $nin: [9, 10] },
          i: { $exists: true },
          j: { $type: 'string' },
          k: { $regex: 'pattern' }
        }
      });
    });
  });
});

