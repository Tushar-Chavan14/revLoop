// Kept separate from services/ride-chat.ts (which imports the server-only
// Supabase client) so the client-side RideChat component can use this
// constant without pulling next/headers into the browser bundle.
export const RIDE_MESSAGE_SENDER_SELECT =
  "*, sender:profiles!ride_messages_sender_id_fkey(id, name, username, profile_image_url)";
