import { Globe2, LogIn, LogOut, MapPinned, ShieldCheck, UserRound } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import type { GeographicScope, Profile, SupportedLocale } from "@openpolitics/shared";
import { toSlug } from "@openpolitics/shared";
import { useEffect, useMemo, useState } from "react";
import { completeOnboarding, getHealth, getMe, listCountries, listRegions, savePushToken } from "./lib/api";
import { supabase } from "./lib/supabase";
import { registerForPushNotifications } from "./lib/pushNotifications";
import { t } from "./i18n";
import { webConfig } from "./config";

type ApiStatus = "checking" | "online" | "offline";
type PushStatus = "unavailable" | "denied" | "registered";

export function App() {
  const [locale, setLocale] = useState<SupportedLocale>("de-DE");
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [countries, setCountries] = useState<GeographicScope[]>([]);
  const [regions, setRegions] = useState<GeographicScope[]>([]);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [pushStatus, setPushStatus] = useState<PushStatus>("unavailable");
  const [message, setMessage] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [countryScopeId, setCountryScopeId] = useState("");
  const [regionScopeId, setRegionScopeId] = useState("");

  const selectedCountry = useMemo(
    () => countries.find((country) => country.id === countryScopeId),
    [countries, countryScopeId]
  );

  useEffect(() => {
    void getHealth()
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));

    void listCountries().then(({ data }) => {
      setCountries(data);
      const germany = data.find((scope) => scope.countryCode === "DE");
      if (germany) {
        setCountryScopeId(germany.id);
      }
    });

    void supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedCountry) {
      return;
    }

    void listRegions(selectedCountry.countryCode).then(({ data }) => setRegions(data));
  }, [selectedCountry]);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setPushStatus("unavailable");
      return;
    }

    void registerForPushNotifications()
      .then(async (result) => {
        setPushStatus(result.status);
        if (result.status === "registered") {
          await savePushToken(session.access_token, {
            token: result.token,
            platform: result.platform,
            appVersion: import.meta.env.VITE_APP_VERSION ?? null
          });
        }
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Push registration failed"));

    void getMe(session.access_token)
      .then(({ data }) => {
        setProfile(data);
        if (data) {
          setDisplayName(data.displayName);
          setSlug(data.slug);
          setBio(data.bio ?? "");
          setLocale(data.locale);
          setCountryScopeId(data.countryScopeId ?? countryScopeId);
          setRegionScopeId(data.regionScopeId ?? "");
        } else {
          const name = session.user.user_metadata.name ?? session.user.email?.split("@")[0] ?? "";
          setDisplayName(name);
          setSlug(toSlug(name));
        }
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Profile load failed"));
  }, [session]);

  const pushStatusLabel =
    pushStatus === "registered" ? t(locale, "pushRegistered") : pushStatus === "denied" ? t(locale, "pushDenied") : t(locale, "pushUnavailable");

  async function signInWithGoogle() {
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      setMessage(error.message);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  async function submitOnboarding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    const result = await completeOnboarding(session.access_token, {
      displayName,
      slug,
      bio: bio || null,
      locale,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      countryScopeId,
      regionScopeId: regionScopeId || null,
      privacy: { profileVisibility: "public" }
    });

    setProfile(result.data);
    setMessage(t(locale, "profileReady"));
  }

  return (
    <main className="min-h-screen bg-field text-ink">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-line bg-white/80 px-5 py-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded bg-civic text-white">
              <Globe2 aria-hidden="true" size={22} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-normal">{t(locale, "shellTitle")}</h1>
              <p className="text-sm text-ink/65">dev</p>
            </div>
          </div>

          <nav className="mt-8 grid gap-2" aria-label="Primary">
            <a className="flex h-10 items-center gap-3 rounded border border-line bg-mint px-3 text-sm font-medium" href="#overview">
              <ShieldCheck aria-hidden="true" size={18} />
              {t(locale, "navOverview")}
            </a>
            <a className="flex h-10 items-center gap-3 rounded px-3 text-sm font-medium hover:bg-field" href="#profile">
              <UserRound aria-hidden="true" size={18} />
              {t(locale, "navProfile")}
            </a>
          </nav>

          <div className="mt-8 flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${apiStatus === "online" ? "bg-civic" : "bg-action"}`} />
            {apiStatus === "online" ? t(locale, "statusOnline") : t(locale, "statusOffline")}
          </div>
        </aside>

        <section className="px-5 py-5 md:px-8">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="text-sm text-ink/65">{t(locale, "shellSubtitle")}</p>
              <p className="mt-1 text-xs text-ink/55">{webConfig.supabaseUrl}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="h-10 rounded border border-line bg-white px-3 text-sm"
                value={locale}
                onChange={(event) => setLocale(event.target.value as SupportedLocale)}
                aria-label={t(locale, "locale")}
              >
                <option value="de-DE">DE</option>
                <option value="en-US">EN</option>
              </select>
              {session ? (
                <button className="icon-button" type="button" onClick={signOut} title={t(locale, "signOut")}>
                  <LogOut aria-hidden="true" size={18} />
                </button>
              ) : (
                <button className="primary-button" type="button" onClick={signInWithGoogle}>
                  <LogIn aria-hidden="true" size={18} />
                  {t(locale, "signIn")}
                </button>
              )}
            </div>
          </header>

          <div id="overview" className="mt-6 grid gap-4 md:grid-cols-3">
            <StatusTile label="Auth" value={session ? "Session" : "Guest"} />
            <StatusTile label="Profile" value={profile ? t(locale, "profileReady") : t(locale, "noProfile")} />
            <StatusTile label={t(locale, "pushStatus")} value={pushStatusLabel} />
          </div>

          <section id="profile" className="mt-8 max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <MapPinned aria-hidden="true" size={22} />
              <div>
                <h2 className="text-xl font-semibold">{t(locale, "onboardingTitle")}</h2>
                <p className="text-sm text-ink/65">{session ? t(locale, "onboardingIntro") : t(locale, "authRequired")}</p>
              </div>
            </div>

            {message ? <div className="mb-4 rounded border border-line bg-white px-4 py-3 text-sm">{message}</div> : null}

            <form className="grid gap-4" onSubmit={submitOnboarding} data-component="onboarding-form">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t(locale, "displayName")}>
                  <input
                    className="input"
                    value={displayName}
                    disabled={!session}
                    onChange={(event) => {
                      setDisplayName(event.target.value);
                      if (!profile) {
                        setSlug(toSlug(event.target.value));
                      }
                    }}
                  />
                </Field>
                <Field label={t(locale, "slug")}>
                  <input className="input" value={slug} disabled={!session} onChange={(event) => setSlug(toSlug(event.target.value))} />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t(locale, "country")}>
                  <select className="input" value={countryScopeId} disabled={!session} onChange={(event) => setCountryScopeId(event.target.value)}>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.localName ?? country.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t(locale, "region")}>
                  <select className="input" value={regionScopeId} disabled={!session} onChange={(event) => setRegionScopeId(event.target.value)}>
                    <option value="">-</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.localName ?? region.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label={t(locale, "bio")}>
                <textarea className="input min-h-28 resize-y" value={bio} disabled={!session} onChange={(event) => setBio(event.target.value)} />
              </Field>

              <button className="primary-button w-fit" type="submit" disabled={!session}>
                <ShieldCheck aria-hidden="true" size={18} />
                {t(locale, "complete")}
              </button>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-white p-4" data-component="status-tile">
      <p className="text-xs font-medium uppercase text-ink/55">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}
