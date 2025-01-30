import { defineField, defineType } from "sanity";

import { GROUP, GROUPS } from "../../utils/constant";
import { ogFields } from "../../utils/og-fields";
import { seoFields } from "../../utils/seo-fields";
import { defineSlug } from "../../utils/slug";
import { pageBuilderField } from "../common";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  groups: GROUPS,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      ...defineSlug(),
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Image",
      group: GROUP.MAIN_CONTENT,
    }),
    pageBuilderField,
    ...seoFields,
    ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      description: "description",
      slug: "slug.current",
      media: "image",
    },
    prepare: ({ title, description, slug, media }) => ({
      title,
      subtitle: slug,
      media,
    }),
  },
});
