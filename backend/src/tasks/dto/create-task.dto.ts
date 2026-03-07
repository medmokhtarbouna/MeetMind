import { IsString, IsUUID, IsOptional, IsIn, IsDateString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsUUID('4')
  meetingId: string;

  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsUUID('4')
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsIn(['todo', 'doing', 'done'])
  status?: 'todo' | 'doing' | 'done';
}
