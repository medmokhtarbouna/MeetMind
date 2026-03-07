import { IsIn } from 'class-validator';


export class UpdateParticipantDto {
  @IsIn(['editor', 'viewer'])
  role: 'editor' | 'viewer';
}
