import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { CalendarDays, Clock, Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import { useCreateBooking, useRescheduleBooking } from '@/hooks/useBookings'

const bookingSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
}).refine(data => {
  if (!data.startTime || !data.endTime) return true
  return data.startTime < data.endTime
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
})

/**
 * BookingFormDialog
 * Handles both creating a new booking and rescheduling an existing one.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - assetId: string | null
 *  - assetName: string | null   – displayed in the dialog title
 *  - initialStart: Date | null
 *  - initialEnd: Date | null
 *  - mode: 'create' | 'reschedule'
 *  - bookingId: string | null   – required when mode === 'reschedule'
 */
export default function BookingFormDialog({
  isOpen,
  onClose,
  assetId,
  assetName,
  initialStart,
  initialEnd,
  mode = 'create',
  bookingId = null,
}) {
  const isReschedule = mode === 'reschedule'

  const { mutateAsync: createBooking, isPending: isCreating } = useCreateBooking()
  const { mutateAsync: rescheduleBooking, isPending: isRescheduling } = useRescheduleBooking()
  const isPending = isCreating || isRescheduling

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: '',
      startTime: '',
      endTime: '',
    },
  })

  // Pre-fill times when opened (from calendar drag or existing booking)
  useEffect(() => {
    if (isOpen) {
      if (initialStart) {
        setValue('date', dayjs(initialStart).format('YYYY-MM-DD'))
        setValue('startTime', dayjs(initialStart).format('HH:mm'))
      }
      if (initialEnd) {
        setValue('endTime', dayjs(initialEnd).format('HH:mm'))
      }
    } else {
      reset()
    }
  }, [isOpen, initialStart, initialEnd, isReschedule, setValue, reset])

  const onSubmit = async (data) => {
    try {
      const startIso = dayjs(`${data.date}T${data.startTime}`).toISOString()
      const endIso = dayjs(`${data.date}T${data.endTime}`).toISOString()

      if (isReschedule) {
        if (!bookingId) {
          toast.error('No booking selected to reschedule')
          return
        }
        await rescheduleBooking({ id: bookingId, startTime: startIso, endTime: endIso })
        toast.success('Booking rescheduled successfully!')
      } else {
        if (!assetId) {
          toast.error('No asset selected')
          return
        }
        await createBooking({ assetId, startTime: startIso, endTime: endIso })
        toast.success('Resource booked successfully!')
      }

      onClose()
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Something went wrong')
    }
  }

  const title = isReschedule
    ? `Reschedule Booking${assetName ? ` — ${assetName}` : ''}`
    : `Book Resource${assetName ? ` — ${assetName}` : ''}`

  const description = isReschedule
    ? 'Choose a new time slot for this booking.'
    : 'Select a time slot and provide a purpose for your booking.'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Date */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <CalendarDays size={13} />
              Date
            </Label>
            <Input
              id="booking-date"
              type="date"
              min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
              className="h-9"
              {...register('date')}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <Clock size={13} />
                Start
              </Label>
              <Input
                id="booking-start-time"
                type="time"
                className="h-9"
                {...register('startTime')}
              />
              {errors.startTime && (
                <p className="text-xs text-destructive">{errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <Clock size={13} />
                End
              </Label>
              <Input
                id="booking-end-time"
                type="time"
                className="h-9"
                {...register('endTime')}
              />
              {errors.endTime && (
                <p className="text-xs text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>



          {/* Max duration hint */}
          <p className="text-xs text-muted-foreground">
            Maximum booking duration is 12 hours. All times are validated server-side.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              {isReschedule
                ? isPending ? 'Rescheduling…' : 'Confirm Reschedule'
                : isPending ? 'Booking…' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
