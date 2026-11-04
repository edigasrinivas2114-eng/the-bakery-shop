'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Muted looping background clip.
 * - Loads only when near the viewport (and only when `media` matches, e.g. desktop-only).
 * - Shows the poster and never plays when the visitor prefers reduced motion.
 */
export function LoopVideo({
  src,
  poster,
  className = '',
  media,
  position = '50% 50%',
}: {
  src: string;
  poster: string;
  className?: string;
  media?: string;
  position?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (media && !window.matchMedia(media).matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true);
          el.play().catch(() => {});
        } else el.pause();
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [media]);

  return (
    <video
      ref={ref}
      className={`h-full w-full object-cover ${className}`}
      style={{ objectPosition: position }}
      poster={poster}
      src={active ? src : undefined}
      muted
      loop
      playsInline
      autoPlay={active}
      preload="none"
      aria-hidden
    />
  );
}
