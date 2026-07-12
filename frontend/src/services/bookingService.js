import api from './api'

export const bookingService = {
  /**
   * Create a new resource booking
   * @param {Object} data - { assetId, startTime, endTime, purpose }
   */
  createBooking: async (data) => {
    const response = await api.post('/bookings', data)
    return response.data
  },

  /**
   * Get all bookings for a specific asset
   * @param {string} assetId 
   */
  getAssetBookings: async (assetId) => {
    const response = await api.get(`/bookings/asset/${assetId}`)
    return response.data
  },

  /**
   * Cancel a booking
   * @param {string} id 
   */
  cancelBooking: async (id) => {
    const response = await api.post(`/bookings/${id}/cancel`)
    return response.data
  },

  /**
   * Reschedule a booking
   * @param {string} id 
   * @param {Object} data - { startTime, endTime }
   */
  rescheduleBooking: async (id, data) => {
    const response = await api.post(`/bookings/${id}/reschedule`, data)
    return response.data
  }
}
