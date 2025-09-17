import { auth, db } from "@/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail, 
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

// Register user and save profile in Firestore
export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  // Create user with email and password
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  // Update display name in Firebase Auth
  await updateProfile(userCredential.user, { displayName: name })

  // Save additional info in Firestore
  await setDoc(doc(db, "users", userCredential.user.uid), {
    uid: userCredential.user.uid,
    name,
    email,
    createdAt: new Date(),
  })

  return userCredential
}

// Login user
export const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
}

// Logout user
export const logout = () => {
  return signOut(auth)
}

// ← Add this function for Forgot Password
export const forgotPassword = (email: string) => {
  return sendPasswordResetEmail(auth, email)
}