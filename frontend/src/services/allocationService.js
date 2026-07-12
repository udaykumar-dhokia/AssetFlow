import api from './api'

export const allocationService = {
  /**
   * Allocate an asset to a User or Department.
   * @param {Object} allocationData - The allocation details (assetId, allocatedToUserId OR allocatedToDepartmentId, expectedReturnDate)
   */
  allocateAsset: async (allocationData) => {
    const response = await api.post('/allocations', allocationData)
    return response.data
  },

  /**
   * Request a transfer for an asset currently allocated to someone else.
   * @param {string} assetId - The UUID of the asset to request
   */
  requestTransfer: async (assetId) => {
    const response = await api.post(`/allocations/asset/${assetId}/transfer-request`)
    return response.data
  },

  /**
   * Approve a pending transfer request.
   * @param {string} allocationId - The UUID of the Allocation record
   */
  approveTransfer: async (allocationId) => {
    const response = await api.post(`/allocations/${allocationId}/approve-transfer`)
    return response.data
  },

  /**
   * Mark an actively allocated asset as returned.
   * @param {string} allocationId - The UUID of the Allocation record
   * @param {Object} returnData - The return details (e.g., returnConditionNotes)
   */
  returnAsset: async (allocationId, returnData = {}) => {
    const response = await api.post(`/allocations/${allocationId}/return`, returnData)
    return response.data
  }
}
