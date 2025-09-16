import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDEHGu6rgf4k0bZAGVRBgmz2hPPN6vmuyw",
  authDomain: "buddycareapp-ac31c.firebaseapp.com",
  projectId: "buddycareapp-ac31c",
  storageBucket: "buddycareapp-ac31c.firebasestorage.app",
  messagingSenderId: "743944044012",
  appId: "1:743944044012:web:bb187ebdfc5ae79065d4c9",
  measurementId: "G-KBB5SFRZKS"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)