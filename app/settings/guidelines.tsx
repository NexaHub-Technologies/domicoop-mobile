import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { BackButton } from "@/components/auth/BackButton";
import { Button } from "@/components/common/Button";
import { useTheme } from "@/contexts/ThemeContext";
import type { lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { onboarding } from "@/lib/onboarding";

const GUIDELINES = [
  {
    id: 1,
    text: "Registration fee is ₦20,000, compulsory for new intake (non-refundable).",
  },
  {
    id: 2,
    text: "No payment through USSD/POS.",
  },
  {
    id: 3,
    text: "No third-party payment (another person's account).",
  },
  {
    id: 4,
    text: "Your payment should carry the name you used in your registration.",
  },
  {
    id: 5,
    text: "Compulsory payment of ₦1,000 together with your subscription (₦1,000 for socials/end-of-year souvenir).",
  },
  {
    id: 6,
    text: "We have a cooperative wrapper with a cost of ₦6,000, which will be paid together with the registration fee.",
  },
  {
    id: 7,
    text: "The least payment is ₦5,000.",
  },
  {
    id: 8,
    text: "Any payment above ₦50,000 will be posted to your deposit column.",
  },
  {
    id: 9,
    text: "No random payment like ₦12,000, ₦18,000, ₦22,000.",
  },
  {
    id: 10,
    text: "If you want to exit the cooperative, you must give 6 months' notice with a written letter.",
  },
  {
    id: 11,
    text: "If you want to increase your contribution, you should write to the cooperative informing them of your increase through the chairperson.",
  },
  {
    id: 12,
    text: "As a new member, if you fail to pay your dues for at least 3 months, you are automatically on your way to withdrawal at the end of the year.",
  },
  {
    id: 13,
    text: "Consistent payment for 6 months qualifies you for a loan of 3 times what you have, at an interest rate of 10%, repayable within one year.",
  },
  {
    id: 14,
    text: "Once you are on loan and repaying as agreed, you are entitled to sign for one person as a guarantor.",
  },
  {
    id: 15,
    text: "If you are not intending to collect a loan, you can sign for two persons.",
  },
  {
    id: 16,
    text: "If you guarantee someone and the person defaults, your money will be held until that person pays.",
  },
  {
    id: 17,
    text: "If you guarantee someone and the person is not repaying as agreed, at the end of the year your dividend will be placed on hold, and by the end of the first quarter of the following year the cooperative will draw from your assets. (Know who you are signing for very well.)",
  },
  {
    id: 18,
    text: "Guarantee only someone you are sure of.",
  },
  {
    id: 19,
    text: "Your guarantor must be in the cooperative.",
  },
  {
    id: 20,
    text: "To resolve issues with your account caused by wrong payment (POS or third-party account), you will pay a fee of ₦5,000.",
  },
  {
    id: 21,
    text: "There is a late payment fee of ₦500.",
  },
  {
    id: 22,
    text: "For any issues relating to loans, cloth, purchasing of items, etc., go to the office.",
  },
  {
    id: 23,
    text: "After filling your form, submit it back to the office.",
  },
  {
    id: 24,
    text: "At the end of the year, your dividend for the year will be paid.",
  },
  {
    id: 25,
    text: "Meetings are held quarterly (every 3 months).",
  },
  {
    id: 26,
    text: "The WhatsApp group is for cooperative matters only. Anything unrelated to cooperative matters may result in removal from the group.",
  },
  {
    id: 27,
    text: "If you fail to pay your foodstuff balance by the 4th month, the money will be deducted from your share capital.",
  },
  {
    id: 28,
    text: "Your share capital will determine your foodstuff buying.",
  },
  {
    id: 29,
    text: "From 2027, the loan interest increases to 15%.",
  },
  {
    id: 30,
    text: "From 2027, a ₦2,000 fee is attached to late payment of subscription.",
  },
  {
    id: 31,
    text: "The maximum loan given to members is ₦10 million, even if you qualify for more.",
  },
  {
    id: 32,
    text: "If you are collecting from your savings, you can withdraw 70% with one month's notice.",
  },
  {
    id: 33,
    text: "If you are collecting from your deposit, you must write to the cooperative with one month's notice.",
  },
  {
    id: 34,
    text: "From 2027, the loan form costs ₦2,000.",
  },
  {
    id: 35,
    text: "If you do not subscribe for 3 months, your money will be returned to you at the end of the year, except if you apply for withdrawal in the middle of the year.",
  },
];

export default function GuidelinesScreen() {
  const router = useRouter();
  const { context } = useLocalSearchParams<{ context?: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  const isOnboarding = context === "onboarding";
  const [agreed, setAgreed] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    onboarding.markGuidelinesSeen().catch(() => {});
    router.push("/welcome");
  };

  const renderGuideline = ({ item }: { item: (typeof GUIDELINES)[number] }) => (
    <View style={styles.guidelineItem}>
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{item.id}</Text>
      </View>
      <Text style={styles.guidelineText}>{item.text}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.screenTitle}>Cooperative Guidelines</Text>
      <Text style={styles.introText}>
        Good day our intending cooperator. You are welcome to Dominion
        Cooperative Society. Our office number is No. 75 Jack Novo Plaza, Water
        Resources, Effurun Sapele Road, Effurun.
      </Text>
      <Text style={styles.introSubtext}>
        In this cooperative we have some rules and regulations that govern the
        body. Few are outlined for the purpose of this meeting.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View
        style={[
          styles.topHeader,
          { top: insets.top + theme.spacing.lg },
        ]}
      >
        <BackButton onPress={handleBack} />
      </View>

      {/* Guidelines List */}
      <FlatList
        data={GUIDELINES}
        renderItem={renderGuideline}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 72 },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Sticky Footer - only during onboarding */}
      {isOnboarding && (
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + theme.spacing["2xl"] },
          ]}
        >
          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && (
                <MaterialIcons
                  name="check"
                  size={16}
                  color={colors.onPrimary}
                />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I have read and agree to the cooperative guidelines
            </Text>
          </TouchableOpacity>

          {/* Continue Button */}
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!agreed}
            icon="arrow-forward"
          />
        </View>
      )}
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
      marginBottom: theme.spacing.lg,
    },
    introText: {
      fontFamily: font("body", "medium"),
      fontSize: theme.typography.size.base,
      color: colors.onSurfaceVariant,
      lineHeight:
        theme.typography.size.base * theme.typography.lineHeight.relaxed,
      marginBottom: theme.spacing.base,
    },
    introSubtext: {
      fontFamily: font("body", "medium"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
      lineHeight:
        theme.typography.size.sm * theme.typography.lineHeight.relaxed,
    },
    guidelineItem: {
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
    guidelineText: {
      flex: 1,
      fontFamily: font("body", "regular"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurface,
      lineHeight:
        theme.typography.size.sm * theme.typography.lineHeight.relaxed,
    },
    footer: {
      paddingHorizontal: theme.spacing["2xl"],
      paddingTop: theme.spacing.lg,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.base,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 2,
      borderColor: colors.outline,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surfaceContainerLowest,
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkboxLabel: {
      flex: 1,
      fontFamily: font("body", "medium"),
      fontSize: theme.typography.size.sm,
      color: colors.onSurfaceVariant,
    },
  });
