import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native"
import React, { useEffect } from "react"
import { useRouter } from "expo-router"
import { useAuth } from "@/context/AuthContext"
import { Appearance, useColorScheme } from 'react-native';

const Index = () => {
  const router = useRouter()
  const { user, loading } = useAuth()
  console.log("User data : ", user)

  function MyComponent() {
  let colorScheme = useColorScheme();

  if (colorScheme === 'dark') {
    // render some dark thing
  } else {
    // render some light thing
  }
}


  useEffect(() => {
    if (!loading) {
      if (user) router.replace("/home")
      else router.replace("/welcome")
    }
  }, [user, loading])

  if (loading) {
    return (
      <View className="flex-1 w-full justify-center align-items-center">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return null
}

export default Index
