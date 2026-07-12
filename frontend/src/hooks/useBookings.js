import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '@/services/bookingService'

export const BOOKING_KEYS = {
  all: ['bookings'],
  asset: (assetId) => [...BOOKING_KEYS.all, 'asset', assetId],
}

/**
 * Fetch bookings for a specific asset
 */
export const useAssetBookings = (assetId) => {
  return useQuery({
    queryKey: BOOKING_KEYS.asset(assetId),
    queryFn: () => bookingService.getAssetBookings(assetId),
    enabled: !!assetId,
  })
}

/**
 * Create a new booking
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.asset(variables.assetId) })
    },
  })
}

/**
 * Cancel a booking
 */
export const useCancelBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookingService.cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all })
    },
  })
}

/**
 * Reschedule a booking
 */
export const useRescheduleBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => bookingService.rescheduleBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all })
    },
  })
}
