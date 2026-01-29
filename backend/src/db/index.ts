import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { env } from '../config/env';
import * as schema from './schema/users.table';

const sql = neon<boolean, boolean>(env.DATABASE_URL);

export const db = drizzle(sql, { schema });

export type Database = typeof db;
