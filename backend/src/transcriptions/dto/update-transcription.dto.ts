import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateTranscriptionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  text?: string;

  @IsOptional()
  @IsString()
  language?: string;
}
