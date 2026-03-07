import { api } from '../lib/api'
import type { Database } from '../types/database'

type Meeting = Database['public']['Tables']['meetings']['Row']
type MeetingParticipant = Database['public']['Tables']['meeting_participants']['Row']
type Profile = Database['public']['Tables']['users']['Row']

export interface MeetingWithParticipants extends Meeting {
  participants: (MeetingParticipant & { profile: Profile })[]
  owner: Profile
}

export interface CreateMeetingParams {
  title: string
  description?: string
  scheduled_at?: string
  participant_user_ids?: string[]
}

export interface AddParticipantParams {
  meeting_id: string
  user_id: string
  role?: 'editor' | 'viewer'
}

export async function createMeeting(params: CreateMeetingParams) {
  const { data, error } = await api.meetings.create({
    title: params.title,
    description: params.description,
    scheduledAt: params.scheduled_at,
    participantUserIds: params.participant_user_ids,
  })

  if (error) {
    return { data: null, error: new Error(error) }
  }

  const meeting = data ? {
    id: data.id,
    owner_id: data.ownerId,
    title: data.title,
    description: data.description,
    scheduled_at: data.scheduledAt,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  } : null

  return { data: meeting, error: null }
}

export async function listMyMeetings() {
  const { data, error } = await api.meetings.list()

  if (error) {
    throw new Error(error)
  }

  const meetings = (data || []).map((m: any) => ({
    id: m.id,
    owner_id: m.ownerId,
    title: m.title,
    description: m.description,
    scheduled_at: m.scheduledAt,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  }))

  return { data: meetings, error: null }
}

export async function getMeeting(meetingId: string): Promise<{
  data: MeetingWithParticipants | null
  error: any
}> {
  const { data, error } = await api.meetings.get(meetingId)

  if (error) {
    return { data: null, error: new Error(error) }
  }

  if (!data) {
    return { data: null, error: new Error('Meeting not found') }
  }

  const meeting: MeetingWithParticipants = {
    id: data.meetingId,
    owner_id: data.owner?.id || '',
    title: data.title,
    description: data.description,
    scheduled_at: data.scheduledAt,
    created_at: data.createdAt,
    updated_at: data.createdAt,
    owner: {
      id: data.owner?.id || '',
      email: data.owner?.email || '',
      full_name: data.owner?.fullName || null,
      avatar_url: null,
      created_at: '',
    },
    participants: (data.participants || []).map((p: any) => ({
      id: p.id || '',
      meeting_id: data.meetingId,
      user_id: p.userId,
      role: p.role as 'editor' | 'viewer',
      created_at: '',
      profile: {
        id: p.userId,
        email: p.email || '',
        full_name: p.fullName || null,
        avatar_url: null,
        created_at: '',
      },
    })),
  }

  return { data: meeting, error: null }
}

export async function getMeetingIntelligence(meetingId: string) {
  const { data, error } = await api.meetings.get(meetingId)

  if (error) {
    return { data: null, error: new Error(error) }
  }

  return { data, error: null }
}

export async function updateMeeting(
  meetingId: string,
  updates: { title?: string; description?: string; scheduled_at?: string }
) {
  const { data, error } = await api.meetings.update(meetingId, {
    title: updates.title,
    description: updates.description,
    scheduledAt: updates.scheduled_at,
  })

  if (error) {
    throw new Error(error)
  }

  const meeting = data ? {
    id: data.id,
    owner_id: data.ownerId,
    title: data.title,
    description: data.description,
    scheduled_at: data.scheduledAt,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  } : null

  return { data: meeting, error: null }
}

export async function deleteMeeting(meetingId: string) {
  const { error } = await api.meetings.delete(meetingId)

  if (error) {
    throw new Error(error)
  }

  return { error: null }
}

export async function addParticipant({ meeting_id, user_id, role = 'viewer' }: AddParticipantParams) {
  const { data, error } = await api.participants.add(meeting_id, {
    userId: user_id,
    role,
  })

  if (error) {
    throw new Error(error)
  }

  const participant = data ? {
    id: data.id,
    meeting_id: data.meetingId,
    user_id: data.userId,
    role: data.role,
    created_at: data.createdAt,
  } : null

  return { data: participant, error: null }
}

export async function removeParticipant(meetingId: string, userId: string) {
  const { error } = await api.participants.remove(meetingId, userId)

  if (error) {
    throw new Error(error)
  }

  return { error: null }
}

export async function updateParticipantRole(
  meetingId: string,
  userId: string,
  role: 'editor' | 'viewer'
) {
  const { data, error } = await api.participants.updateRole(meetingId, userId, role)

  if (error) {
    throw new Error(error)
  }

  const participant = data ? {
    id: data.id,
    meeting_id: data.meetingId,
    user_id: data.userId,
    role: data.role,
    created_at: data.createdAt,
  } : null

  return { data: participant, error: null }
}
