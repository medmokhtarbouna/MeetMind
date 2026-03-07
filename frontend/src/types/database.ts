export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          scheduled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          scheduled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          scheduled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meeting_participants: {
        Row: {
          id: string
          meeting_id: string
          user_id: string
          role: 'editor' | 'viewer'
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id: string
          role?: 'editor' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string
          role?: 'editor' | 'viewer'
          created_at?: string
        }
      }
      recordings: {
        Row: {
          id: string
          meeting_id: string
          uploader_id: string
          storage_path: string
          file_name: string | null
          mime_type: string | null
          duration_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          uploader_id?: string
          storage_path: string
          file_name?: string | null
          mime_type?: string | null
          duration_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          uploader_id?: string
          storage_path?: string
          file_name?: string | null
          mime_type?: string | null
          duration_seconds?: number | null
          created_at?: string
        }
      }
      transcriptions: {
        Row: {
          id: string
          recording_id: string
          language: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          recording_id: string
          language?: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          recording_id?: string
          language?: string
          text?: string
          created_at?: string
        }
      }
      ai_summaries: {
        Row: {
          id: string
          meeting_id: string
          summary: string | null
          action_items: Json
          decisions: Json
          key_points: Json
          keywords: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          summary?: string | null
          action_items?: Json
          decisions?: Json
          key_points?: Json
          keywords?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          summary?: string | null
          action_items?: Json
          decisions?: Json
          key_points?: Json
          keywords?: Json
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          meeting_id: string
          title: string
          assigned_to: string | null
          status: 'todo' | 'doing' | 'done'
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          title: string
          assigned_to?: string | null
          status?: 'todo' | 'doing' | 'done'
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          title?: string
          assigned_to?: string | null
          status?: 'todo' | 'doing' | 'done'
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
