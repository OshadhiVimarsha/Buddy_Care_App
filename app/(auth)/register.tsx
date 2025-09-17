import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { register } from "@/services/authService";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AntDesign, Feather } from "@expo/vector-icons"; // You'll need to install @expo/vector-icons

const Register = () => {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoadingReg, setIsLoadingReg] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // New state variables for password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState<boolean>(false);

  const handleRegister = async () => {
    if (!name.trim()) return alert("Name is required!");
    if (!email.trim()) return alert("Email is required!");
    if (!password.trim()) return alert("Password is required!");
    if (!confirmPassword.trim()) return alert("Confirm Password is required!");
    if (password !== confirmPassword) return alert("Passwords do not match!");
    if (isLoadingReg) return;

    setIsLoadingReg(true);
    try {
      await register(name, email, password);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert("Registration failed! Please try again.");
    } finally {
      setIsLoadingReg(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "white" }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        {/* Header */}
        <View className="items-start mb-4">
          <Text className="text-5xl font-black text-cyan-600 mb-3 tracking-tight">
            Register
          </Text>
          <Text className="text-gray-600 text-base font-medium">
            Create your account to
          </Text>
          <Text className="text-gray-600 text-base font-medium">
            start using the app
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-6 py-6">
          {/* Name */}
          <View className="relative py-2">
            <Text className="text-cyan-500 text-sm font-semibold mb-2 ml-1">NAME</Text>
            <View
              className={`bg-white rounded-xl border-2 ${
                nameFocused ? "border-gray-400" : "border-gray-200"
              }`}
            >
              <TextInput
                placeholder="Your Name"
                className="px-4 py-2 text-gray-800 text-lg"
                placeholderTextColor="#654e5280"
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>
          </View>

          {/* Email */}
          <View className="relative py-2">
            <Text className="text-cyan-500 text-sm font-semibold mb-2 ml-1">EMAIL</Text>
            <View
              className={`bg-white rounded-xl border-2 ${
                emailFocused ? "border-gray-400" : "border-gray-200"
              }`}
            >
              <TextInput
                placeholder="your@email.com"
                className="px-4 py-2 text-gray-800 text-lg"
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
          <View className="relative py-2">
            <Text className="text-cyan-500 text-sm font-semibold mb-2 ml-1">PASSWORD</Text>
            <View
              className={`flex-row items-center bg-white rounded-xl border-2 ${
                passwordFocused ? "border-gray-400" : "border-gray-200"
              }`}
            >
              <TextInput
                placeholder="••••••••"
                className="px-4 py-2 text-gray-800 text-lg flex-1"
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

          {/* Confirm Password */}
          <View className="relative py-2">
            <Text className="text-cyan-500 text-sm font-semibold mb-2 ml-1">CONFIRM PASSWORD</Text>
            <View
              className={`flex-row items-center bg-white rounded-xl border-2 ${
                confirmPasswordFocused ? "border-gray-400" : "border-gray-200"
              }`}
            >
              <TextInput
                placeholder="••••••••"
                className="px-4 py-2 text-gray-800 text-lg flex-1"
                placeholderTextColor="#717474ff"
                secureTextEntry={!isConfirmPasswordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
              />
              <Pressable
                onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                className="pr-4 py-2"
              >
                {isConfirmPasswordVisible ? (
                  <Feather name="eye-off" size={24} color="#717474ff" />
                ) : (
                  <Feather name="eye" size={24} color="#717474ff" />
                )}
              </Pressable>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            className={`mt-6 bg-cyan-500 rounded-xl py-4 ${
              isLoadingReg ? "opacity-70" : ""
            }`}
            onPress={handleRegister}
            disabled={isLoadingReg}
            activeOpacity={0.9}
          >
            <View className="relative z-10">
              {isLoadingReg ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-white text-lg font-bold ml-3">Registering...</Text>
                </View>
              ) : (
                <Text className="text-center text-lg font-bold text-white">Register →</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Footer */}
          <View className="mt-4">
            <Pressable onPress={() => router.push("/login")} className="py-2">
              <Text className="text-center text-cyan-600 text-base">
                Already have an account?{" "}
                <Text className="font-bold">Login</Text>
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Success Modal */}
        <Modal
          transparent
          visible={showSuccessModal}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View className="flex-1 bg-black/40 justify-center items-center">
            <View className="bg-white rounded-2xl p-6 w-4/5 items-center shadow-lg">
              <Text className="text-xl font-bold text-cyan-600 mb-3">Success!</Text>
              <Text className="text-gray-700 text-center mb-6">
                Registration successful.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push("/login");
                }}
                className="bg-cyan-500 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-bold">OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Register;