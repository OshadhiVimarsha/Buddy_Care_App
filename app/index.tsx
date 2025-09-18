import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    // Delay කරන්න, Root Layout mount වෙනකොට පසු navigate කරන්න
    const timeout = setTimeout(() => {
      router.push("/welcome"); // replace → push කරන්න පුළුවන්
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#06b6d4" />
    </View>
  );
};

export default Index;
