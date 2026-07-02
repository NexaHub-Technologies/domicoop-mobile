# Expo Push Notifications — FCM Credentials Setup (Android)

How to wire the two Firebase files an Expo (dev-client / EAS) app needs for
Android push, so that local builds, EAS cloud builds, and git all stay happy.
Written from the DOMICOP setup; every step is reusable for any project.

## The two files (don't confuse them)

| File | What it is | Where it lives | In the APK? | In git? |
|---|---|---|---|---|
| `google-services.json` | **Client config** for your Android app (project id, app id, API key) | Repo root locally + EAS secret file var | **Yes** — compiled in by the Google Services Gradle plugin | No (gitignored) |
| `<project>-firebase-adminsdk-<id>.json` | **Admin SDK service-account key** — a server credential with a private key | Uploaded once to Expo via `eas credentials`; keep a copy somewhere safe *outside* the repo | **Never** | **Never** |

The service-account key is what Expo's push service uses to talk to FCM when
*sending*. The client config is what the app needs to *receive*. Neither
belongs in git.

## 1. Firebase project + client config

1. [Firebase Console](https://console.firebase.google.com) → **Add project** (e.g. `myapp-fcm`).
2. Project settings (⚙️) → **General** → *Your apps* → **Add app → Android**.
3. Package name must exactly match `android.package` in `app.config.js` (e.g. `com.nexahub.domicop`).
4. Download **`google-services.json`** into the **repo root**.
5. Gitignore it:
   ```gitignore
   google-services.json
   *firebase-adminsdk*.json
   ```

## 2. FCM V1 service-account key → Expo

1. Project settings → **Service accounts** → **Generate new private key**.
   This downloads `<project>-firebase-adminsdk-<id>.json`.
2. Upload it to Expo (one-time, per project):
   ```bash
   eas credentials
   # → Android → (your build profile)
   # → Google Service Account → Manage your Google Service Account Key for
   #   Push Notifications (FCM V1) → Set up → select the downloaded file
   ```
3. Done — Expo stores it server-side. Sends from `exp.host/--/api/v2/push/send`
   (and the [expo.dev/notifications](https://expo.dev/notifications) test tool)
   will now reach Android devices. Without this step you still *get* a push
   token, but every send fails with an FCM credentials error.

## 3. app.config.js — one path that works locally and on EAS

```js
const fs = require("fs");

// EAS materializes the secret file and sets the env var to its PATH;
// locally we fall back to the file on disk. Absent → prebuild still works.
const googleServicesFile =
  process.env.GOOGLE_SERVICES_JSON ??
  (fs.existsSync("./google-services.json") ? "./google-services.json" : undefined);

module.exports = {
  expo: {
    android: {
      package: "com.example.myapp",
      googleServicesFile,
    },
    plugins: [
      ["expo-notifications", { icon: "./assets/notification-icon.png", color: "#003cad", defaultChannel: "default" }],
    ],
  },
};
```

## 4. Make the file available to EAS cloud builds

Git carries neither file, and EAS uploads your project *respecting*
`.gitignore` — so cloud builds won't see `google-services.json` unless you
provide it as a **file-type environment variable**:

```bash
eas env:create --scope project \
  --name GOOGLE_SERVICES_JSON \
  --type file \
  --value ./google-services.json \
  --environment development --environment preview --environment production \
  --visibility secret --non-interactive
```

How it works: `--type file` uploads the file's **contents** (encrypted) to
EAS. At build time, EAS writes them to a temp file on the builder and sets
`GOOGLE_SERVICES_JSON` to that **path** — which is exactly what the
`app.config.js` snippet above consumes. A plain string variable would hold the
JSON blob itself and be useless for `googleServicesFile`, which expects a path.

Verify: `eas env:list production` should show `GOOGLE_SERVICES_JSON=*****`.

## 5. Rebuild — native changes never hot-reload

`google-services.json` is compiled into the APK by a Gradle plugin that the
Expo config plugin only wires in **during prebuild**. So after adding the file
(or installing `expo-notifications`):

```bash
npx expo prebuild --platform android --clean   # regenerates android/ with the Gradle wiring
npx expo run:android                           # compiles + installs the new binary
```

Metro/JS reloads change nothing here. If you see at runtime:

> `Default FirebaseApp is not initialized in this process <package>`

it means the *installed binary* predates the Firebase wiring. Check that
`android/app/google-services.json` exists and `android/app/build.gradle` ends
with `apply plugin: 'com.google.gms.google-services'` — if not, the file
wasn't on disk (or the env var wasn't set) when prebuild last ran. Re-run both
commands above.

## 6. Verify end-to-end (no backend needed)

1. Fresh build on a **physical device** (emulators never get push tokens).
2. Launch, sign in, grant the notification permission.
3. Grab the logged `ExponentPushToken[...]` from the Metro console.
4. Go to <https://expo.dev/notifications>, paste the token, send a message
   with JSON data like `{ "url": "/notifications" }`.
5. Expect: banner in foreground, tray notification in background, and
   tap-to-navigate to the `data.url` route (including from a killed app).

## Checklist for a new project

- [ ] Firebase project created; Android app registered with the exact package name
- [ ] `google-services.json` in repo root; both Firebase files gitignored
- [ ] Admin SDK key uploaded via `eas credentials` (FCM V1), then stored outside the repo
- [ ] `app.config.js` uses the env-var-or-disk `googleServicesFile` pattern
- [ ] `eas env:create --type file` for `GOOGLE_SERVICES_JSON` across environments
- [ ] `expo prebuild --clean` + `expo run:android` (or `eas build`) after any of the above
- [ ] Test send from expo.dev/notifications on a physical device
