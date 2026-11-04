/**
 * Business settings. Everything here is a placeholder until the bakery verifies it
 * (see 04_BUSINESS_DETAILS/PLACEHOLDERS_TO_REPLACE.txt).
 *
 * While `demoMode` is true:
 *  - a demo notice is shown site-wide
 *  - contact details render as "to be added" rather than fake values
 */
export type OpeningHours = { day: string; hours: string | null }[];

export const business = {
  name: 'The Bakery Shop',
  nameIsPlaceholder: true,
  demoMode: true,
  /** Shows small labels on media slots naming the asset file each one expects. Turn off for launch. */
  showAssetSlots: true,
  /** The Visit Us photos are generated stand-ins. Replace with real photos of the shop, then set to false. */
  storePhotosAreIllustrations: true,
  currency: 'INR',

  /** Country code + number, digits only, e.g. "919876543210". null = not configured. */
  whatsapp: '918919391717' as string | null,
  phone: '+91 89193 91717' as string | null,
  email: null as string | null,
  address: 'Chennai, Tamil Nadu' as string | null,
  cityPin: null as string | null,
  mapUrl: null as string | null,
  instagram: null as string | null,
  facebook: null as string | null,

  openingHours: [
    { day: 'Monday', hours: '9:00 am – 10:00 pm' },
    { day: 'Tuesday', hours: '9:00 am – 10:00 pm' },
    { day: 'Wednesday', hours: '9:00 am – 10:00 pm' },
    { day: 'Thursday', hours: '9:00 am – 10:00 pm' },
    { day: 'Friday', hours: '9:00 am – 10:00 pm' },
    { day: 'Saturday', hours: '9:00 am – 10:00 pm' },
    { day: 'Sunday', hours: '9:00 am – 10:00 pm' },
  ] as OpeningHours,
};

export const whatsappEnabled = () => !!business.whatsapp;

/** Chat link with a short greeting, for the general "Order on WhatsApp" buttons. */
export const whatsappChatUrl = () =>
  business.whatsapp ? `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(`Hello ${business.name}, I'd like to place an order.`)}` : '#';
