import { useSupabase } from "../../../hooks/useSupabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TYPES = ["apartment", "house", "villa", "studio"] as const;
type PropertyType = (typeof TYPES)[number];

const MIN_PRICE = 1;
const MAX_PRICE = 999_999_999;

interface FormState {
  title: string;
  description: string;
  price: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqft: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  isFeatured: boolean;
  images: string[];
  localImages: string[];
}

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  price: "",
  type: "apartment",
  bedrooms: 1,
  bathrooms: 1,
  areaSqft: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  isFeatured: false,
  images: [],
  localImages: [],
};

export default function CreatePropertyScreen() {
  const router = useRouter();
  const authSupabase = useSupabase();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const updateForm = (fields: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  // ─── Image Picker ──────────────────────────────────────────
  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
      selectionLimit: 6,
    });

    if (result.canceled) return;

    setUploadingImages(true);

    const uploadedUrls: string[] = [];
    const previewUris: string[] = [];

    for (const asset of result.assets) {
      try {
        const filename = `property_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.jpg`;

        const base64 = asset.base64!;
        const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

        const { error } = await authSupabase.storage
          .from("property-images")
          .upload(filename, buffer, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (error) throw error;

        const { data: urlData } = authSupabase.storage
          .from("property-images")
          .getPublicUrl(filename);

        uploadedUrls.push(urlData.publicUrl);
        previewUris.push(asset.uri);
      } catch (err) {
        console.error("Upload error:", err);
        Alert.alert("Upload Failed", "One or more images failed to upload.");
      }
    }

    updateForm({
      images: [...form.images, ...uploadedUrls],
      localImages: [...form.localImages, ...previewUris],
    });
    setUploadingImages(false);
  };

  const handleRemoveImage = (index: number) => {
    updateForm({
      images: form.images.filter((_, i) => i !== index),
      localImages: form.localImages.filter((_, i) => i !== index),
    });
  };

  // ─── Location Detection ────────────────────────────────────
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to detect coordinates."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      updateForm({
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.longitude),
      });
    } catch (err) {
      Alert.alert("Error", "Could not detect location. Enter manually.");
    } finally {
      setDetectingLocation(false);
    }
  };

  // ─── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim())
      return Alert.alert("Validation", "Title is required.");

    if (!form.price.trim())
      return Alert.alert("Validation", "Price is required.");

    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum < MIN_PRICE)
      return Alert.alert("Validation", "Price must be greater than ₹0.");
    if (priceNum > MAX_PRICE)
      return Alert.alert(
        "Validation",
        `Price cannot exceed ₹${MAX_PRICE.toLocaleString("en-IN")}.`
      );

    if (!form.address.trim())
      return Alert.alert("Validation", "Address is required.");
    if (!form.city.trim())
      return Alert.alert("Validation", "City is required.");
    if (form.images.length === 0)
      return Alert.alert("Validation", "Please upload at least one image.");

    setSubmitting(true);

    const { error } = await authSupabase.from("properties").insert({
      title: form.title.trim(),
      description: form.description.trim(),
      price: priceNum,
      type: form.type,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      area_sqft: form.areaSqft ? Number(form.areaSqft) : null,
      address: form.address.trim(),
      city: form.city.trim(),
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      images: form.images,
      is_featured: form.isFeatured,
      is_sold: false,
    });

    setSubmitting(false);

    if (error) {
      Alert.alert("Error", "Failed to create property. Please try again.");
      console.error(error);
      return;
    }

    setForm(INITIAL_FORM);
    Alert.alert("Success! 🎉", "Property listed successfully.", [
      { text: "OK", onPress: () => router.replace("/(home)") },
    ]);
  };

  // ─── UI Helpers ────────────────────────────────────────────
  const Counter = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) => (
    <View style={styles.counterContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity
          onPress={() => onChange(Math.max(1, value - 1))}
          style={styles.counterButton}
        >
          <Ionicons name="remove" size={18} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity
          onPress={() => onChange(value + 1)}
          style={styles.counterButton}
        >
          <Ionicons name="add" size={18} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const Toggle = ({
    label,
    value,
    onChange,
    description,
  }: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
    description?: string;
  }) => (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      style={[
        styles.toggleRow,
        value ? styles.toggleRowActive : styles.toggleRowInactive,
      ]}
    >
      <View style={styles.toggleTextContainer}>
        <Text
          style={[
            styles.toggleLabel,
            { color: value ? "#047A6F" : "#374151" },
          ]}
        >
          {label}
        </Text>
        {description && (
          <Text style={styles.toggleDescription}>{description}</Text>
        )}
      </View>
      <View
        style={[
          styles.toggleCircle,
          value ? styles.toggleCircleActive : styles.toggleCircleInactive,
        ]}
      >
        {value && <Ionicons name="checkmark" size={14} color="white" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Property</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Images */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Photos <Text style={styles.labelHint}>(up to 6)</Text>
            </Text>

            <View style={styles.imageGrid}>
              {form.localImages.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={{ uri }}
                    style={styles.imageThumb}
                    resizeMode="cover"
                  />
                  {index === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText}>COVER</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    style={styles.removeImageButton}
                  >
                    <Ionicons name="close" size={11} color="white" />
                  </TouchableOpacity>
                </View>
              ))}

              {form.localImages.length < 6 && (
                <TouchableOpacity
                  onPress={handlePickImages}
                  disabled={uploadingImages}
                  style={styles.addImageButton}
                >
                  {uploadingImages ? (
                    <ActivityIndicator size="small" color="#00BFAD" />
                  ) : (
                    <>
                      <Ionicons
                        name="camera-outline"
                        size={22}
                        color="#9CA3AF"
                      />
                      <Text style={styles.addImageText}>Add</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Modern 3BHK in Bandra"
              placeholderTextColor="#9CA3AF"
              value={form.title}
              onChangeText={(v) => updateForm({ title: v })}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the property..."
              placeholderTextColor="#9CA3AF"
              value={form.description}
              onChangeText={(v) => updateForm({ description: v })}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Price */}
          <View style={styles.section}>
            <Text style={styles.label}>Price (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5000000"
              placeholderTextColor="#9CA3AF"
              value={form.price}
              onChangeText={(v) => updateForm({ price: v })}
              keyboardType="numeric"
            />
            <Text style={styles.priceHint}>
              Valid range: ₹1 – ₹{MAX_PRICE.toLocaleString("en-IN")}
            </Text>
          </View>

          {/* Property Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Property Type</Text>
            <View style={styles.typeRow}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => updateForm({ type: t })}
                  style={[
                    styles.typeChip,
                    form.type === t && styles.typeChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      form.type === t && styles.typeChipTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bedrooms / Bathrooms */}
          <View style={styles.countersRow}>
            <Counter
              label="Bedrooms"
              value={form.bedrooms}
              onChange={(v) => updateForm({ bedrooms: v })}
            />
            <Counter
              label="Bathrooms"
              value={form.bathrooms}
              onChange={(v) => updateForm({ bathrooms: v })}
            />
          </View>

          {/* Area */}
          <View style={styles.section}>
            <Text style={styles.label}>Area (sq ft)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1200"
              placeholderTextColor="#9CA3AF"
              value={form.areaSqft}
              onChangeText={(v) => updateForm({ areaSqft: v })}
              keyboardType="numeric"
            />
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Street address"
              placeholderTextColor="#9CA3AF"
              value={form.address}
              onChangeText={(v) => updateForm({ address: v })}
            />
          </View>

          {/* City */}
          <View style={styles.section}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mumbai"
              placeholderTextColor="#9CA3AF"
              value={form.city}
              onChangeText={(v) => updateForm({ city: v })}
            />
          </View>

          {/* Coordinates */}
          <View style={styles.section}>
            <View style={styles.coordsHeader}>
              <Text style={styles.label}>Coordinates</Text>
              <TouchableOpacity
                onPress={handleDetectLocation}
                disabled={detectingLocation}
                style={styles.detectButton}
              >
                {detectingLocation ? (
                  <ActivityIndicator size="small" color="#00BFAD" />
                ) : (
                  <Ionicons name="locate-outline" size={13} color="#00BFAD" />
                )}
                <Text style={styles.detectButtonText}>
                  {detectingLocation ? "Detecting..." : "Detect Location"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.coordsRow}>
              <View style={styles.coordInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Latitude"
                  placeholderTextColor="#9CA3AF"
                  value={form.latitude}
                  onChangeText={(v) => updateForm({ latitude: v })}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.coordInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Longitude"
                  placeholderTextColor="#9CA3AF"
                  value={form.longitude}
                  onChangeText={(v) => updateForm({ longitude: v })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Featured Toggle */}
          <View style={styles.section}>
            <Toggle
              label="Featured Property"
              description="Show this in the Featured section on home"
              value={form.isFeatured}
              onChange={(v) => updateForm({ isFeatured: v })}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || uploadingImages}
            style={[
              styles.submitButton,
              {
                opacity: submitting || uploadingImages ? 0.7 : 1,
              },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>List Property</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  labelHint: {
    color: "#9CA3AF",
    fontWeight: "400",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  textArea: {
    height: 96,
    textAlignVertical: "top",
  },
  priceHint: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
    marginLeft: 4,
  },

  // Images
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageWrapper: {
    position: "relative",
  },
  imageThumb: {
    width: 96,
    height: 96,
    borderRadius: 16,
  },
  coverBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#00BFAD",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  coverBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addImageButton: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },

  // Type Chips
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  typeChipActive: {
    backgroundColor: "#00BFAD",
    borderColor: "#00BFAD",
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  typeChipTextActive: {
    color: "#fff",
  },

  // Counters
  countersRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  counterContainer: {
    flex: 1,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    overflow: "hidden",
  },
  counterButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    flex: 1,
    textAlign: "center",
    color: "#111827",
    fontWeight: "700",
    fontSize: 16,
  },

  // Coordinates
  coordsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,191,173,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detectButtonText: {
    color: "#00BFAD",
    fontSize: 12,
    fontWeight: "600",
  },
  coordsRow: {
    flexDirection: "row",
    gap: 12,
  },
  coordInput: {
    flex: 1,
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleRowActive: {
    backgroundColor: "rgba(0,191,173,0.08)",
    borderColor: "rgba(0,191,173,0.3)",
  },
  toggleRowInactive: {
    backgroundColor: "#fff",
    borderColor: "#E5E7EB",
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  toggleDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleCircleActive: {
    backgroundColor: "#00BFAD",
    borderColor: "#00BFAD",
  },
  toggleCircleInactive: {
    borderColor: "#D1D5DB",
  },

  // Submit
  submitButton: {
    backgroundColor: "#00BFAD",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#00BFAD",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});