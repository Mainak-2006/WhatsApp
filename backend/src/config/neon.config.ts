import { neon, neonConfig } from '@neondatabase/serverless';
import { env } from './env';

// Configure Neon for optimal performance
neonConfig.fetchConnectionCache = true;

export const sql = neon(env.DATABASE_URL);

export const neonDbConfig = {
    connectionString: env.DATABASE_URL,
    ssl: true,
};
