import api from './api'

export const maintenanceService = {
  /**
   * List all maintenance requests.
   * Admins/Managers see all; employees see only their own.
   */
  getRequests: async () => {
    const response = await api.get('/maintenance')
    return response.data
  },

  /**
   * Get a single maintenance request with its full history audit trail.
   * @param {string} id
   */
  getRequestById: async (id) => {
    const response = await api.get(`/maintenance/${id}`)
    return response.data
  },

  /**
   * Raise a new maintenance request.
   * @param {{ assetId: string, issueDescription: string, priority: string, photoUrl?: string }} data
   */
  createRequest: async (data) => {
    const response = await api.post('/maintenance', data)
    return response.data
  },

  /**
   * Approve a PENDING request (ADMIN / ASSET_MANAGER).
   * Optionally providing technicianName skips straight to TECH_ASSIGNED.
   * @param {string} id
   * @param {{ technicianName?: string }} data
   */
  approveRequest: async (id, data) => {
    const response = await api.patch(`/maintenance/${id}/approve`, data)
    return response.data
  },

  /**
   * Reject a PENDING request (ADMIN / ASSET_MANAGER).
   * @param {string} id
   * @param {{ reason: string }} data
   */
  rejectRequest: async (id, data) => {
    const response = await api.patch(`/maintenance/${id}/reject`, data)
    return response.data
  },

  /**
   * Assign a technician to an APPROVED request (ADMIN / ASSET_MANAGER).
   * @param {string} id
   * @param {{ technicianName: string }} data
   */
  assignTechnician: async (id, data) => {
    const response = await api.patch(`/maintenance/${id}/assign-technician`, data)
    return response.data
  },

  /**
   * Mark a TECH_ASSIGNED request as IN_PROGRESS (ADMIN / ASSET_MANAGER).
   * @param {string} id
   */
  startWork: async (id) => {
    const response = await api.patch(`/maintenance/${id}/start`)
    return response.data
  },

  /**
   * Mark an IN_PROGRESS request as RESOLVED (ADMIN / ASSET_MANAGER).
   * This automatically sets the asset back to AVAILABLE.
   * @param {string} id
   * @param {{ resolutionNotes: string }} data
   */
  resolveRequest: async (id, data) => {
    const response = await api.patch(`/maintenance/${id}/resolve`, data)
    return response.data
  },
}
