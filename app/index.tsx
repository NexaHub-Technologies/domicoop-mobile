import { useEffect, useState } from "react";
import { View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Redirect, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { session } from "@/lib/session";
import { onboarding } from "@/lib/onboarding";

export default function Index() {
  const { isDarkMode, colors } = useTheme();
  const [target, setTarget] = useState<Href | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolveRoute = async (): Promise<Href> => {
      if (await session.isValid()) return "/(tabs)";

      // A token past its idle window means an expired session: clear it and
      // send the returning user straight to sign-in, skipping onboarding.
      if (await session.getToken()) {
        await session.clearTokens();
        return "/(auth)/sign-in";
      }

      const seenGuidelines = await onboarding.hasSeenGuidelines();
      return seenGuidelines ? "/(auth)/welcome" : "/(auth)/splash";
    };

    resolveRoute()
      .catch((): Href => "/(auth)/splash")
      .then((href) => {
        if (!cancelled) setTarget(href);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      {target ? (
        <Redirect href={target} />
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.background }} />
      )}
    </>
  );
}
