// server/api/admin/loans.ts — admin loan management
import { Router } from 'express';
import { db } from '../../db/connection';
import { loan_applications, loan_settings, users } from '../../db/connection';
import { eq, desc } from 'drizzle-orm';

const router = Router();

/* ── GET /api/admin/loans — all applications ── */
router.get('/', async (_req, res) => {
  try {
    const loans = await db.select({
      id:              loan_applications.id,
      user_id:         loan_applications.user_id,
      amount:          loan_applications.amount,
      interest_rate:   loan_applications.interest_rate,
      duration_months: loan_applications.duration_months,
      status:          loan_applications.status,
      purpose:         loan_applications.purpose,
      admin_notes:     loan_applications.admin_notes,
      approved_at:     loan_applications.approved_at,
      created_at:      loan_applications.created_at,
      username:        users.username,
      email:           users.email,
    })
    .from(loan_applications)
    .leftJoin(users, eq(loan_applications.user_id, users.id))
    .orderBy(desc(loan_applications.created_at));
    res.json({ success: true, loans });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch loans' });
  }
});

/* ── GET /api/admin/loans/settings ── MUST be before /:id ── */
router.get('/settings', async (_req, res) => {
  try {
    const [s] = await db.select().from(loan_settings).limit(1);
    res.json({ success: true, settings: s });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

/* ── PUT /api/admin/loans/settings ── MUST be before /:id ── */
router.put('/settings', async (req, res) => {
  try {
    console.log('[LoanSettings] Handler reached, body:', req.body);
    const { interest_rate, min_investment, max_loan_pct } = req.body;
    const [existing] = await db.select().from(loan_settings).limit(1);
    if (existing) {
      const [s] = await db.update(loan_settings).set({
        interest_rate:  String(Number(interest_rate).toFixed(2)),
        min_investment: String(Number(min_investment).toFixed(2)),
        max_loan_pct:   String(Number(max_loan_pct).toFixed(2)),
        updated_at:     new Date(),
      }).where(eq(loan_settings.id, existing.id)).returning();
      res.json({ success: true, settings: s });
    } else {
      const [s] = await db.insert(loan_settings).values({
        interest_rate:  String(Number(interest_rate).toFixed(2)),
        min_investment: String(Number(min_investment).toFixed(2)),
        max_loan_pct:   String(Number(max_loan_pct).toFixed(2)),
      }).returning();
      res.json({ success: true, settings: s });
    }
  } catch (err) {
    console.error('[LoanSettings] Update error:', err);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

/* ── PUT /api/admin/loans/:id — approve/reject ── */
router.put('/:id', async (req, res) => {
  try {
    const id     = parseInt(req.params.id);
    const { status, admin_notes } = req.body;
    if (!['approved','rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const [loan] = await db.update(loan_applications).set({
      status,
      admin_notes: admin_notes || null,
      approved_at: status === 'approved' ? new Date() : null,
      updated_at:  new Date(),
    }).where(eq(loan_applications.id, id)).returning();
    res.json({ success: true, loan });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update loan' });
  }
});

export default router;
