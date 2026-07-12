import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserCog, Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAssignTechnician } from '@/hooks/useMaintenance'

const schema = z.object({
  technicianName: z.string().min(2, 'Technician name is required (min 2 chars).'),
})

export default function AssignTechnicianDialog({ open, onOpenChange, requestId }) {
  const { mutateAsync: assign, isPending } = useAssignTechnician()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { technicianName: '' },
  })

  useEffect(() => { if (open) reset() }, [open, reset])

  const onSubmit = async (data) => {
    await assign({ id: requestId, technicianName: data.technicianName })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog size={18} className="text-violet-500" />
            Assign Technician
          </DialogTitle>
          <DialogDescription>
            Assign a technician to handle this approved maintenance request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Technician Name <span className="text-destructive normal-case">*</span>
            </Label>
            <Input
              id="technician-name"
              placeholder="e.g. Dell External Service Center"
              className="h-9"
              {...register('technicianName')}
            />
            {errors.technicianName && (
              <p className="text-xs text-destructive">{errors.technicianName.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-violet-600 hover:bg-violet-700 text-white" disabled={isPending}>
              {isPending && <Loader2 size={13} className="mr-1.5 animate-spin" />}
              {isPending ? 'Assigning…' : 'Assign Technician'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
