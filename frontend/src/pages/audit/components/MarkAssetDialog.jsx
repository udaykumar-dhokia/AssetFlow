import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ScanLine, Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import FormSelect from '@/components/common/FormSelect'
import { useAssets } from '@/hooks/useAssets'
import { useMarkAuditItem } from '@/hooks/useAudit'

const schema = z.object({
  assetId: z.string().min(1, 'Please select an asset.'),
  status: z.enum(['VERIFIED', 'MISSING', 'DAMAGED'], { message: 'Please select a status.' }),
  notes: z.string().optional(),
})

const STATUS_OPTIONS = [
  { value: 'VERIFIED', label: '✓ Verified' },
  { value: 'MISSING',  label: '✗ Missing' },
  { value: 'DAMAGED',  label: '⚠ Damaged' },
]

export default function MarkAssetDialog({ open, onOpenChange, cycleId }) {
  const { mutateAsync: mark, isPending } = useMarkAuditItem()
  const { data: assetsResponse } = useAssets({ take: 500 })
  const rawAssets = Array.isArray(assetsResponse) ? assetsResponse : (assetsResponse?.assets ?? [])
  const assetOptions = useMemo(
    () => rawAssets.map(a => ({ value: a.id, label: `${a.name} (${a.assetTag})` })),
    [rawAssets]
  )

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { assetId: '', status: '', notes: '' },
  })

  useEffect(() => { if (open) reset() }, [open, reset])

  const onSubmit = async (data) => {
    await mark({
      cycleId,
      assetId: data.assetId,
      status: data.status,
      ...(data.notes ? { notes: data.notes } : {}),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine size={18} className="text-indigo-500" />
            Mark Asset
          </DialogTitle>
          <DialogDescription>
            Record the physical status of an asset found during this audit cycle.
          </DialogDescription>
        </DialogHeader>

        <form id="mark-asset-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
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
            name="status"
            control={control}
            label="Physical Status *"
            options={STATUS_OPTIONS}
            placeholder="Select status…"
            errors={errors}
            size="h-9"
          />

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Notes <span className="normal-case">(optional)</span>
            </Label>
            <Textarea
              id="mark-notes"
              placeholder="e.g. Screen has a minor scratch."
              rows={2}
              className="resize-none"
              {...register('notes')}
            />
          </div>
        </form>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="mark-asset-form"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isPending}
          >
            {isPending && <Loader2 size={13} className="mr-1.5 animate-spin" />}
            {isPending ? 'Saving…' : 'Save Mark'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
