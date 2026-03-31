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
// Winner Alert Email — congrats email sent to individual
// winners with prize amount and verification CTA
// ──────────────────────────────────────────────────────────

interface WinnerAlertEmailProps {
  fullName: string;
  drawMonth: string; // e.g. 'March 2026'
  matchTier: 'five' | 'four' | 'three';
  prizeAmount: number; // in pence
  numbersDrawn: number[];
  siteUrl?: string;
}

export default function WinnerAlertEmail({
  fullName = 'there',
  drawMonth = 'March 2026',
  matchTier = 'three',
  prizeAmount = 5000,
  numbersDrawn = [7, 14, 22, 31, 39],
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
}: WinnerAlertEmailProps) {
  const matchCount = matchTier === 'five' ? 5 : matchTier === 'four' ? 4 : 3;
  const tierLabel =
    matchTier === 'five'
      ? '🏆 Jackpot Winner'
      : matchTier === 'four'
        ? '🥈 4-Number Match'
        : '🥉 3-Number Match';

  const formatPrize = (pence: number) => {
    return `₹${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
  };

  const previewText = `🏆 You've won ${formatPrize(prizeAmount)} in the ${drawMonth} draw!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Dark header with trophy */}
          <Section style={header}>
            <Text style={trophyIcon}>🏆</Text>
            <Text style={logoText}>Golf Charity Platform</Text>
          </Section>

          {/* Gold accent line */}
          <Section style={goldStripe} />

          {/* Main content */}
          <Section style={content}>
            <Heading style={heading}>Congratulations, {fullName}!</Heading>

            <Text style={paragraph}>
              You&apos;re a winner in the <strong>{drawMonth}</strong> prize
              draw. Here are your winning details:
            </Text>

            {/* Winner details card */}
            <Section style={prizeCard}>
              <Text style={tierBadge}>{tierLabel}</Text>
              <Text style={prizeAmountText}>{formatPrize(prizeAmount)}</Text>
              <Text style={matchInfo}>
                You matched <strong>{matchCount} of 5</strong> numbers
              </Text>
              <Section style={drawnNumbersRow}>
                {numbersDrawn.map((num, i) => (
                  <span key={i} style={drawnNumber}>
                    {num}
                  </span>
                ))}
              </Section>
            </Section>

            {/* Verification notice */}
            <Section style={verificationBox}>
              <Text style={verificationTitle}>
                ⚡ Action Required: Verify Your Win
              </Text>
              <Text style={verificationText}>
                To claim your prize, please upload a screenshot of your golf
                scores from your scoring platform. This is a quick verification
                step to confirm your entries.
              </Text>
              <Section style={ctaSection}>
                <Link href={`${siteUrl}/dashboard/winnings`} style={ctaButton}>
                  Upload Verification Proof →
                </Link>
              </Section>
            </Section>

            {/* Timeline */}
            <Section style={timelineSection}>
              <Text style={timelineTitle}>What happens next?</Text>
              <Text style={timelineStep}>
                <span style={timelineDot}>●</span>
                Upload your proof via the dashboard
              </Text>
              <Text style={timelineStep}>
                <span style={timelineDot}>●</span>
                Our team reviews within 2 business days
              </Text>
              <Text style={timelineStep}>
                <span style={timelineDot}>●</span>
                Once verified, your prize will be paid out
              </Text>
            </Section>

            <Text style={signoff}>
              Well played,
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
  padding: '40px 40px 32px 40px',
  textAlign: 'center' as const,
};

const trophyIcon: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 8px 0',
};

const logoText: React.CSSProperties = {
  color: '#F9F9F6',
  fontSize: '18px',
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
  margin: '0 0 16px 0',
  fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif',
};

const paragraph: React.CSSProperties = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const prizeCard: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1A2E1A 0%, #2A422A 100%)',
  borderRadius: '20px',
  padding: '32px',
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
};

const tierBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: 'rgba(212, 175, 55, 0.2)',
  color: '#D4AF37',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  borderRadius: '9999px',
  padding: '6px 16px',
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '0.5px',
  margin: '0 0 16px 0',
};

const prizeAmountText: React.CSSProperties = {
  color: '#D4AF37',
  fontSize: '42px',
  fontWeight: 300,
  margin: '0 0 8px 0',
  fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif',
};

const matchInfo: React.CSSProperties = {
  color: 'rgba(249, 249, 246, 0.7)',
  fontSize: '14px',
  margin: '0 0 20px 0',
};

const drawnNumbersRow: React.CSSProperties = {
  textAlign: 'center' as const,
};

const drawnNumber: React.CSSProperties = {
  display: 'inline-block',
  width: '40px',
  height: '40px',
  lineHeight: '40px',
  borderRadius: '50%',
  backgroundColor: 'rgba(212, 175, 55, 0.15)',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  color: '#D4AF37',
  fontSize: '15px',
  fontWeight: 700,
  textAlign: 'center' as const,
  margin: '0 4px',
};

const verificationBox: React.CSSProperties = {
  backgroundColor: '#FFF8E7',
  border: '1px solid rgba(212, 175, 55, 0.2)',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px 0',
};

const verificationTitle: React.CSSProperties = {
  color: '#1A2E1A',
  fontSize: '16px',
  fontWeight: 700,
  margin: '0 0 8px 0',
};

const verificationText: React.CSSProperties = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
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

const timelineSection: React.CSSProperties = {
  margin: '0 0 24px 0',
};

const timelineTitle: React.CSSProperties = {
  color: '#1A2E1A',
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 12px 0',
};

const timelineStep: React.CSSProperties = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
  paddingLeft: '4px',
};

const timelineDot: React.CSSProperties = {
  color: '#D4AF37',
  marginRight: '8px',
  fontSize: '10px',
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
  margin: 0,
};
