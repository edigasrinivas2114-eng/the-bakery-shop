'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { business } from '@/config/business';
import type { AssemblyVariant, CakeLook } from './three/AssemblyScene';

const AssemblyScene = dynamic(() => import('./three/AssemblyScene').then((m) => m.AssemblyScene), { ssr: false });

type Stage = { t: string; d: string };

const baseStages: Stage[] = [
  { t: 'Sponge', d: 'Three chocolate sponges, baked and cooled before layering.' },
  { t: 'Chocolate cream', d: 'A layer of chocolate cream between each sponge.' },
  { t: 'Ganache finish', d: 'A glossy chocolate ganache poured over the top.' },
];

/** Cake designs to compare (topping set + finish). Only the last step's text changes. */
const looks: { id: CakeLook; label: string; finish: Stage }[] = [
  { id: 'classic', label: 'Rosettes & berries', finish: { t: 'Toppings', d: 'Piped cream rosettes, fresh strawberries and chocolate shards to finish.' } },
  { id: 'drip', label: 'Ganache drip', finish: { t: 'Drip & cherries', d: 'Ganache drips down the sides, with cream rosettes and glossy cherries.' } },
  { id: 'berries', label: 'Berry crown', finish: { t: 'Berry crown', d: 'Fresh strawberries, blueberries and mint piled on top.' } },
  { id: 'gold', label: 'Curls & gold', finish: { t: 'Curls & gold', d: 'Chocolate truffles, chocolate curls and flakes of gold leaf.' } },
];

const designs: { id: AssemblyVariant; label: string; stages: Stage[] }[] = [
  { id: 'classic', label: 'Classic', stages: baseStages },
  {
    id: 'dark',
    label: 'Dark stage',
    stages: [
      ...baseStages,
      { t: 'Toppings', d: 'Piped cream rosettes, fresh strawberries and chocolate shards to finish.' },
    ],
  },
  {
    id: 'orbit',
    label: 'Orbit + drip',
    stages: [baseStages[0], baseStages[1], { t: 'Ganache drip', d: 'Glossy ganache poured over the top so it drips down the sides.' }],
  },
  {
    id: 'split',
    label: 'Split reveal',
    stages: [...baseStages, { t: 'Look inside', d: 'Cut through the middle: three sponges, two creams, one ganache top.' }],
  },
];

/** Pinned section: scrolling builds the cake. Four looks; the switcher shows while the site is in demo mode. */
export function Assembly() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [stage, setStage] = useState(0);
  const [mounted, setMounted] = useState(false);
  // Design 2 (Dark stage) chosen; other looks are kept in the code but not shown.
  const [design] = useState(1);
  const [look, setLook] = useState(0);
  const base = designs[design];
  const d = base.id === 'dark' ? { ...base, stages: [...base.stages.slice(0, -1), looks[look].finish] } : base;
  const n = d.stages.length;
  const nRef = useRef(n);
  nRef.current = n;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), { rootMargin: '600px' });
    io.observe(el);

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 64px', // below the sticky header
        end: '+=160%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
          setStage(Math.min(nRef.current - 1, Math.floor(self.progress * nRef.current * 0.999)));
        },
      });
    });
    mm.add('(prefers-reduced-motion: reduce)', () => {
      progress.current = 1;
      setStage(nRef.current - 1);
    });
    return () => {
      io.disconnect();
      mm.revert();
    };
  }, []);

  const dark = d.id === 'dark' || d.id === 'split';
  const bg = d.id === 'dark' ? 'bg-choc-deep' : d.id === 'split' ? 'bg-[#2E1B14]' : d.id === 'orbit' ? 'bg-cream' : 'bg-cream-2';
  const ink = dark ? 'text-cream' : 'text-choc';
  const accent = dark ? 'text-caramel-light' : 'text-caramel';
  const em = dark ? 'text-glow' : 'text-caramel';

  const switcher = false && (
    <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 flex-wrap justify-center gap-1 rounded-full border border-choc/15 bg-white/85 p-1 shadow-sm backdrop-blur" role="tablist" aria-label="Section design">
      {designs.map((x, i) => (
        <button
          key={x.id}
          type="button"
          role="tab"
          aria-selected={i === design}
          onClick={() => undefined}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${i === design ? 'bg-choc text-cream' : 'text-choc/75 hover:bg-choc/5'}`}
        >
          {i + 1} · {x.label}
        </button>
      ))}
    </div>
  );

  const stageList = (horizontal: boolean) => (
    <ol className={horizontal ? 'grid gap-2 sm:grid-cols-3 sm:gap-3' : 'mt-6 grid gap-2 md:mt-8 md:gap-3'}>
      {d.stages.map((s, i) => (
        <li
          key={s.t}
          className={`rounded-2xl border px-4 py-3 transition duration-500 ${
            i === stage ? (dark ? 'border-cream/20 bg-cream/10' : 'border-choc/20 bg-white/70') : 'hidden border-transparent opacity-50 md:block'
          }`}
        >
          <p className={`font-display text-lg md:text-xl ${ink}`}>
            <span className={`mr-2 text-sm italic ${accent}`}>
              {i + 1}
              <span className="md:hidden"> / {d.stages.length}</span>
            </span>
            {s.t}
          </p>
          <p className={`text-sm leading-relaxed ${dark ? 'text-cream/70' : 'text-choc/70'} ${i === stage ? '' : 'hidden md:block'}`}>{s.d}</p>
        </li>
      ))}
    </ol>
  );

  const scene = mounted && <AssemblyScene key={d.id} progress={progress} variant={d.id} look={looks[look].id} />;

  // Cake design picker for review (demo mode only)
  const lookPicker = business.demoMode && d.id === 'dark' && (
    <div className="mt-5" role="radiogroup" aria-label="Cake design">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/50">Cake design</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {looks.map((x, i) => (
          <button
            key={x.id}
            type="button"
            role="radio"
            aria-checked={i === look}
            onClick={() => setLook(i)}
            className={`min-h-[40px] rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
              i === look ? 'border-cream bg-cream text-choc' : 'border-cream/25 text-cream/80 hover:border-cream/60'
            }`}
          >
            {i + 1} · {x.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section ref={root} aria-labelledby="assembly-title" className={`relative overflow-hidden transition-colors duration-500 ${bg}`}>
      {switcher}
      {d.id === 'dark' && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(50% 60% at 70% 55%, rgb(var(--caramel) / .35), transparent 70%)' }}
        />
      )}

      {d.id === 'orbit' ? (
        // centred layout: heading on top, wide stage, steps in a row underneath
        <div className="gutter relative mx-auto flex min-h-[calc(100svh-64px)] max-w-site flex-col justify-center gap-2 pb-6 pt-14 text-center md:pb-8">
          <p className={`eyebrow ${accent}`}>Inside a layer cake</p>
          <h2 id="assembly-title" className={`font-display text-[clamp(2rem,4.2vw,3.3rem)] leading-[1.02] tracking-[-0.015em] ${ink}`}>
            How it comes <em className={em}>together</em>
          </h2>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[820px] md:aspect-[16/8.5]">{scene}</div>
          <div className="text-left">{stageList(true)}</div>
        </div>
      ) : (
        <div
          className={`gutter relative mx-auto grid min-h-[calc(100svh-64px)] max-w-site items-center gap-4 pb-6 pt-14 md:gap-12 md:pb-10 ${
            d.id === 'split' ? 'md:grid-cols-[1.1fr_0.9fr]' : 'md:grid-cols-[0.9fr_1.1fr]'
          }`}
        >
          <div className={`min-w-0 ${d.id === 'split' ? 'md:order-2' : ''}`}>
            <p className={`eyebrow ${accent}`}>Inside a layer cake</p>
            <h2 id="assembly-title" className={`mt-3 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.02] tracking-[-0.015em] ${ink}`}>
              {d.id === 'split' ? (
                <>
                  What&rsquo;s <em className={em}>inside</em>
                </>
              ) : (
                <>
                  How it comes <em className={em}>together</em>
                </>
              )}
            </h2>
            {stageList(false)}
            {lookPicker}
            <p className={`mt-4 hidden text-xs md:block ${dark ? 'text-cream/45' : 'text-choc/45'}`}>Keep scrolling to build the cake.</p>
          </div>
          <div className={`relative aspect-[5/4] w-full max-w-full md:aspect-square ${d.id === 'split' ? 'md:order-1' : ''}`}>{scene}</div>
        </div>
      )}
    </section>
  );
}
