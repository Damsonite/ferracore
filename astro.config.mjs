// @ts-check
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  output: "server",

  // Fonts
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "IBM Plex Sans",
      cssVariable: "--font-ibm-plex-sans",
    },
  ],

  // Vite configuration
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      // Ensure Supabase client works in SSR
      external: ["@supabase/supabase-js"],
    },
  },
});
