import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
  Animated,
  Dimensions,
} from "react-native"; 
import React, { useState, useEffect, useRef } from "react";
import { PawPrint, Plus, Trash2, Edit2, Search, Eye, Heart, Star, Calendar } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  createPetProfile,
  getAllPetProfiles,
  deletePetProfile,
  updatePetProfile,
} from "@/services/petProfileService";
import { PetProfile } from "@/types/petProfile";

const { width } = Dimensions.get('window');

const PetsScreen = () => {
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPet, setCurrentPet] = useState<PetProfile | null>(null);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [ageMonths, setAgeMonths] = useState("");
  const [photo, setPhoto] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [adoptionDate, setAdoptionDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const fetchPets = async () => {
    setIsLoading(true);
    try {
      const data = await getAllPetProfiles();
      setPets(data);
      
      // Animate pets list
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } catch {
      Alert.alert("Error", "Failed to fetch pets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const resetForm = () => {
    setName("");
    setBreed("");
    setAgeYears("");
    setAgeMonths("");
    setPhoto("");
    setGender("");
    setBirthdate("");
    setAdoptionDate("");
    setCurrentPet(null);
    setModalVisible(false);
    setIsEditMode(false);
  };

  const handleAddPet = async () => {
    if (!name || !breed) {
      Alert.alert("Warning", "Name and Breed are required!");
      return;
    }

    const years = parseInt(ageYears) || 0;
    const months = parseInt(ageMonths) || 0;

    if ((isNaN(years) || years < 0) || (isNaN(months) || months < 0 || months > 11)) {
      Alert.alert("Warning", "Enter a valid age (years and months).");
      return;
    }

    const newPet: PetProfile = {
      name,
      breed,
      age: years + (months / 12),
      photo: photo || undefined,
      gender: gender || undefined,
      birthDate: birthdate || undefined,
      adoptionDate: adoptionDate || undefined,
      healthInfo: { weightHistory: [], allergies: [], conditions: [] },
      vetVisits: [],
      trainingLog: [],
      reminders: [],
    };

    try {
      setIsLoading(true);
      await createPetProfile(newPet);
      Alert.alert("Success", "Pet added successfully!");
      resetForm();
      fetchPets();
    } catch {
      Alert.alert("Error", "Failed to add pet.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPets = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(search.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(search.toLowerCase())
  );

  const getDisplayAge = (age: number | undefined) => {
    if (age === undefined || isNaN(age)) {
      return "? yrs";
    }
    const years = Math.floor(age);
    const months = Math.round((age - years) * 12);
    let display = "";
    if (years > 0) {
      display += `${years} yr${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
      if (display.length > 0) display += " ";
      display += `${months} mo${months > 1 ? 's' : ''}`;
    }
    return display.trim() || "0 mos";
  };

  const PetCard = ({ pet, index }: { pet: PetProfile; index: number }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: cardAnim,
          transform: [
            {
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
            {
              scale: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        }}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          className="rounded-3xl p-6 mb-6 border border-cyan-100"
          style={{
            shadowColor: '#0891b2',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 12,
          }}
        >
          <View className="flex-row items-center">
            {/* Pet Avatar  Styling */}
            <View className="relative">
              {pet.photo ? (
                <>
                  <Image
                    source={{ uri: pet.photo }}
                    className="w-20 h-20 rounded-full border-4 border-white"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 16,
                      
                    }}
                  />
                </>
              ) : (
                <>
                  <LinearGradient
                    colors={['#0891b2', '#06b6d4']}
                    className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-white"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 16,
                      elevation: 8,
                    }}
                  >
                    <PawPrint color="white" size={32} />
                  </LinearGradient>
                  <View className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
                </>
              )}
              
              {/* Glow ring */}
              <View className="absolute -top-2 -left-2 w-24 h-24 rounded-full border border-cyan-200/50" />
            </View>

            {/* Pet Info */}
            <View className="flex-1 ml-6">
              <Text className="text-2xl font-bold text-gray-800 mb-1">{pet.name}</Text>
              

              <View className=" px-3 py-1 rounded-full mr-2">
                <Text className="text-cyan-700 font-semibold text-sm">
                  {pet.breed || "Unknown Breed"}
                </Text>
              </View>

              <View className=" px-3 py-1 rounded-full">
                <Text className="text-purple-700 font-semibold text-sm">
                  {getDisplayAge(pet.age)}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-col items-center space-y-3">
              {pet.id && (
                <TouchableOpacity
                  onPress={() => router.push(`/petDetails/${pet.id}`)}
                  className="bg-cyan-500 p-3 rounded-2xl border border-cyan-300"
                  style={{
                    shadowColor: '#0891b2',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Eye color="white" size={18} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={["#f0f9ff", "#e0f2fe", "#f8fafc"]} className="flex-1">
      {/* Enhanced Header */}
      <View className="relative pt-12 pb-8 px-6">
        <LinearGradient
          colors={['#0891b2', '#06b6d4', '#0891b2']}
          className="absolute inset-0 rounded-b-[50px]"
          style={{
            shadowColor: '#0891b2',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.4,
            shadowRadius: 24,
            elevation: 12,
          }}
        />
        
        <View className="relative z-10 mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-4xl font-black text-white mb-2" style={{
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}>
                My Pets
              </Text>
              <View className="flex-row items-center">
                <PawPrint size={16} color="white" />
                <Text className="text-white/90 ml-2 font-medium">
                  Manage your lovely pets
                </Text>
              </View>
            </View>
            
            <View className="bg-white/20 p-4 rounded-2xl border border-white/30">
              <Text className="text-white font-bold text-2xl">{pets.length}</Text>
              <Text className="text-white/80 text-xs">Pets</Text>
            </View>
          </View>

          {/* Enhanced Search Bar */}
          <View 
            className="flex-row items-center bg-white/95 rounded-2xl px-5 py-2 mt-2 border border-white/50"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View className=" p-2 rounded-xl mr-3">
              <Search size={20} color="#0891b2" />
            </View>
            <TextInput
              placeholder="Search your pets..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-gray-800 font-medium text-lg"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      </View>

      {/* Enhanced Content */}
      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="flex-1 justify-center items-center mt-20">
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              className="p-8 rounded-3xl border border-cyan-200"
              style={{
                shadowColor: '#0891b2',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <PawPrint size={48} color="#0891b2" />
              <Text className="text-center text-gray-600 mt-4 font-medium text-lg">
                Loading your pets...
              </Text>
            </LinearGradient>
          </View>
        ) : filteredPets.length > 0 ? (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
          >
            {filteredPets.map((pet, index) => (
              <PetCard key={pet.id} pet={pet} index={index} />
            ))}
          </Animated.View>
        ) : (
          <View className="flex-1 justify-center items-center mt-20">
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              className="p-12 rounded-3xl border border-gray-200 items-center"
              style={{
                shadowColor: '#6b7280',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <View className="bg-gray-100 p-6 rounded-full mb-6">
                <PawPrint size={48} color="#6b7280" />
              </View>
              <Text className="text-center text-gray-600 font-medium text-xl mb-2">
                No pets found
              </Text>
              <Text className="text-center text-gray-500 text-base">
                Add your first pet to get started!
              </Text>
            </LinearGradient>
          </View>
        )}
        
        {/* Bottom padding for floating button */}
        <View className="h-20" />
      </ScrollView>

      {/* Enhanced Add Button */}
      <TouchableOpacity
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
        className="absolute bottom-8 right-8"
        style={{
          shadowColor: '#0891b2',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 12,
        }}
      >
        <LinearGradient
          colors={['#0891b2', '#06b6d4']}
          className="rounded-full p-5"
        >
          <Plus color="white" size={28} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Enhanced Modal */}
      <Modal 
        animationType="slide" 
        transparent 
        visible={modalVisible} 
        onRequestClose={resetForm}
      >
        <View className="flex-1 bg-black/60">
          <ScrollView 
            contentContainerStyle={{ 
              flexGrow: 1, 
              justifyContent: 'center', 
              padding: 16,
              paddingVertical: 40
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              className="w-full max-w-sm mx-auto rounded-3xl p-8 border border-cyan-200"
              style={{
                shadowColor: '#0891b2',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.3,
                shadowRadius: 30,
                elevation: 20,
              }}
            >
              {/* Modal Header */}
              <View className="items-center mb-8">
                <LinearGradient
                  colors={['#0891b2', '#06b6d4']}
                  className="p-4 rounded-2xl mb-4"
                >
                  <PawPrint size={32} color="white" />
                </LinearGradient>
                <Text className="text-3xl font-bold text-center text-gray-800">
                  {isEditMode ? "Edit Pet" : "Add New Pet"}
                </Text>
                <Text className="text-gray-600 text-center mt-2">
                  {isEditMode ? "Update your pet's information" : "Create a profile for your pet"}
                </Text>
              </View>

              {/* Form Fields */}
              <View className="space-y-4">
                <View>
                  <Text className="text-gray-700 font-semibold mb-2 ml-1">Pet Name *</Text>
                  <TextInput
                    placeholder="Enter pet name"
                    value={name}
                    onChangeText={setName}
                    className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  />
                </View>

                <View>
                  <Text className="text-gray-700 font-semibold mb-2 ml-1">Breed *</Text>
                  <TextInput
                    placeholder="Enter breed"
                    value={breed}
                    onChangeText={setBreed}
                    className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  />
                </View>
                
                <View>
                  <Text className="text-gray-700 font-semibold mb-2 ml-1">Age</Text>
                  <View className="flex-row justify-between space-x-2">
                    <View className="flex-1">
                      <TextInput
                        placeholder="Years"
                        value={ageYears}
                        onChangeText={setAgeYears}
                        keyboardType="numeric"
                        className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      />
                    </View>
                    <View className="flex-1">
                      <TextInput
                        placeholder="Months"
                        value={ageMonths}
                        onChangeText={setAgeMonths}
                        keyboardType="numeric"
                        className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      />
                    </View>
                  </View>
                </View>
                
                <View>
                  <Text className="text-gray-700 font-semibold mb-2 ml-1">Gender</Text>
                  <TextInput
                    placeholder="Male/Female"
                    value={gender}
                    onChangeText={setGender}
                    className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  />
                </View>

                <View>
                  <Text className="text-gray-700 font-semibold mb-2 ml-1">Birthdate</Text>
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    value={birthdate}
                    onChangeText={setBirthdate}
                    className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  />
                </View>

                <View>
                  <Text className="text-gray-700 font-semibold mb-2 ml-1">Adoption Date</Text>
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    value={adoptionDate}
                    onChangeText={setAdoptionDate}
                    className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  />
                </View>

                <View>
                  <Text className="text-gray-700 font-semibold mb-2 ml-1">Photo URL</Text>
                  <TextInput
                    placeholder="Enter photo URL"
                    value={photo}
                    onChangeText={setPhoto}
                    className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row justify-between mt-8 space-x-3">
                <TouchableOpacity
                  onPress={resetForm}
                  className="flex-1 bg-gray-100 rounded-2xl py-4 right-1"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text className="text-center text-gray-700 font-bold text-lg">Cancel</Text>
                  
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddPet} // save function
                  className="flex-1 bg-cyan-500 rounded-2xl py-4 left-1"
                  style={{
                    shadowColor: '#0891b2',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text className="text-center text-white font-bold text-lg">Save</Text>
                </TouchableOpacity>
              </View> 
            </LinearGradient>
          </ScrollView>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default PetsScreen; 