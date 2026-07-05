const fs = require("fs");

// Required for push notifications on Android (FCM). Absent until the
// Firebase project is set up — prebuild keeps working without it.
const googleServicesFile =
  process.env.GOOGLE_SERVICES_JSON ??
  (fs.existsSync("./google-services.json") ? "./google-services.json" : undefined);

export default {
  expo: {
    name: process.env.APP_ENV === "production" ? "DOMICOOP" : "DOMICOOP (DEV)",
    slug: "domicoop",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: process.env.EXPO_PUBLIC_SCHEME || "domicoop",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier:
        process.env.APP_ENV === "production"
          ? "com.nexahub.domicoop"
          : "com.nexahub.domicoop-dev",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      versionCode: 2,
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.nexahub.domicoop",
      googleServicesFile: googleServicesFile,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/Inter-Regular.ttf",
            "./assets/fonts/Inter-Medium.ttf",
            "./assets/fonts/Inter-SemiBold.ttf",
            "./assets/fonts/Inter-Bold.ttf",
            "./assets/fonts/PlusJakartaSans-SemiBold.ttf",
            "./assets/fonts/PlusJakartaSans-Bold.ttf",
            "./assets/fonts/PlusJakartaSans-ExtraBold.ttf",
          ],
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#003cad",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-secure-store",
      [
        "expo-notifications",
        {
          icon: "./assets/images/android-icon-monochrome.png",
          color: "#003cad",
          defaultChannel: "default",
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: "2e673356-8e6c-4fa4-8042-aaae41d5f08d",
      },
      router: {},
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      paystackPublicKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY,
    },
    owner: "nexahub-technologies",
  },
};
