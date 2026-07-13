import { useSupabase } from "../../../hooks/useSupabase";
import { Property } from "@/types";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { formatPrice } from "../../../lib/utils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CONTACT_PHONE = "8102242652";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const authSupabase = useSupabase();
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      fetchProperty();
      checkIfSaved();
    }, [id])
  );

  const fetchProperty = async () => {
    setLoading(true);
    const { data, error } = await authSupabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching property:", error.message);
      Alert.alert("Error", "Could not load property.");
    }
    setProperty(data as Property);
    setLoading(false);
  };

  const checkIfSaved = async () => {
    if (!userId) return;
    const { data } = await authSupabase
      .from("saved_properties")
      .select("id")
      .eq("user_clerk_id", userId)
      .eq("property_id", id)
      .maybeSingle();

    setIsSaved(!!data);
  };

  const handleToggleSave = async () => {
    if (!userId) return;
    setSavingToggle(true);

    if (isSaved) {
      await authSupabase
        .from("saved_properties")
        .delete()
        .eq("user_clerk_id", userId)
        .eq("property_id", id);
      setIsSaved(false);
    } else {
      await authSupabase.from("saved_properties").insert({
        user_clerk_id: userId,
        property_id: id,
      });
      setIsSaved(true);
    }
    setSavingToggle(false);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${CONTACT_PHONE}`);
  };

  const handleWhatsApp = () => {
    const message = property
      ? `Hi! I'm interested in "${property.title}" listed at ${formatPrice(property.price)}. Is it still available?`
      : "Hi! I'm interested in a property listing.";
    Linking.openURL(
      `https://wa.me/91${CONTACT_PHONE}?text=${encodeURIComponent(message)}`
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFAD" />
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
        <Text style={styles.errorText}>Property not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Carousel */}
        <View style={styles.imageCarousel}>
          <FlatList
            ref={flatListRef}
            data={property.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.carouselImage}
                contentFit="cover"
                transition={300}
                placeholder={{ blurhash: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH" }}
              />
            )}
          />

          {/* Back Button */}
          <SafeAreaView style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.topBarButton}
            >
              <Ionicons name="arrow-back" size={22} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleToggleSave}
              disabled={savingToggle}
              style={styles.topBarButton}
            >
              {savingToggle ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={22}
                  color={isSaved ? "#EF4444" : "#111827"}
                />
              )}
            </TouchableOpacity>
          </SafeAreaView>

          {/* Image Dots */}
          {property.images.length > 1 && (
            <View style={styles.dotsContainer}>
              {property.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeImageIndex === index && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Ionicons name="images-outline" size={12} color="#fff" />
            <Text style={styles.imageCounterText}>
              {activeImageIndex + 1}/{property.images.length}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Price & Type */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(property.price)}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{property.type}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{property.title}</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color="#00BFAD" />
            <Text style={styles.location}>
              {property.address}, {property.city}
            </Text>
          </View>

          {/* Status Badges */}
          <View style={styles.badgeRow}>
            {property.is_featured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
            )}
            {property.is_sold && (
              <View style={styles.soldBadge}>
                <Text style={styles.soldBadgeText}>SOLD</Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Key Details */}
          <Text style={styles.sectionTitle}>Key Details</Text>
          <View style={styles.detailsGrid}>
            <DetailItem
              icon="bed-outline"
              label="Bedrooms"
              value={String(property.bedrooms)}
            />
            <DetailItem
              icon="water-outline"
              label="Bathrooms"
              value={String(property.bathrooms)}
            />
            <DetailItem
              icon="resize-outline"
              label="Area"
              value={`${property.area_sqft} sqft`}
            />
            <DetailItem
              icon="calendar-outline"
              label="Listed"
              value={new Date(property.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          {property.description ? (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{property.description}</Text>
              <View style={styles.divider} />
            </>
          ) : null}

          {/* Location Map Placeholder */}
          {property.latitude && property.longitude ? (
            <>
              <Text style={styles.sectionTitle}>Location</Text>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/maps?q=${property.latitude},${property.longitude}`
                  )
                }
                style={styles.mapCard}
                activeOpacity={0.8}
              >
                <View style={styles.mapPlaceholder}>
                  <Ionicons name="map-outline" size={32} color="#00BFAD" />
                  <Text style={styles.mapText}>View on Google Maps</Text>
                  <Text style={styles.mapCoords}>
                    {property.latitude.toFixed(4)}°N,{" "}
                    {property.longitude.toFixed(4)}°E
                  </Text>
                </View>
                <Ionicons
                  name="open-outline"
                  size={18}
                  color="#00BFAD"
                  style={styles.mapOpenIcon}
                />
              </TouchableOpacity>
              <View style={styles.divider} />
            </>
          ) : null}

          {/* Contact Info */}
          <Text style={styles.sectionTitle}>Contact Agent</Text>
          <View style={styles.agentCard}>
            <View style={styles.agentIconCircle}>
              <Ionicons name="person" size={24} color="#00BFAD" />
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>Property Agent</Text>
              <Text style={styles.agentPhone}>+91 {CONTACT_PHONE}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleToggleSave}
          disabled={savingToggle}
          style={[
            styles.saveButton,
            isSaved && styles.saveButtonActive,
          ]}
        >
          {savingToggle ? (
            <ActivityIndicator size="small" color="#00BFAD" />
          ) : (
            <>
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={20}
                color={isSaved ? "#EF4444" : "#00BFAD"}
              />
              <Text
                style={[
                  styles.saveButtonText,
                  isSaved && styles.saveButtonTextActive,
                ]}
              >
                {isSaved ? "Saved" : "Save"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCall}
          style={styles.callButton}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.callButtonText}>Call Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleWhatsApp}
          style={styles.whatsappButton}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Helper Component ──────────────────────────────────────
function DetailItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailIconCircle}>
        <Ionicons name={icon} size={20} color="#00BFAD" />
      </View>
      <Text style={styles.detailValue}>{value}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  goBackButton: {
    marginTop: 8,
    backgroundColor: "#00BFAD",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  goBackButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  // ─── Image Carousel ────────────────────────────────
  imageCarousel: {
    position: "relative",
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: "#1a1a2e",
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  dotsContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 24,
  },
  imageCounter: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  // ─── Content ───────────────────────────────────────
  content: {
    padding: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  price: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  typeBadge: {
    backgroundColor: "rgba(0,191,173,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: "#00BFAD",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245,158,11,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  featuredBadgeText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "700",
  },
  soldBadge: {
    backgroundColor: "rgba(239,68,68,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  soldBadgeText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 20,
  },

  // ─── Key Details ───────────────────────────────────
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detailItem: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  detailIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,191,173,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  // ─── Description ───────────────────────────────────
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },

  // ─── Map Card ──────────────────────────────────────
  mapCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  mapPlaceholder: {
    flex: 1,
    gap: 4,
  },
  mapText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  mapCoords: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  mapOpenIcon: {
    marginLeft: 12,
  },

  // ─── Agent Card ────────────────────────────────────
  agentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  agentIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,191,173,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  agentPhone: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  // ─── Bottom Action Bar ─────────────────────────────
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: Platform.OS === "ios" ? 30 : 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 10 },
    }),
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  saveButtonActive: {
    borderColor: "rgba(239,68,68,0.3)",
    backgroundColor: "rgba(239,68,68,0.05)",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  saveButtonTextActive: {
    color: "#EF4444",
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#00BFAD",
    ...Platform.select({
      ios: {
        shadowColor: "#00BFAD",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  callButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  whatsappButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#25D366",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#25D366",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
});
