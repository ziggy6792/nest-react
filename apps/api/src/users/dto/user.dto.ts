import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsInt, IsString, MinLength } from "class-validator";
import { UserRow } from "../../server/db/schema";

export class UserBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: UserRow["id"];

  @ApiProperty({ example: "John Doe" })
  @IsString()
  @MinLength(1)
  name: UserRow["name"];

  @ApiProperty({ type: String, format: "date-time" })
  createdAt: Date;

  @ApiProperty({ type: String, format: "date-time" })
  updatedAt: Date;
}

export class UserDetailsDto extends PickType(UserBaseDto, [
  "id",
  "name",
  "createdAt",
  "updatedAt",
] as const) {}

export class CreateUserDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  @MinLength(1)
  name: string;
}
