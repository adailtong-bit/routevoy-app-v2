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
          address_complement: string | null
          address_neighborhood: string | null
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
          address_complement?: string | null
          address_neighborhood?: string | null
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
          address_complement?: string | null
          address_neighborhood?: string | null
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
          affiliate_id: string | null
          alert_radius: number | null
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
          enable_proximity_alerts: boolean | null
          enable_trigger: boolean | null
          end_date: string | null
          environment: string
          franchise_id: string | null
          id: string
          image: string | null
          is_demo: boolean
          is_exclusive: boolean | null
          is_seasonal: boolean | null
          latitude: number | null
          limit_type: string | null
          link: string | null
          location_name: string | null
          longitude: number | null
          original_price: number | null
          placement: string | null
          price: number | null
          priority_score: number | null
          promotion_model: string | null
          region: string | null
          reward_description: string | null
          reward_value: number | null
          start_date: string | null
          state: string | null
          status: string | null
          title: string
          total_limit: number | null
          trigger_threshold: number | null
          trigger_type: string | null
          views: number | null
        }
        Insert: {
          advertiser_id?: string | null
          affiliate_id?: string | null
          alert_radius?: number | null
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
          enable_proximity_alerts?: boolean | null
          enable_trigger?: boolean | null
          end_date?: string | null
          environment?: string
          franchise_id?: string | null
          id?: string
          image?: string | null
          is_demo?: boolean
          is_exclusive?: boolean | null
          is_seasonal?: boolean | null
          latitude?: number | null
          limit_type?: string | null
          link?: string | null
          location_name?: string | null
          longitude?: number | null
          original_price?: number | null
          placement?: string | null
          price?: number | null
          priority_score?: number | null
          promotion_model?: string | null
          region?: string | null
          reward_description?: string | null
          reward_value?: number | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          title: string
          total_limit?: number | null
          trigger_threshold?: number | null
          trigger_type?: string | null
          views?: number | null
        }
        Update: {
          advertiser_id?: string | null
          affiliate_id?: string | null
          alert_radius?: number | null
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
          enable_proximity_alerts?: boolean | null
          enable_trigger?: boolean | null
          end_date?: string | null
          environment?: string
          franchise_id?: string | null
          id?: string
          image?: string | null
          is_demo?: boolean
          is_exclusive?: boolean | null
          is_seasonal?: boolean | null
          latitude?: number | null
          limit_type?: string | null
          link?: string | null
          location_name?: string | null
          longitude?: number | null
          original_price?: number | null
          placement?: string | null
          price?: number | null
          priority_score?: number | null
          promotion_model?: string | null
          region?: string | null
          reward_description?: string | null
          reward_value?: number | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          title?: string
          total_limit?: number | null
          trigger_threshold?: number | null
          trigger_type?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "ad_advertisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_campaigns_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_invoices: {
        Row: {
          ad_id: string | null
          advertiser_id: string | null
          amount: number
          created_at: string
          due_date: string
          environment: string
          gateway_reference: string | null
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
          gateway_reference?: string | null
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
          gateway_reference?: string | null
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
          address_city: string | null
          address_country: string | null
          address_state: string | null
          api_keys: Json | null
          commission_model: string | null
          commission_rate: number | null
          contacts: Json | null
          coverage_cities: Json | null
          coverage_scope: string | null
          coverage_states: Json | null
          created_at: string | null
          email: string
          franchise_id: string | null
          id: string
          image_url: string | null
          monthly_fee: number | null
          name: string
          phone: string | null
          platform_commissions: Json | null
          platform_ids: Json | null
          pricing_config_id: string | null
          region: string | null
          region_id: string | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          api_keys?: Json | null
          commission_model?: string | null
          commission_rate?: number | null
          contacts?: Json | null
          coverage_cities?: Json | null
          coverage_scope?: string | null
          coverage_states?: Json | null
          created_at?: string | null
          email: string
          franchise_id?: string | null
          id?: string
          image_url?: string | null
          monthly_fee?: number | null
          name: string
          phone?: string | null
          platform_commissions?: Json | null
          platform_ids?: Json | null
          pricing_config_id?: string | null
          region?: string | null
          region_id?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          api_keys?: Json | null
          commission_model?: string | null
          commission_rate?: number | null
          contacts?: Json | null
          coverage_cities?: Json | null
          coverage_scope?: string | null
          coverage_states?: Json | null
          created_at?: string | null
          email?: string
          franchise_id?: string | null
          id?: string
          image_url?: string | null
          monthly_fee?: number | null
          name?: string
          phone?: string | null
          platform_commissions?: Json | null
          platform_ids?: Json | null
          pricing_config_id?: string | null
          region?: string | null
          region_id?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_partners_pricing_config_id_fkey"
            columns: ["pricing_config_id"]
            isOneToOne: false
            referencedRelation: "platform_pricing_configs"
            referencedColumns: ["id"]
          },
        ]
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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          replied_at: string | null
          reply_text: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          replied_at?: string | null
          reply_text?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          replied_at?: string | null
          reply_text?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
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
          is_demo: boolean
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
          is_demo?: boolean
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
          is_demo?: boolean
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
          is_demo: boolean
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
          is_demo?: boolean
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
          is_demo?: boolean
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
          address_city: string | null
          address_complement: string | null
          address_country: string | null
          address_lat: number | null
          address_lng: number | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          country: string | null
          coverage_cities: Json | null
          coverage_scope: string | null
          coverage_states: Json | null
          created_at: string | null
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string | null
          owner_id: string | null
          preferred_currency: string | null
          region: string | null
          region_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_country?: string | null
          address_lat?: number | null
          address_lng?: number | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          country?: string | null
          coverage_cities?: Json | null
          coverage_scope?: string | null
          coverage_states?: Json | null
          created_at?: string | null
          email?: string | null
          id: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          owner_id?: string | null
          preferred_currency?: string | null
          region?: string | null
          region_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_country?: string | null
          address_lat?: number | null
          address_lng?: number | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          country?: string | null
          coverage_cities?: Json | null
          coverage_scope?: string | null
          coverage_states?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          owner_id?: string | null
          preferred_currency?: string | null
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
      merchant_validations: {
        Row: {
          company_id: string | null
          created_at: string
          discount_amount: number
          final_amount: number
          id: string
          operator_id: string | null
          promotion_id: string | null
          promotion_title: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          discount_amount?: number
          final_amount?: number
          id?: string
          operator_id?: string | null
          promotion_id?: string | null
          promotion_title?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          discount_amount?: number
          final_amount?: number
          id?: string
          operator_id?: string | null
          promotion_id?: string | null
          promotion_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_validations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_validations_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_country: string | null
          address_lat: number | null
          address_lng: number | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          billing_email: string | null
          billing_name: string | null
          business_phone: string | null
          business_size: string | null
          contacts: Json | null
          country: string | null
          created_at: string | null
          email: string | null
          fee_valid_from: string | null
          franchise_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          monthly_fixed_fee: number | null
          name: string | null
          preferred_currency: string | null
          pricing_config_id: string | null
          region: string | null
          region_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_country?: string | null
          address_lat?: number | null
          address_lng?: number | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          billing_email?: string | null
          billing_name?: string | null
          business_phone?: string | null
          business_size?: string | null
          contacts?: Json | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          fee_valid_from?: string | null
          franchise_id?: string | null
          id: string
          latitude?: number | null
          longitude?: number | null
          monthly_fixed_fee?: number | null
          name?: string | null
          preferred_currency?: string | null
          pricing_config_id?: string | null
          region?: string | null
          region_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_country?: string | null
          address_lat?: number | null
          address_lng?: number | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          billing_email?: string | null
          billing_name?: string | null
          business_phone?: string | null
          business_size?: string | null
          contacts?: Json | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          fee_valid_from?: string | null
          franchise_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          monthly_fixed_fee?: number | null
          name?: string | null
          preferred_currency?: string | null
          pricing_config_id?: string | null
          region?: string | null
          region_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchants_pricing_config_id_fkey"
            columns: ["pricing_config_id"]
            isOneToOne: false
            referencedRelation: "platform_pricing_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_pricing_configs: {
        Row: {
          created_at: string
          entity_type: string
          environment: string
          franchise_id: string | null
          id: string
          price: number
          tier: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          entity_type: string
          environment?: string
          franchise_id?: string | null
          id?: string
          price?: number
          tier: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          entity_type?: string
          environment?: string
          franchise_id?: string | null
          id?: string
          price?: number
          tier?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_pricing_configs_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birthday: string | null
          city: string | null
          company_id: string | null
          country: string | null
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
          preferred_currency: string | null
          role: string | null
          state: string | null
          status: string | null
          tax_id: string | null
        }
        Insert: {
          birthday?: string | null
          city?: string | null
          company_id?: string | null
          country?: string | null
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
          preferred_currency?: string | null
          role?: string | null
          state?: string | null
          status?: string | null
          tax_id?: string | null
        }
        Update: {
          birthday?: string | null
          city?: string | null
          company_id?: string | null
          country?: string | null
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
          preferred_currency?: string | null
          role?: string | null
          state?: string | null
          status?: string | null
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
        Relationships: [
          {
            foreignKeyName: "user_engagements_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          email: string
          franchise_id: string | null
          id: string
          role: string
          status: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          franchise_id?: string | null
          id?: string
          role: string
          status?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          franchise_id?: string | null
          id?: string
          role?: string
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { invitation_id: string }; Returns: boolean }
      check_ad_campaign_access: {
        Args: { p_company_id: string }
        Returns: boolean
      }
      check_ad_invoice_access: {
        Args: { p_ad_id: string; p_advertiser_id: string }
        Returns: boolean
      }
      check_hierarchy_access:
        | {
            Args: {
              p_affiliate_id?: string
              p_company_id?: string
              p_franchise_id?: string
              p_target_table: string
              p_user_id?: string
            }
            Returns: boolean
          }
        | {
            Args: {
              p_affiliate_id: string
              p_franchise_id: string
              p_merchant_id: string
              p_user_id: string
              table_name: string
            }
            Returns: boolean
          }
      consume_promotion: {
        Args: { p_promo_id: string; p_user_id?: string }
        Returns: Json
      }
      get_auth_user_affiliate_id: { Args: never; Returns: string }
      get_auth_user_company_id: { Args: never; Returns: string }
      get_auth_user_franchise_id: { Args: never; Returns: string }
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

