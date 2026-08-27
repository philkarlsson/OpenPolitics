import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

export type PushRegistrationResult =
  | { status: "registered"; token: string; platform: "android" | "ios" }
  | { status: "unavailable" | "denied" };

export async function registerForPushNotifications(): Promise<PushRegistrationResult> {
  if (!Capacitor.isNativePlatform()) {
    return { status: "unavailable" };
  }

  const platform = Capacitor.getPlatform();
  if (platform !== "android" && platform !== "ios") {
    return { status: "unavailable" };
  }

  let permission = await PushNotifications.checkPermissions();
  if (permission.receive === "prompt") {
    permission = await PushNotifications.requestPermissions();
  }

  if (permission.receive !== "granted") {
    return { status: "denied" };
  }

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("Push registration timed out"));
    }, 10000);

    void PushNotifications.addListener("registration", (token) => {
      window.clearTimeout(timeout);
      resolve({ status: "registered", token: token.value, platform });
    });

    void PushNotifications.addListener("registrationError", (error) => {
      window.clearTimeout(timeout);
      reject(new Error(error.error));
    });

    void PushNotifications.register();
  });
}
