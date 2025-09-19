import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, Dimensions, Animated, StatusBar } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, Search, User, Settings, Calendar, Clock } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { getUpcomingReminders } from "@/services/reminderService";
import { Reminder } from "@/types/reminder";

const { width } = Dimensions.get('window');
const CARD_WIDTH = width;
const CARD_HEIGHT = 200;
const SPACING = 0;

const Home = () => {
  const { user } = useAuth();
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const scrollViewRef = useRef(null);
  const autoScrollTimer = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const petServices = [
    {
      title: "Pet Training",
      description: "Professional training for your pets",
      image: "https://live.staticflickr.com/8028/6954708844_9ef27fdc5b_n.jpg",
      color: ["#06b6d4", "#0891b2"]
    },
    {
      title: "Pet Health",
      description: "Complete health checkups & care",
      image: "https://aainform.co.za/wp-content/uploads/2024/04/aainform-pet-problems-1024x771.jpg",
      color: ["#4bbb7fff", "#0a532cff"]
    },
    {
      title: "Pet Vaccine",
      description: "Essential vaccinations for pets",
      image: "https://indyvetcare.com/wp-content/uploads/2022/06/veterinarian-giving-puppy-shot.jpg",
      color: ["#fe754fff", "#b33b0cff"]
    },
    {
      title: "Pet Grooming",
      description: "Professional grooming services",
      image: "https://tse4.mm.bing.net/th/id/OIP.VdCYekIIa-OwnMf9bgS6XwHaE8?pid=ImgDet&w=195&h=130&c=7&dpr=1.4&o=7&rm=3",
      color: ["#fa709a", "#ea2060ff"]
    }
  ];

  // Fetch upcoming reminders
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const upcomingReminders = await getUpcomingReminders();
        setReminders(upcomingReminders);
      } catch (error) {
        console.error("Error fetching reminders:", error);
      }
    };
    fetchReminders();
  }, []);

  // Filter and sort reminders by date (ascending)
  const filteredReminders = reminders
    .filter((reminder) => reminder.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Auto-scroll functionality
  useEffect(() => {
    autoScrollTimer.current = setInterval(() => {
      setCurrentServiceIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % petServices.length;
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: nextIndex * CARD_WIDTH,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 4000);

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [petServices.length]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / CARD_WIDTH);
        setCurrentServiceIndex(index);
      },
    }
  );

  const scrollToIndex = (index) => {
    setCurrentServiceIndex(index);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * CARD_WIDTH,
        animated: true,
      });
    }
  };

  // Animation for card press
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#06b6d4" translucent />
      
      <LinearGradient 
        colors={["#06b6d4", "#06b6d4"]} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-8 px-5"
      >
        {/* Modern Header */}
        <View className="flex-row justify-between items-center mb-4 mt-6">
          <View className="flex-1">
            <Text className="text-white/80 text-sm font-medium">{getGreeting()}</Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {user?.displayName || "Welcome back"}
            </Text>
            <View className="flex-row items-center mt-2">
              <Clock size={14} color="rgba(255,255,255,0.8)" />
              <Text className="text-white/80 text-sm ml-1">{getCurrentTime()}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between">
          <View className="bg-white/10 backdrop-blur px-4 py-3 rounded-2xl flex-1 mr-2">
            <Text className="text-white/80 text-xs font-medium">Today's Tasks</Text>
            <Text className="text-white text-xl font-bold">{filteredReminders.filter(r => {
              const today = new Date();
              const reminderDate = new Date(r.date);
              return reminderDate.toDateString() === today.toDateString();
            }).length}</Text>
          </View>
          <View className="bg-white/10 backdrop-blur px-4 py-3 rounded-2xl flex-1 ml-2">
            <Text className="text-white/80 text-xs font-medium">Total Reminders</Text>
            <Text className="text-white text-xl font-bold">{filteredReminders.length}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 20 }} 
        showsVerticalScrollIndicator={false}
        className="flex-1 -mt-4"
      >
        {/* Pet Services Banner */}
        <View className="mb-6 bg-white rounded-t-3xl pt-6">
          <Text className="text-xl font-bold text-gray-800 mb-4 px-5">Premium Services</Text>
          <View style={{ height: CARD_HEIGHT }}>
            <Animated.ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={CARD_WIDTH}
            >
              {petServices.map((service, index) => (
                <View key={index} style={{ width: CARD_WIDTH }}>
                  <LinearGradient
                    colors={service.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-3xl shadow-lg mx-5"
                    style={{ width: CARD_WIDTH - 40, height: CARD_HEIGHT - 20 }}
                  >
                    <View className="flex-row h-full items-center">
                      <View className="flex-1 p-6 justify-center">
                        <Text className="text-2xl font-bold text-white mb-2">{service.title}</Text>
                        <Text className="text-white/90 mb-4 text-base">{service.description}</Text>
                        <TouchableOpacity className="bg-white/20 px-5 py-3 rounded-full self-start">
                          <Text className="text-white font-bold text-base">Learn More</Text>
                        </TouchableOpacity>
                      </View>
                      <View className="w-40 h-full">
                        <Image
                          source={{ uri: service.image }}
                          className="w-full h-full rounded-r-3xl"
                          style={{ resizeMode: 'cover' }}
                        />
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </Animated.ScrollView>
          </View>
          <View className="flex-row justify-center mt-4">
            {petServices.map((_, index) => (
              <TouchableOpacity key={index} onPress={() => scrollToIndex(index)}>
                <View
                  className={`h-2 w-2 rounded mx-1 ${
                    index === currentServiceIndex ? "bg-cyan-600" : "bg-cyan-400"
                  }`}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Modern Search */}
        <View className="px-5 mb-6">
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <View className="flex-row items-center px-4 py-4">
              <Search size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Search your reminders..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-3 text-base text-gray-800"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Text className="text-indigo-600 font-medium">Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Modern Upcoming Reminders */}
        <View className="px-5">
          <Text className="text-xl font-bold text-gray-800 mb-4">Upcoming Reminders</Text>
          
          {filteredReminders.length > 0 ? (
            filteredReminders.map((reminder, index) => {
              const reminderDate = new Date(reminder.date);
              const today = new Date();
              const isToday = reminderDate.getFullYear() === today.getFullYear() &&
                              reminderDate.getMonth() === today.getMonth() &&
                              reminderDate.getDate() === today.getDate();
              
              const isTomorrow = (() => {
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                return reminderDate.getFullYear() === tomorrow.getFullYear() &&
                       reminderDate.getMonth() === tomorrow.getMonth() &&
                       reminderDate.getDate() === tomorrow.getDate();
              })();

              const cardColors = [
                "#667eea",
                "#f093fb", 
                "#4facfe",
                "#43e97b",
                "#fa709a",
                "#764ba2",
                "#f5576c",
                "#00f2fe",
                "#38f9d7",
                "#fee140"
              ];

              return (
                <TouchableOpacity
                  key={reminder.id}
                  className="mb-4"
                  activeOpacity={0.8}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => {}} // Add navigation or action if needed
                >
                  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <View className="bg-white rounded-3xl shadow-lg border border-gray-50 p-6">
                      <View className="flex-row items-start">
                        {/* Left side - Icon */}
                        <View 
                          className="p-4 rounded-2xl mr-4 shadow-sm"
                          style={{ backgroundColor: cardColors[index % cardColors.length] + '15' }}
                        >
                          <Bell size={28} color={cardColors[index % cardColors.length]} />
                        </View>
                        
                        {/* Right side - Content */}
                        <View className="flex-1">
                          <View className="flex-row items-start justify-between mb-2">
                            <Text className="text-lg font-bold text-gray-800 flex-1 pr-2">
                              {reminder.title}
                            </Text>
                            {(isToday || isTomorrow) && (
                              <View className={`px-3 py-1 rounded-full ${
                                isToday ? 'bg-red-50' : 'bg-orange-50'
                              }`}>
                                <Text className={`text-xs font-bold ${
                                  isToday ? 'text-red-600' : 'text-orange-600'
                                }`}>
                                  {isToday ? 'TODAY' : 'TOMORROW'}
                                </Text>
                              </View>
                            )}
                          </View>
                          
                          <View className="flex-row items-center">
                            <View className="bg-gray-100 p-1.5 rounded-lg mr-2">
                              <Calendar size={12} color="#6B7280" />
                            </View>
                            <Text className="text-sm font-medium text-gray-600">
                              {new Date(reminder.date).toLocaleDateString("en-GB", {
                                weekday: "short",
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </Text>
                          </View>
                          
                          {/* Progress bar */}
                          <View className="mt-4">
                            <View className="bg-gray-100 h-2 rounded-full overflow-hidden">
                              <View 
                                className="h-full rounded-full"
                                style={{ 
                                  backgroundColor: cardColors[index % cardColors.length],
                                  width: isToday ? '90%' : isTomorrow ? '70%' : '20%'
                                }}
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 items-center">
              <View className="bg-gray-50 p-4 rounded-full mb-3">
                <Bell size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-600 font-medium text-center mb-1">
                No reminders found
              </Text>
              <Text className="text-gray-400 text-sm text-center">
                {searchQuery ? "Try adjusting your search" : "You're all caught up!"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;