import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto, UserDetailsDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get('list')
  async list(): Promise<UserDetailsDto[]> {
    return this.svc.findAll();
  }

  @Get(':id')
  async byId(@Param('id', ParseIntPipe) id: number): Promise<UserDetailsDto> {
    return this.svc.findOne(id);
  }

  @Post('create')
  async add(@Body() body: CreateUserDto): Promise<UserDetailsDto> {
    return this.svc.create(body);
  }
}
