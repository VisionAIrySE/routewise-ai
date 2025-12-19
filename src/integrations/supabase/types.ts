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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_id: string
          affected_user_id: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_id: string
          affected_user_id?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_id?: string
          affected_user_id?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          code: string
          created_at: string | null
          default_csv_mapping_id: string | null
          default_inspection_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          requires_appointment: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          default_csv_mapping_id?: string | null
          default_inspection_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_appointment?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          default_csv_mapping_id?: string | null
          default_inspection_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_appointment?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_default_csv_mapping_id_fkey"
            columns: ["default_csv_mapping_id"]
            isOneToOne: false
            referencedRelation: "csv_mappings"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          appointment_type: string | null
          code: string
          column_fingerprint: string[] | null
          column_mappings: Json | null
          created_at: string | null
          default_duration_minutes: number | null
          high_value_duration_minutes: number | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          appointment_type?: string | null
          code: string
          column_fingerprint?: string[] | null
          column_mappings?: Json | null
          created_at?: string | null
          default_duration_minutes?: number | null
          high_value_duration_minutes?: number | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          appointment_type?: string | null
          code?: string
          column_fingerprint?: string[] | null
          column_mappings?: Json | null
          created_at?: string | null
          default_duration_minutes?: number | null
          high_value_duration_minutes?: number | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      csv_mappings: {
        Row: {
          column_mapping: Json
          company_name: string
          created_at: string | null
          created_by: string | null
          id: string
          is_public: boolean | null
          mapping_name: string
          updated_at: string | null
        }
        Insert: {
          column_mapping?: Json
          company_name: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          mapping_name: string
          updated_at?: string | null
        }
        Update: {
          column_mapping?: Json
          company_name?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          mapping_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "csv_mappings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          appointment_time: string | null
          appointment_type: string | null
          city: string
          claim_number: string | null
          company_name: string
          completed_date: string | null
          created_at: string | null
          days_remaining: number | null
          description: string | null
          due_date: string | null
          duration_min: number | null
          fixed_appointment: string | null
          full_address: string | null
          geocode_status: string | null
          geocoded_city: string | null
          id: string
          inspection_type: string | null
          insured_name: string | null
          is_manual: boolean | null
          lat: number | null
          lng: number | null
          needs_call_ahead: boolean | null
          notes: string | null
          state: string | null
          status: string | null
          street: string
          updated_at: string | null
          upload_batch_id: string | null
          urgency: string | null
          urgency_tier: string | null
          user_id: string
          zip: string
        }
        Insert: {
          appointment_time?: string | null
          appointment_type?: string | null
          city: string
          claim_number?: string | null
          company_name: string
          completed_date?: string | null
          created_at?: string | null
          days_remaining?: number | null
          description?: string | null
          due_date?: string | null
          duration_min?: number | null
          fixed_appointment?: string | null
          full_address?: string | null
          geocode_status?: string | null
          geocoded_city?: string | null
          id?: string
          inspection_type?: string | null
          insured_name?: string | null
          is_manual?: boolean | null
          lat?: number | null
          lng?: number | null
          needs_call_ahead?: boolean | null
          notes?: string | null
          state?: string | null
          status?: string | null
          street: string
          updated_at?: string | null
          upload_batch_id?: string | null
          urgency?: string | null
          urgency_tier?: string | null
          user_id: string
          zip: string
        }
        Update: {
          appointment_time?: string | null
          appointment_type?: string | null
          city?: string
          claim_number?: string | null
          company_name?: string
          completed_date?: string | null
          created_at?: string | null
          days_remaining?: number | null
          description?: string | null
          due_date?: string | null
          duration_min?: number | null
          fixed_appointment?: string | null
          full_address?: string | null
          geocode_status?: string | null
          geocoded_city?: string | null
          id?: string
          inspection_type?: string | null
          insured_name?: string | null
          is_manual?: boolean | null
          lat?: number | null
          lng?: number | null
          needs_call_ahead?: boolean | null
          notes?: string | null
          state?: string | null
          status?: string | null
          street?: string
          updated_at?: string | null
          upload_batch_id?: string | null
          urgency?: string | null
          urgency_tier?: string | null
          user_id?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          fuel_cost_per_gallon: number | null
          home_address: string | null
          home_lat: number | null
          home_lng: number | null
          id: string
          name: string
          onboarding_completed: boolean | null
          phone: string | null
          referral_code: string | null
          referral_code_used: string | null
          referred_by: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_started: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          typical_end_time: string | null
          typical_hours_per_day: number | null
          typical_start_time: string | null
          updated_at: string | null
          vehicle_mpg: number | null
        }
        Insert: {
          created_at?: string | null
          email: string
          fuel_cost_per_gallon?: number | null
          home_address?: string | null
          home_lat?: number | null
          home_lng?: number | null
          id: string
          name: string
          onboarding_completed?: boolean | null
          phone?: string | null
          referral_code?: string | null
          referral_code_used?: string | null
          referred_by?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_started?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          typical_end_time?: string | null
          typical_hours_per_day?: number | null
          typical_start_time?: string | null
          updated_at?: string | null
          vehicle_mpg?: number | null
        }
        Update: {
          created_at?: string | null
          email?: string
          fuel_cost_per_gallon?: number | null
          home_address?: string | null
          home_lat?: number | null
          home_lng?: number | null
          id?: string
          name?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          referral_code?: string | null
          referral_code_used?: string | null
          referred_by?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_started?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          typical_end_time?: string | null
          typical_hours_per_day?: number | null
          typical_start_time?: string | null
          updated_at?: string | null
          vehicle_mpg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          applicable_tiers: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_tiers?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_tiers?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          company_name: string | null
          created_at: string | null
          discount_amount: number | null
          id: string
          is_active: boolean | null
          referrer_payout: number | null
          uses_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          company_name?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          is_active?: boolean | null
          referrer_payout?: number | null
          uses_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          company_name?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          is_active?: boolean | null
          referrer_payout?: number | null
          uses_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      referral_credits: {
        Row: {
          applied_at: string | null
          created_at: string | null
          credit_amount: number
          credit_type: string
          id: string
          paid_out_at: string | null
          referred_user_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string | null
          credit_amount: number
          credit_type: string
          id?: string
          paid_out_at?: string | null
          referred_user_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string | null
          credit_amount?: number
          credit_type?: string
          id?: string
          paid_out_at?: string | null
          referred_user_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_routes: {
        Row: {
          anchor_stop_id: string | null
          created_at: string | null
          day_of_week: number | null
          drive_hours: number | null
          exclusions: string[] | null
          finish_time: string | null
          fuel_cost: number | null
          hours_requested: number | null
          id: string
          location_filter: string | null
          notes: string | null
          original_request: string | null
          planning_session_id: string | null
          route_date: string
          route_name: string | null
          start_time: string | null
          status: string | null
          stops_count: number | null
          stops_json: Json | null
          total_hours: number | null
          total_miles: number | null
          updated_at: string | null
          user_id: string
          zones: string[] | null
        }
        Insert: {
          anchor_stop_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          drive_hours?: number | null
          exclusions?: string[] | null
          finish_time?: string | null
          fuel_cost?: number | null
          hours_requested?: number | null
          id?: string
          location_filter?: string | null
          notes?: string | null
          original_request?: string | null
          planning_session_id?: string | null
          route_date: string
          route_name?: string | null
          start_time?: string | null
          status?: string | null
          stops_count?: number | null
          stops_json?: Json | null
          total_hours?: number | null
          total_miles?: number | null
          updated_at?: string | null
          user_id: string
          zones?: string[] | null
        }
        Update: {
          anchor_stop_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          drive_hours?: number | null
          exclusions?: string[] | null
          finish_time?: string | null
          fuel_cost?: number | null
          hours_requested?: number | null
          id?: string
          location_filter?: string | null
          notes?: string | null
          original_request?: string | null
          planning_session_id?: string | null
          route_date?: string
          route_name?: string | null
          start_time?: string | null
          status?: string | null
          stops_count?: number | null
          stops_json?: Json | null
          total_hours?: number | null
          total_miles?: number | null
          updated_at?: string | null
          user_id?: string
          zones?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_routes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_events: {
        Row: {
          amount: number | null
          created_at: string | null
          created_by: string | null
          event_type: string
          from_status: string | null
          from_tier: string | null
          id: string
          notes: string | null
          to_status: string | null
          to_tier: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          created_by?: string | null
          event_type: string
          from_status?: string | null
          from_tier?: string | null
          id?: string
          notes?: string | null
          to_status?: string | null
          to_tier?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          created_by?: string | null
          event_type?: string
          from_status?: string | null
          from_tier?: string | null
          id?: string
          notes?: string | null
          to_status?: string | null
          to_tier?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          email: string
          id: string
          invited_at: string
          invited_by: string | null
          joined_at: string | null
          role: Database["public"]["Enums"]["team_role"]
          status: Database["public"]["Enums"]["team_member_status"]
          team_id: string
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          status?: Database["public"]["Enums"]["team_member_status"]
          team_id: string
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          status?: Database["public"]["Enums"]["team_member_status"]
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          seat_count: number
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          seat_count?: number
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          seat_count?: number
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_companies: {
        Row: {
          avg_inspection_minutes: number | null
          company_display_name: string | null
          company_id: string | null
          company_name: string
          created_at: string | null
          csv_mapping_id: string | null
          id: string
          is_active: boolean | null
          preferred_zones: string[] | null
          user_id: string
        }
        Insert: {
          avg_inspection_minutes?: number | null
          company_display_name?: string | null
          company_id?: string | null
          company_name: string
          created_at?: string | null
          csv_mapping_id?: string | null
          id?: string
          is_active?: boolean | null
          preferred_zones?: string[] | null
          user_id: string
        }
        Update: {
          avg_inspection_minutes?: number | null
          company_display_name?: string | null
          company_id?: string | null
          company_name?: string
          created_at?: string | null
          csv_mapping_id?: string | null
          id?: string
          is_active?: boolean | null
          preferred_zones?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_companies_csv_mapping_id_fkey"
            columns: ["csv_mapping_id"]
            isOneToOne: false
            referencedRelation: "csv_mappings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_company_settings: {
        Row: {
          company_code: string
          created_at: string | null
          duration_minutes: number | null
          high_value_duration_minutes: number | null
          id: string
          is_active: boolean | null
          user_id: string | null
        }
        Insert: {
          company_code: string
          created_at?: string | null
          duration_minutes?: number | null
          high_value_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          user_id?: string | null
        }
        Update: {
          company_code?: string
          created_at?: string | null
          duration_minutes?: number | null
          high_value_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          default_available_hours: number | null
          fuel_cost_per_gallon: number | null
          home_address: string
          home_city: string | null
          home_lat: number | null
          home_lng: number | null
          home_state: string | null
          home_zip: string | null
          id: string
          max_drive_minutes: number | null
          preferred_end_time: string | null
          preferred_start_time: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_mpg: number | null
        }
        Insert: {
          created_at?: string | null
          default_available_hours?: number | null
          fuel_cost_per_gallon?: number | null
          home_address: string
          home_city?: string | null
          home_lat?: number | null
          home_lng?: number | null
          home_state?: string | null
          home_zip?: string | null
          id?: string
          max_drive_minutes?: number | null
          preferred_end_time?: string | null
          preferred_start_time?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_mpg?: number | null
        }
        Update: {
          created_at?: string | null
          default_available_hours?: number | null
          fuel_cost_per_gallon?: number | null
          home_address?: string
          home_city?: string | null
          home_lat?: number | null
          home_lng?: number | null
          home_state?: string | null
          home_zip?: string | null
          id?: string
          max_drive_minutes?: number | null
          preferred_end_time?: string | null
          preferred_start_time?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_mpg?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      enable_company_for_user: {
        Args: {
          p_company_code: string
          p_custom_duration?: number
          p_custom_high_value?: number
          p_user_id: string
        }
        Returns: {
          company_code: string
          created_at: string | null
          duration_minutes: number | null
          high_value_duration_minutes: number | null
          id: string
          is_active: boolean | null
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "user_company_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_inspection_duration: {
        Args: {
          p_company_code: string
          p_is_high_value?: boolean
          p_user_id: string
        }
        Returns: number
      }
      get_or_create_user_profile: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string | null
          default_available_hours: number | null
          fuel_cost_per_gallon: number | null
          home_address: string
          home_city: string | null
          home_lat: number | null
          home_lng: number | null
          home_state: string | null
          home_zip: string | null
          id: string
          max_drive_minutes: number | null
          preferred_end_time: string | null
          preferred_start_time: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_mpg: number | null
        }
        SetofOptions: {
          from: "*"
          to: "user_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_user_team: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_app_admin: { Args: { _user_id: string }; Returns: boolean }
      is_team_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin" | "super_admin"
      team_member_status: "pending" | "active" | "inactive"
      team_role: "owner" | "admin" | "member"
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
      app_role: ["user", "admin", "super_admin"],
      team_member_status: ["pending", "active", "inactive"],
      team_role: ["owner", "admin", "member"],
    },
  },
} as const
