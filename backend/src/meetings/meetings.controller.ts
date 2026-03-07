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
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMeeting(
    @Headers('authorization') authHeader: string,
    @Body() dto: CreateMeetingDto,
  ) {
    const meeting = await this.meetingsService.createMeeting(authHeader, dto);
    return {
      success: true,
      message: 'Meeting created successfully',
      data: meeting,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listMeetings(@Headers('authorization') authHeader: string) {
    const meetings = await this.meetingsService.listMeetings(authHeader);
    return {
      success: true,
      data: meetings,
      total: meetings.length,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getMeetingIntelligence(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const intelligence = await this.meetingsService.getMeetingIntelligence(
      authHeader,
      id,
    );
    return {
      success: true,
      data: intelligence,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateMeeting(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() dto: UpdateMeetingDto,
  ) {
    const meeting = await this.meetingsService.updateMeeting(authHeader, id, dto);
    return {
      success: true,
      message: 'Meeting updated successfully',
      data: meeting,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteMeeting(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    await this.meetingsService.deleteMeeting(authHeader, id);
    return {
      success: true,
      message: 'Meeting deleted successfully',
    };
  }

  @Post(':id/participants')
  @HttpCode(HttpStatus.CREATED)
  async addParticipant(
    @Headers('authorization') authHeader: string,
    @Param('id') meetingId: string,
    @Body() dto: AddParticipantDto,
  ) {
    const participant = await this.meetingsService.addParticipant(
      authHeader,
      meetingId,
      dto,
    );
    return {
      success: true,
      message: 'Participant added successfully',
      data: participant,
    };
  }

  @Delete(':id/participants/:userId')
  @HttpCode(HttpStatus.OK)
  async removeParticipant(
    @Headers('authorization') authHeader: string,
    @Param('id') meetingId: string,
    @Param('userId') userId: string,
  ) {
    await this.meetingsService.removeParticipant(authHeader, meetingId, userId);
    return {
      success: true,
      message: 'Participant removed successfully',
    };
  }

  @Patch(':id/participants/:userId')
  @HttpCode(HttpStatus.OK)
  async updateParticipantRole(
    @Headers('authorization') authHeader: string,
    @Param('id') meetingId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateParticipantDto,
  ) {
    const participant = await this.meetingsService.updateParticipantRole(
      authHeader,
      meetingId,
      userId,
      dto,
    );
    return {
      success: true,
      message: 'Participant role updated successfully',
      data: participant,
    };
  }
}
