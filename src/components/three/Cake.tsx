'use client';

/**
 * Procedural cake. No GLB files: every part is generated from the CakeConfig,
 * so the configurator can swap sponge, frosting, drip and toppings instantly.
 * A wedge is cut out of each tier to show the sponge and filling layers.
 */
import { useMemo } from 'react';
import * as THREE from 'three';
import { DRIPS, FROSTINGS, SPONGES, type CakeConfig } from '@/lib/cake';

const GAP = 0.62; // radians removed for the slice cut-away
const BEVEL = 0.07;

// Deterministic random so toppings don't jump around between renders.
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function profile(r: number, h: number) {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(r, 0), new THREE.Vector2(r, h - BEVEL)];
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - BEVEL + Math.cos(a) * BEVEL, h - BEVEL + Math.sin(a) * BEVEL));
  }
  pts.push(new THREE.Vector2(0, h));
  return pts;
}

/** Canvas texture for the cut face: sponge / filling stripes, frosting coat on the outside and top. */
function useLayerTexture(sponge: string, filling: string, frosting: string, layers: number) {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 256;
    const g = c.getContext('2d')!;
    const coat = 0.07;
    const top = 0.09;
    const usable = 1 - top;
    // Sponge bands are 2.5x thicker than the filling between them.
    const units = layers * 2.5 + (layers - 1);
    let acc = 0;
    for (let i = 0; i < layers * 2 - 1; i++) {
      const w = (i % 2 === 0 ? 2.5 : 1) / units * usable;
      g.fillStyle = i % 2 === 0 ? sponge : filling;
      g.fillRect(0, 256 * (1 - acc - w), 128, 256 * w + 1);
      acc += w;
    }
    // crumb texture on sponge
    const r = rng(7);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.08})`;
      g.fillRect(r() * 128, r() * 256, 1.5, 1.5);
    }
    g.fillStyle = frosting;
    g.fillRect(128 * (1 - coat), 0, 128 * coat + 1, 256);
    g.fillRect(0, 0, 128, 256 * top);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [sponge, filling, frosting, layers]);
}

function CutFace({ r, h, angle, tex }: { r: number; h: number; angle: number; tex: THREE.Texture | null }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape(profile(r, h));
    const g = new THREE.ShapeGeometry(shape, 4);
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / r, pos.getY(i) / h);
    return g;
  }, [r, h]);
  return (
    <mesh geometry={geo} rotation={[0, angle - Math.PI / 2, 0]} castShadow receiveShadow>
      <meshStandardMaterial map={tex ?? undefined} roughness={0.85} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Tier({
  r,
  h,
  y,
  cfg,
  seed,
  isTop,
}: {
  r: number;
  h: number;
  y: number;
  cfg: CakeConfig;
  seed: number;
  isTop: boolean;
}) {
  const frost = FROSTINGS[cfg.frosting].color;
  const drip = DRIPS[cfg.drip].color;
  const sp = SPONGES[cfg.sponge];
  const tex = useLayerTexture(sp.sponge, sp.filling, frost, 3);
  const body = useMemo(() => new THREE.LatheGeometry(profile(r, h), 72, GAP, Math.PI * 2 - GAP), [r, h]);

  // Drip: a glossy rim plus irregular hanging drips (skipped across the cut).
  const drips = useMemo(() => {
    if (!drip) return [];
    const rand = rng(seed * 13 + 3);
    const out: { a: number; len: number; w: number }[] = [];
    const n = Math.round(r * 30);
    for (let i = 0; i < n; i++) {
      const a = GAP + 0.08 + ((Math.PI * 2 - GAP - 0.16) * i) / (n - 1);
      out.push({ a, len: h * (0.18 + rand() * 0.38), w: 0.028 + rand() * 0.018 });
    }
    return out;
  }, [drip, r, h, seed]);

  return (
    <group position={[0, y, 0]}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial color={frost} roughness={0.5} sheen={0.6} sheenColor={'#ffffff'} sheenRoughness={0.6} />
      </mesh>
      <CutFace r={r} h={h} angle={GAP} tex={tex} />
      <CutFace r={r} h={h} angle={Math.PI * 2} tex={tex} />

      {drip && (
        <group>
          <mesh position={[0, h + 0.004, 0]} rotation={[0, GAP, 0]}>
            <cylinderGeometry args={[r - BEVEL * 0.6, r - BEVEL * 0.6, 0.02, 72, 1, false, 0, Math.PI * 2 - GAP]} />
            <meshPhysicalMaterial color={drip} roughness={0.18} clearcoat={1} clearcoatRoughness={0.1} />
          </mesh>
          {drips.map((d, i) => (
            <mesh
              key={i}
              position={[Math.sin(d.a) * (r + 0.006), h - BEVEL * 0.5 - d.len / 2, Math.cos(d.a) * (r + 0.006)]}
              castShadow
            >
              <capsuleGeometry args={[d.w, d.len, 4, 10]} />
              <meshPhysicalMaterial color={drip} roughness={0.18} clearcoat={1} clearcoatRoughness={0.1} />
            </mesh>
          ))}
        </group>
      )}

      {isTop && <Toppings r={r} h={h} cfg={cfg} seed={seed} />}
      {!isTop && cfg.toppings.includes('rosettes') && <RosetteRing r={r} h={h} color={frost} count={Math.round(r * 16)} />}
    </group>
  );
}

function Rosette({ color, scale = 1 }: { color: string; scale?: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <sphereGeometry args={[0.07, 14, 10]} />
        <meshPhysicalMaterial color={color} roughness={0.45} sheen={0.7} sheenColor="#fff" />
      </mesh>
      <mesh position={[0, 0.1, 0]} castShadow>
        <coneGeometry args={[0.05, 0.09, 8]} />
        <meshPhysicalMaterial color={color} roughness={0.45} sheen={0.7} sheenColor="#fff" />
      </mesh>
    </group>
  );
}

function RosetteRing({ r, h, color, count }: { r: number; h: number; color: string; count: number }) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const a = GAP + 0.15 + ((Math.PI * 2 - GAP - 0.3) * i) / (count - 1);
    items.push(
      <group key={i} position={[Math.sin(a) * (r - 0.13), h, Math.cos(a) * (r - 0.13)]}>
        <Rosette color={lighten(color, 0.12)} />
      </group>,
    );
  }
  return <group>{items}</group>;
}

function Strawberry({ scale = 1 }: { scale?: number }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const y = t * 0.2;
      const w = Math.sin(Math.PI * Math.pow(t, 0.8)) * 0.085 * (0.55 + t * 0.6);
      pts.push(new THREE.Vector2(Math.max(w, 0.0001), y));
    }
    return new THREE.LatheGeometry(pts, 20);
  }, []);
  return (
    <group scale={scale}>
      <mesh geometry={geo} rotation={[Math.PI, 0, 0]} position={[0, 0.2, 0]} castShadow>
        <meshPhysicalMaterial color="#C8102E" roughness={0.32} clearcoat={0.8} clearcoatRoughness={0.25} />
      </mesh>
      <mesh position={[0, 0.205, 0]}>
        <coneGeometry args={[0.07, 0.03, 6]} />
        <meshStandardMaterial color="#4E7A2A" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Shard({ seed }: { seed: number }) {
  const r = rng(seed);
  return (
    <mesh rotation={[r() * 0.6 - 0.3, r() * Math.PI, 0.35 + r() * 0.4]} castShadow>
      <boxGeometry args={[0.2 + r() * 0.12, 0.28 + r() * 0.12, 0.012]} />
      <meshPhysicalMaterial color="#2C170F" roughness={0.3} clearcoat={0.6} />
    </mesh>
  );
}

function Toppings({ r, h, cfg, seed }: { r: number; h: number; cfg: CakeConfig; seed: number }) {
  const has = (t: CakeConfig['toppings'][number]) => cfg.toppings.includes(t);
  const frost = FROSTINGS[cfg.frosting].color;
  const center = (Math.PI * 2 + GAP) / 2; // middle of the uncut part, opposite the slice

  const sprinkles = useMemo(() => {
    const rand = rng(seed + 99);
    const cols = ['#D7263D', '#F4C542', '#879A45', '#FFFFFF', '#6FA8DC', '#F2B8BE'];
    return Array.from({ length: Math.round(r * 160) }, () => {
      const a = GAP + 0.05 + rand() * (Math.PI * 2 - GAP - 0.1);
      const d = Math.sqrt(rand()) * (r - 0.1);
      return { p: [Math.sin(a) * d, h + 0.012, Math.cos(a) * d] as const, rot: rand() * Math.PI, c: cols[Math.floor(rand() * cols.length)] };
    });
  }, [r, h, seed]);

  const crumbs = useMemo(() => {
    const rand = rng(seed + 41);
    return Array.from({ length: Math.round(r * 120) }, () => {
      const a = GAP + 0.05 + rand() * (Math.PI * 2 - GAP - 0.1);
      const d = (0.25 + rand() * 0.4) * r;
      return { p: [Math.sin(a) * d, h + 0.015, Math.cos(a) * d] as const, s: 0.015 + rand() * 0.02 };
    });
  }, [r, h, seed]);

  return (
    <group>
      {has('rosettes') && <RosetteRing r={r} h={h} color={frost} count={Math.round(r * 14)} />}

      {has('strawberries') &&
        [0, 1, 2, 3, 4].map((i) => {
          const a = center + (i - 2) * 0.55;
          const d = r * 0.45;
          return (
            <group key={i} position={[Math.sin(a) * d, h, Math.cos(a) * d]} rotation={[0.25, a, 0.15 * (i - 2)]}>
              <Strawberry scale={1.3} />
            </group>
          );
        })}

      {has('shards') &&
        [0, 1, 2, 3].map((i) => {
          const a = center + 0.9 + i * 0.5;
          const d = r * 0.3;
          return (
            <group key={i} position={[Math.sin(a) * d, h + 0.12, Math.cos(a) * d]}>
              <Shard seed={seed + i * 17} />
            </group>
          );
        })}

      {has('sprinkles') &&
        sprinkles.map((s, i) => (
          <mesh key={i} position={s.p as unknown as THREE.Vector3Tuple} rotation={[Math.PI / 2, 0, s.rot]}>
            <capsuleGeometry args={[0.008, 0.03, 2, 6]} />
            <meshStandardMaterial color={s.c} roughness={0.5} />
          </mesh>
        ))}

      {has('pistachio') &&
        crumbs.map((s, i) => (
          <mesh key={i} position={s.p as unknown as THREE.Vector3Tuple} scale={s.s}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={i % 3 ? '#8FA14A' : '#B5BE6A'} roughness={0.8} />
          </mesh>
        ))}

      {has('velvetCrumb') &&
        crumbs.map((s, i) => (
          <mesh key={`v${i}`} position={[s.p[0] * 0.7, s.p[1], s.p[2] * 0.7]} scale={s.s * 1.3}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={i % 3 ? '#8E1F2A' : '#B02A35'} roughness={0.9} />
          </mesh>
        ))}

      {has('cherries') &&
        Array.from({ length: Math.round(r * 9) }, (_, i) => {
          const n = Math.round(r * 9);
          const a = GAP + 0.2 + ((Math.PI * 2 - GAP - 0.4) * i) / (n - 1);
          const d = r - 0.13;
          return (
            <group key={`c${i}`} position={[Math.sin(a) * d, h + 0.17, Math.cos(a) * d]}>
              <mesh castShadow>
                <sphereGeometry args={[0.065, 18, 14]} />
                <meshPhysicalMaterial color="#5E0B15" roughness={0.15} clearcoat={1} clearcoatRoughness={0.1} />
              </mesh>
              <mesh position={[0.012, 0.09, 0]} rotation={[0, 0, -0.25]}>
                <cylinderGeometry args={[0.006, 0.006, 0.13, 6]} />
                <meshStandardMaterial color="#6B7A2A" roughness={0.8} />
              </mesh>
            </group>
          );
        })}

      {cfg.message.trim() && (
        <mesh position={[Math.sin(center) * r * 0.05, h + 0.02, Math.cos(center) * r * 0.05]} rotation={[0, center, 0]}>
          <boxGeometry args={[0.42, 0.025, 0.2]} />
          <meshStandardMaterial color="#F8EEDF" roughness={0.4} />
        </mesh>
      )}
    </group>
  );
}

function lighten(hex: string, amt: number) {
  const c = new THREE.Color(hex);
  c.lerp(new THREE.Color('#ffffff'), amt);
  return `#${c.getHexString()}`;
}

export function Cake({ config, stand = false }: { config: CakeConfig; stand?: boolean }) {
  const scale = { '0.5 kg': 0.82, '1 kg': 1, '1.5 kg': 1.0, '2 kg': 1.1 }[config.size];
  const two = config.tiers === 2;
  const base = { r: 1, h: 0.72 };
  const top = { r: 0.66, h: 0.56 };

  return (
    <group scale={scale}>
      {/* board or stand */}
      {stand ? (
        <group>
          <mesh position={[0, -0.04, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[1.32, 1.28, 0.06, 72]} />
            <meshPhysicalMaterial color="#F3E7D7" roughness={0.25} clearcoat={0.6} />
          </mesh>
          <mesh position={[0, -0.36, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.22, 0.6, 32]} />
            <meshPhysicalMaterial color="#F3E7D7" roughness={0.25} clearcoat={0.6} />
          </mesh>
          <mesh position={[0, -0.68, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.62, 0.7, 0.06, 48]} />
            <meshPhysicalMaterial color="#F3E7D7" roughness={0.25} clearcoat={0.6} />
          </mesh>
        </group>
      ) : (
        <mesh position={[0, -0.02, 0]} receiveShadow>
          <cylinderGeometry args={[1.22, 1.22, 0.04, 72]} />
          <meshStandardMaterial color="#C9A46A" metalness={0.6} roughness={0.35} />
        </mesh>
      )}

      <Tier r={base.r} h={base.h} y={0} cfg={config} seed={1} isTop={!two} />
      {two && <Tier r={top.r} h={top.h} y={base.h} cfg={config} seed={2} isTop />}
    </group>
  );
}

export { Strawberry, Shard };
