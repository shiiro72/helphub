import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { useTranslations } from 'next-intl';

export const useVolunteer = (requestId: string) => {
  const t = useTranslations();
  const { user } = useAuth();
  const [isVolunteering, setIsVolunteering] = useState(false);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const fetchVolunteerStatus = useCallback(async () => {
    const { count, error } = await supabase
      .from('help_request_volunteers')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId);

    if (!error && count !== null) {
      setVolunteerCount(count);
    }

    if (user) {
      const { data } = await supabase
        .from('help_request_volunteers')
        .select('id')
        .eq('request_id', requestId)
        .eq('user_id', user.id)
        .single();

      setIsVolunteering(!!data);
    }
  }, [requestId, user, supabase]);

  useEffect(() => {
    fetchVolunteerStatus();
  }, [fetchVolunteerStatus]);

  const toggleVolunteer = async () => {
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
        setVolunteerCount(prev => prev - 1);
      }
    } else {
      const { error } = await supabase
        .from('help_request_volunteers')
        .insert({
          request_id: requestId,
          user_id: user.id
        });

      if (!error) {
        setIsVolunteering(true);
        setVolunteerCount(prev => prev + 1);
      } else if (error.code === '23505') { // Unique violation
        setIsVolunteering(true);
      }
    }
    setIsLoading(false);
  };

  return {
    isVolunteering,
    volunteerCount,
    isLoading,
    toggleVolunteer,
    refresh: fetchVolunteerStatus
  };
};
