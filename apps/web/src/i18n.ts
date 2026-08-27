import type { SupportedLocale } from "@openpolitics/shared";

const messages = {
  "de-DE": {
    navOverview: "Ueberblick",
    navProfile: "Profil",
    signIn: "Mit Google anmelden",
    signOut: "Abmelden",
    shellTitle: "OpenPolitics",
    shellSubtitle: "Politische Zusammenarbeit mit klaren Profilen, Orten und Beteiligung.",
    statusOnline: "API verbunden",
    statusOffline: "API nicht erreichbar",
    onboardingTitle: "Onboarding",
    onboardingIntro: "Waehle deine Basisdaten und deinen politischen Raum.",
    displayName: "Anzeigename",
    slug: "Profil-Slug",
    locale: "Sprache",
    timezone: "Zeitzone",
    country: "Land",
    region: "Bundesland",
    bio: "Kurzbeschreibung",
    complete: "Onboarding speichern",
    profileReady: "Profil aktiv",
    noProfile: "Profil noch nicht angelegt",
    authRequired: "Melde dich an, um dein Profil und Onboarding zu verwalten.",
    pushStatus: "Push",
    pushUnavailable: "Nur in der mobilen App",
    pushDenied: "Nicht erlaubt",
    pushRegistered: "FCM aktiv"
  },
  "en-US": {
    navOverview: "Overview",
    navProfile: "Profile",
    signIn: "Sign in with Google",
    signOut: "Sign out",
    shellTitle: "OpenPolitics",
    shellSubtitle: "Political collaboration with clear profiles, places and participation.",
    statusOnline: "API connected",
    statusOffline: "API unavailable",
    onboardingTitle: "Onboarding",
    onboardingIntro: "Choose your base data and political scope.",
    displayName: "Display name",
    slug: "Profile slug",
    locale: "Language",
    timezone: "Timezone",
    country: "Country",
    region: "Region",
    bio: "Short bio",
    complete: "Save onboarding",
    profileReady: "Profile active",
    noProfile: "No profile yet",
    authRequired: "Sign in to manage your profile and onboarding.",
    pushStatus: "Push",
    pushUnavailable: "Mobile app only",
    pushDenied: "Not allowed",
    pushRegistered: "FCM active"
  }
} satisfies Record<SupportedLocale, Record<string, string>>;

export function t(locale: SupportedLocale, key: keyof (typeof messages)["de-DE"]): string {
  return messages[locale][key];
}
