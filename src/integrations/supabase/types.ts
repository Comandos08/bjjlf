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
          academy_logo_url: string | null
          academy_name: string
          additional_professors: Json
          address: string | null
          alert_30_sent: boolean
          alert_7_sent: boolean
          amount_cents: number
          athlete_id: string | null
          city: string
          country: string
          country_code: string | null
          country_flag: string | null
          created_at: string
          email: string
          expires_at: string | null
          id: string
          instagram: string | null
          issued_at: string | null
          notes: string | null
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
          belt: string | null
          belt_degree: number | null
        }
        Insert: {
          academy_id?: string | null
          academy_logo_url?: string | null
          academy_name: string
          additional_professors?: Json
          address?: string | null
          alert_30_sent?: boolean
          alert_7_sent?: boolean
          amount_cents?: number
          athlete_id?: string | null
          city: string
          country?: string
          country_code?: string | null
          country_flag?: string | null
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          instagram?: string | null
          issued_at?: string | null
          notes?: string | null
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
          belt?: string | null
          belt_degree?: number | null
        }
        Update: {
          academy_id?: string | null
          academy_logo_url?: string | null
          academy_name?: string
          additional_professors?: Json
          address?: string | null
          alert_30_sent?: boolean
          alert_7_sent?: boolean
          amount_cents?: number
          athlete_id?: string | null
          city?: string
          country?: string
          country_code?: string | null
          country_flag?: string | null
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          instagram?: string | null
          issued_at?: string | null
          notes?: string | null
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
          belt?: string | null
          belt_degree?: number | null
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
          {
            foreignKeyName: "academy_permits_previous_permit_id_fkey"
            columns: ["previous_permit_id"]
            isOneToOne: false
            referencedRelation: "affiliated_academies_view"
            referencedColumns: ["id"]
          },
        ]
      }
