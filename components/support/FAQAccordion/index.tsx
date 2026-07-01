import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";

type FAQAccordionColors = typeof lightColors;

interface FAQItemProps {
  icon: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

const FAQItem: React.FC<FAQItemProps> = ({
  icon,
  question,
  answer,
  isOpen,
  onToggle,
  index,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(400)}
      style={styles.itemContainer}
    >
      <TouchableOpacity style={styles.header} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.headerContent}>
          <MaterialIcons name={icon as any} size={20} color={colors.primary} />
          <Text style={styles.question}>{question}</Text>
        </View>
        <MaterialIcons
          name={isOpen ? "expand-less" : "expand-more"}
          size={24}
          color={colors.onSurfaceVariant}
          style={[styles.icon, isOpen && styles.iconOpen]}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.answerContainer}>
          <Text style={styles.answer}>{answer}</Text>
        </View>
      )}
    </Animated.View>
  );
};

interface FAQ {
  id: string;
  icon: string;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [openId, setOpenId] = useState<string | null>(faqs[1]?.id || null);

  const handleToggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId(openId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {faqs.map((faq, index) => (
        <FAQItem
          key={faq.id}
          icon={faq.icon}
          question={faq.question}
          answer={faq.answer}
          isOpen={openId === faq.id}
          onToggle={() => handleToggle(faq.id)}
          index={index}
        />
      ))}
    </View>
  );
};

const createStyles = (colors: FAQAccordionColors) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.base,
    },
    itemContainer: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.lg,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: theme.spacing.sm,
    },
    question: {
      fontFamily: font("body", "medium"),
      fontSize: typography.size.sm,
      color: colors.onSurface,
      flex: 1,
    },
    icon: {
      transform: [{ rotate: "0deg" }],
    },
    iconOpen: {
      transform: [{ rotate: "180deg" }],
    },
    answerContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    answer: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
      lineHeight: 20,
      marginTop: theme.spacing.base,
    },
  });

export default FAQAccordion;
