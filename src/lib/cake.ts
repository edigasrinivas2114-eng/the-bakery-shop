/**
 * Custom cake configuration. This object drives the 3D model, the summary card,
 * and the JSON attached to the WhatsApp enquiry. Option lists are demo values
 * until the bakery confirms what it offers.
 */
export type CakeSize = '0.5 kg' | '1 kg' | '1.5 kg' | '2 kg';
export type Topping = 'strawberries' | 'shards' | 'rosettes' | 'sprinkles' | 'pistachio' | 'cherries' | 'velvetCrumb';
export type Drip = 'none' | 'chocolate' | 'caramel' | 'white';
export type EggPref = 'Eggless' | 'With egg' | 'No preference';

export type CakeConfig = {
  size: CakeSize;
  tiers: 1 | 2;
  sponge: keyof typeof SPONGES;
  frosting: keyof typeof FROSTINGS;
  drip: Drip;
  toppings: Topping[];
  message: string;
  eggPreference: EggPref;
  date: string;
};

export const SIZES: CakeSize[] = ['0.5 kg', '1 kg', '1.5 kg', '2 kg'];

export const SPONGES = {
  chocolate: { label: 'Chocolate', sponge: '#5A3324', filling: '#8A5A44' },
  vanilla: { label: 'Vanilla', sponge: '#E9C98F', filling: '#FFF6EA' },
  redVelvet: { label: 'Red velvet', sponge: '#9E2A2B', filling: '#FBF1E6' },
  butterscotch: { label: 'Butterscotch', sponge: '#D9A75F', filling: '#F2CF8E' },
  pistachio: { label: 'Pistachio', sponge: '#B9B66A', filling: '#EFF0D5' },
} as const;

export const FROSTINGS = {
  ganache: { label: 'Chocolate ganache', color: '#4A2A1E' },
  ivory: { label: 'Ivory cream', color: '#FBF1E2' },
  blush: { label: 'Blush pink', color: '#F2B8BE' },
  caramel: { label: 'Caramel', color: '#D39A63' },
  pistachio: { label: 'Pistachio', color: '#C6CF97' },
} as const;

export const DRIPS: Record<Drip, { label: string; color: string | null }> = {
  none: { label: 'No drip', color: null },
  chocolate: { label: 'Chocolate', color: '#3A2016' },
  caramel: { label: 'Caramel', color: '#B8742F' },
  white: { label: 'White choc', color: '#F6EBDD' },
};

export const TOPPINGS: { id: Topping; label: string }[] = [
  { id: 'strawberries', label: 'Strawberries' },
  { id: 'shards', label: 'Chocolate shards' },
  { id: 'rosettes', label: 'Piped rosettes' },
  { id: 'sprinkles', label: 'Sprinkles' },
  { id: 'pistachio', label: 'Pistachio crumb' },
];

export const defaultCake: CakeConfig = {
  size: '1 kg',
  tiers: 1,
  sponge: 'chocolate',
  frosting: 'blush',
  drip: 'none',
  toppings: ['strawberries', 'rosettes'],
  message: '',
  eggPreference: 'No preference',
  date: '',
};

export const heroCake: CakeConfig = {
  ...defaultCake,
  sponge: 'chocolate',
  frosting: 'ganache',
  drip: 'chocolate',
  toppings: ['strawberries', 'shards', 'rosettes'],
};

/** Two tiers only make sense from 1.5 kg up. */
export const normaliseCake = (c: CakeConfig): CakeConfig => {
  if (c.tiers === 2 && (c.size === '0.5 kg' || c.size === '1 kg')) return { ...c, size: '1.5 kg' };
  return c;
};

export const cakeSummaryLines = (c: CakeConfig) => [
  `Size: ${c.size}, ${c.tiers === 2 ? 'two tiers' : 'single tier'}`,
  `Sponge: ${SPONGES[c.sponge].label}`,
  `Frosting: ${FROSTINGS[c.frosting].label}`,
  `Drip: ${DRIPS[c.drip].label}`,
  `Toppings: ${c.toppings.length ? c.toppings.map((t) => TOPPINGS.find((x) => x.id === t)?.label ?? t).join(', ') : 'None'}`,
  `Egg preference: ${c.eggPreference}`,
  `Message on cake: ${c.message.trim() || 'None'}`,
  `Requested date: ${c.date || 'Not set'}`,
];

/** The four signature cakes as 3D models for the hero carousel (keys match menu product ids). */
export const signatureCakes3D: Record<string, CakeConfig> = {
  'chocolate-truffle': { ...defaultCake, sponge: 'chocolate', frosting: 'ganache', drip: 'chocolate', toppings: ['shards', 'rosettes'] },
  'red-velvet': { ...defaultCake, sponge: 'redVelvet', frosting: 'ivory', drip: 'none', toppings: ['velvetCrumb'] },
  'black-forest': { ...defaultCake, sponge: 'chocolate', frosting: 'ivory', drip: 'none', toppings: ['rosettes', 'cherries', 'shards'] },
  'strawberry-cream': { ...defaultCake, sponge: 'vanilla', frosting: 'ivory', drip: 'none', toppings: ['strawberries', 'rosettes'] },
};
