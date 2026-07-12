import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import FormInputField from '@/components/common/FormInputField'
import FormTextarea from '@/components/common/FormTextarea'
import { useCreateCategory, useUpdateCategory } from '@/hooks/useOrgSetup'

const schema = z.object({
  name: z.string().min(1, 'Category name is required'),
  customFieldsSchema: z.string().optional().refine(val => {
    if (!val || val.trim() === '') return true
    try {
      JSON.parse(val)
      return true
    } catch (e) {
      return false
    }
  }, { message: 'Must be valid JSON' }),
})

export default function CategoryForm({ open, onOpenChange, initialData }) {
  const isEditing = !!initialData
  
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory()
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      customFieldsSchema: '',
    }
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          customFieldsSchema: initialData.customFieldsSchema 
            ? JSON.stringify(initialData.customFieldsSchema, null, 2) 
            : '',
        })
      } else {
        reset({
          name: '',
          customFieldsSchema: '',
        })
      }
    }
  }, [open, initialData, reset])

  const onSubmit = (data) => {
    let schemaObj = undefined
    if (data.customFieldsSchema && data.customFieldsSchema.trim() !== '') {
      try {
        schemaObj = JSON.parse(data.customFieldsSchema)
      } catch (e) {
        // Validation handles this
      }
    }

    const payload = {
      name: data.name,
      ...(schemaObj !== undefined && { customFieldsSchema: schemaObj })
    }

    if (isEditing) {
      updateCategory({ id: initialData.id, ...payload }, {
        onSuccess: () => onOpenChange(false)
      })
    } else {
      createCategory(payload, {
        onSuccess: () => onOpenChange(false)
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Create Category'}</DialogTitle>
        </DialogHeader>

        <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormInputField
            name="name"
            control={control}
            label="Category Name"
            placeholder="e.g. Electronics"
            errors={errors}
          />

          <FormTextarea
            name="customFieldsSchema"
            control={control}
            label="Custom Fields Schema (JSON)"
            placeholder={`{\n  "warrantyPeriod": "number",\n  "brand": "string"\n}`}
            errors={errors}
            rows={6}
          />
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="category-form" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
