import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

// ──────────────────────────────────────────────────────────
// Renewal Reminder Email — sent 3 days before subscription
// renewal with plan details and renewal date
// ──────────────────────────────────────────────────────────

interface RenewalReminderEmailProps {
  fullName: string;
  plan: 'monthly' | 'yearly';
  renewalDate: string; // formatted date string, e.g. '3 April 2026'
  amount: string; // formatted price, e.g. '£9.99'
  siteUrl?: string;
}

export default function RenewalReminderEmail({
  fullName = 'there',
  plan = 'monthly',
  renewalDate = '3 April 2026',
  amount = '£9.99',
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
}: RenewalReminderEmailProps) {
  const previewText = `Your ${plan} subscription renews on ${renewalDate}`;
  const planLabel = plan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan';

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Forest green header */}
          <Section style={header}>
            <Text style={logoText}>🏌️ Golf Charity Platform</Text>
          </Section>

          {/* Gold accent line */}
          <Section style={goldStripe} />

          {/* Main content */}
          <Section style={content}>
            <Heading style={heading}>Subscription Renewal Reminder</Heading>

            <Text style={paragraph}>
              Hi {fullName}, this is a friendly reminder that your subscription
              will renew soon.
            </Text>

            {/* Renewal details card */}
            <Section style={detailsCard}>
              <table
                style={{ width: '100%', borderCollapse: 'collapse' as const }}
              >
                <tbody>
                  <tr>
                    <td style={detailLabel}>Plan</td>
                    <td style={detailValue}>{planLabel}</td>
                  </tr>
                  <tr>
                    <td style={detailLabel}>Amount</td>
                    <td style={detailValueBold}>{amount}</td>
                  </tr>
                  <tr>
                    <td style={detailLabel}>Renewal Date</td>
                    <td style={detailValueBold}>{renewalDate}</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Text style={paragraph}>
              Your subscription will automatically renew on {renewalDate}. No
              action is needed to continue enjoying the platform and
              participating in draws.
            </Text>

            <Text style={paragraph}>
              If you&apos;d like to make any changes to your subscription, you
              can manage it from your dashboard settings at any time.
            </Text>

            {/* CTA buttons */}
            <Section style={ctaSection}>
              <Link href={`${siteUrl}/dashboard/settings`} style={ctaButton}>
                Manage Subscription
              </Link>
            </Section>

            {/* Impact note */}
            <Section style={impactBox}>
              <Text style={impactText}>
                💚 Your renewal continues to fund charitable causes. Thank you
                for being part of the community!
              </Text>
            </Section>

            <Text style={signoff}>
              See you next draw,
              <br />
              <strong>The Golf Charity Team</strong>
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Golf Charity Platform · Powered by Purpose
            </Text>
            <Text style={footerSubtext}>
              You can manage or cancel your subscription anytime from your{' '}
              <Link href={`${siteUrl}/dashboard/settings`} style={footerLink}>
                account settings
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ──────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: '#F9F9F6',
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid #e5e5e5',
};

const header: React.CSSProperties = {
  backgroundColor: '#1A2E1A',
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const logoText: React.CSSProperties = {
  color: '#F9F9F6',
  fontSize: '20px',
  fontWeight: 600,
  margin: 0,
  letterSpacing: '0.5px',
};

const goldStripe: React.CSSProperties = {
  height: '4px',
  background: 'linear-gradient(to right, #D4AF37, #F1D570, #D4AF37)',
};

const content: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '40px',
};

const heading: React.CSSProperties = {
  color: '#1A2E1A',
  fontSize: '24px',
  fontWeight: 600,
  lineHeight: '1.3',
  margin: '0 0 20px 0',
  fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif',
};

const paragraph: React.CSSProperties = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const detailsCard: React.CSSProperties = {
  backgroundColor: '#f7f7f4',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px 0',
};

const detailLabel: React.CSSProperties = {
  color: '#999',
  fontSize: '13px',
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  padding: '8px 0',
  verticalAlign: 'top',
};

const detailValue: React.CSSProperties = {
  color: '#4a4a4a',
  fontSize: '16px',
  fontWeight: 500,
  padding: '8px 0',
  textAlign: 'right' as const,
};

const detailValueBold: React.CSSProperties = {
  color: '#1A2E1A',
  fontSize: '16px',
  fontWeight: 700,
  padding: '8px 0',
  textAlign: 'right' as const,
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0 28px 0',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#1A2E1A',
  color: '#F9F9F6',
  padding: '12px 28px',
  borderRadius: '9999px',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
};

const impactBox: React.CSSProperties = {
  backgroundColor: 'rgba(212, 175, 55, 0.08)',
  border: '1px solid rgba(212, 175, 55, 0.15)',
  borderRadius: '12px',
  padding: '16px 20px',
  margin: '0 0 24px 0',
};

const impactText: React.CSSProperties = {
  color: '#4a4a4a',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: 0,
};

const signoff: React.CSSProperties = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
};

const hr: React.CSSProperties = {
  borderColor: '#e5e5e5',
  margin: '0',
};

const footer: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '24px 40px',
  textAlign: 'center' as const,
};

const footerText: React.CSSProperties = {
  color: '#999',
  fontSize: '13px',
  margin: '0 0 8px 0',
};

const footerSubtext: React.CSSProperties = {
  color: '#bbb',
  fontSize: '12px',
  margin: 0,
};

const footerLink: React.CSSProperties = {
  color: '#D4AF37',
  textDecoration: 'none',
};
