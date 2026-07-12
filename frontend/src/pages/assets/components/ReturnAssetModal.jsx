import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import FormTextarea from '@/components/common/FormTextarea'
import { useReturnAsset } from '@/hooks/useAllocations'

const schema = z.object({
  returnConditionNotes: z.string().optional(),
})

export default function ReturnAssetModal({ open, onOpenChange, allocationId }) {
  const { mutate: returnAsset, isPending } = useReturnAsset()

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      returnConditionNotes: '',
    }
  })

  useEffect(() => {
    if (open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = (data) => {
    returnAsset(
      { id: allocationId, data },
      {
        onSuccess: () => onOpenChange(false)
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Return Asset</DialogTitle>
          <DialogDescription>
            Mark this asset as returned to make it available again. Please provide any notes about its condition upon return.
          </DialogDescription>
        </DialogHeader>

        <form id="return-asset-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <FormTextarea
            name="returnConditionNotes"
            control={control}
            label="Condition Notes (Optional)"
            placeholder="e.g., Screen has a small scratch..."
            errors={errors}
            rows={4}
          />
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="return-asset-form" disabled={isPending || !allocationId} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isPending ? 'Processing...' : 'Confirm Return'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
