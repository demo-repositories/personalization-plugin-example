import type { Config } from "tailwindcss";
import uiConfig from "@workspace/ui/tailwind.config";

// Ensure Tailwind can load a *default export* config from this app,
// and include this app's source files in `content` scanning.
const config: Config = {
  ...uiConfig,
  content: Array.from(
    new Set(["./src/**/*.{ts,tsx}", ...(uiConfig.content ?? [])]),
  ),
};

export default config;
