import { UserRow } from "../server/db/schema";
import { UserDetailsDto } from "./dto/user.dto";
import { plainToInstance } from "class-transformer";

export function toUserDetailsDto(row: UserRow): UserDetailsDto {
  return plainToInstance(UserDetailsDto, { ...row, foo: "bar" });
}
