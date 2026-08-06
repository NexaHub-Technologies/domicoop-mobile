import { useEffect, useState } from "react";
import { View } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { TabBar } from "@/components/tabs/TabBar";
import { GuidelinesGate } from "@/components/modals/GuidelinesGate";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useTheme } from "@/contexts/ThemeContext";
import { session } from "@/lib/session";

type GateState = "checking" | "needed" | "satisfied";

export default function TabLayout() {
  // Tabs only render post-login, so this requests notification permission
  // after sign-in and registers the device token with a valid session.
  usePushNotifications();

  const router = useRouter();
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const [gateState, setGateState] = useState<GateState>("checking");

  useEffect(() => {
    let cancelled = false;
    session.isGuidelinesAcknowledged().then((acknowledged) => {
      if (!cancelled) setGateState(acknowledged ? "satisfied" : "needed");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (gateState === "checking") {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="loans"
          options={{
            title: "Loans",
          }}
        />
        <Tabs.Screen
          name="contributions"
          options={{
            title: "Contributions",
          }}
        />
        <Tabs.Screen
          name="announcements"
          options={{
            title: "Announcements",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>

      <GuidelinesGate
        visible={gateState === "needed" && isFocused}
        onAcknowledge={() => {
          session.acknowledgeGuidelines().catch(() => {});
          setGateState("satisfied");
        }}
        onViewFull={() => router.push("/settings/guidelines")}
      />
    </>
  );
}
