import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl =
  process.env.CAPACITOR_SERVER_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://www.solvestay.com";

const config: CapacitorConfig = {
  appId: "com.solvestay.app",
  appName: "Solvestay",
  webDir: "public",
  server: {
    url: serverUrl,
    androidScheme: "https",
    cleartext: serverUrl.startsWith("http://"),
  },
};

export default config;
