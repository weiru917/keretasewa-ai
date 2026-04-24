import { db } from '../firebase'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

// USER PROFILE

// Called once on signup — creates the user document
export async function createUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    displayName: data.displayName || '',
    email:       data.email       || '',
    createdAt:   serverTimestamp(),
    currency:    'RM',
  })
}

// Fetch user profile
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

// Update user profile (name, currency, etc)
export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// VEHICLES 

// Save full vehicles array for this user
export async function saveVehicles(uid, vehicles) {
  // Delete old vehicles first, then re-add
  const colRef = collection(db, 'users', uid, 'vehicles')
  const existing = await getDocs(colRef)
  for (const d of existing.docs) await deleteDoc(d.ref)

  for (const v of vehicles) {
    await addDoc(colRef, {
      ...v,
      savedAt: serverTimestamp(),
    })
  }
}

// Get all vehicles for this user
export async function getVehicles(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'vehicles'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// BOOKINGS 

// Save full bookings array for this user
export async function saveBookings(uid, bookings) {
  const colRef = collection(db, 'users', uid, 'bookings')
  const existing = await getDocs(colRef)
  for (const d of existing.docs) await deleteDoc(d.ref)

  for (const b of bookings) {
    await addDoc(colRef, {
      ...b,
      savedAt: serverTimestamp(),
    })
  }
}

// Get all bookings for this user
export async function getBookings(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'bookings'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// AI RECOMMENDATIONS 

// Save AI recommendations (Person B calls this)
export async function saveRecommendations(uid, recommendations) {
  await setDoc(doc(db, 'users', uid, 'ai', 'recommendations'), {
    items:     recommendations,
    updatedAt: serverTimestamp(),
  })
}

// Get saved recommendations
export async function getRecommendations(uid) {
  const snap = await getDoc(doc(db, 'users', uid, 'ai', 'recommendations'))
  return snap.exists() ? snap.data().items : null
}