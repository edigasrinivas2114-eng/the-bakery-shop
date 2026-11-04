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
  const visible = useRef(false);

  // Attach the source once the clip is near the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (media && !window.matchMedia(media).matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting;
        if (e.isIntersecting) {
          setActive(true);
          if (el.currentSrc) el.play().catch(() => {});
        } else el.pause();
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [media]);

  // Start playback only after the source is on the element. Phones (iOS Safari, Android Chrome)
  // need muted + playsinline set as real attributes, and some block autoplay until the first touch.
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');
    let resume: (() => void) | null = null;
    const start = () => {
      if (!visible.current) return;
      el.play().catch(() => {
        // Autoplay refused (e.g. power saving): try again on the first tap or scroll.
        if (resume) return;
        resume = () => {
          el.play().catch(() => {});
          window.removeEventListener('touchstart', resume!);
          window.removeEventListener('scroll', resume!);
        };
        window.addEventListener('touchstart', resume, { passive: true, once: true });
        window.addEventListener('scroll', resume, { passive: true, once: true });
      });
    };
    if (el.readyState >= 2) start();
    else el.addEventListener('loadeddata', start, { once: true });
    return () => {
      el.removeEventListener('loadeddata', start);
      if (resume) {
        window.removeEventListener('touchstart', resume);
        window.removeEventListener('scroll', resume);
      }
    };
  }, [active, src]);

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
      autoPlay
      preload={active ? 'auto' : 'none'}
      aria-hidden
    />
  );
}
