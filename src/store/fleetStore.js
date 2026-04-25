import { create } from 'zustand'

export const useFleetStore = create((set) => ({
  // Auth
  userProfile: null,
  
  // Raw data
  rawBookings: [],
  rawVehicles: [],

  // Processed data
  processedData: null,
  hasData: false,

  // AI Recommendation states
  aiRecommendations: null,
  aiLoading: false,
  aiError: null,

  // Ask AI Chat states
  askMessages: [],

  // Actions
  setUserProfile:      (p)    => set({ userProfile: p }),
  setRawData:          (b, v) => set({ rawBookings: b, rawVehicles: v }),
  setProcessedData:    (d)    => set({ processedData: d, hasData: !!d }),
  setAIRecommendations:(r)    => set({ aiRecommendations: r }),
  setAILoading:        (v)    => set({ aiLoading: v }),
  setAIError:          (e)    => set({ aiError: e }),
  setAskMessages:          (a)    => set({ askMessages: a }),
  clearAll:            ()     => set({
    userProfile: null,
    rawBookings: [], rawVehicles: [],
    processedData: null,
    hasData: false,
    aiRecommendations: null,
  }),
}))