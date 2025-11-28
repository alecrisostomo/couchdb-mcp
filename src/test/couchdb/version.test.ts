import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../couchdb/client.js', () => ({
  couch: {
    info: vi.fn(),
  },
}));

describe('version', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset modules to clear cache between tests
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('getCouchDBVersion', () => {
    it('should get CouchDB version', async () => {
      const { couch } = await import('../../couchdb/client.js');
      vi.mocked(couch.info).mockResolvedValue({ version: '3.2.1' } as any);
      
      const version = await import('../../couchdb/version.js');
      const result = await version.getCouchDBVersion();
      
      expect(result).toBe('3.2.1');
      expect(couch.info).toHaveBeenCalled();
    });

    it('should cache the version', async () => {
      const { couch } = await import('../../couchdb/client.js');
      vi.mocked(couch.info).mockResolvedValue({ version: '3.2.1' } as any);
      
      const version = await import('../../couchdb/version.js');
      const result1 = await version.getCouchDBVersion();
      const result2 = await version.getCouchDBVersion();
      
      // Should only call info once due to caching
      expect(couch.info).toHaveBeenCalledTimes(1);
      expect(result1).toBe('3.2.1');
      expect(result2).toBe('3.2.1');
    });
  });

  describe('isVersion3OrHigher', () => {
    it('should return true for version 3.x', async () => {
      const { couch } = await import('../../couchdb/client.js');
      vi.mocked(couch.info).mockResolvedValue({ version: '3.2.1' } as any);
      
      const version = await import('../../couchdb/version.js');
      const result = await version.isVersion3OrHigher();
      
      expect(result).toBe(true);
    });

    it('should return true for version 4.x', async () => {
      const { couch } = await import('../../couchdb/client.js');
      vi.mocked(couch.info).mockResolvedValue({ version: '4.0.0' } as any);
      
      const version = await import('../../couchdb/version.js');
      const result = await version.isVersion3OrHigher();
      
      expect(result).toBe(true);
    });

    it('should return false for version 2.x', async () => {
      const { couch } = await import('../../couchdb/client.js');
      vi.mocked(couch.info).mockResolvedValue({ version: '2.3.1' } as any);
      
      const version = await import('../../couchdb/version.js');
      const result = await version.isVersion3OrHigher();
      
      expect(result).toBe(false);
    });

    it('should return false for version 1.x', async () => {
      const { couch } = await import('../../couchdb/client.js');
      vi.mocked(couch.info).mockResolvedValue({ version: '1.6.1' } as any);
      
      const version = await import('../../couchdb/version.js');
      const result = await version.isVersion3OrHigher();
      
      expect(result).toBe(false);
    });
  });
});

