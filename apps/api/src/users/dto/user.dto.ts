import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsInt, IsString, MinLength } from 'class-validator';
import { UserRow } from '../../server/db/schema';
import { Expose } from 'class-transformer';

// Base class for all user DTOs
// This class is not exported, it is only used to create other DTOs
class UserBaseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  @IsInt()
  id: UserRow['id'];

  @Expose()
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(1)
  name: UserRow['name'];

  @Expose()
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: UserRow['createdAt'];

  @Expose()
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: UserRow['updatedAt'];
}

export class UserDetailsDto extends UserBaseDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(1)
  @Expose()
  capitalizedName: string;
}

export class CreateUserDto extends PickType(UserBaseDto, ['name'] as const) {}
