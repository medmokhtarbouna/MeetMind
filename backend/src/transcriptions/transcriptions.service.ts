import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTranscriptionDto } from './dto/create-transcription.dto';
import { UpdateTranscriptionDto } from './dto/update-transcription.dto';


export interface TranscriptionResponse {
  id: string;
  recordingId: string;
  text: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class TranscriptionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createTranscription(
    authHeader: string,
    dto: CreateTranscriptionDto,
  ): Promise<TranscriptionResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(dto.recordingId)) {
      throw new BadRequestException('Invalid recording ID format');
    }

    const { data: recording } = await supabase
      .from('recordings')
      .select('id')
      .eq('id', dto.recordingId)
      .single();

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    const { data: transcription, error } = await supabase
      .from('transcriptions')
      .insert({
        recording_id: dto.recordingId,
        text: dto.text,
        language: dto.language || 'en',
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to create transcription: ${error.message}`,
      );
    }

    return this.mapTranscriptionResponse(transcription);
  }

  async getTranscriptionByRecording(
    authHeader: string,
    recordingId: string,
  ): Promise<TranscriptionResponse | null> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(recordingId)) {
      throw new BadRequestException('Invalid recording ID format');
    }

    const { data: transcription, error } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('recording_id', recordingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch transcription: ${error.message}`,
      );
    }

    return transcription ? this.mapTranscriptionResponse(transcription) : null;
  }

  async getTranscription(
    authHeader: string,
    transcriptionId: string,
  ): Promise<TranscriptionResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(transcriptionId)) {
      throw new BadRequestException('Invalid transcription ID format');
    }

    const { data: transcription, error } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('id', transcriptionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Transcription not found');
      }
      throw new InternalServerErrorException(
        `Failed to fetch transcription: ${error.message}`,
      );
    }

    return this.mapTranscriptionResponse(transcription);
  }

  async updateTranscription(
    authHeader: string,
    transcriptionId: string,
    dto: UpdateTranscriptionDto,
  ): Promise<TranscriptionResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(transcriptionId)) {
      throw new BadRequestException('Invalid transcription ID format');
    }

    const updates: Record<string, any> = {};
    if (dto.text !== undefined) updates.text = dto.text;
    if (dto.language !== undefined) updates.language = dto.language;

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    const { data: transcription, error } = await supabase
      .from('transcriptions')
      .update(updates)
      .eq('id', transcriptionId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Transcription not found');
      }
      throw new InternalServerErrorException(
        `Failed to update transcription: ${error.message}`,
      );
    }

    return this.mapTranscriptionResponse(transcription);
  }

  async deleteTranscription(
    authHeader: string,
    transcriptionId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(transcriptionId)) {
      throw new BadRequestException('Invalid transcription ID format');
    }

    const { error } = await supabase
      .from('transcriptions')
      .delete()
      .eq('id', transcriptionId);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Transcription not found');
      }
      throw new InternalServerErrorException(
        `Failed to delete transcription: ${error.message}`,
      );
    }
  }

  private mapTranscriptionResponse(transcription: any): TranscriptionResponse {
    return {
      id: transcription.id,
      recordingId: transcription.recording_id,
      text: transcription.text,
      language: transcription.language,
      createdAt: transcription.created_at,
      updatedAt: transcription.updated_at,
    };
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
