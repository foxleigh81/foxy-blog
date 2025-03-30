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
          mentions: string[] | null;
          status: 'pending' | 'approved' | 'rejected';
        };
        Insert: {
          id?: string;
          created_at?: string;
          content: string;
          post_id: string;
          user_id: string;
          parent_id?: string | null;
          mentions?: string[] | null;
          status?: 'pending' | 'approved' | 'rejected';
        };
        Update: {
          id?: string;
          created_at?: string;
          content?: string;
          post_id?: string;
          user_id?: string;
          parent_id?: string | null;
          mentions?: string[] | null;
          status?: 'pending' | 'approved' | 'rejected';
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
          display_name: string | null;
          avatar_url: string | null;
          is_moderator: boolean;
        };
        Insert: {
          id: string;
          created_at?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_moderator?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_moderator?: boolean;
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
