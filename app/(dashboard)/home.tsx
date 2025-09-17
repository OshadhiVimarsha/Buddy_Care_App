import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, Dimensions } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, Search } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const SPACING = width * 0.05;
const CAROUSEL_WIDTH = CARD_WIDTH + SPACING;
const CARD_HEIGHT = 200;

const Home = () => {
  const { userName } = useAuth();

  return (
    <LinearGradient colors={["#ffffffff", "#ffffffff"]} className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mt-12 mb-6">
          <View>
            <Text className="text-3xl font-bold text-cyan-600">Hello,</Text>
            <Text className="text-3xl font-bold text-cyan-600">{userName || "User"}</Text>
          </View>
          <TouchableOpacity>
            <Bell size={28} color="#06b6d4" />
          </TouchableOpacity>
        </View>

        {/* Promo / Banner */}
        <LinearGradient
          colors={["#06b6d4", "#065467ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-3xl p-6 mb-6 shadow-lg"
        >
          <Text className="text-xl font-bold text-white mb-2">We Give Preference To Your Pets</Text>
          <Text className="text-white mb-4">No code need. Plus free shipping on $99+ orders!</Text>
          <TouchableOpacity className="bg-white px-4 py-2 rounded-full self-start">
            <Text className="text-cyan-600 font-bold">Adopt A Pet</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Search */}
        <View className="flex-row items-center justify-between bg-white rounded-full px-5 py-2 mb-6 border border-cyan-600">
          <TextInput
            placeholder="Search pets..."
            placeholderTextColor="#3c3c3cff"
            className="flex-1 text-base text-gray-800"
          />
          <TouchableOpacity className="ml-3 p-2 bg-cyan-600 rounded-full">
            <Search size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <Text className="text-xl font-semibold text-gray-800 mb-3">Find Best Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {["Dogs", "Cats", "Rabbits", "Parrot"].map((cat) => (
            <TouchableOpacity key={cat} className="bg-white rounded-xl p-6 mr-4 shadow-md items-center justify-center w-32 h-32">
              <Image source={{ uri: `https://dummyimage.com/100x100/06b6d4/fff&text=${cat}` }} className="w-16 h-16 mb-2" />
              <Text className="font-bold text-gray-800">{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Pet Services */}
        <Text className="text-xl font-semibold text-gray-800 mb-3">Our Pet Care Services</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10">
          {["Pet Grooming", "Walking and Sitting", "Dog Training"].map((service) => (
            <TouchableOpacity key={service} className="bg-gray-200 rounded-xl p-4 mr-4 shadow-md w-40 items-center justify-center">
              <Text className="font-bold text-gray-800">{service}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </ScrollView>
    </LinearGradient>
  );
};

export default Home;
