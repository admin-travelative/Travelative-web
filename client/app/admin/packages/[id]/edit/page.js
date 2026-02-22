'use client';
import React, { useState, useEffect } from 'react';
import PackageForm from '@/components/admin/PackageForm';
import { Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function EditPackagePage({ params }) {
    const { id } = React.use(params);
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        fetch(`${API_URL}/api/admin/packages`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((packages) => {
                const found = packages.find((p) => p._id === id);
                if (!found) throw new Error('Package not found');
                setPkg(found);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
    );
    if (error || !pkg) return <div className="text-red-500 text-center py-20">Error: {error || 'Package not found'}</div>;

    return <PackageForm initialData={pkg} packageId={pkg._id} />;
}
