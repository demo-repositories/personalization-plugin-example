import fs from "fs";
import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;
const host = process.env.HOST_NAME;

// Workaround for corrupted source map in @portabletext/editor that causes
// "Unterminated string literal" during Vite's dependency optimization.
// Strip the sourceMappingURL so esbuild never tries to parse the broken .map file.
const portableTextEditorSourceMapFix = {
  name: "portabletext-editor-sourcemap-fix",
  setup(build: {
    onLoad: (
      arg: { filter: RegExp },
      fn: (args: { path: string }) => { contents: string; loader: string } | null,
    ) => void;
  }) {
    build.onLoad(
      { filter: /@portabletext[/\\]editor[/\\]lib[/\\]index\.js$/ },
      ({ path }) => {
        const content = fs.readFileSync(path, "utf-8");
        const stripped = content.replace(/\n?\/\/# sourceMappingURL=.*$/m, "");
        return { contents: stripped, loader: "js" };
      },
    );
  },
};

export default defineCliConfig({
  api: {
    projectId: projectId,
    dataset: dataset,
  },
  studioHost:
    host && host !== "main"
      ? `${host}-turbo-start-sanity`
      : "turbo-start-sanity",
  autoUpdates: true,
  vite: {
    optimizeDeps: {
      esbuildOptions: {
        plugins: [portableTextEditorSourceMapFix],
      },
    },
  },
});
