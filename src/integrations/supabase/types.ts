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
      ai_usage: {
        Row: {
          calls: number
          cost_units: number
          last_call_at: string | null
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          calls?: number
          cost_units?: number
          last_call_at?: string | null
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          calls?: number
          cost_units?: number
          last_call_at?: string | null
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      applicant_profiles: {
        Row: {
          city: string
          country: string
          created_at: string
          date_of_birth: string | null
          drivers_license: string
          earliest_start_date: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          linkedin: string
          nationality: string
          phone: string
          photo_url: string | null
          postal_code: string
          preferred_language: string
          salary_expectation: string
          street: string
          summary: string
          target_position: string
          updated_at: string
          user_id: string
          website: string
          willing_to_relocate: boolean
          work_permit: string
        }
        Insert: {
          city?: string
          country?: string
          created_at?: string
          date_of_birth?: string | null
          drivers_license?: string
          earliest_start_date?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          linkedin?: string
          nationality?: string
          phone?: string
          photo_url?: string | null
          postal_code?: string
          preferred_language?: string
          salary_expectation?: string
          street?: string
          summary?: string
          target_position?: string
          updated_at?: string
          user_id: string
          website?: string
          willing_to_relocate?: boolean
          work_permit?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          date_of_birth?: string | null
          drivers_license?: string
          earliest_start_date?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          linkedin?: string
          nationality?: string
          phone?: string
          photo_url?: string | null
          postal_code?: string
          preferred_language?: string
          salary_expectation?: string
          street?: string
          summary?: string
          target_position?: string
          updated_at?: string
          user_id?: string
          website?: string
          willing_to_relocate?: boolean
          work_permit?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          days: number
          is_active: boolean
          is_popular: boolean
          name: string
          price_id: string
          sort_order: number
          tier: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          days: number
          is_active?: boolean
          is_popular?: boolean
          name: string
          price_id: string
          sort_order?: number
          tier: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          days?: number
          is_active?: boolean
          is_popular?: boolean
          name?: string
          price_id?: string
          sort_order?: number
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          email_sent: boolean
          expires_at: string
          id: string
          invoice_no: string
          purchased_at: string
          status: string
          tier: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          email_sent?: boolean
          expires_at: string
          id?: string
          invoice_no: string
          purchased_at?: string
          status?: string
          tier: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          email_sent?: boolean
          expires_at?: string
          id?: string
          invoice_no?: string
          purchased_at?: string
          status?: string
          tier?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      resumes: {
        Row: {
          cover_letter: string | null
          created_at: string
          education: Json
          id: string
          languages: Json
          payment_status: string
          personal_details: Json
          settings: Json
          skills: Json
          updated_at: string
          user_id: string | null
          work_experience: Json
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          education?: Json
          id?: string
          languages?: Json
          payment_status?: string
          personal_details?: Json
          settings?: Json
          skills?: Json
          updated_at?: string
          user_id?: string | null
          work_experience?: Json
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          education?: Json
          id?: string
          languages?: Json
          payment_status?: string
          personal_details?: Json
          settings?: Json
          skills?: Json
          updated_at?: string
          user_id?: string | null
          work_experience?: Json
        }
        Relationships: [
          {
            foreignKeyName: "resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_entitlements: {
        Row: {
          expires_at: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_users_view"
            referencedColumns: ["user_id"]
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_templates: {
        Row: {
          created_at: string
          id: string
          mime_type: string
          name: string
          note: string | null
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type: string
          name: string
          note?: string | null
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string
          name?: string
          note?: string | null
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      admin_users_view: {
        Row: {
          created_at: string | null
          email: string | null
          expires_at: string | null
          last_sign_in_at: string | null
          tier: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      ai_quota_for_tier: {
        Args: { _tier: string }
        Returns: {
          max_calls: number
          max_cost: number
        }[]
      }
      consume_ai_quota: { Args: { _cost?: number }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
