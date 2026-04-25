import { useState, useEffect } from 'react'
import { auth, db } from '../firebase'
import {
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
} from 'firebase/auth'

import { doc, deleteDoc } from 'firebase/firestore'
import { getUserProfile, updateUserProfile } from '../utils/firestoreService'
import { useFleetStore } from '../store/fleetStore'

/* ---------------- UI COMPONENTS ---------------- */

const Section = ({ title, message, children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  }}>
    <div style={{ fontSize: 14, fontWeight: 600, color: '#E5E7EB', marginBottom: 12 }}>
      {title}
    </div>

    {message && (
      <div style={{
        padding: '12px 14px',
        borderRadius: 10,
        marginBottom: 16,
        fontSize: 13,
        background: message.type === 'error'
          ? 'rgba(239,68,68,0.1)'
          : 'rgba(34,197,94,0.1)',
        border: `1px solid ${
          message.type === 'error'
            ? 'rgba(239,68,68,0.3)'
            : 'rgba(34,197,94,0.3)'
        }`,
        color: message.type === 'error' ? '#EF4444' : '#22C55E',
      }}>
        {message.text}
      </div>
    )}

    {children}
  </div>
)

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{
      fontSize: 12,
      color: '#9CA3AF',
      display: 'block',
      marginBottom: 6,
      fontWeight: 500
    }}>
      {label}
    </label>
    {children}
  </div>
)

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  color: '#E5E7EB',
  padding: '10px 14px',
  fontSize: 13,
  outline: 'none',
}

/* ---------------- PAGE ---------------- */

export default function SettingsPage() {
  const user = auth.currentUser
  const setUserProfile = useFleetStore(s => s.setUserProfile)

  /* Profile */
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [profileMsg, setProfileMsg] = useState(null)

  /* Password */
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [passwordMsg, setPasswordMsg] = useState(null)

  /* Delete */
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteMsg, setDeleteMsg] = useState(null)

  /* Load profile */
  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(profile => {
        if (profile) setDisplayName(profile.displayName || '')
      })
    }
  }, [user])

  /* ---------------- PROFILE ---------------- */
  const saveProfile = async () => {
    if (!user) return setProfileMsg({ text: 'Not authenticated', type: 'error' })

    try {
      await updateProfile(user, { displayName })
      await updateUserProfile(user.uid, { displayName })

      setUserProfile({ displayName, email: user.email })

      setProfileMsg({ text: 'Profile updated successfully', type: 'success' })
      setTimeout(() => setProfileMsg(null), 3000)
    } catch (e) {
      setProfileMsg({ text: e.message, type: 'error' })
    }
  }

  /* ---------------- PASSWORD ---------------- */
  const changePassword = async () => {
    if (!user) return setPasswordMsg({ text: 'Not authenticated', type: 'error' })

    if (newPw !== confirmPw) {
      return setPasswordMsg({ text: 'Passwords do not match', type: 'error' })
    }

    if (newPw.length < 6) {
      return setPasswordMsg({ text: 'Password too short', type: 'error' })
    }

    if (!pwConfirm) {
      return setPasswordMsg({ text: 'Enter current password', type: 'error' })
    }

    try {
      const cred = EmailAuthProvider.credential(user.email, pwConfirm)
      await reauthenticateWithCredential(user, cred)

      await updatePassword(user, newPw)

      setNewPw('')
      setConfirmPw('')
      setPwConfirm('')

      setPasswordMsg({ text: 'Password updated successfully', type: 'success' })
      setTimeout(() => setPasswordMsg(null), 3000)
    } catch (e) {
      setPasswordMsg({ text: e.message, type: 'error' })
    }
  }

  /* ---------------- DELETE ---------------- */
  const deleteAccount = async () => {
    if (!user) return setDeleteMsg({ text: 'Not authenticated', type: 'error' })

    if (deleteConfirm.trim().toUpperCase() !== 'DELETE') {
      return setDeleteMsg({ text: 'Type DELETE to confirm', type: 'error' })
    }

    if (!deletePassword) {
      return setDeleteMsg({ text: 'Enter password', type: 'error' })
    }

    try {
      const cred = EmailAuthProvider.credential(user.email, deletePassword)
      await reauthenticateWithCredential(user, cred)

      await deleteDoc(doc(db, 'users', user.uid))
      await deleteUser(user)

      setDeleteMsg({ text: 'Account deleted', type: 'success' })

      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    } catch (e) {
      setDeleteMsg({ text: e.message, type: 'error' })
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <div style={{ padding: 28, maxWidth: 600 }}>

      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
        Settings
      </h1>

      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 24 }}>
        Manage your account and preferences
      </div>

      {/* PROFILE */}
      <Section title="Profile" message={profileMsg}>
        <Field label="Email">
          <input style={{ ...inputStyle, opacity: 0.5 }} value={user?.email || ''} disabled />
        </Field>

        <Field label="Display name">
          <input
            style={inputStyle}
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
          />
        </Field>

        <button
          onClick={saveProfile}
          style={{
            background: '#253BAF',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Save profile
        </button>
      </Section>

      {/* PASSWORD */}
      <Section title="Change password" message={passwordMsg}>
        <Field label="Current password">
          <input
            style={inputStyle}
            type="password"
            value={pwConfirm}
            onChange={e => setPwConfirm(e.target.value)}
          />
        </Field>

        <Field label="New password">
          <input
            style={inputStyle}
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
          />
        </Field>

        <Field label="Confirm new password">
          <input
            style={inputStyle}
            type="password"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
          />
        </Field>

        <button
          onClick={changePassword}
          style={{
            background: '#253BAF',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Update password
        </button>
      </Section>

      {/* DELETE */}
      <Section title="Danger zone" message={deleteMsg}>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
          Type <b style={{ color: '#EF4444' }}>DELETE</b> to confirm account deletion
        </div>

        <Field label="Confirm">
          <input
            style={inputStyle}
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
            placeholder="Type DELETE"
          />
        </Field>

        <Field label="Password">
          <input
            style={inputStyle}
            type="password"
            value={deletePassword}
            onChange={e => setDeletePassword(e.target.value)}
            placeholder="Enter password"
          />
        </Field>

        <button
          onClick={deleteAccount}
          style={{
            background: '#EF4444',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Delete account
        </button>
      </Section>

    </div>
  )
}