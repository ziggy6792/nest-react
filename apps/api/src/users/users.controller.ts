import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from "@nestjs/common";
import { ApiTags, ApiOkResponse, ApiCreatedResponse } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto, UserDetailsDto } from "./dto/user.dto";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get("list")
  @ApiOkResponse({ type: [UserDetailsDto] })
  async list(): Promise<UserDetailsDto[]> {
    return this.svc.findAll();
  }

  @Get(":id")
  @ApiOkResponse({ type: UserDetailsDto })
  async byId(@Param("id", ParseIntPipe) id: number): Promise<UserDetailsDto> {
    return this.svc.findOne(id);
  }

  @Post("create")
  @ApiCreatedResponse({ type: CreateUserDto })
  async add(@Body() body: CreateUserDto): Promise<UserDetailsDto> {
    console.log("add!!!!!", body);
    return this.svc.create(body);
  }
}
