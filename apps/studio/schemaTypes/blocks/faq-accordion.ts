import { MessageCircleQuestion } from "lucide-react";
import { defineType } from "sanity";
import { defineField } from "sanity";

export const faqAccordion = defineType({
  name: "faqAccordion",
  type: "object",
  icon: MessageCircleQuestion,
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
    }),
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      type: "string",
    }),
    defineField({
      name: "faqs",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "faq" }],
          options: { disableNew: true },
        },
      ],
      validation: (Rule) => [Rule.required(), Rule.unique()],
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title ?? "Untitled",
      subtitle: "FAQ Accordion",
    }),
  },
});
