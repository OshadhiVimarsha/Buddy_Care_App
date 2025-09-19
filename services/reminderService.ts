// services/reminderService.ts
import { db } from "@/firebase"; // oyāge firebase config file import karanna
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { Reminder } from "@/types/reminder";

const reminderCollection = collection(db, "reminders");

// Create a reminder
export const createReminder = async (reminder: Reminder) => {
  const docRef = await addDoc(reminderCollection, reminder);
  return { ...reminder, id: docRef.id };
};

// Get all reminders
export const getAllReminders = async (): Promise<Reminder[]> => {
  const snapshot = await getDocs(reminderCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Reminder[];
};

// Update a reminder
export const updateReminder = async (id: string, updatedData: Partial<Reminder>) => {
  const reminderDoc = doc(db, "reminders", id);
  await updateDoc(reminderDoc, updatedData);
};

// Delete a reminder
export const deleteReminder = async (id: string) => {
  const reminderDoc = doc(db, "reminders", id);
  await deleteDoc(reminderDoc);
};

//Get upcoming reminders (including today)
export const getUpcomingReminders = async (): Promise<Reminder[]> => {
  const currentDate = new Date();
  // Set time to 00:00:00 to compare only dates
  const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  const snapshot = await getDocs(reminderCollection);
  const allReminders = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Reminder[];

  // Filter reminders where date is today or in the future
  return allReminders.filter((reminder) => {
    const reminderDate = new Date(reminder.date); // Assuming 'date' field in Reminder
    const reminderDateStart = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate());
    return reminderDateStart >= todayStart;
  });
};