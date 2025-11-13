import { Injectable } from '@nestjs/common';
import { User } from '../contracts/users.contract.js';
import type { z } from 'zod';

type UserType = z.infer<typeof User>;

@Injectable()
export class UsersService {
  private readonly _users: UserType[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ];

  findAll(): UserType[] {
    return this._users;
  }

  findOne(id: string): UserType {
    const user = this._users.find((u) => u.id === Number(id));
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  create(createUser: { name: string }): UserType {
    const newUser: UserType = {
      id: Math.max(...this._users.map((u) => u.id)) + 1,
      name: createUser.name,
    };
    this._users.push(newUser);
    return newUser;
  }
}

