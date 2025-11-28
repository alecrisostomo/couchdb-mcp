import { couch } from './client.js';

let cachedVersion: string | null = null;

export async function getCouchDBVersion(): Promise<string> {
  if (!cachedVersion) {
    const info = await couch.info();
    cachedVersion = info.version;
  }
  return cachedVersion;
}

export async function isVersion3OrHigher(): Promise<boolean> {
  const version = await getCouchDBVersion();
  return parseInt(version.split('.')[0]) >= 3;
}


