export type ProfileRow = {
  id: string;
  state: string;
  disco: string;
  band: string;
  meter_category: string;
  display_name: string | null;
  created_at: string;
};

export type PurchaseRow = {
  id: string;
  user_id: string;
  amount_kobo: number;
  units_received: number;
  disco_at_purchase: string;
  band_at_purchase: string;
  category_at_purchase: string;
  rate_at_purchase_kobo: number;
  purchased_at: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at"> & { created_at?: string };
        Update: Partial<Omit<ProfileRow, "id" | "created_at">>;
        Relationships: [];
      };
      purchases: {
        Row: PurchaseRow;
        Insert: Omit<PurchaseRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<PurchaseRow, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      delete_account: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
