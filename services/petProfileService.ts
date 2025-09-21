import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

// WeightEntry type for weight history
export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
}

// PetProfile type with weight history
export interface PetProfile {
  id?: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  adoptionDate?: string;
  photoUrl?: string;
  healthInfo?: {
    weightHistory: WeightEntry[];
    allergies?: string[];
    conditions?: string[];
  };
}

// 1 Create a new pet profile
export const createPetProfile = async (pet: PetProfile) => {
  const petData = {
    ...pet,
    healthInfo: pet.healthInfo || { weightHistory: [], allergies: [], conditions: [] }, // Initialize healthInfo
  };
  try {
    const docRef = await addDoc(collection(db, 'petProfiles'), petData);
    return { id: docRef.id, ...petData };
  } catch (error) {
    throw new Error('Failed to create pet profile');
  }
};

// 2 Get all pet profiles
export const getAllPetProfiles = async (): Promise<PetProfile[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'petProfiles'));
    const pets: PetProfile[] = [];
    querySnapshot.forEach((docSnap) => {
      pets.push({ id: docSnap.id, ...docSnap.data() } as PetProfile);
    });
    return pets;
  } catch (error) {
    throw new Error('Failed to fetch pet profiles');
  }
};

// 3 Update a pet profile
export const updatePetProfile = async (id: string, pet: Partial<PetProfile>) => {
  try {
    const docRef = doc(db, 'petProfiles', id);
    await updateDoc(docRef, pet);
  } catch (error) {
    throw new Error('Failed to update pet profile');
  }
};

// 4 Delete a pet profile
export const deletePetProfile = async (petId: string) => {
  try {
    const docRef = doc(db, 'petProfiles', petId);
    await deleteDoc(docRef);
  } catch (error) {
    throw new Error('Failed to delete pet profile');
  }
};

// 5 Get a pet profile by ID
export const getPetById = async (id: string): Promise<PetProfile | null> => {
  try {
    const docRef = doc(db, 'petProfiles', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as PetProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching pet:', error);
    return null;
  }
};

// 6 Get weight history for a pet
export const getWeightHistory = async (petId: string): Promise<WeightEntry[]> => {
  try {
    const pet = await getPetById(petId);
    return pet?.healthInfo?.weightHistory || [];
  } catch (error) {
    console.error('Error fetching weight history:', error);
    throw new Error('Failed to fetch weight history');
  }
};