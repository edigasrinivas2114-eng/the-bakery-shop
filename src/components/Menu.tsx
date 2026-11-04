'use client';

import { useState } from 'react';
import { byCategory, formatPrice, type CategoryId, type Product } from '@/data/menu';
import { business } from '@/config/business';
import { useOrder } from '@/lib/order';
import { DietMark } from './Brand';
import { MediaSlot } from './MediaSlot';

const toneFor = (p: Product) =>
  p.slug.includes('strawberry') ? 'berry' : p.slug.includes('chocolate') || p.slug.includes('black') || p.slug.includes('coffee') ? 'caramel' : p.slug.includes('mint') ? 'pista' : p.slug.includes('red') ? 'berry' : 'cream';

function ProductCard({ p, dark }: { p: Product; dark?: boolean }) {
  const { addProduct } = useOrder();
  const [variant, setVariant] = useState<string | null>(p.variants[0] ?? null);
  const [added, setAdded] = useState(false);

  const add = () => {
    addProduct(p.id, variant);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article data-reveal className="group flex min-w-0 flex-col">
      <div className="overflow-hidden rounded-[1.4rem]">
        <div className="transition duration-700 ease-out group-hover:scale-[1.03]">
          <MediaSlot label={p.name} slot={p.image.slot} aspect={p.image.aspect} tone={toneFor(p) as never} src={p.image.src} video={p.image.video} poster={p.image.poster} alt={p.name} position={p.image.position} />
        </div>
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          {dark ? (
            <span className="text-[11px] font-medium text-cream/55">Veg / non-veg to confirm</span>
          ) : (
            <DietMark diet={p.diet} />
          )}
          {p.isDemo && business.demoMode && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${dark ? 'bg-cream/10 text-cream/60' : 'bg-choc/[.06] text-choc/55'}`}>
              Demo item
            </span>
          )}
        </div>
        <h3 className={`mt-2 font-display text-[1.35rem] leading-tight ${dark ? 'text-cream' : 'text-choc'}`}>{p.name}</h3>
        <p className={`mt-1.5 text-sm leading-relaxed ${dark ? 'text-cream/65' : 'text-choc/70'}`}>{p.description}</p>

        {p.variants.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`${p.name} size`}>
            {p.variants.map((v) => (
              <button
                key={v}
                role="radio"
                aria-checked={variant === v}
                onClick={() => setVariant(v)}
                className={`chip tabular-nums ${variant === v ? 'chip-on' : 'chip-off'}`}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className={`text-[13px] italic ${dark ? 'text-cream/55' : 'text-choc/55'}`}>{formatPrice(p.price)}</span>
          <button
            onClick={add}
            className={`btn !px-4 !py-2 ${dark ? 'bg-cream text-choc hover:bg-white' : 'bg-choc text-cream hover:bg-choc-ink'}`}
            aria-label={`Add ${p.name}${variant ? `, ${variant},` : ''} to order`}
          >
            {added ? 'Added ✓' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
}

function SectionHead({ eyebrow, title, body, dark }: { eyebrow: string; title: React.ReactNode; body: string; dark?: boolean }) {
  return (
    <div data-reveal className="grid gap-4 md:grid-cols-[1.2fr_1fr] md:items-end">
      <div>
        <p className={`eyebrow ${dark ? 'text-caramel-light' : 'text-caramel'}`}>{eyebrow}</p>
        <h2 className={`mt-3 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.02] tracking-[-0.015em] ${dark ? 'text-cream' : 'text-choc'}`}>
          {title}
        </h2>
      </div>
      <p className={`max-w-md text-[0.98rem] leading-relaxed md:justify-self-end ${dark ? 'text-cream/65' : 'text-choc/70'}`}>{body}</p>
    </div>
  );
}

export function ProductSection({
  id,
  category,
  eyebrow,
  title,
  body,
  variant = 'cream',
  banner,
}: {
  banner?: { video: string; poster: string };
  id: string;
  category: CategoryId;
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  variant?: 'cream' | 'cream2' | 'dark';
}) {
  const dark = variant === 'dark';
  const bg = dark ? 'bg-choc text-cream' : variant === 'cream2' ? 'bg-cream-2' : 'bg-cream';
  return (
    <section id={id} className={`${bg} relative scroll-mt-20`}>
      <div className="gutter mx-auto max-w-site py-20 md:py-28">
        <SectionHead eyebrow={eyebrow} title={title} body={body} dark={dark} />
        {banner && (
          <div data-reveal className="mt-10 overflow-hidden rounded-[1.6rem]">
            <MediaSlot label="" slot="" aspect="21/9" video={banner.video} poster={banner.poster} />
          </div>
        )}
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {byCategory(category).map((p) => (
            <ProductCard key={p.id} p={p} dark={dark} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Collections() {
  const tiles = [
    { href: '#cakes', name: 'Signature Cakes', note: '4 cakes · 0.5 and 1 kg', slot: 'collections/cakes.webp', tone: 'caramel', video: 'media/collections/cakes-ganache.mp4', poster: 'media/collections/cakes-ganache-poster.webp' },
    { href: '#bakes', name: 'Puffs & Pastries', note: '4 items', slot: 'collections/bakes.webp', tone: 'cream', video: 'media/collections/bakes-steam.mp4', poster: 'media/collections/bakes-steam-poster.webp' },
    { href: '#drinks', name: 'Drinks', note: '4 drinks', slot: 'collections/drinks.webp', tone: 'berry', video: 'media/collections/drinks-pour.mp4', poster: 'media/collections/drinks-pour-poster.webp' },
    { href: '#studio', name: 'Custom Cakes', note: 'Design your own', slot: 'collections/custom.webp', tone: 'pista', video: 'media/collections/custom-turntable.mp4', poster: 'media/collections/custom-turntable-poster.webp' },
  ] as const satisfies readonly { href: string; name: string; note: string; slot: string; tone: string; video?: string; poster?: string; src?: string }[];
  return (
    <section id="menu" className="scroll-mt-16 bg-cream">
      <div className="gutter mx-auto max-w-site pb-6 pt-20 md:pt-28">
        <SectionHead
          eyebrow="The menu"
          title={
            <>
              Something for every <em className="text-caramel">occasion</em>
            </>
          }
          body="Pick a collection to jump straight to it. Every item can be added to one order and sent to the bakery together."
        />
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {tiles.map((t, i) => (
            <a key={t.href} href={t.href} data-reveal className={`group relative block overflow-hidden rounded-[1.4rem] ${i % 2 ? 'md:mt-10' : ''}`}>
              <div className="transition duration-700 group-hover:scale-[1.04]">
                <MediaSlot
                  label={t.name}
                  slot={t.slot}
                  aspect="3/4"
                  tone={t.tone}
                  video={('video' in t ? t.video : null) as string | null}
                  poster={('poster' in t ? t.poster : null) as string | null}
                  src={('src' in t ? t.src : null) as string | null}
                  alt=""
                />
              </div>
              <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/35 to-transparent p-4 text-white">
                <p className="font-display text-xl leading-tight md:text-2xl">{t.name}</p>
                <p className="mt-1 text-xs text-white/80">{t.note}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
