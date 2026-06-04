import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#F9FAFB" },
          headerTitleStyle: { fontWeight: "700", fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: "#F9FAFB" },
        }}
      />
    </>
  );
}
