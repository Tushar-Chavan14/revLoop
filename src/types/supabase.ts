export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      notifications: {
        Row: {
          actor_id: string | null;
          created_at: string;
          id: string;
          message: string;
          read_at: string | null;
          ride_id: string | null;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Insert: {
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          message: string;
          read_at?: string | null;
          ride_id?: string | null;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Update: {
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          message?: string;
          read_at?: string | null;
          ride_id?: string | null;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides_with_stats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      organizer_payout_details: {
        Row: {
          bank_account_name: string | null;
          bank_account_number: string | null;
          bank_ifsc: string | null;
          created_at: string;
          id: string;
          payout_method: Database["public"]["Enums"]["payout_method"];
          updated_at: string;
          upi_id: string | null;
          user_id: string;
        };
        Insert: {
          bank_account_name?: string | null;
          bank_account_number?: string | null;
          bank_ifsc?: string | null;
          created_at?: string;
          id?: string;
          payout_method: Database["public"]["Enums"]["payout_method"];
          updated_at?: string;
          upi_id?: string | null;
          user_id: string;
        };
        Update: {
          bank_account_name?: string | null;
          bank_account_number?: string | null;
          bank_ifsc?: string | null;
          created_at?: string;
          id?: string;
          payout_method?: Database["public"]["Enums"]["payout_method"];
          updated_at?: string;
          upi_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organizer_payout_details_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          bike_brand: string | null;
          bike_model: string | null;
          bio: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          experience_level: Database["public"]["Enums"]["rider_level"] | null;
          id: string;
          instagram_handle: string | null;
          name: string;
          profile_image_url: string | null;
          updated_at: string;
          username: string;
          years_riding: number | null;
        };
        Insert: {
          bike_brand?: string | null;
          bike_model?: string | null;
          bio?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          experience_level?: Database["public"]["Enums"]["rider_level"] | null;
          id: string;
          instagram_handle?: string | null;
          name: string;
          profile_image_url?: string | null;
          updated_at?: string;
          username: string;
          years_riding?: number | null;
        };
        Update: {
          bike_brand?: string | null;
          bike_model?: string | null;
          bio?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          experience_level?: Database["public"]["Enums"]["rider_level"] | null;
          id?: string;
          instagram_handle?: string | null;
          name?: string;
          profile_image_url?: string | null;
          updated_at?: string;
          username?: string;
          years_riding?: number | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          rating: number;
          reviewee_id: string;
          reviewer_id: string;
          ride_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating: number;
          reviewee_id: string;
          reviewer_id: string;
          ride_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating?: number;
          reviewee_id?: string;
          reviewer_id?: string;
          ride_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_reviewee_id_fkey";
            columns: ["reviewee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides_with_stats";
            referencedColumns: ["id"];
          },
        ];
      };
      ride_bookings: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          id: string;
          organizer_amount: number;
          paid_at: string | null;
          platform_fee_amount: number;
          razorpay_order_id: string;
          razorpay_payment_id: string | null;
          ride_id: string;
          rider_id: string;
          settled_at: string | null;
          status: Database["public"]["Enums"]["booking_status"];
        };
        Insert: {
          amount: number;
          created_at?: string;
          currency?: string;
          id?: string;
          organizer_amount: number;
          paid_at?: string | null;
          platform_fee_amount: number;
          razorpay_order_id: string;
          razorpay_payment_id?: string | null;
          ride_id: string;
          rider_id: string;
          settled_at?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          organizer_amount?: number;
          paid_at?: string | null;
          platform_fee_amount?: number;
          razorpay_order_id?: string;
          razorpay_payment_id?: string | null;
          ride_id?: string;
          rider_id?: string;
          settled_at?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
        };
        Relationships: [
          {
            foreignKeyName: "ride_bookings_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ride_bookings_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides_with_stats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ride_bookings_rider_id_fkey";
            columns: ["rider_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ride_images: {
        Row: {
          created_at: string;
          id: string;
          image_url: string;
          ride_id: string;
          uploader_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url: string;
          ride_id: string;
          uploader_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string;
          ride_id?: string;
          uploader_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ride_images_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ride_images_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides_with_stats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ride_images_uploader_id_fkey";
            columns: ["uploader_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ride_members: {
        Row: {
          attendance_status: Database["public"]["Enums"]["attendance_status"];
          id: string;
          joined_at: string;
          last_read_at: string | null;
          ride_id: string;
          role: Database["public"]["Enums"]["member_role"];
          user_id: string;
        };
        Insert: {
          attendance_status?: Database["public"]["Enums"]["attendance_status"];
          id?: string;
          joined_at?: string;
          last_read_at?: string | null;
          ride_id: string;
          role?: Database["public"]["Enums"]["member_role"];
          user_id: string;
        };
        Update: {
          attendance_status?: Database["public"]["Enums"]["attendance_status"];
          id?: string;
          joined_at?: string;
          last_read_at?: string | null;
          ride_id?: string;
          role?: Database["public"]["Enums"]["member_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ride_members_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ride_members_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides_with_stats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ride_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ride_messages: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          image_url: string | null;
          ride_id: string;
          sender_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          ride_id: string;
          sender_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          ride_id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ride_messages_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ride_messages_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides_with_stats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ride_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ride_requests: {
        Row: {
          created_at: string;
          id: string;
          message: string | null;
          requester_id: string;
          responded_at: string | null;
          ride_id: string;
          status: Database["public"]["Enums"]["request_status"];
        };
        Insert: {
          created_at?: string;
          id?: string;
          message?: string | null;
          requester_id: string;
          responded_at?: string | null;
          ride_id: string;
          status?: Database["public"]["Enums"]["request_status"];
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string | null;
          requester_id?: string;
          responded_at?: string | null;
          ride_id?: string;
          status?: Database["public"]["Enums"]["request_status"];
        };
        Relationships: [
          {
            foreignKeyName: "ride_requests_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ride_requests_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ride_requests_ride_id_fkey";
            columns: ["ride_id"];
            isOneToOne: false;
            referencedRelation: "rides_with_stats";
            referencedColumns: ["id"];
          },
        ];
      };
      rides: {
        Row: {
          booking_deadline: string | null;
          breakfast_stop: boolean;
          cancellation_policy: string | null;
          city: string;
          cover_image_url: string | null;
          created_at: string;
          currency: string;
          departure_time: string;
          description: string | null;
          destination: string;
          destination_lat: number;
          destination_lng: number;
          destination_map_url: string | null;
          difficulty: Database["public"]["Enums"]["rider_level"];
          estimated_distance_km: number | null;
          estimated_duration_minutes: number | null;
          fuel_stop: boolean;
          helmet_required: boolean;
          id: string;
          max_riders: number;
          meeting_lat: number;
          meeting_lng: number;
          meeting_point: string;
          minimum_riders: number | null;
          organizer_id: string;
          pillion_allowed: boolean;
          pricing_model: Database["public"]["Enums"]["pricing_model"];
          ride_date: string;
          ride_exclusions: string[];
          ride_fee: number | null;
          ride_inclusions: string[];
          ride_itinerary: Json;
          ride_type: Database["public"]["Enums"]["ride_type"];
          speed: Database["public"]["Enums"]["speed_level"];
          status: Database["public"]["Enums"]["ride_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          booking_deadline?: string | null;
          breakfast_stop?: boolean;
          cancellation_policy?: string | null;
          city: string;
          cover_image_url?: string | null;
          created_at?: string;
          currency?: string;
          departure_time: string;
          description?: string | null;
          destination: string;
          destination_lat: number;
          destination_lng: number;
          destination_map_url?: string | null;
          difficulty: Database["public"]["Enums"]["rider_level"];
          estimated_distance_km?: number | null;
          estimated_duration_minutes?: number | null;
          fuel_stop?: boolean;
          helmet_required?: boolean;
          id?: string;
          max_riders: number;
          meeting_lat: number;
          meeting_lng: number;
          meeting_point: string;
          minimum_riders?: number | null;
          organizer_id: string;
          pillion_allowed?: boolean;
          pricing_model?: Database["public"]["Enums"]["pricing_model"];
          ride_date: string;
          ride_exclusions?: string[];
          ride_fee?: number | null;
          ride_inclusions?: string[];
          ride_itinerary?: Json;
          ride_type: Database["public"]["Enums"]["ride_type"];
          speed: Database["public"]["Enums"]["speed_level"];
          status?: Database["public"]["Enums"]["ride_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          booking_deadline?: string | null;
          breakfast_stop?: boolean;
          cancellation_policy?: string | null;
          city?: string;
          cover_image_url?: string | null;
          created_at?: string;
          currency?: string;
          departure_time?: string;
          description?: string | null;
          destination?: string;
          destination_lat?: number;
          destination_lng?: number;
          destination_map_url?: string | null;
          difficulty?: Database["public"]["Enums"]["rider_level"];
          estimated_distance_km?: number | null;
          estimated_duration_minutes?: number | null;
          fuel_stop?: boolean;
          helmet_required?: boolean;
          id?: string;
          max_riders?: number;
          meeting_lat?: number;
          meeting_lng?: number;
          meeting_point?: string;
          minimum_riders?: number | null;
          organizer_id?: string;
          pillion_allowed?: boolean;
          pricing_model?: Database["public"]["Enums"]["pricing_model"];
          ride_date?: string;
          ride_exclusions?: string[];
          ride_fee?: number | null;
          ride_inclusions?: string[];
          ride_itinerary?: Json;
          ride_type?: Database["public"]["Enums"]["ride_type"];
          speed?: Database["public"]["Enums"]["speed_level"];
          status?: Database["public"]["Enums"]["ride_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rides_organizer_id_fkey";
            columns: ["organizer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      rides_with_stats: {
        Row: {
          booking_deadline: string | null;
          breakfast_stop: boolean | null;
          cancellation_policy: string | null;
          city: string | null;
          cover_image_url: string | null;
          created_at: string | null;
          currency: string | null;
          departure_time: string | null;
          description: string | null;
          destination: string | null;
          destination_lat: number | null;
          destination_lng: number | null;
          destination_map_url: string | null;
          difficulty: Database["public"]["Enums"]["rider_level"] | null;
          estimated_distance_km: number | null;
          estimated_duration_minutes: number | null;
          fuel_stop: boolean | null;
          helmet_required: boolean | null;
          id: string | null;
          max_riders: number | null;
          meeting_lat: number | null;
          meeting_lng: number | null;
          meeting_point: string | null;
          member_count: number | null;
          minimum_riders: number | null;
          organizer_id: string | null;
          pillion_allowed: boolean | null;
          pricing_model: Database["public"]["Enums"]["pricing_model"] | null;
          ride_date: string | null;
          ride_exclusions: string[] | null;
          ride_fee: number | null;
          ride_inclusions: string[] | null;
          ride_itinerary: Json | null;
          ride_type: Database["public"]["Enums"]["ride_type"] | null;
          seats_available: number | null;
          speed: Database["public"]["Enums"]["speed_level"] | null;
          status: Database["public"]["Enums"]["ride_status"] | null;
          title: string | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "rides_organizer_id_fkey";
            columns: ["organizer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      has_payout_details: { Args: { uid: string }; Returns: boolean };
      is_admin: { Args: { uid: string }; Returns: boolean };
      update_ride_lifecycle_status: { Args: never; Returns: undefined };
    };
    Enums: {
      app_role: "user" | "admin";
      attendance_status: "pending" | "attended" | "no_show";
      booking_status: "created" | "paid" | "failed" | "cancelled";
      member_role: "organizer" | "participant";
      notification_type:
        | "ride_join_request"
        | "ride_request_accepted"
        | "ride_request_rejected"
        | "ride_cancelled"
        | "ride_reminder";
      payout_method: "upi" | "bank";
      pricing_model: "community" | "organized";
      request_status: "pending" | "accepted" | "rejected" | "cancelled";
      ride_status: "upcoming" | "ongoing" | "completed" | "cancelled";
      ride_type:
        | "breakfast_ride"
        | "weekend_ride"
        | "night_ride"
        | "touring"
        | "adventure"
        | "off_road"
        | "city_ride"
        | "mountain_ride";
      rider_level: "beginner" | "intermediate" | "experienced";
      speed_level: "relaxed" | "cruising" | "fast";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin"],
      attendance_status: ["pending", "attended", "no_show"],
      booking_status: ["created", "paid", "failed", "cancelled"],
      member_role: ["organizer", "participant"],
      notification_type: [
        "ride_join_request",
        "ride_request_accepted",
        "ride_request_rejected",
        "ride_cancelled",
        "ride_reminder",
      ],
      payout_method: ["upi", "bank"],
      pricing_model: ["community", "organized"],
      request_status: ["pending", "accepted", "rejected", "cancelled"],
      ride_status: ["upcoming", "ongoing", "completed", "cancelled"],
      ride_type: [
        "breakfast_ride",
        "weekend_ride",
        "night_ride",
        "touring",
        "adventure",
        "off_road",
        "city_ride",
        "mountain_ride",
      ],
      rider_level: ["beginner", "intermediate", "experienced"],
      speed_level: ["relaxed", "cruising", "fast"],
    },
  },
} as const;
