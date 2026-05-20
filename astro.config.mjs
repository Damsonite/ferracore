// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // Static output matches the current site structure and Astro's default mode.
  output: "static",

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
