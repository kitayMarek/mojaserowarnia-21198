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
      contact_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      culture_audit_log: {
        Row: {
          change_source: string | null
          changed_at: string
          changed_by: string | null
          culture_name: string
          culture_shop: string
          field_changed: string
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
          user_id: string | null
        }
        Insert: {
          change_source?: string | null
          changed_at?: string
          changed_by?: string | null
          culture_name: string
          culture_shop: string
          field_changed: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          user_id?: string | null
        }
        Update: {
          change_source?: string | null
          changed_at?: string
          changed_by?: string | null
          culture_name?: string
          culture_shop?: string
          field_changed?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feed_recipes: {
        Row: {
          created_at: string
          id: string
          nazwa: string
          norma: string
          skladniki: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nazwa: string
          norma: string
          skladniki: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nazwa?: string
          norma?: string
          skladniki?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          data_wystawienia: string
          id: string
          kwota_brutto: number
          kwota_netto: number
          nabywca_adres: string
          nabywca_nazwa: string
          nabywca_nip: string | null
          numer_rachunku: string
          pozycje: Json
          user_id: string
          uwagi: string | null
          wydrukowany: boolean
        }
        Insert: {
          created_at?: string
          data_wystawienia: string
          id?: string
          kwota_brutto: number
          kwota_netto: number
          nabywca_adres: string
          nabywca_nazwa: string
          nabywca_nip?: string | null
          numer_rachunku: string
          pozycje: Json
          user_id: string
          uwagi?: string | null
          wydrukowany?: boolean
        }
        Update: {
          created_at?: string
          data_wystawienia?: string
          id?: string
          kwota_brutto?: number
          kwota_netto?: number
          nabywca_adres?: string
          nabywca_nazwa?: string
          nabywca_nip?: string | null
          numer_rachunku?: string
          pozycje?: Json
          user_id?: string
          uwagi?: string | null
          wydrukowany?: boolean
        }
        Relationships: []
      }
      news_banners: {
        Row: {
          created_at: string
          date: string
          display_order: number | null
          id: string
          image_url: string | null
          is_published: boolean
          link_url: string
          subtitle: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          link_url: string
          subtitle?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          link_url?: string
          subtitle?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          id: string
          jednostka: string
          nazwa: string
          ostatnia_cena: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jednostka?: string
          nazwa: string
          ostatnia_cena?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jednostka?: string
          nazwa?: string
          ostatnia_cena?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          adres: string | null
          created_at: string
          email: string | null
          firma_nazwa: string | null
          id: string
          marketing_consent: boolean
          marketing_consent_date: string | null
          nip: string | null
          nr_weterynaryjny: string | null
          telefon: string | null
          updated_at: string
        }
        Insert: {
          adres?: string | null
          created_at?: string
          email?: string | null
          firma_nazwa?: string | null
          id: string
          marketing_consent?: boolean
          marketing_consent_date?: string | null
          nip?: string | null
          nr_weterynaryjny?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Update: {
          adres?: string | null
          created_at?: string
          email?: string | null
          firma_nazwa?: string | null
          id?: string
          marketing_consent?: boolean
          marketing_consent_date?: string | null
          nip?: string | null
          nr_weterynaryjny?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      sales_records: {
        Row: {
          created_at: string
          data_sprzedazy: string
          id: string
          ilosc: number
          jednostka: string
          kwota_przychodu: number
          numer_rachunku: string | null
          odbiorca_nazwa: string | null
          odbiorca_typ: string
          rodzaj_zywnosci: string
          user_id: string
          uwagi: string | null
        }
        Insert: {
          created_at?: string
          data_sprzedazy: string
          id?: string
          ilosc: number
          jednostka: string
          kwota_przychodu: number
          numer_rachunku?: string | null
          odbiorca_nazwa?: string | null
          odbiorca_typ: string
          rodzaj_zywnosci: string
          user_id: string
          uwagi?: string | null
        }
        Update: {
          created_at?: string
          data_sprzedazy?: string
          id?: string
          ilosc?: number
          jednostka?: string
          kwota_przychodu?: number
          numer_rachunku?: string | null
          odbiorca_nazwa?: string | null
          odbiorca_typ?: string
          rodzaj_zywnosci?: string
          user_id?: string
          uwagi?: string | null
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      reactions_stats: {
        Row: {
          content_id: string | null
          content_type: string | null
          likes_count: number | null
          loves_count: number | null
          total_points: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_contact_attempts: { Args: never; Returns: undefined }
      generate_invoice_number: { Args: { user_uuid: string }; Returns: string }
      get_users_with_roles: {
        Args: never
        Returns: {
          adres: string
          created_at: string
          email: string
          firma_nazwa: string
          marketing_consent: boolean
          marketing_consent_date: string
          nip: string
          roles: string[]
          telefon: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
