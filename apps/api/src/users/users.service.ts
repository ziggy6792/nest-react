import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { users } from "../server/db/schema";
import type { Database } from "../server/db";
import { UserDetailsDto } from "./dto/user.dto";
import { CreateUserDto } from "./dto/user.dto";
import { toUserDetailsDto } from "./user.mapper";

@Injectable()
export class UsersService {
  constructor(@Inject("DB") private readonly db: Database) {}

  async findAll(): Promise<UserDetailsDto[]> {
    const rows = await this.db.select().from(users);
    return rows.map(toUserDetailsDto);
  }

  async findOne(id: number): Promise<UserDetailsDto> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return toUserDetailsDto(result[0]);
  }

  async create(data: CreateUserDto): Promise<UserDetailsDto> {
    console.log("create", data);
    const result = await this.db
      .insert(users)
      .values({ name: data.name })
      .returning();

    return toUserDetailsDto(result[0]);
  }
}
