import nano, { ServerScope } from 'nano';
import * as dotenv from 'dotenv';

dotenv.config();

const couchdbUrl = process.env.COUCHDB_URL || 'http://localhost:5984';
export const couch: ServerScope = nano(couchdbUrl);


