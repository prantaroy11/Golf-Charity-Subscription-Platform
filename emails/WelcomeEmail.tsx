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
// Welcome Email — sent after signup / email confirmation
// Forest green header, gold accent, warm welcome message
// ──────────────────────────────────────────────────────────

interface WelcomeEmailProps {
  fullName: string;
  siteUrl?: string;
}

export default function WelcomeEmail({
  fullName = 'there',
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
}: WelcomeEmailProps) {
  const previewText = `Welcome to the Golf Charity Platform, ${fullName}!`;

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
            <Heading style={heading}>Welcome, {fullName}!</Heading>

            <Text style={paragraph}>
              Thank you for joining the Golf Charity Platform — where your
              passion for golf makes a real difference.
            </Text>

            <Text style={paragraph}>
              Every subscription powers charitable causes, and your scores could
              win you big in our monthly prize draws. Here&apos;s how to get
              started:
            </Text>

            <Section style={stepsSection}>
              <Text style={stepItem}>
                <span style={stepNumber}>1</span>
                <strong>Complete your profile</strong> — Choose a charity to
                support and set your contribution percentage.
              </Text>
              <Text style={stepItem}>
                <span style={stepNumber}>2</span>
                <strong>Enter your scores</strong> — Submit your latest 5 golf
                scores in Stableford format.
              </Text>
              <Text style={stepItem}>
                <span style={stepNumber}>3</span>
                <strong>Get drawn to win</strong> — Your scores are
                automatically entered into the monthly draw.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Link href={`${siteUrl}/dashboard`} style={ctaButton}>
                Complete Your Profile →
              </Link>
            </Section>

            <Text style={paragraph}>
              If you have any questions, simply reply to this email. We&apos;re
              here to help.
            </Text>

            <Text style={signoff}>
              Play with purpose,
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
            <Text style={footerLinks}>
              <Link href={siteUrl} style={footerLink}>
                Home
              </Link>
              {' · '}
              <Link href={`${siteUrl}/charities`} style={footerLink}>
                Charities
              </Link>
              {' · '}
              <Link href={`${siteUrl}/dashboard/settings`} style={footerLink}>
                Settings
              </Link>
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
  fontSize: '28px',
  fontWeight: 600,
  lineHeight: '1.3',
  margin: '0 0 24px 0',
  fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif',
};

const paragraph: React.CSSProperties = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const stepsSection: React.CSSProperties = {
  backgroundColor: '#f7f7f4',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const stepItem: React.CSSProperties = {
  color: '#4a4a4a',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px 0',
};

const stepNumber: React.CSSProperties = {
  display: 'inline-block',
  width: '28px',
  height: '28px',
  backgroundColor: '#D4AF37',
  color: '#1A2E1A',
  borderRadius: '50%',
  textAlign: 'center' as const,
  lineHeight: '28px',
  fontSize: '14px',
  fontWeight: 700,
  marginRight: '12px',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '32px 0',
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
  margin: '24px 0 0 0',
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

const footerLinks: React.CSSProperties = {
  color: '#999',
  fontSize: '13px',
  margin: 0,
};

const footerLink: React.CSSProperties = {
  color: '#D4AF37',
  textDecoration: 'none',
};
