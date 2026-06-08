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
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      ad_advertisers: {
        Row: {
          address_number: string | null
          city: string | null
          company_name: string
          contact_name: string | null
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
          clicks: number | null
          company_id: string | null
          cost_per_click: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          duration_days: number | null
          end_date: string | null
          environment: string
          id: string
          image: string | null
          link: string | null
          placement: string | null
          price: number | null
          region: string | null
          start_date: string | null
          status: string | null
          title: string
          views: number | null
        }
        Insert: {
          advertiser_id?: string | null
          billing_type?: string | null
          budget?: number | null
          category?: string | null
          clicks?: number | null
          company_id?: string | null
          cost_per_click?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_days?: number | null
          end_date?: string | null
          environment?: string
          id?: string
          image?: string | null
          link?: string | null
          placement?: string | null
          price?: number | null
          region?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          views?: number | null
        }
        Update: {
          advertiser_id?: string | null
          billing_type?: string | null
          budget?: number | null
          category?: string | null
          clicks?: number | null
          company_id?: string | null
          cost_per_click?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_days?: number | null
          end_date?: string | null
          environment?: string
          id?: string
          image?: string | null
          link?: string | null
          placement?: string | null
          price?: number | null
          region?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
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
            foreignKeyName: 'ad_invoices_ad_id_fkey'
            columns: ['ad_id']
            isOneToOne: false
            referencedRelation: 'ad_campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ad_invoices_advertiser_id_fkey'
            columns: ['advertiser_id']
            isOneToOne: false
            referencedRelation: 'ad_advertisers'
            referencedColumns: ['id']
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
            foreignKeyName: 'affiliate_transactions_affiliate_id_fkey'
            columns: ['affiliate_id']
            isOneToOne: false
            referencedRelation: 'affiliate_partners'
            referencedColumns: ['id']
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
            foreignKeyName: 'affiliate_withdrawals_affiliate_id_fkey'
            columns: ['affiliate_id']
            isOneToOne: false
            referencedRelation: 'affiliate_partners'
            referencedColumns: ['id']
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
      coupons: {
        Row: {
          category: string | null
          code: string | null
          created_at: string | null
          description: string | null
          discount: string | null
          end_date: string | null
          environment: string
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
          status: string | null
          store_name: string | null
          title: string
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          discount?: string | null
          end_date?: string | null
          environment?: string
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
          status?: string | null
          store_name?: string | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          discount?: string | null
          end_date?: string | null
          environment?: string
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
          category: string | null
          created_at: string | null
          date: string | null
          error_details: Json | null
          error_message: string | null
          id: string
          items_found: number | null
          items_imported: number | null
          source_id: string | null
          status: string | null
          store_name: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          items_found?: number | null
          items_imported?: number | null
          source_id?: string | null
          status?: string | null
          store_name?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          items_found?: number | null
          items_imported?: number | null
          source_id?: string | null
          status?: string | null
          store_name?: string | null
        }
        Relationships: []
      }
      crawler_sources: {
        Row: {
          category: string | null
          city: string | null
          country: string | null
          created_at: string | null
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
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
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
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
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
        Relationships: []
      }
      discovered_promotions: {
        Row: {
          alert_radius: number | null
          campaign_name: string | null
          captured_at: string | null
          category: string | null
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
          environment: string
          id: string
          image_url: string | null
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
          reward_id: string | null
          source_url: string | null
          start_date: string | null
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
          alert_radius?: number | null
          campaign_name?: string | null
          captured_at?: string | null
          category?: string | null
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
          environment?: string
          id?: string
          image_url?: string | null
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
          reward_id?: string | null
          source_url?: string | null
          start_date?: string | null
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
          alert_radius?: number | null
          campaign_name?: string | null
          captured_at?: string | null
          category?: string | null
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
          environment?: string
          id?: string
          image_url?: string | null
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
          reward_id?: string | null
          source_url?: string | null
          start_date?: string | null
          status?: string | null
          store_name?: string | null
          title?: string
          total_limit?: number | null
          trigger_threshold?: number | null
          trigger_type?: string | null
          unique_hash?: string | null
          usage_count?: number | null
        }
        Relationships: []
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
            foreignKeyName: 'itinerary_items_itinerary_id_fkey'
            columns: ['itinerary_id']
            isOneToOne: false
            referencedRelation: 'itineraries'
            referencedColumns: ['id']
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
          business_phone: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          region: string | null
          region_id: string | null
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
          business_phone?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          region?: string | null
          region_id?: string | null
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
          business_phone?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          region?: string | null
          region_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_affiliate: boolean | null
          name: string | null
          role: string | null
          tax_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_affiliate?: boolean | null
          name?: string | null
          role?: string | null
          tax_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_affiliate?: boolean | null
          name?: string | null
          role?: string | null
          tax_id?: string | null
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_promotion: {
        Args: { p_promo_id: string; p_user_id: string }
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
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
// Table: ad_campaigns
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   company_id: text (nullable)
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
// Table: email_logs
//   id: uuid (not null, default: gen_random_uuid())
//   recipient: text (not null)
//   subject: text (not null)
//   type: text (not null)
//   status: text (not null)
//   provider: text (not null)
//   error_message: text (nullable)
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
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (nullable)
//   role: text (nullable, default: 'user'::text)
//   is_affiliate: boolean (nullable, default: false)
//   created_at: timestamp with time zone (nullable, default: now())
//   tax_id: text (nullable)
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
// Table: coupons
//   PRIMARY KEY coupons_pkey: PRIMARY KEY (id)
//   FOREIGN KEY coupons_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: crawler_logs
//   PRIMARY KEY crawler_logs_pkey: PRIMARY KEY (id)
// Table: crawler_sources
//   PRIMARY KEY crawler_sources_pkey: PRIMARY KEY (id)
// Table: discovered_promotions
//   PRIMARY KEY discovered_promotions_pkey: PRIMARY KEY (id)
// Table: email_logs
//   PRIMARY KEY email_logs_pkey: PRIMARY KEY (id)
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
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: site_mappings
//   UNIQUE site_mappings_domain_key: UNIQUE (domain)
//   PRIMARY KEY site_mappings_pkey: PRIMARY KEY (id)
// Table: site_settings
//   UNIQUE site_settings_key_key: UNIQUE (key)
//   PRIMARY KEY site_settings_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: ad_advertisers
//   Policy "public_all_ad_advertisers" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: ad_campaigns
//   Policy "public_all_ad_campaigns" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: ad_invoices
//   Policy "public_all_ad_invoices" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: ad_pricing
//   Policy "admin_all_ad_pricing" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "public_read_ad_pricing" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: affiliate_partners
//   Policy "anon_insert_affiliates" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "anon_update_affiliates" (UPDATE, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
//   Policy "auth_all_affiliates" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "auth_delete_affiliates" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "master_all_affiliates" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (((( SELECT users.email    FROM auth.users   WHERE (users.id = auth.uid())))::text = 'adailtong@gmail.com'::text) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = ANY (ARRAY['super_admin'::text, 'admin'::text])))
//     WITH CHECK: (((( SELECT users.email    FROM auth.users   WHERE (users.id = auth.uid())))::text = 'adailtong@gmail.com'::text) OR (( SELECT profiles.role    FROM profiles   WHERE (profiles.id = auth.uid())) = ANY (ARRAY['super_admin'::text, 'admin'::text])))
//   Policy "public_select_affiliates" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: affiliate_platforms
//   Policy "admin_all_affiliate_platforms" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//   Policy "public_read_affiliate_platforms" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: affiliate_transactions
//   Policy "auth_all_transactions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: affiliate_withdrawals
//   Policy "auth_all_withdrawals" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: audit_logs
//   Policy "auth_insert_audit_logs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "auth_read_audit_logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: coupons
//   Policy "auth_delete_coupons" (DELETE, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = user_id) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
//   Policy "auth_insert_coupons" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: ((auth.uid() = user_id) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text, 'merchant'::text, 'shopkeeper'::text, 'franchisee'::text]))))))
//   Policy "auth_update_coupons" (UPDATE, PERMISSIVE) roles={public}
//     USING: ((auth.uid() = user_id) OR (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
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
// Table: discovered_promotions
//   Policy "auth_all_promotions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "auth_insert_promotions" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "auth_update_promotions" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "public_all_discovered_promotions" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
//   Policy "public_read_promotions" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: email_logs
//   Policy "admin_all_email_logs" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM profiles   WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))
// Table: franchises
//   Policy "auth_all_franchises" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
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
//   Policy "auth_all_merchants" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "public_read_merchants" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: profiles
//   Policy "auth_update_profiles" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
//   Policy "master_all_profiles" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (((( SELECT users.email    FROM auth.users   WHERE (users.id = auth.uid())))::text = 'adailtong@gmail.com'::text) OR (role = ANY (ARRAY['super_admin'::text, 'admin'::text])))
//     WITH CHECK: (((( SELECT users.email    FROM auth.users   WHERE (users.id = auth.uid())))::text = 'adailtong@gmail.com'::text) OR (role = ANY (ARRAY['super_admin'::text, 'admin'::text])))
//   Policy "public_read_profiles" (SELECT, PERMISSIVE) roles={public}
//     USING: true
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

// --- DATABASE FUNCTIONS ---
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
//   BEGIN
//     -- 1. Insert into profiles with robust coalescing
//     INSERT INTO public.profiles (id, email, name, role, is_affiliate, tax_id)
//     VALUES (
//       NEW.id,
//       NEW.email,
//       COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
//       COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
//       (NEW.raw_user_meta_data->>'role' = 'affiliate'),
//       NEW.raw_user_meta_data->>'tax_id'
//     )
//     ON CONFLICT (id) DO UPDATE
//     SET
//       email = EXCLUDED.email,
//       name = COALESCE(EXCLUDED.name, public.profiles.name),
//       role = COALESCE(EXCLUDED.role, public.profiles.role),
//       is_affiliate = COALESCE(EXCLUDED.is_affiliate, public.profiles.is_affiliate),
//       tax_id = COALESCE(EXCLUDED.tax_id, public.profiles.tax_id);
//
//     -- 2. Insert into affiliate_partners if affiliate
//     IF NEW.raw_user_meta_data->>'role' = 'affiliate' THEN
//       INSERT INTO public.affiliate_partners (id, user_id, email, name, status, tax_id)
//       VALUES (
//         gen_random_uuid(),
//         NEW.id,
//         NEW.email,
//         COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
//         'pending',
//         NEW.raw_user_meta_data->>'tax_id'
//       )
//       ON CONFLICT (email) DO UPDATE
//       SET user_id = EXCLUDED.user_id,
//           tax_id = COALESCE(EXCLUDED.tax_id, public.affiliate_partners.tax_id);
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

// --- INDEXES ---
// Table: ad_campaigns
//   CREATE INDEX idx_ad_campaigns_environment ON public.ad_campaigns USING btree (environment)
// Table: affiliate_partners
//   CREATE UNIQUE INDEX affiliate_partners_email_key ON public.affiliate_partners USING btree (email)
// Table: affiliate_platforms
//   CREATE UNIQUE INDEX affiliate_platforms_name_key ON public.affiliate_platforms USING btree (name)
// Table: affiliate_withdrawals
//   CREATE INDEX idx_affiliate_withdrawals_affiliate_id ON public.affiliate_withdrawals USING btree (affiliate_id)
// Table: coupons
//   CREATE INDEX idx_coupons_environment ON public.coupons USING btree (environment)
// Table: discovered_promotions
//   CREATE UNIQUE INDEX discovered_promotions_unique_hash_idx ON public.discovered_promotions USING btree (unique_hash) WHERE (unique_hash IS NOT NULL)
//   CREATE INDEX idx_discovered_promotions_environment ON public.discovered_promotions USING btree (environment)
// Table: itinerary_items
//   CREATE INDEX idx_itinerary_items_itinerary_id ON public.itinerary_items USING btree (itinerary_id)
// Table: site_mappings
//   CREATE UNIQUE INDEX site_mappings_domain_key ON public.site_mappings USING btree (domain)
// Table: site_settings
//   CREATE UNIQUE INDEX site_settings_key_key ON public.site_settings USING btree (key)
