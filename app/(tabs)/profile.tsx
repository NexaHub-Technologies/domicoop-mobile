import React, { useState, useCallback } from "react";
import { ScrollView, StyleSheet, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SettingsSection } from "@/components/profile/SettingsSection";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { useProfile } from "@/hooks/useProfile";
import { useLogout } from "@/hooks/useLogout";

export default function ProfileScreen() {
  const router = useRouter();
  const logout = useLogout();
  const { data, isPending, isRefetching, refetch } = useProfile();
  const profile = data ?? null;
  const isLoading = isPending;
  const refreshing = isRefetching;
  const { colors, isDarkMode } = useTheme();
  const dynamicStyles = React.useMemo(() => createStyles(colors), [colors]);

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
    await logout();
  };

  const confirmDeleteAccount = () => {
    setShowDeleteModal(false);
    setTimeout(() => {
      router.replace("/sign-in");
    }, 500);
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={["top"]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Fixed Header */}
      <ProfileHeader profile={profile} isLoading={isLoading} />

      {/* Scrollable Content */}
      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
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
        <SafeAreaView edges={["bottom"]} style={dynamicStyles.bottomPadding} />
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

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
