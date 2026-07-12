import { useMutation, useQueryClient } from '@tanstack/react-query'
import { allocationService } from '@/services/allocationService'
import { ASSET_KEYS } from './useAssets'
import { toast } from 'sonner'

export const useAllocateAsset = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: allocationService.allocateAsset,
    onSuccess: () => {
      toast.success('Asset allocated successfully')
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to allocate asset')
    },
  })
}

export const useRequestTransfer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: allocationService.requestTransfer,
    onSuccess: () => {
      toast.success('Transfer requested successfully')
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to request transfer')
    },
  })
}

export const useApproveTransfer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: allocationService.approveTransfer,
    onSuccess: () => {
      toast.success('Transfer approved successfully')
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to approve transfer')
    },
  })
}

export const useReturnAsset = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => allocationService.returnAsset(id, data),
    onSuccess: () => {
      toast.success('Asset returned successfully')
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to return asset')
    },
  })
}
