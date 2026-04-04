import Image from "next/image";

const PLACEHOLDER_AVATAR = "/images/farmers/avatar-placeholder.svg";

export type FarmerProfile = {
  id: string;
  name: string;
  farm: string;
  location: string;
  /** Public URL (e.g. CDN) or site path under /public — shown in the circular avatar */
  imageUrl?: string;
};

type FarmerCardProps = {
  farmer: FarmerProfile;
  /** Used to vary placeholder avatar hue */
  hueIndex: number;
  isVisible: boolean;
  animationDelayMs: number;
};

const HUE_STEP_DEG = 38;

export default function FarmerCard({
  farmer,
  hueIndex,
  isVisible,
  animationDelayMs,
}: FarmerCardProps) {
  const imageSrc = farmer.imageUrl?.trim() || PLACEHOLDER_AVATAR;
  const usePlaceholder = imageSrc === PLACEHOLDER_AVATAR;

  return (
    <article
      className={`flex w-38 flex-col items-center text-center transition-all duration-700 ease-out sm:w-40 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: `${animationDelayMs}ms` }}
    >
      <div className="mb-3 shrink-0 rounded-full border-4 border-[#4CAF50] bg-white p-1 shadow-sm">
        <div
          className="relative h-22 w-22 overflow-hidden rounded-full sm:h-24 sm:w-24"
          style={
            usePlaceholder
              ? { filter: `hue-rotate(${hueIndex * HUE_STEP_DEG}deg) saturate(1.08)` }
              : undefined
          }
        >
          <Image
            src={imageSrc}
            alt={farmer.name}
            width={120}
            height={120}
            className="h-full w-full object-cover"
            sizes="(min-width: 640px) 96px, 88px"
            unoptimized={usePlaceholder}
          />
        </div>
      </div>
      <h3 className="text-sm font-bold leading-snug text-neutral-990 sm:text-[0.95rem]">
        {farmer.name}
      </h3>
      <p className="mt-1.5 text-xs leading-snug text-neutral-700 sm:text-sm">{farmer.farm}</p>
      <p className="mt-1 text-[11px] leading-snug text-neutral-500 sm:text-xs">
        {farmer.location}
      </p>
    </article>
  );
}
