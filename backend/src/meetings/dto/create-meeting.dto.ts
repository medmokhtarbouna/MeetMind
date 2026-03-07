import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsDateString,
  IsArray,
  IsUUID,
} from 'class-validator';


export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, { message: 'Title must be 255 characters or less' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must be 2000 characters or less' })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'scheduledAt must be a valid ISO date string' })
  scheduledAt?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each participant ID must be a valid UUID' })
  participantUserIds?: string[];
}
