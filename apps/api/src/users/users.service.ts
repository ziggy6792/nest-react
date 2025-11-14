import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { users } from "../server/db/schema";
import type { Database } from "../server/db";

type NewUser = typeof users.$inferInsert;

@Injectable()
export class UsersService {
  constructor(@Inject("DB") private readonly db: Database) {}

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

    return { ...result[0], foo: "bar" } as typeof users.$inferSelect; // example of a property that is stripped by the contract
  }

  async create(createUser: NewUser) {
    const result = await this.db.insert(users).values(createUser).returning();

    return { ...result[0] };
  }
}
