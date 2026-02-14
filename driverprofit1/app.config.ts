// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

// Bundle ID format: space.manus.<project_name_dots>.<timestamp>
// e.g., "my-app" created at 2024-01-15 10:30:45 -> "space.manus.my.app.t20240115103045"
// Bundle ID can only contain letters, numbers, and dots
// Android requires each dot-separated segment to start with a letter
const rawBundleId = "space.manus.driverprofit.t20260213182747";
const bundleId =
  rawBundleId
    .replace(/[-_]/g, ".") // Replace hyphens/underscores with dots
    .replace(/[^a-zA-Z0-9.]/g, "") // Remove invalid chars
    .replace(/\.+/g, ".") // Collapse consecutive dots
    .replace(/^\.+|\.+$/g, "") // Trim leading/trailing dots
    .toLowerCase()
    .split(".")
    .map((segment) => {
      // Android requires each segment to start with a letter
      // Prefix with 'x' if segment starts with a digit
      return /^[a-zA-Z]/.test(segment) ? segment : "x" + segment;
    })
    .join(".") || "space.manus.app";
// Extract timestamp from bundle ID and prefix with "manus" for deep link scheme
// e.g., "space.manus.my.app.t20240115103045" -> "manus20240115103045"
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  // App branding - update these values directly (do not use env vars)
  appName: "DriverProfit",
  appSlug: "{{project_name}}",
  // S3 URL of the app logo - set this to the URL returned by generate_image when creating custom logo
  // Leave empty to use the default icon from assets/images/icon.png
  logoUrl: "https://private-us-east-1.manuscdn.com/sessionFile/Zm7BF5pM58Z0LvzpsDyMf3/sandbox/7OgoQElgeoS6bRa1xOxqCh-img-1_1771025557000_na1fn_ZHJpdmVycHJvZml0LWxvZ28.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWm03QkY1cE01OFowTHZ6cHNEeU1mMy9zYW5kYm94LzdPZ29RRWxnZW9TNmJSYTF4T3hxQ2gtaW1nLTFfMTc3MTAyNTU1NzAwMF9uYTFmbl9aSEpwZG1WeWNISnZabWwwTFd4dloyOC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=tX7PQ9PNHkVW1SdDilLYebHb1LlUGIeiZwnNxktAvA5~nW~qfAVZ9lkadKSivhhmt-OcSrn4hdcsG36XhHRJjwUg71wo0OUXvm5nF~H3DewjN08I7b3PSd37smTS8ZNkk3fSGqalu-cPOwPY~qDZ~uS~jw69ddPWC4itUp9LzqNpZu-tuJ4EJCePXoUdlb2tq-hQycBQyBmCMud1-lTJL1b9qnQZ~RyxHtHNDiy5HJVUzlY47reVAFVOm59KP4q33GXV~lZlGlqEEaOvmklcdNuebgMkgqWdfTsOWU7mhCemAVznhkzTKdnHMUytdE2CAVl4IBC~lzgtMkYFJe5fFQ__",
  scheme: schemeFromBundleId,
  iosBundleId: bundleId,
  androidPackage: bundleId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    permissions: ["POST_NOTIFICATIONS"],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermission": "O DriverProfit precisa acessar sua localização para rastrear a distância percorrida durante seus turnos.",
        "locationWhenInUsePermission": "O DriverProfit precisa acessar sua localização para rastrear a distância percorrida.",
        "isIosBackgroundLocationEnabled": true,
        "isAndroidBackgroundLocationEnabled": true,
        "isAndroidForegroundServiceEnabled": true
      }
    ],
    "expo-task-manager",
    [
      "expo-audio",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          minSdkVersion: 24,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
