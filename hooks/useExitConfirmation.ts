import { useCallback, useState } from "react";
import { BackHandler, Platform } from "react-native";
import { useFocusEffect } from "expo-router";
import { useLogout } from "@/hooks/useLogout";

/**
 * Intercepts the Android hardware/gesture back action while the screen is
 * focused and surfaces an exit confirmation instead of leaving the app. Meant
 * for the root dashboard, where pressing back again would otherwise close the
 * app outright. Confirming logs the user out and returns them to the sign-in
 * screen.
 *
 * Returns the visibility flag plus confirm/cancel handlers to drive a
 * ConfirmationModal. On iOS this is a no-op — there is no back button to
 * intercept.
 */
export function useExitConfirmation() {
  const [isVisible, setIsVisible] = useState(false);
  const logout = useLogout();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;

      const onBackPress = () => {
        setIsVisible(true);
        return true; // prevent the default back action
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  const cancel = useCallback(() => setIsVisible(false), []);

  const confirm = useCallback(async () => {
    setIsVisible(false);
    await logout();
  }, [logout]);

  return { isVisible, confirm, cancel };
}
