import { Module } from '@nestjs/common';
import { MeetingTextController } from './meeting-text.controller';
import { MeetingTextService } from './meeting-text.service';
import { GeminiService } from './gemini.service';

@Module({
  controllers: [MeetingTextController],
  providers: [MeetingTextService, GeminiService],
  exports: [MeetingTextService, GeminiService],
})
export class MeetingTextModule {}
