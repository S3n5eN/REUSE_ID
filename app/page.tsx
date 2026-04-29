'use client";'
import { Playfair_Display, DM_Sans } from "next/font/google";
import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import HowItWorks from "@/components/landing/howItWorks";
import Features from "@/components/landing/features";
import HeroSection2 from "@/components/landing/heroSection2";
import FAQ from "@/components/landing/faq";
import CTAFinal from "@/components/landing/ctaFinal";
import Footer from "@/components/landing/footer";

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["italic", "normal"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export default function Page() {
  return (
    <div
      className={`${dmSans.variable} ${playfair.variable} font-sans bg-[#F5F2EB] text-[#1A1A18] selection:bg-[#007582] selection:text-[#F5F2EB]`}
    >
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <HeroSection2 />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
    </div>
  );
}