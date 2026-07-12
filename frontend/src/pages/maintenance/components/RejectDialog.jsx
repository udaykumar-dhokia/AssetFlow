import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { XCircle, Loader2, MessageSquare } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useRejectRequest } from '@/hooks/useMaintenance'

const schema = z.object({
  reason: z.string().min(5, 'Please provide a reason (min 5 characters).'),
})

export default function RejectDialog({ open, onOpenChange, requestId }) {
  const { mutateAsync: reject, isPending } = useRejectRequest()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { reason: '' },
  })

  useEffect(() => { if (open) reset() }, [open, reset])

  const onSubmit = async (data) => {
    await reject({ id: requestId, reason: data.reason })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle size={18} className="text-destructive" />
            Reject Request
          </DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this maintenance request. The requester will be notified.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <MessageSquare size={13} /> Reason <span className="normal-case text-destructive">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Just a dirty keyboard, please clean it yourself."
              rows={3}
              className="resize-none"
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-xs text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="destructive" disabled={isPending}>
              {isPending && <Loader2 size={13} className="mr-1.5 animate-spin" />}
              {isPending ? 'Rejecting…' : 'Reject Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
