import { SparklesIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

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
      name: "page",
      title: "Page Experiment",
      type: "experimentPage",
      description:
        "Select a default page and optional per-variant pages (variants must match your experiment/cookie variant IDs).",
      validation: (rule) =>
        rule.custom((experiment: unknown) => {
          const exp = experiment as
            | { default?: unknown; variants?: Array<{ _key?: string; value?: unknown }> }
            | undefined;

          if (!exp?.default) return "Default page is required";

          const invalidVariants = exp.variants?.filter((v) => !v.value) ?? [];
          if (invalidVariants.length) {
            return invalidVariants.map((item) => ({
              message: "Variant page is required",
              path: ["variants", { _key: item._key }, "value"],
            }));
          }

          return true;
        }),
    }),
  ],
  preview: {
    select: {
      name: "name",
      targetRoute: "targetRoute",
      isActive: "isActive",
      experimentId: "page.experimentId",
    },
    prepare: ({ name, targetRoute, isActive, experimentId }) => ({
      title: name || "Untitled Experiment",
      subtitle: [
        targetRoute || "/",
        experimentId ? `Experiment: ${experimentId}` : "No experiment selected",
        isActive ? "🟢 Active" : "⚪ Inactive",
      ].join(" • "),
      media: SparklesIcon,
    }),
  },
});
