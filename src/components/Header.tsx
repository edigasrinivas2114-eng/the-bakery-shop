'use client';

import { useEffect, useState } from 'react';
import { business } from '@/config/business';
import { useOrder } from '@/lib/order';
import { Wordmark } from './Brand';

const links = [
  { href: '#menu', label: 'Menu' },
  { href: '#studio', label: 'Custom cakes' },
  { href: '#story', label: 'Our story' },
  { href: '#visit', label: 'Visit us' },
];

export function DemoBanner() {
  if (!business.demoMode) return null;
  return (
    <div className="gutter bg-caramel py-2 text-center text-[12px] font-medium text-cream">
      Demo menu. Prices, availability and contact details are still to be confirmed.
    </div>
  );
}

export function Header() {
  const { count, setOpen } = useOrder();
  const [menu, setMenu] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const f = () => setSolid(window.scrollY > 40);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  return (
    <header
      className={`sticky z-40 transition-colors duration-300 ${solid || menu ? 'bg-choc-deep/95 backdrop-blur-md' : 'bg-choc-deep'}`}
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="gutter mx-auto flex h-16 max-w-site items-center justify-between gap-4">
        <a href="#top" aria-label={`${business.name} home`}>
          <Wordmark dark />
        </a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-cream/80 transition hover:text-cream">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen(true)} className="btn-primary !px-4 !py-2.5" aria-label={`Open order, ${count} items`}>
            <BagIcon />
            <span className="hidden sm:inline">Order</span>
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white/20 px-1 text-[11px] tabular-nums">{count}</span>
          </button>
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-cream/25 text-cream md:hidden"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-controls="mobile-nav"
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {menu ? <path d="M4 4l10 10M14 4L4 14" /> : <path d="M2 5h14M2 9h14M2 13h14" />}
            </svg>
          </button>
        </div>
      </div>
      {menu && (
        <nav id="mobile-nav" className="gutter border-t border-cream/10 pb-5 pt-2 md:hidden" aria-label="Mobile">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenu(false)} className="block py-3 font-display text-2xl text-cream">
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

export function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 5h10l-.8 9H3.8L3 5Z" />
      <path d="M5.5 5V4a2.5 2.5 0 0 1 5 0v1" />
    </svg>
  );
}
