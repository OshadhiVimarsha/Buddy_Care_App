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

// ➕ Create a reminder
export const createReminder = async (reminder: Reminder) => {
  const docRef = await addDoc(reminderCollection, reminder);
  return { ...reminder, id: docRef.id };
};

// 📖 Get all reminders
export const getAllReminders = async (): Promise<Reminder[]> => {
  const snapshot = await getDocs(reminderCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Reminder[];
};

// ✏️ Update a reminder
export const updateReminder = async (id: string, updatedData: Partial<Reminder>) => {
  const reminderDoc = doc(db, "reminders", id);
  await updateDoc(reminderDoc, updatedData);
};

// 🗑️ Delete a reminder
export const deleteReminder = async (id: string) => {
  const reminderDoc = doc(db, "reminders", id);
  await deleteDoc(reminderDoc);
};
