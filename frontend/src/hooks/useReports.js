// hooks/useReports.js
// TanStack Query hooks for the Reports & Analytics module.

import { useQuery } from '@tanstack/react-query'
import { reportService } from '@/services/reportService'
import { toast } from 'sonner'
import { useState } from 'react'

export const REPORT_KEYS = {
  all:               ['reports'],
  utilization:       () => ['reports', 'utilization'],
  maintenance:       () => ['reports', 'maintenance'],
  departmentSummary: () => ['reports', 'department-summary'],
  bookingHeatmap:    () => ['reports', 'booking-heatmap'],
}

/**
 * Fetch asset utilization trends (top-used + idle assets over 90 days).
 * Available to: ADMIN, ASSET_MANAGER, DEPT_HEAD
 */
export const useUtilizationReport = () => {
  return useQuery({
    queryKey: REPORT_KEYS.utilization(),
    queryFn:  reportService.getUtilization,
  })
}

/**
 * Fetch maintenance frequency & retirement forecasts.
 * Available to: ADMIN, ASSET_MANAGER
 */
export const useMaintenanceReport = () => {
  return useQuery({
    queryKey: REPORT_KEYS.maintenance(),
    queryFn:  reportService.getMaintenance,
  })
}

/**
 * Fetch department-wise asset distribution.
 * Available to: ADMIN, ASSET_MANAGER, DEPT_HEAD
 */
export const useDepartmentSummary = () => {
  return useQuery({
    queryKey: REPORT_KEYS.departmentSummary(),
    queryFn:  reportService.getDepartmentSummary,
  })
}

/**
 * Fetch 7×24 booking frequency heatmap (past 30 days).
 * Available to: ADMIN, ASSET_MANAGER
 */
export const useBookingHeatmap = () => {
  return useQuery({
    queryKey: REPORT_KEYS.bookingHeatmap(),
    queryFn:  reportService.getBookingHeatmap,
  })
}

/**
 * Hook that exposes a CSV export action with loading + error handling.
 * Not a mutation — triggers a browser download directly.
 */
export const useExportReport = () => {
  const [exportingType, setExportingType] = useState(null)

  const exportCSV = async (type) => {
    setExportingType(type)
    try {
      await reportService.exportCSV(type)
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded.`)
    } catch (err) {
      toast.error(err?.message || 'Failed to export report.')
    } finally {
      setExportingType(null)
    }
  }

  return { exportCSV, exportingType, isExporting: exportingType !== null }
}
