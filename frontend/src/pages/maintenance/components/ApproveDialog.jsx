import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Loader2, User } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApproveRequest } from '@/hooks/useMaintenance'

const schema = z.object({
  technicianName: z.string().optional(),
})

export default function ApproveDialog({ open, onOpenChange, requestId }) {
  const { mutateAsync: approve, isPending } = useApproveRequest()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { technicianName: '' },
  })

  useEffect(() => { if (open) reset() }, [open, reset])

  const onSubmit = async (data) => {
    await approve({ id: requestId, ...(data.technicianName ? { technicianName: data.technicianName } : {}) })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-500" />
            Approve Request
          </DialogTitle>
          <DialogDescription>
            Approving will mark the asset as <strong>Under Maintenance</strong>.
            Optionally assign a technician right away — this skips to TECH_ASSIGNED.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <User size={13} /> Technician Name <span className="normal-case">(optional)</span>
            </Label>
            <Input
              id="approve-technician"
              placeholder="e.g. Dell External Service Center"
              className="h-9"
              {...register('technicianName')}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to approve without assigning a technician yet.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isPending}>
              {isPending && <Loader2 size={13} className="mr-1.5 animate-spin" />}
              {isPending ? 'Approving…' : 'Approve Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
