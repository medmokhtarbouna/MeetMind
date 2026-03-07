import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

export interface MeetingResponse {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantResponse {
  id: string;
  meetingId: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
}

export interface MeetingIntelligenceResponse {
  meetingId: string;
  title: string;
  description: string | null;
  scheduledAt: string | null;
  createdAt: string;
  owner: {
    id: string;
    email: string;
    fullName: string | null;
  };
  participants: Array<{
    userId: string;
    email: string;
    fullName: string | null;
    role: string;
  }>;
  recordings: Array<{
    recordingId: string;
    fileName: string | null;
    mimeType: string | null;
    durationSeconds: number | null;
    createdAt: string;
  }>;
  transcript: string | null;
  summary: string | null;
  actionItems: Array<{
    title: string;
    owner: string | null;
    deadline: string | null;
  }>;
  decisions: string[];
  keyPoints: string[];
  keywords: string[];
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    assignedTo: string | null;
    deadline: string | null;
  }>;
}

@Injectable()
export class MeetingsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createMeeting(
    authHeader: string,
    dto: CreateMeetingDto,
  ): Promise<MeetingResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    const user = await this.supabaseService.verifyUser(authHeader);

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        owner_id: user.id,
        title: dto.title,
        description: dto.description || null,
        scheduled_at: dto.scheduledAt || null,
      })
      .select()
      .single();

    if (meetingError) {
      throw new InternalServerErrorException(
        `Failed to create meeting: ${meetingError.message}`,
      );
    }

    // Add participants if provided
    if (dto.participantUserIds && dto.participantUserIds.length > 0) {
      const participants = dto.participantUserIds.map((userId) => ({
        meeting_id: meeting.id,
        user_id: userId,
        role: 'viewer',
      }));

      await supabase.from('meeting_participants').insert(participants);
    }

    return this.mapMeetingResponse(meeting);
  }

  async listMeetings(authHeader: string): Promise<MeetingResponse[]> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch meetings: ${error.message}`,
      );
    }

    return (meetings || []).map(this.mapMeetingResponse);
  }

  async updateMeeting(
    authHeader: string,
    meetingId: string,
    dto: UpdateMeetingDto,
  ): Promise<MeetingResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(meetingId)) {
      throw new BadRequestException('Invalid meeting ID format');
    }

    const updates: Record<string, any> = {};
    if (dto.title !== undefined) updates.title = dto.title;
    if (dto.description !== undefined) updates.description = dto.description;
    if (dto.scheduledAt !== undefined) updates.scheduled_at = dto.scheduledAt;

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    const { data: meeting, error } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', meetingId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Meeting not found');
      }
      throw new InternalServerErrorException(
        `Failed to update meeting: ${error.message}`,
      );
    }

    return this.mapMeetingResponse(meeting);
  }

  async deleteMeeting(authHeader: string, meetingId: string): Promise<void> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(meetingId)) {
      throw new BadRequestException('Invalid meeting ID format');
    }

    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', meetingId);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Meeting not found');
      }
      throw new InternalServerErrorException(
        `Failed to delete meeting: ${error.message}`,
      );
    }
  }

  async addParticipant(
    authHeader: string,
    meetingId: string,
    dto: AddParticipantDto,
  ): Promise<ParticipantResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(meetingId)) {
      throw new BadRequestException('Invalid meeting ID format');
    }

    const { data: meeting } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', meetingId)
      .single();

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const { data: participant, error } = await supabase
      .from('meeting_participants')
      .insert({
        meeting_id: meetingId,
        user_id: dto.userId,
        role: dto.role || 'viewer',
      })
      .select('*, profile:users(*)')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException('User is already a participant');
      }
      throw new InternalServerErrorException(
        `Failed to add participant: ${error.message}`,
      );
    }

    return this.mapParticipantResponse(participant);
  }

  async removeParticipant(
    authHeader: string,
    meetingId: string,
    userId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(meetingId) || !this.isValidUUID(userId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { error } = await supabase
      .from('meeting_participants')
      .delete()
      .eq('meeting_id', meetingId)
      .eq('user_id', userId);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to remove participant: ${error.message}`,
      );
    }
  }

  async updateParticipantRole(
    authHeader: string,
    meetingId: string,
    userId: string,
    dto: UpdateParticipantDto,
  ): Promise<ParticipantResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(meetingId) || !this.isValidUUID(userId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { data: participant, error } = await supabase
      .from('meeting_participants')
      .update({ role: dto.role })
      .eq('meeting_id', meetingId)
      .eq('user_id', userId)
      .select('*, profile:users(*)')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Participant not found');
      }
      throw new InternalServerErrorException(
        `Failed to update participant: ${error.message}`,
      );
    }

    return this.mapParticipantResponse(participant);
  }

  async getMeetingIntelligence(
    authHeader: string,
    meetingId: string,
  ): Promise<MeetingIntelligenceResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(meetingId)) {
      throw new BadRequestException('Invalid meeting ID format');
    }

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      if (meetingError?.code === 'PGRST116') {
        throw new NotFoundException('Meeting not found');
      }
      throw new InternalServerErrorException(
        `Failed to fetch meeting: ${meetingError?.message}`,
      );
    }

    const { data: owner } = await supabase
      .from('users')
      .select('*')
      .eq('id', meeting.owner_id)
      .single();

    const { data: participants } = await supabase
      .from('meeting_participants')
      .select('*, profile:users(*)')
      .eq('meeting_id', meetingId);

    const { data: recordings } = await supabase
      .from('recordings')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false });

    const transcripts: string[] = [];
    if (recordings && recordings.length > 0) {
      for (const recording of recordings) {
        const { data: transcriptRows } = await supabase
          .from('transcriptions')
          .select('text')
          .eq('recording_id', recording.id)
          .order('created_at', { ascending: false });

        if (transcriptRows) {
          transcripts.push(...transcriptRows.map((t: any) => t.text));
        }
      }
    }

    const { data: summary } = await supabase
      .from('ai_summaries')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false });

    return {
      meetingId: meeting.id,
      title: meeting.title,
      description: meeting.description,
      scheduledAt: meeting.scheduled_at,
      createdAt: meeting.created_at,
      owner: {
        id: owner?.id || meeting.owner_id,
        email: owner?.email || '',
        fullName: owner?.full_name || null,
      },
      participants: (participants || []).map((p: any) => ({
        userId: p.user_id,
        email: p.profile?.email || '',
        fullName: p.profile?.full_name || null,
        role: p.role,
      })),
      recordings: (recordings || []).map((r: any) => ({
        recordingId: r.id,
        fileName: r.file_name,
        mimeType: r.mime_type,
        durationSeconds: r.duration_seconds,
        createdAt: r.created_at,
      })),
      transcript: transcripts.length > 0 ? transcripts.join('\n\n---\n\n') : null,
      summary: summary?.summary || null,
      actionItems: this.parseJsonArray(summary?.action_items),
      decisions: this.parseJsonArray(summary?.decisions),
      keyPoints: this.parseJsonArray(summary?.key_points),
      keywords: this.parseJsonArray(summary?.keywords),
      tasks: (tasks || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        assignedTo: t.assigned_to,
        deadline: t.deadline,
      })),
    };
  }

  private mapMeetingResponse(meeting: any): MeetingResponse {
    return {
      id: meeting.id,
      ownerId: meeting.owner_id,
      title: meeting.title,
      description: meeting.description,
      scheduledAt: meeting.scheduled_at,
      createdAt: meeting.created_at,
      updatedAt: meeting.updated_at,
    };
  }

  private mapParticipantResponse(participant: any): ParticipantResponse {
    return {
      id: participant.id,
      meetingId: participant.meeting_id,
      userId: participant.user_id,
      role: participant.role,
      createdAt: participant.created_at,
      user: participant.profile
        ? {
            id: participant.profile.id,
            email: participant.profile.email,
            fullName: participant.profile.full_name,
          }
        : null,
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
