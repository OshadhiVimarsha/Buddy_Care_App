import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getPetById, updatePetProfile } from "@/services/petProfileService";
import { PetProfile } from "@/types/petProfile";
import {
  PawPrint,
  ArrowLeft,
  Edit3,
  Heart,
  Calendar,
  User,
  Activity,
  Stethoscope,
  ClipboardList,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Weight,
  MapPin,
  Phone,
  Target,
  TrendingUp,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";

const { width, height } = Dimensions.get("window");

// Custom Alert Modal (unchanged)
const CustomAlertModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  title,
  message,
  type = 'info',
  showCancel = false,
  confirmText = 'OK',
  cancelText = 'Cancel',
  isLoading = false 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose && onClose());
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      handleClose();
    }
  };

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          colors: ['#dcfce7', '#16a34a', '#15803d'],
          bgColors: ['#ffffff', '#f0fdf4', '#ffffff'],
          shadowColor: '#16a34a',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          colors: ['#fef3c7', '#f59e0b', '#d97706'],
          bgColors: ['#ffffff', '#fffbeb', '#ffffff'],
          shadowColor: '#f59e0b',
        };
      case 'error':
        return {
          icon: AlertTriangle,
          colors: ['#fecaca', '#ef4444', '#dc2626'],
          bgColors: ['#ffffff', '#fef2f2', '#ffffff'],
          shadowColor: '#ef4444',
        };
      default:
        return {
          icon: PawPrint,
          colors: ['#bfdbfe', '#3b82f6', '#2563eb'],
          bgColors: ['#ffffff', '#eff6ff', '#ffffff'],
          shadowColor: '#3b82f6',
        };
    }
  };

  const config = getIconConfig();
  const IconComponent = config.icon;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          opacity: fadeAnim,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: width - 40,
            maxWidth: 400,
          }}
        >
          <LinearGradient
            colors={config.bgColors}
            className="rounded-3xl p-8 border border-gray-100"
            style={{
              shadowColor: config.shadowColor,
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.25,
              shadowRadius: 30,
              elevation: 20,
            }}
          >
            <TouchableOpacity
              onPress={handleClose}
              className="absolute top-4 right-4 bg-gray-100 rounded-full p-2"
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>

            <View className="items-center mb-6">
              <LinearGradient
                colors={config.colors}
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{
                  shadowColor: config.shadowColor,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <IconComponent size={36} color="white" />
              </LinearGradient>
            </View>

            <View className="items-center mb-8">
              <Text className="text-3xl font-black text-gray-800 mb-3 text-center">
                {title}
              </Text>
              <Text className="text-lg text-gray-600 text-center leading-6">
                {message}
              </Text>
            </View>

            <View className={`${showCancel ? 'flex-row space-x-4' : ''}`}>
              {showCancel && (
                <TouchableOpacity
                  onPress={handleClose}
                  disabled={isLoading}
                  className="flex-1 bg-gray-100 rounded-2xl py-4 border border-gray-200"
                >
                  <Text className="text-center text-gray-700 font-bold text-lg">
                    {cancelText}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleConfirm}
                disabled={isLoading}
                className={`${showCancel ? 'flex-1' : 'w-full'} rounded-2xl py-4`}
              >
                <LinearGradient
                  colors={config.colors.slice(1)}
                  className="rounded-2xl py-4"
                >
                  <Text className="text-center text-white font-bold text-lg">
                    {isLoading ? 'Loading...' : confirmText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Form Modal Component (unchanged)
const FormModal = ({ visible, onClose, onSave, title, children, isLoading = false }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  return (
    <Modal 
      transparent 
      visible={visible} 
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
          opacity: fadeAnim,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: '100%',
            maxWidth: 400,
            maxHeight: height * 0.8,
          }}
        >
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            className="rounded-3xl p-6 border border-cyan-200"
            style={{
              shadowColor: '#0891b2',
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.3,
              shadowRadius: 30,
              elevation: 20,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-4 right-4 bg-gray-100 rounded-full p-2 z-10"
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>

            <Text className="text-2xl font-bold text-center text-gray-800 mb-6 pr-10">
              {title}
            </Text>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: height * 0.5 }}
            >
              {children}
            </ScrollView>

            <View className="flex-row justify-between mt-6 space-x-3">
              <TouchableOpacity
                onPress={onClose}
                disabled={isLoading}
                className="flex-1 bg-gray-100 rounded-2xl py-4"
              >
                <Text className="text-center text-gray-700 font-bold text-lg">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onSave}
                disabled={isLoading}
                className="flex-1 rounded-2xl py-4"
                style={{
                  shadowColor: '#0891b2',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <LinearGradient
                  colors={['#0891b2', '#06b6d4']}
                  className="rounded-2xl py-4 flex-row items-center justify-center"
                >
                  <Save size={18} color="white" style={{ marginRight: 6 }} />
                  <Text className="text-center text-white font-bold text-lg">
                    {isLoading ? 'Saving...' : 'Save'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const PetDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editBreed, setEditBreed] = useState("");
  const [editAgeYears, setEditAgeYears] = useState("");
  const [editAgeMonths, setEditAgeMonths] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editBirthdate, setEditBirthdate] = useState("");
  const [editAdoptionDate, setEditAdoptionDate] = useState("");
  const [editPhoto, setEditPhoto] = useState("");

  // Modal states
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showVetVisitModal, setShowVetVisitModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);

  // Form states for modals
  const [weightForm, setWeightForm] = useState({ date: '', weight: '' });
  const [allergyForm, setAllergyForm] = useState('');
  const [conditionForm, setConditionForm] = useState('');
  const [vetVisitForm, setVetVisitForm] = useState({
    date: '',
    reason: '',
    notes: '',
    clinicName: '',
    address: '',
    phone: '',
    doctorName: ''
  });
  const [trainingForm, setTrainingForm] = useState({
    task: '',
    date: '',
    progress: '',
    notes: ''
  });

  // Edit states
  const [editingWeightIndex, setEditingWeightIndex] = useState(-1);
  const [editingVetIndex, setEditingVetIndex] = useState(-1);
  const [editingTrainingIndex, setEditingTrainingIndex] = useState(-1);

  // Alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    showCancel: false,
    onConfirm: null as (() => void) | null,
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', options = {}) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      showCancel: false,
      onConfirm: null,
      confirmText: 'OK',
      cancelText: 'Cancel',
      ...options
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const resetForms = () => {
    setWeightForm({ date: '', weight: '' });
    setAllergyForm('');
    setConditionForm('');
    setVetVisitForm({
      date: '',
      reason: '',
      notes: '',
      clinicName: '',
      address: '',
      phone: '',
      doctorName: ''
    });
    setTrainingForm({
      task: '',
      date: '',
      progress: '',
      notes: ''
    });
    setEditingWeightIndex(-1);
    setEditingVetIndex(-1);
    setEditingTrainingIndex(-1);
  };

  const updatePetData = async (updatedPet: PetProfile) => {
    try {
      setIsUpdating(true);
      await updatePetProfile(pet!.id!, updatedPet);
      setPet(updatedPet);
      showAlert('Success', 'Updated successfully!', 'success');
    } catch (error) {
      showAlert('Error', 'Failed to update. Please try again.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Weight History Functions
  const handleSaveWeight = async () => {
    if (!weightForm.date || !weightForm.weight) {
      showAlert('Warning', 'Please fill all required fields', 'warning');
      return;
    }

    const weight = parseFloat(weightForm.weight);
    if (isNaN(weight) || weight <= 0) {
      showAlert('Warning', 'Please enter a valid weight', 'warning');
      return;
    }

    const updatedPet = { ...pet! };
    if (!updatedPet.healthInfo) {
      updatedPet.healthInfo = { weightHistory: [], allergies: [], conditions: [] };
    }

    const newWeight: WeightEntry = { 
      id: editingWeightIndex >= 0 ? updatedPet.healthInfo.weightHistory[editingWeightIndex].id : Date.now().toString(),
      date: weightForm.date, 
      weight 
    };

    if (editingWeightIndex >= 0) {
      updatedPet.healthInfo.weightHistory[editingWeightIndex] = newWeight;
    } else {
      updatedPet.healthInfo.weightHistory.push(newWeight);
    }

    await updatePetData(updatedPet);
    setShowWeightModal(false);
    resetForms();
  };

  const handleDeleteWeight = async (index: number) => {
    const updatedPet = { ...pet! };
    updatedPet.healthInfo!.weightHistory.splice(index, 1);
    await updatePetData(updatedPet);
  };

  const handleEditWeight = (index: number) => {
    const weight = pet!.healthInfo!.weightHistory[index];
    setWeightForm({
      date: weight.date,
      weight: weight.weight.toString()
    });
    setEditingWeightIndex(index);
    setShowWeightModal(true);
  };

  // Allergy Functions
  const handleSaveAllergy = async () => {
    if (!allergyForm.trim()) {
      showAlert('Warning', 'Please enter an allergy', 'warning');
      return;
    }

    const updatedPet = { ...pet! };
    if (!updatedPet.healthInfo) {
      updatedPet.healthInfo = { weightHistory: [], allergies: [], conditions: [] };
    }

    if (!updatedPet.healthInfo.allergies!.includes(allergyForm.trim())) {
      updatedPet.healthInfo.allergies!.push(allergyForm.trim());
      await updatePetData(updatedPet);
    }

    setShowAllergyModal(false);
    resetForms();
  };

  const handleDeleteAllergy = async (index: number) => {
    const updatedPet = { ...pet! };
    updatedPet.healthInfo!.allergies!.splice(index, 1);
    await updatePetData(updatedPet);
  };

  // Condition Functions
  const handleSaveCondition = async () => {
    if (!conditionForm.trim()) {
      showAlert('Warning', 'Please enter a condition', 'warning');
      return;
    }

    const updatedPet = { ...pet! };
    if (!updatedPet.healthInfo) {
      updatedPet.healthInfo = { weightHistory: [], allergies: [], conditions: [] };
    }

    if (!updatedPet.healthInfo.conditions!.includes(conditionForm.trim())) {
      updatedPet.healthInfo.conditions!.push(conditionForm.trim());
      await updatePetData(updatedPet);
    }

    setShowConditionModal(false);
    resetForms();
  };

  const handleDeleteCondition = async (index: number) => {
    const updatedPet = { ...pet! };
    updatedPet.healthInfo!.conditions!.splice(index, 1);
    await updatePetData(updatedPet);
  };

  // Vet Visit Functions
  const handleSaveVetVisit = async () => {
    if (!vetVisitForm.date || !vetVisitForm.reason) {
      showAlert('Warning', 'Date and reason are required', 'warning');
      return;
    }

    const updatedPet = { ...pet! };
    if (!updatedPet.vetVisits) {
      updatedPet.vetVisits = [];
    }

    const newVisit: VetVisit = {
      date: vetVisitForm.date,
      reason: vetVisitForm.reason,
      notes: vetVisitForm.notes || undefined,
      clinicInfo: (vetVisitForm.clinicName || vetVisitForm.address || vetVisitForm.phone || vetVisitForm.doctorName) ? {
        clinicName: vetVisitForm.clinicName || undefined,
        address: vetVisitForm.address || undefined,
        phone: vetVisitForm.phone || undefined,
        doctorName: vetVisitForm.doctorName || undefined,
      } : undefined
    };

    if (editingVetIndex >= 0) {
      updatedPet.vetVisits[editingVetIndex] = newVisit;
    } else {
      updatedPet.vetVisits.push(newVisit);
    }

    await updatePetData(updatedPet);
    setShowVetVisitModal(false);
    resetForms();
  };

  const handleDeleteVetVisit = async (index: number) => {
    const updatedPet = { ...pet! };
    updatedPet.vetVisits!.splice(index, 1);
    await updatePetData(updatedPet);
  };

  const handleEditVetVisit = (index: number) => {
    const visit = pet!.vetVisits![index];
    setVetVisitForm({
      date: visit.date,
      reason: visit.reason,
      notes: visit.notes || '',
      clinicName: visit.clinicInfo?.clinicName || '',
      address: visit.clinicInfo?.address || '',
      phone: visit.clinicInfo?.phone || '',
      doctorName: visit.clinicInfo?.doctorName || ''
    });
    setEditingVetIndex(index);
    setShowVetVisitModal(true);
  };

  // Training Functions
  const handleSaveTraining = async () => {
    if (!trainingForm.task || !trainingForm.date || !trainingForm.progress) {
      showAlert('Warning', 'Task, date and progress are required', 'warning');
      return;
    }

    const progress = parseFloat(trainingForm.progress);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      showAlert('Warning', 'Progress must be between 0 and 100', 'warning');
      return;
    }

    const updatedPet = { ...pet! };
    if (!updatedPet.trainingLog) {
      updatedPet.trainingLog = [];
    }

    const newTraining: TrainingEntry = {
      task: trainingForm.task,
      date: trainingForm.date,
      progress,
      notes: trainingForm.notes || undefined
    };

    if (editingTrainingIndex >= 0) {
      updatedPet.trainingLog[editingTrainingIndex] = newTraining;
    } else {
      updatedPet.trainingLog.push(newTraining);
    }

    await updatePetData(updatedPet);
    setShowTrainingModal(false);
    resetForms();
  };

  const handleDeleteTraining = async (index: number) => {
    const updatedPet = { ...pet! };
    updatedPet.trainingLog!.splice(index, 1);
    await updatePetData(updatedPet);
  };

  const handleEditTraining = (index: number) => {
    const training = pet!.trainingLog![index];
    setTrainingForm({
      task: training.task,
      date: training.date,
      progress: training.progress.toString(),
      notes: training.notes || ''
    });
    setEditingTrainingIndex(index);
    setShowTrainingModal(true);
  };

  useEffect(() => {
    const fetchPet = async () => {
      try {
        if (id) {
          const data = await getPetById(id);
          setPet(data);
          
          // Initialize edit form
          setEditName(data.name);
          setEditBreed(data.breed || "");
          const years = Math.floor(data.age || 0);
          const months = Math.round(((data.age || 0) - years) * 12);
          setEditAgeYears(years.toString());
          setEditAgeMonths(months.toString());
          setEditGender(data.gender || "");
          setEditBirthdate(data.birthdate || "");
          setEditAdoptionDate(data.adoptionDate || "");
          setEditPhoto(data.photo || "");

          // Start animations
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
        }
      } catch (err) {
        showAlert("Error", "Failed to fetch pet details", "error");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleSave = async () => {
    if (!editName || !editBreed) {
      showAlert("Warning", "Name and Breed are required!", "warning");
      return;
    }

    const years = parseInt(editAgeYears) || 0;
    const months = parseInt(editAgeMonths) || 0;

    if ((isNaN(years) || years < 0) || (isNaN(months) || months < 0 || months > 11)) {
      showAlert("Warning", "Please enter a valid age (years and months).", "warning");
      return;
    }

    setIsUpdating(true);
    try {
      const updatedPet: PetProfile = {
        ...pet!,
        name: editName,
        breed: editBreed,
        age: years + (months / 12),
        gender: editGender || undefined,
        birthdate: editBirthdate || undefined,
        adoptionDate: editAdoptionDate || undefined,
        photo: editPhoto || undefined,
      };

      await updatePetProfile(pet!.id!, updatedPet);
      setPet(updatedPet);
      setEditMode(false);
      showAlert("Success", "Pet updated successfully!", "success");
    } catch (error) {
      showAlert("Error", "Failed to update pet. Please try again.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const getDisplayAge = (age: number | undefined) => {
    if (age === undefined || isNaN(age)) {
      return "Age unknown";
    }
    const years = Math.floor(age);
    const months = Math.round((age - years) * 12);
    let display = "";
    if (years > 0) {
      display += `${years} year${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
      if (display.length > 0) display += " ";
      display += `${months} month${months > 1 ? 's' : ''}`;
    }
    return display.trim() || "0 months";
  };

  const InfoCard = ({ icon: Icon, title, children, delay = 0, onAdd }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: cardAnim,
          transform: [{
            translateY: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            })
          }]
        }}
      >
        <LinearGradient
          colors={['#ffffff', '#f0f9ff']}
          className="rounded-3xl p-6 mb-6 border border-cyan-100"
          style={{
            shadowColor: '#0891b2',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-cyan-100 p-3 rounded-2xl mr-4">
                <Icon size={24} color="#0891b2" />
              </View>
              <Text className="text-xl font-bold text-gray-800">{title}</Text>
            </View>
            {onAdd && (
              <TouchableOpacity
                onPress={onAdd}
                className="bg-cyan-500 p-2 rounded-xl"
                style={{
                  shadowColor: '#0891b2',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Plus size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
          {children}
        </LinearGradient>
      </Animated.View>
    );
  };

  // Prepare data for weight history chart
  const weightHistory = pet?.healthInfo?.weightHistory || [];
  const sortedWeightHistory = [...weightHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const chartData = {
    labels: sortedWeightHistory.map(entry => {
      const date = new Date(entry.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: sortedWeightHistory.map(entry => entry.weight),
        color: (opacity = 1) => `rgba(8, 145, 178, ${opacity})`, // Cyan color
        strokeWidth: 2
      }
    ]
  };

  if (loading) {
    return (
      <LinearGradient colors={["#f0f9ff", "#e0f2fe", "#f8fafc"]} className="flex-1">
        <View className="flex-1 justify-center items-center">
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
              Loading pet details...
            </Text>
          </LinearGradient>
        </View>
      </LinearGradient>
    );
  }

  if (!pet) {
    return (
      <LinearGradient colors={["#f0f9ff", "#e0f2fe", "#f8fafc"]} className="flex-1">
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-lg">Pet not found</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#f0f9ff", "#e0f2fe", "#f8fafc"]} className="flex-1">
        {/* Header */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <LinearGradient
            colors={['#0891b2', '#06b6d4', '#0891b2']}
            className="pt-12 pb-8 px-6 rounded-b-[40px]"
            style={{
              shadowColor: '#0891b2',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.4,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <View className="flex-row items-center justify-between mt-8">
              <TouchableOpacity
                onPress={() => router.push("/pets")}
                className="bg-white/20 p-3 rounded-2xl border border-white/30"
              >
                <ArrowLeft color="white" size={24} />
              </TouchableOpacity>
              
              <Text 
                className="text-2xl font-black text-white"
                style={{
                  textShadowColor: 'rgba(0,0,0,0.3)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                Pet Profile
              </Text>

              <TouchableOpacity
                onPress={() => setEditMode(!editMode)}
                className="bg-white/20 p-3 rounded-2xl border border-white/30"
              >
                <Edit3 color="white" size={24} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        <ScrollView 
          className="flex-1 px-6 -mt-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Pet Profile Card - Combined Avatar and Basic Info */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }}
            className="mb-8"
          >
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              className="rounded-4xl p-8 border border-cyan-100"
              style={{
                shadowColor: '#0891b2',
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 16,
              }}
            >
              {/* Header with Icon */}
              <View className="flex-row items-center mb-6">
                <View className="bg-cyan-100 p-3 rounded-2xl mr-4">
                  <User size={24} color="#0891b2" />
                </View>
                <Text className="text-xl font-bold text-gray-800">Pet Profile</Text>
              </View>

              {/* Pet Avatar Section */}
              <View className="items-center mb-8">
                <View className="relative mb-6">
                  {pet.photo ? (
                    <Image
                      source={{ uri: pet.photo }}
                      className="w-40 h-40 rounded-full border-4 border-cyan-100"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 12 },
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                      }}
                    />
                  ) : (
                    <LinearGradient
                      colors={['#0891b2', '#06b6d4']}
                      className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-white"
                      style={{
                        shadowColor: '#0891b2',
                        shadowOffset: { width: 0, height: 12 },
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                        elevation: 12,
                      }}
                    >
                      <PawPrint size={48} color="white" />
                    </LinearGradient>
                  )}
                  
                  <View className="absolute -top-3 -left-3 w-38 h-38 rounded-full border-2 border-cyan-200/50" />
                </View>

                <Text className="text-4xl font-black text-gray-800 mb-3">{pet.name}</Text>
                <View className="px-6 py-3 rounded-2xl mb-6">
                  <Text className="text-cyan-700 font-bold text-xl">
                    {pet.breed || "Unknown Breed"}
                  </Text>
                </View>
              </View>

              {/* Basic Information */}
              <View className="bg-gray-50 rounded-2xl p-6">
                <Text className="text-lg font-bold text-gray-800 mb-4">Basic Information</Text>
                <View className="space-y-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-600 font-medium">Age -</Text>
                    <Text className="text-gray-800 font-bold">{getDisplayAge(pet.age)}</Text>
                  </View>
                  {pet.gender && (
                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="text-gray-600 font-medium">Gender -</Text>
                      <View className="bg-purple-100 px-3 py-1 rounded-full">
                        <Text className="text-purple-700 font-bold">{pet.gender}</Text>
                      </View>
                    </View>
                  )}
                  {pet.birthdate && (
                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="text-gray-600 font-medium">Birthdate -</Text>
                      <View className="bg-blue-100 px-3 py-1 rounded-full">
                        <Text className="text-blue-700 font-bold">{pet.birthdate}</Text>
                      </View>
                    </View>
                  )}
                  {pet.adoptionDate && (
                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="text-gray-600 font-medium">Adoption Date -</Text>
                      <View className="bg-green-100 px-3 py-1 rounded-full">
                        <Text className="text-green-700 font-bold">{pet.adoptionDate}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Health Info */}
          <InfoCard icon={Stethoscope} title="Health Information" delay={200}>
            <View className="space-y-4">
              {/* Weight History */}
              <View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-700 font-semibold">Weight History</Text>
                  <TouchableOpacity
                    onPress={() => {
                      resetForms();
                      setShowWeightModal(true);
                    }}
                    className="bg-cyan-500 px-3 py-1 rounded-lg"
                  >
                    <Text className="text-white font-medium text-xs">Add</Text>
                  </TouchableOpacity>
                </View>
                {weightHistory.length > 0 ? (
                  <>
                    <View className="mb-4">
                      <LineChart
                        data={chartData}
                        width={width - 80} // Adjust to fit within padding
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix="kg"
                        chartConfig={{
                          backgroundColor: "#ffffff",
                          backgroundGradientFrom: "#f0f9ff",
                          backgroundGradientTo: "#f0f9ff",
                          decimalPlaces: 1,
                          color: (opacity = 1) => `rgba(8, 145, 178, ${opacity})`,
                          labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`, // Gray-800
                          style: {
                            borderRadius: 16,
                          },
                          propsForDots: {
                            r: "6",
                            strokeWidth: "2",
                            stroke: "#0891b2",
                          },
                        }}
                        bezier
                        style={{
                          marginVertical: 8,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: '#e5e7eb', // Gray-200
                        }}
                      />
                    </View>
                    {pet.healthInfo!.weightHistory.map((weight, idx) => (
                      <View key={weight.id} className="bg-gray-50 p-3 rounded-2xl mb-2 flex-row justify-between items-center">
                        <View>
                          <Text className="text-gray-800 font-bold">{weight.weight} kg</Text>
                          <Text className="text-gray-600 text-sm">{weight.date}</Text>
                        </View>
                        <View className="flex-row space-x-2">
                          <TouchableOpacity
                            onPress={() => handleEditWeight(idx)}
                            className="bg-blue-500 p-2 rounded-lg"
                          >
                            <Edit3 size={14} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteWeight(idx)}
                            className="bg-red-500 p-2 rounded-lg"
                          >
                            <Trash2 size={14} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </>
                ) : (
                  <Text className="text-gray-500 italic">No weight records</Text>
                )}
              </View>

              {/* Allergies */}
              <View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-700 font-semibold">Allergies</Text>
                  <TouchableOpacity
                    onPress={() => {
                      resetForms();
                      setShowAllergyModal(true);
                    }}
                    className="bg-cyan-500 px-3 py-1 rounded-lg"
                  >
                    <Text className="text-white font-medium text-xs">Add</Text>
                  </TouchableOpacity>
                </View>
                {pet.healthInfo?.allergies?.length > 0 ? (
                  <View className="flex-row flex-wrap">
                    {pet.healthInfo.allergies.map((allergy, idx) => (
                      <View key={idx} className="bg-red-100 px-3 py-2 rounded-full mr-2 mb-2 flex-row items-center">
                        <Text className="text-red-700 font-medium">{allergy}</Text>
                        <TouchableOpacity
                          onPress={() => handleDeleteAllergy(idx)}
                          className="ml-2"
                        >
                          <X size={14} color="#b91c1c" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-gray-500 italic">No allergies recorded</Text>
                )}
              </View>

              {/* Conditions */}
              <View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-700 font-semibold">Conditions</Text>
                  <TouchableOpacity
                    onPress={() => {
                      resetForms();
                      setShowConditionModal(true);
                    }}
                    className="bg-cyan-500 px-3 py-1 rounded-lg"
                  >
                    <Text className="text-white font-medium text-xs">Add</Text>
                  </TouchableOpacity>
                </View>
                {pet.healthInfo?.conditions?.length > 0 ? (
                  <View className="flex-row flex-wrap">
                    {pet.healthInfo.conditions.map((condition, idx) => (
                      <View key={idx} className="bg-yellow-100 px-3 py-2 rounded-full mr-2 mb-2 flex-row items-center">
                        <Text className="text-yellow-700 font-medium">{condition}</Text>
                        <TouchableOpacity
                          onPress={() => handleDeleteCondition(idx)}
                          className="ml-2"
                        >
                          <X size={14} color="#a16207" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-gray-500 italic">No conditions recorded</Text>
                )}
              </View>
            </View>
          </InfoCard>

          {/* Vet Visits */}
          <InfoCard 
            icon={Activity} 
            title="Vet Visits" 
            delay={300} 
            onAdd={() => {
              resetForms();
              setShowVetVisitModal(true);
            }}
          >
            {pet.vetVisits?.length > 0 ? (
              <View className="space-y-3">
                {pet.vetVisits.map((visit, idx) => (
                  <View key={idx} className="bg-gray-50 p-4 rounded-2xl">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-gray-800 font-bold text-lg">{visit.reason}</Text>
                        <Text className="text-gray-600 mb-2">{visit.date}</Text>
                        {visit.notes && (
                          <Text className="text-gray-700 mb-2">{visit.notes}</Text>
                        )}
                        {visit.clinicInfo && (
                          <View className="bg-blue-50 p-3 rounded-xl">
                            {visit.clinicInfo.clinicName && (
                              <Text className="text-blue-800 font-semibold">{visit.clinicInfo.clinicName}</Text>
                            )}
                            {visit.clinicInfo.doctorName && (
                              <Text className="text-blue-600">Dr. {visit.clinicInfo.doctorName}</Text>
                            )}
                            {visit.clinicInfo.address && (
                              <Text className="text-blue-600 text-sm">{visit.clinicInfo.address}</Text>
                            )}
                            {visit.clinicInfo.phone && (
                              <Text className="text-blue-600 text-sm">{visit.clinicInfo.phone}</Text>
                            )}
                          </View>
                        )}
                      </View>
                      <View className="flex-row space-x-2 ml-2">
                        <TouchableOpacity
                          onPress={() => handleEditVetVisit(idx)}
                          className="bg-blue-500 p-2 rounded-lg"
                        >
                          <Edit3 size={14} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteVetVisit(idx)}
                          className="bg-red-500 p-2 rounded-lg"
                        >
                          <Trash2 size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500 italic">No vet visits recorded</Text>
            )}
          </InfoCard>

          {/* Training Log */}
          <InfoCard 
            icon={Target} 
            title="Training Log" 
            delay={400} 
            onAdd={() => {
              resetForms();
              setShowTrainingModal(true);
            }}
          >
            {pet.trainingLog?.length > 0 ? (
              <View className="space-y-3">
                {pet.trainingLog.map((training, idx) => (
                  <View key={idx} className="bg-gray-50 p-4 rounded-2xl">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-gray-800 font-bold text-lg">{training.task}</Text>
                        <Text className="text-gray-600 mb-2">{training.date}</Text>
                        <View className="flex-row items-center mb-2">
                          <TrendingUp size={16} color="#10b981" />
                          <Text className="text-green-600 font-semibold ml-1">{training.progress}% Complete</Text>
                        </View>
                        {training.notes && (
                          <Text className="text-gray-700">{training.notes}</Text>
                        )}
                      </View>
                      <View className="flex-row space-x-2 ml-2">
                        <TouchableOpacity
                          onPress={() => handleEditTraining(idx)}
                          className="bg-blue-500 p-2 rounded-lg"
                        >
                          <Edit3 size={14} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteTraining(idx)}
                          className="bg-red-500 p-2 rounded-lg"
                        >
                          <Trash2 size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500 italic">No training records</Text>
            )}
          </InfoCard>

          <View className="h-20" />
        </ScrollView>

        {/* Edit Modal */}
        <Modal 
          animationType="slide" 
          transparent 
          visible={editMode} 
          onRequestClose={() => setEditMode(false)}
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
                <View className="items-center mb-8">
                  <LinearGradient
                    colors={['#0891b2', '#06b6d4']}
                    className="p-4 rounded-2xl mb-4"
                  >
                    <Edit3 size={32} color="white" />
                  </LinearGradient>
                  <Text className="text-3xl font-bold text-center text-gray-800">
                    Edit Pet Profile
                  </Text>
                  <Text className="text-gray-600 text-center mt-2">
                    Update your pet's information
                  </Text>
                </View>

                <View className="space-y-4">
                  <View>
                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Pet Name *</Text>
                    <TextInput
                      placeholder="Enter pet name"
                      value={editName}
                      onChangeText={setEditName}
                      className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Breed *</Text>
                    <TextInput
                      placeholder="Enter breed"
                      value={editBreed}
                      onChangeText={setEditBreed}
                      className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                    />
                  </View>
                  
                  <View>
                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Age</Text>
                    <View className="flex-row justify-between space-x-2">
                      <View className="flex-1">
                        <TextInput
                          placeholder="Years"
                          value={editAgeYears}
                          onChangeText={setEditAgeYears}
                          keyboardType="numeric"
                          className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                        />
                      </View>
                      <View className="flex-1">
                        <TextInput
                          placeholder="Months"
                          value={editAgeMonths}
                          onChangeText={setEditAgeMonths}
                          keyboardType="numeric"
                          className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                        />
                      </View>
                    </View>
                  </View>
                  
                  <View>
                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Gender</Text>
                    <TextInput
                      placeholder="Male/Female"
                      value={editGender}
                      onChangeText={setEditGender}
                      className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Birthdate</Text>
                    <TextInput
                      placeholder="YYYY-MM-DD"
                      value={editBirthdate}
                      onChangeText={setEditBirthdate}
                      className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Adoption Date</Text>
                    <TextInput
                      placeholder="YYYY-MM-DD"
                      value={editAdoptionDate}
                      onChangeText={setEditAdoptionDate}
                      className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-semibold mb-2 ml-1">Photo URL</Text>
                    <TextInput
                      placeholder="Enter photo URL"
                      value={editPhoto}
                      onChangeText={setEditPhoto}
                      className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800 font-medium"
                    />
                  </View>
                </View>

                <View className="flex-row justify-between mt-8 space-x-3">
                  <TouchableOpacity
                    onPress={() => setEditMode(false)}
                    className="flex-1 bg-gray-100 rounded-2xl py-4"
                    disabled={isUpdating}
                  >
                    <Text className="text-center text-gray-700 font-bold text-lg">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    className="flex-1 rounded-2xl py-4"
                    disabled={isUpdating}
                    style={{
                      opacity: isUpdating ? 0.7 : 1,
                      shadowColor: '#0891b2',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <LinearGradient
                      colors={['#0891b2', '#06b6d4']}
                      className="rounded-2xl py-4 flex-row items-center justify-center"
                    >
                      <Save size={20} color="white" style={{ marginRight: 8 }} />
                      <Text className="text-center text-white font-bold text-lg">
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </ScrollView>
          </View>
        </Modal>

        {/* Weight History Modal */}
        <FormModal
          visible={showWeightModal}
          onClose={() => {
            setShowWeightModal(false);
            resetForms();
          }}
          onSave={handleSaveWeight}
          title={editingWeightIndex >= 0 ? "Edit Weight Record" : "Add Weight Record"}
          isLoading={isUpdating}
        >
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Date *</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={weightForm.date}
                onChangeText={(text) => setWeightForm({...weightForm, date: text})}
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
              />
            </View>
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Weight (kg) *</Text>
              <TextInput
                placeholder="Enter weight"
                value={weightForm.weight}
                onChangeText={(text) => setWeightForm({...weightForm, weight: text})}
                keyboardType="numeric"
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
              />
            </View>
          </View>
        </FormModal>

        {/* Allergy Modal */}
        <FormModal
          visible={showAllergyModal}
          onClose={() => {
            setShowAllergyModal(false);
            resetForms();
          }}
          onSave={handleSaveAllergy}
          title="Add Allergy"
          isLoading={isUpdating}
        >
          <View>
            <Text className="text-gray-700 font-semibold mb-2">Allergy *</Text>
            <TextInput
              placeholder="Enter allergy"
              value={allergyForm}
              onChangeText={setAllergyForm}
              className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
            />
          </View>
        </FormModal>

        {/* Condition Modal */}
        <FormModal
          visible={showConditionModal}
          onClose={() => {
            setShowConditionModal(false);
            resetForms();
          }}
          onSave={handleSaveCondition}
          title="Add Condition"
          isLoading={isUpdating}
        >
          <View>
            <Text className="text-gray-700 font-semibold mb-2">Condition *</Text>
            <TextInput
              placeholder="Enter condition"
              value={conditionForm}
              onChangeText={setConditionForm}
              className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
            />
          </View>
        </FormModal>

        {/* Vet Visit Modal */}
        <FormModal
          visible={showVetVisitModal}
          onClose={() => {
            setShowVetVisitModal(false);
            resetForms();
          }}
          onSave={handleSaveVetVisit}
          title={editingVetIndex >= 0 ? "Edit Vet Visit" : "Add Vet Visit"}
          isLoading={isUpdating}
        >
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Date *</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={vetVisitForm.date}
                onChangeText={(text) => setVetVisitForm({...vetVisitForm, date: text})}
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
              />
            </View>
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Reason *</Text>
              <TextInput
                placeholder="Reason for visit"
                value={vetVisitForm.reason}
                onChangeText={(text) => setVetVisitForm({...vetVisitForm, reason: text})}
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
              />
            </View>
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Notes</Text>
              <TextInput
                placeholder="Additional notes"
                value={vetVisitForm.notes}
                onChangeText={(text) => setVetVisitForm({...vetVisitForm, notes: text})}
                multiline
                numberOfLines={3}
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
              />
            </View>
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Clinic Name</Text>
              <TextInput
                placeholder="Enter clinic name"
                value={vetVisitForm.clinicName}
                onChangeText={(text) => setVetVisitForm({...vetVisitForm, clinicName: text})}
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
              />
            </View>
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Doctor Name</Text>
              <TextInput
                placeholder="Enter doctor name"
                value={vetVisitForm.doctorName}
                onChangeText={(text) => setVetVisitForm({...vetVisitForm, doctorName: text})}
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
              />
            </View>
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Address</Text>
              <TextInput
                placeholder="Clinic address"
                value={vetVisitForm.address}
                onChangeText={(text) => setVetVisitForm({...vetVisitForm, address: text})}
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
              />
            </View>
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Phone</Text>
              <TextInput
                placeholder="Phone number"
                value={vetVisitForm.phone}
                onChangeText={(text) => setVetVisitForm({...vetVisitForm, phone: text})}
                keyboardType="phone-pad"
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
              />
            </View>
          </View>
        </FormModal>

        {/* Training Modal */}
        <FormModal
          visible={showTrainingModal}
          onClose={() => {
            setShowTrainingModal(false);
            resetForms();
          }}
          onSave={handleSaveTraining}
          title={editingTrainingIndex >= 0 ? "Edit Training Record" : "Add Training Record"}
          isLoading={isUpdating}
        >
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Task *</Text>
              <TextInput
                placeholder="Training task"
                value={trainingForm.task}
                onChangeText={(text) => setTrainingForm({...trainingForm, task: text})}
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
              />
            </View>
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Date *</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={trainingForm.date}
                onChangeText={(text) => setTrainingForm({...trainingForm, date: text})}
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
              />
            </View>
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Progress (0-100) *</Text>
              <TextInput
                placeholder="Enter progress percentage"
                value={trainingForm.progress}
                onChangeText={(text) => setTrainingForm({...trainingForm, progress: text})}
                keyboardType="numeric"
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
              />
            </View>
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Notes</Text>
              <TextInput
                placeholder="Training notes"
                value={trainingForm.notes}
                onChangeText={(text) => setTrainingForm({...trainingForm, notes: text})}
                multiline
                numberOfLines={3}
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 text-gray-800"
              />
            </View>
          </View>
        </FormModal>

        {/* Custom Alert Modal */}
        <CustomAlertModal
          visible={alertConfig.visible}
          onClose={hideAlert}
          onConfirm={alertConfig.onConfirm || hideAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          showCancel={alertConfig.showCancel}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
          isLoading={isUpdating}
        />
      </LinearGradient>
    </>
  );
};

export default PetDetailsScreen;