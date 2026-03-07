import { IsString, IsUUID, IsOptional, MinLength } from 'class-validator';

export class ProcessMeetingTextDto {
  @IsUUID('4')
  meetingId: string;

  @IsString()
  @MinLength(50, { message: 'Meeting text must be at least 50 characters' })
  text: string;

  @IsOptional()
  @IsString()
  language?: string;
}
