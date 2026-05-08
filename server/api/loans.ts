// server/api/loans.ts
import { Router } from 'express';
import { db } from '../db/connection';
import { loan_applications, loan_settings, investments, portfolio_requests } from '../db/connection';
import { eq, desc, and } from 'drizzle-orm';
const router = Router();

/* ── GET /api/loans/settings ── */
router.get('/settings', async (_req, res) => {
  try {
    const [s] = await db.select().from(loan_settings).limit(1);
    res.json({ success: true, settings: s || { interest_rate:'15.00', min_investment:'5000.00', max_loan_pct:'50.00' } });
  } catch { res.status(500).json({ success:false, error:'Failed to fetch settings' }); }
});

/* ── GET /api/loans ── */
router.get('/', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success:false, error:'Unauthorized' });
    const loans = await db.select().from(loan_applications)
      .where(eq(loan_applications.user_id, userId))
      .orderBy(desc(loan_applications.created_at));
    res.json({ success:true, loans });
  } catch { res.status(500).json({ success:false, error:'Failed to fetch loans' }); }
});

/* ── GET /api/loans/eligibility — check if user qualifies ── */
router.get('/eligibility', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success:false, error:'Unauthorized' });

    const [settings] = await db.select().from(loan_settings).limit(1);
    const minInvestment = Number(settings?.min_investment ?? 5000);
    const maxLoanPct    = Number(settings?.max_loan_pct   ?? 50);
    const interestRate  = Number(settings?.interest_rate  ?? 15);

    // Check active stakes
    const userInvestments = await db.select().from(investments)
      .where(and(eq(investments.user_id, userId), eq(investments.status, 'active')));
    const totalInvested = userInvestments.reduce((sum, i) => sum + Number(i.amount), 0);

    // Check portfolio management (approved requests qualify)
    const portfolios = await db.select().from(portfolio_requests)
      .where(and(eq(portfolio_requests.user_id, userId), eq(portfolio_requests.status, 'approved')));
    const portfolioAmount = portfolios.reduce((sum, p) => sum + Number(p.amount), 0);

    const hasStake     = totalInvested >= minInvestment;
    const hasPortfolio = portfolioAmount >= 50000;
    const eligible     = hasStake || hasPortfolio;

    const baseAmount = hasPortfolio ? portfolioAmount : totalInvested;
    const maxLoan    = eligible ? (baseAmount * maxLoanPct) / 100 : 0;

    res.json({
      success: true,
      eligible,
      reason:       hasPortfolio ? 'portfolio' : hasStake ? 'stake' : 'none',
      totalInvested,
      portfolioAmount,
      maxLoan,
      interestRate,
      minInvestment,
      maxLoanPct,
    });
  } catch (err) {
    console.error('[Loans] Eligibility error:', err);
    res.status(500).json({ success:false, error:'Failed to check eligibility' });
  }
});

/* ── POST /api/loans/apply ── */
router.post('/apply', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success:false, error:'Unauthorized' });

    const { amount, duration_months, purpose } = req.body;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success:false, error:'Invalid amount' });
    }

    const [settings] = await db.select().from(loan_settings).limit(1);
    const minInvestment = Number(settings?.min_investment ?? 5000);
    const maxLoanPct    = Number(settings?.max_loan_pct   ?? 50);
    const interestRate  = Number(settings?.interest_rate  ?? 15);

    // Check stakes
    const userInvestments = await db.select().from(investments)
      .where(and(eq(investments.user_id, userId), eq(investments.status, 'active')));
    const totalInvested = userInvestments.reduce((sum, i) => sum + Number(i.amount), 0);

    // Check portfolio management
    const portfolios = await db.select().from(portfolio_requests)
      .where(and(eq(portfolio_requests.user_id, userId), eq(portfolio_requests.status, 'approved')));
    const portfolioAmount = portfolios.reduce((sum, p) => sum + Number(p.amount), 0);

    const hasStake     = totalInvested >= minInvestment;
    const hasPortfolio = portfolioAmount >= 50000;

    if (!hasStake && !hasPortfolio) {
      return res.status(403).json({
        success: false,
        error: `You need at least $${minInvestment.toLocaleString()} in active stakes or an approved portfolio management account to apply.`
      });
    }

    const baseAmount = hasPortfolio ? portfolioAmount : totalInvested;
    const maxLoan    = (baseAmount * maxLoanPct) / 100;

    if (Number(amount) > maxLoan) {
      return res.status(400).json({
        success: false,
        error: `Maximum loan is $${maxLoan.toFixed(2)} (${maxLoanPct}% of your $${baseAmount.toFixed(2)} ${hasPortfolio ? 'portfolio' : 'stake'}).`
      });
    }

    // No pending application check
    const [existing] = await db.select().from(loan_applications)
      .where(and(eq(loan_applications.user_id, userId), eq(loan_applications.status, 'pending')));
    if (existing) {
      return res.status(409).json({ success:false, error:'You already have a pending loan application.' });
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

    res.status(201).json({ success:true, loan });
  } catch (err: any) {
    console.error('[Loans] Apply error:', err);
    res.status(500).json({ success:false, error:'Failed to submit application' });
  }
});

export default router;