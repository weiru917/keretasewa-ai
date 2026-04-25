import { useEffect, useRef, useState } from 'react'
import { useFleetStore } from '../store/fleetStore'
import { useAskAI } from '../hooks/useAI'
import { processFleetData } from '../utils/dataProcessor'
import { mockBookings, mockVehicles } from '../data/mockData'

const suggestions = [
  'Should I accept a 3-day Myvi booking next week?',
  'What if I raise Alphard price by 15%?',
  'Which vehicle should I promote this weekend?',
]

export default function AskAIPage() {
  const { processedData, setProcessedData } = useFleetStore()
  const { messages, loading, error, sendMessage: sendAIMessage } = useAskAI()
  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (!processedData) {
      setProcessedData(processFleetData(mockBookings, mockVehicles))
    }
  }, [processedData, setProcessedData])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const allMessages = messages.length === 0
    ? [
        {
          role: 'ai',
          text: 'Hello! Ask me anything about your fleet — pricing decisions, booking acceptance, or what-if scenarios. I have access to your current fleet data.',
        },
      ]
    : messages.map((m) => ({
        role: m.role === 'assistant' ? 'ai' : m.role,
        text: m.content || m.text,
      }))

  const sendMessage = async (text) => {
    const msg = text || input
    if (!msg.trim() || loading) return

    setInput('')
    await sendAIMessage(msg, processedData)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      padding: 28,
      gap: 16,
    }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', letterSpacing: -0.3 }}>
          Ask AI
        </h1>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
          Powered by GLM — your fleet data is automatically included as context
        </div>
      </div>

      <div style={{
        flex: 1,
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 20,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        {allMessages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-start',
          }}>
            {m.role === 'ai' && (
              <div style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #253BAF, #7B9FFF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                marginRight: 10,
                flexShrink: 0,
                marginTop: 3,
                boxShadow: '0 0 14px rgba(123,159,255,0.35)',
              }}>
                ◈
              </div>
            )}

            <div style={{
              background: m.role === 'user'
                ? 'linear-gradient(135deg, #253BAF, #12086F)'
                : 'rgba(255,255,255,0.075)',
              border: m.role === 'user'
                ? '1px solid rgba(123,159,255,0.35)'
                : '1px solid rgba(255,255,255,0.09)',
              borderRadius: m.role === 'user'
                ? '16px 16px 5px 16px'
                : '16px 16px 16px 5px',
              padding: '14px 16px',
              fontSize: 13.5,
              color: '#E5E7EB',
              maxWidth: '76%',
              lineHeight: 1.75,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              boxShadow: '0 8px 22px rgba(0,0,0,0.18)',
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9CA3AF', fontSize: 13 }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #253BAF, #7B9FFF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              boxShadow: '0 0 14px rgba(123,159,255,0.35)',
            }}>
              ◈
            </div>
            Thinking...
          </div>
        )}

        {error && (
          <div style={{
            color: '#FCA5A5',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.18)',
            borderRadius: 12,
            padding: '10px 12px',
            fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            disabled={loading}
            style={{
              background: 'rgba(123,159,255,0.08)',
              border: '1px solid rgba(123,159,255,0.2)',
              borderRadius: 20,
              color: '#7B9FFF',
              padding: '7px 14px',
              fontSize: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              opacity: loading ? 0.55 : 1,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: 10,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 14,
        padding: '10px 12px',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about pricing, bookings, or simulate a decision..."
          disabled={loading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#E5E7EB',
            fontSize: 13,
            outline: 'none',
            opacity: loading ? 0.7 : 1,
          }}
        />

        <button
          onClick={() => sendMessage()}
          disabled={loading}
          style={{
            background: loading
              ? 'rgba(255,255,255,0.08)'
              : 'linear-gradient(135deg, #253BAF, #12086F)',
            border: '1px solid rgba(123,159,255,0.3)',
            borderRadius: 10,
            color: 'white',
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}