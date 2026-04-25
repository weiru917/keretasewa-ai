import { useFleetStore } from '../store/fleetStore'
import { generateRecommendations, askAI } from '../services/glmService'

export function useAIRecommendations() {
  const {
    processedData,
    setAIRecommendations,
    setAILoading,
    setAIError,
  } = useFleetStore()

  const fetchRecommendations = async () => {
    try {
      setAILoading(true)
      setAIError(null)

      const recommendations = await generateRecommendations(processedData)
      setAIRecommendations(recommendations)
    } catch (error) {
      setAIError(error.message || 'Failed to fetch AI recommendations')
    } finally {
      setAILoading(false)
    }
  }

  return { fetchRecommendations }
}

export function useAskAI() {
  const {
    askMessages,
    setAskMessages,
    setAILoading,
    setAIError,
    aiLoading,
    aiError,
  } = useFleetStore()

  const sendMessage = async (message, processedData) => {
    try {
      setAILoading(true)
      setAIError(null)

      const userMessage = {
        role: 'user',
        content: message,
      }

      setAskMessages([...askMessages, userMessage])

      const aiReply = await askAI(message, processedData)

      const assistantMessage = {
        role: 'assistant',
        content: aiReply,
      }

      setAskMessages([...askMessages, userMessage, assistantMessage])
    } catch (error) {
      setAIError(error.message || 'Failed to ask AI')
    } finally {
      setAILoading(false)
    }
  }

  const clearMessages = () => {
    setAskMessages([])
  }

  return {
    messages: askMessages || [],
    loading: aiLoading,
    error: aiError,
    sendMessage,
    clearMessages,
  }
}