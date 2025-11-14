import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MinLength } from 'class-validator';
import { createPartialDTO } from '../../utils/create-partial-dto';
import { Expose } from 'class-transformer';

export class UserBaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Expose()
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(1)
  @Expose()
  name: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;
}

export class UserDetailsDto extends createPartialDTO(UserBaseDto, [
  'id',
  'name',
  'createdAt',
  'updatedAt',
] as const) {}

export class CreateUserDto extends createPartialDTO(UserBaseDto, [
  'name',
] as const) {}
