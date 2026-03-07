import { IsString, IsOptional, IsDateString, MinLength } from 'class-validator';


export class UpdateMeetingDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
