export interface Profile {
  id: string;
  username: string;
  is_verified: boolean;
  image_url: string | null;
  trust_rank: number;
  total_ratings: number;
  created_at: string;
}

export interface Rating {
  id: string;
  rater_id: string;
  rated_id: string;
  rating: number;
  tags: string[];
  comment: string | null;
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
  city?: string | null;
  country?: string | null;
  address?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
  max_volunteers?: number | null;
  date_posted: string;
  profiles?: Profile;
  volunteer_count?: number;
}

export interface HelpOffer {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null;
  offer_location: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  reward_offer?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
  date_posted: string;
  profiles?: Profile;
}

export interface Conversation {
  id: string;
  participant_1: string | null;
  participant_2: string | null;
  is_group: boolean;
  title: string | null;
  request_id: string | null;
  last_message_at: string;
  created_at: string;
  profiles?: Profile; // Other participant's profile (for 1-on-1)
  members?: Profile[]; // All members (for groups)
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  created_at: string;
  profiles?: Profile;
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
