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
        Relationships: [
          {
            foreignKeyName: "admin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_affected_user_id_fkey"
            columns: ["affected_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      architecture_patterns: {
        Row: {
          avoid_when: string[] | null
          common_mistakes: string[] | null
          complexity: string | null
          created_at: string | null
          description: string
          example_node_types: Json | null
          example_workflow_id: string | null
          id: string
          name: string
          pattern_type: string
          performance_notes: string | null
          structure: Json
          updated_at: string | null
          use_when: string[] | null
        }
        Insert: {
          avoid_when?: string[] | null
          common_mistakes?: string[] | null
          complexity?: string | null
          created_at?: string | null
          description: string
          example_node_types?: Json | null
          example_workflow_id?: string | null
          id?: string
          name: string
          pattern_type: string
          performance_notes?: string | null
          structure: Json
          updated_at?: string | null
          use_when?: string[] | null
        }
        Update: {
          avoid_when?: string[] | null
          common_mistakes?: string[] | null
          complexity?: string | null
          created_at?: string | null
          description?: string
          example_node_types?: Json | null
          example_workflow_id?: string | null
          id?: string
          name?: string
          pattern_type?: string
          performance_notes?: string | null
          structure?: Json
          updated_at?: string | null
          use_when?: string[] | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "discovery_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          code: string
          created_at: string | null
          default_inspection_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          requires_appointment: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          default_inspection_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_appointment?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          default_inspection_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_appointment?: boolean | null
        }
        Relationships: []
      }
      credential_guides: {
        Row: {
          common_errors: Json | null
          console_url: string | null
          created_at: string | null
          credential_type: string
          difficulty: string | null
          display_name: string
          docs_url: string | null
          estimated_time_minutes: number | null
          id: string
          last_verified_at: string | null
          n8n_credential_type: string | null
          required_permissions: Json | null
          scope_requirements: Json | null
          service: string
          setup_steps: Json
          updated_at: string | null
        }
        Insert: {
          common_errors?: Json | null
          console_url?: string | null
          created_at?: string | null
          credential_type: string
          difficulty?: string | null
          display_name: string
          docs_url?: string | null
          estimated_time_minutes?: number | null
          id?: string
          last_verified_at?: string | null
          n8n_credential_type?: string | null
          required_permissions?: Json | null
          scope_requirements?: Json | null
          service: string
          setup_steps: Json
          updated_at?: string | null
        }
        Update: {
          common_errors?: Json | null
          console_url?: string | null
          created_at?: string | null
          credential_type?: string
          difficulty?: string | null
          display_name?: string
          docs_url?: string | null
          estimated_time_minutes?: number | null
          id?: string
          last_verified_at?: string | null
          n8n_credential_type?: string | null
          required_permissions?: Json | null
          scope_requirements?: Json | null
          service?: string
          setup_steps?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          credit_type: string
          description: string | null
          id: string
          session_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          credit_type: string
          description?: string | null
          id?: string
          session_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          credit_type?: string
          description?: string | null
          id?: string
          session_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "discovery_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      design_briefs: {
        Row: {
          content: string
          created_at: string | null
          id: string
          session_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          session_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          session_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_briefs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "discovery_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_sessions: {
        Row: {
          created_at: string
          customer_name: string | null
          id: string
          mece_state: Json | null
          phase: string | null
          project_id: string | null
          project_type: string | null
          session_name: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          id?: string
          mece_state?: Json | null
          phase?: string | null
          project_id?: string | null
          project_type?: string | null
          session_name?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          id?: string
          mece_state?: Json | null
          phase?: string | null
          project_id?: string | null
          project_type?: string | null
          session_name?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovery_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      expression_recipes: {
        Row: {
          category: string | null
          common_mistakes: string[] | null
          complexity: string | null
          created_at: string | null
          description: string
          expression: string
          id: string
          input_example: Json | null
          name: string
          output_example: string | null
          related_nodes: string[] | null
          updated_at: string | null
          use_case: string
        }
        Insert: {
          category?: string | null
          common_mistakes?: string[] | null
          complexity?: string | null
          created_at?: string | null
          description: string
          expression: string
          id?: string
          input_example?: Json | null
          name: string
          output_example?: string | null
          related_nodes?: string[] | null
          updated_at?: string | null
          use_case: string
        }
        Update: {
          category?: string | null
          common_mistakes?: string[] | null
          complexity?: string | null
          created_at?: string | null
          description?: string
          expression?: string
          id?: string
          input_example?: Json | null
          name?: string
          output_example?: string | null
          related_nodes?: string[] | null
          updated_at?: string | null
          use_case?: string
        }
        Relationships: []
      }
      n8n_changelog_monitor: {
        Row: {
          alerts_sent: boolean | null
          breaking_changes_found: boolean | null
          check_type: string
          checked_at: string
          created_at: string | null
          error_message: string | null
          id: string
          latest_version_found: string | null
          new_versions_found: string[] | null
          patterns_updated: number | null
          status: string | null
        }
        Insert: {
          alerts_sent?: boolean | null
          breaking_changes_found?: boolean | null
          check_type: string
          checked_at?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          latest_version_found?: string | null
          new_versions_found?: string[] | null
          patterns_updated?: number | null
          status?: string | null
        }
        Update: {
          alerts_sent?: boolean | null
          breaking_changes_found?: boolean | null
          check_type?: string
          checked_at?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          latest_version_found?: string | null
          new_versions_found?: string[] | null
          patterns_updated?: number | null
          status?: string | null
        }
        Relationships: []
      }
      n8n_community_patterns: {
        Row: {
          applies_to: string | null
          category: string
          code_example: string | null
          created_at: string | null
          deprecated_at: string | null
          embedding: string | null
          error_patterns: string[] | null
          id: string
          integration_pair: string[] | null
          is_active: boolean | null
          max_n8n_version: string | null
          min_n8n_version: string | null
          node_types: string[] | null
          problem: string
          severity: string | null
          solution: string
          source_type: string | null
          source_url: string | null
          subcategory: string | null
          title: string
          trigger_keywords: string[] | null
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          applies_to?: string | null
          category: string
          code_example?: string | null
          created_at?: string | null
          deprecated_at?: string | null
          embedding?: string | null
          error_patterns?: string[] | null
          id?: string
          integration_pair?: string[] | null
          is_active?: boolean | null
          max_n8n_version?: string | null
          min_n8n_version?: string | null
          node_types?: string[] | null
          problem: string
          severity?: string | null
          solution: string
          source_type?: string | null
          source_url?: string | null
          subcategory?: string | null
          title: string
          trigger_keywords?: string[] | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          applies_to?: string | null
          category?: string
          code_example?: string | null
          created_at?: string | null
          deprecated_at?: string | null
          embedding?: string | null
          error_patterns?: string[] | null
          id?: string
          integration_pair?: string[] | null
          is_active?: boolean | null
          max_n8n_version?: string | null
          min_n8n_version?: string | null
          node_types?: string[] | null
          problem?: string
          severity?: string | null
          solution?: string
          source_type?: string | null
          source_url?: string | null
          subcategory?: string | null
          title?: string
          trigger_keywords?: string[] | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: []
      }
      n8n_nodes_cache: {
        Row: {
          category: string | null
          codex_data: Json | null
          credentials: Json | null
          description: string | null
          display_name: string
          embedding: string | null
          is_action: boolean | null
          is_trigger: boolean | null
          latest_version: number | null
          node_type: string
          package_name: string | null
          properties: Json | null
          service_name: string | null
          subcategory: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          category?: string | null
          codex_data?: Json | null
          credentials?: Json | null
          description?: string | null
          display_name: string
          embedding?: string | null
          is_action?: boolean | null
          is_trigger?: boolean | null
          latest_version?: number | null
          node_type: string
          package_name?: string | null
          properties?: Json | null
          service_name?: string | null
          subcategory?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          category?: string | null
          codex_data?: Json | null
          credentials?: Json | null
          description?: string | null
          display_name?: string
          embedding?: string | null
          is_action?: boolean | null
          is_trigger?: boolean | null
          latest_version?: number | null
          node_type?: string
          package_name?: string | null
          properties?: Json | null
          service_name?: string | null
          subcategory?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      n8n_templates_cache: {
        Row: {
          categories: Json | null
          complexity_score: string | null
          created_at_source: string | null
          description: string | null
          embedding: string | null
          flon8_pattern: string | null
          functional_description: string | null
          functional_embedding: string | null
          name: string
          node_types: Json | null
          template_id: number
          total_views: number | null
          updated_at: string | null
          use_case_category: string | null
          user_name: string | null
          workflow_json: Json | null
        }
        Insert: {
          categories?: Json | null
          complexity_score?: string | null
          created_at_source?: string | null
          description?: string | null
          embedding?: string | null
          flon8_pattern?: string | null
          functional_description?: string | null
          functional_embedding?: string | null
          name: string
          node_types?: Json | null
          template_id: number
          total_views?: number | null
          updated_at?: string | null
          use_case_category?: string | null
          user_name?: string | null
          workflow_json?: Json | null
        }
        Update: {
          categories?: Json | null
          complexity_score?: string | null
          created_at_source?: string | null
          description?: string | null
          embedding?: string | null
          flon8_pattern?: string | null
          functional_description?: string | null
          functional_embedding?: string | null
          name?: string
          node_types?: Json | null
          template_id?: number
          total_views?: number | null
          updated_at?: string | null
          use_case_category?: string | null
          user_name?: string | null
          workflow_json?: Json | null
        }
        Relationships: []
      }
      n8n_version_tracking: {
        Row: {
          breaking_changes: Json | null
          created_at: string | null
          deprecated_nodes: Json | null
          discovered_at: string | null
          flon8_compatible: boolean | null
          flon8_notes: string | null
          flon8_tested_at: string | null
          id: string
          migration_completed_at: string | null
          migration_required: boolean | null
          migration_script: string | null
          new_features: Json | null
          new_nodes: Json | null
          release_date: string | null
          release_notes_url: string | null
          release_type: string | null
          updated_at: string | null
          version: string
          version_major: number
          version_minor: number
          version_patch: number
        }
        Insert: {
          breaking_changes?: Json | null
          created_at?: string | null
          deprecated_nodes?: Json | null
          discovered_at?: string | null
          flon8_compatible?: boolean | null
          flon8_notes?: string | null
          flon8_tested_at?: string | null
          id?: string
          migration_completed_at?: string | null
          migration_required?: boolean | null
          migration_script?: string | null
          new_features?: Json | null
          new_nodes?: Json | null
          release_date?: string | null
          release_notes_url?: string | null
          release_type?: string | null
          updated_at?: string | null
          version: string
          version_major: number
          version_minor: number
          version_patch: number
        }
        Update: {
          breaking_changes?: Json | null
          created_at?: string | null
          deprecated_nodes?: Json | null
          discovered_at?: string | null
          flon8_compatible?: boolean | null
          flon8_notes?: string | null
          flon8_tested_at?: string | null
          id?: string
          migration_completed_at?: string | null
          migration_required?: boolean | null
          migration_script?: string | null
          new_features?: Json | null
          new_nodes?: Json | null
          release_date?: string | null
          release_notes_url?: string | null
          release_type?: string | null
          updated_at?: string | null
          version?: string
          version_major?: number
          version_minor?: number
          version_patch?: number
        }
        Relationships: []
      }
      node_compatibility: {
        Row: {
          compatibility: string
          confidence: number | null
          created_at: string | null
          data_transform_required: boolean | null
          id: string
          node_type_a: string
          node_type_b: string
          notes: string | null
          occurrence_count: number | null
          source: string | null
          transform_pattern: string | null
          updated_at: string | null
        }
        Insert: {
          compatibility: string
          confidence?: number | null
          created_at?: string | null
          data_transform_required?: boolean | null
          id?: string
          node_type_a: string
          node_type_b: string
          notes?: string | null
          occurrence_count?: number | null
          source?: string | null
          transform_pattern?: string | null
          updated_at?: string | null
        }
        Update: {
          compatibility?: string
          confidence?: number | null
          created_at?: string | null
          data_transform_required?: boolean | null
          id?: string
          node_type_a?: string
          node_type_b?: string
          notes?: string | null
          occurrence_count?: number | null
          source?: string | null
          transform_pattern?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      node_equivalence: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          functional_role: string
          id: string
          node_types: string[]
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          functional_role: string
          id?: string
          node_types: string[]
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          functional_role?: string
          id?: string
          node_types?: string[]
        }
        Relationships: []
      }
      prds: {
        Row: {
          approved_at: string | null
          content: string
          created_at: string | null
          customer_approved: boolean | null
          id: string
          session_id: string
        }
        Insert: {
          approved_at?: string | null
          content: string
          created_at?: string | null
          customer_approved?: boolean | null
          id?: string
          session_id: string
        }
        Update: {
          approved_at?: string | null
          content?: string
          created_at?: string | null
          customer_approved?: boolean | null
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prds_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "discovery_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          fuel_cost_per_gallon: number | null
          home_address: string | null
          home_lat: number | null
          home_lng: number | null
          id: string
          name: string | null
          onboarding_completed: boolean | null
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          stripe_customer_id: string | null
          subscription_ends_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          typical_end_time: string | null
          typical_start_time: string | null
          updated_at: string | null
          vehicle_mpg: number | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          fuel_cost_per_gallon?: number | null
          home_address?: string | null
          home_lat?: number | null
          home_lng?: number | null
          id: string
          name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          stripe_customer_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          typical_end_time?: string | null
          typical_start_time?: string | null
          updated_at?: string | null
          vehicle_mpg?: number | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          fuel_cost_per_gallon?: number | null
          home_address?: string | null
          home_lat?: number | null
          home_lng?: number | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          stripe_customer_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          typical_end_time?: string | null
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
      project_workflows: {
        Row: {
          created_at: string
          credit_charged: boolean | null
          deployed_at: string | null
          description: string | null
          design_spec: Json | null
          id: string
          n8n_workflow_id: string | null
          name: string
          node_count: number | null
          project_id: string
          sequence_number: number
          status: string
          updated_at: string
          workflow_json: Json | null
        }
        Insert: {
          created_at?: string
          credit_charged?: boolean | null
          deployed_at?: string | null
          description?: string | null
          design_spec?: Json | null
          id?: string
          n8n_workflow_id?: string | null
          name: string
          node_count?: number | null
          project_id: string
          sequence_number?: number
          status?: string
          updated_at?: string
          workflow_json?: Json | null
        }
        Update: {
          created_at?: string
          credit_charged?: boolean | null
          deployed_at?: string | null
          description?: string | null
          design_spec?: Json | null
          id?: string
          n8n_workflow_id?: string | null
          name?: string
          node_count?: number | null
          project_id?: string
          sequence_number?: number
          status?: string
          updated_at?: string
          workflow_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "project_workflows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_workflows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          complexity: string | null
          created_at: string
          credits_estimated: number | null
          credits_used: number | null
          description: string | null
          id: string
          name: string
          services_identified: Json | null
          status: string
          updated_at: string
          user_id: string
          workflow_count_actual: number | null
          workflow_count_estimated: number | null
        }
        Insert: {
          complexity?: string | null
          created_at?: string
          credits_estimated?: number | null
          credits_used?: number | null
          description?: string | null
          id?: string
          name: string
          services_identified?: Json | null
          status?: string
          updated_at?: string
          user_id: string
          workflow_count_actual?: number | null
          workflow_count_estimated?: number | null
        }
        Update: {
          complexity?: string | null
          created_at?: string
          credits_estimated?: number | null
          credits_used?: number | null
          description?: string | null
          id?: string
          name?: string
          services_identified?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
          workflow_count_actual?: number | null
          workflow_count_estimated?: number | null
        }
        Relationships: []
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
          created_at: string
          day_of_week: number | null
          drive_hours: number | null
          exclusions: string[] | null
          finish_time: string | null
          fuel_cost: number | null
          hours_requested: number | null
          id: string
          inspection_hours: number | null
          location_filter: string | null
          notes: string | null
          original_request: string | null
          planning_session_id: string | null
          route_date: string
          route_name: string | null
          start_time: string | null
          status: string
          stops_count: number
          stops_json: Json
          total_hours: number | null
          total_miles: number | null
          updated_at: string
          user_id: string
          zones: string[] | null
        }
        Insert: {
          anchor_stop_id?: string | null
          created_at?: string
          day_of_week?: number | null
          drive_hours?: number | null
          exclusions?: string[] | null
          finish_time?: string | null
          fuel_cost?: number | null
          hours_requested?: number | null
          id?: string
          inspection_hours?: number | null
          location_filter?: string | null
          notes?: string | null
          original_request?: string | null
          planning_session_id?: string | null
          route_date: string
          route_name?: string | null
          start_time?: string | null
          status?: string
          stops_count?: number
          stops_json?: Json
          total_hours?: number | null
          total_miles?: number | null
          updated_at?: string
          user_id: string
          zones?: string[] | null
        }
        Update: {
          anchor_stop_id?: string | null
          created_at?: string
          day_of_week?: number | null
          drive_hours?: number | null
          exclusions?: string[] | null
          finish_time?: string | null
          fuel_cost?: number | null
          hours_requested?: number | null
          id?: string
          inspection_hours?: number | null
          location_filter?: string | null
          notes?: string | null
          original_request?: string | null
          planning_session_id?: string | null
          route_date?: string
          route_name?: string | null
          start_time?: string | null
          status?: string
          stops_count?: number
          stops_json?: Json
          total_hours?: number | null
          total_miles?: number | null
          updated_at?: string
          user_id?: string
          zones?: string[] | null
        }
        Relationships: []
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
      system_config: {
        Row: {
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      troubleshoot_turns: {
        Row: {
          ai_response: string
          created_at: string | null
          id: string
          issue_category: string | null
          resolved: boolean | null
          session_id: string
          turn_number: number
          user_issue: string
        }
        Insert: {
          ai_response: string
          created_at?: string | null
          id?: string
          issue_category?: string | null
          resolved?: boolean | null
          session_id: string
          turn_number: number
          user_issue: string
        }
        Update: {
          ai_response?: string
          created_at?: string | null
          id?: string
          issue_category?: string | null
          resolved?: boolean | null
          session_id?: string
          turn_number?: number
          user_issue?: string
        }
        Relationships: [
          {
            foreignKeyName: "troubleshoot_turns_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "discovery_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      use_case_keywords: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          frequency: number | null
          id: string
          keyword: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          frequency?: number | null
          id?: string
          keyword: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          frequency?: number | null
          id?: string
          keyword?: string
        }
        Relationships: []
      }
      user_companies: {
        Row: {
          avg_inspection_minutes: number | null
          company_id: string | null
          company_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          avg_inspection_minutes?: number | null
          company_id?: string | null
          company_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          avg_inspection_minutes?: number | null
          company_id?: string | null
          company_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
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
        ]
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
      users: {
        Row: {
          beta_notes: string | null
          build_credits: number | null
          build_total: number | null
          created_at: string
          email: string
          id: string
          is_admin: boolean | null
          is_beta_user: boolean | null
          last_active_at: string | null
          last_quota_reset: string
          manual_override_reason: string | null
          sessions_quota: number
          sessions_used_this_month: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string
          subscription_tier: string
          trial_used: boolean
        }
        Insert: {
          beta_notes?: string | null
          build_credits?: number | null
          build_total?: number | null
          created_at?: string
          email: string
          id: string
          is_admin?: boolean | null
          is_beta_user?: boolean | null
          last_active_at?: string | null
          last_quota_reset?: string
          manual_override_reason?: string | null
          sessions_quota?: number
          sessions_used_this_month?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          subscription_tier?: string
          trial_used?: boolean
        }
        Update: {
          beta_notes?: string | null
          build_credits?: number | null
          build_total?: number | null
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean | null
          is_beta_user?: boolean | null
          last_active_at?: string | null
          last_quota_reset?: string
          manual_override_reason?: string | null
          sessions_quota?: number
          sessions_used_this_month?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          subscription_tier?: string
          trial_used?: boolean
        }
        Relationships: []
      }
      workflow_error_patterns: {
        Row: {
          alternatives: Json | null
          auto_fix_available: boolean | null
          auto_fix_config: Json | null
          category: string
          confidence: string | null
          created_at: string | null
          diagnosis: string
          error_message_pattern: string
          error_signature: string
          id: string
          last_seen_at: string | null
          node_type: string | null
          times_auto_fixed: number | null
          times_seen: number | null
          updated_at: string | null
        }
        Insert: {
          alternatives?: Json | null
          auto_fix_available?: boolean | null
          auto_fix_config?: Json | null
          category: string
          confidence?: string | null
          created_at?: string | null
          diagnosis: string
          error_message_pattern: string
          error_signature: string
          id?: string
          last_seen_at?: string | null
          node_type?: string | null
          times_auto_fixed?: number | null
          times_seen?: number | null
          updated_at?: string | null
        }
        Update: {
          alternatives?: Json | null
          auto_fix_available?: boolean | null
          auto_fix_config?: Json | null
          category?: string
          confidence?: string | null
          created_at?: string | null
          diagnosis?: string
          error_message_pattern?: string
          error_signature?: string
          id?: string
          last_seen_at?: string | null
          node_type?: string | null
          times_auto_fixed?: number | null
          times_seen?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workflow_errors: {
        Row: {
          created_at: string | null
          error_details: Json | null
          error_message: string
          execution_data: Json | null
          execution_id: string
          fix_applied: string | null
          fix_source: string | null
          id: string
          node_name: string
          node_type: string
          pattern_id: string | null
          promoted_to_pattern: boolean | null
          session_id: string | null
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          error_message: string
          execution_data?: Json | null
          execution_id: string
          fix_applied?: string | null
          fix_source?: string | null
          id?: string
          node_name: string
          node_type: string
          pattern_id?: string | null
          promoted_to_pattern?: boolean | null
          session_id?: string | null
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          error_message?: string
          execution_data?: Json | null
          execution_id?: string
          fix_applied?: string | null
          fix_source?: string | null
          id?: string
          node_name?: string
          node_type?: string
          pattern_id?: string | null
          promoted_to_pattern?: boolean | null
          session_id?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_errors_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "workflow_error_patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_errors_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "discovery_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_validations: {
        Row: {
          auto_fixes_applied: Json | null
          created_at: string | null
          errors: Json | null
          id: string
          status: string
          validation_type: string
          warnings: Json | null
          workflow_id: string
        }
        Insert: {
          auto_fixes_applied?: Json | null
          created_at?: string | null
          errors?: Json | null
          id?: string
          status: string
          validation_type: string
          warnings?: Json | null
          workflow_id: string
        }
        Update: {
          auto_fixes_applied?: Json | null
          created_at?: string | null
          errors?: Json | null
          id?: string
          status?: string
          validation_type?: string
          warnings?: Json | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_validations_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string | null
          deploy_error: string | null
          deployed: boolean | null
          deployed_at: string | null
          downloaded: boolean | null
          downloaded_at: string | null
          id: string
          n8n_workflow_id: string | null
          session_id: string
          validation_status: string | null
          workflow_json: Json
          workflow_name: string
        }
        Insert: {
          created_at?: string | null
          deploy_error?: string | null
          deployed?: boolean | null
          deployed_at?: string | null
          downloaded?: boolean | null
          downloaded_at?: string | null
          id?: string
          n8n_workflow_id?: string | null
          session_id: string
          validation_status?: string | null
          workflow_json: Json
          workflow_name: string
        }
        Update: {
          created_at?: string | null
          deploy_error?: string | null
          deployed?: boolean | null
          deployed_at?: string | null
          downloaded?: boolean | null
          downloaded_at?: string | null
          id?: string
          n8n_workflow_id?: string | null
          session_id?: string
          validation_status?: string | null
          workflow_json?: Json
          workflow_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "discovery_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_patterns: {
        Row: {
          applies_to: string | null
          category: string | null
          code_example: string | null
          created_at: string | null
          deprecated_at: string | null
          error_patterns: string[] | null
          id: string | null
          integration_pair: string[] | null
          is_active: boolean | null
          max_n8n_version: string | null
          min_n8n_version: string | null
          node_types: string[] | null
          problem: string | null
          severity: string | null
          solution: string | null
          source_type: string | null
          source_url: string | null
          subcategory: string | null
          title: string | null
          trigger_keywords: string[] | null
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          applies_to?: string | null
          category?: string | null
          code_example?: string | null
          created_at?: string | null
          deprecated_at?: string | null
          error_patterns?: string[] | null
          id?: string | null
          integration_pair?: string[] | null
          is_active?: boolean | null
          max_n8n_version?: string | null
          min_n8n_version?: string | null
          node_types?: string[] | null
          problem?: string | null
          severity?: string | null
          solution?: string | null
          source_type?: string | null
          source_url?: string | null
          subcategory?: string | null
          title?: string | null
          trigger_keywords?: string[] | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          applies_to?: string | null
          category?: string | null
          code_example?: string | null
          created_at?: string | null
          deprecated_at?: string | null
          error_patterns?: string[] | null
          id?: string | null
          integration_pair?: string[] | null
          is_active?: boolean | null
          max_n8n_version?: string | null
          min_n8n_version?: string | null
          node_types?: string[] | null
          problem?: string | null
          severity?: string | null
          solution?: string | null
          source_type?: string | null
          source_url?: string | null
          subcategory?: string | null
          title?: string | null
          trigger_keywords?: string[] | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: []
      }
      project_summary: {
        Row: {
          complexity: string | null
          created_at: string | null
          credits_estimated: number | null
          credits_remaining: number | null
          credits_used: number | null
          id: string | null
          name: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          workflow_count_actual: number | null
          workflow_count_estimated: number | null
          workflows_built: number | null
          workflows_deployed: number | null
        }
        Insert: {
          complexity?: string | null
          created_at?: string | null
          credits_estimated?: number | null
          credits_remaining?: never
          credits_used?: number | null
          id?: string | null
          name?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          workflow_count_actual?: number | null
          workflow_count_estimated?: number | null
          workflows_built?: never
          workflows_deployed?: never
        }
        Update: {
          complexity?: string | null
          created_at?: string | null
          credits_estimated?: number | null
          credits_remaining?: never
          credits_used?: number | null
          id?: string | null
          name?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          workflow_count_actual?: number | null
          workflow_count_estimated?: number | null
          workflows_built?: never
          workflows_deployed?: never
        }
        Relationships: []
      }
      version_status: {
        Row: {
          breaking_change_count: number | null
          flon8_compatible: boolean | null
          flon8_tested_at: string | null
          release_date: string | null
          status: string | null
          version: string | null
        }
        Insert: {
          breaking_change_count?: never
          flon8_compatible?: boolean | null
          flon8_tested_at?: string | null
          release_date?: string | null
          status?: never
          version?: string | null
        }
        Update: {
          breaking_change_count?: never
          flon8_compatible?: boolean | null
          flon8_tested_at?: string | null
          release_date?: string | null
          status?: never
          version?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_workflow_to_project: {
        Args: { p_description?: string; p_name: string; p_project_id: string }
        Returns: string
      }
      check_node_compatibility: {
        Args: { p_node_a: string; p_node_b: string }
        Returns: {
          compatibility: string
          notes: string
          transform_pattern: string
          transform_required: boolean
        }[]
      }
      complete_workflow_build: {
        Args: {
          p_node_count?: number
          p_workflow_id: string
          p_workflow_json: Json
        }
        Returns: boolean
      }
      create_project_from_session: {
        Args: {
          p_name: string
          p_session_id: string
          p_workflow_count?: number
        }
        Returns: string
      }
      derive_complexity: { Args: { p_node_types: Json }; Returns: string }
      derive_use_case_category: {
        Args: { p_description: string; p_name: string }
        Returns: string
      }
      discover_templates_by_use_case: {
        Args: { p_complexity?: string; p_limit?: number; p_use_case: string }
        Returns: {
          complexity_score: string
          description: string
          name: string
          node_count: number
          relevance_score: number
          template_id: number
          use_case_category: string
        }[]
      }
      find_equivalent_nodes: {
        Args: { p_node_type: string }
        Returns: {
          category: string
          description: string
          equivalent_nodes: string[]
          functional_role: string
        }[]
      }
      find_matching_templates: {
        Args: {
          p_limit?: number
          p_service_types: string[]
          p_trigger_type?: string
        }
        Returns: {
          description: string
          match_score: number
          name: string
          node_count: number
          template_id: number
          workflow_json: Json
        }[]
      }
      find_templates_by_services: {
        Args: { p_service_names: string[] }
        Returns: {
          description: string
          match_score: number
          node_count: number
          nodes: Json
          popularity: number
          template_id: number
          template_name: string
          trigger_type: string
        }[]
      }
      get_build_patterns: {
        Args: { p_node_types: string[] }
        Returns: {
          category: string
          id: string
          node_types: string[]
          problem: string
          severity: string
          solution: string
          title: string
        }[]
      }
      get_credential_info: {
        Args: { p_node_type: string }
        Returns: {
          credential_count: number
          credential_types: Json
          has_oauth: boolean
          node_type: string
        }[]
      }
      get_node_embedding_text: {
        Args: { p_node_type: string }
        Returns: string
      }
      get_node_for_service: {
        Args: { service_name: string }
        Returns: {
          category: string
          description: string
          display_name: string
          is_trigger: boolean
          node_type: string
        }[]
      }
      get_node_full: {
        Args: { p_node_type: string }
        Returns: {
          category: string
          credentials: Json
          description: string
          display_name: string
          is_trigger: boolean
          latest_version: number
          node_type: string
          properties: Json
        }[]
      }
      get_nodes_full: {
        Args: { p_node_types: string[] }
        Returns: {
          credentials: Json
          description: string
          display_name: string
          is_trigger: boolean
          latest_version: number
          node_type: string
          properties: Json
        }[]
      }
      get_patterns_for_phase: {
        Args: { p_limit?: number; p_node_types?: string[]; p_phase: string }
        Returns: {
          category: string
          id: string
          problem: string
          severity: string
          solution: string
          source_url: string
          title: string
        }[]
      }
      get_relevant_patterns: {
        Args: {
          p_applies_to?: string
          p_integrations?: string[]
          p_node_types?: string[]
          p_severity?: string[]
        }
        Returns: {
          applies_to: string | null
          category: string
          code_example: string | null
          created_at: string | null
          deprecated_at: string | null
          embedding: string | null
          error_patterns: string[] | null
          id: string
          integration_pair: string[] | null
          is_active: boolean | null
          max_n8n_version: string | null
          min_n8n_version: string | null
          node_types: string[] | null
          problem: string
          severity: string | null
          solution: string
          source_type: string | null
          source_url: string | null
          subcategory: string | null
          title: string
          trigger_keywords: string[] | null
          updated_at: string | null
          upvotes: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "n8n_community_patterns"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_session_phase: { Args: { p_session_id: string }; Returns: string }
      get_template_embedding_text: {
        Args: { p_template_id: number }
        Returns: string
      }
      get_template_node_example: {
        Args: { p_node_type: string }
        Returns: {
          node_config: Json
          template_id: number
          template_name: string
          views: number
        }[]
      }
      get_troubleshoot_turn_count: {
        Args: { p_session_id: string }
        Returns: number
      }
      get_user_team: { Args: { _user_id: string }; Returns: string }
      get_weekly_workflow_count: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_app_admin: { Args: { _user_id: string }; Returns: boolean }
      is_team_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      log_credit_transaction: {
        Args: {
          p_amount: number
          p_credit_type: string
          p_description?: string
          p_session_id: string
          p_transaction_type: string
          p_user_id: string
        }
        Returns: {
          amount: number
          balance_after: number
          created_at: string | null
          credit_type: string
          description: string | null
          id: string
          session_id: string | null
          transaction_type: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "credit_transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      log_workflow_error: {
        Args: {
          p_error_details?: Json
          p_error_message: string
          p_execution_data?: Json
          p_execution_id: string
          p_node_name: string
          p_node_type: string
          p_session_id: string
          p_workflow_id: string
        }
        Returns: string
      }
      match_error_pattern: {
        Args: { p_error_message: string; p_node_type?: string }
        Returns: {
          alternatives: Json
          auto_fix_available: boolean
          auto_fix_config: Json
          confidence: string
          diagnosis: string
          error_signature: string
          pattern_id: string
        }[]
      }
      match_error_to_patterns: {
        Args: { p_error_message: string }
        Returns: {
          applies_to: string | null
          category: string
          code_example: string | null
          created_at: string | null
          deprecated_at: string | null
          embedding: string | null
          error_patterns: string[] | null
          id: string
          integration_pair: string[] | null
          is_active: boolean | null
          max_n8n_version: string | null
          min_n8n_version: string | null
          node_types: string[] | null
          problem: string
          severity: string | null
          solution: string
          source_type: string | null
          source_url: string | null
          subcategory: string | null
          title: string
          trigger_keywords: string[] | null
          updated_at: string | null
          upvotes: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "n8n_community_patterns"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      match_nodes_by_similarity: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_category?: string
          p_is_trigger?: boolean
          query_embedding: string
        }
        Returns: {
          category: string
          credentials: Json
          description: string
          display_name: string
          is_trigger: boolean
          latest_version: number
          node_type: string
          properties: Json
          similarity: number
        }[]
      }
      match_patterns_by_similarity: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_applies_to?: string
          p_category?: string
          query_embedding: string
        }
        Returns: {
          category: string
          code_example: string
          id: string
          node_types: string[]
          problem: string
          severity: string
          similarity: number
          solution: string
          source_url: string
          subcategory: string
          title: string
        }[]
      }
      match_templates_by_similarity: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          categories: Json
          description: string
          name: string
          node_types: Json
          similarity: number
          template_id: number
          total_views: number
          workflow_json: Json
        }[]
      }
      search_nodes: {
        Args: { limit_count?: number; query: string }
        Returns: {
          category: string
          description: string
          display_name: string
          is_trigger: boolean
          match_score: number
          node_type: string
        }[]
      }
      search_nodes_by_services: {
        Args: { service_names: string[] }
        Returns: {
          category: string
          description: string
          display_name: string
          is_trigger: boolean
          node_type: string
          service_name: string
        }[]
      }
      search_nodes_full: {
        Args: { p_services: string[] }
        Returns: {
          credentials: Json
          description: string
          display_name: string
          is_trigger: boolean
          latest_version: number
          node_type: string
          properties: Json
          service_name: string
        }[]
      }
      search_nodes_hybrid: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_node_types?: string[]
          p_service_names?: string[]
          query_embedding: string
        }
        Returns: {
          category: string
          credentials: Json
          description: string
          display_name: string
          exact_match: boolean
          is_trigger: boolean
          latest_version: number
          node_type: string
          properties: Json
          service_name: string
          similarity: number
        }[]
      }
      search_patterns_hybrid: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_error_keywords?: string[]
          p_node_types?: string[]
          query_embedding: string
        }
        Returns: {
          category: string
          code_example: string
          id: string
          keyword_match: boolean
          problem: string
          severity: string
          similarity: number
          solution: string
          source_url: string
          title: string
        }[]
      }
      search_templates: {
        Args: { p_limit?: number; p_node_types?: string[]; p_query?: string }
        Returns: {
          description: string
          name: string
          node_types: Json
          template_id: number
          total_views: number
        }[]
      }
      search_templates_hybrid: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_node_types?: string[]
          query_embedding: string
        }
        Returns: {
          categories: Json
          description: string
          name: string
          node_match_count: number
          node_types: Json
          similarity: number
          template_id: number
          total_views: number
          workflow_json: Json
        }[]
      }
      search_trigger_nodes: {
        Args: { trigger_hint: string }
        Returns: {
          description: string
          display_name: string
          node_type: string
        }[]
      }
      update_session_phase: {
        Args: { p_mece_state?: Json; p_new_phase: string; p_session_id: string }
        Returns: {
          created_at: string
          customer_name: string | null
          id: string
          mece_state: Json | null
          phase: string | null
          project_id: string | null
          project_type: string | null
          session_name: string | null
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "discovery_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "user" | "admin" | "super_admin"
      team_member_status: "pending" | "active" | "removed"
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
      team_member_status: ["pending", "active", "removed"],
      team_role: ["owner", "admin", "member"],
    },
  },
} as const
