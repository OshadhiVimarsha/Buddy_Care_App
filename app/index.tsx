import { View, Text } from "react-native"
import React from "react"
import "./../global.css" // nativewind styles import

const Index = () => {
  return (
    <View className="flex-1 bg-[#f2f2f4] justify-center items-center">
      <Text className="text-3xl font-bold text-cyan-500">
        Buddy Care App
      </Text>
    </View>
  )
}

export default Index
