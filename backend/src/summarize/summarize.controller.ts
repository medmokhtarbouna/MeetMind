import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SummarizeService } from './summarize.service';
import { SummarizeDto } from './dto/summarize.dto';

@Controller('summarize')
export class SummarizeController {
  constructor(private readonly summarizeService: SummarizeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async summarize(
    @Headers('authorization') authHeader: string,
    @Body() dto: SummarizeDto,
  ) {
    const result = await this.summarizeService.summarize(authHeader, dto);
    return {
      success: true,
      message: 'Summary generated successfully',
      data: result,
    };
  }
}
