import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SummarizeDto } from './dto/summarize.dto';

export interface SummarizeResponse {
  success: boolean;
  meetingId: string;
  summaryId: string;
  summary: string;
  actionItems: Array<{
    title: string;
    owner: string | null;
    deadline: string | null;
  }>;
  decisions: string[];
  keyPoints: string[];
  keywords: string[];
  tasks: Array<{
    title: string;
    status: 'todo' | 'doing' | 'done';
  }>;
}

@Injectable()
export class SummarizeService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async summarize(
    authHeader: string,
    dto: SummarizeDto,
  ): Promise<SummarizeResponse> {
    await this.supabaseService.verifyUser(authHeader);

    const token = this.extractToken(authHeader);
    const supabaseUrl = this.supabaseService.getSupabaseUrl();
    const anonKey = this.supabaseService.getAnonKey();

    const response = await fetch(`${supabaseUrl}/functions/v1/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: anonKey,
      },
      body: JSON.stringify({
        meeting_id: dto.meetingId,
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
          'Meeting not found or access denied.',
        );
      }

      if (response.status === 400 && errorData.error?.includes('No transcripts')) {
        throw new BadRequestException(
          'No transcripts found for this meeting. Please transcribe recordings first.',
        );
      }

      if (response.status === 429) {
        throw new ServiceUnavailableException(
          'OpenAI API quota exceeded. Please try again later.',
        );
      }

      throw new InternalServerErrorException(
        errorData.error || 'Summarization failed. Please try again.',
      );
    }

    const result = await response.json();

    return {
      success: true,
      meetingId: result.meeting_id,
      summaryId: result.ai_summary_id,
      summary: result.data.summary,
      actionItems: result.data.action_items || [],
      decisions: result.data.decisions || [],
      keyPoints: result.data.key_points || [],
      keywords: result.data.keywords || [],
      tasks: result.data.tasks || [],
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
