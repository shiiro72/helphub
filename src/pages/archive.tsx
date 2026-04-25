import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';

export default function ArchivePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/my-posts');
  }, [router]);

  return null;
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    messages: (await import(`../../messages/${locale ?? 'en'}.json`)).default,
  },
});
