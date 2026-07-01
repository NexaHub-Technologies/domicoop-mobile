import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";

type ChatBottomSheetColors = typeof lightColors;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const ChatBottomSheet: React.FC<ChatBottomSheetProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const translateY = useSharedValue(500);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 25, stiffness: 200 });
    } else {
      translateY.value = 500;
    }
  }, [visible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message. A support agent will be with you shortly. Please describe your issue in detail.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentResponse]);
    }, 1000);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.agentBubble]}
    >
      <Text
        style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : styles.agentMessageText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <Animated.View style={[styles.container, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.avatar}>
                <MaterialIcons name="support-agent" size={24} color={colors.onPrimary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Live Support</Text>
                <Text style={styles.headerSubtitle}>Typically replies in 2 minutes</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={48}
                  color={colors.onSurfaceVariant}
                />
                <Text style={styles.emptyText}>Start a conversation</Text>
                <Text style={styles.emptySubtext}>Our support team is here to help</Text>
              </View>
            }
          />

          {/* Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.inputContainer}
          >
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor={colors.onSurfaceVariant}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <MaterialIcons name="send" size={20} color={colors.onPrimary} />
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ChatBottomSheetColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.scrim,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    container: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: theme.borderRadius["2xl"],
      borderTopRightRadius: theme.borderRadius["2xl"],
      maxHeight: "80%",
      minHeight: 400,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.base,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.base,
      color: colors.onSurface,
    },
    headerSubtitle: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.xs,
      color: colors.onSurfaceVariant,
    },
    closeButton: {
      padding: theme.spacing.sm,
    },
    messagesContainer: {
      padding: theme.spacing.lg,
      gap: theme.spacing.base,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing["3xl"],
    },
    emptyText: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size.lg,
      color: colors.onSurface,
      marginTop: theme.spacing.base,
    },
    emptySubtext: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      color: colors.onSurfaceVariant,
      marginTop: theme.spacing.xs,
    },
    messageBubble: {
      maxWidth: "80%",
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.lg,
    },
    userBubble: {
      alignSelf: "flex-end",
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    agentBubble: {
      alignSelf: "flex-start",
      backgroundColor: colors.surfaceContainer,
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      lineHeight: 20,
    },
    userMessageText: {
      color: colors.onPrimary,
    },
    agentMessageText: {
      color: colors.onSurface,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.base,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
      gap: theme.spacing.sm,
    },
    input: {
      flex: 1,
      backgroundColor: colors.surfaceContainer,
      borderRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      maxHeight: 100,
      fontFamily: font("body", "regular"),
      fontSize: typography.size.sm,
      color: colors.onSurface,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });

export default ChatBottomSheet;
