import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TranscribeService } from './transcribe.service';
import { TranscribeDto } from './dto/transcribe.dto';

@Controller('transcribe')
export class TranscribeController {
  constructor(private readonly transcribeService: TranscribeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async transcribe(
    @Headers('authorization') authHeader: string,
    @Body() dto: TranscribeDto,
  ) {
    const result = await this.transcribeService.transcribe(authHeader, dto);
    return {
      success: true,
      message: 'Transcription completed successfully',
      data: result,
    };
  }
}
