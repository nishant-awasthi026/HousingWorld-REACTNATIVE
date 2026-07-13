import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserSync } from "../../../hooks/useUserSync";
import { useUserStore } from "../../../store/userStore";

export default function Layout() {
  const { isSignedIn, isLoaded } = useAuth();
  const isAdmin = useUserStore((state) => state.isAdmin);

  useUserSync();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00BFAD",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#F3F4F6",
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ size, color, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />

      
        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            href:isAdmin?"/create":null,
            tabBarIcon: ({ size, color, focused }) => (
              <Ionicons
                name={focused ? "add-circle" : "add-circle-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      

      <Tabs.Screen
        name="saved"
        options={{
          title: "saved",
          tabBarIcon: ({ size, color, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "profile",
          tabBarIcon: ({ size, color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
