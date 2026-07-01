import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { LoanSummaryStats } from "@/components/loans/LoanSummaryStats";
import { LoanCard } from "@/components/loans/LoanCard";
import { InsightsCard } from "@/components/loans/InsightsCard";
import { mockLoans } from "@/data/mockData";
import { useTheme, lightColors } from "@/contexts/ThemeContext";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function LoansScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  const scale = useSharedValue(1);
  const { colors, isDarkMode } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleApplyForLoan = () => {
    router.push("/transactions/apply-for-loan");
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  // Dynamic styles based on theme
  const dynamicStyles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={[dynamicStyles.container]} edges={["top"]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={dynamicStyles.header}>
        <View style={dynamicStyles.headerContent}>
          <View style={dynamicStyles.backButton} />
          <Text style={[dynamicStyles.headerTitle, { color: colors.primary }]}>
            Loans
          </Text>
          <View style={dynamicStyles.backButton} />
        </View>
      </Animated.View>

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
        {/* Summary Stats */}
        <LoanSummaryStats />

        {/* Apply for New Loan Button */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <AnimatedTouchable
            onPress={handleApplyForLoan}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[dynamicStyles.applyButton, animatedStyle]}
            activeOpacity={0.8}
          >
            <View style={dynamicStyles.applyButtonContent}>
              <View style={dynamicStyles.applyIconContainer}>
                <MaterialIcons name="add-circle" size={28} color={colors.onPrimary} />
              </View>
              <View style={dynamicStyles.applyTextContainer}>
                <Text style={dynamicStyles.applyButtonTitle}>Apply for New Loan</Text>
                <Text style={dynamicStyles.applyButtonSubtitle}>
                  Instant approval for qualified members
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.onPrimary} />
          </AnimatedTouchable>
        </Animated.View>

        {/* Active Loans Section */}
        <View style={dynamicStyles.sectionHeader}>
          <Animated.Text entering={FadeIn.delay(300)} style={dynamicStyles.sectionTitle}>
            Active Loans
          </Animated.Text>
          <TouchableOpacity>
            <Text style={dynamicStyles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Loan Cards */}
        <View style={dynamicStyles.loansList}>
          {mockLoans.map((loan, index) => (
            <LoanCard key={loan.id} loan={loan} index={index} />
          ))}
        </View>

        {/* Insights Card */}
        <InsightsCard />

        {/* Bottom padding for tab bar */}
        <SafeAreaView edges={["bottom"]} style={dynamicStyles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.base,
    },
    backButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      minWidth: 44,
    },
    headerTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: theme.spacing.lg,
    },
    applyButton: {
      backgroundColor: colors.primary,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    applyButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.base,
    },
    applyIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${colors.onPrimary}33`,
      alignItems: "center",
      justifyContent: "center",
    },
    applyTextContainer: {
      gap: 2,
    },
    applyButtonTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      color: colors.onPrimary,
    },
    applyButtonSubtitle: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: `${colors.onPrimary}90`,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.base,
    },
    sectionTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onSurface,
    },
    viewAllText: {
      fontFamily: font("body", "semibold"),
      fontSize: typography.size.sm,
      color: colors.primary,
    },
    loansList: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    bottomPadding: {
      height: 100,
    },
  });
