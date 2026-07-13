import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";
import { useFilterStore } from "../../../store/filterStore";
import { formatPrice } from "../../../lib/utils";
import PropertyCard from "@/components/PropertyCard";
import FilterModal from "@/components/FilterModal";

export default function SearchScreen() {
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilter, setLocalFilter] = useState<string | null>(null);

  const { openFilters, filter } = useLocalSearchParams<{ openFilters?: string; filter?: string }>();

  useEffect(() => {
    if (openFilters === "true") {
      setShowFilters(true);
    }
  }, [openFilters]);

  useEffect(() => {
    if (filter) {
      setLocalFilter(filter);
    } else {
      setLocalFilter(null);
    }
  }, [filter]);

  const {
    search,
    type,
    bedrooms,
    minPrice,
    maxPrice,
    setSearch,
    setType,
    setBedrooms,
    setMinPrice,
    setMaxPrice,
  } = useFilterStore();

  const activeFilterCount = [
    type !== null,
    bedrooms !== null,
    minPrice !== null,
    maxPrice !== null,
    localFilter !== null,
  ].filter(Boolean).length;

  useEffect(() => {
    fetchResults();
  }, [search, type, bedrooms, minPrice, maxPrice, localFilter]);

  const fetchResults = async () => {
    setLoading(true);

    let query = supabase.from("properties").select("*");

    if (search) {
      query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq("type", type);
    }

    if (bedrooms) {
      query = query.eq("bedrooms", bedrooms);
    }

    if (minPrice) {
      query = query.gte("price", minPrice);
    }

    if (maxPrice) {
      query = query.lte("price", maxPrice);
    }

    if (localFilter === "featured") {
      query = query.eq("is_featured", true);
    } else if (localFilter === "recommended") {
      query = query.eq("is_featured", false);
    }

    const { data } = await query.order("created_at", { ascending: false });

    setResults(data ?? []);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>
          {localFilter === "featured"
            ? "Featured Properties"
            : localFilter === "recommended"
            ? "Recommended Properties"
            : "Find Property"}
        </Text>

        {/* Search Bar + Filter Button */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title or city..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={[
              styles.filterButton,
              activeFilterCount > 0 && styles.filterButtonActive,
            ]}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={activeFilterCount > 0 ? "#fff" : "#374151"}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <View style={styles.chipRow}>
            {localFilter && (
              <View style={styles.filterChip}>
                <Ionicons
                  name={localFilter === "featured" ? "star" : "thumbs-up"}
                  size={12}
                  color="#00BFAD"
                  style={{ marginRight: 2 }}
                />
                <Text style={styles.filterChipText}>
                  {localFilter === "featured" ? "Featured" : "Recommended"}
                </Text>
                <TouchableOpacity onPress={() => setLocalFilter(null)}>
                  <Ionicons name="close" size={12} color="#00BFAD" />
                </TouchableOpacity>
              </View>
            )}
            {type && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>{type}</Text>
                <TouchableOpacity onPress={() => setType(null)}>
                  <Ionicons name="close" size={12} color="#00BFAD" />
                </TouchableOpacity>
              </View>
            )}
            {bedrooms !== null && (
              <View style={styles.filterChip}>
                <Ionicons name="bed-outline" size={11} color="#00BFAD" />
                <Text style={styles.filterChipText}>
                  {bedrooms === 4
                    ? "4+ beds"
                    : `${bedrooms} bed${bedrooms > 1 ? "s" : ""}`}
                </Text>
                <TouchableOpacity onPress={() => setBedrooms(null)}>
                  <Ionicons name="close" size={12} color="#00BFAD" />
                </TouchableOpacity>
              </View>
            )}
            {(minPrice !== null || maxPrice !== null) && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  {minPrice && maxPrice
                    ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
                    : minPrice
                    ? `From ${formatPrice(minPrice)}`
                    : `Up to ${formatPrice(maxPrice!)}`}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setMinPrice(null);
                    setMaxPrice(null);
                  }}
                >
                  <Ionicons name="close" size={12} color="#00BFAD" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PropertyCard property={item} />}
        ListHeaderComponent={
          <Text style={styles.resultCount}>
            {loading ? "Searching..." : `${results.length} properties found`}
          </Text>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No properties found</Text>
              <Text style={styles.emptySub}>
                Try a different search or adjust filters
              </Text>
            </View>
          ) : (
            <ActivityIndicator
              size="large"
              color="#00BFAD"
              style={styles.loadingIndicator}
            />
          )
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
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
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
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
  filterButtonActive: {
    backgroundColor: "#00BFAD",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,191,173,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,191,173,0.3)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  filterChipText: {
    color: "#047A6F",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  resultCount: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    color: "#9CA3AF",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  emptySub: {
    color: "#D1D5DB",
    fontSize: 13,
    marginTop: 4,
  },
  loadingIndicator: {
    paddingVertical: 80,
  },
});