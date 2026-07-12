// pages/booking\BookingPage.jsx - STUB - Coming in next sprint
import PageWrapper from '@/layouts/PageWrapper'
import { CalendarCheck } from 'lucide-react'

export default function BookingPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
          <CalendarCheck size={32} className="text-indigo-400" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Resource Booking</h2>
          <p className="text-sm text-slate-500">Coming in next sprint</p>
        </div>
      </div>
    </PageWrapper>
  )
}
