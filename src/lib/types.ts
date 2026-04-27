export interface Profile {
  id: string;
  username: string;
  is_verified: boolean;
  image_url: string | null;
  role: 'user' | 'admin';
  is_restricted: boolean;
  created_at: string;
}

export interface HelpRequest {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string | null;
  reward_offer?: string | null;
  request_location: string | null;
  city?: string | null;
  county?: string | null;
  country?: string | null;
  address?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
  max_volunteers?: number | null;
  date_posted: string;
  profiles?: Profile;
  volunteer_count?: number;
  confirmed_count?: number;
  waitlist_count?: number;
}

export interface BannedUser {
  id: string;
  email: string;
  username: string | null;
  reason: string | null;
  banned_at: string;
}

export interface HelpOffer {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string | null;
  offer_location: string | null;
  city?: string | null;
  county?: string | null;
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
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
    is_read: boolean;
  };
  unreadCount?: number;
  messages?: Message[];
  participant_1_profile?: Profile;
  participant_2_profile?: Profile;
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  created_at: string;
  profiles?: Profile;
}

export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface ConversationInvitation {
  id: string;
  conversation_id: string;
  inviter_id: string;
  invitee_id: string;
  status: InvitationStatus;
  created_at: string;
  conversations?: Conversation;
  inviter?: Profile;
  invitee?: Profile;
}

export type VolunteerStatus = 'confirmed' | 'waitlisted';

export interface Volunteer {
  id: string;
  request_id: string;
  user_id: string;
  status: VolunteerStatus;
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
