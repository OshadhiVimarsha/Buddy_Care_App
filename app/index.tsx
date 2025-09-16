// app/index.tsx
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    // 👇 app start → go to welcome page
    router.replace("/welcome");
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#06b6d4" />
    </View>
  );
};

export default Index;
