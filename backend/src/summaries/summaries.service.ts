import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { UpdateSummaryDto } from './dto/update-summary.dto';

export interface SummaryResponse {
  id: string;
  meetingId: string;
  summary: string | null;
  actionItems: any[];
  decisions: string[];
  keyPoints: string[];
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class SummariesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createSummary(
    authHeader: string,
    dto: CreateSummaryDto,
  ): Promise<SummaryResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(dto.meetingId)) {
      throw new BadRequestException('Invalid meeting ID format');
    }

    // Verify meeting exists
    const { data: meeting } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', dto.meetingId)
      .single();

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const { data: summary, error } = await supabase
      .from('ai_summaries')
      .insert({
        meeting_id: dto.meetingId,
        summary: dto.summary || null,
        action_items: dto.actionItems || [],
        decisions: dto.decisions || [],
        key_points: dto.keyPoints || [],
        keywords: dto.keywords || [],
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to create summary: ${error.message}`,
      );
    }

    return this.mapSummaryResponse(summary);
  }

  async getSummaryByMeeting(
    authHeader: string,
    meetingId: string,
  ): Promise<SummaryResponse | null> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(meetingId)) {
      throw new BadRequestException('Invalid meeting ID format');
    }

    const { data: summary, error } = await supabase
      .from('ai_summaries')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch summary: ${error.message}`,
      );
    }

    return summary ? this.mapSummaryResponse(summary) : null;
  }

  async getSummary(
    authHeader: string,
    summaryId: string,
  ): Promise<SummaryResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(summaryId)) {
      throw new BadRequestException('Invalid summary ID format');
    }

    const { data: summary, error } = await supabase
      .from('ai_summaries')
      .select('*')
      .eq('id', summaryId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Summary not found');
      }
      throw new InternalServerErrorException(
        `Failed to fetch summary: ${error.message}`,
      );
    }

    return this.mapSummaryResponse(summary);
  }

  async updateSummary(
    authHeader: string,
    summaryId: string,
    dto: UpdateSummaryDto,
  ): Promise<SummaryResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(summaryId)) {
      throw new BadRequestException('Invalid summary ID format');
    }

    const updates: Record<string, any> = {};
    if (dto.summary !== undefined) updates.summary = dto.summary;
    if (dto.actionItems !== undefined) updates.action_items = dto.actionItems;
    if (dto.decisions !== undefined) updates.decisions = dto.decisions;
    if (dto.keyPoints !== undefined) updates.key_points = dto.keyPoints;
    if (dto.keywords !== undefined) updates.keywords = dto.keywords;

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    const { data: summary, error } = await supabase
      .from('ai_summaries')
      .update(updates)
      .eq('id', summaryId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Summary not found');
      }
      throw new InternalServerErrorException(
        `Failed to update summary: ${error.message}`,
      );
    }

    return this.mapSummaryResponse(summary);
  }

  async deleteSummary(authHeader: string, summaryId: string): Promise<void> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(summaryId)) {
      throw new BadRequestException('Invalid summary ID format');
    }

    const { error } = await supabase
      .from('ai_summaries')
      .delete()
      .eq('id', summaryId);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Summary not found');
      }
      throw new InternalServerErrorException(
        `Failed to delete summary: ${error.message}`,
      );
    }
  }

  private mapSummaryResponse(summary: any): SummaryResponse {
    return {
      id: summary.id,
      meetingId: summary.meeting_id,
      summary: summary.summary,
      actionItems: this.parseJsonArray(summary.action_items),
      decisions: this.parseJsonArray(summary.decisions),
      keyPoints: this.parseJsonArray(summary.key_points),
      keywords: this.parseJsonArray(summary.keywords),
      createdAt: summary.created_at,
      updatedAt: summary.updated_at,
    };
  }

  private parseJsonArray<T>(value: any): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
