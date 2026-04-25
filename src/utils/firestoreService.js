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
  writeBatch,
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

// Save vehicles
export async function saveVehicles(uid, vehicles) {
  const colRef   = collection(db, 'users', uid, 'vehicles')
  const existing = await getDocs(colRef)
  const existingModels = existing.docs.map(d => d.data().model?.toLowerCase())

  const batch = writeBatch(db)
  for (const v of vehicles) {
    if (!existingModels.includes(v.model?.toLowerCase())) {
      const ref = doc(colRef)
      batch.set(ref, { ...v, addedAt: serverTimestamp() })
    }
  }
  await batch.commit()
}

// Get all vehicles for this user
export async function getVehicles(uid) {
  const snap = await getDocs(collection(db, 'users', uid, 'vehicles'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function updateVehicle(uid, vehicleId, data) {
  await updateDoc(doc(db, 'users', uid, 'vehicles', vehicleId), data)
}

export async function deleteVehicle(uid, vehicleId) {
  await deleteDoc(doc(db, 'users', uid, 'vehicles', vehicleId))
}

// BOOKINGS 

// Append new bookings — skip duplicates (same vehicle + date)
export async function appendBookings(uid, newBookings) {
  const colRef   = collection(db, 'users', uid, 'bookings')
  const existing = await getDocs(colRef)
  const existingKeys = new Set(
    existing.docs.map(d => `${d.data().vehicle}__${d.data().date}`)
  )

  const batch = writeBatch(db)
  let added = 0
  for (const b of newBookings) {
    const key = `${b.vehicle}__${b.date}`
    if (!existingKeys.has(key)) {
      const ref = doc(colRef)
      batch.set(ref, { ...b, addedAt: serverTimestamp() })
      added++
    }
  }
  await batch.commit()
  return added // how many new rows were added
}

// Get all bookings for this user
export async function getBookings(uid) {
  const q    = query(collection(db, 'users', uid, 'bookings'), orderBy('date', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addBooking(uid, booking) {
  const ref = await addDoc(collection(db, 'users', uid, 'bookings'), {
    ...booking, addedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateBooking(uid, bookingId, data) {
  await updateDoc(doc(db, 'users', uid, 'bookings', bookingId), {
    ...data, updatedAt: serverTimestamp(),
  })
}

export async function deleteBooking(uid, bookingId) {
  await deleteDoc(doc(db, 'users', uid, 'bookings', bookingId))
}