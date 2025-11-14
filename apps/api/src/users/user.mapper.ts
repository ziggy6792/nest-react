import { UserRow } from "../server/db/schema";
import { UserDetailsDto } from "./dto/user.dto";

export function toUserDetailsDto(row: UserRow): UserDetailsDto {
  return { ...row, foo: "bar" } as UserDetailsDto;
}
