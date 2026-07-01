import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { typography } from "@/constants/typography";
import { createElevation } from "@/constants/theme";
import { ListItem } from "@/components/common/ListItem";
import { Money } from "@/components/common/Money";
import { Skeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/common/Button";
import {
  getTransactionIcon,
  formatDate,
  getDefaultTitle,
  type TransactionType,
} from "@/data/mockData";

export interface RecentTransaction {
  id: string;
  type: string;
  category: "savings" | "loan";
  title: string;
  amount: number;
  date: string;
  status: string;
}

interface TransactionListProps {
  transactions: RecentTransaction[];
  isLoading?: boolean;
  isOffline?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const getTransactionTint = (
  type: string,
  colors: typeof lightColors,
): string => {
  switch (type) {
    case "contribution":
    case "interest":
      return colors.success;
    case "loan_repayment":
    case "fee":
      return colors.primaryBright;
    case "withdrawal":
      return colors.onSurfaceVariant;
    default:
      return colors.onSurfaceVariant;
  }
};

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing["2xl"],
      paddingHorizontal: theme.spacing.base,
      marginBottom: theme.spacing["4xl"],
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xs,
    },
    sectionTitle: {
      ...typography.styles.sectionLabel,
      color: colors.onSurfaceVariant,
    },
    viewArchiveButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    viewArchiveText: {
      ...typography.styles.label,
      fontSize: typography.size.xs,
      color: colors.primaryBright,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    listCard: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius["2xl"],
      overflow: "hidden",
    },
    categoryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surfaceContainerLow,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    categoryLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    categoryDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    categoryText: {
      ...typography.styles.sectionLabel,
      fontSize: typography.size.xs - 2,
      color: colors.onSurfaceVariant,
    },
    seeAllText: {
      ...typography.styles.label,
      fontSize: typography.size.xs - 2,
      color: colors.primaryBright,
      textTransform: "uppercase",
    },
    seeAllButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    rowContainer: {
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    rowTrailing: {
      alignItems: "flex-end",
    },
    rowStatus: {
      ...typography.styles.caption,
      fontSize: typography.size.xs - 2,
      color: colors.onSurfaceVariant,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: 2,
    },
    offlineBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      backgroundColor: colors.surfaceContainer,
      marginBottom: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
      borderRadius: theme.borderRadius.lg,
    },
    offlineText: {
      ...typography.styles.bodySmall,
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    skeletonRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.base,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    skeletonText: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    errorContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing["3xl"],
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.base,
    },
    errorText: {
      ...typography.styles.bodyText,
      color: colors.error,
      textAlign: "center",
    },
  });

const SkeletonRow = ({ colors }: { colors: typeof lightColors }) => {
  const styles = createStyles(colors);
  return (
    <View style={styles.skeletonRow}>
      <Skeleton variant="circle" />
      <View style={styles.skeletonText}>
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" height={10} />
      </View>
      <Skeleton variant="text" width={72} height={14} />
    </View>
  );
};

const CategoryHeader = ({
  category,
  colors,
}: {
  category: "savings" | "loan";
  colors: typeof lightColors;
}) => {
  const router = useRouter();
  const styles = createStyles(colors);
  const isSavings = category === "savings";

  const handleSeeAll = () => {
    if (isSavings) {
      router.push("/(tabs)/contributions");
    } else {
      router.push("/(tabs)/loans");
    }
  };

  return (
    <View style={styles.categoryHeader}>
      <View style={styles.categoryLeft}>
        <View
          style={[
            styles.categoryDot,
            { backgroundColor: isSavings ? colors.success : colors.tertiary },
          ]}
        />
        <Text style={styles.categoryText}>
          {isSavings ? "Savings Activity" : "Loan Activity"}
        </Text>
      </View>
      <TouchableOpacity onPress={handleSeeAll} style={styles.seeAllButton}>
        <Text style={styles.seeAllText}>See all</Text>
        <MaterialIcons name="chevron-right" size={16} color={colors.primaryBright} />
      </TouchableOpacity>
    </View>
  );
};

const TransactionRow = ({
  transaction,
  index,
  colors,
}: {
  transaction: RecentTransaction;
  index: number;
  colors: typeof lightColors;
}) => {
  const router = useRouter();
  const styles = createStyles(colors);
  const tint = getTransactionTint(transaction.type, colors);
  const title =
    transaction.title || getDefaultTitle(transaction.type, transaction.date);

  const handlePress = () => {
    if (transaction.category === "savings") {
      router.push(`/contributions/${transaction.id}`);
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(400 + index * 50).duration(300)}
      style={styles.rowContainer}
    >
      <ListItem
        title={title}
        subtitle={formatDate(transaction.date)}
        leadingIcon={getTransactionIcon(transaction.type as TransactionType) as keyof typeof MaterialIcons.glyphMap}
        leadingColor={tint}
        chevron={false}
        onPress={transaction.category === "savings" ? handlePress : undefined}
        trailing={
          <View style={styles.rowTrailing}>
            <Money
              amount={transaction.amount}
              size="sm"
              tone={transaction.amount > 0 ? "success" : "default"}
              signed
            />
            <Text style={styles.rowStatus}>{transaction.status}</Text>
          </View>
        }
      />
    </Animated.View>
  );
};

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading = false,
  isOffline = false,
  error = null,
  onRetry,
}) => {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const elevations = createElevation(colors);

  const savingsTransactions = transactions.filter((t) => t.category === "savings");
  const loanTransactions = transactions.filter((t) => t.category === "loan");
  const hasTransactions = transactions.length > 0;

  const handleViewArchive = () => {
    router.push("/(tabs)/contributions");
  };

  return (
    <View style={styles.container}>
      {isOffline && !isLoading && (
        <View style={styles.offlineBanner}>
          <MaterialIcons name="cloud-off" size={16} color={colors.onSurfaceVariant} />
          <Text style={styles.offlineText}>Showing cached data — offline</Text>
        </View>
      )}

      <View style={styles.header}>
        <Animated.Text entering={FadeIn.delay(300)} style={styles.sectionTitle}>
          Recent Transactions
        </Animated.Text>
        {hasTransactions && (
          <TouchableOpacity onPress={handleViewArchive} style={styles.viewArchiveButton}>
            <Text style={styles.viewArchiveText}>View archive</Text>
            <MaterialIcons name="arrow-forward-ios" size={12} color={colors.primaryBright} />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.listCard, elevations.flat]}>
        {isLoading && !hasTransactions && (
          <>
            <CategoryHeader category="savings" colors={colors} />
            <SkeletonRow colors={colors} />
            <SkeletonRow colors={colors} />
            <SkeletonRow colors={colors} />
          </>
        )}

        {error && !isLoading && !hasTransactions && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={40} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            {onRetry && (
              <Button title="Retry" onPress={onRetry} variant="tonal" size="sm" />
            )}
          </View>
        )}

        {!isLoading && !error && !hasTransactions && (
          <EmptyState
            icon="receipt-long"
            title="No transactions yet"
            message="Your contributions and loan payments will appear here."
          />
        )}

        {hasTransactions && (
          <>
            {savingsTransactions.length > 0 && (
              <>
                <CategoryHeader category="savings" colors={colors} />
                {savingsTransactions.map((transaction, index) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    index={index}
                    colors={colors}
                  />
                ))}
              </>
            )}

            {loanTransactions.length > 0 && (
              <>
                <CategoryHeader category="loan" colors={colors} />
                {loanTransactions.map((transaction, index) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    index={index + savingsTransactions.length}
                    colors={colors}
                  />
                ))}
              </>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default TransactionList;
