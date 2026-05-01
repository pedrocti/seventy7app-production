import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '../assets/logo.jpeg';

const navLinks = [
  { name: 'About',    href: '#about' },
  { name: 'Services', href: '#offerings' },
  { name: 'Insights', href: '#blog' },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`nav-header ${scrolled ? 'nav-header--scrolled' : ''}`}>

      {/* ── Nav bar ── */}
      <nav className="nav-bar">

        {/* Logo */}
        <motion.a
          href="#"
          className="nav-logo"
          onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo image with gold accent border */}
          <div className="nav-logo-img-wrap">
            <img
              src={logoImage}
              alt="77Kapital"
              className="nav-logo-img"
            />
          </div>

          {/* Brand name */}
          <div className="nav-logo-text">
            <span className="nav-logo-name">
              <span className="nav-logo-77">77</span>Kapital
            </span>
            <span className="nav-logo-sub">Premium Trading</span>
          </div>
        </motion.a>

        {/* Desktop links */}
        <div className="nav-links">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.name}
              href={link.href}
              className="nav-link"
              onClick={e => { e.preventDefault(); scrollTo(link.href); }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.5 }}
            >
              {link.name}
              <motion.span
                className="nav-link-underline"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.22 }}
              />
            </motion.a>
          ))}
        </div>

        {/* Desktop CTA */}
        <motion.div
          className="nav-actions"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {!isLoggedIn && (
            <a href="/login" className="nav-signin">Sign In</a>
          )}
          <motion.a
            href={isLoggedIn ? '/dashboard' : '/register'}
            className="nav-cta"
            whileHover={{ background: '#E8C96A' }}
            whileTap={{ scale: 0.97 }}
          >
            {isLoggedIn ? 'Dashboard' : 'Get Access'}
          </motion.a>
        </motion.div>

        {/* Mobile hamburger */}
        <button
          className="nav-burger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={`nav-burger-bar nav-burger-bar--top    ${menuOpen ? 'nav-burger-bar--open-top'    : ''}`} />
          <span className={`nav-burger-bar nav-burger-bar--mid    ${menuOpen ? 'nav-burger-bar--open-mid'    : ''}`} />
          <span className={`nav-burger-bar nav-burger-bar--bottom ${menuOpen ? 'nav-burger-bar--open-bottom' : ''}`} />
        </button>

      </nav>

      {/* ── Mobile dropdown menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="nav-mobile-inner">

              {/* Nav links */}
              <div className="nav-mobile-links">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    className="nav-mobile-link"
                    onClick={e => { e.preventDefault(); scrollTo(link.href); }}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.25 }}
                  >
                    <span className="nav-mobile-link-num">0{i + 1}</span>
                    {link.name}
                  </motion.a>
                ))}
              </div>

              {/* Mobile CTA row */}
              <div className="nav-mobile-ctas">
                <a
                  href="/login"
                  className="nav-mobile-signin"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </a>
                <a
                  href={isLoggedIn ? '/dashboard' : '/register'}
                  className="nav-mobile-cta"
                  onClick={() => setMenuOpen(false)}
                >
                  {isLoggedIn ? 'Dashboard' : 'Get Access'}
                </a>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}