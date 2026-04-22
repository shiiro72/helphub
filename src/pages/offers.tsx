import { Navbar } from "@/components/organisms/Navbar";
import { OfferBoard } from "@/components/organisms/OfferBoard";
import { BoardToggle } from "@/components/molecules/BoardToggle";
import { useTranslations } from 'next-intl';
import { GetStaticProps } from 'next';

export default function OffersPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-brand-text-main tracking-tight">
            {t('browse_offers')}
          </h1>
          <p className="text-brand-text-secondary mt-2">
            Explore what others are offering and find the help you need.
          </p>
          <div className="mt-6">
            <BoardToggle />
          </div>
        </div>

        <OfferBoard />
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    messages: (await import(`../../messages/${locale ?? 'en'}.json`)).default,
  },
});
