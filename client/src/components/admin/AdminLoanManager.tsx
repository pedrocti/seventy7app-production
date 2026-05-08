// client/src/components/admin/AdminLoanManager.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const fmt = (v: any) => { const n = Number(v ?? 0); return isNaN(n) ? '0.00' : n.toFixed(2); };

function authHeader() {
  const token = localStorage.getItem('token');
  return { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) };
}

interface Loan {
  id: number; user_id: number; amount: string; interest_rate: string;
  duration_months: number; status: string; purpose: string; admin_notes: string;
  approved_at: string | null; created_at: string; username: string; email: string;
}

interface Settings {
  id: number; interest_rate: string; min_investment: string; max_loan_pct: string;
}

export default function AdminLoanManager() {
  const [loans,    setLoans]    = useState<Loan[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState<{ type:'ok'|'err'; text:string } | null>(null);
  const [tab,      setTab]      = useState<'applications'|'settings'>('applications');
  const [notes,    setNotes]    = useState<Record<number,string>>({});

  // Settings form state
  const [intRate,  setIntRate]  = useState('15');
  const [minInv,   setMinInv]   = useState('5000');
  const [maxPct,   setMaxPct]   = useState('50');
  const [saving,   setSaving]   = useState(false);

  const showMsg = (type: 'ok'|'err', text: string) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  async function load() {
    setLoading(true);
    try {
      const [lRes, sRes] = await Promise.all([
        fetch('/api/admin/loans',          { headers: authHeader() }).then(r=>r.json()),
        fetch('/api/admin/loans/settings', { headers: authHeader() }).then(r=>r.json()),
      ]);
      if (lRes.success) setLoans(lRes.loans || []);
      if (sRes.success && sRes.settings) {
        setSettings(sRes.settings);
        setIntRate(sRes.settings.interest_rate);
        setMinInv(sRes.settings.min_investment);
        setMaxPct(sRes.settings.max_loan_pct);
      }
    } catch { showMsg('err', 'Failed to load data'); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: number, status: 'approved' | 'rejected') {
    try {
      const r = await fetch(`/api/admin/loans/${id}`, {
        method:'PUT', headers: authHeader(),
        body: JSON.stringify({ status, admin_notes: notes[id] || null }),
      });
      const d = await r.json();
      if (d.success) { showMsg('ok', `Loan ${status}`); load(); }
      else showMsg('err', d.error || 'Failed');
    } catch { showMsg('err', 'Network error'); }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const r = await fetch('/api/admin/loans/settings', {
        method:'PUT', headers: authHeader(),
        body: JSON.stringify({ interest_rate: intRate, min_investment: minInv, max_loan_pct: maxPct }),
      });
      const d = await r.json();
      if (d.success) { showMsg('ok', 'Settings saved'); load(); }
      else showMsg('err', d.error || 'Failed');
    } catch { showMsg('err', 'Network error'); }
    setSaving(false);
  }

  const inp = { width:'100%', background:'var(--surface-2)', border:'1px solid rgba(10,239,255,0.15)', padding:'10px 14px', color:'var(--text)', fontFamily:'var(--font-sans)', fontSize:13, fontWeight:300, outline:'none', borderRadius:0, boxSizing:'border-box' as const };
  const lbl = { fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase' as const, color:'var(--muted-2)', display:'block', marginBottom:6 };
  const act = { fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase' as const, padding:'5px 10px', background:'transparent', cursor:'pointer', transition:'all 0.2s' };

  const statusColor: Record<string, string> = {
    pending:  'var(--cyan)',
    approved: 'var(--green)',
    rejected: 'var(--red)',
    repaid:   'var(--muted-2)',
  };

  return (
    <div style={{ padding:'32px 0' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, paddingBottom:20, borderBottom:'1px solid rgba(10,239,255,0.10)' }}>
        <div>
          <span style={{ ...lbl, marginBottom:4 }}>Capital Loan Programme</span>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:300, color:'var(--text)', margin:0 }}>Loan Management</h2>
        </div>
        {/* Tab toggle */}
        <div style={{ display:'flex', gap:1, background:'rgba(10,239,255,0.08)' }}>
          {(['applications','settings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...act, padding:'8px 16px', background: tab===t ? 'rgba(10,239,255,0.10)' : 'var(--surface)', color: tab===t ? 'var(--cyan)' : 'var(--muted-2)', border:'none' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            style={{ marginBottom:20, padding:'12px 16px', background:msg.type==='ok'?'rgba(14,203,129,0.08)':'rgba(246,70,93,0.08)', border:`1px solid ${msg.type==='ok'?'rgba(14,203,129,0.25)':'rgba(246,70,93,0.25)'}`, fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.1em', color:msg.type==='ok'?'var(--green)':'var(--red)' }}>
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applications tab */}
      {tab === 'applications' && (
        loading ? (
          <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Loading…</div>
        ) : loans.length === 0 ? (
          <div style={{ padding:'48px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>No loan applications yet</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:1, background:'rgba(10,239,255,0.08)' }}>
            {loans.map(loan => (
              <div key={loan.id} style={{ background:'var(--bg)', padding:'20px 24px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:16, alignItems:'start' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, flexWrap:'wrap' }}>
                      <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:300, color:'var(--text)' }}>${fmt(loan.amount)}</span>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.12em', textTransform:'uppercase', padding:'2px 8px', border:`1px solid ${statusColor[loan.status]||'var(--muted-2)'}`, color:statusColor[loan.status]||'var(--muted-2)' }}>
                        {loan.status}
                      </span>
                    </div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted-2)', letterSpacing:'0.08em', marginBottom:6 }}>
                      {loan.username} · {loan.email} · {loan.duration_months}mo · {loan.interest_rate}% annual
                    </div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--muted-2)', letterSpacing:'0.08em', marginBottom: loan.purpose ? 10 : 0 }}>
                      Applied {format(new Date(loan.created_at), 'MMM d, yyyy HH:mm')}
                    </div>
                    {loan.purpose && (
                      <div style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--muted)', lineHeight:1.6, marginBottom:12 }}>
                        Purpose: {loan.purpose}
                      </div>
                    )}
                    {/* Admin notes input (only for pending) */}
                    {loan.status === 'pending' && (
                      <div style={{ marginTop:10 }}>
                        <span style={lbl}>Admin Note (optional)</span>
                        <input value={notes[loan.id] || ''} onChange={e => setNotes(n => ({ ...n, [loan.id]: e.target.value }))}
                          placeholder="Add note for the user…" style={{ ...inp, maxWidth:400 }} />
                      </div>
                    )}
                    {loan.admin_notes && loan.status !== 'pending' && (
                      <div style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--muted)', padding:'8px 12px', background:'rgba(10,239,255,0.03)', borderLeft:'2px solid rgba(10,239,255,0.2)', marginTop:8 }}>
                        Note: {loan.admin_notes}
                      </div>
                    )}
                  </div>

                  {/* Actions — only for pending */}
                  {loan.status === 'pending' && (
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      <button onClick={() => updateStatus(loan.id, 'approved')}
                        style={{ ...act, border:'1px solid rgba(14,203,129,0.3)', color:'var(--green)', padding:'7px 14px' }}>
                        Approve
                      </button>
                      <button onClick={() => updateStatus(loan.id, 'rejected')}
                        style={{ ...act, border:'1px solid rgba(246,70,93,0.2)', color:'var(--red)', padding:'7px 14px' }}>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div style={{ maxWidth:480 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={lbl}>Annual Interest Rate (%)</label>
              <input type="number" value={intRate} onChange={e => setIntRate(e.target.value)} style={inp} min="0" max="100" step="0.5" />
            </div>
            <div>
              <label style={lbl}>Minimum Active Stake Required ($)</label>
              <input type="number" value={minInv} onChange={e => setMinInv(e.target.value)} style={inp} min="0" />
            </div>
            <div>
              <label style={lbl}>Maximum Loan as % of Stake</label>
              <input type="number" value={maxPct} onChange={e => setMaxPct(e.target.value)} style={inp} min="0" max="100" />
            </div>
            <div style={{ padding:'16px', background:'rgba(10,239,255,0.04)', border:'1px solid rgba(10,239,255,0.10)' }}>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted-2)', lineHeight:1.7 }}>
                Example: A member with $10,000 staked can borrow up to ${((10000 * Number(maxPct)) / 100).toFixed(0)} at {intRate}% annual interest.
              </p>
            </div>
            <button onClick={saveSettings} disabled={saving} className="btn-primary" style={{ cursor:'pointer', opacity:saving?0.6:1, width:'100%', justifyContent:'center' }}>
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}