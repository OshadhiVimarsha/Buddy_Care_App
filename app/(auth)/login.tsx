import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { login } from "@/services/authService";
import { Feather } from "@expo/vector-icons"; // Import Feather icons

const { width } = Dimensions.get("window");

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);
  
  // New state variable for password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [onModalConfirm, setOnModalConfirm] = useState<() => void>(() => {});

  const showModal = (title: string, message: string, onConfirm?: () => void) => {
    setModalTitle(title);
    setModalMessage(message);
    setOnModalConfirm(() => onConfirm || (() => setModalVisible(false)));
    setModalVisible(true);
  };

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async () => {
    if (!email.trim()) return showModal("Error", "Please enter your email address");
    if (!validateEmail(email.trim())) return showModal("Error", "Please enter a valid email");
    if (!password.trim()) return showModal("Error", "Please enter your password");
    if (isLoading) return;

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      showModal("Success", "Login successful!", () => {
        setModalVisible(false);
        router.push("/home");
      });
    } catch (err) {
      console.error(err);
      showModal("Error", "Incorrect email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-8 py-10">
          {/* Header */}
          <View className="items-start mb-12">
            <Text className="text-5xl font-black text-cyan-600 mb-7 tracking-tight">Login</Text>
            <Text className="text-gray-600 text-base font-medium">Enter your credentials to</Text>
            <Text className="text-gray-600 text-base font-medium">access your account</Text>
          </View>

          {/* Form */}
          <View className="space-y-6 py-12">
            {/* Email */}
            <View className="relative">
              <Text className="text-cyan-500 text-sm font-semibold mb-3 ml-2">EMAIL ADDRESS</Text>
              <View className={`bg-white rounded-xl border-2 ${emailFocused ? "border-gray-400" : "border-gray-200"}`}>
                <TextInput
                  placeholder="your@email.com"
                  className="px-6 py-2 text-gray-800 text-lg"
                  placeholderTextColor="#717474ff"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View className="relative py-10">
              <Text className="text-cyan-500 text-sm font-semibold mb-3 ml-2">PASSWORD</Text>
              <View className={`flex-row items-center bg-white rounded-xl border-2 ${passwordFocused ? "border-gray-400" : "border-gray-200"}`}>
                <TextInput
                  placeholder="••••••••"
                  className="px-6 py-2 text-gray-800 text-lg flex-1"
                  placeholderTextColor="#717474ff"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <Pressable
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="pr-4 py-2"
                >
                  {isPasswordVisible ? (
                    <Feather name="eye-off" size={24} color="#717474ff" />
                  ) : (
                    <Feather name="eye" size={24} color="#717474ff" />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Forgot Password */}
            <View className="items-end">
              <Pressable className="mr-2" onPress={() => router.push("/(auth)/ForgotPassword")}>
                <Text className="text-cyan-500 text-sm font-semibold">Forgot Password?</Text>
              </Pressable>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`mt-8 bg-cyan-500 rounded-xl py-5 ${isLoading ? "opacity-70" : ""}`}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <View className="relative z-10">
                {isLoading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="#fff" size="small" />
                    <Text className="text-white text-xl font-bold ml-3">Signing In...</Text>
                  </View>
                ) : (
                  <Text className="text-center text-xl font-bold text-white">Sign In →</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="-mt-6">
            <Pressable onPress={() => router.push("/register")} className="py-4">
              <Text className="text-center text-cyan-600 text-base">
                Don't have an account? <Text className="text-cyan-600 font-bold">Sign Up</Text>
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Modal */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-xl p-6 w-80">
              <Text className="text-xl font-bold text-center mb-2">{modalTitle}</Text>
              <Text className="text-center mb-6">{modalMessage}</Text>
              <TouchableOpacity
                className="bg-cyan-500 rounded-xl py-3"
                onPress={onModalConfirm}
              >
                <Text className="text-white text-center font-bold">OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;