import FeaturedCard from "@/components/FeaturedCard";
import PropertyCard from "@/components/PropertyCard";
import { useSupabase } from "../../../hooks/useSupabase";
import { Property } from "@/types";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = useSupabase();

  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [])
  );

  const fetchProperties = async () => {
    setLoading(true);

    const { data: featuredData, error: featuredError } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false });

    if (featuredError) {
      console.error("Featured fetch error:", featuredError.message);
    }

    const { data: recommendedData, error: recommendedError } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", false)
      .order("created_at", { ascending: false });

    if (recommendedError) {
      console.error("Recommended fetch error:", recommendedError.message);
    }

    setFeatured(featuredData ?? []);
    setRecommended(recommendedData ?? []);
    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning ☀️";
    if (hour < 17) return "Good afternoon 🌤️";
    return "Good evening 🌙";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Image
                source={require("../../../assets/images/logo-worldhousing-alpha.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>{getGreeting()}</Text>
                <Text style={styles.userName}>
                  {user?.firstName ?? "User"}
                </Text>
              </View>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
              onPress={() => router.push("/(home)/search")}
              activeOpacity={0.7}
              style={styles.searchBar}
            >
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <Text style={styles.searchPlaceholder}>
                Search properties, cities...
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push("/(home)/search?openFilters=true" as any)
                }
                activeOpacity={0.8}
                style={styles.filterButton}
              >
                <Ionicons name="options-outline" size={15} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Featured Section */}
            <View style={styles.featuredSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured</Text>
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => router.push("/(home)/search?filter=featured")}
                >
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#00BFAD"
                  style={{ paddingVertical: 40 }}
                />
              ) : featured.length === 0 ? (
                <View style={styles.emptyFeatured}>
                  <Ionicons name="star-outline" size={28} color="#D1D5DB" />
                  <Text style={styles.emptyFeaturedText}>
                    No featured properties yet
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={featured}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <FeaturedCard property={item} />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                />
              )}
            </View>

            {/* Recommended Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended</Text>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => router.push("/(home)/search?filter=recommended")}
              >
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.recommendedItem}>
            <PropertyCard property={item} />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyList}>
              <Ionicons name="home-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyListText}>No properties found</Text>
              <Text style={styles.emptyListSub}>
                Check back later for new listings
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  logo: {
    width: 90,
    height: 36,
  },
  greetingContainer: {
    alignItems: "flex-end",
  },
  greetingText: {
    color: "#6B7280",
    fontSize: 12,
  },
  userName: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  searchBar: {
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchPlaceholder: {
    color: "#9CA3AF",
    fontSize: 14,
    flex: 1,
  },
  filterButton: {
    width: 32,
    height: 32,
    backgroundColor: "#00BFAD",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
  },
  seeAllText: {
    color: "#00BFAD",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyFeatured: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyFeaturedText: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  recommendedItem: {
    paddingHorizontal: 20,
  },
  emptyList: {
    alignItems: "center",
    paddingVertical: 50,
    gap: 8,
  },
  emptyListText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyListSub: {
    color: "#9CA3AF",
    fontSize: 13,
  },
});