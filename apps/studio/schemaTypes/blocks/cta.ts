import { MobileDeviceIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { buttonsField, richTextField } from "../common";

export const cta = defineType({
  name: "cta",
  type: "object",
  icon: MobileDeviceIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    richTextField,
    buttonsField,
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title,
      subtitle: "CTA Block",
    }),
  },
});
