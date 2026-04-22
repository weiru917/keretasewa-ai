import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "keretasewa-b766b.firebaseapp.com",
  projectId: "keretasewa-b766b",
  storageBucket: "keretasewa-b766b.firebasestorage.app",
  messagingSenderId: "947342954285",
  appId: "1:947342954285:web:e03bb5b80600aa7c8c0da4",
  measurementId: "G-VB3LTDF8P4"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)