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
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
          details: Json | null
          id: string
          target: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      compliance_items: {
        Row: {
          created_at: string
          evidence_url: string | null
          framework: string
          id: string
          notes: string | null
          owner_org: string | null
          requirement: string
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          evidence_url?: string | null
          framework: string
          id?: string
          notes?: string | null
          owner_org?: string | null
          requirement: string
          severity?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          evidence_url?: string | null
          framework?: string
          id?: string
          notes?: string | null
          owner_org?: string | null
          requirement?: string
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string | null
          confidentiality: string
          created_at: string
          folder: string
          id: string
          mime_type: string | null
          name: string
          sharia_relevant: boolean
          size_bytes: number | null
          status: string
          storage_path: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          confidentiality?: string
          created_at?: string
          folder?: string
          id?: string
          mime_type?: string | null
          name: string
          sharia_relevant?: boolean
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          confidentiality?: string
          created_at?: string
          folder?: string
          id?: string
          mime_type?: string | null
          name?: string
          sharia_relevant?: boolean
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      financial_metrics: {
        Row: {
          category: string | null
          created_at: string
          currency: string | null
          id: string
          metric: string
          notes: string | null
          period: string | null
          updated_at: string
          value: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          metric: string
          notes?: string | null
          period?: string | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          metric?: string
          notes?: string | null
          period?: string | null
          updated_at?: string
          value?: number | null
        }
        Relationships: []
      }
      folder_access: {
        Row: {
          created_at: string
          folder: string
          id: string
          org: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          folder: string
          id?: string
          org: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          folder?: string
          id?: string
          org?: string
          updated_at?: string
        }
        Relationships: []
      }
      item_comments: {
        Row: {
          author_id: string
          author_name: string | null
          author_org: string | null
          body: string
          created_at: string
          id: string
          item_id: string
          item_type: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          author_name?: string | null
          author_org?: string | null
          body: string
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_name?: string | null
          author_org?: string | null
          body?: string
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "item_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          code: string | null
          created_at: string
          critical_path: boolean
          due_date: string | null
          id: string
          notes: string | null
          owner_org: string | null
          phase: string | null
          progress: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          critical_path?: boolean
          due_date?: string | null
          id?: string
          notes?: string | null
          owner_org?: string | null
          phase?: string | null
          progress?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          critical_path?: boolean
          due_date?: string | null
          id?: string
          notes?: string | null
          owner_org?: string | null
          phase?: string | null
          progress?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_name: string | null
          actor_org: string | null
          body: string | null
          created_at: string
          id: string
          item_id: string | null
          item_type: string | null
          link: string | null
          read: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actor_name?: string | null
          actor_org?: string | null
          body?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          link?: string | null
          read?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actor_name?: string | null
          actor_org?: string | null
          body?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          link?: string | null
          read?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organisations: {
        Row: {
          created_at: string
          id: string
          is_protected: boolean
          name: string
          partner_access: boolean
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_protected?: boolean
          name: string
          partner_access?: boolean
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_protected?: boolean
          name?: string
          partner_access?: boolean
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          must_reset_password: boolean
          org: string | null
          updated_at: string
          must_reset_password: boolean
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          must_reset_password?: boolean
          org?: string | null
          updated_at?: string
          must_reset_password?: boolean
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          must_reset_password?: boolean
          org?: string | null
          updated_at?: string
          must_reset_password?: boolean
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          file_url: string | null
          generated_at: string
          generated_by: string | null
          id: string
          name: string
          report_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          name: string
          report_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          name?: string
          report_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      risks: {
        Row: {
          category: string | null
          created_at: string
          id: string
          impact: number
          likelihood: number
          mitigation: string | null
          owner_org: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          impact?: number
          likelihood?: number
          mitigation?: string | null
          owner_org?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          impact?: number
          likelihood?: number
          mitigation?: string | null
          owner_org?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      stakeholders: {
        Row: {
          completed: number
          contact_email: string | null
          created_at: string
          id: string
          org: string
          pending: number
          role: string | null
          updated_at: string
          users_count: number
        }
        Insert: {
          completed?: number
          contact_email?: string | null
          created_at?: string
          id?: string
          org: string
          pending?: number
          role?: string | null
          updated_at?: string
          users_count?: number
        }
        Update: {
          completed?: number
          contact_email?: string | null
          created_at?: string
          id?: string
          org?: string
          pending?: number
          role?: string | null
          updated_at?: string
          users_count?: number
        }
        Relationships: []
      }
      sukuk_structures: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          notes: string | null
          profit_rate: number | null
          score: number
          size_musd: number | null
          status: string
          structure_type: string
          tenor_years: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          notes?: string | null
          profit_rate?: number | null
          score?: number
          size_musd?: number | null
          status?: string
          structure_type: string
          tenor_years?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          notes?: string | null
          profit_rate?: number | null
          score?: number
          size_musd?: number | null
          status?: string
          structure_type?: string
          tenor_years?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee: string | null
          assignee_user_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          milestone_id: string | null
          org: string | null
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          assignee_user_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_id?: string | null
          org?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          assignee_user_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_id?: string | null
          org?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
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
      can_access_folder: {
        Args: { _folder: string; _user_id: string }
        Returns: boolean
      }
      can_write: { Args: { _user_id: string }; Returns: boolean }
      current_user_org: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "advisor" | "auditor" | "investor" | "member"
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
      app_role: ["admin", "advisor", "auditor", "investor", "member"],
    },
  },
} as const
