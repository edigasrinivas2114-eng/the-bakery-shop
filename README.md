# The Bakery Shop: website prototype

Next.js 15 · React 19 · TypeScript · Tailwind · React Three Fiber · GSAP · Framer Motion.
Static export (`output: 'export'`), so it deploys to Vercel or any static host.

## Run
    npm install
    npm run dev          # http://localhost:3000
    npm run build        # static site in /out

## Where things live
- `src/config/business.ts`: name, WhatsApp, phone, address, hours. `demoMode` and `showAssetSlots` flags.
  Set a WhatsApp number (digits with country code, e.g. 919876543210) and `demoMode: false` to switch ordering on.
- `src/data/menu.ts`: demo menu (mirrors demo_menu.json). Set `price`, `diet` ('veg' | 'non-veg' | 'egg'), `eggless`,
  and `image.src` per product once verified. Shape matches the Supabase data model in the brief.
- `src/lib/cake.ts`: custom cake options (sizes, sponges, frostings, drips, toppings). Demo values.
- `src/components/three/Cake.tsx`: procedural 3D cake used by the hero and the studio. No GLB files needed.
- `src/components/MediaSlot.tsx`: placeholder that names the asset file each slot expects; pass `src` or `video` to swap in real media.

## Swapping in assets
Put files in `public/media/...` and set `image.src` (products) or `src` / `video` + `poster` on the MediaSlot.
The hero currently shows the live 3D cake; replace it with Flow clip 01 (MP4 + WebM, poster) when approved.
