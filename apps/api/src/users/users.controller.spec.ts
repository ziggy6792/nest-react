import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, UserDetailsDto } from './dto/user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return an array of users', async () => {
      const mockUsers: UserDetailsDto[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          capitalizedName: 'JOHN DOE',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          capitalizedName: 'JANE SMITH',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith();
    });

    it('should return an empty array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('byId', () => {
    it('should return a user by id', async () => {
      const mockUser: UserDetailsDto = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        capitalizedName: 'JOHN DOE',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = 999;
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException(`User with id ${userId} not found`),
      );

      await expect(controller.findOne(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('add', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
      };
      const mockCreatedUser: UserDetailsDto = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        capitalizedName: 'JOHN DOE',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockUsersService.create.mockResolvedValue(mockCreatedUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockCreatedUser);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should create a user with different name', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const mockCreatedUser: UserDetailsDto = {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        capitalizedName: 'JANE SMITH',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      };

      mockUsersService.create.mockResolvedValue(mockCreatedUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockCreatedUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
