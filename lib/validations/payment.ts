import { z } from 'zod';

// ──────────────────────────────────────────────────────────
// Payment Validation Schema — Step 7.1
// Card number comes in as formatted string "1234 5678 9012 3456" (19 chars)
// ──────────────────────────────────────────────────────────

export const paymentSchema = z.object({
  cardNumber: z.string().min(19, 'Invalid card number'),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry (MM/YY)'),
  cvc: z.string().length(3, 'CVC must be 3 digits'),
  name: z.string().min(2, 'Cardholder name required'),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
