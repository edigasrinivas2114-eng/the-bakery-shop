'use client';

/**
 * Hero A · Cinematic video (chosen).
 * Desktop: the approved 16:9 Flow clip (cake on the right, copy on the left).
 * Phone: the approved 9:16 clip (cake low, copy on top).
 * Reduced motion: posters only.
 */
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { business, whatsappChatUrl, whatsappEnabled } from '@/config/business';
import { LoopVideo } from './LoopVideo';
import { DEFAULT_THEME, heroSuffix, type Theme } from '@/config/themes';

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  // Some colour themes have their own recoloured hero video (e.g. Blueberry Lavender → violet cake).
  const [hv, setHv] = useState(heroSuffix(DEFAULT_THEME));
  useEffect(() => {
    setHv(heroSuffix(document.documentElement.dataset.theme ?? DEFAULT_THEME));
    const f = (e: Event) => setHv((e as CustomEvent<Theme>).detail.hero ?? '');
    window.addEventListener('bakery-theme', f);
    return () => window.removeEventListener('bakery-theme', f);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-hero-in]', { y: 26, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.09, delay: 0.1 });
      gsap.to(media.current, {
        yPercent: 12,
        scale: 1.04,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="top" className="relative overflow-hidden bg-choc-deep text-cream">
      <div ref={media} className="absolute inset-0 origin-top">
        <div className="h-full w-full md:hidden">
          <LoopVideo key={`m${hv}`} src={`media/hero/hero-9x16${hv}.mp4`} poster={`media/hero/hero-9x16${hv}-poster.webp`} media="(max-width: 767px)" position="50% 100%" />
        </div>
        <div className="hidden h-full w-full md:block">
          <LoopVideo key={`d${hv}`} src={`media/hero/hero-16x9${hv}.mp4`} poster={`media/hero/hero-16x9${hv}-poster.webp`} media="(min-width: 768px)" position="70% 50%" />
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 md:hidden"
        style={{ background: 'linear-gradient(180deg, rgb(var(--choc-deep) / .92) 0%, rgb(var(--choc-deep) / .6) 48%, rgb(var(--choc-deep) / 0) 66%)' }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{ background: 'linear-gradient(90deg, rgb(var(--choc-deep) / .94) 0%, rgb(var(--choc-deep) / .72) 34%, rgb(var(--choc-deep) / 0) 62%), linear-gradient(0deg, rgb(var(--choc-deep) / .7) 0%, rgb(var(--choc-deep) / 0) 26%)' }}
      />

      <div className="gutter relative mx-auto flex min-h-[min(94svh,860px)] max-w-site flex-col pb-8 pt-10 md:min-h-[min(88svh,820px)] md:justify-center md:pt-16">
        <div className="relative z-10 max-w-[36rem]">
          <p data-hero-in className="eyebrow text-caramel-light">Cakes · Puffs · Pastries · Drinks</p>
          <h1 data-hero-in className="mt-4 font-display text-[clamp(2.7rem,7.2vw,5.6rem)] font-medium leading-[0.98] tracking-[-0.02em]">
            The art of <em className="font-normal text-glow">fresh baking</em>
          </h1>
          <p data-hero-in className="mt-6 max-w-[32rem] text-[1.02rem] leading-relaxed text-cream/80">
            Celebration cakes, savoury puffs and pastries, and chilled drinks from {business.name}. Browse the menu, design a custom cake, and
            send your order to the bakery on WhatsApp.
          </p>
          <div data-hero-in className="mt-8 flex flex-wrap gap-3">
            <a href="#menu" className="btn-primary">
              Explore menu
            </a>
            {whatsappEnabled() ? (
              <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className="btn-ghost-dark bg-choc-deep/40 backdrop-blur-sm">
                <WaIcon /> Order on WhatsApp
              </a>
            ) : (
              <button className="btn-ghost-dark bg-choc-deep/40 backdrop-blur-sm" disabled title="Available once the WhatsApp number is added">
                <WaIcon /> Order on WhatsApp
              </button>
            )}
          </div>
          {!whatsappEnabled() && (
            <p data-hero-in className="mt-3 hidden text-xs text-cream/55 md:block">
              WhatsApp ordering switches on once the bakery&rsquo;s number is added.
            </p>
          )}
        </div>

        <ul className="relative mt-auto hidden grid-cols-4 gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/10 md:mt-16 md:grid">
          {[
            ['Signature cakes', '#cakes'],
            ['Puffs & pastries', '#bakes'],
            ['Drinks', '#drinks'],
            ['Custom cakes', '#studio'],
          ].map(([label, href]) => (
            <li key={href} className="bg-choc-deep/70 backdrop-blur-sm">
              <a href={href} className="flex items-center justify-between px-4 py-4 text-sm text-cream/85 transition hover:bg-cream/5 hover:text-cream">
                {label}
                <span aria-hidden className="text-caramel-light">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function WaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
    </svg>
  );
}
