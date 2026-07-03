import AsyncStorage from "@react-native-async-storage/async-storage";

const HAS_SEEN_GUIDELINES_KEY = "has_seen_guidelines";

// First-run onboarding state. Deliberately survives logout — a returning user
// who agreed to the guidelines once should never be routed through them again.
export const onboarding = {
  hasSeenGuidelines: async (): Promise<boolean> => {
    return (await AsyncStorage.getItem(HAS_SEEN_GUIDELINES_KEY)) === "true";
  },

  markGuidelinesSeen: async (): Promise<void> => {
    await AsyncStorage.setItem(HAS_SEEN_GUIDELINES_KEY, "true");
  },
};
