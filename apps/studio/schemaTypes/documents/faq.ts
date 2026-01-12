import { HelpCircleIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { parseRichTextToString } from "../../utils/helper";
import { richTextField } from "../common";

export const faq = defineType({
  name: "faq",
  type: "document",
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: "title",
      title: "Question",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ ...richTextField, title: "Answer" }),
  ],
  preview: {
    select: {
      title: "title",
      richText: "richText",
    },
    prepare: ({ title, richText }) => ({
      title: title ?? "Untitled",
      subtitle: parseRichTextToString(richText, 20),
    }),
  },
});
