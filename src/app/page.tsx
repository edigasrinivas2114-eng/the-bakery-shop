'use client';

import { OrderProvider } from '@/lib/order';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Collections, ProductSection } from '@/components/Menu';
import { Studio } from '@/components/Studio';
import { Assembly } from '@/components/Assembly';
import { FinalCta, Footer, Story, Visit } from '@/components/Sections';
import { OrderTray } from '@/components/OrderTray';
import { Reveals } from '@/components/Reveals';

export default function Home() {
  return (
    <OrderProvider>
      <Header />
      <main>
        <Hero />
        <Collections />
        <ProductSection
          id="cakes"
          category="cakes"
          eyebrow="Signature cakes"
          title={
            <>
              Cakes worth <em className="text-caramel">gathering for</em>
            </>
          }
          body="Pick a size and add it to your order. For a different flavour, tier or message, use the custom cake studio below."
        />
        <Assembly />
        <ProductSection
          id="bakes"
          category="bakes"
          variant="cream2"
          banner={{ video: 'media/bakes/croissant-banner.mp4', poster: 'media/bakes/croissant-banner-poster.webp' }}
          eyebrow="Freshly baked"
          title={
            <>
              Puffs, pastries <em className="text-caramel">and savouries</em>
            </>
          }
          body="Flaky puffs and laminated pastries for tea time, office orders and quick bites."
        />
        <ProductSection
          id="drinks"
          category="drinks"
          variant="dark"
          eyebrow="Drinks & refreshments"
          title={
            <>
              Something cold <em className="text-glow">on the side</em>
            </>
          }
          body="Shakes, coffee and coolers to round out your order."
        />
        <Story />
        <Studio />
        <Visit />
        <FinalCta />
      </main>
      <Footer />
      <OrderTray />
      <Reveals />
    </OrderProvider>
  );
}
