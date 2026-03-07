import { api } from '../lib/api'
import type { Database } from '../types/database'

type Task = Database['public']['Tables']['tasks']['Row']

export interface CreateTaskParams {
  meeting_id: string
  title: string
  assigned_to?: string
  deadline?: string
  status?: 'todo' | 'doing' | 'done'
}

export interface TaskWithAssignee extends Task {
  assigned_profile: {
    id: string
    email: string
    full_name: string | null
  } | null
}

export async function createTask(params: CreateTaskParams) {
  const { data, error } = await api.tasks.create({
    meetingId: params.meeting_id,
    title: params.title,
    assignedTo: params.assigned_to,
    deadline: params.deadline,
    status: params.status,
  })

  if (error) {
    throw new Error(error)
  }

  const task = data ? mapTaskResponse(data) : null

  return { data: task, error: null }
}

export async function listTasksByMeeting(meetingId: string) {
  const { data, error } = await api.tasks.listByMeeting(meetingId)

  if (error) {
    throw new Error(error)
  }

  const tasks = (data || []).map(mapTaskResponse)

  return { data: tasks, error: null }
}

export async function getTask(taskId: string) {
  const { data, error } = await api.tasks.get(taskId)

  if (error) {
    throw new Error(error)
  }

  const task = data ? mapTaskResponse(data) : null

  return { data: task, error: null }
}

export async function updateTaskStatus(taskId: string, status: 'todo' | 'doing' | 'done') {
  const { data, error } = await api.tasks.update(taskId, { status })

  if (error) {
    throw new Error(error)
  }

  const task = data ? mapTaskResponse(data) : null

  return { data: task, error: null }
}

export async function updateTask(
  taskId: string,
  updates: {
    title?: string
    assigned_to?: string | null
    deadline?: string | null
    status?: 'todo' | 'doing' | 'done'
  }
) {
  const { data, error } = await api.tasks.update(taskId, {
    title: updates.title,
    assignedTo: updates.assigned_to,
    deadline: updates.deadline,
    status: updates.status,
  })

  if (error) {
    throw new Error(error)
  }

  const task = data ? mapTaskResponse(data) : null

  return { data: task, error: null }
}

export async function deleteTask(taskId: string) {
  const { error } = await api.tasks.delete(taskId)

  if (error) {
    throw new Error(error)
  }

  return { error: null }
}

export async function listMyTasks() {
  const { data, error } = await api.tasks.listMy()

  if (error) {
    throw new Error(error)
  }

  const tasks = (data || []).map(mapTaskResponse)

  return { data: tasks, error: null }
}

function mapTaskResponse(data: any): TaskWithAssignee {
  return {
    id: data.id,
    meeting_id: data.meetingId,
    title: data.title,
    status: data.status,
    assigned_to: data.assignedTo,
    deadline: data.deadline,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    assigned_profile: data.assignedUser
      ? {
          id: data.assignedUser.id,
          email: data.assignedUser.email,
          full_name: data.assignedUser.fullName,
        }
      : null,
  }
}
