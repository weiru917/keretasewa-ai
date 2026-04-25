import { create } from 'zustand'

export const useFleetStore = create((set) => ({
  // Raw data
  rawBookings: [],
  rawVehicles: [],

  // Processed data
  processedData: null,

  // AI Recommendation states
  aiRecommendations: null,
  aiLoading: false,
  aiError: null,

  // Ask AI Chat states
  askMessages: [],

  // Actions
  setRawData: (bookings, vehicles) =>
    set({ rawBookings: bookings, rawVehicles: vehicles }),

  setProcessedData: (data) =>
    set({ processedData: data }),

  setAIRecommendations: (recs) =>
    set({ aiRecommendations: recs }),

  setAILoading: (val) =>
    set({ aiLoading: val }),

  setAIError: (err) =>
    set({ aiError: err }),

  setAskMessages: (msgs) =>
    set({ askMessages: msgs }),
}))