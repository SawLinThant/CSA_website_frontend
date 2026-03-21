import Image from "next/image";
import type { CSSProperties } from "react";

type OfferCardProps = {
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
  style?: CSSProperties;
};

export default function OfferCard({
  iconSrc,
  iconAlt,
  title,
  description,
  style,
}: OfferCardProps) {
  return (
    <article
      data-offer-card
      style={style}
      className="rounded-2xl h-full max-w-sm bg-[#f4f4f4] p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg">
        <Image
          src={iconSrc}
          alt={iconAlt}
          width={24}
          height={24}
          className="h-6 w-6 object-contain"
        />
      </div>
      <h3 className="text-2xl leading-tight font-semibold text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-900">{description}</p>
    </article>
  );
}

