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
