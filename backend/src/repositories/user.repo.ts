import { eq, ilike, or } from 'drizzle-orm';
import { db } from '../db';
import { users, NewUser, User } from '../db/schema/users.table';

export class UserRepository {
    async findById(id: string): Promise<User | undefined> {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return result[0];
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0];
    }

    async findByPhone(phone: string): Promise<User | undefined> {
        const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
        return result[0];
    }

    async create(data: NewUser): Promise<User> {
        const [user] = await db.insert(users).values(data).returning();
        return user;
    }

    async update(id: string, data: Partial<NewUser>): Promise<User | undefined> {
        const [updated] = await db
            .update(users)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return updated;
    }

    async search(query: string, limit: number = 20): Promise<User[]> {
        return db
            .select()
            .from(users)
            .where(
                or(
                    ilike(users.displayName, `%${query}%`),
                    ilike(users.email, `%${query}%`),
                    ilike(users.phone, `%${query}%`)
                )
            )
            .limit(limit);
    }

    async delete(id: string): Promise<void> {
        await db.delete(users).where(eq(users.id, id));
    }
}
