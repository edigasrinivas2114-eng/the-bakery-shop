'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { business } from '@/config/business';
import { products } from '@/data/menu';
import { cakeSummaryLines, type CakeConfig } from '@/lib/cake';

export type OrderLine =
  | { key: string; kind: 'product'; productId: string; variant: string | null; qty: number }
  | { key: string; kind: 'custom-cake'; config: CakeConfig; qty: number };

export type Customer = {
  name: string;
  phone: string;
  fulfilment: 'Pickup' | 'Delivery';
  date: string;
  notes: string;
};

type OrderCtx = {
  lines: OrderLine[];
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  addProduct: (productId: string, variant: string | null) => void;
  addCustomCake: (config: CakeConfig) => void;
  setQty: (key: string, qty: number) => void;
  customer: Customer;
  setCustomer: (c: Customer) => void;
};

const Ctx = createContext<OrderCtx | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '', fulfilment: 'Pickup', date: '', notes: '' });

  const addProduct = useCallback((productId: string, variant: string | null) => {
    const key = `${productId}::${variant ?? ''}`;
    setLines((ls) => {
      const hit = ls.find((l) => l.key === key);
      if (hit) return ls.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      return [...ls, { key, kind: 'product', productId, variant, qty: 1 }];
    });
  }, []);

  const addCustomCake = useCallback((config: CakeConfig) => {
    setLines((ls) => [...ls, { key: `cake-${Date.now()}`, kind: 'custom-cake', config, qty: 1 }]);
    setOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((ls) => (qty <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty } : l))));
  }, []);

  const value = useMemo(
    () => ({ lines, count: lines.reduce((n, l) => n + l.qty, 0), open, setOpen, addProduct, addCustomCake, setQty, customer, setCustomer }),
    [lines, open, addProduct, addCustomCake, setQty, customer],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useOrder = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useOrder must be used inside OrderProvider');
  return v;
};

/** Plain-text order for WhatsApp. Spec: name, items, variants, qty, customisation, date, contact. */
export function buildOrderMessage(lines: OrderLine[], c: Customer) {
  const out: string[] = [`Hello ${business.name}, I'd like to place an order enquiry.`, ''];
  lines.forEach((l, i) => {
    if (l.kind === 'product') {
      const prod = products.find((x) => x.id === l.productId);
      out.push(`${i + 1}. ${prod?.name ?? l.productId}${l.variant ? ` (${l.variant})` : ''} x ${l.qty}`);
    } else {
      out.push(`${i + 1}. Custom cake x ${l.qty}`);
      cakeSummaryLines(l.config).forEach((s) => out.push(`   - ${s}`));
    }
  });
  out.push('');
  out.push(`Name: ${c.name || '-'}`);
  out.push(`Phone: ${c.phone || '-'}`);
  out.push(`${c.fulfilment} date: ${c.date || '-'}`);
  if (c.notes.trim()) out.push(`Notes: ${c.notes.trim()}`);
  out.push('');
  out.push('Please confirm availability, price and timing.');
  return out.join('\n');
}

export const whatsappUrl = (number: string, text: string) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
