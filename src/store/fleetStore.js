import { create } from 'zustand'

export const useFleetStore = create((set) => ({
  // Raw data
  rawBookings: [],
  rawVehicles: [],

  // Processed data (output of dataProcessor.js)
  processedData: null,

  // Person B writes to this
  aiRecommendations: null,
  aiLoading: false,
  aiError: null,

  // Actions
  setRawData: (bookings, vehicles) =>
    set({ rawBookings: bookings, rawVehicles: vehicles }),

  setProcessedData: (data) => set({ processedData: data }),

  setAIRecommendations: (recs) => set({ aiRecommendations: recs }),
  setAILoading: (val) => set({ aiLoading: val }),
  setAIError: (err) => set({ aiError: err }),
}))