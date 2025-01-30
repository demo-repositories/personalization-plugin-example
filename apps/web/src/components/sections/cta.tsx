import type { PagebuilderType } from "@/types";

import { RichText } from "../richtext";
import { SanityButtons } from "../sanity-buttons";

export type CTABlockProps = PagebuilderType<"cta">;

export function CTABlock({ buttons, richText, title }: CTABlockProps) {
  return (
    <section className="">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex w-full flex-col gap-16 overflow-hidden rounded-lg bg-accent p-8 md:rounded-xl lg:flex-row lg:items-center lg:p-16">
          <div className="flex-1">
            <h2 className="mb-3 text-2xl font-semibold md:mb-4 md:text-4xl lg:mb-6">
              {title}
            </h2>
            <RichText richText={richText} />
          </div>
          <SanityButtons
            buttons={buttons}
            buttonClassName="w-full sm:w-auto"
            // className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start"
          />
        </div>
      </div>
    </section>
  );
}
