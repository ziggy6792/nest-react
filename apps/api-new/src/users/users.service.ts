import { Injectable, NotFoundException } from '@nestjs/common';
import { UserDetailsDto } from './dto/user.dto';
import { CreateUserDto } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';

interface User {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  private mockUsers: User[] = [
    {
      id: 1,
      name: 'John Doe',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 2,
      name: 'Jane Smith',
      createdAt: new Date('2024-01-02T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    },
    {
      id: 3,
      name: 'Bob Johnson',
      createdAt: new Date('2024-01-03T00:00:00Z'),
      updatedAt: new Date('2024-01-03T00:00:00Z'),
    },
  ];

  private toUserDetailsDto(user: User): UserDetailsDto {
    return plainToInstance(UserDetailsDto, user);
  }

  async findAll(): Promise<UserDetailsDto[]> {
    return this.mockUsers.map((user) => this.toUserDetailsDto(user));
  }

  async findOne(id: number): Promise<UserDetailsDto> {
    const user = this.mockUsers.find((u) => u.id === id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.toUserDetailsDto(user);
  }

  async create(data: CreateUserDto): Promise<UserDetailsDto> {
    const now = new Date();
    const newUser: User = {
      id: Math.max(...this.mockUsers.map((u) => u.id), 0) + 1,
      name: data.name,
      createdAt: now,
      updatedAt: now,
    };

    this.mockUsers.push(newUser);
    return this.toUserDetailsDto(newUser);
  }
}
