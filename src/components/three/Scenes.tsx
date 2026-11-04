'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Lightformer, OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Cake, Shard, Strawberry } from './Cake';
import { heroCake, type CakeConfig } from '@/lib/cake';

/** Studio lighting built from local light-formers: no HDR download needed. */
function StudioLights({ warm = '#FFE2C4' }: { warm?: string }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#FFF3E6', '#6B4A3C', 0.9]} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} color={warm} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -3]} intensity={1.4} color="#FFC79A" />
      <Environment resolution={128}>
        <Lightformer intensity={2} position={[0, 4, 3]} scale={[6, 2, 1]} color="#FFF1E2" />
        <Lightformer intensity={1.2} position={[-4, 1, 2]} scale={[2, 4, 1]} color="#FFD3A8" />
        <Lightformer intensity={0.8} position={[4, 1, -2]} scale={[2, 4, 1]} color="#FFE7D0" />
      </Environment>
    </>
  );
}

const usePrefersReducedMotion = () => {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(m.matches);
    const f = () => setR(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return r;
};

function HeroRig({ reduced, children }: { reduced: boolean; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame((state, dt) => {
    if (!g.current) return;
    if (!reduced) g.current.rotation.y += dt * 0.12;
    const tx = reduced ? 0 : pointer.y * 0.08;
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, 0.08 + tx, 3, dt);
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, reduced ? 0 : pointer.x * 0.35, 2, dt);
    state.camera.lookAt(0, 0.35, 0);
  });
  return <group ref={g}>{children}</group>;
}

function Floaters({ reduced }: { reduced: boolean }) {
  const items: { p: THREE.Vector3Tuple; kind: 'berry' | 'shard'; s: number }[] = [
    { p: [-1.45, 1.55, -0.4], kind: 'berry', s: 1.9 },
    { p: [1.35, 1.75, -0.3], kind: 'shard', s: 1.3 },
    { p: [1.5, 0.15, 0.8], kind: 'berry', s: 1.6 },
    { p: [-1.5, -0.2, 0.6], kind: 'shard', s: 1.1 },
    { p: [0.35, 2.05, -1.0], kind: 'berry', s: 1.2 },
  ];
  return (
    <>
      {items.map((it, i) => (
        <Float key={i} speed={reduced ? 0 : 1.2 + i * 0.2} rotationIntensity={reduced ? 0 : 0.8} floatIntensity={reduced ? 0 : 0.9}>
          <group position={it.p} scale={it.s} rotation={[0.4 * i, i, 0.3]}>
            {it.kind === 'berry' ? <Strawberry /> : <Shard seed={i * 31 + 5} />}
          </group>
        </Float>
      ))}
    </>
  );
}

export function HeroScene() {
  const reduced = usePrefersReducedMotion();
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.7, 5.2], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <StudioLights />
        <Float speed={reduced ? 0 : 1} rotationIntensity={0} floatIntensity={reduced ? 0 : 0.4}>
          <HeroRig reduced={reduced}>
            <group position={[0, 0.1, 0]} rotation={[0, -0.9, 0]}>
              <Cake config={heroCake} stand />
            </group>
          </HeroRig>
        </Float>
        <Floaters reduced={reduced} />
        <ContactShadows position={[0, -0.75, 0]} opacity={0.45} scale={6} blur={2.6} far={2} color="#1a0d08" />
      </Suspense>
    </Canvas>
  );
}

export function StudioScene({ config }: { config: CakeConfig }) {
  const reduced = usePrefersReducedMotion();
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [2.6, 2.4, 4.2], fov: 35 }} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <StudioLights />
        <group position={[0, -0.45, 0]} rotation={[0, -0.75, 0]}>
          <Cake config={config} />
        </group>
        <ContactShadows position={[0, -0.48, 0]} opacity={0.35} scale={6} blur={2.4} far={2} color="#4B2E24" />
        <OrbitControls
          enablePan={false}
          minDistance={3.6}
          maxDistance={7}
          minPolarAngle={0.5}
          maxPolarAngle={1.45}
          autoRotate={!reduced}
          autoRotateSpeed={0.6}
          target={[0, 0.3, 0]}
        />
      </Suspense>
    </Canvas>
  );
}

/**
 * Hero carousel: the four signature cakes as 3D models on a stand, on a dark stage.
 * The active cake spins in; the others shrink away. Drag to turn the cake (desktop).
 */
function CarouselCake({ config, active, reduced }: { config: CakeConfig; active: boolean; reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const el = g.current;
    if (!el) return;
    const target = active ? 1 : 0.001;
    const s = reduced ? target : THREE.MathUtils.damp(el.scale.x, target, 6, dt);
    el.scale.setScalar(s);
    el.visible = s > 0.01;
    if (!reduced) el.rotation.y += dt * (active ? 0.25 + (1 - s) * 6 : 2);
  });
  return (
    <group ref={g} scale={active ? 1 : 0.001} rotation={[0, -0.9, 0]}>
      <Cake config={config} stand />
    </group>
  );
}

export function HeroCarouselScene({ configs, index }: { configs: CakeConfig[]; index: number }) {
  const reduced = usePrefersReducedMotion();
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 1.6, 5.4], fov: 34 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} aria-hidden>
      <Suspense fallback={null}>
        <ambientLight intensity={0.45} />
        <hemisphereLight args={['#FFF3E6', '#3B2219', 0.7]} />
        <directionalLight position={[3, 5, 4]} intensity={2.4} color="#FFE2C4" castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-1.5, 1.2, 5]} intensity={1.1} color="#FFF1E2" />
        {/* warm rim lights to separate the cake from the dark background */}
        <directionalLight position={[-4, 2.5, -3]} intensity={2.2} color="#E9A36A" />
        <directionalLight position={[4, 1.5, -4]} intensity={1.4} color="#D7263D" />
        <Environment resolution={128}>
          <Lightformer intensity={1.6} position={[0, 4, 3]} scale={[6, 2, 1]} color="#FFF1E2" />
          <Lightformer intensity={1} position={[-4, 1, 2]} scale={[2, 4, 1]} color="#FFC79A" />
        </Environment>
        <group position={[0, -0.05, 0]}>
          {configs.map((c, i) => (
            <CarouselCake key={i} config={c} active={i === index} reduced={reduced} />
          ))}
        </group>
        <Floaters reduced={reduced} />
        <ContactShadows position={[0, -0.8, 0]} opacity={0.6} scale={6} blur={2.8} far={2} color="#000000" />
        <OrbitControls enableRotate={typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches} enablePan={false} enableZoom={false} minPolarAngle={1.1} maxPolarAngle={1.35} target={[0, 0.3, 0]} />
      </Suspense>
    </Canvas>
  );
}
