import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { forgotPassword } from "@/services/authService" // your API function

const ForgotPassword = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email")
      return
    }

    setIsLoading(true)
    try {
      const res = await forgotPassword(email) // call API
      console.log(res)
      Alert.alert("Success", "Check your email for reset instructions")
      router.push("/login")
    } catch (err) {
      console.error(err)
      Alert.alert("Error", "Something went wrong. Please try again")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-gray-100 justify-center p-4">
      <Text className="text-2xl font-bold mb-6 text-blue-600 text-center">
        Forgot Password
      </Text>

      <TextInput
        placeholder="Enter your email"
        className="bg-white border border-gray-300 rounded px-4 py-3 mb-4 text-gray-900"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        className={`mt-4 bg-rose-500 rounded-xl py-5 ${isLoading ? "opacity-70" : ""}`}
        onPress={handleForgotPassword}
        disabled={isLoading}
        activeOpacity={0.9}
      >
        {isLoading ? (
          <View className="flex-row items-center justify-center">
            <ActivityIndicator color="#fff" size="small" />
            <Text className="text-white text-xl font-bold ml-3">
              Sending...
            </Text>
          </View>
        ) : (
          <Text className="text-center text-xl font-bold text-white">
            Reset Password →
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

export default ForgotPassword
