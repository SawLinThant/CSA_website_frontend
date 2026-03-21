type FeatureBlockProps = {
  title: string;
  description: string;
};

export default function FeatureBlock({ title, description }: FeatureBlockProps) {
  return (
    <div className="max-w-md text-center lg:max-w-none lg:text-left">
      <h3 className="text-base font-bold leading-snug text-[#1B5E20] sm:text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#4A4A4A] sm:text-[0.95rem]">{description}</p>
    </div>
  );
}
