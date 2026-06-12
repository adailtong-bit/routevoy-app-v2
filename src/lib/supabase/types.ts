// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
      ad_advertisers: {
        Row: {
          address_number: string | null
          city: string | null
          company_name: string
          contact_name: string | null
          contacts: Json | null
          created_at: string | null
          email: string | null
          environment: string
          id: string
          phone: string | null
          state: string | null
          status: string | null
          street: string | null
          tax_id: string | null
          zip: string | null
        }
        Insert: {
          address_number?: string | null
          city?: string | null
          company_name: string
          contact_name?: string | null
          contacts?: Json | null
          created_at?: string | null
          email?: string | null
          environment?: string
          id?: string
          phone?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          tax_id?: string | null
          zip?: string | null
        }
        Update: {
          address_number?: string | null
          city?: string | null
          company_name?: string
          contact_name?: string | null
          contacts?: Json | null
          created_at?: string | null
          email?: string | null
          environment?: string
          id?: string
          phone?: string | null
          state?: string | null
          status?: string | null
          street?: string | null
          tax_id?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      ad_campaigns: {
        Row: {
          advertiser_id: string | null
          billing_type: string | null
          budget: number | null
          category: string | null
          city: string | null
          clicks: number | null
          code: string | null
          company_id: string | null
          cost_per_click: number | null
          country: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          discount_percentage: number | null
          duration_days: number | null
          end_date: string | null
          environment: string
          franchise_id: string | null
          id: string
          image: string | null
          is_exclusive: boolean | null
          is_seasonal: boolean | null
          link: string | null
          original_price: number | null
          placement: string | null
          price: number | null
          priority_score: number | null
          promotion_model: string | null
          region: string | null
          reward_value: number | null
          start_date: string | null
          state: string | null
          status: string | null
          title: string
          trigger_threshold: number | null
          views: number | null
        }
        Insert: {
          advertiser_id?: string | null
          billing_type?: string | null
          budget?: number | null
          category?: string | null
          city?: string | null
          clicks?: number | null
          code?: string | null
          company_id?: string | null
          cost_per_click?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_percentage?: number | null
          duration_days?: number | null
          end_date?: string | null
          environment?: string
          franchise_id?: string | null
          id?: string
          image?: string | null
          is_exclusive?: boolean | null
          is_seasonal?: boolean | null
          link?: string | null
          original_price?: number | null
          placement?: string | null
          price?: number | null
          priority_score?: number | null
          promotion_model?: string | null
          region?: string | null
          reward_value?: number | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          title: string
          trigger_threshold?: number | null
          views?: number | null
        }
        Update: {
          advertiser_id?: string | null
          billing_type?: string | null
          budget?: number | null
          category?: string | null
          city?: string | null
          clicks?: number | null
          code?: string | null
          company_id?: string | null
          cost_per_click?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_percentage?: number | null
          duration_days?: number | null
          end_date?: string | null
          environment?: string
          franchise_id?: string | null
          id?: string
          image?: string | null
          is_exclusive?: boolean | null
          is_seasonal?: boolean | null
          link?: string | null
          original_price?: number | null
          placement?: string | null
          price?: number | null
          priority_score?: number | null
          promotion_model?: string | null
          region?: string | null
          reward_value?: number | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          title?: string
          trigger_threshold?: number | null
          views?: number | null
        }
        Relationships: []
      }
      ad_invoices: {
        Row: {
          ad_id: string | null
          advertiser_id: string | null
          amount: number
          created_at: string
          due_date: string
          environment: string
          id: string
          issue_date: string
          reference_number: string
          sent_at: string | null
          status: string
        }
        Insert: {
          ad_id?: string | null
          advertiser_id?: string | null
          amount: number
          created_at?: string
          due_date: string
          environment?: string
          id?: string
          issue_date?: string
          reference_number: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          ad_id?: string | null
          advertiser_id?: string | null
          amount?: number
          created_at?: string
          due_date?: string
          environment?: string
          id?: string
          issue_date?: string
          reference_number?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_invoices_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_invoices_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "ad_advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_pricing: {
        Row: {
          billing_type: string
          created_at: string
          duration_days: number | null
          environment: string
          id: string
          placement: string
          price: number
        }
        Insert: {
          billing_type: string
          created_at?: string
          duration_days?: number | null
          environment?: string
          id?: string
          placement: string
          price: number
        }
        Update: {
          billing_type?: string
          created_at?: string
          duration_days?: number | null
          environment?: string
          id?: string
          placement?: string
          price?: number
        }
        Relationships: []
      }
      affiliate_partners: {
        Row: {
          api_keys: Json | null
          commission_model: string | null
          commission_rate: number | null
          created_at: string | null
          email: string
          franchise_id: string | null
          id: string
          monthly_fee: number | null
          name: string
          platform_commissions: Json | null
          platform_ids: Json | null
          region: string | null
          region_id: string | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          api_keys?: Json | null
          commission_model?: string | null
          commission_rate?: number | null
          created_at?: string | null
          email: string
          franchise_id?: string | null
          id?: string
          monthly_fee?: number | null
          name: string
          platform_commissions?: Json | null
          platform_ids?: Json | null
          region?: string | null
          region_id?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          api_keys?: Json | null
          commission_model?: string | null
          commission_rate?: number | null
          created_at?: string | null
          email?: string
          franchise_id?: string | null
          id?: string
          monthly_fee?: number | null
          name?: string
          platform_commissions?: Json | null
          platform_ids?: Json | null
          region?: string | null
          region_id?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      affiliate_platforms: {
        Row: {
          base_commission_rate: number | null
          created_at: string | null
          id: string
          name: string
          status: string | null
        }
        Insert: {
          base_commission_rate?: number | null
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
        }
        Update: {
          base_commission_rate?: number | null
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      affiliate_transactions: {
        Row: {
          affiliate_earnings: number
          affiliate_id: string | null
          created_at: string | null
          id: string
          platform_fee: number
          product_name: string
          sale_amount: number
          status: string | null
          total_commission: number
        }
        Insert: {
          affiliate_earnings: number
          affiliate_id?: string | null
          created_at?: string | null
          id?: string
          platform_fee: number
          product_name: string
          sale_amount: number
          status?: string | null
          total_commission: number
        }
        Update: {
          affiliate_earnings?: number
          affiliate_id?: string | null
          created_at?: string | null
          id?: string
          platform_fee?: number
          product_name?: string
          sale_amount?: number
          status?: string | null
          total_commission?: number
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_transactions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_withdrawals: {
        Row: {
          affiliate_id: string | null
          amount: number
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: Json | null
          request_date: string | null
          status: string | null
        }
        Insert: {
          affiliate_id?: string | null
          amount: number
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: Json | null
          request_date?: string | null
          status?: string | null
        }
        Update: {
          affiliate_id?: string | null
          amount?: number
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: Json | null
          request_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_withdrawals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: string | null
          entity_id: string | null
          entity_type: string
          id: string
          status: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          status?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          status?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          label: string
          name: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          label: string
          name: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          label?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      commission_rules: {
        Row: {
          created_at: string
          franchise_id: string | null
          id: string
          percentage: number
          service_type: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          franchise_id?: string | null
          id?: string
          percentage: number
          service_type: string
          valid_from: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          franchise_id?: string | null
          id?: string
          percentage?: number
          service_type?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          category: string | null
          city: string | null
          code: string | null
          company_id: string | null
          country: string | null
          created_at: string | null
          description: string | null
          discount: string | null
          end_date: string | null
          environment: string
          franchise_id: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_verified: boolean | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          original_price: number | null
          price: number | null
          start_date: string | null
          state: string | null
          status: string | null
          store_name: string | null
          title: string
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          city?: string | null
          code?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          discount?: string | null
          end_date?: string | null
          environment?: string
          franchise_id?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          original_price?: number | null
          price?: number | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          store_name?: string | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          city?: string | null
          code?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          discount?: string | null
          end_date?: string | null
          environment?: string
          franchise_id?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          original_price?: number | null
          price?: number | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          store_name?: string | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      crawler_logs: {
        Row: {
          affiliate_id: string | null
          category: string | null
          company_id: string | null
          created_at: string | null
          date: string | null
          error_details: Json | null
          error_message: string | null
          franchise_id: string | null
          id: string
          items_found: number | null
          items_imported: number | null
          source_id: string | null
          status: string | null
          store_name: string | null
        }
        Insert: {
          affiliate_id?: string | null
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          date?: string | null
          error_details?: Json | null
          error_message?: string | null
          franchise_id?: string | null
          id?: string
          items_found?: number | null
          items_imported?: number | null
          source_id?: string | null
          status?: string | null
          store_name?: string | null
        }
        Update: {
          affiliate_id?: string | null
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          date?: string | null
          error_details?: Json | null
          error_message?: string | null
          franchise_id?: string | null
          id?: string
          items_found?: number | null
          items_imported?: number | null
          source_id?: string | null
          status?: string | null
          store_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crawler_logs_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crawler_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crawler_logs_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      crawler_sources: {
        Row: {
          affiliate_id: string | null
          category: string | null
          city: string | null
          company_id: string | null
          country: string | null
          created_at: string | null
          franchise_id: string | null
          id: string
          last_scan: string | null
          max_results: number | null
          name: string
          region: string | null
          scan_radius: number | null
          state: string | null
          status: string | null
          type: string | null
          url: string
        }
        Insert: {
          affiliate_id?: string | null
          category?: string | null
          city?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string | null
          franchise_id?: string | null
          id?: string
          last_scan?: string | null
          max_results?: number | null
          name: string
          region?: string | null
          scan_radius?: number | null
          state?: string | null
          status?: string | null
          type?: string | null
          url: string
        }
        Update: {
          affiliate_id?: string | null
          category?: string | null
          city?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string | null
          franchise_id?: string | null
          id?: string
          last_scan?: string | null
          max_results?: number | null
          name?: string
          region?: string | null
          scan_radius?: number | null
          state?: string | null
          status?: string | null
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "crawler_sources_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crawler_sources_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crawler_sources_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_campaigns: {
        Row: {
          affiliate_id: string | null
          channel: string
          clicks: number | null
          company_id: string | null
          content: string | null
          created_at: string | null
          franchise_id: string | null
          geographic_scope: string | null
          grouping_identifier: string | null
          id: string
          is_exclusive: boolean | null
          linked_offer_id: string | null
          name: string
          randomization_type: string | null
          randomization_value: number | null
          redemptions: number | null
          scheduled_at: string | null
          status: string | null
          target_group_id: string | null
        }
        Insert: {
          affiliate_id?: string | null
          channel: string
          clicks?: number | null
          company_id?: string | null
          content?: string | null
          created_at?: string | null
          franchise_id?: string | null
          geographic_scope?: string | null
          grouping_identifier?: string | null
          id?: string
          is_exclusive?: boolean | null
          linked_offer_id?: string | null
          name: string
          randomization_type?: string | null
          randomization_value?: number | null
          redemptions?: number | null
          scheduled_at?: string | null
          status?: string | null
          target_group_id?: string | null
        }
        Update: {
          affiliate_id?: string | null
          channel?: string
          clicks?: number | null
          company_id?: string | null
          content?: string | null
          created_at?: string | null
          franchise_id?: string | null
          geographic_scope?: string | null
          grouping_identifier?: string | null
          id?: string
          is_exclusive?: boolean | null
          linked_offer_id?: string | null
          name?: string
          randomization_type?: string | null
          randomization_value?: number | null
          redemptions?: number | null
          scheduled_at?: string | null
          status?: string | null
          target_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_campaigns_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_campaigns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_campaigns_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_campaigns_target_group_id_fkey"
            columns: ["target_group_id"]
            isOneToOne: false
            referencedRelation: "crm_target_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_target_groups: {
        Row: {
          affiliate_id: string | null
          company_id: string | null
          created_at: string | null
          description: string | null
          filters: Json | null
          franchise_id: string | null
          id: string
          lead_count: number | null
          name: string
        }
        Insert: {
          affiliate_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          filters?: Json | null
          franchise_id?: string | null
          id?: string
          lead_count?: number | null
          name: string
        }
        Update: {
          affiliate_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          filters?: Json | null
          franchise_id?: string | null
          id?: string
          lead_count?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_target_groups_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_target_groups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_target_groups_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      discovered_promotions: {
        Row: {
          affiliate_id: string | null
          alert_radius: number | null
          campaign_name: string | null
          captured_at: string | null
          category: string | null
          city: string | null
          code: string | null
          company_id: string | null
          country: string | null
          coverage: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          discount: string | null
          discount_percentage: number | null
          discount_rules: string | null
          enable_proximity_alerts: boolean | null
          enable_trigger: boolean | null
          end_date: string | null
          engagement_threshold: number | null
          environment: string
          id: string
          image_url: string | null
          is_agenda_only: boolean | null
          is_featured: boolean | null
          is_seasonal: boolean | null
          is_verified: boolean | null
          latitude: number | null
          limit_type: string | null
          location_name: string | null
          longitude: number | null
          original_price: number | null
          price: number | null
          product_link: string | null
          promotion_model: string | null
          reward_description: string | null
          reward_id: string | null
          reward_scope: string | null
          reward_type: string | null
          reward_value: number | null
          source_url: string | null
          start_date: string | null
          state: string | null
          status: string | null
          store_name: string | null
          title: string
          total_limit: number | null
          trigger_threshold: number | null
          trigger_type: string | null
          unique_hash: string | null
          usage_count: number | null
        }
        Insert: {
          affiliate_id?: string | null
          alert_radius?: number | null
          campaign_name?: string | null
          captured_at?: string | null
          category?: string | null
          city?: string | null
          code?: string | null
          company_id?: string | null
          country?: string | null
          coverage?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount?: string | null
          discount_percentage?: number | null
          discount_rules?: string | null
          enable_proximity_alerts?: boolean | null
          enable_trigger?: boolean | null
          end_date?: string | null
          engagement_threshold?: number | null
          environment?: string
          id?: string
          image_url?: string | null
          is_agenda_only?: boolean | null
          is_featured?: boolean | null
          is_seasonal?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          limit_type?: string | null
          location_name?: string | null
          longitude?: number | null
          original_price?: number | null
          price?: number | null
          product_link?: string | null
          promotion_model?: string | null
          reward_description?: string | null
          reward_id?: string | null
          reward_scope?: string | null
          reward_type?: string | null
          reward_value?: number | null
          source_url?: string | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          store_name?: string | null
          title: string
          total_limit?: number | null
          trigger_threshold?: number | null
          trigger_type?: string | null
          unique_hash?: string | null
          usage_count?: number | null
        }
        Update: {
          affiliate_id?: string | null
          alert_radius?: number | null
          campaign_name?: string | null
          captured_at?: string | null
          category?: string | null
          city?: string | null
          code?: string | null
          company_id?: string | null
          country?: string | null
          coverage?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount?: string | null
          discount_percentage?: number | null
          discount_rules?: string | null
          enable_proximity_alerts?: boolean | null
          enable_trigger?: boolean | null
          end_date?: string | null
          engagement_threshold?: number | null
          environment?: string
          id?: string
          image_url?: string | null
          is_agenda_only?: boolean | null
          is_featured?: boolean | null
          is_seasonal?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          limit_type?: string | null
          location_name?: string | null
          longitude?: number | null
          original_price?: number | null
          price?: number | null
          product_link?: string | null
          promotion_model?: string | null
          reward_description?: string | null
          reward_id?: string | null
          reward_scope?: string | null
          reward_type?: string | null
          reward_value?: number | null
          source_url?: string | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          store_name?: string | null
          title?: string
          total_limit?: number | null
          trigger_threshold?: number | null
          trigger_type?: string | null
          unique_hash?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "discovered_promotions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          provider: string
          recipient: string
          status: string
          subject: string
          type: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          provider: string
          recipient: string
          status: string
          subject: string
          type: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          provider?: string
          recipient?: string
          status?: string
          subject?: string
          type?: string
        }
        Relationships: []
      }
      financial_ledger: {
        Row: {
          affiliate_id: string | null
          amount: number
          category: string | null
          company_id: string | null
          created_at: string
          description: string
          franchise_id: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          status: string
          transaction_date: string
          type: string
          user_id: string | null
        }
        Insert: {
          affiliate_id?: string | null
          amount: number
          category?: string | null
          company_id?: string | null
          created_at?: string
          description: string
          franchise_id?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          transaction_date?: string
          type: string
          user_id?: string | null
        }
        Update: {
          affiliate_id?: string | null
          amount?: number
          category?: string | null
          company_id?: string | null
          created_at?: string
          description?: string
          franchise_id?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          transaction_date?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_ledger_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_ledger_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      franchises: {
        Row: {
          address_country: string | null
          country: string | null
          coverage_cities: Json | null
          coverage_scope: string | null
          coverage_states: Json | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          region: string | null
          region_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address_country?: string | null
          country?: string | null
          coverage_cities?: Json | null
          coverage_scope?: string | null
          coverage_states?: Json | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          region?: string | null
          region_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address_country?: string | null
          country?: string | null
          coverage_cities?: Json | null
          coverage_scope?: string | null
          coverage_states?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          region?: string | null
          region_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      itineraries: {
        Row: {
          created_at: string
          description: string | null
          destination: string | null
          end_date: string | null
          id: string
          start_date: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          destination?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          destination?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      itinerary_items: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          itinerary_id: string
          reference_id: string | null
          start_time: string | null
          title: string
          type: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          itinerary_id: string
          reference_id?: string | null
          start_time?: string | null
          title: string
          type: string
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          itinerary_id?: string
          reference_id?: string | null
          start_time?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_items_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_country: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          billing_email: string | null
          billing_name: string | null
          business_phone: string | null
          contacts: Json | null
          country: string | null
          created_at: string | null
          email: string | null
          franchise_id: string | null
          id: string
          name: string | null
          region: string | null
          region_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_country?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          billing_email?: string | null
          billing_name?: string | null
          business_phone?: string | null
          contacts?: Json | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          franchise_id?: string | null
          id: string
          name?: string | null
          region?: string | null
          region_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_country?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          billing_email?: string | null
          billing_name?: string | null
          business_phone?: string | null
          contacts?: Json | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          franchise_id?: string | null
          id?: string
          name?: string | null
          region?: string | null
          region_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birthday: string | null
          city: string | null
          company_id: string | null
          created_at: string | null
          email: string
          franchise_id: string | null
          gender: string | null
          id: string
          is_affiliate: boolean | null
          is_vip: boolean | null
          last_search_context: Json | null
          name: string | null
          phone: string | null
          role: string | null
          state: string | null
          tax_id: string | null
        }
        Insert: {
          birthday?: string | null
          city?: string | null
          company_id?: string | null
          created_at?: string | null
          email: string
          franchise_id?: string | null
          gender?: string | null
          id: string
          is_affiliate?: boolean | null
          is_vip?: boolean | null
          last_search_context?: Json | null
          name?: string | null
          phone?: string | null
          role?: string | null
          state?: string | null
          tax_id?: string | null
        }
        Update: {
          birthday?: string | null
          city?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string
          franchise_id?: string | null
          gender?: string | null
          id?: string
          is_affiliate?: boolean | null
          is_vip?: boolean | null
          last_search_context?: Json | null
          name?: string | null
          phone?: string | null
          role?: string | null
          state?: string | null
          tax_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      site_mappings: {
        Row: {
          created_at: string
          domain: string
          id: string
          mapping_rules: Json
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          mapping_rules?: Json
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          mapping_rules?: Json
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_engagements: {
        Row: {
          action_type: string
          campaign_id: string | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          campaign_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_ad_campaign_access: {
        Args: { p_company_id: string }
        Returns: boolean
      }
      check_ad_invoice_access: {
        Args: { p_ad_id: string; p_advertiser_id: string }
        Returns: boolean
      }
      consume_promotion: {
        Args: { p_promo_id: string; p_user_id: string }
        Returns: Json
      }
      update_itinerary_dates: {
        Args: {
          p_description?: string
          p_destination?: string
          p_itinerary_id: string
          p_new_end_date: string
          p_new_start_date: string
          p_title?: string
        }
        Returns: Json
      }
      validate_promotion: { Args: { p_promo_id: string }; Returns: Json }
      validate_promotion_by_code: { Args: { p_code: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: ad_advertisers
//   id: uuid (not null, default: gen_random_uuid())
//   company_name: text (not null)
//   contact_name: text (nullable)
//   email: text (nullable)
//   phone: text (nullable)
//   status: text (nullable, default: 'active'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   tax_id: text (nullable)
//   street: text (nullable)
//   address_number: text (nullable)
//   city: text (nullable)
//   state: text (nullable)
//   zip: text (nullable)
//   environment: text (not null, default: 'production'::text)
//   contacts: jsonb (nullable, default: '[]'::jsonb)
// Table: ad_campaigns
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   company_id: uuid (nullable)
//   advertiser_id: text (nullable)
//   region: text (nullable)
//   category: text (nullable)
//   billing_type: text (nullable)
//   placement: text (nullable)
//   status: text (nullable, default: 'active'::text)
//   views: integer (nullable, default: 0)
//   clicks: integer (nullable, default: 0)
//   start_date: timestamp with time zone (nullable)
//   end_date: timestamp with time zone (nullable)
//   image: text (nullable)
//   link: text (nullable)
//   price: numeric (nullable)
//   budget: numeric (nullable)
//   cost_per_click: numeric (nullable)
//   currency: text (nullable, default: 'BRL'::text)
//   duration_days: integer (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   environment: text (not null, default: 'production'::text)
//   description: text (nullable)
//   priority_score: integer (nullable, default: 0)
//   country: text (nullable)
//   state: text (nullable)
//   city: text (nullable)
//   is_seasonal: boolean (nullable, default: false)
//   original_price: numeric (nullable)
//   discount_percentage: numeric (nullable)
//   code: text (nullable)
//   promotion_model: text (nullable, default: 'standard'::text)
//   trigger_threshold: numeric (nullable)
//   reward_value: numeric (nullable)
//   is_exclusive: boolean (nullable, default: false)
//   franchise_id: text (nullable)
// Table: ad_invoices
//   id: uuid (not null, default: gen_random_uuid())
//   reference_number: text (not null)
//   ad_id: uuid (nullable)
//   advertiser_id: uuid (nullable)
//   amount: numeric (not null)
//   issue_date: timestamp with time zone (not null, default: now())
//   due_date: timestamp with time zone (not null)
//   sent_at: timestamp with time zone (nullable)
//   status: text (not null, default: 'draft'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   environment: text (not null, default: 'production'::text)
// Table: ad_pricing
//   id: uuid (not null, default: gen_random_uuid())
//   placement: text (not null)
//   billing_type: text (not null)
//   duration_days: integer (nullable)
//   price: numeric (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   environment: text (not null, default: 'production'::text)
// Table: affiliate_partners
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   email: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   commission_model: text (nullable, default: 'percentage'::text)
//   commission_rate: numeric (nullable, default: 30.0)
//   monthly_fee: numeric (nullable, default: 0.0)
//   api_keys: jsonb (nullable, default: '{}'::jsonb)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   user_id: uuid (nullable)
//   region: text (nullable)
//   region_id: text (nullable)
//   platform_commissions: jsonb (nullable, default: '{}'::jsonb)
//   platform_ids: jsonb (nullable, default: '{}'::jsonb)
//   tax_id: text (nullable)
//   franchise_id: text (nullable)
// Table: affiliate_platforms
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   status: text (nullable, default: 'active'::text)
//   base_commission_rate: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: affiliate_transactions
//   id: uuid (not null, default: gen_random_uuid())
//   affiliate_id: uuid (nullable)
//   product_name: text (not null)
//   sale_amount: numeric (not null)
//   total_commission: numeric (not null)
//   platform_fee: numeric (not null)
//   affiliate_earnings: numeric (not null)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: affiliate_withdrawals
//   id: uuid (not null, default: gen_random_uuid())
//   affiliate_id: uuid (nullable)
//   amount: numeric (not null)
//   status: text (nullable, default: 'pending'::text)
//   request_date: timestamp with time zone (nullable, default: now())
//   payment_date: timestamp with time zone (nullable)
//   payment_method: jsonb (nullable, default: '{}'::jsonb)
//   notes: text (nullable)
// Table: audit_logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   user_email: text (nullable)
//   action: text (not null)
//   entity_type: text (not null)
//   entity_id: text (nullable)
//   details: text (nullable)
//   status: text (nullable, default: 'success'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: categories
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   label: text (not null)
//   icon: text (nullable)
//   status: text (nullable, default: 'active'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: commission_rules
//   id: uuid (not null, default: gen_random_uuid())
//   franchise_id: text (nullable)
//   service_type: text (not null)
//   percentage: numeric (not null)
//   valid_from: timestamp with time zone (not null)
//   valid_until: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: coupons
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   description: text (nullable)
//   discount: text (nullable)
//   price: numeric (nullable)
//   original_price: numeric (nullable)
//   image_url: text (nullable)
//   store_name: text (nullable)
//   category: text (nullable)
//   start_date: timestamp with time zone (nullable)
//   end_date: timestamp with time zone (nullable)
//   latitude: numeric (nullable)
//   longitude: numeric (nullable)
//   location_name: text (nullable)
//   status: text (nullable, default: 'active'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   user_id: uuid (nullable)
//   environment: text (not null, default: 'production'::text)
//   usage_count: integer (nullable, default: 0)
//   is_verified: boolean (nullable, default: false)
//   is_featured: boolean (nullable, default: false)
//   code: text (nullable)
//   country: text (nullable)
//   state: text (nullable)
//   city: text (nullable)
//   company_id: uuid (nullable)
//   franchise_id: text (nullable)
// Table: crawler_logs
//   id: uuid (not null, default: gen_random_uuid())
//   date: timestamp with time zone (nullable, default: now())
//   store_name: text (nullable)
//   status: text (nullable)
//   items_found: integer (nullable, default: 0)
//   items_imported: integer (nullable, default: 0)
//   source_id: text (nullable)
//   error_message: text (nullable)
//   error_details: jsonb (nullable)
//   category: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   franchise_id: text (nullable)
//   company_id: text (nullable)
//   affiliate_id: uuid (nullable)
// Table: crawler_sources
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   url: text (not null)
//   type: text (nullable, default: 'web'::text)
//   region: text (nullable)
//   country: text (nullable)
//   state: text (nullable)
//   city: text (nullable)
//   scan_radius: numeric (nullable)
//   status: text (nullable, default: 'active'::text)
//   last_scan: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   category: text (nullable)
//   max_results: integer (nullable, default: 200)
//   franchise_id: text (nullable)
//   company_id: text (nullable)
//   affiliate_id: uuid (nullable)
// Table: crm_campaigns
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: text (nullable)
//   franchise_id: text (nullable)
//   name: text (not null)
//   target_group_id: uuid (nullable)
//   channel: text (not null)
//   geographic_scope: text (nullable)
//   randomization_type: text (nullable)
//   randomization_value: integer (nullable)
//   content: text (nullable)
//   is_exclusive: boolean (nullable, default: false)
//   grouping_identifier: text (nullable)
//   linked_offer_id: uuid (nullable)
//   status: text (nullable, default: 'active'::text)
//   scheduled_at: timestamp with time zone (nullable)
//   clicks: integer (nullable, default: 0)
//   redemptions: integer (nullable, default: 0)
//   created_at: timestamp with time zone (nullable, default: now())
//   affiliate_id: uuid (nullable)
// Table: crm_target_groups
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: text (nullable)
//   franchise_id: text (nullable)
//   name: text (not null)
//   description: text (nullable)
//   filters: jsonb (nullable)
//   lead_count: integer (nullable, default: 0)
//   created_at: timestamp with time zone (nullable, default: now())
//   affiliate_id: uuid (nullable)
// Table: discovered_promotions
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   description: text (nullable)
//   price: numeric (nullable)
//   original_price: numeric (nullable)
//   currency: text (nullable, default: 'BRL'::text)
//   discount: text (nullable)
//   discount_percentage: numeric (nullable)
//   image_url: text (nullable)
//   product_link: text (nullable)
//   source_url: text (nullable)
//   store_name: text (nullable)
//   category: text (nullable)
//   country: text (nullable)
//   status: text (nullable, default: 'pending'::text)
//   captured_at: timestamp with time zone (nullable, default: now())
//   created_at: timestamp with time zone (nullable, default: now())
//   campaign_name: text (nullable)
//   coverage: text (nullable, default: 'toda a rede'::text)
//   discount_rules: text (nullable, default: 'percentual'::text)
//   start_date: timestamp with time zone (nullable)
//   end_date: timestamp with time zone (nullable)
//   limit_type: text (nullable)
//   total_limit: integer (nullable)
//   enable_proximity_alerts: boolean (nullable, default: false)
//   alert_radius: numeric (nullable)
//   is_seasonal: boolean (nullable, default: false)
//   enable_trigger: boolean (nullable, default: false)
//   trigger_type: text (nullable)
//   trigger_threshold: numeric (nullable)
//   reward_id: text (nullable)
//   company_id: text (nullable)
//   unique_hash: text (nullable)
//   environment: text (not null, default: 'production'::text)
//   usage_count: integer (nullable, default: 0)
//   is_verified: boolean (nullable, default: false)
//   is_featured: boolean (nullable, default: false)
//   code: text (nullable)
//   latitude: numeric (nullable)
//   longitude: numeric (nullable)
//   location_name: text (nullable)
//   state: text (nullable)
//   city: text (nullable)
//   is_agenda_only: boolean (nullable, default: false)
//   engagement_threshold: integer (nullable)
//   reward_type: text (nullable)
//   reward_value: numeric (nullable)
//   reward_description: text (nullable)
//   reward_scope: text (nullable)
//   promotion_model: text (nullable, default: 'standard'::text)
//   affiliate_id: uuid (nullable)
// Table: email_logs
//   id: uuid (not null, default: gen_random_uuid())
//   recipient: text (not null)
//   subject: text (not null)
//   type: text (not null)
//   status: text (not null)
//   provider: text (not null)
//   error_message: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: financial_ledger
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: text (nullable)
//   franchise_id: text (nullable)
//   affiliate_id: uuid (nullable)
//   user_id: uuid (nullable)
//   transaction_date: timestamp with time zone (not null, default: now())
//   description: text (not null)
//   category: text (nullable)
//   amount: numeric (not null)
//   type: text (not null)
//   status: text (not null, default: 'completed'::text)
//   reference_id: uuid (nullable)
//   reference_type: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: franchises
//   id: text (not null)
//   name: text (nullable)
//   email: text (nullable)
//   region: text (nullable)
//   region_id: text (nullable)
//   country: text (nullable)
//   address_country: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   coverage_scope: text (nullable, default: 'national'::text)
//   coverage_states: jsonb (nullable, default: '[]'::jsonb)
//   coverage_cities: jsonb (nullable, default: '[]'::jsonb)
//   status: text (nullable, default: 'active'::text)
// Table: itineraries
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   title: text (not null)
//   destination: text (nullable)
//   start_date: timestamp with time zone (nullable)
//   end_date: timestamp with time zone (nullable)
//   description: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: itinerary_items
//   id: uuid (not null, default: gen_random_uuid())
//   itinerary_id: uuid (not null)
//   type: text (not null)
//   title: text (not null)
//   description: text (nullable)
//   start_time: timestamp with time zone (nullable)
//   end_time: timestamp with time zone (nullable)
//   reference_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   address: text (nullable)
// Table: merchants
//   id: text (not null)
//   name: text (nullable)
//   email: text (nullable)
//   business_phone: text (nullable)
//   region: text (nullable)
//   region_id: text (nullable)
//   country: text (nullable)
//   address_country: text (nullable)
//   address_state: text (nullable)
//   address_city: text (nullable)
//   address_zip: text (nullable)
//   address_street: text (nullable)
//   address_number: text (nullable)
//   address_complement: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   status: text (nullable, default: 'active'::text)
//   billing_email: text (nullable)
//   billing_name: text (nullable)
//   contacts: jsonb (nullable, default: '[]'::jsonb)
//   franchise_id: text (nullable)
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (nullable)
//   role: text (nullable, default: 'user'::text)
//   is_affiliate: boolean (nullable, default: false)
//   created_at: timestamp with time zone (nullable, default: now())
//   tax_id: text (nullable)
//   last_search_context: jsonb (nullable, default: '{}'::jsonb)
//   is_vip: boolean (nullable, default: false)
//   gender: text (nullable)
//   birthday: date (nullable)
//   city: text (nullable)
//   state: text (nullable)
//   phone: text (nullable)
//   company_id: text (nullable)
//   franchise_id: text (nullable)
// Table: site_mappings
//   id: uuid (not null, default: gen_random_uuid())
//   domain: text (not null)
//   name: text (not null)
//   mapping_rules: jsonb (not null, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: site_settings
//   id: uuid (not null, default: gen_random_uuid())
//   key: text (not null)
//   value: jsonb (not null, default: '{}'::jsonb)
//   updated_at: timestamp with time zone (not null, default: now())
// Table: user_engagements
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   campaign_id: uuid (nullable)
//   action_type: text (not null)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: ad_advertisers
//   PRIMARY KEY ad_advertisers_pkey: PRIMARY KEY (id)
// Table: ad_campaigns
//   PRIMARY KEY ad_campaigns_pkey: PRIMARY KEY (id)
// Table: ad_invoices
//   FOREIGN KEY ad_invoices_ad_id_fkey: FOREIGN KEY (ad_id) REFERENCES ad_campaigns(id) ON DELETE CASCADE
//   FOREIGN KEY ad_invoices_advertiser_id_fkey: FOREIGN KEY (advertiser_id) REFERENCES ad_advertisers(id) ON DELETE CASCADE
//   PRIMARY KEY ad_invoices_pkey: PRIMARY KEY (id)
// Table: ad_pricing
//   PRIMARY KEY ad_pricing_pkey: PRIMARY KEY (id)
// Table: affiliate_partners
//   UNIQUE affiliate_partners_email_key: UNIQUE (email)
//   PRIMARY KEY affiliate_partners_pkey: PRIMARY KEY (id)
//   FOREIGN KEY affiliate_partners_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: affiliate_platforms
//   UNIQUE affiliate_platforms_name_key: UNIQUE (name)
//   PRIMARY KEY affiliate_platforms_pkey: PRIMARY KEY (id)
// Table: affiliate_transactions
//   FOREIGN KEY affiliate_transactions_affiliate_id_fkey: FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE CASCADE
//   PRIMARY KEY affiliate_transactions_pkey: PRIMARY KEY (id)
// Table: affiliate_withdrawals
//   FOREIGN KEY affiliate_withdrawals_affiliate_id_fkey: FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE CASCADE
//   PRIMARY KEY affiliate_withdrawals_pkey: PRIMARY KEY (id)
// Table: audit_logs
//   PRIMARY KEY audit_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY audit_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: categories
//   UNIQUE categories_name_key: UNIQUE (name)
//   PRIMARY KEY categories_pkey: PRIMARY KEY (id)
// Table: commission_rules
//   FOREIGN KEY commission_rules_franchise_id_fkey: FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
//   CHECK commission_rules_percentage_check: CHECK (((percentage >= (0)::numeric) AND (percentage <= (100)::numeric)))
//   PRIMARY KEY commission_rules_pkey: PRIMARY KEY (id)
//   CHECK commission_rules_service_type_check: CHECK ((service_type = ANY (ARRAY['publicidade'::text, 'impulsionamento'::text])))
// Table: coupons
//   PRIMARY KEY coupons_pkey: PRIMARY KEY (id)
//   FOREIGN KEY coupons_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: crawler_logs
//   FOREIGN KEY crawler_logs_affiliate_id_fkey: FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE CASCADE
//   FOREIGN KEY crawler_logs_company_id_fkey: FOREIGN KEY (company_id) REFERENCES merchants(id) ON DELETE CASCADE
//   FOREIGN KEY crawler_logs_franchise_id_fkey: FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
//   PRIMARY KEY crawler_logs_pkey: PRIMARY KEY (id)
// Table: crawler_sources
//   FOREIGN KEY crawler_sources_affiliate_id_fkey: FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE CASCADE
//   FOREIGN KEY crawler_sources_company_id_fkey: FOREIGN KEY (company_id) REFERENCES merchants(id) ON DELETE CASCADE
//   FOREIGN KEY crawler_sources_franchise_id_fkey: FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
//   PRIMARY KEY crawler_sources_pkey: PRIMARY KEY (id)
// Table: crm_campaigns
//   FOREIGN KEY crm_campaigns_affiliate_id_fkey: FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE CASCADE
//   FOREIGN KEY crm_campaigns_company_id_fkey: FOREIGN KEY (company_id) REFERENCES merchants(id) ON DELETE CASCADE
//   FOREIGN KEY crm_campaigns_franchise_id_fkey: FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
//   PRIMARY KEY crm_campaigns_pkey: PRIMARY KEY (id)
//   FOREIGN KEY crm_campaigns_target_group_id_fkey: FOREIGN KEY (target_group_id) REFERENCES crm_target_groups(id) ON DELETE SET NULL
// Table: crm_target_groups
//   FOREIGN KEY crm_target_groups_affiliate_id_fkey: FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE CASCADE
//   FOREIGN KEY crm_target_groups_company_id_fkey: FOREIGN KEY (company_id) REFERENCES merchants(id) ON DELETE CASCADE
//   FOREIGN KEY crm_target_groups_franchise_id_fkey: FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
//   PRIMARY KEY crm_target_groups_pkey: PRIMARY KEY (id)
// Table: discovered_promotions
//   FOREIGN KEY discovered_promotions_affiliate_id_fkey: FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE CASCADE
//   PRIMARY KEY discovered_promotions_pkey: PRIMARY KEY (id)
// Table: email_logs
//   PRIMARY KEY email_logs_pkey: PRIMARY KEY (id)
// Table: financial_ledger
//   FOREIGN KEY financial_ledger_affiliate_id_fkey: FOREIGN KEY (affiliate_id) REFERENCES affiliate_partners(id) ON DELETE CASCADE
//   FOREIGN KEY financial_ledger_company_id_fkey: FOREIGN KEY (company_id) REFERENCES merchants(id) ON DELETE CASCADE
//   FOREIGN KEY financial_ledger_franchise_id_fkey: FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
//   PRIMARY KEY financial_ledger_pkey: PRIMARY KEY (id)
//   CHECK financial_ledger_type_check: CHECK ((type = ANY (ARRAY['credit'::text, 'debit'::text])))
//   FOREIGN KEY financial_ledger_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: franchises
//   PRIMARY KEY franchises_pkey: PRIMARY KEY (id)
// Table: itineraries
//   PRIMARY KEY itineraries_pkey: PRIMARY KEY (id)
//   FOREIGN KEY itineraries_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: itinerary_items
//   FOREIGN KEY itinerary_items_itinerary_id_fkey: FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE
//   PRIMARY KEY itinerary_items_pkey: PRIMARY KEY (id)
//   CHECK itinerary_items_type_check: CHECK ((type = ANY (ARRAY['hotel'::text, 'activity'::text, 'coupon'::text, 'car_rental'::text, 'museum'::text])))
// Table: merchants
//   PRIMARY KEY merchants_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_company_id_fkey: FOREIGN KEY (company_id) REFERENCES merchants(id) ON DELETE SET NULL
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: site_mappings
//   UNIQUE site_mappings_domain_key: UNIQUE (domain)
//   PRIMARY KEY site_mappings_pkey: PRIMARY KEY (id)
// Table: site_settings
//   UNIQUE site_settings_key_key: UNIQUE (key)
//   PRIMARY KEY site_settings_pkey: PRIMARY KEY (id)
// Table: user_engagements
//   PRIMARY KEY user_engagements_pkey: PRIMARY KEY (id)
//   FOREIGN KEY user_engagements_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: ad_advertisers
//   Policy "ad_advertisers_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "ad_advertisers_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "ad_advertisers_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "public_all_ad_advertisers" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: ad_campaigns
//   Policy "admin_all_ad_campaigns" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "franchisee_all_ad_campaigns" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND (profiles.franchise_id = ad_campaigns.franchise_id))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND (profiles.franchise_id = ad_campaigns.franchise_id))))
//   Policy "franchisee_manage_ad_campaigns_direct" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND (profiles.franchise_id = ad_campaigns.franchise_id))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND (profiles.franchise_id = ad_campaigns.franchise_id))))
//   Policy "manage_ad_campaigns" (ALL, PERMISSIVE) roles={authenticated}
//     USING: check_ad_campaign_access(company_id)
//   Policy "merchant_own_ad_campaigns" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = (ad_campaigns.company_id)::text))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = (ad_campaigns.company_id)::text))))
//   Policy "public_read_ad_campaigns" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "select_ad_campaigns" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: check_ad_campaign_access(company_id)
// Table: ad_invoices
//   Policy "Ad invoices merchant read" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (((advertiser_id)::text = (auth.uid())::text) OR ((advertiser_id)::text IN ( SELECT merchants.id    FROM merchants   WHERE (merchants.id = ( SELECT profiles.company_id            FROM profiles           WHERE (profiles.id = auth.uid()))))))
//   Policy "ad_invoices_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "ad_invoices_merchant_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((ad_id IN ( SELECT ad_campaigns.id    FROM ad_campaigns   WHERE ((ad_campaigns.company_id)::text = (auth.uid())::text))) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text, 'franchisee'::text]))))))
//   Policy "manage_ad_invoices" (ALL, PERMISSIVE) roles={authenticated}
//     USING: check_ad_invoice_access(advertiser_id, ad_id)
//   Policy "manage_own_ad_invoices" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text, 'franchisee'::text]))))) OR (advertiser_id IN ( SELECT ad_advertisers.id    FROM ad_advertisers   WHERE (ad_advertisers.email = (auth.jwt() ->> 'email'::text)))) OR (ad_id IN ( SELECT ad_campaigns.id    FROM ad_campaigns   WHERE (((ad_campaigns.company_id)::text = (auth.uid())::text) OR ((ad_campaigns.company_id)::text IN ( SELECT profiles.company_id            FROM profiles           WHERE (profiles.id = auth.uid())))))))
//   Policy "merchant_manage_invoices" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((ad_id IN ( SELECT ad_campaigns.id    FROM ad_campaigns   WHERE (((ad_campaigns.company_id)::text IN ( SELECT profiles.company_id            FROM profiles           WHERE ((profiles.id = auth.uid()) AND (profiles.company_id IS NOT NULL)))) OR ((ad_campaigns.company_id)::text = (auth.uid())::text)))) OR (advertiser_id IN ( SELECT ad_advertisers.id    FROM ad_advertisers   WHERE (ad_advertisers.email = (auth.jwt() ->> 'email'::text)))))
//   Policy "select_ad_invoices" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: check_ad_invoice_access(advertiser_id, ad_id)
// Table: ad_pricing
//   Policy "admin_delete_ad_pricing" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))) OR ((auth.jwt() ->> 'email'::text) = 'adailtong@gmail.com'::text))
//   Policy "admin_insert_ad_pricing" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))) OR ((auth.jwt() ->> 'email'::text) = 'adailtong@gmail.com'::text))
//   Policy "admin_update_ad_pricing" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))) OR ((auth.jwt() ->> 'email'::text) = 'adailtong@gmail.com'::text))
//   Policy "auth_select_ad_pricing" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: affiliate_partners
//   Policy "admin_all_affiliates" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "affiliate_own" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
//   Policy "franchisee_all_affiliates" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND (profiles.franchise_id = affiliate_partners.franchise_id))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND (profiles.franchise_id = affiliate_partners.franchise_id))))
// Table: affiliate_platforms
//   Policy "admin_all_affiliate_platforms" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "public_read_affiliate_platforms" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: affiliate_transactions
//   Policy "admin_all_transactions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "affiliate_own_transactions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (affiliate_id IN ( SELECT affiliate_partners.id    FROM affiliate_partners   WHERE (affiliate_partners.user_id = auth.uid())))
//   Policy "franchisee_all_transactions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND ((affiliate_transactions.affiliate_id)::text IN ( SELECT (affiliate_partners.id)::text AS id            FROM affiliate_partners           WHERE (affiliate_partners.franchise_id = profiles.franchise_id))))))
// Table: affiliate_withdrawals
//   Policy "auth_all_withdrawals" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: audit_logs
//   Policy "auth_insert_audit_logs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "auth_read_audit_logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: categories
//   Policy "Allow authenticated read access on categories" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow public read access on categories" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "admin_all_categories" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "admin_manage_categories" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "auth_read_categories" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_categories" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_categories" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "public_read_categories" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: commission_rules
//   Policy "admin_delete_commission_rules" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))) OR ((auth.jwt() ->> 'email'::text) = 'adailtong@gmail.com'::text))
//   Policy "admin_insert_commission_rules" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))) OR ((auth.jwt() ->> 'email'::text) = 'adailtong@gmail.com'::text))
//   Policy "admin_select_commission_rules" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))) OR ((auth.jwt() ->> 'email'::text) = 'adailtong@gmail.com'::text))
//   Policy "admin_update_commission_rules" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))) OR ((auth.jwt() ->> 'email'::text) = 'adailtong@gmail.com'::text))
// Table: coupons
//   Policy "admin_all_coupons" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "franchisee_all_coupons" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND (profiles.franchise_id = coupons.franchise_id))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND (profiles.franchise_id = coupons.franchise_id))))
//   Policy "franchisee_manage_coupons_direct" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND (profiles.franchise_id = coupons.franchise_id))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND (profiles.franchise_id = coupons.franchise_id))))
//   Policy "merchant_own_coupons" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = (coupons.company_id)::text))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = (coupons.company_id)::text))))
//   Policy "public_read_coupons" (SELECT, PERMISSIVE) roles={public}
//     USING: (status = 'active'::text)
// Table: crawler_logs
//   Policy "auth_insert_logs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "public_all_crawler_logs" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
//   Policy "public_read_logs" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: crawler_sources
//   Policy "auth_all_sources" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "public_all_crawler_sources" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
//   Policy "public_read_sources" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: crm_campaigns
//   Policy "crm_campaigns_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = (auth.uid())::text) OR (franchise_id = (auth.uid())::text) OR ((affiliate_id)::text = (auth.uid())::text) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text, 'franchisee'::text]))))))
//   Policy "crm_campaigns_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "crm_campaigns_merchant_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = (auth.uid())::text) OR (franchise_id = (auth.uid())::text) OR ((affiliate_id)::text = (auth.uid())::text) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text, 'franchisee'::text]))))))
//     WITH CHECK: ((company_id = (auth.uid())::text) OR (franchise_id = (auth.uid())::text) OR ((affiliate_id)::text = (auth.uid())::text) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text, 'franchisee'::text]))))))
//   Policy "crm_campaigns_merchant_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = (auth.uid())::text) OR (franchise_id = (auth.uid())::text) OR ((affiliate_id)::text = (auth.uid())::text) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
//   Policy "crm_campaigns_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = (auth.uid())::text) OR (franchise_id = (auth.uid())::text) OR ((affiliate_id)::text = (auth.uid())::text) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
//   Policy "crm_campaigns_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = (auth.uid())::text) OR (franchise_id = (auth.uid())::text) OR ((affiliate_id)::text = (auth.uid())::text) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
//   Policy "merchant_manage_crm_campaigns" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((company_id IN ( SELECT profiles.company_id    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.company_id IS NOT NULL)))) OR (company_id = (auth.uid())::text))
//     WITH CHECK: ((company_id IN ( SELECT profiles.company_id    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.company_id IS NOT NULL)))) OR (company_id = (auth.uid())::text))
// Table: crm_target_groups
//   Policy "crm_target_groups_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = (auth.uid())::text) OR (franchise_id = (auth.uid())::text) OR ((affiliate_id)::text = (auth.uid())::text) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text, 'franchisee'::text]))))))
//   Policy "crm_target_groups_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((company_id = (auth.uid())::text) OR ((affiliate_id)::text = (auth.uid())::text) OR (franchise_id = (auth.uid())::text) OR (company_id IN ( SELECT profiles.company_id    FROM profiles   WHERE (profiles.id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text, 'franchisee'::text]))))))
//   Policy "crm_target_groups_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = (auth.uid())::text) OR ((affiliate_id)::text = (auth.uid())::text) OR (franchise_id = (auth.uid())::text) OR (company_id IN ( SELECT profiles.company_id    FROM profiles   WHERE (profiles.id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text, 'franchisee'::text]))))))
//   Policy "crm_target_groups_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((company_id = (auth.uid())::text) OR (franchise_id = (auth.uid())::text) OR ((affiliate_id)::text = (auth.uid())::text) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
//     WITH CHECK: true
// Table: discovered_promotions
//   Policy "auth_all_promotions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "auth_insert_promotions" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "auth_update_promotions" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "authenticated_delete_discovered_promotions" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_discovered_promotions" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_discovered_promotions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_discovered_promotions" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "public_all_discovered_promotions" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
//   Policy "public_read_discovered_promotions_new" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "public_read_promotions" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: email_logs
//   Policy "admin_all_email_logs" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
// Table: financial_ledger
//   Policy "admin_all_ledger" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "affiliate_ledger" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((affiliate_id IN ( SELECT affiliate_partners.id    FROM affiliate_partners   WHERE (affiliate_partners.user_id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
//   Policy "franchisee_ledger" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((franchise_id IN ( SELECT profiles.franchise_id    FROM profiles   WHERE (profiles.id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
//   Policy "merchant_ledger" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((company_id IN ( SELECT profiles.company_id    FROM profiles   WHERE (profiles.id = auth.uid()))) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
//   Policy "user_ledger" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
// Table: franchises
//   Policy "admin_all_franchises" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "franchisee_own_franchise" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND (profiles.franchise_id = franchises.id))))
//   Policy "public_read_franchises" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: itineraries
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: itinerary_items
//   Policy "Users can delete own itinerary items" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM itineraries   WHERE ((itineraries.id = itinerary_items.itinerary_id) AND (itineraries.user_id = auth.uid()))))
//   Policy "Users can insert own itinerary items" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM itineraries   WHERE ((itineraries.id = itinerary_items.itinerary_id) AND (itineraries.user_id = auth.uid()))))
//   Policy "Users can read own itinerary items" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM itineraries   WHERE ((itineraries.id = itinerary_items.itinerary_id) AND (itineraries.user_id = auth.uid()))))
//   Policy "Users can update own itinerary items" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM itineraries   WHERE ((itineraries.id = itinerary_items.itinerary_id) AND (itineraries.user_id = auth.uid()))))
// Table: merchants
//   Policy "admin_all_merchants" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "franchisee_all_merchants" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND (profiles.franchise_id = merchants.franchise_id))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'franchisee'::text) AND (profiles.franchise_id = merchants.franchise_id))))
//   Policy "merchant_own_merchants" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = merchants.id))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.company_id = merchants.id))))
//   Policy "public_read_merchants" (SELECT, PERMISSIVE) roles={public}
//     USING: (status = 'active'::text)
// Table: profiles
//   Policy "admin_all_profiles" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "franchisee_all_profiles" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'franchisee'::text) AND (p.franchise_id = profiles.franchise_id))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = 'franchisee'::text) AND (p.franchise_id = profiles.franchise_id))))
//   Policy "merchant_all_profiles" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = ANY (ARRAY['merchant'::text, 'shopkeeper'::text])) AND (p.company_id = profiles.company_id))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles p   WHERE ((p.id = auth.uid()) AND (p.role = ANY (ARRAY['merchant'::text, 'shopkeeper'::text])) AND (p.company_id = profiles.company_id))))
//   Policy "profiles_own" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//     WITH CHECK: (id = auth.uid())
// Table: site_mappings
//   Policy "auth_all_site_mappings" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "public_all_site_mappings" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
//   Policy "public_read_site_mappings" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: site_settings
//   Policy "admin_all_site_settings" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "public_read_site_settings" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: user_engagements
//   Policy "authenticated_insert_engagements" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "authenticated_select_engagements" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((user_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))) OR (EXISTS ( SELECT 1    FROM ((profiles p      JOIN franchises f ON ((f.email = p.email)))      JOIN coupons c ON ((c.id = user_engagements.campaign_id)))   WHERE ((p.id = auth.uid()) AND (p.role = 'franchisee'::text) AND (c.franchise_id = f.id)))) OR (EXISTS ( SELECT 1    FROM (profiles p      JOIN coupons c ON ((c.id = user_engagements.campaign_id)))   WHERE ((p.id = auth.uid()) AND (p.role = ANY (ARRAY['merchant'::text, 'shopkeeper'::text])) AND ((c.company_id)::text = p.company_id)))))
//   Policy "franchisee_select_user_engagements" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM ((profiles p      JOIN franchises f ON ((f.email = p.email)))      JOIN coupons c ON (((c.id)::text = (user_engagements.campaign_id)::text)))   WHERE ((p.id = auth.uid()) AND (p.role = 'franchisee'::text) AND ((c.franchise_id = f.id) OR ((c.company_id)::text IN ( SELECT m.id            FROM merchants m           WHERE (m.region_id = f.region_id)))))))

// --- DATABASE FUNCTIONS ---
// FUNCTION check_ad_campaign_access(uuid)
//   CREATE OR REPLACE FUNCTION public.check_ad_campaign_access(p_company_id uuid)
//    RETURNS boolean
//    LANGUAGE sql
//    SECURITY DEFINER
//   AS $function$
//     SELECT 
//       (p_company_id = auth.uid()) OR 
//       EXISTS (
//         SELECT 1 FROM profiles 
//         WHERE profiles.id = auth.uid() 
//         AND profiles.company_id IS NOT NULL 
//         AND profiles.company_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
//         AND profiles.company_id::uuid = p_company_id
//       ) OR 
//       EXISTS (
//         SELECT 1 FROM profiles 
//         WHERE profiles.id = auth.uid() 
//         AND profiles.role IN ('admin', 'super_admin', 'franchisee')
//       );
//   $function$
//   
// FUNCTION check_ad_invoice_access(uuid, uuid)
//   CREATE OR REPLACE FUNCTION public.check_ad_invoice_access(p_advertiser_id uuid, p_ad_id uuid)
//    RETURNS boolean
//    LANGUAGE sql
//    SECURITY DEFINER
//   AS $function$
//     SELECT 
//       (p_advertiser_id = auth.uid()) OR 
//       EXISTS (
//         SELECT 1 FROM profiles 
//         WHERE profiles.id = auth.uid() 
//         AND profiles.company_id IS NOT NULL 
//         AND profiles.company_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
//         AND profiles.company_id::uuid = p_advertiser_id
//       ) OR 
//       EXISTS (
//         SELECT 1 FROM ad_campaigns 
//         WHERE ad_campaigns.id = p_ad_id AND ad_campaigns.company_id = auth.uid()
//       ) OR 
//       EXISTS (
//         SELECT 1 FROM profiles 
//         WHERE profiles.id = auth.uid() 
//         AND profiles.role IN ('admin', 'super_admin', 'franchisee')
//       );
//   $function$
//   
// FUNCTION check_engagement_reward()
//   CREATE OR REPLACE FUNCTION public.check_engagement_reward()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//     DECLARE
//       v_promo record;
//       v_count integer;
//       v_coupon_id uuid;
//       v_company record;
//     BEGIN
//       -- Only process social shares
//       IF NEW.action_type != 'social_share' THEN
//         RETURN NEW;
//       END IF;
//   
//       -- Get promotion
//       SELECT * INTO v_promo FROM public.discovered_promotions WHERE id = NEW.campaign_id;
//       IF NOT FOUND OR v_promo.engagement_threshold IS NULL OR v_promo.engagement_threshold <= 0 THEN
//         RETURN NEW;
//       END IF;
//   
//       -- Count user shares
//       SELECT count(*) INTO v_count FROM public.user_engagements 
//       WHERE campaign_id = NEW.campaign_id AND user_id = NEW.user_id AND action_type = 'social_share';
//   
//       -- Check if threshold just met
//       IF v_count = v_promo.engagement_threshold THEN
//         -- Get company info
//         SELECT * INTO v_company FROM public.merchants WHERE id = v_promo.company_id;
//         
//         -- Generate coupon
//         v_coupon_id := gen_random_uuid();
//         INSERT INTO public.coupons (
//           id, title, description, discount, price, original_price, 
//           image_url, store_name, start_date, end_date, 
//           status, environment, user_id, is_featured
//         ) VALUES (
//           v_coupon_id,
//           COALESCE(v_promo.reward_description, 'Engagement Reward'),
//           'Reward for engaging with ' || v_promo.title,
//           CASE 
//             WHEN v_promo.reward_type = 'Compound Discount' THEN v_promo.reward_value::text || '% + ' || v_promo.discount
//             WHEN v_promo.reward_type = 'Standard Discount' THEN v_promo.reward_value::text || '%'
//             WHEN v_promo.reward_type = 'Store Credit (Fixed Value)' THEN 'R$ ' || v_promo.reward_value::text
//             ELSE 'Free Item'
//           END,
//           0,
//           v_promo.reward_value,
//           v_promo.image_url,
//           COALESCE(v_company.name, v_promo.store_name),
//           now(),
//           now() + interval '30 days',
//           'active',
//           v_promo.environment,
//           NEW.user_id,
//           false
//         );
//   
//         -- Notify user
//         INSERT INTO public.audit_logs (action, entity_type, entity_id, details, user_id)
//         VALUES ('REWARD_EARNED', 'coupon', v_coupon_id::text, 'Engagement reward generated for campaign ' || v_promo.id::text, NEW.user_id);
//       END IF;
//   
//       RETURN NEW;
//     END;
//   $function$
//   
// FUNCTION check_franchise_promo_limits()
//   CREATE OR REPLACE FUNCTION public.check_franchise_promo_limits()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     -- Safe hook for enforcing master franchise limits at the database level later
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION consume_promotion(uuid, uuid)
//   CREATE OR REPLACE FUNCTION public.consume_promotion(p_promo_id uuid, p_user_id uuid)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_promo record;
//     v_usage_count int;
//   BEGIN
//     -- Lock row for update to prevent race conditions during concurrent checkouts
//     SELECT * INTO v_promo
//     FROM public.discovered_promotions
//     WHERE id = p_promo_id
//     FOR UPDATE;
//   
//     IF NOT FOUND THEN
//       RETURN jsonb_build_object('success', false, 'message', 'Promoção não encontrada.');
//     END IF;
//   
//     IF v_promo.status NOT IN ('published', 'active', 'approved') THEN
//       RETURN jsonb_build_object('success', false, 'message', 'Promoção inativa.');
//     END IF;
//   
//     IF v_promo.end_date IS NOT NULL AND v_promo.end_date < now() THEN
//       RETURN jsonb_build_object('success', false, 'message', 'Promoção expirada.');
//     END IF;
//   
//     IF v_promo.limit_type = 'limited' AND v_promo.total_limit IS NOT NULL THEN
//       IF COALESCE(v_promo.usage_count, 0) >= v_promo.total_limit THEN
//         RETURN jsonb_build_object('success', false, 'message', 'Promoção esgotada. Limite máximo atingido.');
//       END IF;
//     END IF;
//   
//     -- Atomically increment usage
//     UPDATE public.discovered_promotions
//     SET usage_count = COALESCE(usage_count, 0) + 1
//     WHERE id = p_promo_id
//     RETURNING usage_count INTO v_usage_count;
//   
//     -- Log the atomic consumption in the audit trail
//     INSERT INTO public.audit_logs (action, entity_type, entity_id, details, user_id)
//     VALUES ('CONSUME_PROMO', 'promotion', p_promo_id::text, 'Promoção consumida atomicamente com trava transacional', p_user_id);
//   
//     RETURN jsonb_build_object('success', true, 'message', 'Voucher validado e consumo registrado com sucesso.', 'new_usage_count', v_usage_count);
//   END;
//   $function$
//   
// FUNCTION handle_new_user_after()
//   CREATE OR REPLACE FUNCTION public.handle_new_user_after()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_role text;
//     v_name text;
//     v_is_affiliate boolean;
//     v_tax_id text;
//     v_company_id text := NULL;
//     v_merchant_id text;
//   BEGIN
//     v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
//     v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
//     v_is_affiliate := (v_role = 'affiliate');
//     v_tax_id := NEW.raw_user_meta_data->>'tax_id';
//   
//     -- Handle merchant
//     IF v_role IN ('merchant', 'shopkeeper') THEN
//       SELECT id::text INTO v_merchant_id FROM public.merchants WHERE email = NEW.email LIMIT 1;
//       IF v_merchant_id IS NULL THEN
//         v_merchant_id := gen_random_uuid()::text;
//         INSERT INTO public.merchants (id, name, email, status)
//         VALUES (v_merchant_id, v_name || ' Store', NEW.email, 'active');
//       END IF;
//       v_company_id := v_merchant_id;
//     END IF;
//   
//     -- Insert into profiles
//     INSERT INTO public.profiles (id, email, name, role, is_affiliate, tax_id, company_id)
//     VALUES (
//       NEW.id,
//       NEW.email,
//       v_name,
//       v_role,
//       v_is_affiliate,
//       v_tax_id,
//       v_company_id
//     )
//     ON CONFLICT (id) DO UPDATE
//     SET 
//       email = EXCLUDED.email,
//       name = COALESCE(public.profiles.name, EXCLUDED.name),
//       role = COALESCE(public.profiles.role, EXCLUDED.role),
//       is_affiliate = COALESCE(public.profiles.is_affiliate, EXCLUDED.is_affiliate),
//       tax_id = COALESCE(public.profiles.tax_id, EXCLUDED.tax_id),
//       company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id);
//   
//     -- Handle affiliate
//     IF v_role = 'affiliate' THEN
//       INSERT INTO public.affiliate_partners (id, user_id, email, name, status, tax_id)
//       VALUES (
//         gen_random_uuid(),
//         NEW.id,
//         NEW.email,
//         v_name,
//         'active',
//         v_tax_id
//       )
//       ON CONFLICT (email) DO UPDATE 
//       SET user_id = EXCLUDED.user_id,
//           tax_id = COALESCE(public.affiliate_partners.tax_id, EXCLUDED.tax_id);
//     END IF;
//   
//     -- Handle franchisee
//     IF v_role = 'franchisee' THEN
//       IF NOT EXISTS (SELECT 1 FROM public.franchises WHERE email = NEW.email) THEN
//         INSERT INTO public.franchises (id, name, email)
//         VALUES (gen_random_uuid()::text, v_name || ' Franchise', NEW.email);
//       END IF;
//     END IF;
//   
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION handle_new_user_before()
//   CREATE OR REPLACE FUNCTION public.handle_new_user_before()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//     BEGIN
//       NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
//       RETURN NEW;
//     END;
//     $function$
//   
// FUNCTION rls_auto_enable()
//   CREATE OR REPLACE FUNCTION public.rls_auto_enable()
//    RETURNS event_trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'pg_catalog'
//   AS $function$
//   DECLARE
//     cmd record;
//   BEGIN
//     FOR cmd IN
//       SELECT *
//       FROM pg_event_trigger_ddl_commands()
//       WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
//         AND object_type IN ('table','partitioned table')
//     LOOP
//        IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
//         BEGIN
//           EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
//           RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
//         EXCEPTION
//           WHEN OTHERS THEN
//             RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
//         END;
//        ELSE
//           RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
//        END IF;
//     END LOOP;
//   END;
//   $function$
//   
// FUNCTION update_itinerary_dates(uuid, date, date, text, text, text)
//   CREATE OR REPLACE FUNCTION public.update_itinerary_dates(p_itinerary_id uuid, p_new_start_date date, p_new_end_date date, p_title text DEFAULT NULL::text, p_destination text DEFAULT NULL::text, p_description text DEFAULT NULL::text)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_old_start_date date;
//     v_day_diff integer := 0;
//     v_item record;
//     v_new_item_date date;
//     v_new_start_time timestamp with time zone;
//     v_new_end_time timestamp with time zone;
//   BEGIN
//     SELECT start_date::date INTO v_old_start_date
//     FROM public.itineraries
//     WHERE id = p_itinerary_id AND user_id = auth.uid();
//   
//     IF NOT FOUND THEN
//       RETURN jsonb_build_object('success', false, 'message', 'Itinerary not found or access denied.');
//     END IF;
//   
//     UPDATE public.itineraries
//     SET 
//       start_date = COALESCE(p_new_start_date::timestamp with time zone, start_date),
//       end_date = COALESCE(p_new_end_date::timestamp with time zone, end_date),
//       title = COALESCE(p_title, title),
//       destination = COALESCE(p_destination, destination),
//       description = COALESCE(p_description, description)
//     WHERE id = p_itinerary_id;
//   
//     IF v_old_start_date IS NOT NULL AND p_new_start_date IS NOT NULL THEN
//       v_day_diff := p_new_start_date - v_old_start_date;
//     END IF;
//   
//     IF v_day_diff <> 0 OR p_new_end_date IS NOT NULL THEN
//       FOR v_item IN
//         SELECT id, start_time, end_time
//         FROM public.itinerary_items
//         WHERE itinerary_id = p_itinerary_id AND start_time IS NOT NULL
//       LOOP
//         v_new_item_date := (v_item.start_time AT TIME ZONE 'UTC')::date + v_day_diff;
//   
//         IF p_new_end_date IS NOT NULL AND v_new_item_date > p_new_end_date THEN
//           v_new_item_date := p_new_end_date;
//         END IF;
//   
//         v_new_start_time := (v_new_item_date::text || ' ' || (v_item.start_time AT TIME ZONE 'UTC')::time::text || ' UTC')::timestamp with time zone;
//         
//         IF v_item.end_time IS NOT NULL THEN
//            v_new_end_time := v_new_start_time + (v_item.end_time - v_item.start_time);
//         ELSE
//            v_new_end_time := NULL;
//         END IF;
//   
//         UPDATE public.itinerary_items
//         SET start_time = v_new_start_time,
//             end_time = v_new_end_time
//         WHERE id = v_item.id;
//       END LOOP;
//     END IF;
//   
//     RETURN jsonb_build_object('success', true);
//   END;
//   $function$
//   
// FUNCTION validate_promotion(uuid)
//   CREATE OR REPLACE FUNCTION public.validate_promotion(p_promo_id uuid)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_promo record;
//   BEGIN
//     SELECT * INTO v_promo
//     FROM public.discovered_promotions
//     WHERE id = p_promo_id;
//   
//     IF NOT FOUND THEN
//       RETURN jsonb_build_object('success', false, 'message', 'Promoção não encontrada no banco de dados.');
//     END IF;
//   
//     IF v_promo.status NOT IN ('published', 'active', 'approved') THEN
//       RETURN jsonb_build_object('success', false, 'message', 'Esta promoção encontra-se inativa ou pendente.');
//     END IF;
//   
//     IF v_promo.end_date IS NOT NULL AND v_promo.end_date < now() THEN
//       RETURN jsonb_build_object('success', false, 'message', 'Esta promoção já expirou.');
//     END IF;
//   
//     IF v_promo.limit_type = 'limited' AND v_promo.total_limit IS NOT NULL THEN
//       IF COALESCE(v_promo.usage_count, 0) >= v_promo.total_limit THEN
//         RETURN jsonb_build_object('success', false, 'message', 'Promoção esgotada. O limite de resgates foi atingido.');
//       END IF;
//     END IF;
//   
//     RETURN jsonb_build_object('success', true, 'message', 'Promoção válida.');
//   END;
//   $function$
//   
// FUNCTION validate_promotion_by_code(text)
//   CREATE OR REPLACE FUNCTION public.validate_promotion_by_code(p_code text)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_promo record;
//   BEGIN
//     SELECT * INTO v_promo
//     FROM public.discovered_promotions
//     WHERE code = p_code
//     LIMIT 1;
//   
//     IF NOT FOUND THEN
//       RETURN jsonb_build_object('success', false, 'message', 'Código de voucher não encontrado no sistema.');
//     END IF;
//   
//     RETURN public.validate_promotion(v_promo.id);
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: discovered_promotions
//   trg_check_franchise_promo_limits: CREATE TRIGGER trg_check_franchise_promo_limits BEFORE INSERT OR UPDATE ON public.discovered_promotions FOR EACH ROW EXECUTE FUNCTION check_franchise_promo_limits()
// Table: user_engagements
//   trg_check_engagement_reward: CREATE TRIGGER trg_check_engagement_reward AFTER INSERT ON public.user_engagements FOR EACH ROW EXECUTE FUNCTION check_engagement_reward()

// --- INDEXES ---
// Table: ad_campaigns
//   CREATE INDEX idx_ad_campaigns_environment ON public.ad_campaigns USING btree (environment)
// Table: affiliate_partners
//   CREATE UNIQUE INDEX affiliate_partners_email_key ON public.affiliate_partners USING btree (email)
// Table: affiliate_platforms
//   CREATE UNIQUE INDEX affiliate_platforms_name_key ON public.affiliate_platforms USING btree (name)
// Table: affiliate_withdrawals
//   CREATE INDEX idx_affiliate_withdrawals_affiliate_id ON public.affiliate_withdrawals USING btree (affiliate_id)
// Table: categories
//   CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name)
// Table: commission_rules
//   CREATE INDEX idx_commission_rules_franchise_id ON public.commission_rules USING btree (franchise_id)
//   CREATE INDEX idx_commission_rules_valid_dates ON public.commission_rules USING btree (valid_from, valid_until)
// Table: coupons
//   CREATE INDEX idx_coupons_environment ON public.coupons USING btree (environment)
// Table: crm_campaigns
//   CREATE INDEX idx_crm_campaigns_affiliate_id ON public.crm_campaigns USING btree (affiliate_id)
// Table: crm_target_groups
//   CREATE INDEX idx_crm_target_groups_affiliate_id ON public.crm_target_groups USING btree (affiliate_id)
// Table: discovered_promotions
//   CREATE UNIQUE INDEX discovered_promotions_unique_hash_idx ON public.discovered_promotions USING btree (unique_hash) WHERE (unique_hash IS NOT NULL)
//   CREATE INDEX idx_discovered_promotions_environment ON public.discovered_promotions USING btree (environment)
// Table: financial_ledger
//   CREATE INDEX idx_financial_ledger_affiliate ON public.financial_ledger USING btree (affiliate_id)
//   CREATE INDEX idx_financial_ledger_company ON public.financial_ledger USING btree (company_id)
//   CREATE INDEX idx_financial_ledger_date ON public.financial_ledger USING btree (transaction_date)
//   CREATE INDEX idx_financial_ledger_franchise ON public.financial_ledger USING btree (franchise_id)
//   CREATE INDEX idx_financial_ledger_user ON public.financial_ledger USING btree (user_id)
// Table: itinerary_items
//   CREATE INDEX idx_itinerary_items_itinerary_id ON public.itinerary_items USING btree (itinerary_id)
//   CREATE INDEX idx_itinerary_items_start_time ON public.itinerary_items USING btree (start_time)
// Table: profiles
//   CREATE INDEX idx_profiles_company_id ON public.profiles USING btree (company_id)
// Table: site_mappings
//   CREATE UNIQUE INDEX site_mappings_domain_key ON public.site_mappings USING btree (domain)
// Table: site_settings
//   CREATE UNIQUE INDEX site_settings_key_key ON public.site_settings USING btree (key)

