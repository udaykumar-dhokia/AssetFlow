import api from './api'

export const auditService = {
  /** List all audit cycles */
  getAudits: async () => {
    const response = await api.get('/audits')
    return response.data
  },

  /**
   * Create a new audit cycle (ADMIN / ASSET_MANAGER only)
   * @param {{ name, scopeDepartmentId?, scopeLocation?, startDate, endDate, auditorIds[] }} data
   */
  createAuditCycle: async (data) => {
    const response = await api.post('/audits', data)
    return response.data
  },

  /**
   * Mark / update an asset item in an audit cycle
   * @param {string} cycleId
   * @param {{ assetId, status, notes? }} data
   */
  markAuditItem: async (cycleId, data) => {
    const response = await api.post(`/audits/${cycleId}/items`, data)
    return response.data
  },

  /**
   * Get discrepancy report for an audit cycle
   * @param {string} cycleId
   */
  getDiscrepancies: async (cycleId) => {
    const response = await api.get(`/audits/${cycleId}/discrepancies`)
    return response.data
  },

  /**
   * Close an audit cycle (ADMIN / ASSET_MANAGER only)
   * Marks unscanned scoped assets as LOST.
   * @param {string} cycleId
   */
  closeAuditCycle: async (cycleId) => {
    const response = await api.post(`/audits/${cycleId}/close`)
    return response.data
  },
}
