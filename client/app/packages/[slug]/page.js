import { notFound } from 'next/navigation';
import PackageDetailClient from './PackageDetailClient';

// Enable ISR/SSR caching
export const revalidate = 60;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getPackage(slug) {
    try {
        const res = await fetch(`${API_URL}/api/packages/${slug}`, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const pkg = await getPackage(slug);

    if (!pkg) {
        return { title: 'Package Not Found | Travelative' };
    }

    return {
        title: `${pkg.title} | Travelative Packages`,
        description: pkg.description?.substring(0, 160) || `Check out the ${pkg.title} package spanning ${pkg.duration} with Travelative.`,
        openGraph: {
            title: pkg.title,
            description: pkg.description?.substring(0, 160),
            images: pkg.images?.[0] ? [{ url: pkg.images[0] }] : [],
            type: 'website',
        },
    };
}

export async function generateStaticParams() {
    try {
        const res = await fetch(`${API_URL}/api/packages`);
        if (!res.ok) return [];
        const packages = await res.json();
        return packages.map((pkg) => ({
            slug: pkg.slug,
        }));
    } catch {
        return [];
    }
}

export default async function PackageDetailPage({ params }) {
    const { slug } = await params;
    const pkg = await getPackage(slug);

    if (!pkg) return notFound();

    return <PackageDetailClient pkg={pkg} />;
}
