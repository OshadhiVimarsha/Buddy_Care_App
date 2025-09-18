// services/petProfileService.ts
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // firebase config file එක

export type PetProfile = {
  id?: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  adoptionDate?: string;
  photoUrl?: string;
};

// 1️⃣ Create a new pet profile
export const createPetProfile = async (pet: PetProfile) => {
  const docRef = await addDoc(collection(db, "petProfiles"), pet);
  return { id: docRef.id, ...pet };
};

// 2️⃣ Get all pet profiles
export const getAllPetProfiles = async (): Promise<PetProfile[]> => {
  const querySnapshot = await getDocs(collection(db, "petProfiles"));
  const pets: PetProfile[] = [];
  querySnapshot.forEach((docSnap) => {
    pets.push({ id: docSnap.id, ...docSnap.data() } as PetProfile);
  });
  return pets;
};

// 3️⃣ Update a pet profile
export const updatePetProfile = async (id: string, pet: Partial<PetProfile>) => {
  const docRef = doc(db, "petProfiles", id);
  await updateDoc(docRef, pet);
};

// 4️⃣ Delete a pet profile
export const deletePetProfile = async (id: string) => {
  const docRef = doc(db, "petProfiles", id);
  await deleteDoc(docRef);
};

export const getPetById = async (id: string): Promise<PetProfile | null> => {
  try {
    const docRef = doc(db, "petProfiles", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as PetProfile;
    } else {
      return null; // document එක නොතිබේ නම්
    }
  } catch (error) {
    console.error("Error fetching pet:", error);
    return null;
  }
};