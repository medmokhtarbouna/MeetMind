import { Module } from '@nestjs/common';
import { SupabaseModule } from './supabase/supabase.module';
import { MeetingsModule } from './meetings/meetings.module';
import { RecordingsModule } from './recordings/recordings.module';
import { TasksModule } from './tasks/tasks.module';
import { SummariesModule } from './summaries/summaries.module';
import { TranscriptionsModule } from './transcriptions/transcriptions.module';
import { TranscribeModule } from './transcribe/transcribe.module';
import { SummarizeModule } from './summarize/summarize.module';
import { MeetingTextModule } from './meeting-text/meeting-text.module';

@Module({
  imports: [
    SupabaseModule,
    MeetingsModule,
    RecordingsModule,
    TasksModule,
    SummariesModule,
    TranscriptionsModule,
    TranscribeModule,
    SummarizeModule,
    MeetingTextModule,
  ],
})
export class AppModule {}
