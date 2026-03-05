import { assist } from "@sanity/assist";
import { visionTool } from "@sanity/vision";
import { defineConfig, defineField } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import {
  unsplashAssetSource,
  unsplashImageAsset,
} from "sanity-plugin-asset-source-unsplash";
import { iconPicker } from "sanity-plugin-icon-picker";
import { media, mediaAssetSource } from "sanity-plugin-media";

import { createPagesNavigator } from "./components/navigator/page-navigator";
import { locations, mainDocuments } from "./lib/presentation/resolve";
import { presentationUrl } from "./plugins/presentation-url";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";
import { experimentsFromStatsig } from "./utils/experiments";
import { createPageTemplate } from "./utils/helper";
import { fieldLevelExperiments } from "@sanity/personalization-plugin";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
const dataset = process.env.SANITY_STUDIO_DATASET;
const title = process.env.SANITY_STUDIO_TITLE;
const presentationOriginUrl = process.env.SANITY_STUDIO_PRESENTATION_URL;

export default defineConfig({
  name: "default",
  title: title ?? "Turbo Studio",
  projectId: projectId,
  dataset: dataset ?? "production",
  plugins: [
    presentationTool({
      resolve: { locations, mainDocuments },
      allowOrigins: [
        presentationOriginUrl ?? "http://localhost:3000",
        "http://localhost:*",
      ],
      components: {
        unstable_navigator: {
          component: createPagesNavigator(),
          minWidth: 350,
          maxWidth: 350,
        },
      },
      previewUrl: {
        origin: presentationOriginUrl ?? "http://localhost:3000",
        previewMode: {
          enable: "/api/presentation-draft",
        },
      },
    }),
    assist(),
    structureTool({
      structure,
    }),
    visionTool(),
    iconPicker(),
    media(),
    presentationUrl(),
    unsplashImageAsset(),
    fieldLevelExperiments({
      // Field(s) you want to experiment on. Passing a full schema field
      // definition gives us more control (e.g. reference, hidden, etc.)
      fields: [
        "string",
        defineField({
          name: "page",
          type: "reference",
          to: [{ type: "page" }, { type: "homePage" }],
        }),
      ],
      // Experiments + variants (must match cookie values)
      experiments: experimentsFromStatsig,
    }),
  ],

  form: {
    image: {
      assetSources: (previousAssetSources) => {
        return previousAssetSources.filter(
          (assetSource) =>
            assetSource === mediaAssetSource ||
            assetSource === unsplashAssetSource,
        );
      },
    },
  },
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      const { type } = creationContext;
      if (type === "global") return [];
      return prev;
    },
  },
  schema: {
    types: schemaTypes,
    templates: createPageTemplate(),
  },
});
