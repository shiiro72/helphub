import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useUserReports(userId: string | undefined) {
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchReportCount = async () => {
      setLoading(true);
      const supabase = createClient();
      const { count, error } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('reported_id', userId);

      if (!error && count !== null) {
        setReportCount(count);
      }
      setLoading(false);
    };

    fetchReportCount();
  }, [userId]);

  return { reportCount, loading, isFlagged: reportCount >= 3 };
}
