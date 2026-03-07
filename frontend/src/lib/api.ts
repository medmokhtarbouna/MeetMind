import { supabase } from './supabase';

// API Base URL - Set VITE_API_URL in your .env file for production
// Example: VITE_API_URL=https://meetmind-backend-production-11c2.up.railway.app/api
function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    // Ensure the URL has a protocol
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl;
    }
    // If no protocol, assume https for production URLs
    return `https://${envUrl}`;
  }
  
  // Default to localhost for development
  return 'http://localhost:3001/api';
}

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = await getAccessToken();
    
    if (!token) {
      if (import.meta.env.DEV) {
        console.error('[API] No token available');
      }
      return { data: null, error: 'Not authenticated' };
    }

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    
    // Debug logging in development only
    if (import.meta.env.DEV) {
      console.log('[API] Request:', {
        url: fullUrl,
        method: options.method || 'GET',
        hasToken: !!token,
        tokenLength: token?.length || 0
      });
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    // Debug logging in development only
    if (import.meta.env.DEV) {
      console.log('[API] Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        url: fullUrl
      });
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    let result;
    
    if (!isJson) {
      // If not JSON, it might be HTML (error page) or empty
      const text = await response.text();
      
      // Check for CORS errors or HTML responses
      if (text.includes('<!doctype') || text.includes('<html')) {
        return {
          data: null,
          error: `Server returned HTML instead of JSON. This might be a CORS issue or the API endpoint is incorrect. URL: ${API_BASE_URL}${endpoint}`
        };
      }

      return {
        data: null,
        error: `Expected JSON response but got ${contentType || 'unknown content type'}. Status: ${response.status}`
      };
    }

    // Parse JSON response
    try {
      result = await response.json();
    } catch (parseError) {
      return {
        data: null,
        error: `Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
      };
    }

    if (!response.ok) {
      return { 
        data: null, 
        error: result.message || result.error || `HTTP ${response.status}` 
      };
    }

    return { data: result.data || result, error: null };

  } catch (error) {
    // Handle JSON parse errors specifically
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return {
        data: null,
        error: `Failed to parse JSON response. This might indicate a CORS issue or the API is returning HTML. Check the API URL: ${API_BASE_URL}`
      };
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        data: null,
        error: `Network error: Unable to reach the API at ${API_BASE_URL}. Please check your connection and API URL.`
      };
    }

    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export const api = {
  meetings: {
    create: (data: { 
      title: string; 
      description?: string; 
      scheduledAt?: string;
      participantUserIds?: string[];
    }) =>
      apiRequest<any>('/meetings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    list: () => apiRequest<any[]>('/meetings'),

    get: (id: string) => apiRequest<any>(`/meetings/${id}`),

    getIntelligence: (id: string) => apiRequest<any>(`/meetings/${id}`),

    update: (id: string, data: { 
      title?: string; 
      description?: string; 
      scheduledAt?: string; 
    }) =>
      apiRequest<any>(`/meetings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiRequest<any>(`/meetings/${id}`, { method: 'DELETE' }),
  },

  participants: {
    add: (meetingId: string, data: { userId: string; role?: 'editor' | 'viewer' }) =>
      apiRequest<any>(`/meetings/${meetingId}/participants`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    remove: (meetingId: string, userId: string) =>
      apiRequest<any>(`/meetings/${meetingId}/participants/${userId}`, {
        method: 'DELETE',
      }),

    updateRole: (meetingId: string, userId: string, role: 'editor' | 'viewer') =>
      apiRequest<any>(`/meetings/${meetingId}/participants/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
  },

  recordings: {
    create: (data: { 
      meetingId: string; 
      fileName: string; 
      mimeType?: string; 
      durationSeconds?: number;
    }) =>
      apiRequest<any>('/recordings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    listByMeeting: (meetingId: string) =>
      apiRequest<any[]>(`/recordings/meeting/${meetingId}`),

    get: (id: string) => apiRequest<any>(`/recordings/${id}`),

    delete: (id: string) =>
      apiRequest<any>(`/recordings/${id}`, { method: 'DELETE' }),
  },

  tasks: {
    create: (data: {
      meetingId: string;
      title: string;
      assignedTo?: string;
      deadline?: string;
      status?: 'todo' | 'doing' | 'done';
    }) =>
      apiRequest<any>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    listByMeeting: (meetingId: string) =>
      apiRequest<any[]>(`/tasks/meeting/${meetingId}`),

    listMy: () => apiRequest<any[]>('/tasks/my'),

    get: (id: string) => apiRequest<any>(`/tasks/${id}`),

    update: (id: string, data: {
      title?: string;
      assignedTo?: string | null;
      deadline?: string | null;
      status?: 'todo' | 'doing' | 'done';
    }) =>
      apiRequest<any>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiRequest<any>(`/tasks/${id}`, { method: 'DELETE' }),
  },

  summaries: {
    create: (data: {
      meetingId: string;
      summary?: string;
      actionItems?: Array<{ text: string; assignedTo?: string; priority?: string }>;
      decisions?: string[];
      keyPoints?: string[];
      keywords?: string[];
    }) =>
      apiRequest<any>('/summaries', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getByMeeting: (meetingId: string) =>
      apiRequest<any>(`/summaries/meeting/${meetingId}`),

    get: (id: string) => apiRequest<any>(`/summaries/${id}`),

    update: (id: string, data: {
      summary?: string;
      actionItems?: Array<{ text: string; assignedTo?: string; priority?: string }>;
      decisions?: string[];
      keyPoints?: string[];
      keywords?: string[];
    }) =>
      apiRequest<any>(`/summaries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiRequest<any>(`/summaries/${id}`, { method: 'DELETE' }),
  },

  transcriptions: {
    create: (data: {
      recordingId: string;
      text: string;
      language?: string;
    }) =>
      apiRequest<any>('/transcriptions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getByRecording: (recordingId: string) =>
      apiRequest<any>(`/transcriptions/recording/${recordingId}`),

    get: (id: string) => apiRequest<any>(`/transcriptions/${id}`),

    update: (id: string, data: {
      text?: string;
      language?: string;
    }) =>
      apiRequest<any>(`/transcriptions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiRequest<any>(`/transcriptions/${id}`, { method: 'DELETE' }),
  },

  transcribe: (data: { recordingId: string; language?: string }) =>
    apiRequest<any>('/transcribe', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  summarize: (data: { meetingId: string }) =>
    apiRequest<any>('/summarize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  processMeetingText: (data: { 
    meetingId: string; 
    text: string; 
    language?: string;
  }) =>
    apiRequest<{
      success: boolean;
      meetingId: string;
      summaryId: string;
      intelligence: {
        summary: string;
        actionItems: Array<{ title: string; owner: string | null; deadline: string | null }>;
        tasks: Array<{ title: string; status: 'todo' | 'doing' | 'done' }>;
        decisions: string[];
        keyPoints: string[];
        keywords: string[];
      };
      tasksCreated: number;
    }>('/meeting-text/process', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export default api;
