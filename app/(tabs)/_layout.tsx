import { Tabs } from "expo-router";
import { TabBar } from "@/components/tabs/TabBar";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function TabLayout() {
  // Tabs only render post-login, so this requests notification permission
  // after sign-in and registers the device token with a valid session.
  usePushNotifications();

  return (
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
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
