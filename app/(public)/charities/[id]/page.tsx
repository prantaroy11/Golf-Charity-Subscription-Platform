import { supabaseAdmin } from '@/lib/supabase/admin';
import Section from '@/components/layout/Section';
import Link from 'next/link';
import GoldButton from '@/components/ui/GoldButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { Calendar, Heart, ExternalLink } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 86400; // SSG rebuild once a day if needed

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const { data: charities } = await supabaseAdmin
    .from('charities')
    .select('id');
  if (!charities) return [];
  return charities.map((charity) => ({
    id: charity.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { data: charity } = await supabaseAdmin
    .from('charities')
    .select('name, description')
    .eq('id', id)
    .single();

  if (!charity) return {};

  return {
    title: `${charity.name} | Golf Charity Platform`,
    description:
      charity.description ||
      'Support this incredible cause through your Golf Charity Platform subscription.',
  };
}

export default async function CharityDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const { data: charity } = await supabaseAdmin
    .from('charities')
    .select('*')
    .eq('id', id)
    .single();

  if (!charity) {
    notFound();
  }

  // Calculate total contributions
  // Fetch from charity_contributions via admin
  const { data: contributions } = await supabaseAdmin
    .from('charity_contributions')
    .select('amount_pence')
    .eq('charity_id', id);

  const totalContributionsPence =
    contributions?.reduce((acc, curr) => acc + curr.amount_pence, 0) || 0;

  const formattedTotal = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  }).format(totalContributionsPence / 100);

  // Mocked upcoming golf events
  const upcomingEvents = [
    {
      title: 'Spring Charity Scramble',
      date: 'April 15, 2026',
      location: 'Pine Valley Golf Club',
    },
    {
      title: 'The Drive for Good Tournament',
      date: 'May 22, 2026',
      location: 'St Andrews Links',
    },
    {
      title: 'Masters of Impact Classic',
      date: 'June 10, 2026',
      location: 'Pebble Beach',
    },
  ];

  return (
    <main className="min-h-screen bg-offwhite pt-24 pb-20">
      <Section theme="light" className="pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/charities"
              className="text-gray-500 hover:text-forest flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
            >
              &larr; Back to Directory
            </Link>
            <div className="flex flex-col md:flex-row md:items-start gap-8 mt-12">
              <div className="w-32 h-32 shrink-0 rounded-3xl bg-white shadow-sm flex items-center justify-center p-4 border border-gray-100 overflow-hidden">
                {charity.logo_url ? (
                  <img
                    src={charity.logo_url}
                    alt={charity.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-5xl font-serif text-forest">
                    {charity.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-grow">
                {charity.is_featured && (
                  <StatusBadge
                    status="winner"
                    label="Featured Partner"
                    className="mb-4"
                  />
                )}
                <h1 className="text-5xl font-serif text-forest mb-4 leading-tight">
                  {charity.name}
                </h1>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl px-6 py-4 flex items-center gap-4 inline-flex">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <Heart className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Total Raised by Platform
                      </p>
                      <p className="text-2xl font-bold font-serif text-forest">
                        {formattedTotal}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-2xl font-serif text-forest mb-4 border-b border-gray-200 pb-2">
                  About the Cause
                </h2>
                <div className="prose prose-lg text-gray-700 leading-relaxed max-w-none">
                  <p>{charity.description}</p>
                </div>
              </section>

              {charity.website && (
                <section className="pt-4">
                  <a
                    href={charity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#b8952b] font-medium transition-colors"
                  >
                    Visit Official Website <ExternalLink className="w-4 h-4" />
                  </a>
                </section>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-forest rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                {/* Gold accent border shape abstract */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/30 to-transparent rounded-bl-full pointer-events-none" />

                <h3 className="text-2xl font-serif mb-4 relative z-10">
                  Make an Impact
                </h3>
                <p className="text-gray-300 mb-8 relative z-10 text-sm">
                  Join our platform and select <strong>{charity.name}</strong>{' '}
                  as your chosen cause. 10% of your monthly subscription will go
                  directly to them.
                </p>
                <Link
                  href={`/signup?charity_id=${id}`}
                  className="block w-full"
                >
                  <GoldButton
                    variant="primary"
                    className="w-full relative z-10 hover:scale-105 active:scale-95 transition-transform duration-200"
                  >
                    Support this charity
                  </GoldButton>
                </Link>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  It takes less than 2 minutes to join.
                </p>
              </div>

              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <div className="flex flex-row items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-xl font-serif text-forest">
                    Upcoming Golf Events
                  </h3>
                </div>
                <div className="space-y-6">
                  {upcomingEvents.map((e, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="bg-gray-50 rounded-lg p-2 text-center min-w-[3.5rem] border border-gray-100 shadow-sm">
                        <span className="block text-xs uppercase font-bold text-gray-500">
                          {e.date.split(' ')[0]}
                        </span>
                        <span className="block text-lg font-serif text-forest">
                          {e.date.split(' ')[1].replace(',', '')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-forest text-sm mb-1">
                          {e.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {e.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
