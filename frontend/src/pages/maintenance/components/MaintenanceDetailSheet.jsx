import { useState } from 'react'
import dayjs from 'dayjs'
import {
  X, Package, User, AlertTriangle, Clock, UserCog, PlayCircle,
  CheckCheck, XCircle, CheckCircle, ArrowRight, Wrench, StickyNote,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMaintenanceRequest, useStartWork } from '@/hooks/useMaintenance'
import ApproveDialog from './ApproveDialog'
import RejectDialog from './RejectDialog'
import AssignTechnicianDialog from './AssignTechnicianDialog'
import ResolveDialog from './ResolveDialog'

// ── Status config ─────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:       { label: 'Pending',       className: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800' },
  APPROVED:      { label: 'Approved',      className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
  REJECTED:      { label: 'Rejected',      className: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' },
  TECH_ASSIGNED: { label: 'Tech Assigned', className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800' },
  IN_PROGRESS:   { label: 'In Progress',   className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800' },
  RESOLVED:      { label: 'Resolved',      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
}

const PRIORITY_CONFIG = {
  LOW:      { label: 'Low',      className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400' },
  MEDIUM:   { label: 'Medium',   className: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400' },
  HIGH:     { label: 'High',     className: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400' },
  CRITICAL: { label: 'Critical', className: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400' },
}

// ── History step icon ─────────────────────────────────────────
function HistoryIcon({ action }) {
  const a = action?.toUpperCase() || ''
  if (a.includes('APPROVED') || a.includes('RESOLVED')) return <CheckCircle size={14} className="text-emerald-500" />
  if (a.includes('REJECTED')) return <XCircle size={14} className="text-red-500" />
  if (a.includes('ASSIGNED')) return <UserCog size={14} className="text-violet-500" />
  if (a.includes('STARTED') || a.includes('IN_PROGRESS')) return <PlayCircle size={14} className="text-orange-500" />
  return <ArrowRight size={14} className="text-muted-foreground" />
}

/**
 * MaintenanceDetailSheet
 *
 * Slide-in right panel showing full request details + history + role-gated actions.
 *
 * Props:
 *  - requestId: string | null
 *  - isAdmin: boolean  (ADMIN or ASSET_MANAGER)
 *  - onClose: () => void
 */
export default function MaintenanceDetailSheet({ requestId, isAdmin, onClose }) {
  const { data: requestData, isLoading } = useMaintenanceRequest(requestId)
  const { mutateAsync: startWork, isPending: isStarting } = useStartWork()

  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)

  // The backend returns the request at top level or nested in a `data` key
  const req = requestData?.data || requestData
  const history = req?.history ?? []

  const handleStartWork = async () => {
    await startWork(requestId)
  }

  if (!requestId) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-popover border-l shadow-xl flex flex-col animate-in slide-in-from-right-8 duration-200">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 p-5 border-b flex-shrink-0">
          {isLoading ? (
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {req?.status && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[req.status]?.className}`}>
                    {STATUS_CONFIG[req.status]?.label}
                  </span>
                )}
                {req?.priority && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_CONFIG[req.priority]?.className}`}>
                    {PRIORITY_CONFIG[req.priority]?.label} Priority
                  </span>
                )}
              </div>
              <h2 className="text-sm font-semibold text-foreground truncate">
                {req?.asset?.name ?? 'Loading…'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {req?.asset?.assetTag} • Raised by {req?.requestedBy?.name ?? '—'}
              </p>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : req ? (
            <>
              {/* Issue Description */}
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Issue Description
                </p>
                <p className="text-sm text-foreground leading-relaxed">{req.issueDescription}</p>
              </div>

              {/* Key details */}
              <div className="grid grid-cols-2 gap-3">
                <DetailItem icon={<Package size={13} />} label="Asset" value={req.asset?.name} />
                <DetailItem icon={<User size={13} />} label="Raised By" value={req.requestedBy?.name} />
                <DetailItem icon={<Clock size={13} />} label="Submitted" value={dayjs(req.createdAt).format('MMM D, YYYY')} />
                {req.assignedTechnicianName && (
                  <DetailItem icon={<UserCog size={13} />} label="Technician" value={req.assignedTechnicianName} />
                )}
              </div>

              {/* Resolution Notes */}
              {req.resolutionNotes && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <StickyNote size={12} /> Resolution Notes
                  </p>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">{req.resolutionNotes}</p>
                </div>
              )}

              {/* Photo */}
              {req.photoUrl && (
                <div className="rounded-lg overflow-hidden border">
                  <img src={req.photoUrl} alt="Issue photo" className="w-full h-40 object-cover" />
                </div>
              )}

              {/* ── History Timeline ──────────────────────────── */}
              {history.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Audit Trail
                  </p>
                  <div className="relative border-l border-border ml-3 space-y-5">
                    {history.map((h, i) => (
                      <div key={i} className="pl-5 relative">
                        <div className="absolute -left-[15px] top-0.5 w-7 h-7 rounded-full bg-background border flex items-center justify-center">
                          <HistoryIcon action={h.action} />
                        </div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          {dayjs(h.createdAt).format('MMM D, YYYY · h:mm A')}
                        </p>
                        <p className="text-sm font-medium text-foreground">{h.action?.replace(/_/g, ' ')}</p>
                        {h.oldStatus && h.newStatus && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            {h.oldStatus} <ArrowRight size={10} /> {h.newStatus}
                          </p>
                        )}
                        {h.remarks && (
                          <p className="text-xs text-muted-foreground mt-0.5 italic">"{h.remarks}"</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          by {h.performedBy?.name ?? '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* ── Actions Footer (role-gated) ─────────────────────── */}
        {isAdmin && req && (
          <div className="p-5 border-t space-y-2 flex-shrink-0">
            {/* PENDING → Approve / Reject */}
            {req.status === 'PENDING' && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setApproveOpen(true)}
                >
                  <CheckCircle size={13} className="mr-1.5" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setRejectOpen(true)}
                >
                  <XCircle size={13} className="mr-1.5" /> Reject
                </Button>
              </div>
            )}

            {/* APPROVED → Assign Technician */}
            {req.status === 'APPROVED' && (
              <Button
                size="sm"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                onClick={() => setAssignOpen(true)}
              >
                <UserCog size={13} className="mr-1.5" /> Assign Technician
              </Button>
            )}

            {/* TECH_ASSIGNED → Start Work */}
            {req.status === 'TECH_ASSIGNED' && (
              <Button
                size="sm"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleStartWork}
                disabled={isStarting}
              >
                <PlayCircle size={13} className="mr-1.5" />
                {isStarting ? 'Starting…' : 'Start Work'}
              </Button>
            )}

            {/* IN_PROGRESS → Resolve */}
            {req.status === 'IN_PROGRESS' && (
              <Button
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setResolveOpen(true)}
              >
                <CheckCheck size={13} className="mr-1.5" /> Mark as Resolved
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Nested dialogs ──────────────────────────────────── */}
      <ApproveDialog open={approveOpen} onOpenChange={setApproveOpen} requestId={requestId} />
      <RejectDialog open={rejectOpen} onOpenChange={setRejectOpen} requestId={requestId} />
      <AssignTechnicianDialog open={assignOpen} onOpenChange={setAssignOpen} requestId={requestId} />
      <ResolveDialog open={resolveOpen} onOpenChange={setResolveOpen} requestId={requestId} />
    </>
  )
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-sm text-foreground font-medium truncate">{value ?? '—'}</p>
    </div>
  )
}
