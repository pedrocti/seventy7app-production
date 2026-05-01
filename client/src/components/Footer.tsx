import { useLocation } from "wouter";

const socialLinks = [
  {
    name: "Telegram",
    href: "https://t.me/seventy7hub",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/>
      </svg>
    ),
  },
  {
    name: "Discord",
    href: "https://discord.gg/seventy7hub",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.9 20.9a.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
      </svg>
    ),
  },
  {
    name: "X (Twitter)",
    href: "https://x.com/seventy7hub",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/seventy7trading?igsh=ZmNmNTBtdWJqa3Ax&utm_source=qr",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/seventy7-trading-academy",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1AiekpPNc3/?mibextid=wwXIfr",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
];

const navColumns = [
  {
    label: "Platform",
    links: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Staking", href: "/invest" },
      { name: "Portfolio", href: "/portfolio" },
      { name: "Signals", href: "/signal" },
      { name: "Learning", href: "/learning" },
    ],
  },
  {
    label: "Company",
    links: [
      { name: "About", href: "#about" },
      { name: "Mentorship", href: "/mentorship" },
      { name: "Blog", href: "#blog" },
    ],
  },
  {
    label: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy-policy", isRoute: true },
      { name: "Terms of Service", href: "/terms-of-service", isRoute: true },
      { name: "Disclaimer", href: "/disclaimer", isRoute: true },
    ],
  },
];

const Footer = () => {
  const [, setLocation] = useLocation();

  return (
    <footer
      style={{
        background: "#080C14",
        borderTop: "1px solid rgba(242,178,58,0.08)",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo mark */}
            <div className="mb-5">
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="inline-flex flex-col items-start gap-0.5"
              >
                <span
                  style={{
                    color: "#F2B23A",
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    letterSpacing: "-0.01em",
                    lineHeight: 1,
                  }}
                >
                  77Kapital
                </span>
                <span
                  style={{
                    color: "rgba(242,178,58,0.35)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontFamily: '"Space Grotesk", sans-serif',
                  }}
                >
                  Seventy7 Hub
                </span>
              </button>
            </div>

            <p
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: "rgba(232,237,245,0.38)" }}
            >
              Smarter staking, structured learning, and professional portfolio
              management — all unified on one premium platform.
            </p>

            {/* Social icons */}
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.name}
                  className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
                  style={{
                    background: "rgba(232,237,245,0.04)",
                    border: "1px solid rgba(232,237,245,0.07)",
                    color: "rgba(232,237,245,0.4)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(242,178,58,0.08)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(242,178,58,0.2)";
                    (e.currentTarget as HTMLElement).style.color = "#F2B23A";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(232,237,245,0.04)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,237,245,0.07)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(232,237,245,0.4)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {navColumns.map((col) => (
            <div key={col.label}>
              <h4
                className="text-xs font-semibold tracking-widest uppercase mb-5"
                style={{
                  color: "#F2B23A",
                  fontFamily: '"Space Grotesk", sans-serif',
                }}
              >
                {col.label}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.name}>
                    {link.isRoute ? (
                      <button
                        type="button"
                        onClick={() => setLocation(link.href)}
                        className="text-sm text-left transition-colors duration-200"
                        style={{ color: "rgba(232,237,245,0.4)" }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLElement).style.color = "#F2B23A")
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLElement).style.color = "rgba(232,237,245,0.4)")
                        }
                      >
                        {link.name}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm transition-colors duration-200"
                        style={{ color: "rgba(232,237,245,0.4)" }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLElement).style.color = "#F2B23A")
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLElement).style.color = "rgba(232,237,245,0.4)")
                        }
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row sm:items-center gap-6"
          style={{ borderTop: "1px solid rgba(232,237,245,0.05)" }}
        >
          <div className="flex flex-wrap gap-6 text-sm" style={{ color: "rgba(232,237,245,0.35)" }}>
            <span>75 Queens Dock, 218 The Glass House</span>
            <a
              href="mailto:support@seventy7hub.com"
              style={{ color: "rgba(232,237,245,0.35)" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#F2B23A")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(232,237,245,0.35)")}
            >
              support@seventy7hub.com
            </a>
            <a
              href="tel:+447887649072"
              style={{ color: "rgba(232,237,245,0.35)" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#F2B23A")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(232,237,245,0.35)")}
            >
              +44 7887 649072
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p
            className="text-xs"
            style={{ color: "rgba(232,237,245,0.2)", fontFamily: '"Inter", sans-serif' }}
          >
            © {new Date().getFullYear()} Seventy7 Hub. All rights reserved.
          </p>
          <p
            className="text-xs"
            style={{ color: "rgba(232,237,245,0.15)", fontFamily: '"Inter", sans-serif' }}
          >
            Trading involves risk. Capital at risk. For educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;