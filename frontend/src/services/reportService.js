// services/reportService.js
// All Reports & Analytics API calls.

import api from './api'
import env from '@/config/env'

const TOKEN_KEY = 'assetflow_token'

export const reportService = {
  /**
   * Get asset utilization trends (past 90 days).
   * Returns { mostUsed: [...], idle: [...] }
   */
  getUtilization: async () => {
    const { data } = await api.get('/reports/utilization')
    return data
  },

  /**
   * Get maintenance frequency & forecasts.
   * Returns { frequencyByCategory, dueForMaintenance, nearingRetirement }
   */
  getMaintenance: async () => {
    const { data } = await api.get('/reports/maintenance')
    return data
  },

  /**
   * Get department-wise asset distribution.
   * Returns an array of { departmentId, departmentName, totalActiveAssets, breakdownByCategory }
   */
  getDepartmentSummary: async () => {
    const { data } = await api.get('/reports/department-summary')
    return data
  },

  /**
   * Get booking heatmap matrix (past 30 days).
   * Returns { heatmap: [[...24], [...24], ...7 days] }
   * Index 0 = Sunday, nested index 0 = Midnight
   */
  getBookingHeatmap: async () => {
    const { data } = await api.get('/reports/booking-heatmap')
    return data
  },

  /**
   * Export a report as CSV and trigger a browser download.
   * Uses Blob + anchor tag pattern as specified in the API docs.
   * @param {'utilization' | 'maintenance' | 'department'} type
   */
  exportCSV: async (type) => {
    const token = localStorage.getItem(TOKEN_KEY)
    const response = await fetch(
      `${env.API_BASE_URL}/reports/export?type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.message ?? `Export failed (${response.status})`)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-report.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  },
}
