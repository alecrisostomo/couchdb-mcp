#!/usr/bin/env node
import { CouchDBServer } from './mcp/server.js';

const server = new CouchDBServer();
server.run().catch(console.error);
