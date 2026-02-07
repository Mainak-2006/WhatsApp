import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function cleanup() {
    console.log('Cleaning up database...');
    try {
        await db.execute(sql`DROP TABLE IF EXISTS messages CASCADE;`);
        await db.execute(sql`DROP TABLE IF EXISTS participants CASCADE;`);
        await db.execute(sql`DROP TABLE IF EXISTS presence CASCADE;`);
        await db.execute(sql`DROP TABLE IF EXISTS conversations CASCADE;`);
        await db.execute(sql`DROP TABLE IF EXISTS users CASCADE;`);
        console.log('✅ Database cleaned up successfully');
    } catch (error) {
        console.error('❌ Error cleaning up database:', error);
    }
    process.exit(0);
}

cleanup();
