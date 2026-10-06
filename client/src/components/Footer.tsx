// client/src/components/Footer.tsx
import trustpilotLogo from "../assets/trustpilot-logo.svg";
import { useLocation } from 'wouter';

const socialLinks = [
  { name: 'Telegram',    href: 'https://t.me/seventy7hub' },
  { name: 'X / Twitter', href: 'https://x.com/seventy7Kapital' },
  { name: 'Instagram',   href: 'https://www.instagram.com/seventy7trading' },
  { name: 'LinkedIn',    href: 'https://www.linkedin.com/company/seventy7-trading-academy' },
  { name: 'Facebook',    href: 'https://www.facebook.com/share/1AiekpPNc3/' },
];

const navColumns = [
  {
    label: 'Platform',
    links: [
      { name: 'Dashboard',  href: '/dashboard',  isRoute: true  },
      { name: 'Staking',    href: '/invest',     isRoute: true  },
      { name: 'Portfolio',  href: '/portfolio',   isRoute: true  },
      { name: 'Learning',   href: '/learning',    isRoute: true  },
      { name: 'Blog',       href: '/blog',       isRoute: true  },
    ],
  },
  {
    label: 'Company',
    links: [
      { name: 'About',      href: '#about',      isRoute: false },
      { name: 'Mentorship', href: '/mentorship', isRoute: true  },
      { name: 'Insights',   href: '#blog',       isRoute: false },
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

const TRUSTPILOT_URL =
  'https://www.trustpilot.com/evaluate/seventy7hub.com';

export default function Footer() {
  const [, setLocation] = useLocation();

  return (
    <footer style={{ background: 'var(--bg)', borderTop: '1px solid rgba(10,239,255,0.08)' }}>
      <div className="container-s7" style={{ paddingTop: 72, paddingBottom: 48 }}>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '40px 32px',
            paddingBottom: 56,
            borderBottom: '1px solid rgba(10,239,255,0.07)',
          }}
        >

          {/* BRAND COLUMN */}
          <div>
            <button
              type="button"
              onClick={() => setLocation('/')}
              className="footer-brand"
            >
              <span className="nav-logo-77">77</span>Kapital
              <span className="footer-brand-sub">Seventy7 Hub</span>
            </button>

            <p className="body-text-sm" style={{ maxWidth: 280, margin: '20px 0 28px' }}>
              Smarter staking, structured learning, and professional portfolio management all unified on one premium platform.
            </p>

            {/* TRUSTPILOT BLOCK */}
            <a
              href={TRUSTPILOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                marginBottom: 18,
                border: '1px solid rgba(0, 182, 122, 0.25)',
                background: 'rgba(0, 182, 122, 0.06)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(0, 182, 122, 0.55)';
                el.style.background = 'rgba(0, 182, 122, 0.10)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(0, 182, 122, 0.25)';
                el.style.background = 'rgba(0, 182, 122, 0.06)';
              }}
            >
              <img
                src={trustpilotLogo}
                alt="Trustpilot"
                style={{
                  height: 18,
                  width: 'auto',
                  display: 'block',
                  filter: 'none'
                }}
              />

              <span className="footer-link" style={{ fontSize: 11 }}>
                Leave us a review
              </span>
            </a>

            {/* SOCIALS */}
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
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {s.name.charAt(0)}
                </a>
              ))}
            </div>
          </div>

          {/* NAV COLUMNS */}
          {navColumns.map(col => (
            <div key={col.label}>
              <span className="footer-col-label">{col.label}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(link =>
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
                    <a key={link.name} href={link.href} className="footer-link">
                      {link.name}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CONTACT ROW */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
            flexWrap: 'wrap',
            padding: '20px 0',
            borderBottom: '1px solid rgba(10,239,255,0.05)',
          }}
        >
          <span className="footer-link" style={{ fontSize: 11 }}>
            75 Queens Dock, 218 The Glass House
          </span>
          <a href="mailto:support@seventy7hub.com" className="footer-link" style={{ fontSize: 11 }}>
            support@seventy7hub.com
          </a>
          <a href="tel:+447887649072" className="footer-link" style={{ fontSize: 11 }}>
            +44 7887 649072
          </a>
        </div>

        {/* COPYRIGHT */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            paddingTop: 20,
          }}
        >
          <span className="footer-copy">
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