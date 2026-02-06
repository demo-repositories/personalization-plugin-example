/**
 * Studio-side experiment + variant definitions for `@sanity/personalization-plugin`.
 *
 * This is intentionally a local/static list for now. When you're ready to connect
 * to a 3rd party, replace this export with an async loader:
 * - `experiments: async () => fetch(...).then(r => r.json())`
 * - or `experiments: async (client) => client.fetch(...)`
 *
 * Shape must be: {id, label, variants: [{id, label}]}
 * Variant IDs must match whatever you use in cookies / routing (e.g. `control`, `variant-a`).
 */

import type { ExperimentType } from "@sanity/personalization-plugin";

export const experimentsFromStatsig: ExperimentType[] = [
  {
    id: "route-page",
    label: "Route Page",
    variants: [
      { id: "control", label: "Control" },
      { id: "variant-a", label: "Variant A" },
      { id: "variant-b", label: "Variant B" },
      { id: "variant-c", label: "Variant C" },
    ],
  },
  {
    id: "blog-title",
    label: "Blog Title",
    variants: [
      { id: "control", label: "Control" },
      { id: "variant-a", label: "Variant A" },
    ],
  },
];

