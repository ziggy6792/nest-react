import { UserRow } from '../server/db/schema';
import { UserDetailsDto } from './dto/user.dto';
import { mapDto } from 'src/utils/map-dto';

export function toUserDetailsDto(row: UserRow) {
  // You can do whatever mapping you want here
  return mapDto(UserDetailsDto, {
    ...row,
    capitalizedName: `${row.firstName.toUpperCase()} ${row.lastName.toUpperCase()}`,
    // this property will be stripped by the mapper
    additionalProperty: 'additional value',
  });
}

// Example this would throw 422 error due to validation errors
// export function toUserDetailsDto(row: UserRow) {
//   return mapDto(UserDetailsDto, { ...row, name: '', capitalizedName: '' });
// }
