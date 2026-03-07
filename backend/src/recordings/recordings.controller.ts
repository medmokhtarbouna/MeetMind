import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RecordingsService } from './recordings.service';
import { UploadAudioDto } from './dto/upload-audio.dto';

@Controller('recordings')
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRecording(
    @Headers('authorization') authHeader: string,
    @Body() dto: UploadAudioDto,
  ) {
    const recording = await this.recordingsService.createRecording(
      authHeader,
      dto,
    );
    return {
      success: true,
      message: 'Recording created successfully',
      data: recording,
    };
  }

  @Get('meeting/:meetingId')
  @HttpCode(HttpStatus.OK)
  async listRecordingsByMeeting(
    @Headers('authorization') authHeader: string,
    @Param('meetingId') meetingId: string,
  ) {
    const recordings = await this.recordingsService.listRecordingsByMeeting(
      authHeader,
      meetingId,
    );
    return {
      success: true,
      data: recordings,
      total: recordings.length,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getRecording(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const recording = await this.recordingsService.getRecording(authHeader, id);
    return {
      success: true,
      data: recording,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteRecording(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    await this.recordingsService.deleteRecording(authHeader, id);
    return {
      success: true,
      message: 'Recording deleted successfully',
    };
  }
}
