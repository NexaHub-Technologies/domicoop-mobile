import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme, lightColors } from "@/contexts/ThemeContext";
import { theme } from "@/styles/theme";
import { font } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { getInitials } from "@/data/mockData";

type ProfileImageColors = typeof lightColors;

interface ProfileImagePickerProps {
  image: string | null;
  name: string;
  onImageSelect: (imageUri: string) => void;
}

export const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  image,
  name,
  onImageSelect,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access your photos to change your profile picture.",
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelect(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const initials = getInitials(name);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.initialsContainer}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <MaterialIcons name="hourglass-empty" size={32} color={colors.onPrimary} />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={pickImage}
        disabled={isLoading}
      >
        <MaterialIcons name="edit" size={16} color={colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ProfileImageColors) =>
  StyleSheet.create({
    container: {
      alignSelf: "center",
      marginBottom: theme.spacing.lg,
    },
    imageContainer: {
      width: 128,
      height: 128,
      borderRadius: 64,
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
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    initialsContainer: {
      width: "100%",
      height: "100%",
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    initialsText: {
      fontFamily: font("display", "bold"),
      fontSize: typography.size["3xl"],
      color: colors.onPrimary,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.scrim,
      alignItems: "center",
      justifyContent: "center",
    },
    editButton: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: colors.surface,
      shadowColor: colors.ambientShadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
  });

export default ProfileImagePicker;
