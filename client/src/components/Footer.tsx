// client/src/components/Footer.tsx
import { useLocation } from 'wouter';

/* ═══════════════════════════════════════════════════════════
   FOOTER — uses our CSS design system exclusively
   No Space Grotesk, no Tailwind grid utilities,
   no rounded corners, all colors via CSS variables
═══════════════════════════════════════════════════════════ */

const socialLinks = [
  {
    name: 'Telegram',
    href: 'https://t.me/seventy7hub',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/>
      </svg>
    ),
  },
  {
    name: 'X / Twitter',
    href: 'https://x.com/seventy7hub',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/seventy7trading?igsh=ZmNmNTBtdWJqa3Ax',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/seventy7-trading-academy',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/share/1AiekpPNc3/?mibextid=wwXIfr',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
];

const navColumns = [
  {
    label: 'Platform',
    links: [
      { name: 'Dashboard',  href: '/dashboard',  isRoute: true  },
      { name: 'Staking',    href: '/invest',      isRoute: true  },
      { name: 'Portfolio',  href: '/portfolio',   isRoute: true  },
      { name: 'Learning',   href: '/learning',    isRoute: true  },
      { name: 'Blog',       href: '/blog',        isRoute: true  },
    ],
  },
  {
    label: 'Company',
    links: [
      { name: 'About',      href: '#about',       isRoute: false },
      { name: 'Mentorship', href: '/mentorship',  isRoute: true  },
      { name: 'Insights',   href: '#blog',        isRoute: false },
    ],
  },
  {
    label: 'Legal',
    links: [
      { name: 'Privacy Policy',   href: '/privacy-policy',   isRoute: true },
      { name: 'Terms of Service', href: '/terms-of-service', isRoute: true },
      { name: 'Disclaimer',       href: '/disclaimer',       isRoute: true },
    ],
  },
];

export default function Footer() {
  const [, setLocation] = useLocation();

  return (
    <footer style={{
      background:  'var(--bg)',
      borderTop:   '1px solid rgba(10,239,255,0.08)',
    }}>

      {/* ── Main grid ── */}
      <div className="container-s7" style={{ paddingTop: 72, paddingBottom: 48 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '0 48px',
          paddingBottom: 56,
          borderBottom: '1px solid rgba(10,239,255,0.07)',
        }}>

          {/* Brand column */}
          <div>
            <button
              type="button"
              onClick={() => setLocation('/')}
              className="footer-brand"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
            >
              <span className="nav-logo-77">77</span>Kapital
              <span className="footer-brand-sub">Seventy7 Hub</span>
            </button>

            <p className="body-text-sm" style={{ maxWidth: 280, margin: '20px 0 28px' }}>
              Smarter staking, structured learning, and professional portfolio
              management — all unified on one premium platform.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {socialLinks.map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.name}
                  className="footer-social"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    border: '1px solid rgba(240,237,230,0.07)',
                    background: 'rgba(240,237,230,0.03)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(10,239,255,0.25)';
                    el.style.background  = 'rgba(10,239,255,0.06)';
                    el.style.color       = 'var(--cyan)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(240,237,230,0.07)';
                    el.style.background  = 'rgba(240,237,230,0.03)';
                    el.style.color       = '';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {navColumns.map(col => (
            <div key={col.label}>
              <span className="footer-col-label">{col.label}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(link => (
                  link.isRoute ? (
                    <button
                      key={link.name}
                      type="button"
                      onClick={() => setLocation(link.href)}
                      className="footer-link"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <a
                      key={link.name}
                      href={link.href}
                      className="footer-link"
                    >
                      {link.name}
                    </a>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Contact row ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          flexWrap: 'wrap',
          padding: '20px 0',
          borderBottom: '1px solid rgba(10,239,255,0.05)',
        }}>
          <span className="footer-copy, footer-link">75 Queens Dock, 218 The Glass House</span>
          <a href="mailto:support@seventy7hub.com" className="footer-link" style={{ fontSize: 11 }}>
            support@seventy7hub.com
          </a>
          <a href="tel:+447887649072" className="footer-link" style={{ fontSize: 11 }}>
            +44 7887 649072
          </a>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 20,
        }}>
          <span className="footer-copy, footer-link">
            © {new Date().getFullYear()} Seventy7 Hub. All rights reserved.
          </span>
          <span className="footer-copy" style={{ opacity: 0.6 }}>
            Trading involves risk. Capital at risk. For educational purposes.
          </span>
        </div>
 
      </div>
    </footer>
  );
}