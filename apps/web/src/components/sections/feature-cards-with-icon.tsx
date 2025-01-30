import type { PagebuilderType } from "@/types";

import { RichText } from "../richtext";
import { SanityIcon } from "../sanity-icon";

type FeatureCardsWithIconProps = PagebuilderType<"featureCardsIcon">;

type FeatureCardProps = {
  card: NonNullable<FeatureCardsWithIconProps["cards"]>[number];
};

function FeatureCard({ card }: FeatureCardProps) {
  const { icon, title, richText } = card ?? {};
  return (
    <div className="flex flex-col justify-between rounded-lg bg-accent p-6 md:min-h-[300px] md:p-8">
      <span className="mb-6 flex w-fit p-2 items-center justify-center rounded-full bg-background">
        <SanityIcon icon={icon} />
      </span>
      <div>
        <h3 className="text-lg font-medium md:text-2xl">{title}</h3>
        <RichText richText={richText} />
      </div>
    </div>
  );
}

export function FeatureCardsWithIcon({
  eyebrow,
  title,
  richText,
  cards,
}: FeatureCardsWithIconProps) {
  return (
    <section className="">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex w-full flex-col items-center">
          <div className="flex flex-col items-center space-y-4 text-center sm:space-y-6 md:max-w-3xl md:text-center">
            <p className="text-sm text-muted-foreground">{eyebrow}</p>
            <h2 className="text-3xl font-medium md:text-5xl">{title}</h2>
            <RichText richText={richText} />
          </div>
        </div>
        <div className="mx-auto mt-20 grid max-w-5xl gap-6 md:grid-cols-2">
          {cards?.map((card, index) => (
            <FeatureCard
              key={`FeatureCard-${card?._key}-${index}`}
              card={card}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
