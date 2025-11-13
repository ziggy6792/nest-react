import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User } from '../contracts/users.contract.js';
import { eq } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { users } from '../server/db/schema.js';

type UserType = typeof User.infer;
type Database = LibSQLDatabase<typeof import('../server/db/schema.js')>;

@Injectable()
export class UsersService {
  constructor(@Inject('DB') private readonly db: Database) {}

  async findAll(): Promise<UserType[]> {
    return await this.db.select().from(users);
  }

  async findOne(id: string): Promise<UserType> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, Number(id)))
      .limit(1);
    
    if (result.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    
    return result[0]!;
  }

  async create(createUser: { name: string }): Promise<UserType> {
    const result = await this.db
      .insert(users)
      .values({ name: createUser.name })
      .returning();
    
    return result[0]!;
  }
}

