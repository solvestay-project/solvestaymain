import type { CapacitorConfig } from "@capacitor/cli";

/** Production site (override with CAPACITOR_SERVER_URL for staging). */
const DEFAULT_SERVER_URL = "https://www.solvestay.com";

const serverUrl = (
  process.env.CAPACITOR_SERVER_URL ?? DEFAULT_SERVER_URL
).replace(/\/$/, "");

const config: CapacitorConfig = {
  appId: "com.solvestay.app",
  appName: "Solvestay",
  webDir: "www",
  server: {
    url: serverUrl,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f172a",
      showSpinner: false,
    },
  },
};

export default config;
