import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@clerk/expo";
import { useSupabase } from "../../hooks/useSupabase";
import { useEffect, useState } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.78;
const CARD_HEIGHT = 260;

interface FeaturedCardProps {
  property: Property;
}

export default function FeaturedCard({ property }: FeaturedCardProps) {
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

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/property/[id]" as any,
          params: { id: property.id },
        })
      }
    >
      {/* Background Image */}
      <Image
        source={{ uri: property.images?.[0] }}
        style={styles.image}
        contentFit="cover"
        transition={300}
        placeholder={{ blurhash: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH" }}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.75)"]}
        style={styles.gradient}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Type Badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{property.type}</Text>
      </View>

      {/* Sold Badge */}
      {property.is_sold && (
        <View style={[styles.soldBadge, userId ? { right: 54 } : null]}>
          <Text style={styles.soldBadgeText}>SOLD</Text>
        </View>
      )}

      {/* Save Button */}
      {userId && (
        <TouchableOpacity
          onPress={handleSaveToggle}
          style={styles.heartButton}
          activeOpacity={0.75}
        >
          <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={18}
            color={isSaved ? "#EF4444" : "#9CA3AF"}
          />
        </TouchableOpacity>
      )}

      {/* Bottom Content */}
      <View style={styles.bottomContent}>
        <Text style={styles.price} numberOfLines={1}>
          {formatPrice(property.price)}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color="rgba(255,255,255,0.75)" />
          <Text style={styles.location} numberOfLines={1}>
            {property.address}, {property.city}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="bed-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>{property.bedrooms}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="water-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>{property.bathrooms}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="resize-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>{property.area_sqft} sqft</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: "#1a1a2e",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  typeBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(0, 191, 173, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  typeBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
  soldBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  soldBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heartButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
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
  bottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  price: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },
  title: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 10,
  },
  location: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "500",
  },
});
