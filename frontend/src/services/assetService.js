import api from './api'

export const assetService = {
  /**
   * Register a new asset.
   * @param {Object} assetData - The asset details
   */
  createAsset: async (assetData) => {
    const response = await api.post('/assets', assetData)
    return response.data
  },

  /**
   * Search and filter assets.
   * @param {Object} params - Query parameters (search, categoryId, status, location, departmentId, skip, take)
   */
  getAssets: async (params = {}) => {
    const response = await api.get('/assets', { params })
    return response.data
  },

  /**
   * Get full details of a specific asset by ID.
   * @param {string} id - Asset UUID
   */
  getAssetById: async (id) => {
    const response = await api.get(`/assets/${id}`)
    return response.data
  },

  /**
   * Get chronological history of an asset (allocations & maintenance).
   * @param {string} id - Asset UUID
   */
  getAssetHistory: async (id) => {
    const response = await api.get(`/assets/${id}/history`)
    return response.data
  }
}
