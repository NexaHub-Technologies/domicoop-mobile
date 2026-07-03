import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useTheme , lightColors } from '@/contexts/ThemeContext';
import { theme } from '@/styles/theme';
import { font } from "@/constants/theme";
import { typography } from '@/constants/typography';
import { FAQAccordion } from '@/components/support/FAQAccordion';
import { ChatBottomSheet } from '@/components/modals/ChatBottomSheet';
import { faqData } from '@/constants/support';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface QuickActionButtonProps {
  icon: string;
  label: string;
  subtitle: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  index: number;
  colors: typeof lightColors;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  subtitle,
  onPress,
  variant = 'primary',
  index,
  colors,
}) => {
  const styles = createStyles(colors);
  return (
    <AnimatedTouchable
      entering={FadeInUp.delay(200 + index * 100).duration(400)}
      onPress={onPress}
      style={[styles.quickActionButton, variant === 'secondary' && styles.quickActionButtonSecondary]}
      activeOpacity={0.8}
    >
      <View style={[styles.quickActionIcon, variant === 'primary' ? styles.quickActionIconPrimary : styles.quickActionIconSecondary]}>
        <MaterialIcons
          name={icon as any}
          size={24}
          color={variant === 'primary' ? colors.onPrimary : colors.primary}
        />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </AnimatedTouchable>
  );
};

export default function SupportHelpScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const styles = createStyles(colors);

  const handleBack = () => {
    router.back();
  };

  const handleLiveChat = () => {
    setIsChatOpen(true);
  };

  const handleContactAdmin = () => {
    // Open email client
    Linking.openURL('mailto:support@domicop.com?subject=Support Request');
  };

  const handleStartConversation = () => {
    setIsChatOpen(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Help Center</Text>
          <View style={styles.backButton} />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.heroBanner}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>How can we help?</Text>
            <Text style={styles.heroSubtitle}>
              Search our knowledge base or contact us directly.
            </Text>
          </View>
          <View style={styles.heroDecoration1} />
          <View style={styles.heroDecoration2} />
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <QuickActionButton
            icon="chat"
            label="Live Chat"
            subtitle="Instant support"
            onPress={handleLiveChat}
            variant="primary"
            index={0}
            colors={colors}
          />
          <QuickActionButton
            icon="admin-panel-settings"
            label="Contact Admin"
            subtitle="Formal requests"
            onPress={handleContactAdmin}
            variant="secondary"
            index={1}
            colors={colors}
          />
        </View>

        {/* FAQ Section */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <View style={styles.faqHeader}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          <FAQAccordion faqs={faqData} />
        </Animated.View>

        {/* Contact Section */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.contactContainer}>
          <View style={styles.contactCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <MaterialIcons name="support-agent" size={28} color={colors.onPrimary} />
              </View>
            </View>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactSubtitle}>
              Our support team is available 24/7 to assist you with any inquiries.
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleStartConversation}
              activeOpacity={0.8}
            >
              <Text style={styles.contactButtonText}>Start Conversation</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Chat Bottom Sheet */}
      <ChatBottomSheet
        visible={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof lightColors) => StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    padding: theme.spacing.lg,
  },
  heroBanner: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing['2xl'],
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  heroContent: {
    zIndex: 1,
  },
  heroTitle: {
    fontFamily: font("display", "bold"),
    fontSize: typography.size['2xl'],
    color: colors.onPrimary,
    marginBottom: theme.spacing.xs,
  },
  heroSubtitle: {
    fontFamily: font("body", "regular"),
    fontSize: typography.size.base,
    color: `${colors.onPrimary}90`,
    marginBottom: theme.spacing.lg,
  },
  heroDecoration1: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: `${colors.onPrimary}1A`,
  },
  heroDecoration2: {
    position: 'absolute',
    bottom: -24,
    left: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.onPrimary}1A`,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.base,
    marginBottom: theme.spacing.lg,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${colors.primary}10`,
    shadowColor: colors.ambientShadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionButtonSecondary: {
    backgroundColor: `${colors.primary}05`,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickActionIconPrimary: {
    backgroundColor: colors.primary,
    shadowColor: colors.ambientShadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIconSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: `${colors.primary}10`,
  },
  quickActionLabel: {
    fontFamily: font("display", "semibold"),
    fontSize: typography.size.sm,
    color: colors.onSurface,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontFamily: font("body", "regular"),
    fontSize: typography.size.xs,
    color: colors.onSurfaceVariant,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.base,
  },
  faqTitle: {
    fontFamily: font("display", "bold"),
    fontSize: typography.size.lg,
    color: colors.onSurface,
  },
  viewAllText: {
    fontFamily: font("body", "semibold"),
    fontSize: typography.size.sm,
    color: colors.primary,
  },
  contactContainer: {
    marginTop: theme.spacing.lg,
  },
  contactCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing['2xl'],
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
  },
  avatarContainer: {
    marginBottom: theme.spacing.base,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.surface,
    shadowColor: colors.ambientShadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontFamily: font("display", "bold"),
    fontSize: typography.size.xl,
    color: colors.onPrimary,
  },
  contactTitle: {
    fontFamily: font("display", "bold"),
    fontSize: typography.size.lg,
    color: colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  contactSubtitle: {
    fontFamily: font("body", "regular"),
    fontSize: typography.size.sm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  contactButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing['2xl'],
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.ambientShadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonText: {
    fontFamily: font("display", "bold"),
    fontSize: typography.size.base,
    color: colors.onPrimary,
  },
  bottomPadding: {
    height: 40,
  },
});
