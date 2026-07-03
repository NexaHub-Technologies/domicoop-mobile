import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { session } from "@/lib/session";
import { queryClient } from "@/lib/queryClient";

/**
 * Enforces the idle-session timeout when the app returns to the foreground.
 * If the user is inside the authenticated area and their session has expired,
 * tokens are cleared and they are sent back to sign-in.
 */
export function useSessionTimeout() {
  const router = useRouter();
  const segments = useSegments();
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state !== "active") return;
      if (segmentsRef.current[0] === "(auth)") return;

      const token = await session.getToken();
      if (!token || (await session.isValid())) return;

      await session.clearTokens();
      queryClient.clear();
      router.replace("/(auth)/sign-in");
    });

    return () => subscription.remove();
  }, [router]);
}
