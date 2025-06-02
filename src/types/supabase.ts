export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      comments: {
        Row: {
          id: string;
          created_at: string;
          content: string;
          post_id: string;
          user_id: string;
          parent_id: string | null;
          status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          content: string;
          post_id: string;
          user_id: string;
          parent_id?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          content?: string;
          post_id?: string;
          user_id?: string;
          parent_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          username: string | null;
          avatar_url: string | null;
          is_moderator: boolean;
          is_trusted: boolean;
          is_banned: boolean;
          suspended_until: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          username: string | null;
          avatar_url?: string | null;
          is_moderator?: boolean;
          is_trusted?: boolean;
          is_banned?: boolean;
          suspended_until?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          username?: string | null;
          avatar_url?: string | null;
          is_moderator?: boolean;
          is_trusted?: boolean;
          is_banned?: boolean;
          suspended_until?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
