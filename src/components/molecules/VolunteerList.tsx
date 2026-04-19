import React, { useEffect, useState } from 'react';
import { HelpRequest, Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { User, MessageSquare, Users, Loader2 } from 'lucide-react';
import { Button } from '../atoms/Button';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { StarRating } from '../atoms/StarRating';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

interface VolunteerListProps {
  request: HelpRequest;
  onClose: () => void;
}

export const VolunteerList: React.FC<VolunteerListProps> = ({ request, onClose }) => {
  const t = useTranslations();
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchVolunteers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('help_request_volunteers')
        .select(`
          user_id,
          profiles:profiles (*)
        `)
        .eq('request_id', request.id);

      if (error) {
        console.error('Error fetching volunteers:', error);
      } else if (data) {
        const profiles = (data as unknown as { profiles: Profile }[]).map(v => v.profiles).filter(Boolean);
        setVolunteers(profiles);
      }
      setLoading(false);
    };

    fetchVolunteers();
  }, [request.id, supabase]);

  const handleMessageUser = (userId: string) => {
    router.push(`/messages?userId=${userId}`);
    onClose();
  };

  const handleCreateGroupChat = async () => {
    if (volunteers.length === 0) return;
    setCreatingGroup(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Create the conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          is_group: true,
          title: `Group for: ${request.title}`,
          request_id: request.id
        })
        .select()
        .single();

      if (convError) throw convError;

      // 2. Add members (poster + all volunteers)
      const members = [user.id, ...volunteers.map(v => v.id)];
      const memberEntries = members.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId
      }));

      const { error: memberError } = await supabase
        .from('conversation_members')
        .insert(memberEntries);

      if (memberError) throw memberError;

      // 3. Navigate to messages with the new group
      router.push(`/messages?conversationId=${conversation.id}`);
      onClose();
    } catch (error) {
      console.error('Error creating group chat:', error);
      alert('Failed to create group chat. Please try again.');
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {t('volunteers')}
          </h2>
          <p className="text-sm text-zinc-500">
            {volunteers.length} {request.max_volunteers ? `/ ${request.max_volunteers}` : ''} {t('volunteers').toLowerCase()}
          </p>
        </div>
        {volunteers.length > 0 && (
          <Button
            size="sm"
            onClick={handleCreateGroupChat}
            disabled={creatingGroup}
            className="flex items-center gap-2"
          >
            {creatingGroup ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Users size={16} />
            )}
            {t('create_group_chat')}
          </Button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto min-h-[200px] space-y-3 pr-2">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-zinc-400" />
          </div>
        ) : volunteers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
            <Users size={40} className="mb-2 opacity-20" />
            <p>{t('no_volunteers')}</p>
          </div>
        ) : (
          volunteers.map((volunteer) => (
            <div
              key={volunteer.id}
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
                  {volunteer.image_url ? (
                    <img src={volunteer.image_url} alt={volunteer.username} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-zinc-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {volunteer.username}
                    </span>
                    <VerificationBadge isVerified={volunteer.is_verified} size={14} />
                  </div>
                  <StarRating
                    rating={volunteer.trust_rank || 0}
                    totalRatings={volunteer.total_ratings || 0}
                    size={10}
                    showCount
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMessageUser(volunteer.id)}
                title={t('message_volunteer')}
              >
                <MessageSquare size={16} />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <Button variant="outline" className="w-full" onClick={onClose}>
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
};
