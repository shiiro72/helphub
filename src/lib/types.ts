export interface Profile {
  id: string;
  username: string;
  is_verified: boolean;
  image_url: string | null;
  created_at: string;
}

export interface HelpRequest {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null;
  reward_offer: string | null;
  request_location: string | null;
  date_posted: string;
  profiles?: Profile;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  profiles?: Profile; // Other participant's profile
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  message_id: string | null;
  reason: string;
  created_at: string;
}
