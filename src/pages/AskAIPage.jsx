import { useState } from 'react'
import { useFleetStore } from '../store/fleetStore'

const suggestions = [
  'Should I accept a 3-day Myvi booking next week?',
  'What if I raise Alphard price by 15%?',
  'Which vehicle should I promote this weekend?',
]

export default function AskAIPage() {
  const { processedData } = useFleetStore()
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! Ask me anything about your fleet — pricing decisions, booking acceptance, or what-if scenarios. I have access to your current fleet data.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async (text) => {
    const msg = text || input
    if (!msg.trim()) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    // TODO: Person B connects GLM here
    // Receives: { question: msg, context: processedData }
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Waiting meow... (This is a placeholder response, replace this with the actual GLM output.)',
      }])
      setLoading(false)
    }, 800)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      padding: 28,
      gap: 16,
    }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', letterSpacing: -0.3 }}>
          Ask AI
        </h1>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
          Powered by GLM — your fleet data is automatically included as context
        </div>
      </div>

      {/* Chat window — flex: 1 makes it fill remaining height */}
      <div style={{
        flex: 1,
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 20,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            {m.role === 'ai' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #253BAF, #7B9FFF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, marginRight: 8, flexShrink: 0, marginTop: 2,
              }}>
                ◈
              </div>
            )}
            <div style={{
              background: m.role === 'user'
                ? 'linear-gradient(135deg, #253BAF, #12086F)'
                : 'rgba(255,255,255,0.07)',
              border: m.role === 'user'
                ? '1px solid rgba(123,159,255,0.3)'
                : '1px solid rgba(255,255,255,0.08)',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '12px 16px',
              fontSize: 13,
              color: '#E5E7EB',
              maxWidth: '75%',
              lineHeight: 1.6,
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 13 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #253BAF, #7B9FFF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
            }}>◈</div>
            Thinking...
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            style={{
              background: 'rgba(123,159,255,0.08)',
              border: '1px solid rgba(123,159,255,0.2)',
              borderRadius: 20, color: '#7B9FFF',
              padding: '6px 14px', fontSize: 12,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div style={{
        display: 'flex', gap: 10,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 12, padding: '10px 12px',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about pricing, bookings, or simulate a decision..."
          style={{
            flex: 1, background: 'transparent',
            border: 'none', color: '#E5E7EB',
            fontSize: 13, outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage()}
          style={{
            background: 'linear-gradient(135deg, #253BAF, #12086F)',
            border: '1px solid rgba(123,159,255,0.3)',
            borderRadius: 8, color: 'white',
            padding: '8px 18px', fontSize: 13,
            fontWeight: 500, cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}