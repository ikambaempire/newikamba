export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          created_at: string
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          project_id: string | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          project_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          project_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          name: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      impact_audit_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          organization: string | null
          source: string
          status: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          organization?: string | null
          source?: string
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          organization?: string | null
          source?: string
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      popup_settings: {
        Row: {
          button_link: string
          button_text: string
          created_at: string
          delay_seconds: number
          enabled: boolean
          id: string
          message: string
          name: string
          popup_type: string
          title: string
          updated_at: string
        }
        Insert: {
          button_link?: string
          button_text?: string
          created_at?: string
          delay_seconds?: number
          enabled?: boolean
          id?: string
          message?: string
          name: string
          popup_type?: string
          title?: string
          updated_at?: string
        }
        Update: {
          button_link?: string
          button_text?: string
          created_at?: string
          delay_seconds?: number
          enabled?: boolean
          id?: string
          message?: string
          name?: string
          popup_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          client_id: string | null
          created_at: string
          full_name: string | null
          id: string
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_status_logs: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["project_status"]
          notes: string | null
          old_status: Database["public"]["Enums"]["project_status"] | null
          project_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["project_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["project_status"] | null
          project_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["project_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["project_status"] | null
          project_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          approval_contact: string | null
          budget_range: string | null
          client_id: string | null
          contact_email: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          distribution_plan: string | null
          id: string
          key_message: string | null
          name: string
          objective: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          project_type: string | null
          revision_count: number
          stage_entered_at: string
          status: Database["public"]["Enums"]["project_status"]
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          approval_contact?: string | null
          budget_range?: string | null
          client_id?: string | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          distribution_plan?: string | null
          id?: string
          key_message?: string | null
          name: string
          objective?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          project_type?: string | null
          revision_count?: number
          stage_entered_at?: string
          status?: Database["public"]["Enums"]["project_status"]
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          approval_contact?: string | null
          budget_range?: string | null
          client_id?: string | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          distribution_plan?: string | null
          id?: string
          key_message?: string | null
          name?: string
          objective?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          project_type?: string | null
          revision_count?: number
          stage_entered_at?: string
          status?: Database["public"]["Enums"]["project_status"]
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      revisions: {
        Row: {
          created_at: string
          created_by: string | null
          feedback: string | null
          id: string
          project_id: string
          revision_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          feedback?: string | null
          id?: string
          project_id: string
          revision_number?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          feedback?: string | null
          id?: string
          project_id?: string
          revision_number?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_current_user_profile: {
        Args: { _full_name?: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_internal_role: { Args: { _user_id: string }; Returns: boolean }
      user_client_id: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "org_admin"
        | "project_manager"
        | "producer"
        | "editor"
        | "client"
        | "user"
      priority_level: "low" | "medium" | "high" | "urgent"
      project_status:
        | "brief_received"
        | "strategy_alignment"
        | "production"
        | "editing"
        | "client_review"
        | "final_delivery"
        | "archive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "org_admin",
        "project_manager",
        "producer",
        "editor",
        "client",
        "user",
      ],
      priority_level: ["low", "medium", "high", "urgent"],
      project_status: [
        "brief_received",
        "strategy_alignment",
        "production",
        "editing",
        "client_review",
        "final_delivery",
        "archive",
      ],
    },
  },
} as const
