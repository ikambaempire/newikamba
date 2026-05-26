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
      os_calendar_events: {
        Row: {
          created_at: string
          created_by: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          location: string | null
          notes: string | null
          project_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_date: string
          event_time?: string | null
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          project_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      os_expense_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          category: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          description: string
          id: string
          needed_by: string | null
          receipt_url: string | null
          requester_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          category: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          description: string
          id?: string
          needed_by?: string | null
          receipt_url?: string | null
          requester_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          category?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          description?: string
          id?: string
          needed_by?: string | null
          receipt_url?: string | null
          requester_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      os_notifications: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          link: string | null
          message: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      os_pipeline_projects: {
        Row: {
          assigned_to_name: string | null
          assigned_to_user_id: string | null
          brief: string | null
          budget_range: string | null
          client: string
          contact_person: string | null
          costs_total: number
          created_at: string
          created_by: string | null
          custom_fields: Json
          deadline: string | null
          deliverables: string | null
          email: string | null
          id: string
          location: string | null
          name: string
          next_action: string | null
          notes: string | null
          objective: string | null
          owner: string | null
          paid: number
          payment_status: string
          payment_terms: string | null
          phone: string | null
          product_line: string | null
          references: string | null
          service: string | null
          shoot_date: string | null
          stage: string
          updated_at: string
          value: number
        }
        Insert: {
          assigned_to_name?: string | null
          assigned_to_user_id?: string | null
          brief?: string | null
          budget_range?: string | null
          client?: string
          contact_person?: string | null
          costs_total?: number
          created_at?: string
          created_by?: string | null
          custom_fields?: Json
          deadline?: string | null
          deliverables?: string | null
          email?: string | null
          id?: string
          location?: string | null
          name: string
          next_action?: string | null
          notes?: string | null
          objective?: string | null
          owner?: string | null
          paid?: number
          payment_status?: string
          payment_terms?: string | null
          phone?: string | null
          product_line?: string | null
          references?: string | null
          service?: string | null
          shoot_date?: string | null
          stage?: string
          updated_at?: string
          value?: number
        }
        Update: {
          assigned_to_name?: string | null
          assigned_to_user_id?: string | null
          brief?: string | null
          budget_range?: string | null
          client?: string
          contact_person?: string | null
          costs_total?: number
          created_at?: string
          created_by?: string | null
          custom_fields?: Json
          deadline?: string | null
          deliverables?: string | null
          email?: string | null
          id?: string
          location?: string | null
          name?: string
          next_action?: string | null
          notes?: string | null
          objective?: string | null
          owner?: string | null
          paid?: number
          payment_status?: string
          payment_terms?: string | null
          phone?: string | null
          product_line?: string | null
          references?: string | null
          service?: string | null
          shoot_date?: string | null
          stage?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      os_platform_settings: {
        Row: {
          items: string[]
          setting_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          items?: string[]
          setting_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          items?: string[]
          setting_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      os_quotation_costs: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          quotation_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          quotation_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          quotation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "os_quotation_costs_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "os_quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      os_quotation_items: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          included: boolean
          kind: string
          name: string
          position: number
          quantity: number
          quotation_id: string
          unit_price: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          included?: boolean
          kind?: string
          name: string
          position?: number
          quantity?: number
          quotation_id: string
          unit_price?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          included?: boolean
          kind?: string
          name?: string
          position?: number
          quantity?: number
          quotation_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "os_quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "os_quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      os_quotations: {
        Row: {
          advance_amount: number
          advance_percent: number
          amount_in_words: string | null
          balance_amount: number
          client_address: string | null
          client_contact_person: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          client_type: string | null
          company_address: string | null
          company_email: string | null
          company_name: string
          company_phone: string | null
          company_tin: string | null
          converted_legacy_project_id: string | null
          converted_project_id: string | null
          created_at: string
          currency: string
          delivery_timeline: string | null
          discount_amount: number
          discount_type: string
          discount_value: number
          estimated_profit: number
          id: string
          location: string | null
          notes: string | null
          prepared_by_name: string | null
          prepared_by_user_id: string | null
          product_line: string | null
          profit_margin: number
          project_name: string | null
          project_objective: string | null
          quotation_date: string
          quotation_number: string
          service_category: string | null
          shoot_date: string | null
          show_internal_costs_on_pdf: boolean
          status: Database["public"]["Enums"]["os_quotation_status"]
          subtotal: number
          tax_amount: number
          tax_percent: number
          terms: string | null
          total_amount: number
          total_cost_estimate: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          advance_amount?: number
          advance_percent?: number
          amount_in_words?: string | null
          balance_amount?: number
          client_address?: string | null
          client_contact_person?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          client_type?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          company_tin?: string | null
          converted_legacy_project_id?: string | null
          converted_project_id?: string | null
          created_at?: string
          currency?: string
          delivery_timeline?: string | null
          discount_amount?: number
          discount_type?: string
          discount_value?: number
          estimated_profit?: number
          id?: string
          location?: string | null
          notes?: string | null
          prepared_by_name?: string | null
          prepared_by_user_id?: string | null
          product_line?: string | null
          profit_margin?: number
          project_name?: string | null
          project_objective?: string | null
          quotation_date?: string
          quotation_number?: string
          service_category?: string | null
          shoot_date?: string | null
          show_internal_costs_on_pdf?: boolean
          status?: Database["public"]["Enums"]["os_quotation_status"]
          subtotal?: number
          tax_amount?: number
          tax_percent?: number
          terms?: string | null
          total_amount?: number
          total_cost_estimate?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          advance_amount?: number
          advance_percent?: number
          amount_in_words?: string | null
          balance_amount?: number
          client_address?: string | null
          client_contact_person?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          client_type?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          company_tin?: string | null
          converted_legacy_project_id?: string | null
          converted_project_id?: string | null
          created_at?: string
          currency?: string
          delivery_timeline?: string | null
          discount_amount?: number
          discount_type?: string
          discount_value?: number
          estimated_profit?: number
          id?: string
          location?: string | null
          notes?: string | null
          prepared_by_name?: string | null
          prepared_by_user_id?: string | null
          product_line?: string | null
          profit_margin?: number
          project_name?: string | null
          project_objective?: string | null
          quotation_date?: string
          quotation_number?: string
          service_category?: string | null
          shoot_date?: string | null
          show_internal_costs_on_pdf?: boolean
          status?: Database["public"]["Enums"]["os_quotation_status"]
          subtotal?: number
          tax_amount?: number
          tax_percent?: number
          terms?: string | null
          total_amount?: number
          total_cost_estimate?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      os_todos: {
        Row: {
          assigned_by_name: string | null
          by_admin: boolean
          created_at: string
          done: boolean
          due: string | null
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["os_priority"]
          reminders_fired: number[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by_name?: string | null
          by_admin?: boolean
          created_at?: string
          done?: boolean
          due?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["os_priority"]
          reminders_fired?: number[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by_name?: string | null
          by_admin?: boolean
          created_at?: string
          done?: boolean
          due?: string | null
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["os_priority"]
          reminders_fired?: number[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      os_tool_access: {
        Row: {
          created_at: string
          granted_by: string | null
          tool_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          tool_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          tool_key?: string
          user_id?: string
        }
        Relationships: []
      }
      os_weekly_goals: {
        Row: {
          assigned_by_name: string | null
          by_admin: boolean
          created_at: string
          done: boolean
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["os_priority"]
          title: string
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          assigned_by_name?: string | null
          by_admin?: boolean
          created_at?: string
          done?: boolean
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["os_priority"]
          title: string
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          assigned_by_name?: string | null
          by_admin?: boolean
          created_at?: string
          done?: boolean
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["os_priority"]
          title?: string
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      partner_logos: {
        Row: {
          created_at: string
          id: string
          logo_url: string
          name: string
          sort_order: number
          updated_at: string
          visible: boolean
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url: string
          name: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string
          name?: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
          website_url?: string | null
        }
        Relationships: []
      }
      popup_settings: {
        Row: {
          accent_color: string | null
          bg_color: string | null
          button_bg_color: string | null
          button_link: string
          button_text: string
          button_text_color: string | null
          created_at: string
          delay_seconds: number
          enabled: boolean
          eyebrow: string | null
          heading_size: string
          id: string
          layout: string
          media_type: string | null
          media_url: string | null
          message: string
          name: string
          overlay_opacity: number
          popup_type: string
          show_form: boolean
          target_path: string
          text_align: string
          text_color: string | null
          title: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          bg_color?: string | null
          button_bg_color?: string | null
          button_link?: string
          button_text?: string
          button_text_color?: string | null
          created_at?: string
          delay_seconds?: number
          enabled?: boolean
          eyebrow?: string | null
          heading_size?: string
          id?: string
          layout?: string
          media_type?: string | null
          media_url?: string | null
          message?: string
          name: string
          overlay_opacity?: number
          popup_type?: string
          show_form?: boolean
          target_path?: string
          text_align?: string
          text_color?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          bg_color?: string | null
          button_bg_color?: string | null
          button_link?: string
          button_text?: string
          button_text_color?: string | null
          created_at?: string
          delay_seconds?: number
          enabled?: boolean
          eyebrow?: string | null
          heading_size?: string
          id?: string
          layout?: string
          media_type?: string | null
          media_url?: string | null
          message?: string
          name?: string
          overlay_opacity?: number
          popup_type?: string
          show_form?: boolean
          target_path?: string
          text_align?: string
          text_color?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          client_id: string | null
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          organization_id: string | null
          role_title: string | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          client_id?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role_title?: string | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          client_id?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role_title?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
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
      is_bootstrap_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_internal_role: { Args: { _user_id: string }; Returns: boolean }
      next_quotation_number: { Args: never; Returns: string }
      user_client_id: { Args: { _user_id: string }; Returns: string }
      user_owns_quotation: { Args: { _quotation_id: string }; Returns: boolean }
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
      os_priority: "low" | "medium" | "high"
      os_quotation_status:
        | "draft"
        | "sent"
        | "approved"
        | "rejected"
        | "revised"
        | "expired"
        | "converted"
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
      os_priority: ["low", "medium", "high"],
      os_quotation_status: [
        "draft",
        "sent",
        "approved",
        "rejected",
        "revised",
        "expired",
        "converted",
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
