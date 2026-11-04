import { business, whatsappChatUrl, whatsappEnabled } from '@/config/business';
import { MediaSlot } from './MediaSlot';
import { Emblem, Wordmark } from './Brand';
import { WaIcon } from './Hero';

type Step = { t: string; d: string; slot: string; clip: string | null; tone: 'cream' | 'caramel' | 'berry'; src?: string; video?: string; poster?: string };
const steps: Step[] = [
  { t: 'Ingredients', d: 'Flour, butter, cocoa, chocolate, eggs and fruit are weighed out at the bench before anything is mixed.', slot: 'story/ingredients.mp4', clip: null, tone: 'cream', video: 'media/story/ingredients.mp4', poster: 'media/story/ingredients-poster.webp' },
  { t: 'Dough and batter', d: 'Puff pastry is laminated and folded; cake batters are mixed by the batch.', slot: 'story/dough.mp4', clip: null, tone: 'caramel', video: 'media/story/dough.mp4', poster: 'media/story/dough-poster.webp' },
  { t: 'Into the oven', d: 'Trays go in and come out golden. Sponges cool fully before they are layered.', slot: 'story/oven.mp4', clip: null, tone: 'caramel', video: 'media/story/oven.mp4', poster: 'media/story/oven-poster.webp' },
  { t: 'Finishing', d: 'Each cake is filled, coated and piped by hand, then boxed for pickup or delivery.', slot: 'story/piping.mp4', clip: null, tone: 'berry', video: 'media/story/piping.mp4', poster: 'media/story/piping-poster.webp' },
];

export function Story() {
  return (
    <section id="story" className="scroll-mt-16 bg-cream">
      <div className="gutter mx-auto max-w-site py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <div data-reveal className="md:sticky md:top-28 md:self-start">
            <p className="eyebrow text-caramel">Our story</p>
            <h2 className="mt-3 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.02] tracking-[-0.015em] text-choc">
              From the bench <em className="text-caramel">to the box</em>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-choc/70">
              How an order comes together, from the first weigh-out to the finished cake. The bakery&rsquo;s own story, team and history will
              go here once supplied.
            </p>
            {business.showAssetSlots && (
              <p className="mt-4 inline-block rounded-md border border-dashed border-choc/30 px-3 py-2 font-mono text-[11px] text-choc/60">
                Copy needed: founding story, team, values (no unverified claims)
              </p>
            )}
          </div>
          <ol className="grid gap-10">
            {steps.map((s, i) => (
              <li key={s.t} data-reveal className="grid items-center gap-5 sm:grid-cols-[1fr_1fr]">
                <div className={`overflow-hidden rounded-[1.4rem] ${i % 2 ? 'sm:order-2' : ''}`}>
                  <MediaSlot
                    label={s.t}
                    slot={s.clip ? `${s.slot} (${s.clip})` : s.slot}
                    aspect="4/3"
                    tone={s.tone}
                    monogram={String(i + 1)}
                    src={s.src}
                    video={s.video}
                    poster={s.poster}
                    alt={s.t}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm italic text-caramel">Step {i + 1}</p>
                  <h3 className="mt-1 font-display text-2xl text-choc">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-choc/70">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

const Pending = ({ children }: { children: React.ReactNode }) => <span className="italic text-choc/45">{children}</span>;

export function Visit() {
  return (
    <section id="visit" className="scroll-mt-16 bg-cream-2">
      <div className="gutter mx-auto grid max-w-site gap-10 py-20 md:grid-cols-[1fr_1.1fr] md:py-28">
        <div data-reveal className="min-w-0">
          <p className="eyebrow text-caramel">Visit us</p>
          <h2 className="mt-3 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.02] tracking-[-0.015em] text-choc">
            Come by the <em className="text-caramel">counter</em>
          </h2>
          <dl className="mt-8 grid gap-6 text-sm">
            <div>
              <dt className="eyebrow text-choc/50">Address</dt>
              <dd className="mt-1.5 text-base text-choc">{business.address ?? <Pending>Address to be added</Pending>}</dd>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <dt className="eyebrow text-choc/50">Phone</dt>
                <dd className="mt-1.5 text-base text-choc">
                  {business.phone ? (
                    <a href={`tel:${business.phone.replace(/\s/g, '')}`} className="underline decoration-choc/30 underline-offset-4 hover:decoration-choc">
                      {business.phone}
                    </a>
                  ) : (
                    <Pending>To be added</Pending>
                  )}
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-choc/50">WhatsApp</dt>
                <dd className="mt-1.5 text-base text-choc">
                  {business.whatsapp ? (
                    <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noopener noreferrer" className="underline decoration-choc/30 underline-offset-4 hover:decoration-choc">
                      {business.phone ?? `+${business.whatsapp}`}
                    </a>
                  ) : (
                    <Pending>To be added</Pending>
                  )}
                </dd>
              </div>
            </div>
            <div>
              <dt className="eyebrow text-choc/50">Opening hours</dt>
              <dd className="mt-2">
                <table className="w-full max-w-sm text-sm">
                  <tbody>
                    {business.openingHours.map((h) => (
                      <tr key={h.day} className="border-b border-choc/10 last:border-0">
                        <td className="py-1.5 text-choc/75">{h.day}</td>
                        <td className="py-1.5 text-right tabular-nums text-choc">{h.hours ?? <Pending>—</Pending>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </dd>
            </div>
          </dl>
        </div>
        <div data-reveal className="grid min-w-0 gap-4">
          <div className="overflow-hidden rounded-[1.4rem]">
            <MediaSlot label="Storefront" slot="store/storefront.webp" aspect="16/10" tone="caramel" src="media/store/storefront.webp" alt="Bakery storefront" />
          </div>
          <div className="overflow-hidden rounded-[1.4rem]">
            <MediaSlot label="Counter" slot="store/counter.webp" aspect="16/9" tone="cream" src="media/store/counter.webp" alt="Bakery display counter" />
          </div>
          {business.storePhotosAreIllustrations && (
            <p className="text-xs italic text-choc/50">Illustrative images. Photos of the real shop will replace these.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="grain relative overflow-hidden bg-choc-deep text-cream">
      <div className="absolute inset-0 opacity-90">
        <MediaSlot label="Dessert table" slot="cta/dessert-table.webp" aspect="auto" tone="cocoa" className="h-full" src="media/cta/dessert-table.webp" position="75% 50%" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-choc-deep via-choc-deep/85 to-transparent" />
      <div className="absolute inset-0 bg-choc-deep/60 md:hidden" />
      <div className="gutter relative mx-auto max-w-site py-24 md:py-32">
        <div data-reveal className="max-w-xl">
          <p className="eyebrow text-caramel-light">Ready when you are</p>
          <h2 className="mt-3 font-display text-[clamp(2.3rem,5.4vw,4.2rem)] leading-[1] tracking-[-0.015em]">
            Planning a <em className="text-glow">celebration?</em>
          </h2>
          <p className="mt-5 leading-relaxed text-cream/70">
            Put together your order or design a cake, then send it to the bakery. They confirm availability, price and timing before anything
            is baked.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#studio" className="btn-primary">
              Design a cake
            </a>
            {whatsappEnabled() ? (
              <a href={whatsappChatUrl()} target="_blank" rel="noopener noreferrer" className="btn-ghost-dark">
                <WaIcon /> Order on WhatsApp
              </a>
            ) : (
              <button className="btn-ghost-dark" disabled>
                <WaIcon /> Order on WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-choc-night text-cream/70">
      <div className="gutter mx-auto grid max-w-site gap-10 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] pt-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Wordmark dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">Cakes, puffs, pastries and drinks.</p>
          {business.nameIsPlaceholder && <p className="mt-2 text-xs text-cream/40">Brand name and logo are placeholders.</p>}
        </div>
        <nav aria-label="Footer" className="grid content-start gap-2 text-sm">
          <a href="#menu" className="hover:text-cream">Menu</a>
          <a href="#studio" className="hover:text-cream">Custom cakes</a>
          <a href="#story" className="hover:text-cream">Our story</a>
          <a href="#visit" className="hover:text-cream">Visit us</a>
        </nav>
        <div className="grid content-start gap-2 text-sm">
          {business.phone && <span>Phone: {business.phone}</span>}
          <span>Instagram: {business.instagram ?? <em className="text-cream/40">to be added</em>}</span>
          <span>Facebook: {business.facebook ?? <em className="text-cream/40">to be added</em>}</span>
          <span>Email: {business.email ?? <em className="text-cream/40">to be added</em>}</span>
        </div>
      </div>
      <div className="gutter mx-auto flex max-w-site items-center justify-between gap-4 border-t border-cream/10 py-5 text-xs text-cream/40">
        <span>© {new Date().getFullYear()} {business.name}</span>
        <span className="flex items-center gap-1.5">
          <Emblem className="h-4 w-[13px]" /> Privacy and terms pages to be added
        </span>
      </div>
    </footer>
  );
}
