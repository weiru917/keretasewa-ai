import { create } from 'zustand'

export const useFleetStore = create((set) => ({
  // Auth
  userProfile: null,
  
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
  setUserProfile:      (p)    => set({ userProfile: p }),
  setRawData:          (b, v) => set({ rawBookings: b, rawVehicles: v }),
  setProcessedData:    (d)    => set({ processedData: d }),
  setAIRecommendations:(r)    => set({ aiRecommendations: r }),
  setAILoading:        (v)    => set({ aiLoading: v }),
  setAIError:          (e)    => set({ aiError: e }),
  clearAll:            ()     => set({
    userProfile: null,
    rawBookings: [], rawVehicles: [],
    processedData: null,
    aiRecommendations: null,
  }),
}))