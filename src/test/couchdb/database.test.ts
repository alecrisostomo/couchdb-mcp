import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as database from '../../couchdb/database.js';
import { couch } from '../../couchdb/client.js';

vi.mock('../../couchdb/client.js', () => ({
  couch: {
    db: {
      get: vi.fn(),
      create: vi.fn(),
      list: vi.fn(),
      destroy: vi.fn(),
    },
    use: vi.fn(),
  },
}));

describe('database', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ensureDatabase', () => {
    it('should return existing database if it exists', async () => {
      const mockDb = { insert: vi.fn() };
      const mockDbInfo = {
        db_name: 'testdb',
        compact_running: false,
        disk_format_version: 8,
        data_size: 0,
        disk_size: 0,
        doc_count: 0,
        doc_del_count: 0,
        instance_start_time: '0',
        purge_seq: '0',
        update_seq: '0',
        sizes: {
          active: 0,
          external: 0,
          file: 0
        }
      };
      vi.mocked(couch.db.get).mockResolvedValue(mockDbInfo as any);
      vi.mocked(couch.use).mockReturnValue(mockDb as any);
      
      const result = await database.ensureDatabase('testdb');
      
      expect(couch.db.get).toHaveBeenCalledWith('testdb');
      expect(couch.db.create).not.toHaveBeenCalled();
      expect(couch.use).toHaveBeenCalledWith('testdb');
      expect(result).toBe(mockDb);
    });

    it('should create database if it does not exist', async () => {
      const mockDb = { insert: vi.fn() };
      vi.mocked(couch.db.get).mockRejectedValue({ statusCode: 404 });
      vi.mocked(couch.db.create).mockResolvedValue({});
      vi.mocked(couch.use).mockReturnValue(mockDb as any);
      
      const result = await database.ensureDatabase('testdb');
      
      expect(couch.db.get).toHaveBeenCalledWith('testdb');
      expect(couch.db.create).toHaveBeenCalledWith('testdb');
      expect(couch.use).toHaveBeenCalledWith('testdb');
      expect(result).toBe(mockDb);
    });

    it('should throw error if database operation fails for non-404 error', async () => {
      const error: any = new Error('Database error');
      error.statusCode = 500;
      vi.mocked(couch.db.get).mockRejectedValue(error);
      
      await expect(database.ensureDatabase('testdb')).rejects.toThrow('Database error');
      expect(couch.db.create).not.toHaveBeenCalled();
    });
  });

  describe('listDatabases', () => {
    it('should list all databases', async () => {
      const mockDatabases = ['db1', 'db2', 'db3'];
      vi.mocked(couch.db.list).mockResolvedValue(mockDatabases);
      
      const result = await database.listDatabases();
      
      expect(result).toEqual(mockDatabases);
      expect(couch.db.list).toHaveBeenCalled();
    });
  });

  describe('deleteDatabase', () => {
    it('should delete a database', async () => {
      vi.mocked(couch.db.destroy).mockResolvedValue({ ok: true });
      
      await database.deleteDatabase('testdb');
      
      expect(couch.db.destroy).toHaveBeenCalledWith('testdb');
    });
  });
});

