import { business } from '@/config/business';
import { EMBLEM_PATH, EMBLEM_VIEWBOX } from './emblemPath';

/** Approved emblem: two-tier cake with a wheat sprig (traced to SVG; source in public/brand/). */
export function Emblem({ className = 'h-9 w-[30px]' }: { className?: string }) {
  return (
    <svg viewBox={EMBLEM_VIEWBOX} className={className} aria-hidden fill="currentColor">
      <path fillRule="evenodd" d={EMBLEM_PATH} />
    </svg>
  );
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`flex items-center gap-2.5 ${dark ? 'text-cream' : 'text-choc'}`}>
      <Emblem />
      <span className="flex flex-col leading-none">
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] opacity-70">The</span>
        <span className="font-display text-[1.3rem] font-semibold tracking-tight">{business.name.replace(/^The\s+/, '')}</span>
      </span>
    </span>
  );
}

/** FSSAI-style veg / non-veg marker. Shows "to confirm" until the bakery verifies the item. */
export function DietMark({ diet }: { diet: 'veg' | 'non-veg' | 'egg' | null }) {
  if (!diet)
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-choc/55">
        <span className="grid h-3.5 w-3.5 place-items-center rounded-[3px] border border-dashed border-choc/40" />
        Veg / non-veg to confirm
      </span>
    );
  const color = diet === 'veg' ? '#2E8B3D' : diet === 'egg' ? '#C9871A' : '#8B3A1E';
  const label = diet === 'veg' ? 'Vegetarian' : diet === 'egg' ? 'Contains egg' : 'Non-vegetarian';
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color }}>
      <span className="grid h-3.5 w-3.5 place-items-center rounded-[3px] border-[1.5px]" style={{ borderColor: color }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      </span>
      {label}
    </span>
  );
}
