import { useQuery } from '@tanstack/react-query'
import * as dashboardService from '@/services/dashboardService'

export const useDashboardKPIs = () => {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: dashboardService.getKPIs,
  })
}

export const useDashboardReturns = () => {
  return useQuery({
    queryKey: ['dashboard', 'returns'],
    queryFn: dashboardService.getReturns,
  })
}
