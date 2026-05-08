// server/api/loans.ts — user loan endpoints
import { Router } from 'express';
import { db } from '../db/connection';
import { loan_applications, loan_settings, investments } from '../db/connection';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
const router = Router();

/* ── GET /api/loans/settings — public loan terms ── */
router.get('/settings', async (req, res) => {
  try {
    const [s] = await db.select().from(loan_settings).limit(1);
    res.json({ success: true, settings: s || { interest_rate: '15.00', min_investment: '5000.00', max_loan_pct: '50.00' } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch loan settings' });
  }
});

/* ── GET /api/loans — user's loan applications ── */
router.get('/', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const loans = await db.select().from(loan_applications)
      .where(eq(loan_applications.user_id, userId))
      .orderBy(desc(loan_applications.created_at));
    res.json({ success: true, loans });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch loans' });
  }
});

/* ── POST /api/loans/apply — submit loan application ── */
router.post('/apply', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { amount, duration_months, purpose } = req.body;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    // Check loan settings
    const [settings] = await db.select().from(loan_settings).limit(1);
    const minInvestment = Number(settings?.min_investment ?? 5000);
    const maxLoanPct    = Number(settings?.max_loan_pct   ?? 50);
    const interestRate  = Number(settings?.interest_rate  ?? 15);

    // Check user has enough active investments
    const userInvestments = await db.select().from(investments)
      .where(and(eq(investments.user_id, userId), eq(investments.status, 'active')));

    const totalInvested = userInvestments.reduce((sum, i) => sum + Number(i.amount), 0);

    if (totalInvested < minInvestment) {
      return res.status(403).json({
        success: false,
        error: `You need at least $${minInvestment.toLocaleString()} in active stakes to apply for a loan.`
      });
    }

    const maxLoan = (totalInvested * maxLoanPct) / 100;
    if (Number(amount) > maxLoan) {
      return res.status(400).json({
        success: false,
        error: `Maximum loan amount is $${maxLoan.toFixed(2)} (${maxLoanPct}% of your $${totalInvested.toFixed(2)} active stake).`
      });
    }

    // Check no pending application
    const [existing] = await db.select().from(loan_applications)
      .where(and(eq(loan_applications.user_id, userId), eq(loan_applications.status, 'pending')));
    if (existing) {
      return res.status(409).json({ success: false, error: 'You already have a pending loan application.' });
    }

    const [loan] = await db.insert(loan_applications).values({
      user_id:         userId,
      amount:          String(Number(amount).toFixed(2)),
      interest_rate:   String(interestRate),
      duration_months: Number(duration_months) || 12,
      purpose:         purpose || null,
      status:          'pending',
      updated_at:      new Date(),
    }).returning();

    res.status(201).json({ success: true, loan });
  } catch (err: any) {
    console.error('[Loans] Apply error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit application' });
  }
});

export default router;