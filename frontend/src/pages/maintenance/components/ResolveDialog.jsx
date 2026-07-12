import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCheck, Loader2, ClipboardList } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useResolveRequest } from '@/hooks/useMaintenance'

const schema = z.object({
  resolutionNotes: z.string().min(5, 'Please describe how the issue was resolved (min 5 chars).'),
})

export default function ResolveDialog({ open, onOpenChange, requestId }) {
  const { mutateAsync: resolve, isPending } = useResolveRequest()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { resolutionNotes: '' },
  })

  useEffect(() => { if (open) reset() }, [open, reset])

  const onSubmit = async (data) => {
    await resolve({ id: requestId, resolutionNotes: data.resolutionNotes })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCheck size={18} className="text-emerald-500" />
            Resolve Request
          </DialogTitle>
          <DialogDescription>
            Marking as resolved will automatically set the asset status back to <strong>Available</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <ClipboardList size={13} /> Resolution Notes <span className="text-destructive normal-case">*</span>
            </Label>
            <Textarea
              id="resolution-notes"
              placeholder="e.g. Replaced the LCD panel under warranty."
              rows={4}
              className="resize-none"
              {...register('resolutionNotes')}
            />
            {errors.resolutionNotes && (
              <p className="text-xs text-destructive">{errors.resolutionNotes.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isPending}>
              {isPending && <Loader2 size={13} className="mr-1.5 animate-spin" />}
              {isPending ? 'Resolving…' : 'Mark as Resolved'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
