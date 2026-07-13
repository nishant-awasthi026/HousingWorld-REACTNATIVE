import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpdateProfileImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to update your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      setIsUpdating(true);

      const base64Image = result.assets[0].base64;
      const uri = result.assets[0].uri;
      const filename = uri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      await user?.setProfileImage({ file: dataUrl });

      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile image:", error);
      Alert.alert(
        "Error",
        "Failed to update profile picture. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFAD" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Avatar + Name */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: user.imageUrl }}
            style={styles.avatar}
          />
          <TouchableOpacity
            onPress={handleUpdateProfileImage}
            disabled={isUpdating}
            style={styles.cameraButton}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="camera" size={16} color="white" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.userEmail}>
          {user.emailAddresses[0].emailAddress}
        </Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <MenuItem
          icon="heart-outline"
          label="Saved Properties"
          onPress={() => router.push("/(home)/saved")}
        />
        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() =>
            Alert.alert("Coming Soon", "Notifications coming soon!")
          }
        />
        <MenuItem
          icon="settings-outline"
          label="Settings"
          onPress={() => Alert.alert("Coming Soon", "Settings coming soon!")}
        />
        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() =>
            Linking.openURL(
              "mailto:nishant.officialpost@gmail.com?subject=Help%20%26%20Support%20-%20HousingWorld%20App"
            )
          }
        />
      </View>

      {/* Sign Out */}
      <View style={styles.signOutSection}>
        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={22} color="#6B7280" />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },

  // Profile Section
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00BFAD",
    borderRadius: 16,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#00BFAD",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  // Menu Section
  menuSection: {
    paddingHorizontal: 24,
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  menuLabel: {
    flex: 1,
    color: "#374151",
    fontWeight: "600",
    fontSize: 15,
  },

  // Sign Out
  signOutSection: {
    paddingHorizontal: 24,
    marginTop: "auto",
    marginBottom: 32,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.06)",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.15)",
  },
  signOutText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 15,
  },
});