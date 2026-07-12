import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { auditService } from '@/services/auditService'
import { toast } from 'sonner'

export const AUDIT_KEYS = {
  all: ['audits'],
  lists: () => [...AUDIT_KEYS.all, 'list'],
  discrepancies: (id) => [...AUDIT_KEYS.all, 'discrepancies', id],
}

/** List all audit cycles */
export const useAudits = () =>
  useQuery({
    queryKey: AUDIT_KEYS.lists(),
    queryFn: auditService.getAudits,
  })

/** Discrepancy report for a specific cycle */
export const useDiscrepancies = (cycleId) =>
  useQuery({
    queryKey: AUDIT_KEYS.discrepancies(cycleId),
    queryFn: () => auditService.getDiscrepancies(cycleId),
    enabled: !!cycleId,
  })

/** Create a new audit cycle */
export const useCreateAuditCycle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: auditService.createAuditCycle,
    onSuccess: () => {
      toast.success('Audit cycle created successfully.')
      queryClient.invalidateQueries({ queryKey: AUDIT_KEYS.lists() })
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create audit cycle.'),
  })
}

/** Mark / update an asset item within an audit cycle */
export const useMarkAuditItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cycleId, ...data }) => auditService.markAuditItem(cycleId, data),
    onSuccess: (_, { cycleId }) => {
      toast.success('Asset marked successfully.')
      queryClient.invalidateQueries({ queryKey: AUDIT_KEYS.discrepancies(cycleId) })
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || err?.message || 'Failed to mark asset.'),
  })
}

/** Close an audit cycle */
export const useCloseAuditCycle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: auditService.closeAuditCycle,
    onSuccess: () => {
      toast.success('Audit cycle closed. Missing assets have been marked LOST.')
      queryClient.invalidateQueries({ queryKey: AUDIT_KEYS.lists() })
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || err?.message || 'Failed to close audit cycle.'),
  })
}
