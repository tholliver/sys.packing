import { drizzle as localPostgreSQL } from 'drizzle-orm/node-postgres';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema'

function getDBInstance() {
    const uriDbLocal = process.argv[3] ?? import.meta.env.DATABASE_URL; // Corrected argument check
    const isProd = import.meta.env.PROD;

    if (isProd) {
        return drizzle(import.meta.env.DATABASE_URL_PROD!, { schema });
    }
    return localPostgreSQL(uriDbLocal, { schema }); // Uses local DB connection
}

export const db = getDBInstance();