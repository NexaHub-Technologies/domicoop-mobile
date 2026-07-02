import React, { useState, useCallback } from "react";
import { ScrollView, StyleSheet, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SettingsSection } from "@/components/profile/SettingsSection";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/contexts/ThemeContext";
import { auth } from "@/lib/api/auth.api";
import { notificationsApi } from "@/lib/api/notifications.api";
import { PUSH_TOKEN_KEY } from "@/lib/notifications";
import { NOTIFICATIONS_CACHE_KEY } from "@/hooks/useNotifications";
import { useProfile } from "@/hooks/useProfile";

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isPending, isRefetching, refetch } = useProfile();
  const profile = data ?? null;
  const isLoading = isPending;
  const refreshing = isRefetching;
  const { colors, isDarkMode } = useTheme();

  // Modal states
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    // Best-effort push unregister — never blocks logout.
    try {
      const pushToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (pushToken) {
        notificationsApi.unregisterDevice(pushToken).catch(() => {});
      }
    } catch {
      // ignore
    }
    try {
      await auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    // Drop all cached data so the next account doesn't see this one's.
    queryClient.clear();
    AsyncStorage.multiRemove([PUSH_TOKEN_KEY, NOTIFICATIONS_CACHE_KEY]).catch(() => {});
    router.replace("/sign-in");
  };

  const confirmDeleteAccount = () => {
    setShowDeleteModal(false);
    setTimeout(() => {
      router.replace("/sign-in");
    }, 500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Fixed Header */}
      <ProfileHeader profile={profile} isLoading={isLoading} />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Settings Sections */}
        <SettingsSection onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />

        {/* Bottom padding for tab bar */}
        <SafeAreaView edges={["bottom"]} style={styles.bottomPadding} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        title="Log Out"
        message="Are you sure you want to log out? You'll need to sign in again to access your account."
        confirmText="Log Out"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        isDestructive={false}
      />

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Account"
        message="This action cannot be undone. All your data, including loans, savings, and transaction history will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        isDestructive={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  bottomPadding: {
    height: 100, // Extra space for tab bar
  },
});
