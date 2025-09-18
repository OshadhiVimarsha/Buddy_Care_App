import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Dimensions, StatusBar, Platform } from "react-native";
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
import * as Notifications from 'expo-notifications';
import { scheduleNotificationAsync, cancelScheduledNotificationAsync } from 'expo-notifications';

const { width } = Dimensions.get('window');

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => {
    try {
      console.log("Handling notification");
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    } catch (error) {
      console.error("Error in handleNotification:", error);
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }
  },
});

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

  // Request notification permissions
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn("Notification permissions not granted:", status);
          setAlertMessage("Notifications need permission to send reminders. Please enable notifications in your device settings.");
          setShowAlert(true);
        } else {
          console.log("Notification permissions granted");
        }
      } catch (error) {
        console.error("Error requesting notification permissions:", error);
        setAlertMessage("Failed to request notification permissions.");
        setShowAlert(true);
      }
    })();
  }, []);

  // Fetch all reminders from Firestore and filter out past ones
  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const allReminders = await getAllReminders();
      console.log("Fetched reminders:", JSON.stringify(allReminders, null, 2));

      const currentDate = new Date();
      console.log("Current date/time (IST):", currentDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      const validReminders = [];

      for (const reminder of allReminders) {
        try {
          if (!reminder.id || !reminder.date || !reminder.time) {
            console.warn(`Invalid data for reminder ${reminder.id || 'unknown'}:`, reminder);
            if (reminder.id) {
              console.log(`Deleting invalid reminder ${reminder.id}`);
              await deleteReminder(reminder.id);
            }
            continue;
          }

          const dateMatch = reminder.date.trim().match(/^\d{4}-\d{2}-\d{2}$/);
          if (!dateMatch) {
            console.warn(`Invalid date format for reminder ${reminder.id}: ${reminder.date}`);
            console.log(`Deleting invalid reminder ${reminder.id}`);
            await deleteReminder(reminder.id);
            continue;
          }

          const timeMatch = reminder.time.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (!timeMatch) {
            console.warn(`Invalid time format for reminder ${reminder.id}: ${reminder.time}`);
            console.log(`Deleting invalid reminder ${reminder.id}`);
            await deleteReminder(reminder.id);
            continue;
          }

          const [_, hours, minutes, period] = timeMatch;
          let hours24 = parseInt(hours);
          if (period.toUpperCase() === "PM" && hours24 !== 12) hours24 += 12;
          if (period.toUpperCase() === "AM" && hours24 === 12) hours24 = 0;

          const reminderDateTime = new Date(`${reminder.date.trim()}T${hours24.toString().padStart(2, '0')}:${minutes}:00+05:30`);

          if (isNaN(reminderDateTime.getTime())) {
            console.warn(`Invalid date/time for reminder ${reminder.id}: ${reminder.date} ${reminder.time}`);
            console.log(`Deleting invalid reminder ${reminder.id}`);
            await deleteReminder(reminder.id);
            continue;
          }

          console.log(`Reminder ${reminder.id} date/time (IST):`, reminderDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

          if (reminderDateTime < currentDate) {
            console.log(`Deleting past reminder ${reminder.id}: ${reminder.date} ${reminder.time}`);
            await deleteReminder(reminder.id);
            if (reminder.notificationIds && reminder.notificationIds.length > 0) {
              for (const notif of reminder.notificationIds) {
                await cancelScheduledNotificationAsync(notif.id);
                console.log(`Cancelled notification ${notif.id} for past reminder ${reminder.id}`);
              }
            }
          } else {
            validReminders.push(reminder);
          }
        } catch (error) {
          console.error(`Error processing reminder ${reminder.id || 'unknown'}:`, error);
        }
      }

      setReminders(validReminders);
      console.log("Valid reminders:", JSON.stringify(validReminders, null, 2));
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
      setAlertMessage(`Failed to load reminders: ${error.message || 'Unknown error'}`);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Schedule multiple notifications for a reminder
  const scheduleNotification = async (reminder: Reminder) => {
    try {
      console.log("Scheduling notifications for reminder:", JSON.stringify(reminder, null, 2));

      // Validate time format
      const timeMatch = reminder.time.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeMatch) {
        console.warn(`Invalid time format for notification: ${reminder.time}`);
        setAlertMessage("Invalid time format for notification.");
        setShowAlert(true);
        return false;
      }

      // Validate date format
      const dateMatch = reminder.date.trim().match(/^\d{4}-\d{2}-\d{2}$/);
      if (!dateMatch) {
        console.warn(`Invalid date format for notification: ${reminder.date}`);
        setAlertMessage("Invalid date format for notification.");
        setShowAlert(true);
        return false;
      }

      const [_, hours, minutes, period] = timeMatch;
      let hours24 = parseInt(hours);
      if (period.toUpperCase() === "PM" && hours24 !== 12) hours24 += 12;
      if (period.toUpperCase() === "AM" && hours24 === 12) hours24 = 0;

      // Explicitly set IST timezone (+05:30)
      const reminderDateTime = new Date(`${reminder.date.trim()}T${hours24.toString().padStart(2, '0')}:${minutes}:00+05:30`);
      const now = new Date();

      console.log("Reminder date/time (IST):", reminderDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      console.log("Current date/time (IST):", now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

      if (reminderDateTime <= now) {
        console.warn(`Cannot schedule notification for past reminder: ${reminder.id}`);
        setAlertMessage("Cannot schedule notification for a past date/time. Reminder saved without notification.");
        setShowAlert(true);
        return false;
      }

      // Schedule notification 1 hour before the reminder time (පැයකට කලින්)
      const notificationTime1HourBefore = new Date(reminderDateTime.getTime() - 60 * 60 * 1000);
      
      // Schedule notification 30 minutes before the reminder time (මිනිත්තු 30කට කලින්)
      const notificationTime30MinBefore = new Date(reminderDateTime.getTime() - 30 * 60 * 1000);
      
      // Schedule notification 10 minutes before the reminder time (මිනිත්තු 10කට කලින්)
      const notificationTime10MinBefore = new Date(reminderDateTime.getTime() - 10 * 60 * 1000);
      
      // Schedule notification at the exact reminder time (හරියටම reminder time එකේ)
      const notificationTimeExact = new Date(reminderDateTime.getTime());

      console.log("Notification times (IST):");
      console.log("- 1 hour before:", notificationTime1HourBefore.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      console.log("- 30 min before:", notificationTime30MinBefore.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      console.log("- 10 min before:", notificationTime10MinBefore.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      console.log("- Exact time:", notificationTimeExact.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

      // Array to store all notification IDs
      const notificationIds = [];

      // Schedule 1 hour before notification (පැයකට කලින්)
      if (notificationTime1HourBefore > now) {
        const trigger1 = { date: notificationTime1HourBefore };
        const notificationId1 = await scheduleNotificationAsync({
          content: {
            title: "Pet Reminder ⏰ (1 hour before)",
            body: `Coming up in 1 hour: ${reminder.title}`,
            sound: true,
            data: { reminderId: reminder.id, type: "1hour_before" },
          },
          trigger: trigger1,
        });
        notificationIds.push({ id: notificationId1, type: "1hour_before" });
        console.log(`1-hour notification scheduled with ID: ${notificationId1}`);
      }

      // Schedule 30 minutes before notification (මිනිත්තු 30කට කලින්)
      if (notificationTime30MinBefore > now) {
        const trigger2 = { date: notificationTime30MinBefore };
        const notificationId2 = await scheduleNotificationAsync({
          content: {
            title: "Pet Reminder ⏰ (30 min before)",
            body: `Coming up in 30 minutes: ${reminder.title}`,
            sound: true,
            data: { reminderId: reminder.id, type: "30min_before" },
          },
          trigger: trigger2,
        });
        notificationIds.push({ id: notificationId2, type: "30min_before" });
        console.log(`30-min notification scheduled with ID: ${notificationId2}`);
      }

      // Schedule 10 minutes before notification (මිනිත්තු 10කට කලින්)
      if (notificationTime10MinBefore > now) {
        const trigger3 = { date: notificationTime10MinBefore };
        const notificationId3 = await scheduleNotificationAsync({
          content: {
            title: "Pet Reminder ⏰ (10 min before)",
            body: `Coming up in 10 minutes: ${reminder.title}`,
            sound: true,
            data: { reminderId: reminder.id, type: "10min_before" },
          },
          trigger: trigger3,
        });
        notificationIds.push({ id: notificationId3, type: "10min_before" });
        console.log(`10-min notification scheduled with ID: ${notificationId3}`);
      }

      // Schedule exact time notification (හරියටම reminder time එකේ)
      const trigger4 = { date: notificationTimeExact };
      const notificationId4 = await scheduleNotificationAsync({
        content: {
          title: "Pet Reminder ⏰",
          body: `Time now: ${reminder.title}`,
          sound: true,
          data: { reminderId: reminder.id, type: "exact_time" },
        },
        trigger: trigger4,
      });
      notificationIds.push({ id: notificationId4, type: "exact_time" });
      console.log(`Exact time notification scheduled with ID: ${notificationId4}`);

      // Save all notification IDs to Firestore
      await updateReminder(reminder.id, { 
        notificationIds: notificationIds.map(n => ({ id: n.id, type: n.type }))
      });
      
      console.log(`Updated reminder ${reminder.id} with notification IDs:`, notificationIds);
      return true;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      setAlertMessage(`Failed to schedule notification: ${error.message || 'Unknown error'}. Reminder saved without notification.`);
      setShowAlert(true);
      return false;
    }
  };

  // Cancel all scheduled notifications for a reminder
  const cancelScheduledNotification = async (reminderId: string, notificationIds: {id: string, type: string}[] = []) => {
    try {
      if (notificationIds && notificationIds.length > 0) {
        // Cancel specific notifications
        for (const notification of notificationIds) {
          await cancelScheduledNotificationAsync(notification.id);
          console.log(`Notification cancelled for reminder ${reminderId}, type: ${notification.type}`);
        }
      } else {
        // Fallback: cancel all notifications (if no specific IDs are stored)
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log(`All notifications cancelled for reminder ${reminderId}`);
      }
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  };

  // Handle adding or updating a reminder
  const handleSaveReminder = async () => {
    console.log("handleSaveReminder called with:", { title, date, time });

    // Validate title (cannot be empty or only spaces)
    if (!title || title.trim().length === 0) {
      console.warn("Invalid title: empty or only spaces");
      setAlertMessage("Please enter a valid reminder title.");
      setShowAlert(true);
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!date.trim().match(dateRegex)) {
      console.warn("Invalid date format:", date);
      setAlertMessage("Please enter date in YYYY-MM-DD format (e.g., 2025-09-18).");
      setShowAlert(true);
      return;
    }

    // Validate time format (HH:MM AM/PM)
    const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const timeMatch = time.trim().match(timeRegex);
    if (!timeMatch) {
      console.warn("Invalid time format:", time);
      setAlertMessage("Please enter time in HH:MM AM/PM format (e.g., 10:00 AM).");
      setShowAlert(true);
      return;
    }

    const [_, hours, minutes, period] = timeMatch;
    if (!period) {
      console.error("Period is undefined for time:", time);
      setAlertMessage("Invalid time format: AM/PM missing.");
      setShowAlert(true);
      return;
    }
    let hours24 = parseInt(hours);
    if (period.toUpperCase() === "PM" && hours24 !== 12) hours24 += 12;
    if (period.toUpperCase() === "AM" && hours24 === 12) hours24 = 0;

    // Validate date and time
    const reminderDateTime = new Date(`${date.trim()}T${hours24.toString().padStart(2, '0')}:${minutes}:00+05:30`);
    if (isNaN(reminderDateTime.getTime())) {
      console.warn("Invalid date/time:", date, time);
      setAlertMessage("Invalid date/time. Please check your input.");
      setShowAlert(true);
      return;
    }

    const now = new Date();
    console.log("Reminder date/time (IST):", reminderDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.log("Current date/time (IST):", now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    if (reminderDateTime <= now) {
      console.warn("Past date/time entered:", date, time);
      setAlertMessage("Please enter a future date/time.");
      setShowAlert(true);
      return;
    }

    // Save original input values (with spaces)
    const reminderData: Partial<Reminder> = { title, date, time };

    setIsLoading(true);
    try {
      let reminderId: string;
      if (isEditing && currentReminder?.id) {
        console.log(`Updating reminder ${currentReminder.id}`);
        // Cancel existing notifications before updating
        await cancelScheduledNotification(currentReminder.id, currentReminder.notificationIds);
        await updateReminder(currentReminder.id, reminderData);
        reminderId = currentReminder.id;
        const updatedReminder = { ...currentReminder, ...reminderData };
        const notificationScheduled = await scheduleNotification(updatedReminder as Reminder);
        setAlertMessage(notificationScheduled ? "Reminder updated successfully with multiple notifications!" : "Reminder updated, but notifications not scheduled.");
      } else {
        console.log("Creating new reminder");
        const newReminder = await createReminder(reminderData as Reminder);
        reminderId = newReminder.id;
        const notificationScheduled = await scheduleNotification(newReminder);
        setAlertMessage(notificationScheduled ? "Reminder saved successfully with multiple notifications!" : "Reminder saved, but notifications not scheduled.");
      }
      setShowAlert(true);
      resetForm();
      fetchReminders();
    } catch (error) {
      console.error("Failed to save reminder:", error);
      setAlertMessage(`Failed to save reminder: ${error.message || 'Unknown error'}`);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reminder deletion
  const handleDeleteReminder = async (id: string, notificationIds: {id: string, type: string}[] = []) => {
    setIsLoading(true);
    try {
      console.log(`Deleting reminder ${id}`);
      await cancelScheduledNotification(id, notificationIds);
      await deleteReminder(id);
      setAlertMessage("Reminder deleted successfully!");
      setShowAlert(true);
      fetchReminders();
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      setAlertMessage(`Failed to delete reminder: ${error.message || 'Unknown error'}`);
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
    const timeMatch = time.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) {
      console.warn(`Invalid time format for isUpcoming: ${time}`);
      return false;
    }
    const [_, hours, minutes, period] = timeMatch;
    let hours24 = parseInt(hours);
    if (period.toUpperCase() === "PM" && hours24 !== 12) hours24 += 12;
    if (period.toUpperCase() === "AM" && hours24 === 12) hours24 = 0;
    const reminderDateTime = new Date(`${date.trim()}T${hours24.toString().padStart(2, '0')}:${minutes}:00+05:30`);
    if (isNaN(reminderDateTime.getTime())) {
      console.warn(`Invalid date/time for isUpcoming: ${date} ${time}`);
      return false;
    }
    const timeDiff = reminderDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff > 0 && hoursDiff <= 24;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#06b6d4" />
      
      {/* Fixed Header with Cyan Background */}
      <LinearGradient colors={["#06b6d4", "#0891b2"]} className="pt-12 pb-6 px-5 shadow-lg">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-4xl font-bold text-white tracking-tight">Reminders ⏰</Text>
            <Text className="text-cyan-100 text-lg mt-2 leading-relaxed">Never forget your pet care tasks again</Text>
            <View className="flex-row items-center mt-3">
              <View className="bg-white/20 px-3 py-1 rounded-full mr-3">
                <Text className="text-white text-sm font-semibold">{filteredReminders.length} Total</Text>
              </View>
              <View className="bg-orange-500/80 px-3 py-1 rounded-full">
                <Text className="text-white text-sm font-semibold">
                  {filteredReminders.filter(r => isUpcoming(r.date, r.time)).length} Upcoming
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Search Bar in Header */}
        <View className="bg-white/90 backdrop-blur rounded-2xl px-6 py-4 shadow-lg flex-row items-center" 
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
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20 }} 
        showsVerticalScrollIndicator={false}
      >
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
                Create your first reminder to track your pet care tasks
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

      {/* Add Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-8 right-6 shadow-2xl"
        style={{ elevation: 15 }}
      >
        <LinearGradient
          colors={["#06b6d4", "#0891b2"]}
          className="rounded-2xl p-4"
        >
          <Plus color="white" size={28} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal */}
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
                {isEditing ? "Update reminder details" : "Create a new pet care reminder"}
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
                <Text className="text-gray-500 text-xs mt-1">Format: Year-Month-Day (e.g., 2025-09-18)</Text>
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
                <Text className="text-gray-500 text-xs mt-1">Format: Hour:Minute AM/PM (e.g., 10:00 AM)</Text>
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

                {/* Cancel Button */}
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
            const reminder = reminders.find(r => r.id === reminderToDelete);
            handleDeleteReminder(reminderToDelete, reminder?.notificationIds || []);
          }
          setConfirmDelete(false);
        }}
      />
    </View>
  );
};

export default ReminderScreen;