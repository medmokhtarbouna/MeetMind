import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TranscriptionsService } from './transcriptions.service';
import { CreateTranscriptionDto } from './dto/create-transcription.dto';
import { UpdateTranscriptionDto } from './dto/update-transcription.dto';

@Controller('transcriptions')
export class TranscriptionsController {
  constructor(private readonly transcriptionsService: TranscriptionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTranscription(
    @Headers('authorization') authHeader: string,
    @Body() dto: CreateTranscriptionDto,
  ) {
    const transcription = await this.transcriptionsService.createTranscription(
      authHeader,
      dto,
    );
    return {
      success: true,
      message: 'Transcription created successfully',
      data: transcription,
    };
  }

  @Get('recording/:recordingId')
  @HttpCode(HttpStatus.OK)
  async getTranscriptionByRecording(
    @Headers('authorization') authHeader: string,
    @Param('recordingId') recordingId: string,
  ) {
    const transcription =
      await this.transcriptionsService.getTranscriptionByRecording(
        authHeader,
        recordingId,
      );
    return {
      success: true,
      data: transcription,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTranscription(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const transcription = await this.transcriptionsService.getTranscription(
      authHeader,
      id,
    );
    return {
      success: true,
      data: transcription,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateTranscription(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() dto: UpdateTranscriptionDto,
  ) {
    const transcription = await this.transcriptionsService.updateTranscription(
      authHeader,
      id,
      dto,
    );
    return {
      success: true,
      message: 'Transcription updated successfully',
      data: transcription,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteTranscription(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    await this.transcriptionsService.deleteTranscription(authHeader, id);
    return {
      success: true,
      message: 'Transcription deleted successfully',
    };
  }
}
