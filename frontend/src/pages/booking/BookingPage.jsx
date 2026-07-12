import { useState, useMemo } from 'react'
import PageWrapper from '@/layouts/PageWrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarClock, Circle } from 'lucide-react'

// FullCalendar
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import { useAssets } from '@/hooks/useAssets'
import { useAssetBookings } from '@/hooks/useBookings'
import { useAuth } from '@/hooks/useAuth'

import BookingFormDialog from './components/BookingFormDialog'
import BookingEventDetailPanel from './components/BookingEventDetailPanel'

/**
 * Status → FullCalendar event colour mapping
 */
const STATUS_COLORS = {
  UPCOMING:  { bg: '#3b82f6', border: '#2563eb' }, // blue
  ONGOING:   { bg: '#10b981', border: '#059669' }, // emerald
  COMPLETED: { bg: '#94a3b8', border: '#64748b' }, // slate
  CANCELLED: { bg: '#f87171', border: '#ef4444' }, // red
}

const LEGEND = [
  { label: 'Upcoming',  color: STATUS_COLORS.UPCOMING.bg },
  { label: 'Ongoing',   color: STATUS_COLORS.ONGOING.bg },
  { label: 'Completed', color: STATUS_COLORS.COMPLETED.bg },
  { label: 'Cancelled', color: STATUS_COLORS.CANCELLED.bg },
]

export default function BookingPage() {
  const { user, role } = useAuth()
  // user.sub is the logged-in user's ID (from the decoded JWT)
  const currentUserId = user?.sub

  const [selectedAssetId, setSelectedAssetId] = useState('')

  // Dialog state — covers both "create new" and "reschedule existing"
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    mode: 'create',       // 'create' | 'reschedule'
    initialStart: null,
    initialEnd: null,
    bookingId: null,
  })

  // Selected event panel
  const [selectedBooking, setSelectedBooking] = useState(null)

  // 1. Fetch all bookable assets (up to 200 so the list is complete)
  const { data: assetsData, isLoading: isLoadingAssets } = useAssets({ take: 200 })
  const rawAssets = Array.isArray(assetsData) ? assetsData : (assetsData?.assets ?? [])
  const bookableAssets = rawAssets.filter(a => a.isSharedBookable)

  // Look up the name of the selected asset
  const selectedAsset = useMemo(
    () => bookableAssets.find(a => a.id === selectedAssetId) ?? null,
    [bookableAssets, selectedAssetId]
  )

  // 2. Fetch bookings for the selected asset
  const { data: bookings = [], isLoading: isLoadingBookings } = useAssetBookings(selectedAssetId)

  // 3. Map bookings to FullCalendar events
  const calendarEvents = useMemo(() =>
    bookings.map(b => {
      const colors = STATUS_COLORS[b.status] ?? STATUS_COLORS.UPCOMING
      return {
        id: b.id,
        title: b.user?.name ?? 'Booked',
        start: b.startTime,
        end: b.endTime,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        extendedProps: {
          // Carry the full raw booking so the detail panel has everything
          booking: b,
        },
      }
    }),
    [bookings]
  )

  // ─── Handlers ────────────────────────────────────────────────

  const openCreateDialog = (start, end) => {
    setSelectedBooking(null)
    setDialogState({ isOpen: true, mode: 'create', initialStart: start, initialEnd: end, bookingId: null })
  }

  const openRescheduleDialog = (booking) => {
    setSelectedBooking(null)
    setDialogState({
      isOpen: true,
      mode: 'reschedule',
      initialStart: new Date(booking.startTime),
      initialEnd: new Date(booking.endTime),
      bookingId: booking.id,
    })
  }

  const closeDialog = () =>
    setDialogState(s => ({ ...s, isOpen: false }))

  /** User dragged to select a slot → open create dialog */
  const handleDateSelect = (selectInfo) => {
    if (!selectedAssetId) return
    openCreateDialog(selectInfo.start, selectInfo.end)
    selectInfo.view.calendar.unselect()
  }

  /** User clicked an event → open detail panel */
  const handleEventClick = (clickInfo) => {
    const { booking } = clickInfo.event.extendedProps
    setSelectedBooking(booking)
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Resource Booking</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Book shared spaces and equipment. Click a slot to create a booking.
            </p>
          </div>

          {/* Asset selector */}
          <div className="w-full sm:w-72">
            <Select
              value={selectedAssetId}
              onValueChange={(val) => {
                setSelectedAssetId(val)
                setSelectedBooking(null)
              }}
              disabled={isLoadingAssets}
            >
              <SelectTrigger id="asset-select">
                <SelectValue placeholder={isLoadingAssets ? 'Loading resources…' : 'Select a resource…'}>
                  {selectedAsset
                    ? `${selectedAsset.name}${selectedAsset.assetTag ? ` · ${selectedAsset.assetTag}` : ''}`
                    : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {bookableAssets.length === 0 ? (
                  <SelectItem value="__none__" disabled>No bookable resources found</SelectItem>
                ) : (
                  bookableAssets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                      {asset.assetTag ? ` · ${asset.assetTag}` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Calendar card ───────────────────────────────────── */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {!selectedAssetId ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-[520px] text-muted-foreground gap-3">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <CalendarClock size={32} className="opacity-40" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">No resource selected</p>
                  <p className="text-xs mt-0.5">Select a resource above to view its availability calendar.</p>
                </div>
              </div>
            ) : isLoadingBookings ? (
              /* Loading skeleton */
              <div className="p-6 space-y-3">
                <div className="flex gap-3 mb-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24 ml-auto" />
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                {/* FullCalendar */}
                <FullCalendar
                  plugins={[timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridWeek,timeGridDay',
                  }}
                  events={calendarEvents}
                  selectable={true}
                  selectMirror={true}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  height={620}
                  allDaySlot={false}
                  slotMinTime="06:00:00"
                  slotMaxTime="22:00:00"
                  expandRows={true}
                  nowIndicator={true}
                  eventTimeFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    meridiem: 'short',
                  }}
                  // Style events with a slightly rounded look via inline styles
                  eventDidMount={(info) => {
                    info.el.style.borderRadius = '5px'
                    info.el.style.fontWeight = '500'
                    info.el.style.fontSize = '12px'
                    info.el.style.cursor = 'pointer'
                  }}
                />

                {/* Status legend */}
                <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t">
                  {LEGEND.map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <Circle size={9} fill={color} stroke="none" />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  ))}
                  <span className="text-xs text-muted-foreground ml-auto hidden sm:block">
                    Click an event to manage · Drag to book a slot
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Booking form (create / reschedule) ──────────────── */}
      <BookingFormDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        assetId={selectedAssetId}
        assetName={selectedAsset?.name ?? null}
        initialStart={dialogState.initialStart}
        initialEnd={dialogState.initialEnd}
        mode={dialogState.mode}
        bookingId={dialogState.bookingId}
      />

      {/* ── Event detail panel ───────────────────────────────── */}
      {selectedBooking && (
        <BookingEventDetailPanel
          booking={selectedBooking}
          currentUserId={currentUserId}
          userRole={role}
          assetName={selectedAsset?.name ?? null}
          onClose={() => setSelectedBooking(null)}
          onReschedule={openRescheduleDialog}
        />
      )}
    </PageWrapper>
  )
}
