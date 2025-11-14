import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, MinLength } from "class-validator";
import { UserRow } from "../../server/db/schema";
import { createPartialDTO } from "src/utils/create-partial-dto";
import { Expose } from "class-transformer";

export class UserBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  id: UserRow["id"];

  @ApiProperty({ example: "John Doe" })
  @IsString()
  @MinLength(1)
  name: UserRow["name"];

  @ApiProperty({ type: String, format: "date-time" })
  createdAt: UserRow["createdAt"];

  @ApiProperty({ type: String, format: "date-time" })
  updatedAt: UserRow["updatedAt"];
}

export class UserDetailsDto extends createPartialDTO(UserBaseDto, [
  "id",
  "name",
  "createdAt",
  "updatedAt",
] as const) {}

export class CreateUserDto extends createPartialDTO(UserBaseDto, [
  "name",
] as const) {}
