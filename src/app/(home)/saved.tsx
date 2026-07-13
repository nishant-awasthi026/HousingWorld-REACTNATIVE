import { useSupabase } from "../../../hooks/useSupabase";
import { Property } from "@/types";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyCard from "@/components/PropertyCard";

interface SavedProperty {
  id: string;
  property_id: string;
  properties: Property;
}

export default function SavedScreen() {
  const { userId } = useAuth();
  const authSupabase = useSupabase();
  const router = useRouter();

  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await authSupabase
      .from("saved_properties")
      .select("id, property_id, properties(*)")
      .eq("user_clerk_id", userId)
      .order("id", { ascending: false });

    setSaved((data as unknown as SavedProperty[]) ?? []);
    setLoading(false);
  }, [userId]);

  // Refresh every time the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSaved();
    }, [fetchSaved])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved</Text>
        {!loading && (
          <Text style={styles.headerSub}>
            {saved.length} {saved.length === 1 ? "property" : "properties"}{" "}
            saved
          </Text>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BFAD" />
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item.properties}
              onUnsave={() =>
                setSaved((prev) => prev.filter((s) => s.id !== item.id))
              }
              showSave
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="heart-outline" size={36} color="#EF4444" />
              </View>
              <Text style={styles.emptyTitle}>No saved properties</Text>
              <Text style={styles.emptySub}>
                Tap the heart icon on any property to save it here
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(home)/search")}
                style={styles.browseButton}
              >
                <Text style={styles.browseButtonText}>Browse Properties</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  headerSub: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 96,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  emptySub: {
    color: "#9CA3AF",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  browseButton: {
    marginTop: 24,
    backgroundColor: "#00BFAD",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#00BFAD",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  browseButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});