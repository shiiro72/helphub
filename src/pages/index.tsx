import { Navbar } from '@/components/organisms/Navbar';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/atoms/Button';
import Link from 'next/link';
import { Heart, HandHelping, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/hooks/useAuth';
import { HelpRequest, HelpOffer } from '@/lib/types';
import { RequestCard } from '@/components/molecules/RequestCard';
import { OfferCard } from '@/components/molecules/OfferCard';
import { TriangularBoard } from '@/components/organisms/TriangularBoard';

export default function Home() {
  const t = useTranslations();
  const { user } = useAuth();
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

      <main className="max-w-7xl mx-auto px-6 pt-4 pb-10">
        <div className="space-y-12">
          {/* Desktop View: Triangular Board */}
          <div className="hidden md:block">
            <TriangularBoard requests={latestRequests} offers={latestOffers} loading={loading} />
          </div>

          {/* Mobile View: Traditional Grids */}
          <div className="md:hidden space-y-16">
            {/* Latest Requests Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-brand-text-main">
                  {t('browse_requests')}
                </h2>
                <Link href="/requests">
                  <Button variant="ghost" className="gap-2">
                    {t('show_more')}
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-xl bg-brand-surface animate-pulse" />
                  ))}
                </div>
              ) : latestRequests.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {latestRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-brand-text-secondary py-10 bg-brand-surface rounded-2xl border border-dashed border-brand-border">
                  {t('no_requests')}
                </p>
              )}
            </section>

            {/* Latest Offers Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-brand-text-main">
                  {t('browse_offers')}
                </h2>
                <Link href="/offers">
                  <Button variant="ghost" className="gap-2">
                    {t('show_more')}
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-xl bg-brand-surface animate-pulse" />
                  ))}
                </div>
              ) : latestOffers.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {latestOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-brand-text-secondary py-10 bg-brand-surface rounded-2xl border border-dashed border-brand-border">
                  {t('no_offers')}
                </p>
              )}
            </section>
          </div>
        </div>
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
