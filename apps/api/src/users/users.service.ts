import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, like, and, SQL } from 'drizzle-orm';
import { users } from '../server/db/schema';
import type { Database } from '../server/db';
import { UserDetailsDto, UserNameDetailsDto } from './dto/user.dto';
import { CreateUserDto, FindNamesQueryDto } from './dto/user.dto';
import { toUserDetailsDto, toUserNameDetailsDto } from './user.mapper';

@Injectable()
export class UsersService {
  constructor(@Inject('DB') private readonly db: Database) {}

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
    const result = await this.db.insert(users).values(data).returning();

    return toUserDetailsDto(result[0]);
  }

  async findNames(query: FindNamesQueryDto): Promise<UserNameDetailsDto[]> {
    const conditions: SQL[] = [];

    if (query.firstName) {
      conditions.push(like(users.firstName, `%${query.firstName}%`));
    }

    if (query.lastName) {
      conditions.push(like(users.lastName, `%${query.lastName}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db.select().from(users).where(whereClause);

    return rows.map(toUserNameDetailsDto);
  }
}
