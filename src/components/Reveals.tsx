'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Scroll reveals for every [data-reveal] element. Content is fully visible without JS;
 * the animation only adds a short rise as each block enters the viewport.
 */
export function Reveals() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen
        gsap.from(el, {
          y: 36,
          opacity: 0.25,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });
    });
    return () => mm.revert();
  }, []);
  return null;
}
