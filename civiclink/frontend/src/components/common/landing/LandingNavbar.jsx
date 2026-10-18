import { useEffect, useState } from 'react';

const links = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How it Works' },
  { href: '#stats', label: 'Stats' },
];

export default function LandingNavbar() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`cl-nav ${solid ? 'cl-nav--solid' : ''}`}>
      <div className="cl-nav__inner">
        <a href="#home" className="cl-brand">
          <span className="cl-brand__mark" aria-hidden>
            {/* simple pin mark */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12Z"
                fill="#E8714A"
              />
              <circle cx="12" cy="10" r="2.5" fill="#F5EDD6" />
            </svg>
          </span>
          <span className="cl-brand__text">CivicLink</span>
        </a>

        <nav className={`cl-nav__links ${open ? 'is-open' : ''}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="cl-nav__actions">
          <a href="#auth" className="cl-btn cl-btn--ghost" onClick={() => setOpen(false)}>
            Login
          </a>
          <a
            href="#auth"
            className="cl-btn cl-btn--primary"
            onClick={() => {
              setOpen(false);
              // optional: tell AuthSection to open signup via custom event
              window.dispatchEvent(new CustomEvent('cl-auth-mode', { detail: 'signup' }));
            }}
          >
            Sign Up
          </a>
          <button
            type="button"
            className="cl-nav__burger"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}