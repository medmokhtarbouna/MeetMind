import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export interface TaskResponse {
  id: string;
  meetingId: string;
  title: string;
  status: string;
  assignedTo: string | null;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  assignedUser: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
}

@Injectable()
export class TasksService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createTask(
    authHeader: string,
    dto: CreateTaskDto,
  ): Promise<TaskResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(dto.meetingId)) {
      throw new BadRequestException('Invalid meeting ID format');
    }

    const { data: meeting } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', dto.meetingId)
      .single();

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        meeting_id: dto.meetingId,
        title: dto.title,
        assigned_to: dto.assignedTo || null,
        deadline: dto.deadline || null,
        status: dto.status || 'todo',
      })
      .select('*, assigned_profile:users!tasks_assigned_to_fkey(*)')
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to create task: ${error.message}`,
      );
    }

    return this.mapTaskResponse(task);
  }

  async listTasksByMeeting(
    authHeader: string,
    meetingId: string,
  ): Promise<TaskResponse[]> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(meetingId)) {
      throw new BadRequestException('Invalid meeting ID format');
    }

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*, assigned_profile:users!tasks_assigned_to_fkey(*)')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch tasks: ${error.message}`,
      );
    }

    return (tasks || []).map(this.mapTaskResponse);
  }

  async listMyTasks(authHeader: string): Promise<TaskResponse[]> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    const user = await this.supabaseService.verifyUser(authHeader);

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*, assigned_profile:users!tasks_assigned_to_fkey(*), meeting:meetings(*)')
      .eq('assigned_to', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch tasks: ${error.message}`,
      );
    }

    return (tasks || []).map(this.mapTaskResponse);
  }

  async getTask(authHeader: string, taskId: string): Promise<TaskResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(taskId)) {
      throw new BadRequestException('Invalid task ID format');
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .select('*, assigned_profile:users!tasks_assigned_to_fkey(*)')
      .eq('id', taskId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Task not found');
      }
      throw new InternalServerErrorException(
        `Failed to fetch task: ${error.message}`,
      );
    }

    return this.mapTaskResponse(task);
  }

  async updateTask(
    authHeader: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskResponse> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(taskId)) {
      throw new BadRequestException('Invalid task ID format');
    }

    const updates: Record<string, any> = {};
    if (dto.title !== undefined) updates.title = dto.title;
    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.assignedTo !== undefined) updates.assigned_to = dto.assignedTo;
    if (dto.deadline !== undefined) updates.deadline = dto.deadline;

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select('*, assigned_profile:users!tasks_assigned_to_fkey(*)')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Task not found');
      }
      throw new InternalServerErrorException(
        `Failed to update task: ${error.message}`,
      );
    }

    return this.mapTaskResponse(task);
  }

  async deleteTask(authHeader: string, taskId: string): Promise<void> {
    const supabase = this.supabaseService.getUserClient(authHeader);
    await this.supabaseService.verifyUser(authHeader);

    if (!this.isValidUUID(taskId)) {
      throw new BadRequestException('Invalid task ID format');
    }

    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Task not found');
      }
      throw new InternalServerErrorException(
        `Failed to delete task: ${error.message}`,
      );
    }
  }

  private mapTaskResponse(task: any): TaskResponse {
    return {
      id: task.id,
      meetingId: task.meeting_id,
      title: task.title,
      status: task.status,
      assignedTo: task.assigned_to,
      deadline: task.deadline,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      assignedUser: task.assigned_profile
        ? {
            id: task.assigned_profile.id,
            email: task.assigned_profile.email,
            fullName: task.assigned_profile.full_name,
          }
        : null,
    };
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
