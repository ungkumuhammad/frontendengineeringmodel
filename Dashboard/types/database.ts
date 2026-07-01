// Minimal typed schema for supabase-js generics. Mirrors supabase/migrations.
import type { UserRole, ActivityAction } from "./index";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: UserRole;
          disabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role?: UserRole;
          disabled?: boolean;
        };
        Update: {
          email?: string;
          name?: string | null;
          role?: UserRole;
          disabled?: boolean;
        };
        Relationships: [];
      };
      login_logs: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          ip_address: string | null;
          user_agent: string | null;
          login_time: string;
          logout_time: string | null;
          session_id: string | null;
        };
        Insert: {
          user_id?: string | null;
          email: string;
          ip_address?: string | null;
          user_agent?: string | null;
          session_id?: string | null;
        };
        Update: {
          logout_time?: string | null;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          timestamp: string;
          user_id: string | null;
          user_email: string | null;
          action: ActivityAction;
          target: string | null;
          metadata: Record<string, unknown> | null;
        };
        Insert: {
          user_id?: string | null;
          user_email?: string | null;
          action: ActivityAction;
          target?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          action?: ActivityAction;
          target?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
