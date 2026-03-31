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
// Draw Results Email — sent to all draw participants after
// a draw is published. Shows drawn numbers and the user's
// match tier (if any) and prize amount.
// ──────────────────────────────────────────────────────────

interface DrawResultsEmailProps {
  fullName: string;
  drawMonth: string; // e.g. 'March 2026'
  numbersDrawn: number[];
  userScores: number[];
  matchTier: 'five' | 'four' | 'three' | null;
  prizeAmount: number | null; // in pence
  siteUrl?: string;
}

export default function DrawResultsEmail({
  fullName = 'there',
  drawMonth = 'March 2026',
  numbersDrawn = [7, 14, 22, 31, 39],
  userScores = [7, 12, 22, 35, 41],
  matchTier = null,
  prizeAmount = null,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
}: DrawResultsEmailProps) {
  const isWinner = matchTier !== null;
  const matchCount =
    matchTier === 'five'
      ? 5
      : matchTier === 'four'
        ? 4
        : matchTier === 'three'
          ? 3
          : 0;
  const previewText = isWinner
    ? `🎉 You matched ${matchCount} numbers in the ${drawMonth} draw!`
    : `${drawMonth} draw results are in — see how you did!`;

  const formatPrize = (pence: number) => {
    return `₹${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
  };

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
            <Heading style={heading}>{drawMonth} Draw Results</Heading>

            <Text style={paragraph}>
              Hi {fullName}, the {drawMonth} draw has been completed! Here are
              the results:
            </Text>

            {/* Drawn numbers display */}
            <Section style={numbersContainer}>
              <Text style={numbersLabel}>NUMBERS DRAWN</Text>
              <Section style={numberBallsRow}>
                {numbersDrawn.map((num, i) => {
                  const isMatch = userScores.includes(num);
                  return (
                    <span
                      key={i}
                      style={{
                        ...numberBall,
                        ...(isMatch ? numberBallMatch : {}),
                      }}
                    >
                      {num}
                    </span>
                  );
                })}
              </Section>
            </Section>

            {/* User's scores */}
            <Section style={scoresContainer}>
              <Text style={scoresLabel}>YOUR SCORES</Text>
              <Section style={numberBallsRow}>
                {userScores.map((num, i) => {
                  const isMatch = numbersDrawn.includes(num);
                  return (
                    <span
                      key={i}
                      style={{
                        ...scoreBall,
                        ...(isMatch ? scoreBallMatch : {}),
                      }}
                    >
                      {num}
                    </span>
                  );
                })}
              </Section>
            </Section>

            {/* Result */}
            {isWinner ? (
              <Section style={winnerBanner}>
                <Text style={winnerTitle}>🎉 Congratulations!</Text>
                <Text style={winnerText}>
                  You matched <strong>{matchCount} numbers</strong> and won{' '}
                  <strong style={{ color: '#D4AF37' }}>
                    {formatPrize(prizeAmount!)}
                  </strong>
                  !
                </Text>
                <Section style={ctaSection}>
                  <Link
                    href={`${siteUrl}/dashboard/winnings`}
                    style={ctaButtonGold}
                  >
                    View Your Winnings →
                  </Link>
                </Section>
              </Section>
            ) : (
              <Section style={noMatchBanner}>
                <Text style={noMatchText}>
                  No matches this month — but every draw is a new chance! Keep
                  your scores updated for next month.
                </Text>
                <Section style={ctaSection}>
                  <Link href={`${siteUrl}/dashboard/scores`} style={ctaButton}>
                    Update Your Scores →
                  </Link>
                </Section>
              </Section>
            )}

            <Text style={signoff}>
              Good luck next month,
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
  fontSize: '26px',
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

const numbersContainer: React.CSSProperties = {
  backgroundColor: '#1A2E1A',
  borderRadius: '16px',
  padding: '24px',
  margin: '24px 0 16px 0',
  textAlign: 'center' as const,
};

const numbersLabel: React.CSSProperties = {
  color: '#D4AF37',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '2px',
  margin: '0 0 16px 0',
  textTransform: 'uppercase' as const,
};

const numberBallsRow: React.CSSProperties = {
  textAlign: 'center' as const,
};

const numberBall: React.CSSProperties = {
  display: 'inline-block',
  width: '48px',
  height: '48px',
  lineHeight: '48px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.1)',
  border: '2px solid rgba(255,255,255,0.2)',
  color: '#F9F9F6',
  fontSize: '18px',
  fontWeight: 700,
  textAlign: 'center' as const,
  margin: '0 6px',
};

const numberBallMatch: React.CSSProperties = {
  backgroundColor: '#D4AF37',
  borderColor: '#F1D570',
  color: '#1A2E1A',
};

const scoresContainer: React.CSSProperties = {
  backgroundColor: '#f7f7f4',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const scoresLabel: React.CSSProperties = {
  color: '#999',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '2px',
  margin: '0 0 16px 0',
  textTransform: 'uppercase' as const,
};

const scoreBall: React.CSSProperties = {
  display: 'inline-block',
  width: '44px',
  height: '44px',
  lineHeight: '44px',
  borderRadius: '50%',
  backgroundColor: '#ffffff',
  border: '2px solid #e5e5e5',
  color: '#4a4a4a',
  fontSize: '16px',
  fontWeight: 600,
  textAlign: 'center' as const,
  margin: '0 5px',
};

const scoreBallMatch: React.CSSProperties = {
  backgroundColor: '#D4AF37',
  borderColor: '#D4AF37',
  color: '#1A2E1A',
  fontWeight: 700,
};

const winnerBanner: React.CSSProperties = {
  backgroundColor: '#D4AF37',
  backgroundImage: 'linear-gradient(135deg, #D4AF37 0%, #F1D570 100%)',
  borderRadius: '16px',
  padding: '32px 24px',
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
};

const winnerTitle: React.CSSProperties = {
  color: '#1A2E1A',
  fontSize: '24px',
  fontWeight: 700,
  margin: '0 0 8px 0',
  fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif',
};

const winnerText: React.CSSProperties = {
  color: '#1A2E1A',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
};

const noMatchBanner: React.CSSProperties = {
  backgroundColor: '#f7f7f4',
  borderRadius: '16px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
};

const noMatchText: React.CSSProperties = {
  color: '#666',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
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

const ctaButtonGold: React.CSSProperties = {
  backgroundColor: '#1A2E1A',
  color: '#F9F9F6',
  padding: '12px 28px',
  borderRadius: '9999px',
  fontSize: '15px',
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
  margin: 0,
};
