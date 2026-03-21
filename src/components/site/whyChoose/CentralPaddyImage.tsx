import Image from "next/image";

const R = "clamp(2rem, 11vw, 6.25rem)";
const LEAF_RADIUS_STYLE = { borderRadius: `${R} 0 ${R} 0` } as const;

type CentralPaddyImageProps = {
  alt: string;
};

/**
 * “Leaf” mask: large radius on top-left & bottom-right; sharp top-right & bottom-left.
 * Light green border layer offset down-right behind the image (spec).
 */
export default function CentralPaddyImage({ alt }: CentralPaddyImageProps) {
  return (
    <div className="relative isolate mx-auto w-full max-w-[min(100%,320px)] lg:mx-0 lg:max-w-none">
      <div
        className="pointer-events-none absolute z-0 border-2 border-[#9CCC65]"
        style={{
          ...LEAF_RADIUS_STYLE,
          top: "0.65rem",
          left: "0.65rem",
          right: "-0.45rem",
          bottom: "-0.45rem",
        }}
        aria-hidden
      />
      <div
        className="relative z-10 aspect-3/4 w-full overflow-hidden shadow-md"
        style={LEAF_RADIUS_STYLE}
      >
        <Image
          src="/images/why-choose/chooseus.jpg"
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 1023px) min(320px, 100vw), 33vw"
          unoptimized
          priority={false}
        />
      </div>
    </div>
  );
}
