import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, InferInsertModel } from 'drizzle-orm';
import { users } from '../server/db/schema';
import type { Database } from '../server/db';

type NewUser = InferInsertModel<typeof users>;

@Injectable()
export class UsersService {
  constructor(@Inject('DB') private readonly db: Database) {}

  async findAll() {
    return await this.db.select().from(users);
  }

  async findOne(id: string) {
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

  async create(createUser: NewUser) {
    
    const result = await this.db
      .insert(users)
      .values(createUser)
      .returning();
    
    return result[0]!;
  }
}

