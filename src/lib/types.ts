export interface Profile {
  id: string;
  username: string;
  is_verified: boolean;
  image_url: string | null;
  role: 'user' | 'admin';
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
  date_posted: string;
  profiles?: Profile;
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
  reporter?: Profile;
  reported?: Profile;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  created_at: string;
  profiles?: Profile;
}
