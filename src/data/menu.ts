/**
 * Demo menu, mirrored from 02_DEMO_MENU/demo_menu.json.
 * Shape follows the data model in 05_FUNCTIONAL_REQUIREMENTS so it can move to Supabase unchanged.
 *
 * Dietary fields stay null until the bakery verifies them. The UI shows
 * "to confirm" instead of guessing veg / non-veg / eggless status.
 */
export type Diet = 'veg' | 'non-veg' | 'egg' | null;

export type Product = {
  id: string;
  slug: string;
  category: CategoryId;
  name: string;
  description: string;
  variants: string[];
  price: number | null; // INR; null = "Price to be confirmed"
  diet: Diet; // verified marker only
  eggless: boolean | null; // cakes only, verified only
  allergenNotes: string | null;
  available: boolean;
  featured: boolean;
  isDemo: boolean;
  /** Planned asset filename + aspect so the photo slot tells the team what to produce. */
  image: { src: string | null; slot: string; aspect: '4/5' | '1/1' | '3/4' | '4/3'; position?: string; video?: string; poster?: string };
};

export type CategoryId = 'cakes' | 'bakes' | 'drinks';

export const categories: { id: CategoryId; name: string; blurb: string }[] = [
  { id: 'cakes', name: 'Signature Cakes', blurb: 'Layered celebration cakes in half and one kilo sizes.' },
  { id: 'bakes', name: 'Puffs & Pastries', blurb: 'Savoury puffs and laminated pastries from the oven.' },
  { id: 'drinks', name: 'Drinks & Refreshments', blurb: 'Shakes, coffee and coolers to go with your order.' },
];

const p = (
  category: CategoryId,
  slug: string,
  name: string,
  description: string,
  variants: string[] = [],
  aspect: Product['image']['aspect'] = '4/5',
): Product => ({
  id: slug,
  slug,
  category,
  name,
  description,
  variants,
  price: null,
  diet: null,
  eggless: null,
  allergenNotes: null,
  available: true,
  featured: category === 'cakes',
  isDemo: true,
  image: { src: null, slot: `${category}/${slug}-45.webp`, aspect },
});

export const products: Product[] = [
  p('cakes', 'chocolate-truffle', 'Chocolate Truffle Cake', 'Rich chocolate cake layered with smooth chocolate cream and ganache finish.', ['0.5 kg', '1 kg'], '1/1'),
  p('cakes', 'red-velvet', 'Red Velvet Cake', 'Soft red velvet sponge with a creamy frosting finish.', ['0.5 kg', '1 kg'], '1/1'),
  p('cakes', 'black-forest', 'Black Forest Cake', 'Chocolate sponge layered with cream and cherry-inspired accents.', ['0.5 kg', '1 kg'], '1/1'),
  p('cakes', 'strawberry-cream', 'Strawberry Cream Cake', 'Light vanilla-style sponge with strawberry cream styling.', ['0.5 kg', '1 kg'], '1/1'),

  p('bakes', 'vegetable-puff', 'Vegetable Puff', 'Flaky pastry with a savoury vegetable filling.', [], '4/3'),
  p('bakes', 'egg-puff', 'Egg Puff', 'Golden puff pastry with an egg filling.', [], '4/3'),
  p('bakes', 'chicken-puff', 'Chicken Puff', 'Crisp layered pastry with a spiced chicken filling.', [], '4/3'),
  p('bakes', 'butter-croissant', 'Butter Croissant', 'Buttery, laminated pastry with a crisp golden exterior.', [], '4/3'),

  p('drinks', 'cold-coffee', 'Cold Coffee', 'Chilled coffee drink served over ice.', [], '3/4'),
  p('drinks', 'chocolate-shake', 'Chocolate Shake', 'Creamy chocolate-flavoured milkshake.', [], '3/4'),
  p('drinks', 'strawberry-shake', 'Strawberry Shake', 'Chilled strawberry-flavoured milkshake.', [], '3/4'),
  p('drinks', 'mint-mojito', 'Mint Mojito', 'Refreshing mint and citrus-style cooler.', [], '3/4'),
];

/** Approved images so far. Paths are relative so the site also works under a sub-path. */
const approved: Record<string, { src: string; position?: string; video?: string; poster?: string }> = {
  'chocolate-truffle': { src: 'media/cakes/chocolate-truffle-slice.webp', position: '62% 50%' },
  'red-velvet': { src: 'media/cakes/red-velvet-45.webp' },
  'black-forest': { src: 'media/cakes/black-forest-45.webp' },
  'strawberry-cream': { src: 'media/cakes/strawberry-cream-45.webp', position: '50% 55%' },
  'vegetable-puff': { src: 'media/bakes/vegetable-puff-ivory.webp' },
  'egg-puff': { src: 'media/bakes/egg-puff-45.webp' },
  'chicken-puff': { src: 'media/bakes/chicken-puff-45.webp' },
  'butter-croissant': { src: 'media/bakes/butter-croissant-45.webp', position: '50% 60%' },
  'cold-coffee': { src: 'media/drinks/cold-coffee-45.webp' },
  'chocolate-shake': { src: 'media/drinks/chocolate-shake-45.webp' },
  'strawberry-shake': { src: 'media/drinks/strawberry-shake-45.webp' },
  'mint-mojito': { src: 'media/drinks/mint-mojito-45.webp' },
};
for (const prod of products) {
  const a = approved[prod.slug];
  if (a) prod.image = { ...prod.image, ...a };
}

export const byCategory = (id: CategoryId) => products.filter((x) => x.category === id);

export const formatPrice = (price: number | null) =>
  price == null
    ? 'Price to be confirmed'
    : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
