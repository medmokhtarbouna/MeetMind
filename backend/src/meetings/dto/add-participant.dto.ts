import { IsUUID, IsOptional, IsIn } from 'class-validator';

export class AddParticipantDto {
  @IsUUID('4')
  userId: string;

  @IsOptional()
  @IsIn(['editor', 'viewer'])
  role?: 'editor' | 'viewer';
}
