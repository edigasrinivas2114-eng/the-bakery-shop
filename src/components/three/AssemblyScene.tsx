'use client';

/**
 * Scroll-driven layer assembly with four looks (variant prop):
 *  classic – cream stage, layers drop and stack, slow turn.
 *  dark    – chocolate stage, warm rim lights, low camera.
 *  orbit   – camera circles the cake while it stacks; ganache drips down the sides at the end.
 *  split   – after stacking, the cake splits in half to show the layers inside.
 * Progress 0 = exploded, 1 = finished.
 */
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { Suspense, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import * as THREE from 'three';
import { Shard, Strawberry } from './Cake';

export type AssemblyVariant = 'classic' | 'dark' | 'orbit' | 'split';

const R = 1;
const SPONGE_H = 0.3;
const CREAM_H = 0.09;
const TOP_H = 0.06;

type Layer = { kind: 'sponge' | 'cream' | 'top'; h: number; y: number };

const layers: Layer[] = (() => {
  const kinds: Layer['kind'][] = ['sponge', 'cream', 'sponge', 'cream', 'sponge', 'top'];
  let y = 0;
  return kinds.map((k) => {
    const h = k === 'sponge' ? SPONGE_H : k === 'cream' ? CREAM_H : TOP_H;
    const l = { kind: k, h, y };
    y += h;
    return l;
  });
})();
const TOTAL_H = layers[layers.length - 1].y + TOP_H;

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

type SpongeTex = { map: THREE.CanvasTexture; bump: THREE.CanvasTexture };

/** Chocolate sponge crumb: open pores with soft rims, fine grain. Square tile, repeated without stretching. */
function useSpongeTexture(): SpongeTex | null {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const N = 512;
    const mk = () => {
      const c = document.createElement('canvas');
      c.width = c.height = N;
      return [c, c.getContext('2d')!] as const;
    };
    const [c, g] = mk();
    const [cb, gb] = mk();
    let s = 11;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#5B321F';
    g.fillRect(0, 0, N, N);
    gb.fillStyle = '#9a9a9a';
    gb.fillRect(0, 0, N, N);
    // soft blotches for uneven bake colour
    for (let i = 0; i < 60; i++) {
      const x = r() * N, y = r() * N, rad = 20 + r() * 50;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const l = r() > 0.5;
      gr.addColorStop(0, l ? 'rgba(122,74,48,.35)' : 'rgba(52,26,14,.35)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // pores: dark holes with a lighter crumb rim (drawn with wrap so the tile repeats seamlessly)
    for (let i = 0; i < 5200; i++) {
      const x = r() * N, y = r() * N;
      const rx = 0.8 + Math.pow(r(), 2.2) * 5.5, ry = rx * (0.6 + r() * 0.6), rot = r() * Math.PI;
      for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
        const px = x + ox, py = y + oy;
        if (px < -10 || px > N + 10 || py < -10 || py > N + 10) continue;
        g.fillStyle = 'rgba(160,108,74,.38)';
        g.beginPath(); g.ellipse(px + 0.8, py + 0.8, rx * 1.35, ry * 1.35, rot, 0, 7); g.fill();
        g.fillStyle = `rgba(22,9,4,${0.6 + r() * 0.35})`;
        g.beginPath(); g.ellipse(px, py, rx, ry, rot, 0, 7); g.fill();
        gb.fillStyle = 'rgba(230,230,230,.5)';
        gb.beginPath(); gb.ellipse(px + 0.8, py + 0.8, rx * 1.35, ry * 1.35, rot, 0, 7); gb.fill();
        gb.fillStyle = 'rgba(0,0,0,.85)';
        gb.beginPath(); gb.ellipse(px, py, rx, ry, rot, 0, 7); gb.fill();
      }
    }
    // fine grain
    const id = g.getImageData(0, 0, N, N);
    for (let i = 0; i < id.data.length; i += 4) {
      const n = (r() - 0.5) * 22;
      id.data[i] += n; id.data[i + 1] += n * 0.8; id.data[i + 2] += n * 0.6;
    }
    g.putImageData(id, 0, 0);
    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    const bump = new THREE.CanvasTexture(cb);
    for (const t of [map, bump]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8;
    }
    return { map, bump };
  }, []);
}

/** Clone a texture pair with a repeat that keeps crumbs round on a surface of the given size. */
function useTiled(t: SpongeTex | null, w: number, h: number, tile = 0.32) {
  return useMemo(() => {
    if (!t) return null;
    const m = t.map.clone(), b = t.bump.clone();
    for (const x of [m, b]) {
      x.repeat.set(w / tile, h / tile);
      x.needsUpdate = true;
    }
    return { map: m, bump: b };
  }, [t, w, h, tile]);
}

function Curls() {
  const items = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        const d = 0.1 + (i % 3) * 0.09;
        return { p: [Math.cos(a) * d, 0.05 + (i % 2) * 0.03, Math.sin(a) * d] as THREE.Vector3Tuple, rot: [Math.PI / 2, a, 0.4 * (i % 3)] as THREE.Vector3Tuple };
      }),
    [],
  );
  return (
    <group>
      {items.map((it, i) => (
        <mesh key={i} position={it.p} rotation={it.rot} castShadow>
          <torusGeometry args={[0.09, 0.032, 8, 18, Math.PI * 1.6]} />
          <meshPhysicalMaterial color="#3A1F14" roughness={0.45} clearcoat={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Rosette() {
  return (
    <group>
      <mesh position={[0, 0.035, 0]} castShadow>
        <sphereGeometry args={[0.075, 14, 10]} />
        <meshPhysicalMaterial color="#F6EBDD" roughness={0.45} sheen={0.7} sheenColor="#fff" />
      </mesh>
      <mesh position={[0, 0.11, 0]} castShadow>
        <coneGeometry args={[0.055, 0.1, 8]} />
        <meshPhysicalMaterial color="#F6EBDD" roughness={0.45} sheen={0.7} sheenColor="#fff" />
      </mesh>
    </group>
  );
}

export type CakeLook = 'classic' | 'drip' | 'berries' | 'gold';

type ToppingKind = 'rosette' | 'berry' | 'shard' | 'cherry' | 'blueberry' | 'mint' | 'curl' | 'gold' | 'truffle';
type ToppingItem = { kind: ToppingKind; pos: THREE.Vector3Tuple; rot: number; delay: number; seed: number; tilt?: number };

const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const ring = (kind: ToppingKind, n: number, r: number, delay0: number, step: number, y = 0, off = 0): ToppingItem[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + off;
    return { kind, pos: [Math.sin(a) * r, y, Math.cos(a) * r], rot: a, delay: delay0 + i * step, seed: i };
  });
const scatter = (kind: ToppingKind, n: number, rMax: number, delay0: number, step: number, seed0: number, y = 0): ToppingItem[] =>
  Array.from({ length: n }, (_, i) => {
    const a = rnd(seed0 + i) * Math.PI * 2, r = Math.sqrt(rnd(seed0 + i + 50)) * rMax;
    return { kind, pos: [Math.sin(a) * r, y, Math.cos(a) * r], rot: rnd(seed0 + i + 90) * 6.28, delay: delay0 + i * step, seed: seed0 + i, tilt: rnd(seed0 + i + 7) };
  });

/** Topping layouts for each cake design (dark look). */
const LOOKS: Record<CakeLook, ToppingItem[]> = {
  // rosettes, strawberries and chocolate shards
  classic: [
    ...ring('rosette', 14, 0.86, 0, 0.004),
    ...ring('berry', 6, 0.48, 0.06, 0.01, 0, 0.3),
    ...[0, 1, 2].map((i) => ({ kind: 'shard' as const, pos: [Math.sin((i / 3) * 6.28) * 0.12, 0.14, Math.cos((i / 3) * 6.28) * 0.12] as THREE.Vector3Tuple, rot: (i / 3) * 6.28, delay: 0.12 + i * 0.012, seed: i * 17 + 3 })),
  ],
  // ganache drip down the sides, rosettes each topped with a cherry
  drip: [...ring('rosette', 10, 0.78, 0.03, 0.005), ...ring('cherry', 10, 0.78, 0.08, 0.006, 0.13)],
  // a crown of fresh berries and mint
  berries: [
    ...scatter('berry', 9, 0.55, 0, 0.007, 11),
    ...scatter('blueberry', 46, 0.8, 0.03, 0.0022, 40),
    ...scatter('blueberry', 14, 0.35, 0.09, 0.003, 300, 0.07),
    ...scatter('mint', 8, 0.6, 0.12, 0.006, 90, 0.1),
  ],
  // chocolate curls, truffles and gold leaf
  gold: [
    ...ring('truffle', 16, 0.85, 0, 0.004),
    ...scatter('curl', 18, 0.55, 0.05, 0.004, 120, 0.04),
    ...scatter('curl', 8, 0.3, 0.1, 0.004, 160, 0.12),
    ...scatter('gold', 18, 0.75, 0.13, 0.003, 200, 0.2),
  ],
};

function Cherry() {
  return (
    <group>
      <mesh position={[0, 0.06, 0]} castShadow>
        <sphereGeometry args={[0.07, 20, 16]} />
        <meshPhysicalMaterial color="#5E0712" roughness={0.18} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      <mesh position={[0.02, 0.17, 0]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.006, 0.008, 0.16, 6]} />
        <meshStandardMaterial color="#4E5B1E" roughness={0.7} />
      </mesh>
    </group>
  );
}
function Blueberry({ seed }: { seed: number }) {
  const s = 0.045 + rnd(seed) * 0.015;
  return (
    <mesh position={[0, s * 0.85, 0]} scale={[1, 0.88, 1]} castShadow>
      <sphereGeometry args={[s, 16, 12]} />
      <meshPhysicalMaterial color="#2C3566" roughness={0.55} sheen={1} sheenColor="#8E9BC7" sheenRoughness={0.5} />
    </mesh>
  );
}
function Mint({ tilt = 0 }: { tilt?: number }) {
  return (
    <mesh rotation={[-1.2 + tilt * 0.4, 0, tilt]} scale={[0.07, 0.012, 0.12]} castShadow>
      <sphereGeometry args={[1, 12, 8]} />
      <meshStandardMaterial color="#3E7A2E" roughness={0.45} />
    </mesh>
  );
}
function ChocCurl({ tilt = 0 }: { tilt?: number }) {
  return (
    <mesh rotation={[Math.PI / 2 - 0.2 + tilt * 0.4, 0, tilt]} castShadow>
      <torusGeometry args={[0.1, 0.034, 10, 22, Math.PI * 1.7]} />
      <meshPhysicalMaterial color={tilt > 0.5 ? '#7A4A2E' : '#5A3220'} roughness={0.45} clearcoat={0.4} />
    </mesh>
  );
}
function GoldLeaf({ tilt = 0 }: { tilt?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2 + tilt * 0.6, tilt * 2, 0]} castShadow>
      <circleGeometry args={[0.06 + tilt * 0.05, 5]} />
      <meshStandardMaterial color="#D4A64A" metalness={1} roughness={0.25} side={THREE.DoubleSide} />
    </mesh>
  );
}
function Truffle() {
  return (
    <mesh position={[0, 0.06, 0]} castShadow>
      <sphereGeometry args={[0.07, 18, 14]} />
      <meshStandardMaterial color="#4A2A1B" roughness={0.95} />
    </mesh>
  );
}

function Topping({ it }: { it: ToppingItem }) {
  switch (it.kind) {
    case 'rosette':
      return <Rosette />;
    case 'berry':
      return (
        <group rotation={[0.25, 0, 0.15]}>
          <Strawberry scale={1.15} />
        </group>
      );
    case 'shard':
      return <Shard seed={it.seed} />;
    case 'cherry':
      return <Cherry />;
    case 'blueberry':
      return <Blueberry seed={it.seed} />;
    case 'mint':
      return <Mint tilt={it.tilt} />;
    case 'curl':
      return <ChocCurl tilt={it.tilt} />;
    case 'gold':
      return <GoldLeaf tilt={it.tilt} />;
    case 'truffle':
      return <Truffle />;
  }
}

/** One layer, built as two half cylinders so the split variant can open it. */
function LayerHalves({ l, tex, halves }: { l: Layer; tex: THREE.Texture | null; halves: MutableRefObject<(THREE.Group | null)[]> }) {
  const r = l.kind === 'cream' ? R * 0.985 : l.kind === 'top' ? R * 1.02 : R;
  const mat =
    l.kind === 'sponge' ? (
      <meshStandardMaterial map={tex ?? undefined} roughness={0.95} />
    ) : l.kind === 'cream' ? (
      <meshPhysicalMaterial color="#2F170E" roughness={0.3} clearcoat={0.7} clearcoatRoughness={0.3} />
    ) : (
      <meshPhysicalMaterial color="#3B2016" roughness={0.16} clearcoat={1} clearcoatRoughness={0.08} />
    );
  const cutMat =
    l.kind === 'sponge' ? (
      <meshStandardMaterial map={tex ?? undefined} roughness={0.95} side={THREE.DoubleSide} />
    ) : (
      <meshStandardMaterial color={l.kind === 'cream' ? '#3A1D12' : '#2A140C'} roughness={0.5} side={THREE.DoubleSide} />
    );
  return (
    <>
      {[0, 1].map((side) => (
        <group key={side} ref={(el) => (halves.current[side] = el)}>
          <mesh position={[0, l.h / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[r, r, l.h, 48, 1, false, side === 0 ? 0 : Math.PI, Math.PI]} />
            {mat}
          </mesh>
          <mesh position={[0, l.h / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[r * 2, l.h]} />
            {cutMat}
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Real sponge and cream surfaces cut from the bakery photos (lighting flattened, tile seamlessly left-right). */
const PHOTO = {
  spongeSide: { url: 'media/assembly/tex-sponge-side.jpg', aspect: 1024 / 160 },
  spongeCut: { url: 'media/assembly/tex-sponge-cut.jpg', aspect: 768 / 120 },
  creamSide: { url: 'media/assembly/tex-cream-side.jpg', aspect: 1024 / 64 },
  creamCut: { url: 'media/assembly/tex-cream-cut.jpg', aspect: 768 / 48 },
};
function usePhotoTextures() {
  const list = useLoader(THREE.TextureLoader, [PHOTO.spongeSide.url, PHOTO.spongeCut.url, PHOTO.creamSide.url, PHOTO.creamCut.url]);
  return useMemo(() => {
    for (const t of list) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    }
    return { spongeSide: list[0], spongeCut: list[1], creamSide: list[2], creamCut: list[3] };
  }, [list]);
}
/** Clone a band texture so it spans the layer height once and repeats around without stretching. */
function useBand(t: THREE.Texture, aspect: number, width: number, h: number) {
  return useMemo(() => {
    const c = t.clone();
    c.wrapS = THREE.RepeatWrapping;
    c.wrapT = THREE.ClampToEdgeWrapping;
    c.repeat.set(width / (h * aspect), 1);
    c.needsUpdate = true;
    return c;
  }, [t, aspect, width, h]);
}

const WEDGE = Math.PI / 4; // slice angle (45°)
const WEDGE_DIR: THREE.Vector3Tuple = [Math.sin(WEDGE / 2), 0, Math.cos(WEDGE / 2)];
const WEDGE_C = 0.62; // distance of the slice's centre from the cake centre (pivot for its turn)

function CutFace({ theta, r, h, children }: { theta: number; r: number; h: number; children: ReactNode }) {
  return (
    <mesh position={[Math.sin(theta) * (r / 2), h / 2, Math.cos(theta) * (r / 2)]} rotation={[0, theta - Math.PI / 2, 0]}>
      <planeGeometry args={[r, h]} />
      {children}
    </mesh>
  );
}

/** One layer as the cake body plus a 45° slice that can slide out to show the inside. */
function LayerSliced({ l, wedgeRef }: { l: Layer; wedgeRef: (g: THREE.Group | null) => void }) {
  const r = l.kind === 'cream' ? R * 0.99 : l.kind === 'top' ? R * 1.02 : R;
  const ph = usePhotoTextures();
  const isSponge = l.kind === 'sponge';
  const sideT = isSponge ? PHOTO.spongeSide : PHOTO.creamSide;
  const cutT = isSponge ? PHOTO.spongeCut : PHOTO.creamCut;
  const sideMain = useBand(isSponge ? ph.spongeSide : ph.creamSide, sideT.aspect, (Math.PI * 2 - WEDGE) * r, l.h);
  const sideWedge = useBand(isSponge ? ph.spongeSide : ph.creamSide, sideT.aspect, WEDGE * r, l.h);
  const face = useBand(isSponge ? ph.spongeCut : ph.creamCut, cutT.aspect, r, l.h);
  const ganache = { color: '#2A140C', roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.22 };
  const mat = (t: THREE.Texture, dbl = false) => {
    const side = dbl ? THREE.DoubleSide : THREE.FrontSide;
    if (l.kind === 'top') return <meshPhysicalMaterial {...ganache} side={side} />;
    return isSponge ? (
      <meshStandardMaterial map={t} bumpMap={t} bumpScale={2.2} roughness={0.95} side={side} />
    ) : (
      <meshPhysicalMaterial map={t} bumpMap={t} bumpScale={0.8} roughness={0.5} sheen={0.5} sheenColor="#F0D2B8" side={side} />
    );
  };
  const piece = (start: number, len: number, side: THREE.Texture) => (
    <>
      <mesh position={[0, l.h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, l.h, 128, 1, false, start, len]} />
        {mat(side)}
      </mesh>
      <CutFace theta={0} r={r} h={l.h}>{mat(face, true)}</CutFace>
      <CutFace theta={WEDGE} r={r} h={l.h}>{mat(face, true)}</CutFace>
    </>
  );
  return (
    <>
      <group>{piece(WEDGE, Math.PI * 2 - WEDGE, sideMain)}</group>
      <group ref={wedgeRef}>{piece(0, WEDGE, sideWedge)}</group>
    </>
  );
}

function Stack({ progress, variant, look }: { progress: MutableRefObject<number>; variant: AssemblyVariant; look: CakeLook }) {
  const toppingItems = LOOKS[look];
  const layerRefs = useRef<(THREE.Group | null)[]>([]);
  const halfRefs = useRef(layers.map(() => ({ current: [null, null] as (THREE.Group | null)[] })));
  const curlsRef = useRef<THREE.Group>(null);
  const dripRef = useRef<THREE.Group>(null);
  const toppingRefs = useRef<(THREE.Group | null)[]>([]);
  const wedgeRefs = useRef<(THREE.Group | null)[]>([]);
  const spin = useRef(0);
  const root = useRef<THREE.Group>(null);
  const tex = useSpongeTexture();
  const smooth = useRef(progress.current);
  const gap = variant === 'orbit' ? 0.42 : 0.3;
  const drips = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2;
        const s = Math.sin(i * 12.9898) * 43758.5453;
        const f = s - Math.floor(s);
        return { a, len: 0.12 + f * 0.32, w: 0.03 + f * 0.015 };
      }),
    [],
  );

  useFrame((state, dt) => {
    smooth.current = THREE.MathUtils.damp(smooth.current, progress.current, 6, dt);
    const p = smooth.current;
    // stacking happens over the first 80% of the scroll for split/orbit, the whole scroll otherwise
    const stackEnd = variant === 'classic' ? 1 : variant === 'dark' ? 0.72 : 0.78;
    const ps = clamp01(p / stackEnd);
    layers.forEach((l, i) => {
      const g = layerRefs.current[i];
      if (!g) return;
      const t = i === 0 ? 1 : ease((ps * 0.92 - (i - 1) * 0.13) / 0.32);
      g.position.y = l.y + (1 - t) * i * gap;
      g.rotation.y = (1 - t) * 0.35 * (i % 2 ? 1 : -1);
    });

    // split: halves move apart along x after stacking
    const sp = variant === 'split' ? ease(clamp01((p - 0.8) / 0.2)) * 0.55 : 0;
    halfRefs.current.forEach((h) => {
      if (h.current[0]) h.current[0].position.x = sp;
      if (h.current[1]) h.current[1].position.x = -sp;
    });
    if (curlsRef.current) curlsRef.current.position.x = sp;

    // orbit: ganache drips grow down the sides at the end
    if (dripRef.current) {
      const d = variant === 'orbit' ? ease(clamp01((p - 0.8) / 0.2)) : variant === 'dark' && look === 'drip' ? ease(clamp01((p - 0.72) / 0.16)) : 0;
      dripRef.current.visible = d > 0.01;
      dripRef.current.children.forEach((m, i) => {
        const len = drips[i].len * d + 0.0001;
        m.scale.set(1, len / 0.3, 1);
        m.position.y = TOTAL_H - len / 2;
      });
    }

    // dark: toppings drop onto the finished cake
    toppingRefs.current.forEach((g, i) => {
      if (!g) return;
      const it = toppingItems[i];
      const t = variant === 'dark' ? ease(clamp01((p - 0.74 - it.delay * 0.8) / 0.12)) : 0;
      g.visible = t > 0.01;
      g.position.y = TOTAL_H + it.pos[1] + (1 - t) * 1.4;
      g.scale.setScalar(0.4 + 0.6 * t);
      g.rotation.y = it.rot + (1 - t) * 2;
    });

    if (root.current) {
      // split: the turn is tied to scroll and settles at an angle that shows the cut faces
      if (variant === 'split') root.current.rotation.y = -0.65 + (1 - ease(clamp01(p / 0.78))) * 2.4;
      else if (variant === 'orbit') root.current.rotation.y = 0;
      else if (variant === 'dark') {
        spin.current += dt * 0.16;
        root.current.rotation.y = spin.current;
      } else root.current.rotation.y += dt * 0.08;
    }

    const cam = state.camera;
    if (variant === 'orbit') {
      const a = -0.7 + p * 2.4;
      const rad = THREE.MathUtils.lerp(5.4, 4.1, p);
      cam.position.set(Math.sin(a) * rad, THREE.MathUtils.lerp(2.8, 1.7, p), Math.cos(a) * rad);
      cam.lookAt(0, THREE.MathUtils.lerp(1.1, 0.45, p), 0);
    } else if (variant === 'dark') {
      // low, dramatic angle while stacking; rises at the end to look down on the toppings
      const s1 = clamp01(p / 0.72);
      const s2 = ease(clamp01((p - 0.72) / 0.28));
      const y = THREE.MathUtils.lerp(1.8, 1.15, s1) + s2 * 1.05;
      const z = THREE.MathUtils.lerp(7.2, 4.7, s1) + s2 * 0.5;
      cam.position.set(0, y, z);
      cam.lookAt(0, THREE.MathUtils.lerp(1.3, 0.45, s1) + s2 * 0.15, 0);
    } else if (variant === 'split') {
      cam.position.set(0, THREE.MathUtils.lerp(2.3, 1.9, p), THREE.MathUtils.lerp(6.6, 5.6, p));
      cam.lookAt(0, THREE.MathUtils.lerp(1.15, 0.45, p), 0);
    } else {
      cam.position.set(0, THREE.MathUtils.lerp(2.4, 1.9, p), THREE.MathUtils.lerp(6.4, 5.2, p));
      cam.lookAt(0, THREE.MathUtils.lerp(1.2, 0.5, p), 0);
    }
  });

  const plate = variant === 'dark' || variant === 'split' ? '#1C1A19' : '#2C2A28';

  return (
    <group ref={root}>
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <cylinderGeometry args={[1.35, 1.28, 0.06, 64]} />
        <meshPhysicalMaterial color={plate} roughness={0.55} clearcoat={0.3} />
      </mesh>
      {layers.map((l, i) => (
        <group key={i} ref={(el) => (layerRefs.current[i] = el)} position={[0, l.y, 0]}>
          {variant === 'dark' ? (
            <LayerSliced l={l} wedgeRef={(g) => (wedgeRefs.current[i] = g)} />
          ) : (
            <LayerHalves l={l} tex={tex?.map ?? null} halves={halfRefs.current[i]} />
          )}
          {l.kind === 'top' && variant !== 'dark' && (
            <group ref={curlsRef} position={[0, l.h, 0]}>
              <Curls />
            </group>
          )}
        </group>
      ))}
      {variant === 'dark' &&
        toppingItems.map((it, i) => (
          <group key={`${look}${i}`} ref={(el) => (toppingRefs.current[i] = el)} position={[it.pos[0], TOTAL_H, it.pos[2]]} visible={false}>
            <Topping it={it} />
          </group>
        ))}
      <group ref={dripRef} visible={false}>
        {drips.map((d, i) => (
          <mesh key={i} position={[Math.sin(d.a) * (R * 1.025), TOTAL_H, Math.cos(d.a) * (R * 1.025)]}>
            <capsuleGeometry args={[d.w, 0.3, 4, 10]} />
            <meshPhysicalMaterial color="#3B2016" roughness={0.16} clearcoat={1} clearcoatRoughness={0.08} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function AssemblyScene({ progress, variant = 'classic', look = 'classic' }: { progress: MutableRefObject<number>; variant?: AssemblyVariant; look?: CakeLook }) {
  const dark = variant === 'dark' || variant === 'split';
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 2.3, 5.6], fov: 34 }} gl={{ antialias: true, alpha: true }} aria-hidden>
      <Suspense fallback={null}>
        <ambientLight intensity={dark ? 0.35 : 0.5} />
        <hemisphereLight args={['#FFF3E6', dark ? '#2A1812' : '#6B4A3C', dark ? 0.6 : 0.8]} />
        <directionalLight position={[3, 6, 4]} intensity={2.2} color="#FFE8D0" castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 2, -2]} intensity={dark ? 2.2 : 1} color={dark ? '#E9A36A' : '#FFD2A8'} />
        {dark && <directionalLight position={[4, 1.5, -4]} intensity={1.3} color="#D7263D" />}
        <Environment resolution={128}>
          <Lightformer intensity={2} position={[0, 4, 3]} scale={[6, 2, 1]} color="#FFF1E2" />
          <Lightformer intensity={1} position={[-4, 1, 2]} scale={[2, 4, 1]} color="#FFD3A8" />
        </Environment>
        <Stack progress={progress} variant={variant} look={look} />
        <ContactShadows position={[0, -0.06, 0]} opacity={dark ? 0.6 : 0.35} scale={6} blur={2.4} far={2} color={dark ? '#000000' : '#4B2E24'} />
      </Suspense>
    </Canvas>
  );
}
