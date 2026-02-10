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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      look_items: {
        Row: {
          created_at: string
          id: string
          look_id: string
          position: number | null
          wardrobe_item_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          look_id: string
          position?: number | null
          wardrobe_item_id: string
        }
        Update: {
          created_at?: string
          id?: string
          look_id?: string
          position?: number | null
          wardrobe_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "look_items_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: false
            referencedRelation: "looks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "look_items_wardrobe_item_id_fkey"
            columns: ["wardrobe_item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
        ]
      }
      looks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_favorite: boolean | null
          name: string
          occasion: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean | null
          name: string
          occasion?: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean | null
          name?: string
          occasion?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      outfit_logs: {
        Row: {
          created_at: string
          date: string
          from_ai_suggestion: boolean | null
          id: string
          occasion: string | null
          photo_url: string | null
          user_id: string
          wardrobe_item_ids: string[]
          weather_snapshot: Json | null
        }
        Insert: {
          created_at?: string
          date: string
          from_ai_suggestion?: boolean | null
          id?: string
          occasion?: string | null
          photo_url?: string | null
          user_id: string
          wardrobe_item_ids?: string[]
          weather_snapshot?: Json | null
        }
        Update: {
          created_at?: string
          date?: string
          from_ai_suggestion?: boolean | null
          id?: string
          occasion?: string | null
          photo_url?: string | null
          user_id?: string
          wardrobe_item_ids?: string[]
          weather_snapshot?: Json | null
        }
        Relationships: []
      }
      plan_limits: {
        Row: {
          ai_stylist_enabled: boolean
          created_at: string
          id: string
          looks_limit: number
          plan: string
          priority_support: boolean
          wardrobe_limit: number
        }
        Insert: {
          ai_stylist_enabled?: boolean
          created_at?: string
          id?: string
          looks_limit: number
          plan: string
          priority_support?: boolean
          wardrobe_limit: number
        }
        Update: {
          ai_stylist_enabled?: boolean
          created_at?: string
          id?: string
          looks_limit?: number
          plan?: string
          priority_support?: boolean
          wardrobe_limit?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          body_type: string | null
          budget_max: number | null
          budget_min: number | null
          chest: number | null
          created_at: string
          disliked_colors: string[] | null
          favorite_colors: string[] | null
          full_name: string | null
          gender: string | null
          height: number | null
          hips: number | null
          id: string
          latitude: number | null
          location_city: string | null
          location_country: string | null
          longitude: number | null
          occasion_preferences: Json | null
          photos: string[] | null
          preferred_brands: string[] | null
          preferred_styles: string[] | null
          shoe_size: string | null
          style_avatars: Json | null
          updated_at: string
          user_id: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          body_type?: string | null
          budget_max?: number | null
          budget_min?: number | null
          chest?: number | null
          created_at?: string
          disliked_colors?: string[] | null
          favorite_colors?: string[] | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          hips?: number | null
          id?: string
          latitude?: number | null
          location_city?: string | null
          location_country?: string | null
          longitude?: number | null
          occasion_preferences?: Json | null
          photos?: string[] | null
          preferred_brands?: string[] | null
          preferred_styles?: string[] | null
          shoe_size?: string | null
          style_avatars?: Json | null
          updated_at?: string
          user_id: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          body_type?: string | null
          budget_max?: number | null
          budget_min?: number | null
          chest?: number | null
          created_at?: string
          disliked_colors?: string[] | null
          favorite_colors?: string[] | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          hips?: number | null
          id?: string
          latitude?: number | null
          location_city?: string | null
          location_country?: string | null
          longitude?: number | null
          occasion_preferences?: Json | null
          photos?: string[] | null
          preferred_brands?: string[] | null
          preferred_styles?: string[] | null
          shoe_size?: string | null
          style_avatars?: Json | null
          updated_at?: string
          user_id?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wardrobe_items: {
        Row: {
          brand: string | null
          category: string
          color: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          image_url: string
          is_favorite: boolean | null
          name: string
          ownership_status: string
          price: number | null
          season: string | null
          source_url: string | null
          subcategory: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category: string
          color?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_favorite?: boolean | null
          name: string
          ownership_status?: string
          price?: number | null
          season?: string | null
          source_url?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_favorite?: boolean | null
          name?: string
          ownership_status?: string
          price?: number | null
          season?: string | null
          source_url?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_status: "active" | "canceled" | "past_due" | "trialing"
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
      subscription_status: ["active", "canceled", "past_due", "trialing"],
    },
  },
} as const
