import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MeetingTextService } from './meeting-text.service';
import { ProcessMeetingTextDto } from './dto/process-meeting-text.dto';

@Controller('meeting-text')
export class MeetingTextController {
  constructor(private readonly meetingTextService: MeetingTextService) {}

  @Post('process')
  @HttpCode(HttpStatus.OK)
  async processMeetingText(
    @Headers('authorization') authHeader: string,
    @Body() dto: ProcessMeetingTextDto,
  ) {
    const result = await this.meetingTextService.processMeetingText(
      authHeader,
      dto,
    );

    return {
      success: true,
      message: 'Meeting text processed successfully',
      data: result,
    };
  }
}
