import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { maintenanceService } from '@/services/maintenanceService'
import { toast } from 'sonner'

export const MAINTENANCE_KEYS = {
  all: ['maintenance'],
  lists: () => [...MAINTENANCE_KEYS.all, 'list'],
  detail: (id) => [...MAINTENANCE_KEYS.all, 'detail', id],
}

/**
 * Fetch all maintenance requests (scoped by role server-side)
 */
export const useMaintenanceRequests = () => {
  return useQuery({
    queryKey: MAINTENANCE_KEYS.lists(),
    queryFn: maintenanceService.getRequests,
  })
}

/**
 * Fetch a single maintenance request with full history
 */
export const useMaintenanceRequest = (id) => {
  return useQuery({
    queryKey: MAINTENANCE_KEYS.detail(id),
    queryFn: () => maintenanceService.getRequestById(id),
    enabled: !!id,
  })
}

/**
 * Raise a new maintenance request
 */
export const useCreateMaintenanceRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: maintenanceService.createRequest,
    onSuccess: () => {
      toast.success('Maintenance request raised successfully.')
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.lists() })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to raise request.')
    },
  })
}

/**
 * Approve a maintenance request
 */
export const useApproveRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => maintenanceService.approveRequest(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Request approved.')
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.detail(id) })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to approve request.')
    },
  })
}

/**
 * Reject a maintenance request
 */
export const useRejectRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => maintenanceService.rejectRequest(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Request rejected.')
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.detail(id) })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to reject request.')
    },
  })
}

/**
 * Assign a technician to an approved request
 */
export const useAssignTechnician = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => maintenanceService.assignTechnician(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Technician assigned.')
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.detail(id) })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to assign technician.')
    },
  })
}

/**
 * Start work on a request (TECH_ASSIGNED → IN_PROGRESS)
 */
export const useStartWork = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => maintenanceService.startWork(id),
    onSuccess: (_, id) => {
      toast.success('Work started — request is now In Progress.')
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.detail(id) })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to start work.')
    },
  })
}

/**
 * Resolve a maintenance request (IN_PROGRESS → RESOLVED)
 */
export const useResolveRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => maintenanceService.resolveRequest(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Request resolved! Asset is now Available.')
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_KEYS.detail(id) })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to resolve request.')
    },
  })
}
