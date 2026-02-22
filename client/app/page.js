import HeroSection from '@/components/HeroSection';
import PackagesGrid from '@/components/PackagesGrid';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';
import CTABanner from '@/components/CTABanner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const revalidate = 60; // SSR with 60s cache

async function getPackages() {
  try {
    const res = await fetch(`${API_URL}/api/packages`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const packages = await getPackages();

  return (
    <>
      <HeroSection />
      <PackagesGrid packages={packages} />
      <WhyChooseUs />
      <CTABanner />
      <Testimonials />
    </>
  );
}
