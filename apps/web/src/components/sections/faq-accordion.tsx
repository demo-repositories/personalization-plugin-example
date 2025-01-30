import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";

import type { PagebuilderType } from "@/types";

import { RichText } from "../richtext";

type FaqAccordionProps = PagebuilderType<"faqAccordion">;

export function FaqAccordion({
  eyebrow,
  title,
  subtitle,
  faqs,
}: FaqAccordionProps) {
  return (
    <section className="">
      <div className="container mx-auto px-4 md:px-6">
        <div className="space-y-4">
          <span className="text-sm text-muted-foreground">{eyebrow}</span>
          <h2 className="text-xl font-bold">{title}</h2>
          <p>{subtitle}</p>
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="3"
          >
            {faqs?.map((faq, index) => (
              <AccordionItem
                value={faq?._id}
                key={`AccordionItem-${faq?._id}-${index}`}
                className="py-2"
              >
                <AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline">
                  {faq?.title}
                </AccordionTrigger>
                <AccordionContent className="pb-2 text-muted-foreground">
                  <RichText richText={faq?.richText ?? []} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
