import React, { useEffect, useState } from 'react';
import { HelpRequest, Volunteer } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { User, MessageSquare, Users, Loader2, ArrowUpCircle } from 'lucide-react';
import { Button } from '../atoms/Button';
import { VerificationBadge } from '../atoms/VerificationBadge';
import { StarRating } from '../atoms/StarRating';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { useVolunteer } from '@/lib/hooks/useVolunteer';

interface VolunteerListProps {
  request: HelpRequest;
  onClose: () => void;
}

export const VolunteerList: React.FC<VolunteerListProps> = ({ request, onClose }) => {
  const t = useTranslations();
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const supabase = createClient();
  const { promoteVolunteer } = useVolunteer(request.id);

  useEffect(() => {
    const fetchVolunteers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('help_request_volunteers')
        .select(`
          *,
          profiles:profiles (*)
        `)
        .eq('request_id', request.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching volunteers:', error);
      } else if (data) {
        setVolunteers(data as Volunteer[]);
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
    const confirmedVolunteers = volunteers.filter(v => v.status === 'confirmed');
    if (confirmedVolunteers.length === 0) return;
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

      // 2. Add owner as member immediately
      await supabase.from('conversation_members').insert({
        conversation_id: conversation.id,
        user_id: user.id
      });

      // 3. Send invitations to confirmed volunteers
      const invitationEntries = confirmedVolunteers.map(v => ({
        conversation_id: conversation.id,
        inviter_id: user.id,
        invitee_id: v.user_id,
        status: 'pending'
      }));

      const { error: invitationError } = await supabase
        .from('conversation_invitations')
        .insert(invitationEntries);

      if (invitationError) throw invitationError;

      // 4. Navigate to messages
      router.push(`/messages?conversationId=${conversation.id}`);
      onClose();
    } catch (error) {
      console.error('Error creating group chat:', error);
      alert('Failed to create group chat. Please try again.');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handlePromote = async (userId: string) => {
    await promoteVolunteer(userId);
    // Refresh local list
    setVolunteers(prev => prev.map(v => v.user_id === userId ? { ...v, status: 'confirmed' } : v));
  };

  const confirmed = volunteers.filter(v => v.status === 'confirmed');
  const waitlisted = volunteers.filter(v => v.status === 'waitlisted');

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-brand-text-main">
            {t('volunteers')}
          </h2>
          <p className="text-sm text-brand-text-secondary">
            {confirmed.length} {request.max_volunteers ? `/ ${request.max_volunteers}` : ''} {t('volunteers').toLowerCase()}
          </p>
        </div>
        {confirmed.length > 0 && (
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
            {t('contact_volunteers')}
          </Button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto min-h-[200px] space-y-6 pr-2">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-brand-text-secondary" />
          </div>
        ) : (
          <>
            {/* Confirmed List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
                {t('confirmed')} ({confirmed.length})
              </h3>
              {confirmed.length === 0 ? (
                <p className="text-sm text-brand-text-secondary italic">{t('no_volunteers')}</p>
              ) : (
                confirmed.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-brand-border bg-brand-background"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-border/30 flex items-center justify-center overflow-hidden">
                        {v.profiles?.image_url ? (
                          <img src={v.profiles.image_url} alt={v.profiles.username} className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} className="text-brand-text-secondary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-brand-text-main">
                            {v.profiles?.username}
                          </span>
                          <VerificationBadge isVerified={v.profiles?.is_verified} size={14} className="text-brand-primary" />
                        </div>
                        <StarRating
                          rating={v.profiles?.trust_rank || 0}
                          totalRatings={v.profiles?.total_ratings || 0}
                          size={10}
                          showCount
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMessageUser(v.user_id)}
                      title={t('message_volunteer')}
                    >
                      <MessageSquare size={16} />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Waitlist List */}
            {waitlisted.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
                  {t('waitlist')} ({waitlisted.length})
                </h3>
                {waitlisted.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-brand-secondary/30 bg-brand-secondary/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-border/30 flex items-center justify-center overflow-hidden">
                        {v.profiles?.image_url ? (
                          <img src={v.profiles.image_url} alt={v.profiles.username} className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} className="text-brand-text-secondary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-brand-text-main">
                            {v.profiles?.username}
                          </span>
                          <VerificationBadge isVerified={v.profiles?.is_verified} size={14} className="text-brand-primary" />
                        </div>
                        <StarRating
                          rating={v.profiles?.trust_rank || 0}
                          totalRatings={v.profiles?.total_ratings || 0}
                          size={10}
                          showCount
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePromote(v.user_id)}
                        className="flex items-center gap-1 h-8 px-2"
                      >
                        <ArrowUpCircle size={14} />
                        {t('promote')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMessageUser(v.user_id)}
                        className="h-8 px-2"
                      >
                        <MessageSquare size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              }
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-brand-border">
        <Button variant="outline" className="w-full" onClick={onClose}>
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
};
