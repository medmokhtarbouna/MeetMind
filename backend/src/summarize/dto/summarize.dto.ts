import { IsNotEmpty, IsUUID } from 'class-validator';

export class SummarizeDto {
  @IsUUID('4', { message: 'meetingId must be a valid UUID' })
  @IsNotEmpty({ message: 'meetingId is required' })
  meetingId: string;
}
