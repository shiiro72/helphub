import { Navbar } from '@/components/organisms/Navbar';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/atoms/Button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HelpRequest, HelpOffer } from '@/lib/types';
import { TriangularBoard } from '@/components/organisms/TriangularBoard';

export default function Home() {
  const [latestRequests, setLatestRequests] = useState<HelpRequest[]>([]);
  const [latestOffers, setLatestOffers] = useState<HelpOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestData = async () => {
      const supabase = createClient();

      const [requestsRes, offersRes] = await Promise.all([
        supabase
          .from('help_requests')
          .select('*, profiles(*)')
          .order('date_posted', { ascending: false })
          .limit(3),
        supabase
          .from('help_offers')
          .select('*, profiles(*)')
          .order('date_posted', { ascending: false })
          .limit(3),
      ]);

      if (requestsRes.data) setLatestRequests(requestsRes.data);
      if (offersRes.data) setLatestOffers(offersRes.data);
      setLoading(false);
    };

    fetchLatestData();
  }, []);

  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6">
        <TriangularBoard
          requests={latestRequests}
          offers={latestOffers}
          loading={loading}
        />
      </main>
    </div>
  );
}

export const getStaticProps = async ({ locale }: { locale?: string }) => {
  return {
    props: {
      messages: (await import(`../../messages/${locale || 'en'}.json`)).default,
    },
  };
};
