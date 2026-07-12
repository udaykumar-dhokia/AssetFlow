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
import FormSelect from '@/components/common/FormSelect'
import { useCreateDepartment, useUpdateDepartment, useDepartments } from '@/hooks/useOrgSetup'
import { useEmployees } from '@/hooks/useOrgSetup'

const schema = z.object({
  name: z.string().min(1, 'Department name is required'),
  parentDepartmentId: z.string().nullable().optional(),
  headUserId: z.string().nullable().optional(),
})

export default function DepartmentForm({ open, onOpenChange, initialData }) {
  const isEditing = !!initialData
  
  const { mutate: createDepartment, isPending: isCreating } = useCreateDepartment()
  const { mutate: updateDepartment, isPending: isUpdating } = useUpdateDepartment()
  
  const { data: envDepts } = useDepartments()
  const { data: envEmps } = useEmployees()

  const departments = envDepts || []
  const employees = envEmps || []

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      parentDepartmentId: null,
      headUserId: null,
    }
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name || '',
          parentDepartmentId: initialData.parentDepartment?.id || '',
          headUserId: initialData.headUser?.id || '',
        })
      } else {
        reset({
          name: '',
          parentDepartmentId: '',
          headUserId: '',
        })
      }
    }
  }, [open, initialData, reset])

  const onSubmit = (data) => {
    // Convert empty strings to null for API
    const payload = {
      name: data.name,
      parentDepartmentId: data.parentDepartmentId || null,
      headUserId: data.headUserId || null,
    }

    if (isEditing) {
      updateDepartment({ id: initialData.id, ...payload }, {
        onSuccess: () => onOpenChange(false)
      })
    } else {
      createDepartment(payload, {
        onSuccess: () => onOpenChange(false)
      })
    }
  }

  // Filter out the current department from parent options if editing
  const deptOptions = [
    { label: 'None (Top Level)', value: '' },
    ...departments
      .filter(d => !isEditing || d.id !== initialData.id)
      .map(d => ({ label: d.name, value: d.id }))
  ]
  
  const empOptions = [
    { label: 'Unassigned', value: '' },
    ...employees
      .map(e => ({ label: `${e.name} (${e.email})`, value: e.id }))
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Department' : 'Create Department'}</DialogTitle>
        </DialogHeader>

        <form id="department-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormInputField
            name="name"
            control={control}
            label="Department Name"
            placeholder="e.g. Engineering"
            errors={errors}
          />

          <FormSelect
            name="parentDepartmentId"
            control={control}
            label="Parent Department (Optional)"
            placeholder="Select a parent department"
            options={deptOptions}
            errors={errors}
          />

          <FormSelect
            name="headUserId"
            control={control}
            label="Department Head (Optional)"
            placeholder="Select a user"
            options={empOptions}
            errors={errors}
          />
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="department-form" disabled={isCreating || isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
            {isCreating || isUpdating ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
