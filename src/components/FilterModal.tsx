import { useFilterStore } from "../../store/filterStore";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TYPES = ["apartment", "house", "villa", "studio"] as const;
const BEDROOM_OPTIONS = [1, 2, 3, 4]; // 4 means "4+"

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FilterModal({ visible, onClose }: FilterModalProps) {
  const {
    type,
    bedrooms,
    minPrice,
    maxPrice,
    setType,
    setBedrooms,
    setMinPrice,
    setMaxPrice,
    resetFilters,
  } = useFilterStore();

  const handleApply = () => {
    onClose();
  };

  const handleReset = () => {
    resetFilters();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Property Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Property Type</Text>
              <View style={styles.chipRow}>
                {TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(type === t ? null : t)}
                    style={[
                      styles.chip,
                      type === t && styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        type === t && styles.chipTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bedrooms */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bedrooms</Text>
              <View style={styles.chipRow}>
                {BEDROOM_OPTIONS.map((b) => (
                  <TouchableOpacity
                    key={b}
                    onPress={() => setBedrooms(bedrooms === b ? null : b)}
                    style={[
                      styles.chip,
                      bedrooms === b && styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        bedrooms === b && styles.chipTextActive,
                      ]}
                    >
                      {b === 4 ? "4+" : b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range (₹)</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputWrapper}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={minPrice ? String(minPrice) : ""}
                    onChangeText={(v) =>
                      setMinPrice(v ? Number(v) : null)
                    }
                  />
                </View>
                <Text style={styles.priceDash}>–</Text>
                <View style={styles.priceInputWrapper}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={maxPrice ? String(maxPrice) : ""}
                    onChangeText={(v) =>
                      setMaxPrice(v ? Number(v) : null)
                    }
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleReset}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              style={styles.applyButton}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: "#00BFAD",
    borderColor: "#00BFAD",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  chipTextActive: {
    color: "#fff",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  priceDash: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#00BFAD",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
