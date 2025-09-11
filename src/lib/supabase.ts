import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use browser client for client-side authentication (uses cookies, not LocalStorage)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          company: string | null
          position: string | null
          credits_available: number
          credits_total: number
          credits_last_updated: string
          answering_mode_selected: 'simple' | 'pro'
          answering_mode_last_updated: string
          answering_mode_is_active: boolean
          paddle_customer_id: string | null
          subscription_status: string | null
          subscription_id: string | null
          subscription_tier: string | null
          credits_allocated_monthly: number | null
          subscription_renewal_date: string | null
          last_subscription_update: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          company?: string | null
          position?: string | null
          credits_available?: number
          credits_total?: number
          credits_last_updated?: string
          answering_mode_selected?: 'simple' | 'pro'
          answering_mode_last_updated?: string
          answering_mode_is_active?: boolean
          paddle_customer_id?: string | null
          subscription_status?: string | null
          subscription_id?: string | null
          subscription_tier?: string | null
          credits_allocated_monthly?: number | null
          subscription_renewal_date?: string | null
          last_subscription_update?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          company?: string | null
          position?: string | null
          credits_available?: number
          credits_total?: number
          credits_last_updated?: string
          answering_mode_selected?: 'simple' | 'pro'
          answering_mode_last_updated?: string
          answering_mode_is_active?: boolean
          paddle_customer_id?: string | null
          subscription_status?: string | null
          subscription_id?: string | null
          subscription_tier?: string | null
          credits_allocated_monthly?: number | null
          subscription_renewal_date?: string | null
          last_subscription_update?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          company: string | null
          position: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company?: string | null
          position?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company?: string | null
          position?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credits: {
        Row: {
          id: string
          user_id: string
          available: number
          total: number
          last_updated: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          available?: number
          total?: number
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          available?: number
          total?: number
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
      }
      answering_modes: {
        Row: {
          id: string
          user_id: string
          selected_mode: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          selected_mode?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          selected_mode?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      business_profiles: {
        Row: {
          id: string
          user_id: string
          business_name: string
          business_main_category: string
          business_secondary_category: string | null
          business_tags: string[] | null
          main_products_services: string
          brief_description: string | null
          country: string
          state_province: string
          language: 'English' | 'Spanish' | 'French' | 'German' | 'Italian' | 'Portuguese' | 'Other'
          response_tone: 'Professional' | 'Friendly' | 'Casual' | 'Formal'
          response_length: 'Brief' | 'Standard' | 'Detailed'
          greetings: string | null
          signatures: string | null
          positive_review_cta: string | null
          negative_review_escalation: string | null
          brand_voice_notes: string | null
          other_considerations: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          business_main_category: string
          business_secondary_category?: string | null
          business_tags?: string[] | null
          main_products_services: string
          brief_description?: string | null
          country: string
          state_province: string
          language?: 'English' | 'Spanish' | 'French' | 'German' | 'Italian' | 'Portuguese' | 'Other'
          response_tone?: 'Professional' | 'Friendly' | 'Casual' | 'Formal'
          response_length?: 'Brief' | 'Standard' | 'Detailed'
          greetings?: string | null
          signatures?: string | null
          positive_review_cta?: string | null
          negative_review_escalation?: string | null
          brand_voice_notes?: string | null
          other_considerations?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          business_main_category?: string
          business_secondary_category?: string | null
          business_tags?: string[] | null
          main_products_services?: string
          brief_description?: string | null
          country?: string
          state_province?: string
          language?: 'English' | 'Spanish' | 'French' | 'German' | 'Italian' | 'Portuguese' | 'Other'
          response_tone?: 'Professional' | 'Friendly' | 'Casual' | 'Formal'
          response_length?: 'Brief' | 'Standard' | 'Detailed'
          greetings?: string | null
          signatures?: string | null
          positive_review_cta?: string | null
          negative_review_escalation?: string | null
          brand_voice_notes?: string | null
          other_considerations?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          content: string
          has_text: boolean
          rating: number
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          has_text?: boolean
          rating?: number
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          has_text?: boolean
          rating?: number
          version?: number
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          subscription_id: string
          user_id: string
          paddle_customer_id: string
          subscription_status: string
          price_id: string | null
          product_id: string | null
          scheduled_change: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          subscription_id: string
          user_id: string
          paddle_customer_id: string
          subscription_status: string
          price_id?: string | null
          product_id?: string | null
          scheduled_change?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          subscription_id?: string
          user_id?: string
          paddle_customer_id?: string
          subscription_status?: string
          price_id?: string | null
          product_id?: string | null
          scheduled_change?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          job_type: string
          payload: Record<string, unknown>
          result: Record<string, unknown> | null
          error: string | null
          retry_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          job_type: string
          payload: Record<string, unknown>
          result?: Record<string, unknown> | null
          error?: string | null
          retry_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          job_type?: string
          payload?: Record<string, unknown>
          result?: Record<string, unknown> | null
          error?: string | null
          retry_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
