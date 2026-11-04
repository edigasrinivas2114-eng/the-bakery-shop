'use client';

import { useEffect, useState } from 'react';
import { business } from '@/config/business';
import { applyTheme, themes, type Theme } from '@/config/themes';

const KEY = 'bakery-theme';

/** Floating colour-theme switcher for reviewing the site in different palettes. Shown only in demo mode. */
export function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('chocolate');

  useEffect(() => {
    let id: string | null = new URLSearchParams(location.search).get('theme');
    if (!id) {
      try {
        id = localStorage.getItem(KEY);
      } catch {
        id = null;
      }
    }
    const t = themes.find((x) => x.id === id);
    if (t) {
      applyTheme(t);
      setActive(t.id);
    }
  }, []);

  if (!business.demoMode) return null;

  const pick = (t: Theme) => {
    const html = document.documentElement;
    html.classList.add('theme-anim');
    applyTheme(t);
    setActive(t.id);
    window.setTimeout(() => html.classList.remove('theme-anim'), 600);
    try {
      localStorage.setItem(KEY, t.id);
    } catch {
      /* storage unavailable: theme still applies for this visit */
    }
  };

  const current = themes.find((x) => x.id === active) ?? themes[0];

  return (
    <div className="fixed bottom-[calc(16px+env(safe-area-inset-bottom,0px))] left-4 z-50">
      {open && (
        <div
          id="theme-panel"
          className="mb-3 w-[min(320px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-black/10 bg-white text-[#2a2a2a] shadow-[0_24px_60px_-20px_rgba(0,0,0,.45)]"
        >
          <p className="border-b border-black/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black/55">Colour theme</p>
          <ul className="max-h-[60svh] overflow-y-auto p-2">
            {themes.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => pick(t)}
                  aria-pressed={t.id === active}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-black/5 ${t.id === active ? 'bg-black/[0.06]' : ''}`}
                >
                  <span className="flex shrink-0 overflow-hidden rounded-full border border-black/10">
                    {[t.t['choc-deep'], t.t.caramel, t.t.cream, t.t.berry, t.t.glow].map((c, i) => (
                      <span key={i} className="h-7 w-4" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="block truncate text-xs text-black/55">{t.note}</span>
                  </span>
                  {t.id === active && <span className="text-sm" aria-hidden>✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="theme-panel"
        className="flex min-h-[44px] items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-sm font-semibold text-[#2a2a2a] shadow-[0_12px_30px_-12px_rgba(0,0,0,.5)]"
      >
        <span className="flex overflow-hidden rounded-full">
          {[current.t['choc-deep'], current.t.caramel, current.t.berry].map((c, i) => (
            <span key={i} className="h-4 w-2.5" style={{ background: c }} />
          ))}
        </span>
        Theme
      </button>
    </div>
  );
}
