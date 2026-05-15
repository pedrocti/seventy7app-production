import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', prepare: false });

// Edit these to match your actual plans and desired ROI ranges
const PLAN_UPDATES = [
  { id: 1, name: 'GOLD STARTER', min: 10, max: 15 },
  { id: 2, name: 'gold fish',    min: 8,  max: 12 },
  { id: 3, name: 'growth stake', min: 12, max: 18 },
];

const TERM_MONTHS = 12;

async function fix() {
  for (const p of PLAN_UPDATES) {
    const minTotal = +(p.min * TERM_MONTHS).toFixed(4);
    const maxTotal = +(p.max * TERM_MONTHS).toFixed(4);
    const mid      = +((p.min + p.max) / 2).toFixed(4);

    await sql`
      UPDATE plans SET
        min_monthly_roi     = ${p.min},
        max_monthly_roi     = ${p.max},
        min_total_roi       = ${minTotal},
        max_total_roi       = ${maxTotal},
        monthly_roi_percent = ${mid}
      WHERE id = ${p.id}
    `;
    console.log(`✅ ${p.name}: ${p.min}%–${p.max}%/mo | ${minTotal}%–${maxTotal}% total | mid=${mid}%`);
  }

  const rows = await sql`
    SELECT id, name, monthly_roi_percent, min_monthly_roi, max_monthly_roi, min_total_roi, max_total_roi
    FROM plans ORDER BY id
  `;
  console.log('\n=== Updated Plans ===');
  console.table(rows);
  await sql.end();
}

fix().catch(e => { console.error(e); process.exit(1); });
