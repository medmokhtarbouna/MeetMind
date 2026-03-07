import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UploadAudioDto } from './dto/upload-audio.dto';

export interface RecordingResponse {
  id: string;
  meetingId: string;
  uploaderId: string;
  storagePath: string;
  fileName: string | null;
  mimeType: string | null;
  durationSeconds: number | null;
  createdAt: string;
}

@Injectable()
export class RecordingsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createRecording(
    authHeader: string,
    dto: UploadAudioDto,
  ): Promise<RecordingResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    const user = await this.supabaseService.verifyUser(authHeader);

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', dto.meetingId)
      .single();

    if (meetingError || !meeting) {
      throw new NotFoundException('Meeting not found or access denied');
    }

    const recordingId = this.generateUUID();
    const storagePath =
      dto.storagePath ||
      `${user.id}/${dto.meetingId}/${recordingId}-${dto.fileName}`;

    const { data: recording, error: insertError } = await supabase
      .from('recordings')
      .insert({
        id: recordingId,
        meeting_id: dto.meetingId,
        uploader_id: user.id,
        storage_path: storagePath,
        file_name: dto.fileName,
        mime_type: dto.mimeType || null,
        duration_seconds: dto.durationSeconds || null,
      })
      .select()
      .single();

    if (insertError) {
      throw new InternalServerErrorException(
        `Failed to create recording: ${insertError.message}`,
      );
    }

    return this.mapRecordingResponse(recording);
  }

  async listRecordingsByMeeting(
    authHeader: string,
    meetingId: string,
  ): Promise<RecordingResponse[]> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(meetingId)) {
      throw new BadRequestException('Invalid meeting ID format');
    }

    const { data: recordings, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch recordings: ${error.message}`,
      );
    }

    return (recordings || []).map(this.mapRecordingResponse);
  }

  async getRecording(
    authHeader: string,
    recordingId: string,
  ): Promise<RecordingResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(recordingId)) {
      throw new BadRequestException('Invalid recording ID format');
    }

    const { data: recording, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', recordingId)
      .single();

    if (error || !recording) {
      if (error?.code === 'PGRST116') {
        throw new NotFoundException('Recording not found');
      }
      throw new InternalServerErrorException(
        `Failed to fetch recording: ${error?.message}`,
      );
    }

    return this.mapRecordingResponse(recording);
  }

  async deleteRecording(authHeader: string, recordingId: string): Promise<void> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    const { data: recording, error: fetchError } = await supabase
      .from('recordings')
      .select('storage_path')
      .eq('id', recordingId)
      .single();

    if (fetchError || !recording) {
      throw new NotFoundException('Recording not found');
    }

    if (recording.storage_path) {
      await supabase.storage
        .from('recordings')
        .remove([recording.storage_path]);
    }

    const { error: deleteError } = await supabase
      .from('recordings')
      .delete()
      .eq('id', recordingId);

    if (deleteError) {
      throw new InternalServerErrorException(
        `Failed to delete recording: ${deleteError.message}`,
      );
    }
  }

  private mapRecordingResponse(recording: any): RecordingResponse {
    return {
      id: recording.id,
      meetingId: recording.meeting_id,
      uploaderId: recording.uploader_id,
      storagePath: recording.storage_path,
      fileName: recording.file_name,
      mimeType: recording.mime_type,
      durationSeconds: recording.duration_seconds,
      createdAt: recording.created_at,
    };
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
