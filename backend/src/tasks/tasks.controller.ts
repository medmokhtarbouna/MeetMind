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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Headers('authorization') authHeader: string,
    @Body() dto: CreateTaskDto,
  ) {
    const task = await this.tasksService.createTask(authHeader, dto);
    return {
      success: true,
      message: 'Task created successfully',
      data: task,
    };
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  async listMyTasks(@Headers('authorization') authHeader: string) {
    const tasks = await this.tasksService.listMyTasks(authHeader);
    return {
      success: true,
      data: tasks,
      total: tasks.length,
    };
  }

  @Get('meeting/:meetingId')
  @HttpCode(HttpStatus.OK)
  async listTasksByMeeting(
    @Headers('authorization') authHeader: string,
    @Param('meetingId') meetingId: string,
  ) {
    const tasks = await this.tasksService.listTasksByMeeting(authHeader, meetingId);
    return {
      success: true,
      data: tasks,
      total: tasks.length,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTask(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const task = await this.tasksService.getTask(authHeader, id);
    return {
      success: true,
      data: task,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateTask(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.tasksService.updateTask(authHeader, id, dto);
    return {
      success: true,
      message: 'Task updated successfully',
      data: task,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteTask(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    await this.tasksService.deleteTask(authHeader, id);
    return {
      success: true,
      message: 'Task deleted successfully',
    };
  }
}
