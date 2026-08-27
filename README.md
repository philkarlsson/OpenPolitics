# OpenPolitics

OpenPolitics uses Firebase/GCP for app infrastructure and Supabase for the initial PostgreSQL/Auth stack.

## Cloud Projects

- Firebase/GCP project: `openpolitics-20260825`
- Firebase Android app id: `1:935189180004:android:c5fba11503b95bfccc3971`
- Android application id: `com.communityproject.openpolitics`
- Supabase project ref: `hmwlmfpbkojnuolavcoj`
- Supabase URL: `https://hmwlmfpbkojnuolavcoj.supabase.co`
- Supabase region: `eu-west-1`

## Local Setup

Install dependencies:

```bash
npm install
```

Start the local Supabase stack:

```bash
npm run supabase:start
```

Run the API and web app together:

```bash
npm run dev
```

Run against the hosted Supabase project, including the configured Google Auth provider:

```bash
npm run dev:hosted
```

Check local Supabase status:

```bash
npm run supabase:status
```

Local Supabase runs on non-default ports so it can coexist with other local Supabase projects:

- API: `http://127.0.0.1:54331`
- Database: `postgresql://postgres:postgres@127.0.0.1:54332/postgres`
- Studio: `http://127.0.0.1:54333`
- Mailpit: `http://127.0.0.1:54334`

Link the local Supabase config to the hosted project after logging in with the Supabase CLI or setting `SUPABASE_ACCESS_TOKEN`:

```bash
npm run supabase:link
```

## Environment

Copy `.env.example` to your local environment file and fill the missing values from the Firebase, Google Cloud and Supabase dashboards. Do not commit real secrets.

Google Auth for Supabase is prepared in `supabase/config.toml`, but still needs a Google OAuth client ID and secret.

## Project Structure

- `apps/api`: Express API with health, geography, authenticated profile and onboarding routes.
- `apps/web`: React, Vite and Tailwind application shell.
- `packages/shared`: shared validation schemas, DTOs, locales and helpers.
- `supabase`: local Supabase config, migrations, seeds and generated database types.
- `android`: Capacitor Android shell.

## Verification

```bash
npm run typecheck
npm run test
npm run build
npm run mobile:sync
```

Android debug builds need a JDK 21 with `javac`. On this machine the working JDK is Amazon Corretto:
Use `ANDROID_JAVA_HOME` to override it if needed.

```bash
npm run mobile:android:debug
```

## FCM and Android Release

Firebase Cloud Messaging is wired through Capacitor Push Notifications and the Android Firebase app
`com.communityproject.openpolitics`. The Android build expects `android/app/google-services.json` to exist.

Build a release App Bundle locally:

```bash
OP_VERSION_CODE=1 \
OP_VERSION_NAME=1.0 \
ANDROID_KEYSTORE_PATH=upload-keystore.jks \
ANDROID_KEYSTORE_PASSWORD=... \
ANDROID_KEY_ALIAS=openpolitics-upload \
ANDROID_KEY_PASSWORD=... \
npm run mobile:android:release
```

The Play publishing workflow is `.github/workflows/android-play.yml`. Configure these GitHub secrets before running it:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

Configure these GitHub variables for production builds:

- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Google Play Console still has to contain the app with package name `com.communityproject.openpolitics`.
Grant the service account access to that app and run the workflow to upload the signed AAB to the internal track.
