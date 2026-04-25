import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { useTranslations } from 'next-intl';
import { VolunteerStatus } from '../types';

export const useVolunteer = (requestId: string) => {
  const t = useTranslations();
  const { user } = useAuth();
  const [isVolunteering, setIsVolunteering] = useState(false);
  const [volunteerStatus, setVolunteerStatus] = useState<VolunteerStatus | null>(null);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const fetchVolunteerStatus = useCallback(async () => {
    const { data: counts, error: countError } = await supabase
      .from('help_request_volunteers')
      .select('status')
      .eq('request_id', requestId);

    if (!countError && counts) {
      setVolunteerCount(counts.length);
      setConfirmedCount(counts.filter((c: { status: VolunteerStatus }) => c.status === 'confirmed').length);
      setWaitlistCount(counts.filter((c: { status: VolunteerStatus }) => c.status === 'waitlisted').length);
    }

    if (user) {
      const { data } = await supabase
        .from('help_request_volunteers')
        .select('status')
        .eq('request_id', requestId)
        .eq('user_id', user.id)
        .single();

      setIsVolunteering(!!data);
      setVolunteerStatus(data?.status || null);
    }
  }, [requestId, user, supabase]);

  useEffect(() => {
    fetchVolunteerStatus();
  }, [fetchVolunteerStatus]);

  const toggleVolunteer = async (maxVolunteers: number | null) => {
    if (!user) {
      alert(t('login_required'));
      return;
    }

    setIsLoading(true);
    if (isVolunteering) {
      const { error } = await supabase
        .from('help_request_volunteers')
        .delete()
        .eq('request_id', requestId)
        .eq('user_id', user.id);

      if (!error) {
        setIsVolunteering(false);
        setVolunteerStatus(null);
        fetchVolunteerStatus();
      }
    } else {
      const status: VolunteerStatus = (maxVolunteers !== null && confirmedCount >= maxVolunteers) ? 'waitlisted' : 'confirmed';
      const { error } = await supabase
        .from('help_request_volunteers')
        .insert({
          request_id: requestId,
          user_id: user.id,
          status
        });

      if (!error) {
        setIsVolunteering(true);
        setVolunteerStatus(status);
        fetchVolunteerStatus();
      } else if (error.code === '23505') { // Unique violation
        setIsVolunteering(true);
        fetchVolunteerStatus();
      }
    }
    setIsLoading(false);
  };

  const promoteVolunteer = async (userId: string) => {
    setIsLoading(true);
    const { error } = await supabase
      .from('help_request_volunteers')
      .update({ status: 'confirmed' })
      .eq('request_id', requestId)
      .eq('user_id', userId);

    if (!error) {
      // Find existing group chat for this request and add the newly promoted volunteer
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('request_id', requestId)
        .eq('is_group', true)
        .maybeSingle();

      if (conversation) {
        await supabase.from('conversation_members').upsert({
          conversation_id: conversation.id,
          user_id: userId
        });
      }

      fetchVolunteerStatus();
    }
    setIsLoading(false);
  };

  return {
    isVolunteering,
    volunteerStatus,
    volunteerCount,
    confirmedCount,
    waitlistCount,
    isLoading,
    toggleVolunteer,
    promoteVolunteer,
    refresh: fetchVolunteerStatus
  };
};
