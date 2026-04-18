import { Navbar } from "@/components/organisms/Navbar";
import { OfferBoard } from "@/components/organisms/OfferBoard";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function OffersPage() {
  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen bg-zinc-50 dark:bg-black font-sans`}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Browse Offers
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Explore what others are offering and find the help you need.
          </p>
        </div>

        <OfferBoard />
      </main>
    </div>
  );
}
