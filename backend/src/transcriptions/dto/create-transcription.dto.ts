import { IsString, IsUUID, IsOptional, MinLength } from 'class-validator';

export class CreateTranscriptionDto {
  @IsUUID('4')
  recordingId: string;

  @IsString()
  @MinLength(1)
  text: string;

  @IsOptional()
  @IsString()
  language?: string;
}
