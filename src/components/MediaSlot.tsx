import { business } from '@/config/business';
import { LoopVideo } from './LoopVideo';

type Tone = 'cocoa' | 'cream' | 'berry' | 'pista' | 'caramel';

const tones: Record<Tone, string> = {
  cocoa: 'from-[#5a3729] via-[#3b2219] to-[#24150f] text-cream/80',
  cream: 'from-[#fbe9d6] via-[#f3dcc3] to-[#e8c9a8] text-choc/70',
  berry: 'from-[#f8d5d3] via-[#f1b9b8] to-[#e48f93] text-choc/70',
  pista: 'from-[#eef0d6] via-[#dde3b2] to-[#c3cc8a] text-choc/70',
  caramel: 'from-[#f3d2b0] via-[#dca673] to-[#b8743f] text-choc/80',
};

/**
 * Placeholder for a photo or video that hasn't been produced yet.
 * When `src` is set it renders the real image/video instead.
 */
export function MediaSlot({
  label,
  slot,
  aspect = '4/5',
  tone = 'cream',
  src,
  video,
  poster,
  alt = '',
  className = '',
  monogram,
  position = '50% 50%',
}: {
  position?: string;
  label: string;
  slot: string;
  aspect?: string;
  tone?: Tone;
  src?: string | null;
  video?: string | null;
  poster?: string | null;
  alt?: string;
  className?: string;
  monogram?: string;
}) {
  const box = `relative w-full max-w-full overflow-hidden ${className}`;
  if (video)
    return (
      <div className={box} style={{ aspectRatio: aspect }}>
        <LoopVideo src={video} poster={poster ?? ''} position={position} />
      </div>
    );
  if (src)
    return (
      <div className={box} style={{ aspectRatio: aspect }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="h-full w-full object-cover" style={{ objectPosition: position }} src={src} alt={alt} loading="lazy" decoding="async" />
      </div>
    );

  return (
    <div className={`${box} bg-gradient-to-br ${tones[tone]}`} style={{ aspectRatio: aspect }} role="img" aria-label={`${label} (photo coming soon)`}>
      <div className="absolute inset-3 rounded-[inherit] border border-dashed border-current opacity-25" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-[clamp(2.5rem,7vw,4.5rem)] italic leading-none opacity-30">{monogram ?? label.charAt(0)}</span>
      </div>
      {business.showAssetSlots && (
        <span className="annot absolute bottom-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate">
          {slot} · {aspect.replace('/', ':')}
        </span>
      )}
    </div>
  );
}
