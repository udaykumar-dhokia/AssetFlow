import { useState } from 'react'
import dayjs from 'dayjs'
import {
  X, AlertTriangle, CheckCircle, XCircle, Wrench, Package,
  ScanLine, Lock, Loader2, Users, MapPin, CalendarRange,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useDiscrepancies, useCloseAuditCycle } from '@/hooks/useAudit'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import MarkAssetDialog from './MarkAssetDialog'

const ITEM_STATUS_CONFIG = {
  MISSING: {
    label: 'Missing',
    icon: <XCircle size={14} className="text-red-500 flex-shrink-0" />,
    className: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
  },
  DAMAGED: {
    label: 'Damaged',
    icon: <Wrench size={14} className="text-orange-500 flex-shrink-0" />,
    className: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
  },
}

/**
 * AuditDetailSheet
 * Slide-in panel showing a selected audit cycle's detail, discrepancy report,
 * and admin actions (Mark Asset, Close Cycle).
 */
export default function AuditDetailSheet({ cycle, isAdmin, onClose }) {
  const [markOpen, setMarkOpen] = useState(false)
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const { mutateAsync: closeCycle, isPending: isClosing } = useCloseAuditCycle()

  const canViewDiscrepancies = isAdmin
  const { data: discrepancyData, isLoading: isLoadingDisc } = useDiscrepancies(
    canViewDiscrepancies ? cycle?.id : null
  )

  const isClosed = cycle?.status === 'CLOSED'

  const handleClose = async () => {
    await closeCycle(cycle.id)
    setCloseConfirmOpen(false)
    onClose()
  }

  if (!cycle) return null

  const explicit = discrepancyData?.explicitDiscrepancies ?? []
  const implicit = discrepancyData?.implicitlyMissing ?? []
  const totalDisc = discrepancyData?.totalDiscrepancies ?? 0

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-popover border-l shadow-xl flex flex-col animate-in slide-in-from-right-8 duration-200">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${isClosed ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'}`}>
                {isClosed ? 'Closed' : 'Open'}
              </span>
              {cycle._count && (
                <span className="text-xs text-muted-foreground">{cycle._count.auditItems} items scanned</span>
              )}
            </div>
            <h2 className="text-sm font-semibold text-foreground truncate">{cycle.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {dayjs(cycle.startDate).format('MMM D')} – {dayjs(cycle.endDate).format('MMM D, YYYY')}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Cycle info */}
          <div className="grid grid-cols-2 gap-3">
            {cycle.scopeLocation && (
              <InfoItem icon={<MapPin size={13} />} label="Location Scope" value={cycle.scopeLocation} />
            )}
            <InfoItem
              icon={<CalendarRange size={13} />}
              label="Duration"
              value={`${dayjs(cycle.startDate).format('MMM D')} – ${dayjs(cycle.endDate).format('MMM D, YYYY')}`}
            />
            {cycle.auditors?.length > 0 && (
              <InfoItem
                icon={<Users size={13} />}
                label="Auditors"
                value={cycle.auditors.map(a => a.name).join(', ')}
              />
            )}
          </div>

          {/* Discrepancy report — admin/manager only */}
          {canViewDiscrepancies && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Discrepancy Report
                </p>
                {!isLoadingDisc && (
                  <span className={`text-xs font-semibold ${totalDisc > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {totalDisc} issue{totalDisc !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {isLoadingDisc ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : totalDisc === 0 ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3">
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">No discrepancies found. All assets accounted for.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Explicit — marked MISSING or DAMAGED */}
                  {explicit.map((item, i) => {
                    const cfg = ITEM_STATUS_CONFIG[item.status] ?? ITEM_STATUS_CONFIG.MISSING
                    return (
                      <div key={i} className={`flex items-start gap-3 rounded-lg border p-3 ${cfg.className}`}>
                        {cfg.icon}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.asset?.name}</p>
                          <p className="text-xs text-muted-foreground">{item.asset?.assetTag} · {cfg.label}</p>
                          {item.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">"{item.notes}"</p>}
                        </div>
                      </div>
                    )
                  })}

                  {/* Implicitly missing — in scope but never scanned */}
                  {implicit.map((asset, i) => (
                    <div key={`implicit-${i}`} className="flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-3">
                      <Package size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">{asset.assetTag} · Not Scanned</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isClosed && (
          <div className="p-5 border-t space-y-2 flex-shrink-0">
            <Button
              size="sm"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setMarkOpen(true)}
            >
              <ScanLine size={13} className="mr-1.5" /> Mark Asset
            </Button>

            {isAdmin && (
              <Button
                size="sm"
                variant="destructive"
                className="w-full"
                onClick={() => setCloseConfirmOpen(true)}
                disabled={isClosing}
              >
                <Lock size={13} className="mr-1.5" /> Close Audit Cycle
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Mark Asset dialog */}
      <MarkAssetDialog open={markOpen} onOpenChange={setMarkOpen} cycleId={cycle.id} />

      {/* Close confirmation */}
      <AlertDialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this audit cycle?</AlertDialogTitle>
            <AlertDialogDescription>
              This will finalise the audit. Any assets within the scope that were <strong>not scanned</strong> will be automatically marked as <strong>LOST</strong> in the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClose}
              disabled={isClosing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClosing && <Loader2 size={13} className="mr-1.5 animate-spin" />}
              Yes, Close Cycle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">{icon} {label}</p>
      <p className="text-sm text-foreground font-medium">{value}</p>
    </div>
  )
}
