import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { TranscribeDto } from './dto/transcribe.dto';

export interface TranscribeResponse {
  success: boolean;
  recordingId: string;
  transcriptionId: string;
  meetingId: string;
  language: string;
  text: string;
}

@Injectable()
export class TranscribeService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async transcribe(
    authHeader: string,
    dto: TranscribeDto,
  ): Promise<TranscribeResponse> {
    await this.supabaseService.verifyUser(authHeader);

    const token = this.extractToken(authHeader);
    const supabaseUrl = this.supabaseService.getSupabaseUrl();
    const anonKey = this.supabaseService.getAnonKey();

    const response = await fetch(`${supabaseUrl}/functions/v1/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: anonKey,
      },
      body: JSON.stringify({
        recording_id: dto.recordingId,
        language: dto.language || 'en',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new BadRequestException(
          'Authentication failed. Please sign in again.',
        );
      }

      if (response.status === 404) {
        throw new BadRequestException(
          'Recording not found or access denied.',
        );
      }

      if (response.status === 429) {
        throw new ServiceUnavailableException(
          'OpenAI API quota exceeded. Please try again later.',
        );
      }

      throw new InternalServerErrorException(
        errorData.error || 'Transcription failed. Please try again.',
      );
    }

    const result = await response.json();

    return {
      success: true,
      recordingId: result.recording_id,
      transcriptionId: result.transcription_id,
      meetingId: result.meeting_id,
      language: result.language,
      text: result.text,
    };
  }

  private extractToken(authHeader: string): string {
    if (!authHeader) {
      throw new BadRequestException('Missing Authorization header');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      throw new BadRequestException(
        'Invalid Authorization header format. Expected: Bearer <token>',
      );
    }

    return parts[1];
  }
}
