import { Badge } from "@workspace/ui/components/badge";

import type { PagebuilderType } from "@/types";

import { RichText } from "../richtext";
import { SanityButtons } from "../sanity-buttons";
import { SanityImage } from "../sanity-image";

type HeroBlockProps = PagebuilderType<"hero">;

export function HeroBlock({
  title,
  buttons,
  badge,
  image,
  richText,
}: HeroBlockProps) {
  return (
    <section className="">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="grid h-full grid-rows-[auto_1fr_auto] gap-4 items-center justify-items-center text-center lg:items-start lg:justify-items-start lg:text-left">
            <Badge variant="outline">{badge}</Badge>
            <div className="grid gap-4">
              <h1 className="text-pretty text-4xl font-bold lg:text-6xl">
                {title}
              </h1>
              <div className="text-base text-balance">
                <RichText richText={richText} />
              </div>
            </div>
            <div>
              <SanityButtons
                buttons={buttons}
                buttonClassName="w-full sm:w-auto"
                className="grid w-full gap-2 sm:grid-flow-col lg:justify-start"
              />
            </div>
          </div>
          {image && (
            <div className="h-96 w-full">
              <SanityImage
                asset={image}
                loading="eager"
                width={800}
                height={800}
                priority
                className="max-h-96 w-full rounded-md object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
