import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from "@nestjs/common";
import { UsersService } from "./users.service";

class CreateUserDto {
  name: string;
}

@Controller("users")
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get("list")
  async list() {
    return this.svc.findAll();
  }

  @Get(":id")
  async byId(@Param("id", ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Post()
  async add(@Body() body: CreateUserDto) {
    // Nest will return 201 by default for POST
    return this.svc.create({ name: body.name });
  }
}
