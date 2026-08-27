import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.communityproject.openpolitics",
  appName: "OpenPolitics",
  webDir: "apps/web/dist",
  server: {
    androidScheme: "https"
  }
};

export default config;
