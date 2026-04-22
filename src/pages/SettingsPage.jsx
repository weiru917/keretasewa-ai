import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import {
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
} from 'firebase/auth'

const Section = ({ title, children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 24, marginBottom: 16,
  }}>
    <div style={{ fontSize: 14, fontWeight: 600, color: '#E5E7EB', marginBottom: 20 }}>{title}</div>
    {children}
  </div>
)

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: 12, color: '#9CA3AF', display: 'block', marginBottom: 6, fontWeight: 500 }}>
      {label}
    </label>
    {children}
  </div>
)

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
  color: '#E5E7EB', padding: '10px 14px', fontSize: 13, outline: 'none',
}

export default function SettingsPage() {
  const user = auth.currentUser
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })

  const flash = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 3000)
  }

  const saveProfile = async () => {
    try {
      await updateProfile(user, { displayName })
      flash('Profile updated successfully')
    } catch (e) {
      flash(e.message, 'error')
    }
  }

  const changePassword = async () => {
    if (newPw !== confirmPw) return flash('Passwords do not match', 'error')
    if (newPw.length < 6) return flash('Password must be at least 6 characters', 'error')
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw)
      await reauthenticateWithCredential(user, cred)
      await updatePassword(user, newPw)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      flash('Password changed successfully')
    } catch (e) {
      flash(e.message, 'error')
    }
  }

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return flash('Type DELETE to confirm', 'error')
    try {
      await deleteUser(user)
    } catch (e) {
      flash(e.message, 'error')
    }
  }

  const btnStyle = (color = '#253BAF') => ({
    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
    border: `1px solid ${color}44`,
    borderRadius: 10, color: 'white',
    padding: '10px 20px', fontSize: 13,
    fontWeight: 500, cursor: 'pointer', marginTop: 4,
  })

  return (
    <div style={{ padding: 28, maxWidth: 600 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', letterSpacing: -0.3 }}>Settings</h1>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>Manage your account and preferences</div>
      </div>

      {msg.text && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13,
          background: msg.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
          border: `1px solid ${msg.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
          color: msg.type === 'error' ? '#EF4444' : '#22C55E',
        }}>
          {msg.text}
        </div>
      )}

      {/* Profile */}
      <Section title="Profile">
        <Field label="Email address">
          <input style={{ ...inputStyle, opacity: 0.5 }} value={user?.email || ''} disabled />
        </Field>
        <Field label="Display name">
          <input style={inputStyle} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
        </Field>
        <button style={btnStyle()} onClick={saveProfile}>Save profile</button>
      </Section>

      {/* Change password */}
      <Section title="Change password">
        <Field label="Current password">
          <input style={inputStyle} type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Enter current password" />
        </Field>
        <Field label="New password">
          <input style={inputStyle} type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters" />
        </Field>
        <Field label="Confirm new password">
          <input style={inputStyle} type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
        </Field>
        <button style={btnStyle()} onClick={changePassword}>Update password</button>
      </Section>

      {/* Danger zone */}
      <Section title="Danger zone">
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16, lineHeight: 1.6 }}>
          Deleting your account is permanent. All your data will be removed and cannot be recovered.
          Type <strong style={{ color: '#EF4444' }}>DELETE</strong> to confirm.
        </div>
        <Field label="Confirm deletion">
          <input
            style={{ ...inputStyle, borderColor: 'rgba(239,68,68,0.2)' }}
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
            placeholder='Type DELETE'
          />
        </Field>
        <button
          style={btnStyle('#EF4444')}
          onClick={deleteAccount}
        >
          Delete account permanently
        </button>
      </Section>
    </div>
  )
}