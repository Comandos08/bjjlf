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
      academy_permits: {
        Row: {
          academy_id: string | null
          academy_name: string
          address: string | null
          alert_30_sent: boolean
          alert_7_sent: boolean
          amount_cents: number
          city: string
          country: string
          country_flag: string | null
          created_at: string
          email: string
          expires_at: string | null
          id: string
          issued_at: string | null
          paid_at: string | null
          permit_number: string | null
          phone: string | null
          previous_permit_id: string | null
          renewal_count: number
          responsible_name: string
          state: string | null
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          academy_id?: string | null
          academy_name: string
          address?: string | null
          alert_30_sent?: boolean
          alert_7_sent?: boolean
          amount_cents?: number
          city: string
          country?: string
          country_flag?: string | null
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          paid_at?: string | null
          permit_number?: string | null
          phone?: string | null
          previous_permit_id?: string | null
          renewal_count?: number
          responsible_name: string
          state?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          academy_id?: string | null
          academy_name?: string
          address?: string | null
          alert_30_sent?: boolean
          alert_7_sent?: boolean
          amount_cents?: number
          city?: string
          country?: string
          country_flag?: string | null
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          paid_at?: string | null
          permit_number?: string | null
          phone?: string | null
          previous_permit_id?: string | null
          renewal_count?: number
          responsible_name?: string
          state?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_permits_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "affiliated_academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_permits_previous_permit_id_fkey"
            columns: ["previous_permit_id"]
            isOneToOne: false
            referencedRelation: "academy_permits"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: string
        }
        Relationships: []
      }
      affiliated_academies: {
        Row: {
          affiliated_since: string
          belt: string
          belt_degree: number
          city: string
          country: string
          country_code: string
          created_at: string
          flag_emoji: string | null
          id: string
          instagram_url: string | null
          is_active: boolean
          logo_url: string | null
          name: string
          professor: string
          slug: string
          state: string | null
          website_url: string | null
        }
        Insert: {
          affiliated_since: string
          belt: string
          belt_degree?: number
          city: string
          country: string
          country_code: string
          created_at?: string
          flag_emoji?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          logo_url?: string | null
          name: string
          professor: string
          slug: string
          state?: string | null
          website_url?: string | null
        }
        Update: {
          affiliated_since?: string
          belt?: string
          belt_degree?: number
          city?: string
          country?: string
          country_code?: string
          created_at?: string
          flag_emoji?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          logo_url?: string | null
          name?: string
          professor?: string
          slug?: string
          state?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      athlete_profiles: {
        Row: {
          academy: string | null
          approved_at: string | null
          approved_by: string | null
          belt: string
          category: string | null
          country: string | null
          country_flag: string | null
          created_at: string
          degree: number
          first_login_completed: boolean
          full_name: string
          id: string
          modality: string | null
          photo_url: string | null
          professor: string | null
          registration_number: string | null
          status: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          academy?: string | null
          approved_at?: string | null
          approved_by?: string | null
          belt?: string
          category?: string | null
          country?: string | null
          country_flag?: string | null
          created_at?: string
          degree?: number
          first_login_completed?: boolean
          full_name: string
          id?: string
          modality?: string | null
          photo_url?: string | null
          professor?: string | null
          registration_number?: string | null
          status?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          academy?: string | null
          approved_at?: string | null
          approved_by?: string | null
          belt?: string
          category?: string | null
          country?: string | null
          country_flag?: string | null
          created_at?: string
          degree?: number
          first_login_completed?: boolean
          full_name?: string
          id?: string
          modality?: string | null
          photo_url?: string | null
          professor?: string | null
          registration_number?: string | null
          status?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      certified_black_belts: {
        Row: {
          academy: string | null
          athlete_name: string
          belt_degree: number
          belt_type: string
          bio: string | null
          certificate_number: string
          certified_at: string
          city: string | null
          country_code: string
          created_at: string
          flag_emoji: string | null
          id: string
          is_active: boolean
          photo_url: string | null
          professor: string | null
        }
        Insert: {
          academy?: string | null
          athlete_name: string
          belt_degree?: number
          belt_type: string
          bio?: string | null
          certificate_number: string
          certified_at: string
          city?: string | null
          country_code: string
          created_at?: string
          flag_emoji?: string | null
          id?: string
          is_active?: boolean
          photo_url?: string | null
          professor?: string | null
        }
        Update: {
          academy?: string | null
          athlete_name?: string
          belt_degree?: number
          belt_type?: string
          bio?: string | null
          certificate_number?: string
          certified_at?: string
          city?: string | null
          country_code?: string
          created_at?: string
          flag_emoji?: string | null
          id?: string
          is_active?: boolean
          photo_url?: string | null
          professor?: string | null
        }
        Relationships: []
      }
      competition_history: {
        Row: {
          athlete_id: string
          category: string | null
          created_at: string
          event_date: string
          event_name: string
          id: string
          location: string | null
          medal: string | null
          result: string | null
          weight_class: string | null
        }
        Insert: {
          athlete_id: string
          category?: string | null
          created_at?: string
          event_date: string
          event_name: string
          id?: string
          location?: string | null
          medal?: string | null
          result?: string | null
          weight_class?: string | null
        }
        Update: {
          athlete_id?: string
          category?: string | null
          created_at?: string
          event_date?: string
          event_name?: string
          id?: string
          location?: string | null
          medal?: string | null
          result?: string | null
          weight_class?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_history_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_history_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
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
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      event_prices: {
        Row: {
          amount_cents: number
          category: string
          created_at: string
          currency: string
          early_bird_cents: number | null
          early_bird_until: string | null
          event_id: string
          id: string
          modality: string
        }
        Insert: {
          amount_cents?: number
          category: string
          created_at?: string
          currency?: string
          early_bird_cents?: number | null
          early_bird_until?: string | null
          event_id: string
          id?: string
          modality: string
        }
        Update: {
          amount_cents?: number
          category?: string
          created_at?: string
          currency?: string
          early_bird_cents?: number | null
          early_bird_until?: string | null
          event_id?: string
          id?: string
          modality?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          academy: string | null
          amount_cents: number
          athlete_id: string | null
          belt: string
          category: string
          country: string | null
          created_at: string
          degree: number
          email: string
          event_id: string
          full_name: string
          id: string
          modality: string
          paid_at: string | null
          phone: string | null
          professor: string | null
          registration_number: string | null
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
          weight_class: string
        }
        Insert: {
          academy?: string | null
          amount_cents?: number
          athlete_id?: string | null
          belt: string
          category: string
          country?: string | null
          created_at?: string
          degree?: number
          email: string
          event_id: string
          full_name: string
          id?: string
          modality: string
          paid_at?: string | null
          phone?: string | null
          professor?: string | null
          registration_number?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
          weight_class: string
        }
        Update: {
          academy?: string | null
          amount_cents?: number
          athlete_id?: string | null
          belt?: string
          category?: string
          country?: string | null
          created_at?: string
          degree?: number
          email?: string
          event_id?: string
          full_name?: string
          id?: string
          modality?: string
          paid_at?: string | null
          phone?: string | null
          professor?: string | null
          registration_number?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
          weight_class?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          city: string
          country: string
          country_code: string
          created_at: string
          end_date: string | null
          event_date: string
          event_type: string
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name_en: string
          name_pt: string
          registration_url: string | null
          show_on_home: boolean
          status: string
        }
        Insert: {
          city: string
          country: string
          country_code: string
          created_at?: string
          end_date?: string | null
          event_date: string
          event_type: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name_en: string
          name_pt: string
          registration_url?: string | null
          show_on_home?: boolean
          status?: string
        }
        Update: {
          city?: string
          country?: string
          country_code?: string
          created_at?: string
          end_date?: string | null
          event_date?: string
          event_type?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name_en?: string
          name_pt?: string
          registration_url?: string | null
          show_on_home?: boolean
          status?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          badge1_label: string | null
          badge2_label: string | null
          created_at: string
          cta_primary_url: string | null
          cta_secondary_url: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          subtitle_en: string | null
          subtitle_pt: string | null
          tag_en: string | null
          tag_pt: string | null
          title_en: string
          title_pt: string
        }
        Insert: {
          badge1_label?: string | null
          badge2_label?: string | null
          created_at?: string
          cta_primary_url?: string | null
          cta_secondary_url?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          subtitle_en?: string | null
          subtitle_pt?: string | null
          tag_en?: string | null
          tag_pt?: string | null
          title_en: string
          title_pt: string
        }
        Update: {
          badge1_label?: string | null
          badge2_label?: string | null
          created_at?: string
          cta_primary_url?: string | null
          cta_secondary_url?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          subtitle_en?: string | null
          subtitle_pt?: string | null
          tag_en?: string | null
          tag_pt?: string | null
          title_en?: string
          title_pt?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author: string | null
          body_en: string | null
          body_pt: string | null
          category: string
          cover_image_url: string | null
          created_at: string
          excerpt_en: string | null
          excerpt_pt: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          published_at: string | null
          slug: string
          title_en: string
          title_pt: string
        }
        Insert: {
          author?: string | null
          body_en?: string | null
          body_pt?: string | null
          category: string
          cover_image_url?: string | null
          created_at?: string
          excerpt_en?: string | null
          excerpt_pt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          slug: string
          title_en: string
          title_pt: string
        }
        Update: {
          author?: string | null
          body_en?: string | null
          body_pt?: string | null
          category?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt_en?: string | null
          excerpt_pt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title_en?: string
          title_pt?: string
        }
        Relationships: []
      }
      rankings: {
        Row: {
          academy: string | null
          athlete_name: string
          belt: string
          category: string
          country_code: string
          created_at: string
          flag_emoji: string | null
          gender: string
          id: string
          is_active: boolean
          modality: string
          points: number
          position: number | null
          season: string
        }
        Insert: {
          academy?: string | null
          athlete_name: string
          belt: string
          category: string
          country_code: string
          created_at?: string
          flag_emoji?: string | null
          gender: string
          id?: string
          is_active?: boolean
          modality: string
          points?: number
          position?: number | null
          season: string
        }
        Update: {
          academy?: string | null
          athlete_name?: string
          belt?: string
          category?: string
          country_code?: string
          created_at?: string
          flag_emoji?: string | null
          gender?: string
          id?: string
          is_active?: boolean
          modality?: string
          points?: number
          position?: number | null
          season?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          thumbnail_url: string | null
          title_en: string
          title_pt: string
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          thumbnail_url?: string | null
          title_en: string
          title_pt: string
          youtube_id: string
          youtube_url: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          thumbnail_url?: string | null
          title_en?: string
          title_pt?: string
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_athlete_profiles: {
        Row: {
          academy: string | null
          belt: string | null
          country: string | null
          country_flag: string | null
          degree: number | null
          full_name: string | null
          id: string | null
          photo_url: string | null
          registration_number: string | null
          status: string | null
        }
        Insert: {
          academy?: string | null
          belt?: string | null
          country?: string | null
          country_flag?: string | null
          degree?: number | null
          full_name?: string | null
          id?: string | null
          photo_url?: string | null
          registration_number?: string | null
          status?: string | null
        }
        Update: {
          academy?: string | null
          belt?: string | null
          country?: string | null
          country_flag?: string | null
          degree?: number | null
          full_name?: string | null
          id?: string | null
          photo_url?: string | null
          registration_number?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bootstrap_first_admin: {
        Args: { _email: string; _full_name: string; _user_id: string }
        Returns: undefined
      }
      get_own_permit: {
        Args: { p_permit_number: string }
        Returns: {
          academy_id: string | null
          academy_name: string
          address: string | null
          alert_30_sent: boolean
          alert_7_sent: boolean
          amount_cents: number
          city: string
          country: string
          country_flag: string | null
          created_at: string
          email: string
          expires_at: string | null
          id: string
          issued_at: string | null
          paid_at: string | null
          permit_number: string | null
          phone: string | null
          previous_permit_id: string | null
          renewal_count: number
          responsible_name: string
          state: string | null
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
          website: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "academy_permits"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_admin_role: { Args: { _roles: string[] }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      super_admin_exists: { Args: never; Returns: boolean }
      verify_academy_permit: {
        Args: { p_permit_number: string }
        Returns: {
          academy_name: string
          city: string
          country: string
          country_flag: string
          expires_at: string
          issued_at: string
          permit_number: string
          renewal_count: number
          responsible_name: string
          status: string
        }[]
      }
      verify_athlete: {
        Args: { _registration_number: string }
        Returns: {
          academy: string
          belt: string
          degree: number
          full_name: string
          registration_number: string
          status: string
          valid_until: string
        }[]
      }
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
