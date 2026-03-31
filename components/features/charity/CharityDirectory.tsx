'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Charity } from '@/types';
import LightCard from '@/components/ui/LightCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/input';

export interface EnrichedCharity extends Charity {
  funded_this_month: number;
  total_contributions: number;
}

interface CharityDirectoryProps {
  charities: EnrichedCharity[];
}

export function CharityDirectory({ charities }: CharityDirectoryProps) {
  const [search, setSearch] = useState('');

  const filteredCharities = charities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const featured = filteredCharities.filter((c) => c.is_featured);
  const regular = filteredCharities.filter((c) => !c.is_featured);

  const formatCurrency = (pence: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(pence / 100);
  };

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="max-w-xl mx-auto relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <Input
            type="text"
            placeholder="Search charities by name or cause..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 py-6 text-lg rounded-full bg-white shadow-sm border-gray-200 focus-visible:ring-[#D4AF37]"
          />
        </div>
      </div>

      {featured.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-medium text-forest text-left">
            Featured Causes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((charity) => (
              <Link
                key={charity.id}
                href={`/charities/${charity.id}`}
                className="block h-full block"
              >
                <LightCard className="h-full flex flex-col bg-[#D4AF37]/10 border-[#D4AF37]/20 hover:shadow-lg transition-all group">
                  <div className="p-8 flex flex-col items-center text-center flex-grow">
                    {charity.logo_url ? (
                      <img
                        src={charity.logo_url}
                        alt={charity.name}
                        className="w-24 h-24 object-contain mb-6 rounded-full bg-white p-2 shadow-sm group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl font-serif text-forest">
                          {charity.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <h3 className="text-2xl font-serif text-forest mb-3">
                      {charity.name}
                    </h3>
                    <p className="text-gray-700 mb-6 flex-grow">
                      {charity.description}
                    </p>
                    <StatusBadge
                      status="winner"
                      label={`Funded this month: ${formatCurrency(charity.funded_this_month)}`}
                    />
                  </div>
                </LightCard>
              </Link>
            ))}
          </div>
        </div>
      )}

      {regular.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-medium text-forest text-left">
            All Charities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regular.map((charity) => (
              <Link
                key={charity.id}
                href={`/charities/${charity.id}`}
                className="block h-full"
              >
                <LightCard className="h-full flex flex-col hover:shadow-lg transition-all group border-gray-100">
                  <div className="p-8 flex flex-col items-center text-center flex-grow">
                    {charity.logo_url ? (
                      <img
                        src={charity.logo_url}
                        alt={charity.name}
                        className="w-20 h-20 object-contain mb-5 rounded-full bg-gray-50 p-2 group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xl font-serif text-forest">
                          {charity.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl font-serif text-forest mb-3">
                      {charity.name}
                    </h3>
                    <p className="text-gray-600 mb-6 text-sm flex-grow line-clamp-3">
                      {charity.description}
                    </p>
                    <StatusBadge
                      status="winner"
                      label={`Funded this month: ${formatCurrency(charity.funded_this_month)}`}
                    />
                  </div>
                </LightCard>
              </Link>
            ))}
          </div>
        </div>
      )}

      {filteredCharities.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 font-serif">
            No charities found matching &quot;{search}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
