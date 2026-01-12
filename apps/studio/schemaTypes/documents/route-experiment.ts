import { SparklesIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const routeExperiment = defineType({
  name: "routeExperiment",
  title: "Route Experiment",
  type: "document",
  icon: SparklesIcon,
  fields: [
    defineField({
      name: "name",
      title: "Experiment Name",
      type: "string",
      description:
        "Internal name for this experiment (e.g., 'homepage-redesign-2024')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "targetRoute",
      title: "Target Route",
      type: "string",
      description:
        "The URL path this experiment applies to (e.g., '/' for homepage, '/pricing' for pricing page)",
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: "Homepage (/)", value: "/" },
          { title: "Blog Index (/blog)", value: "/blog" },
        ],
      },
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: false,
      description: "Enable/disable this experiment",
    }),
    defineField({
      name: "variants",
      title: "Variants",
      type: "array",
      description: "Define the variants for this experiment",
      validation: (Rule) => Rule.required().min(2).max(5),
      of: [
        defineArrayMember({
          type: "object",
          name: "variant",
          fields: [
            defineField({
              name: "id",
              title: "Variant ID",
              type: "string",
              description: "Unique identifier for this variant",
              validation: (Rule) => Rule.required(),
              options: {
                list: [
                  { title: "Control", value: "control" },
                  { title: "Variant A", value: "variant-a" },
                  { title: "Variant B", value: "variant-b" },
                  { title: "Variant C", value: "variant-c" },
                ],
              },
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              description: "Human-readable label for this variant",
            }),
            defineField({
              name: "page",
              title: "Page",
              type: "reference",
              to: [{ type: "page" }, { type: "homePage" }],
              description: "The page document to show for this variant",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "weight",
              title: "Traffic Weight (%)",
              type: "number",
              initialValue: 50,
              description: "Percentage of traffic to send to this variant",
              validation: (Rule) => Rule.min(0).max(100),
            }),
          ],
          preview: {
            select: {
              variantId: "id",
              label: "label",
              pageTitle: "page.title",
              weight: "weight",
            },
            prepare: ({ variantId, label, pageTitle, weight }) => ({
              title: label || variantId || "Unnamed Variant",
              subtitle: `${pageTitle || "No page"} • ${weight || 0}% traffic`,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "geoTargeting",
      title: "Geo Targeting",
      type: "array",
      description:
        "Optional: Override variants based on geographic location. If set, geo rules take precedence over the default variants above.",
      of: [
        defineArrayMember({
          type: "object",
          name: "geoRule",
          fields: [
            defineField({
              name: "country",
              title: "Country Code",
              type: "string",
              description:
                "ISO country code (e.g., US, UK, DE). Use 'default' for fallback.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "page",
              title: "Page",
              type: "reference",
              to: [{ type: "page" }, { type: "homePage" }],
              description: "The page to show for users from this country",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              country: "country",
              pageTitle: "page.title",
            },
            prepare: ({ country, pageTitle }) => ({
              title: country?.toUpperCase() || "Unknown",
              subtitle: pageTitle || "No page selected",
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      name: "name",
      targetRoute: "targetRoute",
      isActive: "isActive",
      variantsCount: "variants.length",
    },
    prepare: ({ name, targetRoute, isActive }) => ({
      title: name || "Untitled Experiment",
      subtitle: `${targetRoute || "/"} • ${isActive ? "🟢 Active" : "⚪ Inactive"}`,
      media: SparklesIcon,
    }),
  },
});
