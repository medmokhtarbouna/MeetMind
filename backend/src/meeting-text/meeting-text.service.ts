import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService, MeetingIntelligenceOutput } from './gemini.service';
import { ProcessMeetingTextDto } from './dto/process-meeting-text.dto';

export interface ProcessMeetingTextResponse {
  success: boolean;
  meetingId: string;
  summaryId: string;
  intelligence: MeetingIntelligenceOutput;
  tasksCreated: number;
}
@Injectable()
export class MeetingTextService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly geminiService: GeminiService,
  ) {}

  async processMeetingText(
    authHeader: string,
    dto: ProcessMeetingTextDto,
  ): Promise<ProcessMeetingTextResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    const user = await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(dto.meetingId)) {
      throw new BadRequestException('Invalid meeting ID format');
    }

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, owner_id')
      .eq('id', dto.meetingId)
      .single();

    if (meetingError || !meeting) {
      throw new NotFoundException('Meeting not found or access denied');
    }

    console.log(`Processing meeting text for meeting: ${meeting.id}`);
    const intelligence = await this.geminiService.generateMeetingIntelligence(
      meeting.title,
      dto.text,
      dto.language || 'en',
    );

    const summaryId = await this.saveSummary(
      supabase,
      dto.meetingId,
      intelligence,
    );

    const tasksCreated = await this.createTasks(
      supabase,
      dto.meetingId,
      meeting.owner_id,
      intelligence.tasks,
    );

    await this.saveTextAsTranscription(supabase, dto.meetingId, dto.text, dto.language);

    return {
      success: true,
      meetingId: dto.meetingId,
      summaryId,
      intelligence,
      tasksCreated,
    };
  }

  private async saveSummary(
    supabase: any,
    meetingId: string,
    intelligence: MeetingIntelligenceOutput,
  ): Promise<string> {
    const { data: existing } = await supabase
      .from('ai_summaries')
      .select('id')
      .eq('meeting_id', meetingId)
      .maybeSingle();

    const summaryPayload = {
      meeting_id: meetingId,
      summary: intelligence.summary,
      action_items: intelligence.actionItems,
      decisions: intelligence.decisions,
      key_points: intelligence.keyPoints,
      keywords: intelligence.keywords,
    };

    if (existing?.id) {
      const { data, error } = await supabase
        .from('ai_summaries')
        .update(summaryPayload)
        .eq('id', existing.id)
        .select('id')
        .single();

      if (error) {
        throw new InternalServerErrorException(
          `Failed to update summary: ${error.message}`,
        );
      }
      return data.id;
    } else {
      const { data, error } = await supabase
        .from('ai_summaries')
        .insert(summaryPayload)
        .select('id')
        .single();

      if (error) {
        throw new InternalServerErrorException(
          `Failed to save summary: ${error.message}`,
        );
      }
      return data.id;
    }
  }

  private async createTasks(
    supabase: any,
    meetingId: string,
    ownerId: string,
    tasks: Array<{ title: string; status: 'todo' | 'doing' | 'done' }>,
  ): Promise<number> {
    if (!tasks || tasks.length === 0) {
      return 0;
    }

    await supabase.from('tasks').delete().eq('meeting_id', meetingId);

    const tasksToInsert = tasks
      .filter((t) => t.title?.trim())
      .map((t) => ({
        meeting_id: meetingId,
        title: t.title.trim(),
        assigned_to: ownerId,
        status: t.status || 'todo',
      }));

    if (tasksToInsert.length > 0) {
      const { error } = await supabase.from('tasks').insert(tasksToInsert);

      if (error) {
        console.error('Failed to create tasks:', error);
      }
    }

    return tasksToInsert.length;
  }

  private async saveTextAsTranscription(
    supabase: any,
    meetingId: string,
    text: string,
    language: string = 'en',
  ): Promise<void> {
    try {
      const { data: existingRecording } = await supabase
        .from('recordings')
        .select('id')
        .eq('meeting_id', meetingId)
        .eq('file_name', 'manual-text-input')
        .maybeSingle();

      let recordingId: string;

      if (existingRecording?.id) {
        recordingId = existingRecording.id;
      } else {
        const { data: recording, error: recordingError } = await supabase
          .from('recordings')
          .insert({
            meeting_id: meetingId,
            storage_path: `text-input/${meetingId}/manual-input.txt`,
            file_name: 'manual-text-input',
            mime_type: 'text/plain',
          })
          .select('id')
          .single();

        if (recordingError) {
          console.error('Failed to create recording placeholder:', recordingError);
          return;
        }
        recordingId = recording.id;
      }

      const { data: existingTranscription } = await supabase
        .from('transcriptions')
        .select('id')
        .eq('recording_id', recordingId)
        .maybeSingle();

      if (existingTranscription?.id) {
        await supabase
          .from('transcriptions')
          .update({ text, language })
          .eq('id', existingTranscription.id);
      } else {
        await supabase.from('transcriptions').insert({
          recording_id: recordingId,
          text,
          language,
        });
      }
    } catch (error) {
      console.error('Failed to save text as transcription:', error);
    }
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
