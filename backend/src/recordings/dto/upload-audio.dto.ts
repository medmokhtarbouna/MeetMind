import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsPositive,
  Matches,
} from 'class-validator';

export class UploadAudioDto {
  @IsUUID('4', { message: 'meetingId must be a valid UUID' })
  @IsNotEmpty({ message: 'meetingId is required' })
  meetingId: string;

  @IsString()
  @IsNotEmpty({ message: 'fileName is required' })
  fileName: string;

  @IsOptional()
  @IsString()
  @Matches(/^(audio|video)\//, {
    message: 'mimeType must be an audio or video MIME type',
  })
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'durationSeconds must be a positive number' })
  durationSeconds?: number;

  @IsOptional()
  @IsString()
  storagePath?: string;
}
