import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatPrice } from "../../lib/utils";
import { useAuth } from "@clerk/expo";
import { useSupabase } from "../../hooks/useSupabase";
import { useEffect, useState } from "react";

interface PropertyCardProps {
  property: Property;
  onUnsave?: () => void;
  showSave?: boolean;
}

export default function PropertyCard({ property, onUnsave, showSave }: PropertyCardProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const supabase = useSupabase();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("saved_properties")
      .select("id")
      .eq("user_clerk_id", userId)
      .eq("property_id", property.id)
      .maybeSingle()
      .then(({ data }) => setIsSaved(!!data));
  }, [userId, property.id]);

  const handleSaveToggle = async () => {
    if (!userId) return;
    if (isSaved) {
      setIsSaved(false);
      if (onUnsave) onUnsave();
      await supabase
        .from("saved_properties")
        .delete()
        .eq("user_clerk_id", userId)
        .eq("property_id", property.id);
    } else {
      setIsSaved(true);
      await supabase.from("saved_properties").insert({
        user_clerk_id: userId,
        property_id: property.id,
      });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/property/[id]" as any,
          params: { id: property.id },
        })
      }
    >
      {/* Property Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.images?.[0] }}
          style={styles.image}
          contentFit="cover"
          transition={250}
          placeholder={{ blurhash: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH" }}
        />

        {/* Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{property.type}</Text>
        </View>

        {/* Sold Overlay */}
        {property.is_sold && (
          <View style={styles.soldOverlay}>
            <Text style={styles.soldText}>SOLD</Text>
          </View>
        )}

        {/* Save/Unsave Heart Button */}
        {userId && (
          <TouchableOpacity
            onPress={handleSaveToggle}
            style={styles.heartButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={20}
              color={isSaved ? "#EF4444" : "#9CA3AF"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Details */}
      <View style={styles.details}>
        {/* Price & Title */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.price}>{formatPrice(property.price)}</Text>
            <Text style={styles.title} numberOfLines={1}>
              {property.title}
            </Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color="#6B7280" />
          <Text style={styles.location} numberOfLines={1}>
            {property.address}, {property.city}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="bed-outline" size={15} color="#6B7280" />
            <Text style={styles.statText}>
              {property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="water-outline" size={15} color="#6B7280" />
            <Text style={styles.statText}>
              {property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="resize-outline" size={15} color="#6B7280" />
            <Text style={styles.statText}>{property.area_sqft} sqft</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  typeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0, 191, 173, 0.9)",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 10,
  },
  typeBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.4,
  },
  soldOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  soldText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heartButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 34,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  details: {
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 6,
  },
  location: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
});
