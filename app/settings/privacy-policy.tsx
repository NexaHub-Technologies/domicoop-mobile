import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BackButton } from "@/components/auth/BackButton";
import { useTheme } from "@/contexts/ThemeContext";
import type { lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";

const PRIVACY_SECTIONS = [
  {
    id: 1,
    title: "What we collect",
    text: "To run the society's ledger we collect your name, contact details, member number and the records of your contributions, loans and dividends. We collect only what the service needs — nothing more.",
  },
  {
    id: 2,
    title: "How we use it",
    text: "Your information is used to operate your membership of Dominion Co-operative: posting contributions, processing loan applications and disbursements, calculating dividends, and keeping you and the society's administrators informed.",
  },
  {
    id: 3,
    title: "Payments",
    text: "Payments are processed by Paystack, a PCI-DSS compliant provider. We do not store your card details. We record only that a payment was made so it can be posted to your passbook.",
  },
  {
    id: 4,
    title: "How we protect it",
    text: "Data is encrypted in transit, passwords are stored only as salted hashes, and administrator access is role-based.",
  },
  {
    id: 5,
    title: "We don't sell your data",
    text: "Your membership and financial records belong to you and to Dominion Co-operative. We do not sell them, and we share them only with the society's authorised administrators and the providers needed to run the service.",
  },
  {
    id: 6,
    title: "Your choices",
    text: "You can request a copy of your data or ask that your account be closed. Some records may be retained where the society's bye-laws or the law requires it.",
  },
  {
    id: 7,
    title: "Contact",
    text: "Questions about this policy? Reach us at domicorp14@gmail.com.",
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  const handleBack = () => {
    router.back();
  };

  const renderSection = ({
    item,
  }: {
    item: (typeof PRIVACY_SECTIONS)[number];
  }) => (
    <View style={styles.sectionItem}>
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{item.id}</Text>
      </View>
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>{item.title}</Text>
        <Text style={styles.sectionText}>{item.text}</Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.screenTitle}>Privacy Policy</Text>
      <Text style={styles.lastUpdated}>Last updated 3 July 2026</Text>
      <Text style={styles.introText}>
        We collect only what running the ledger requires, and we never sell your
        data.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topHeader,
          { top: insets.top + theme.spacing.lg },
        ]}
      >
        <BackButton onPress={handleBack} />
      </View>

      <FlatList
        data={PRIVACY_SECTIONS}
        renderItem={renderSection}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 72 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topHeader: {
      position: "absolute",
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: 10,
    },
    listContent: {
      paddingHorizontal: theme.spacing["2xl"],
      paddingBottom: theme.spacing.xl,
    },
    headerSection: {
      marginBottom: theme.spacing.xl,
    },
    screenTitle: {
      fontFamily: font("display", "bold"),
      fontSize: theme.typography.size["2xl"],
      color: colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    lastUpdated: {
      fontFamily: font("body", "medium"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
      marginBottom: theme.spacing.lg,
    },
    introText: {
      fontFamily: font("body", "medium"),
      fontSize: theme.typography.size.base,
      color: colors.onSurfaceVariant,
      lineHeight:
        theme.typography.size.base * theme.typography.lineHeight.relaxed,
    },
    sectionItem: {
      flexDirection: "row",
      backgroundColor: colors.surfaceContainer,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.base,
      gap: theme.spacing.base,
      alignItems: "flex-start",
    },
    numberBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    numberText: {
      fontFamily: font("display", "bold"),
      fontSize: theme.typography.size.xs,
      color: colors.onPrimary,
    },
    sectionContent: {
      flex: 1,
    },
    sectionTitle: {
      fontFamily: font("body", "semibold"),
      fontSize: theme.typography.size.base,
      color: colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    sectionText: {
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
      lineHeight:
        theme.typography.size.sm * theme.typography.lineHeight.relaxed,
    },
  });
