import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/organisms/Navbar";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/atoms/Button";
import Link from "next/link";
import { Heart, HandHelping } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen bg-zinc-50 dark:bg-black font-sans`}>
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-black dark:text-white">
            Where helping <br />
            <span className="text-zinc-500">meets community.</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            HelpHub is a platform where you can ask for assistance or offer your skills to those in need. Simple, direct, and community-driven.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {user ? (
              <>
                <Button size="lg" className="gap-2">
                  <HandHelping size={20} />
                  Ask for Help
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <Heart size={20} />
                  Offer Help
                </Button>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">Learn More</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-2">Request Help</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Post what you need, from moving furniture to technical advice.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-2">Offer Skills</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Browse requests and contribute your time or expertise to help others.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold mb-2">Build Community</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Connect with people in your neighborhood and grow together.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
