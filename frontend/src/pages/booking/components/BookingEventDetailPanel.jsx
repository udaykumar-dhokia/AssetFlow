import dayjs from 'dayjs'
import { Calendar, Clock, User, Tag, X, CalendarSync, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useCancelBooking } from '@/hooks/useBookings'

const STATUS_CONFIG = {
  UPCOMING: { label: 'Upcoming', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
  ONGOING:  { label: 'Ongoing',  className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  COMPLETED:{ label: 'Completed',className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700' },
  CANCELLED:{ label: 'Cancelled',className: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' },
}

/**
 * BookingEventDetailPanel
 *
 * A side panel that displays details of a selected calendar event.
 * Allows UPCOMING bookings owned by the current user to be cancelled or rescheduled.
 *
 * Props:
 *  - booking: the raw booking object (or null)
 *  - currentUserId: string — the logged-in user's id (user.sub)
 *  - userRole: string — e.g. 'ADMIN', 'EMPLOYEE'
 *  - assetName: string
 *  - onClose: () => void
 *  - onReschedule: (booking) => void — opens the reschedule dialog
 */
export default function BookingEventDetailPanel({
  booking,
  currentUserId,
  userRole,
  assetName,
  onClose,
  onReschedule,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { mutateAsync: cancelBooking, isPending: isCancelling } = useCancelBooking()

  if (!booking) return null

  const isOwner = booking.userId === currentUserId
  const isAdmin = userRole === 'ADMIN' || userRole === 'ASSET_MANAGER'
  const canAct = booking.status === 'UPCOMING' && (isOwner || isAdmin)

  const statusCfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.UPCOMING

  const handleCancel = async () => {
    try {
      await cancelBooking(booking.id)
      toast.success('Booking cancelled successfully.')
      setConfirmOpen(false)
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to cancel booking.')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-popover border-l shadow-xl flex flex-col animate-in slide-in-from-right-8 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusCfg.className}`}>
                {statusCfg.label}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-foreground truncate">
              {booking.user?.name ?? 'Unknown User'}
            </h2>
            {assetName && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{assetName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
          >
            <X size={16} />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <DetailRow
            icon={<Calendar size={15} className="text-muted-foreground" />}
            label="Date"
            value={dayjs(booking.startTime).format('ddd, MMM D, YYYY')}
          />
          <DetailRow
            icon={<Clock size={15} className="text-muted-foreground" />}
            label="Time"
            value={`${dayjs(booking.startTime).format('h:mm A')} – ${dayjs(booking.endTime).format('h:mm A')}`}
          />
          <DetailRow
            icon={<User size={15} className="text-muted-foreground" />}
            label="Booked by"
            value={booking.user?.name ?? '—'}
          />
          {assetName && (
            <DetailRow
              icon={<Tag size={15} className="text-muted-foreground" />}
              label="Resource"
              value={assetName}
            />
          )}

          {/* Duration */}
          <div className="rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            Duration:{' '}
            <span className="font-medium text-foreground">
              {Math.round((new Date(booking.endTime) - new Date(booking.startTime)) / 60000)} minutes
            </span>
          </div>

          {!canAct && booking.status === 'UPCOMING' && !isOwner && !isAdmin && (
            <p className="text-xs text-muted-foreground italic">
              You can only manage your own bookings.
            </p>
          )}
        </div>

        {/* Actions */}
        {canAct && (
          <div className="p-5 border-t space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => onReschedule(booking)}
            >
              <CalendarSync size={14} />
              Reschedule Booking
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => setConfirmOpen(true)}
              disabled={isCancelling}
            >
              {isCancelling
                ? <Loader2 size={14} className="animate-spin" />
                : <XCircle size={14} />}
              Cancel Booking
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently cancel the booking for{' '}
              <strong>{booking.user?.name ?? 'this user'}</strong> on{' '}
              {dayjs(booking.startTime).format('MMM D')} from{' '}
              {dayjs(booking.startTime).format('h:mm A')} to{' '}
              {dayjs(booking.endTime).format('h:mm A')}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling && <Loader2 size={13} className="mr-1.5 animate-spin" />}
              Yes, Cancel It
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  )
}
