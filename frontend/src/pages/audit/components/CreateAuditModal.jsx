import { useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ClipboardList, Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FormSelect from '@/components/common/FormSelect'
import { useCreateAuditCycle } from '@/hooks/useAudit'
import { useEmployees, useDepartments } from '@/hooks/useOrgSetup'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  startDate: z.string().min(1, 'Start date is required.'),
  endDate: z.string().min(1, 'End date is required.'),
  scopeLocation: z.string().optional(),
  scopeDepartmentId: z.string().optional(),
  auditorIds: z.array(z.string()).min(1, 'At least one auditor must be assigned.'),
}).refine(d => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
  message: 'End date must be on or after start date.',
  path: ['endDate'],
})

export default function CreateAuditModal({ open, onOpenChange }) {
  const { mutateAsync: create, isPending } = useCreateAuditCycle()
  const { data: employees = [] } = useEmployees()
  const { data: departments = [] } = useDepartments()

  const employeeOptions = useMemo(
    () => (Array.isArray(employees) ? employees : []).map(e => ({ value: e.id, label: e.name })),
    [employees]
  )
  const deptOptions = useMemo(
    () => (Array.isArray(departments) ? departments : []).map(d => ({ value: d.id, label: d.name })),
    [departments]
  )

  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      scopeLocation: '',
      scopeDepartmentId: '',
      auditorIds: [],
    },
  })

  useEffect(() => { if (open) reset() }, [open, reset])

  const selectedAuditorIds = watch('auditorIds') || []

  const toggleAuditor = (id) => {
    const current = selectedAuditorIds
    setValue(
      'auditorIds',
      current.includes(id) ? current.filter(a => a !== id) : [...current, id],
      { shouldValidate: true }
    )
  }

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      auditorIds: data.auditorIds,
      ...(data.scopeLocation ? { scopeLocation: data.scopeLocation } : {}),
      ...(data.scopeDepartmentId ? { scopeDepartmentId: data.scopeDepartmentId } : {}),
    }
    await create(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList size={18} className="text-indigo-500" />
            Create Audit Cycle
          </DialogTitle>
          <DialogDescription>
            Define the scope, timeline, and assigned auditors for this inventory cycle.
          </DialogDescription>
        </DialogHeader>

        <form id="create-audit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Cycle Name <span className="text-destructive normal-case">*</span>
            </Label>
            <Input id="audit-name" placeholder="e.g. Q3 IT Equipment Audit" className="h-9" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Start Date <span className="text-destructive normal-case">*</span>
              </Label>
              <Input id="audit-start" type="date" className="h-9" {...register('startDate')} />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                End Date <span className="text-destructive normal-case">*</span>
              </Label>
              <Input id="audit-end" type="date" className="h-9" {...register('endDate')} />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Scope */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Scope — Location <span className="normal-case">(optional)</span>
            </Label>
            <Input id="audit-location" placeholder="e.g. London Office, Floor 3" className="h-9" {...register('scopeLocation')} />
          </div>

          <FormSelect
            name="scopeDepartmentId"
            control={control}
            label="Scope — Department (optional)"
            options={deptOptions}
            placeholder="All departments"
            errors={errors}
            size="h-9"
          />

          {/* Auditor multi-select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Assign Auditors <span className="text-destructive normal-case">*</span>
            </Label>
            <div className="border rounded-lg p-2 max-h-36 overflow-y-auto space-y-1">
              {employeeOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground p-1">No employees found.</p>
              ) : (
                employeeOptions.map(e => {
                  const checked = selectedAuditorIds.includes(e.value)
                  return (
                    <label
                      key={e.value}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${checked ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' : 'hover:bg-muted'}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAuditor(e.value)}
                        className="accent-indigo-600"
                      />
                      {e.label}
                    </label>
                  )
                })
              )}
            </div>
            {errors.auditorIds && (
              <p className="text-xs text-destructive">{errors.auditorIds.message}</p>
            )}
            {selectedAuditorIds.length > 0 && (
              <p className="text-xs text-muted-foreground">{selectedAuditorIds.length} auditor(s) selected</p>
            )}
          </div>
        </form>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-audit-form"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isPending}
          >
            {isPending && <Loader2 size={13} className="mr-1.5 animate-spin" />}
            {isPending ? 'Creating…' : 'Create Cycle'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
