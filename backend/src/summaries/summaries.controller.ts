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
import { SummariesService } from './summaries.service';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { UpdateSummaryDto } from './dto/update-summary.dto';

@Controller('summaries')
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSummary(
    @Headers('authorization') authHeader: string,
    @Body() dto: CreateSummaryDto,
  ) {
    const summary = await this.summariesService.createSummary(authHeader, dto);
    return {
      success: true,
      message: 'Summary created successfully',
      data: summary,
    };
  }

  @Get('meeting/:meetingId')
  @HttpCode(HttpStatus.OK)
  async getSummaryByMeeting(
    @Headers('authorization') authHeader: string,
    @Param('meetingId') meetingId: string,
  ) {
    const summary = await this.summariesService.getSummaryByMeeting(
      authHeader,
      meetingId,
    );
    return {
      success: true,
      data: summary,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getSummary(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const summary = await this.summariesService.getSummary(authHeader, id);
    return {
      success: true,
      data: summary,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateSummary(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() dto: UpdateSummaryDto,
  ) {
    const summary = await this.summariesService.updateSummary(authHeader, id, dto);
    return {
      success: true,
      message: 'Summary updated successfully',
      data: summary,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteSummary(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    await this.summariesService.deleteSummary(authHeader, id);
    return {
      success: true,
      message: 'Summary deleted successfully',
    };
  }
}
