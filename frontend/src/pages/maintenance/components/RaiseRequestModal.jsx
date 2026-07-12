import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Wrench, Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FormSelect from '@/components/common/FormSelect'
import FormTextarea from '@/components/common/FormTextarea'
import { useAssets } from '@/hooks/useAssets'
import { useCreateMaintenanceRequest } from '@/hooks/useMaintenance'

const schema = z.object({
  assetId: z.string().min(1, 'Please select an asset.'),
  issueDescription: z.string().min(10, 'Please describe the issue (min 10 chars).'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], { message: 'Please select a priority.' }),
  photoUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
})

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
]

export default function RaiseRequestModal({ open, onOpenChange }) {
  const { mutateAsync: createRequest, isPending } = useCreateMaintenanceRequest()

  // Fetch assets for the selector (employees can only request for assets allocated to them,
  // but we show all — the server enforces the business rule)
  const { data: assetsResponse } = useAssets({ take: 200 })
  const rawAssets = Array.isArray(assetsResponse) ? assetsResponse : (assetsResponse?.assets ?? [])
  const assetOptions = useMemo(
    () => rawAssets.map(a => ({ value: a.id, label: `${a.name} (${a.assetTag})` })),
    [rawAssets]
  )

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      assetId: '',
      issueDescription: '',
      priority: '',
      photoUrl: '',
    },
  })

  useEffect(() => { if (open) reset() }, [open, reset])

  const onSubmit = async (data) => {
    const payload = {
      assetId: data.assetId,
      issueDescription: data.issueDescription,
      priority: data.priority,
      ...(data.photoUrl ? { photoUrl: data.photoUrl } : {}),
    }
    await createRequest(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench size={18} className="text-orange-500" />
            Raise Maintenance Request
          </DialogTitle>
          <DialogDescription>
            Report an issue with an asset. Admins/Managers can raise requests for any asset; employees can only raise for assets allocated to them.
          </DialogDescription>
        </DialogHeader>

        <form id="raise-request-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <FormSelect
            name="assetId"
            control={control}
            label="Asset *"
            options={assetOptions}
            placeholder="Select asset…"
            errors={errors}
            size="h-9"
          />

          <FormSelect
            name="priority"
            control={control}
            label="Priority *"
            options={PRIORITY_OPTIONS}
            placeholder="Select priority…"
            errors={errors}
            size="h-9"
          />

          <FormTextarea
            name="issueDescription"
            control={control}
            label="Issue Description *"
            placeholder="Describe the problem in detail…"
            rows={3}
            errors={errors}
          />

          {/* Photo URL — optional */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Photo URL <span className="normal-case">(optional)</span>
            </Label>
            <Input
              id="photo-url"
              placeholder="https://example.com/photo.jpg"
              className="h-9"
              {...register('photoUrl')}
            />
            {errors.photoUrl && (
              <p className="text-xs text-destructive">{errors.photoUrl.message}</p>
            )}
          </div>
        </form>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="raise-request-form"
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isPending}
          >
            {isPending && <Loader2 size={13} className="mr-1.5 animate-spin" />}
            {isPending ? 'Submitting…' : 'Raise Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
