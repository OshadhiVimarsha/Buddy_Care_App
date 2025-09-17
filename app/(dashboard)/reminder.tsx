import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Dimensions, StatusBar } from "react-native";
import React, { useState, useEffect } from "react";
import { Bell, Search, Plus, Calendar, Clock, Edit, Trash2, Filter, MoreVertical, CheckCircle2 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  createReminder,
  getAllReminders,
  updateReminder,
  deleteReminder,
} from "../../services/reminderService";
import { Reminder } from "../../types/reminder";
import AwesomeAlert from "react-native-awesome-alerts";

const { width } = Dimensions.get('window');

const ReminderScreen = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Alerts
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);

  // Fetch all reminders from Firestore
  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const allReminders = await getAllReminders();
      setReminders(allReminders);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Handle adding or updating a reminder
  const handleSaveReminder = async () => {
    if (!title || !date || !time) {
      setAlertMessage("⚠️ Please fill in all fields.");
      setShowAlert(true);
      return;
    }

    const reminderData: Partial<Reminder> = { title, date, time };

    setIsLoading(true);
    try {
      if (isEditing && currentReminder?.id) {
        await updateReminder(currentReminder.id, reminderData);
        setAlertMessage("✅ Reminder updated successfully!");
      } else {
        await createReminder(reminderData as Reminder);
        setAlertMessage("✅ Reminder added successfully!");
      }
      setShowAlert(true);
      resetForm();
      fetchReminders();
    } catch (error) {
      console.error("Failed to save reminder:", error);
      setAlertMessage("❌ Failed to save reminder.");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reminder deletion
  const handleDeleteReminder = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteReminder(id);
      setAlertMessage("🗑️ Reminder deleted successfully!");
      setShowAlert(true);
      fetchReminders();
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      setAlertMessage("❌ Failed to delete reminder.");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const openModalForEdit = (reminder: Reminder) => {
    setIsEditing(true);
    setCurrentReminder(reminder);
    setTitle(reminder.title);
    setDate(reminder.date);
    setTime(reminder.time);
    setModalVisible(true);
  };

  const resetForm = () => {
    setTitle("");
    setDate("");
    setTime("");
    setCurrentReminder(null);
    setIsEditing(false);
    setModalVisible(false);
  };

  const filteredReminders = reminders.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getReminderIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('vet') || lowerTitle.includes('doctor')) return '🏥';
    if (lowerTitle.includes('food') || lowerTitle.includes('feed')) return '🍽️';
    if (lowerTitle.includes('walk') || lowerTitle.includes('exercise')) return '🚶‍♂️';
    if (lowerTitle.includes('medicine') || lowerTitle.includes('medication')) return '💊';
    if (lowerTitle.includes('grooming') || lowerTitle.includes('bath')) return '🛁';
    return '🔔';
  };

  const isUpcoming = (date: string, time: string) => {
    const now = new Date();
    const reminderDateTime = new Date(`${date} ${time}`);
    const timeDiff = reminderDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff > 0 && hoursDiff <= 24;
  };

  return (
    <LinearGradient colors={["#ffffff", "#f8fafc"]} className="flex-1">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mt-6 mb-2">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-4xl font-bold text-cyan-600 tracking-tight">Reminders ⏰</Text>
              <Text className="text-gray-500 text-lg mt-2 leading-relaxed">Never forget a pet-care task again</Text>
              <View className="flex-row items-center mt-3">
                <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
                  <Text className="text-green-700 text-sm font-semibold">{filteredReminders.length} Total</Text>
                </View>
                <View className="bg-orange-100 px-3 py-1 rounded-full">
                  <Text className="text-orange-700 text-sm font-semibold">
                    {filteredReminders.filter(r => isUpcoming(r.date, r.time)).length} Upcoming
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-white rounded-2xl px-6 py-4 mb-8 shadow-lg border border-gray-100 flex-row items-center" 
              style={{ elevation: 5 }}>
          <Search size={22} color="#06b6d4" />
          <TextInput
            placeholder="Search your reminders..."
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-4 text-base text-gray-800"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} className="ml-2">
              <Text className="text-cyan-600 font-semibold">Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats */}
        <View className="">
          
        </View>

        {/* Reminders List */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="bg-white rounded-2xl p-8 shadow-lg">
              <Text className="text-center text-gray-500 text-lg">Loading reminders...</Text>
              <View className="mt-4 bg-gray-200 h-2 rounded-full overflow-hidden">
                <LinearGradient
                  colors={["#06b6d4", "#0891b2"]}
                  className="h-full w-1/3 rounded-full"
                />
              </View>
            </View>
          </View>
        ) : filteredReminders.length > 0 ? (
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Your Reminders</Text>
              <Text className="text-gray-500">{filteredReminders.length} items</Text>
            </View>
            
            {filteredReminders.map((reminder, index) => (
              <View
                key={reminder.id}
                className={`bg-white rounded-2xl p-6 mb-4 shadow-lg border-l-4 ${
                  isUpcoming(reminder.date, reminder.time) 
                    ? 'border-l-orange-400 bg-orange-50' 
                    : 'border-l-cyan-400'
                }`}
                style={{ elevation: 5 }}
              >
                <View className="flex-row items-start">
                  <View className={`p-4 rounded-2xl mr-4 ${
                    isUpcoming(reminder.date, reminder.time) ? 'bg-orange-100' : 'bg-cyan-100'
                  }`}>
                    <Text className="text-2xl">{getReminderIcon(reminder.title)}</Text>
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-2">
                      <Text className="text-lg font-bold text-gray-800 flex-1 leading-tight">
                        {reminder.title}
                      </Text>
                      {isUpcoming(reminder.date, reminder.time) && (
                        <View className="bg-orange-200 px-2 py-1 rounded-full ml-2">
                          <Text className="text-orange-700 text-xs font-bold">URGENT</Text>
                        </View>
                      )}
                    </View>
                    
                    <View className="flex-row items-center mb-3">
                      <View className="flex-row items-center mr-4">
                        <Calendar size={16} color="#6b7280" />
                        <Text className="text-gray-600 text-sm ml-2 font-medium">{reminder.date}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Clock size={16} color="#6b7280" />
                        <Text className="text-gray-600 text-sm ml-2 font-medium">{reminder.time}</Text>
                      </View>
                    </View>
                    
                    <View className="flex-row justify-end space-x-2">
                      <TouchableOpacity 
                        onPress={() => openModalForEdit(reminder)} 
                        className="bg-blue-50 rounded-xl px-4 py-2 flex-row items-center right-2"
                      >
                        <Edit color="#1d4ed8" size={16} />
                        <Text className="text-blue-600 font-semibold ml-2 text-sm">Edit</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={() => {
                          setReminderToDelete(reminder.id!);
                          setConfirmDelete(true);
                        }}
                        className="bg-red-50 rounded-xl px-4 py-2 flex-row items-center"
                      >
                        <Trash2 color="#ef4444" size={16} />
                        <Text className="text-red-600 font-semibold ml-2 text-sm">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <View className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 items-center">
              <Text className="text-6xl mb-4">📅</Text>
              <Text className="text-xl font-bold text-gray-800 mb-2">No Reminders Yet</Text>
              <Text className="text-gray-500 text-center mb-6 leading-relaxed">
                Create your first reminder to keep track of your pet's important tasks
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="bg-cyan-600 rounded-2xl px-6 py-3"
              >
                <Text className="text-white font-bold">Add First Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/*Add Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-8 right-6 shadow-2xl "
        style={{ elevation: 15 }}
      >
        <LinearGradient
          colors={["#06b6d4", "#0891b2"]}
          className="rounded-2xl p-4"
        >
          <Plus color="white" size={28} />
        </LinearGradient>
      </TouchableOpacity>

      {/*Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={resetForm}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl shadow-2xl" style={{ maxHeight: '80%' }}>
            {/* Modal Header */}
            <View className="p-6 border-b border-gray-100">
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
              <Text className="text-2xl font-bold text-center text-gray-800">
                {isEditing ? "Edit Reminder ✏️" : "Add New Reminder ➕"}
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                {isEditing ? "Update your reminder details" : "Create a new buddy care reminder"}
              </Text>
            </View>

            <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
              {/* Form Fields */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2 text-base">Reminder Title</Text>
                <TextInput
                  placeholder="Reminder Title"
                  value={title}
                  onChangeText={setTitle}
                  className="bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200 text-gray-800 text-base"
                  style={{ elevation: 2 }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2 text-base">Date</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onChangeText={setDate}
                  className="bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200 text-gray-800 text-base"
                  style={{ elevation: 2 }}
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2 text-base">Time</Text>
                <TextInput
                  placeholder="HH:MM AM/PM"
                  value={time}
                  onChangeText={setTime}
                  className="bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200 text-gray-800 text-base"
                  style={{ elevation: 2 }}
                />
              </View>

              {/* Action Buttons */}
              <View className="mb-6">
                {/* Save Button */}
                <TouchableOpacity
                  onPress={handleSaveReminder}
                  disabled={isLoading}
                  className="mb-3"
                >
                  <LinearGradient
                    colors={isLoading ? ["#94a3b8", "#64748b"] : ["#06b6d4", "#0891b2"]}
                    className="rounded-2xl py-4 px-8 shadow-lg"
                    style={{ elevation: 5 }}
                  >
                    <View className="flex-row items-center justify-center">
                      {isLoading && (
                        <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      )}
                      <Text className="text-center text-white font-bold text-lg">
                        {isLoading ? "Saving..." : isEditing ? "✅ Update Reminder" : "➕ Create Reminder"}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Cancel Button*/}
                <TouchableOpacity 
                  onPress={resetForm} 
                  className="bg-transparent border-2 border-gray-300 rounded-2xl py-3 px-6"
                >
                  <Text className="text-center text-gray-600 font-semibold text-base">Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success / Error Alert */}
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="Notification"
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={true}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor="#0891b2"
        titleStyle={{ fontSize: 18, fontWeight: 'bold' }}
        messageStyle={{ fontSize: 16, textAlign: 'center', margin: 10 }}
        onConfirmPressed={() => {
          setShowAlert(false);
        }}
      />

      {/* Delete Confirmation Alert */}
      <AwesomeAlert
        show={confirmDelete}
        showProgress={false}
        title="Confirm Delete 🗑️"
        message="Are you sure you want to delete this reminder? This action cannot be undone."
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="Keep It"
        confirmText="Delete"
        confirmButtonColor="#ef4444"
        cancelButtonColor="#6b7280"
        titleStyle={{ fontSize: 18, fontWeight: 'bold' }}
        messageStyle={{ fontSize: 16, textAlign: 'center', margin: 10 }}
        onCancelPressed={() => setConfirmDelete(false)}
        onConfirmPressed={() => {
          if (reminderToDelete) {
            handleDeleteReminder(reminderToDelete);
          }
          setConfirmDelete(false);
        }}
      />
    </LinearGradient>
  );
};

export default ReminderScreen;