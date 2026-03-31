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
// Payment Confirmation Email — sent after successful
// subscription payment, confirming plan and next renewal
// ──────────────────────────────────────────────────────────

interface PaymentConfirmationEmailProps {
  fullName: string;
  plan: 'monthly' | 'yearly';
  amount: string; // formatted price, e.g. '₹9.99'
  nextRenewalDate: string; // formatted date, e.g. '30 April 2026'
  charityName?: string; // name of chosen charity if any
  siteUrl?: string;
}

export default function PaymentConfirmationEmail({
  fullName = 'there',
  plan = 'monthly',
  amount = '₹9.99',
  nextRenewalDate = '30 April 2026',
  charityName,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
}: PaymentConfirmationEmailProps) {
  const previewText = `Your ${plan} subscription is confirmed — ${amount}`;
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
            {/* Success checkmark */}
            <Section style={successBadge}>
              <Text style={checkmark}>✓</Text>
            </Section>

            <Heading style={heading}>Payment Confirmed</Heading>

            <Text style={paragraph}>
              Hi {fullName}, your subscription has been successfully activated.
              Welcome to the platform!
            </Text>

            {/* Order summary card */}
            <Section style={summaryCard}>
              <Text style={summaryTitle}>ORDER SUMMARY</Text>
              <table
                style={{ width: '100%', borderCollapse: 'collapse' as const }}
              >
                <tbody>
                  <tr>
                    <td style={summaryLabel}>Plan</td>
                    <td style={summaryValue}>{planLabel}</td>
                  </tr>
                  <tr>
                    <td style={summaryLabel}>Amount</td>
                    <td style={summaryValue}>{amount}</td>
                  </tr>
                  <tr>
                    <td style={summaryLabel}>Status</td>
                    <td style={summaryValue}>
                      <span style={activeBadge}>Active</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={summaryLabel}>Next Renewal</td>
                    <td style={summaryValueBold}>{nextRenewalDate}</td>
                  </tr>
                  {charityName && (
                    <tr>
                      <td style={summaryLabel}>Charity</td>
                      <td style={summaryValue}>{charityName}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>

            {/* Next steps */}
            <Text style={nextStepsTitle}>What&apos;s next?</Text>

            <Section style={stepsGrid}>
              <Section style={stepCard}>
                <Text style={stepEmoji}>📊</Text>
                <Text style={stepHeading}>Enter Your Scores</Text>
                <Text style={stepDesc}>
                  Submit your latest 5 golf scores to enter the monthly draw.
                </Text>
              </Section>

              <Section style={stepCard}>
                <Text style={stepEmoji}>💚</Text>
                <Text style={stepHeading}>Choose a Charity</Text>
                <Text style={stepDesc}>
                  Select a cause you care about and set your contribution.
                </Text>
              </Section>

              <Section style={stepCard}>
                <Text style={stepEmoji}>🎯</Text>
                <Text style={stepHeading}>Win in Draws</Text>
                <Text style={stepDesc}>
                  Match numbers to win prizes while making an impact.
                </Text>
              </Section>
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <Link href={`${siteUrl}/dashboard`} style={ctaButton}>
                Go to Dashboard →
              </Link>
            </Section>

            <Text style={signoff}>
              Thank you for playing with purpose,
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
              Manage your subscription anytime in{' '}
              <Link href={`${siteUrl}/dashboard/settings`} style={footerLink}>
                settings
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

const successBadge: React.CSSProperties = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const checkmark: React.CSSProperties = {
  display: 'inline-block',
  width: '56px',
  height: '56px',
  lineHeight: '56px',
  borderRadius: '50%',
  backgroundColor: '#22c55e',
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 700,
  textAlign: 'center' as const,
  margin: 0,
};

const heading: React.CSSProperties = {
  color: '#1A2E1A',
  fontSize: '26px',
  fontWeight: 600,
  lineHeight: '1.3',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
  fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif',
};

const paragraph: React.CSSProperties = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const summaryCard: React.CSSProperties = {
  backgroundColor: '#f7f7f4',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 28px 0',
};

const summaryTitle: React.CSSProperties = {
  color: '#999',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  margin: '0 0 16px 0',
};

const summaryLabel: React.CSSProperties = {
  color: '#999',
  fontSize: '14px',
  padding: '6px 0',
  verticalAlign: 'middle',
};

const summaryValue: React.CSSProperties = {
  color: '#4a4a4a',
  fontSize: '14px',
  fontWeight: 500,
  padding: '6px 0',
  textAlign: 'right' as const,
  verticalAlign: 'middle',
};

const summaryValueBold: React.CSSProperties = {
  color: '#1A2E1A',
  fontSize: '14px',
  fontWeight: 700,
  padding: '6px 0',
  textAlign: 'right' as const,
};

const activeBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#dcfce7',
  color: '#15803d',
  padding: '3px 10px',
  borderRadius: '9999px',
  fontSize: '12px',
  fontWeight: 600,
};

const nextStepsTitle: React.CSSProperties = {
  color: '#1A2E1A',
  fontSize: '18px',
  fontWeight: 600,
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
  fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif',
};

const stepsGrid: React.CSSProperties = {
  margin: '0 0 28px 0',
};

const stepCard: React.CSSProperties = {
  backgroundColor: '#fcfcfa',
  border: '1px solid #f0f0ec',
  borderRadius: '12px',
  padding: '16px 20px',
  marginBottom: '8px',
};

const stepEmoji: React.CSSProperties = {
  fontSize: '20px',
  margin: '0 0 4px 0',
};

const stepHeading: React.CSSProperties = {
  color: '#1A2E1A',
  fontSize: '15px',
  fontWeight: 600,
  margin: '0 0 4px 0',
};

const stepDesc: React.CSSProperties = {
  color: '#888',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: 0,
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '0 0 28px 0',
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#1A2E1A',
  color: '#F9F9F6',
  padding: '14px 32px',
  borderRadius: '9999px',
  fontSize: '16px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
};

const signoff: React.CSSProperties = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
  textAlign: 'center' as const,
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
