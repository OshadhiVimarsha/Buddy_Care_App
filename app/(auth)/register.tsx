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
import { register } from "@/services/authService";

const { width } = Dimensions.get("window");

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
      setShowSuccessModal(true); // show modal
    } catch (err) {
      console.error(err);
      alert("Registration failed! Please try again.");
    } finally {
      setIsLoadingReg(false);
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
          <View className="items-start mb-2">
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
            <View className="relative py-3">
              <Text className="text-cyan-500 text-sm font-semibold mb-3 ml-2">
                NAME
              </Text>
              <View
                className={`bg-white rounded-xl border-2 ${
                  nameFocused ? "border-gray-400" : "border-gray-200"
                }`}
              >
                <TextInput
                  placeholder="Your Name"
                  className="px-6 py-2 text-gray-800 text-lg"
                  placeholderTextColor="#654e5280"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            </View>

            {/* Email */}
            <View className="relative py-3">
              <Text className="text-cyan-500 text-sm font-semibold mb-3 ml-2">
                EMAIL
              </Text>
              <View
                className={`bg-white rounded-xl border-2 ${
                  emailFocused ? "border-gray-400" : "border-gray-200"
                }`}
              >
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
            <View className="relative py-3">
              <Text className="text-cyan-500 text-sm font-semibold mb-3 ml-2">
                PASSWORD
              </Text>
              <View
                className={`bg-white rounded-xl border-2 ${
                  passwordFocused ? "border-gray-400" : "border-gray-200"
                }`}
              >
                <TextInput
                  placeholder="••••••••"
                  className="px-6 py-2 text-gray-800 text-lg"
                  placeholderTextColor="#717474ff"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </View>
            </View>

            {/* Confirm Password */}
            <View className="relative py-3">
              <Text className="text-cyan-500 text-sm font-semibold mb-3 ml-2">
                CONFIRM PASSWORD
              </Text>
              <View
                className={`bg-white rounded-xl border-2 ${
                  confirmPasswordFocused ? "border-gray-400" : "border-gray-200"
                }`}
              >
                <TextInput
                  placeholder="••••••••"
                  className="px-6 py-2 text-gray-800 text-lg"
                  placeholderTextColor="#717474ff"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                />
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className={`mt-8 bg-cyan-500 rounded-xl py-5 ${
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
                    <Text className="text-white text-xl font-bold ml-3">
                      Registering...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-center text-xl font-bold text-white">
                    Register →
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="-mt-6">
            <Pressable onPress={() => router.push("/login")} className="py-4">
              <Text className="text-center text-cyan-600 text-base">
                Already have an account?{" "}
                <Text className="text-cyan-600 font-bold">Login</Text>
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
              <Text className="text-xl font-bold text-cyan-600 mb-3">
                Success!
              </Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;
