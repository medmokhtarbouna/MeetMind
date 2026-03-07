import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;
  private readonly supabaseServiceKey: string;

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || '';
    this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error(
        'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.',
      );
    }
  }

  getUserClient(authHeader: string): SupabaseClient {
    const token = this.extractToken(authHeader);

    return createClient(this.supabaseUrl, this.supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  getServiceClient(): SupabaseClient {
    if (!this.supabaseServiceKey) {
      throw new Error('Service role key not configured');
    }

    return createClient(this.supabaseUrl, this.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async verifyUser(authHeader: string) {
    const client = this.getUserClient(authHeader);
    
    const { data: { user }, error } = await client.auth.getUser();

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user;
  }

  private extractToken(authHeader: string): string {
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      throw new UnauthorizedException(
        'Invalid Authorization header format. Expected: Bearer <token>',
      );
    }

    return parts[1];
  }

  getSupabaseUrl(): string {
    return this.supabaseUrl;
  }

  getAnonKey(): string {
    return this.supabaseAnonKey;
  }
}
