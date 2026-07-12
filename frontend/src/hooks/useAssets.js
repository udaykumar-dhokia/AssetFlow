import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assetService } from '@/services/assetService'

export const ASSET_KEYS = {
  all: ['assets'],
  list: (params) => [...ASSET_KEYS.all, 'list', params],
  detail: (id) => [...ASSET_KEYS.all, 'detail', id],
  history: (id) => [...ASSET_KEYS.all, 'history', id],
}

/**
 * Fetch a paginated list of assets with optional filters
 */
export const useAssets = (params = {}) => {
  return useQuery({
    queryKey: ASSET_KEYS.list(params),
    queryFn: () => assetService.getAssets(params),
    keepPreviousData: true, // Useful for pagination
  })
}

/**
 * Fetch a single asset by ID
 */
export const useAsset = (id) => {
  return useQuery({
    queryKey: ASSET_KEYS.detail(id),
    queryFn: () => assetService.getAssetById(id),
    enabled: !!id,
  })
}

/**
 * Fetch asset history
 */
export const useAssetHistory = (id) => {
  return useQuery({
    queryKey: ASSET_KEYS.history(id),
    queryFn: () => assetService.getAssetHistory(id),
    enabled: !!id,
  })
}

/**
 * Create a new asset
 */
export const useCreateAsset = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assetService.createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.all })
    },
  })
}
