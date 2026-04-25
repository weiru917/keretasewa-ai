import { useNavigate } from 'react-router-dom'

export default function AskAIPanel() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/ask-ai')}
      title="Ask AI"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #253BAF, #7B9FFF)',
        border: '1px solid rgba(123,159,255,0.4)',
        boxShadow: '0 0 20px rgba(123,159,255,0.6), 0 10px 30px rgba(0,0,0,0.4)',
        color: 'white',
        fontSize: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 9999,
        animation: 'floatPulse 2.5s ease-in-out infinite',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      ◈
    </button>
  )
}