'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { business, whatsappEnabled } from '@/config/business';
import { products } from '@/data/menu';
import { buildOrderMessage, useOrder, whatsappUrl } from '@/lib/order';
import { FROSTINGS, SPONGES } from '@/lib/cake';
import { BagIcon } from './Header';
import { WaIcon } from './Hero';

export function OrderTray() {
  const { lines, open, setOpen, setQty, customer, setCustomer, count } = useOrder();
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');
  const message = useMemo(() => buildOrderMessage(lines, customer), [lines, customer]);

  useEffect(() => {
    if (!open) return;
    const f = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', f);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', f);
      document.body.style.overflow = '';
    };
  }, [open, setOpen]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
    window.setTimeout(() => setCopied('idle'), 2000);
  };

  const set = (k: keyof typeof customer, v: string) => setCustomer({ ...customer, [k]: v });

  return (
    <>
      {/* Floating order button on small screens */}
      {count > 0 && !open && (
        <button
          onClick={() => setOpen(true)}
          className="btn-primary fixed z-30 shadow-lg shadow-berry/30 md:hidden"
          style={{ right: 'calc(16px + env(safe-area-inset-right, 0px))', bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
        >
          <BagIcon /> Order · {count}
        </button>
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-choc-deep/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Your order"
              className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-cream shadow-2xl"
              style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            >
              <div className="flex items-center justify-between border-b border-choc/10 px-5 py-4">
                <h2 className="font-display text-2xl text-choc">Your order</h2>
                <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-choc/15 text-choc" aria-label="Close order">
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {lines.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-choc/25 p-6 text-center">
                    <p className="font-display text-xl text-choc">Nothing added yet</p>
                    <p className="mt-2 text-sm text-choc/60">Add cakes, puffs or drinks from the menu, or design a custom cake.</p>
                    <a href="#menu" onClick={() => setOpen(false)} className="btn-ghost mt-4">
                      Browse the menu
                    </a>
                  </div>
                ) : (
                  <ul className="grid gap-3">
                    {lines.map((l) => {
                      const title =
                        l.kind === 'product' ? products.find((p) => p.id === l.productId)?.name : 'Custom cake';
                      const sub =
                        l.kind === 'product'
                          ? l.variant ?? 'Price to be confirmed'
                          : `${l.config.size} · ${SPONGES[l.config.sponge].label} · ${FROSTINGS[l.config.frosting].label}`;
                      return (
                        <li key={l.key} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-choc">{title}</p>
                            <p className="truncate text-xs text-choc/55">{sub}</p>
                          </div>
                          <div className="flex items-center gap-1 rounded-full border border-choc/15 p-0.5">
                            <button className="grid h-7 w-7 place-items-center rounded-full text-choc hover:bg-choc/5" onClick={() => setQty(l.key, l.qty - 1)} aria-label={`Decrease ${title}`}>
                              −
                            </button>
                            <span className="w-5 text-center text-sm tabular-nums">{l.qty}</span>
                            <button className="grid h-7 w-7 place-items-center rounded-full text-choc hover:bg-choc/5" onClick={() => setQty(l.key, l.qty + 1)} aria-label={`Increase ${title}`}>
                              +
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {lines.length > 0 && (
                  <div className="mt-6 grid gap-3">
                    <p className="eyebrow text-choc/55">Your details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input id="order-name" className="field" placeholder="Name" aria-label="Name" value={customer.name} onChange={(e) => set('name', e.target.value)} />
                      <input id="order-phone" className="field" placeholder="Phone" aria-label="Phone" inputMode="tel" value={customer.phone} onChange={(e) => set('phone', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex rounded-xl border border-choc/20 bg-white/70 p-1" role="radiogroup" aria-label="Pickup or delivery">
                        {(['Pickup', 'Delivery'] as const).map((f) => (
                          <button key={f} role="radio" aria-checked={customer.fulfilment === f} onClick={() => set('fulfilment', f)} className={`flex-1 rounded-lg py-1.5 text-xs font-medium ${customer.fulfilment === f ? 'bg-choc text-cream' : 'text-choc/70'}`}>
                            {f}
                          </button>
                        ))}
                      </div>
                      <input id="order-date" type="date" className="field" aria-label="Date" value={customer.date} onChange={(e) => set('date', e.target.value)} />
                    </div>
                    <textarea id="order-notes" className="field min-h-[70px]" placeholder="Notes (allergies, timing, address area)" value={customer.notes} onChange={(e) => set('notes', e.target.value)} />

                    <details className="rounded-xl bg-white/60 p-3 text-xs text-choc/70">
                      <summary className="cursor-pointer font-medium text-choc">Preview WhatsApp message</summary>
                      <pre className="mt-2 whitespace-pre-wrap font-sans leading-relaxed">{message}</pre>
                    </details>
                  </div>
                )}
              </div>

              {lines.length > 0 && (
                <div className="grid gap-2 border-t border-choc/10 px-5 py-4">
                  {whatsappEnabled() ? (
                    <a className="btn-primary" href={whatsappUrl(business.whatsapp!, message)} target="_blank" rel="noopener">
                      <WaIcon /> Send order on WhatsApp
                    </a>
                  ) : (
                    <button className="btn-primary" disabled>
                      <WaIcon /> Send on WhatsApp (not set up yet)
                    </button>
                  )}
                  <button className="btn-ghost" onClick={copy}>
                    {copied === 'ok' ? 'Copied' : copied === 'fail' ? 'Copy blocked, use the preview above' : 'Copy order text'}
                  </button>
                  <p className="text-center text-[11px] text-choc/50">The bakery confirms availability, price and timing before your order is final.</p>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
