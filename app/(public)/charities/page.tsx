import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Section from '@/components/layout/Section';
import {
  CharityDirectory,
  EnrichedCharity,
} from '@/components/features/charity/CharityDirectory';
import { Charity } from '@/types';

export const metadata = {
  title: 'Charity Directory | Golf Charity Platform',
  description: 'Explore and support our paired charities.',
};

export const revalidate = 3600; // revalidate every hour

export default async function CharitiesPage() {
  const supabase = await createClient();

  // Fetch charities using standard server client
  const { data: charities, error: charityError } = await supabase
    .from('charities')
    .select('*')
    .order('name');

  if (charityError || !charities) {
    return (
      <Section theme="light" className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-red-600">
          <p>Error loading charities. Please try again later.</p>
        </div>
      </Section>
    );
  }

  // Fetch contributions using admin client to bypass RLS so we can calculate total raised
  const { data: contributions } = await supabaseAdmin
    .from('charity_contributions')
    .select('charity_id, amount_pence, period_month');

  const currentMonth = new Date().toISOString().slice(0, 7);

  const enrichedCharities: EnrichedCharity[] = charities.map((c: Charity) => {
    const charityConts =
      contributions?.filter((cont) => cont.charity_id === c.id) || [];

    // Calculate total contributions
    const total = charityConts.reduce(
      (acc, curr) => acc + curr.amount_pence,
      0
    );

    // Calculate this month's contributions
    const thisMonth = charityConts
      .filter((cont) => cont.period_month === currentMonth)
      .reduce((acc, curr) => acc + curr.amount_pence, 0);

    return {
      ...c,
      total_contributions: total,
      funded_this_month: thisMonth,
    };
  });

  return (
    <main className="min-h-screen bg-offwhite pt-24 pb-20">
      <Section theme="light" className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-serif text-forest mb-6">
            Our Partner Charities
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Explore the incredible causes your subscription supports. Every
            month, 10% of your fee goes directly to the charity of your choice.
          </p>
          <CharityDirectory charities={enrichedCharities} />
        </div>
      </Section>
    </main>
  );
}
