import React, { useEffect, useRef, useState } from "react"
import { View, Text, TouchableOpacity, Animated, Image } from "react-native"
import { useRouter } from "expo-router"
import DogImage from "../../assets/images/welcome6.png"

const Welcome = () => {
  const router = useRouter()

  // Typewriter effect
  const fullText = "Welcome Back"
  const [displayText, setDisplayText] = useState("")

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const imageScale = useRef(new Animated.Value(1)).current
  const buttonScale = useRef(new Animated.Value(1)).current
  const bgAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Background animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
        Animated.timing(bgAnim, { toValue: 0, duration: 1000, useNativeDriver: false }),
      ])
    ).start()

    // Fade + slide heading
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start()

    // Dog image subtle animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(imageScale, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(imageScale, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  // Interpolate background color
  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffffff", "#ffffffff"],
  })

  // Button press animation
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => router.push("/"))
  }

  

  return (
    <Animated.View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: bgColor,
        padding: 24,
      }}
    >
      {/* Heading */}
      <Animated.Text
        style={{
          fontSize: 40,
          fontWeight: "800",
          color: "#0891B2",
          marginBottom: 24,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        Welcome Back
      </Animated.Text>

      {/* Dog Image */}
      <Animated.Image
        source={DogImage}
        style={{
          width: 400,
          height: 500,
          bottom: -30,
          borderRadius: 40,
          marginBottom: 30,
          transform: [{ scale: imageScale }],
          opacity: fadeAnim,
        }}
        resizeMode="cover"
      />

      {/* Get Started Button */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: buttonScale }],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          style={{
            backgroundColor: "#0891B2",
            paddingVertical: 16,
            paddingHorizontal: 40,
            borderRadius: 30,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
          onPress={handlePress}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#ffffffff" }}>
            Get Started
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  )
}

export default Welcome
