import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Length,
  IsIn,
} from 'class-validator';

const SUPPORTED_LANGUAGES = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh', 'ar',
  'hi', 'tr', 'vi', 'th', 'id', 'ms', 'fil', 'uk', 'cs', 'sk', 'ro', 'hu', 'el',
  'he', 'da', 'fi', 'no', 'sv', 'bg', 'hr', 'sr', 'sl', 'et', 'lv', 'lt',
];

export class TranscribeDto {
  @IsUUID('4', { message: 'recordingId must be a valid UUID' })
  @IsNotEmpty({ message: 'recordingId is required' })
  recordingId: string;

  @IsOptional()
  @IsString()
  @Length(2, 5, { message: 'language must be a valid ISO 639-1 code' })
  @IsIn(SUPPORTED_LANGUAGES, {
    message: `language must be one of: ${SUPPORTED_LANGUAGES.slice(0, 10).join(', ')}...`,
  })
  language?: string = 'en';
}
