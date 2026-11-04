'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import {
  DRIPS,
  FROSTINGS,
  SIZES,
  SPONGES,
  TOPPINGS,
  cakeSummaryLines,
  defaultCake,
  normaliseCake,
  type CakeConfig,
  type Drip,
  type EggPref,
} from '@/lib/cake';
import { useOrder } from '@/lib/order';

const StudioScene = dynamic(() => import('./three/Scenes').then((m) => m.StudioScene), { ssr: false });

function Group({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <fieldset className="min-w-0 border-t border-choc/10 pt-4">
      <legend className="float-left mb-3 flex w-full items-baseline justify-between gap-3">
        <span className="eyebrow text-choc/60">{label}</span>
        {hint && <span className="text-[11px] text-choc/45">{hint}</span>}
      </legend>
      <div className="clear-left flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Swatch({ on, color, label, onClick }: { on: boolean; color: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs font-medium transition ${on ? 'border-choc bg-white text-choc shadow-sm' : 'border-choc/15 text-choc/75 hover:border-choc/40'}`}
    >
      <span className="h-6 w-6 rounded-full ring-1 ring-inset ring-black/10" style={{ background: color }} />
      {label}
    </button>
  );
}

export function Studio() {
  const [cfg, setCfg] = useState<CakeConfig>(defaultCake);
  const [visible, setVisible] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [added, setAdded] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const { addCustomCake } = useOrder();

  const set = (patch: Partial<CakeConfig>) => setCfg((c) => normaliseCake({ ...c, ...patch }));

  // Mount the WebGL scene only when the section is near the viewport.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggleTopping = (t: CakeConfig['toppings'][number]) =>
    set({ toppings: cfg.toppings.includes(t) ? cfg.toppings.filter((x) => x !== t) : [...cfg.toppings, t] });

  const minDate = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);

  return (
    <section id="studio" className="scroll-mt-16 bg-cream-2">
      <div className="gutter mx-auto max-w-site py-20 md:py-28">
        <div data-reveal className="grid gap-4 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <p className="eyebrow text-caramel">Custom cake studio</p>
            <h2 className="mt-3 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.02] tracking-[-0.015em] text-choc">
              Build your cake, <em className="text-caramel">layer by layer</em>
            </h2>
          </div>
          <p className="max-w-md leading-relaxed text-choc/70 md:justify-self-end">
            Choose size, sponge, frosting and toppings. Drag the cake to look around it. Your design is sent with the order so the bakery can
            confirm it and quote a price.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div
              ref={stageRef}
              className="relative aspect-square w-full max-w-full overflow-hidden rounded-[1.8rem] bg-[radial-gradient(70%_70%_at_50%_40%,rgb(var(--cream))_0%,rgb(var(--cream-2))_70%,rgb(var(--cream-3))_100%)]"
            >
              {visible && <StudioScene config={cfg} />}
              <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/75 px-3 py-1.5 text-[11px] font-medium text-choc/70 backdrop-blur">
                Drag to rotate · scroll or pinch to zoom
              </div>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px] text-choc/75 sm:grid-cols-2">
              {cakeSummaryLines(cfg)
                .slice(0, 6)
                .map((l) => {
                  const [k, ...v] = l.split(': ');
                  return (
                    <li key={k} className="flex min-w-0 justify-between gap-3 border-b border-choc/10 py-1">
                      <span className="text-choc/50">{k}</span>
                      <span className="truncate text-right text-choc">{v.join(': ')}</span>
                    </li>
                  );
                })}
            </ul>
          </div>

          <form
            className="grid content-start gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              addCustomCake(cfg);
              setAdded(true);
              window.setTimeout(() => setAdded(false), 1800);
            }}
          >
            <Group label="Size" hint="Demo sizes">
              {SIZES.map((s) => (
                <button type="button" key={s} onClick={() => set({ size: s, tiers: s === '0.5 kg' || s === '1 kg' ? 1 : cfg.tiers })} aria-pressed={cfg.size === s} className={`chip tabular-nums ${cfg.size === s ? 'chip-on' : 'chip-off'}`}>
                  {s}
                </button>
              ))}
            </Group>

            <Group label="Tiers" hint="Two tiers from 1.5 kg">
              {([1, 2] as const).map((t) => (
                <button type="button" key={t} onClick={() => set({ tiers: t })} aria-pressed={cfg.tiers === t} className={`chip ${cfg.tiers === t ? 'chip-on' : 'chip-off'}`}>
                  {t === 1 ? 'Single tier' : 'Two tiers'}
                </button>
              ))}
            </Group>

            <Group label="Sponge" hint="Visible in the cut slice">
              {(Object.keys(SPONGES) as (keyof typeof SPONGES)[]).map((k) => (
                <Swatch key={k} on={cfg.sponge === k} color={SPONGES[k].sponge} label={SPONGES[k].label} onClick={() => set({ sponge: k })} />
              ))}
            </Group>

            <Group label="Frosting">
              {(Object.keys(FROSTINGS) as (keyof typeof FROSTINGS)[]).map((k) => (
                <Swatch key={k} on={cfg.frosting === k} color={FROSTINGS[k].color} label={FROSTINGS[k].label} onClick={() => set({ frosting: k })} />
              ))}
            </Group>

            <Group label="Drip">
              {(Object.keys(DRIPS) as Drip[]).map((k) => (
                <Swatch key={k} on={cfg.drip === k} color={DRIPS[k].color ?? 'repeating-linear-gradient(45deg,#fff 0 3px,#eee 3px 6px)'} label={DRIPS[k].label} onClick={() => set({ drip: k })} />
              ))}
            </Group>

            <Group label="Toppings" hint="Pick any">
              {TOPPINGS.map((t) => (
                <button type="button" key={t.id} onClick={() => toggleTopping(t.id)} aria-pressed={cfg.toppings.includes(t.id)} className={`chip ${cfg.toppings.includes(t.id) ? 'chip-on' : 'chip-off'}`}>
                  {cfg.toppings.includes(t.id) ? '✓ ' : '+ '}
                  {t.label}
                </button>
              ))}
            </Group>

            <Group label="Egg preference" hint="Bakery confirms availability">
              {(['No preference', 'Eggless', 'With egg'] as EggPref[]).map((e) => (
                <button type="button" key={e} onClick={() => set({ eggPreference: e })} aria-pressed={cfg.eggPreference === e} className={`chip ${cfg.eggPreference === e ? 'chip-on' : 'chip-off'}`}>
                  {e}
                </button>
              ))}
            </Group>

            <div className="grid gap-4 border-t border-choc/10 pt-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm" htmlFor="cake-message">
                <span className="eyebrow text-choc/60">Message on cake</span>
                <input id="cake-message" className="field" maxLength={30} placeholder="Happy birthday, Asha" value={cfg.message} onChange={(e) => set({ message: e.target.value })} />
              </label>
              <label className="grid gap-1.5 text-sm" htmlFor="cake-date">
                <span className="eyebrow text-choc/60">Needed on</span>
                <input id="cake-date" type="date" className="field" min={minDate} value={cfg.date} onChange={(e) => set({ date: e.target.value })} />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button type="submit" className="btn-primary">
                {added ? 'Added to order ✓' : 'Add cake to order'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setShowJson((s) => !s)} aria-expanded={showJson}>
                {showJson ? 'Hide' : 'View'} design data
              </button>
            </div>
            <p className="text-xs leading-relaxed text-choc/55">
              Custom cakes are requests. The bakery confirms flavours, egg-free options, lead time and the final price before baking.
            </p>
            {showJson && (
              <pre className="max-h-64 overflow-auto rounded-xl bg-choc-deep p-4 text-[11px] leading-relaxed text-cream/85">{JSON.stringify(cfg, null, 2)}</pre>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
