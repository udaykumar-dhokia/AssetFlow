import React, { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
import FormSelect from '@/components/common/FormSelect'
import FormInputField from '@/components/common/FormInputField'
import { useEmployees, useDepartments } from '@/hooks/useOrgSetup'
import { useAllocateAsset } from '@/hooks/useAllocations'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const schema = z.object({
  entityId: z.string().min(1, 'Please select a recipient'),
  expectedReturnDate: z.string().optional(),
})

export default function AllocateAssetModal({ open, onOpenChange, assetId }) {
  const { data: employeesResponse } = useEmployees()
  const { data: departmentsResponse } = useDepartments()
  const { mutate: allocateAsset, isPending } = useAllocateAsset()

  const [allocationType, setAllocationType] = useState('USER') // USER or DEPARTMENT

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      entityId: '',
      expectedReturnDate: '',
    }
  })

  useEffect(() => {
    if (open) {
      reset()
      setAllocationType('USER')
    }
  }, [open, reset])

  const employees = useMemo(() => Array.isArray(employeesResponse) ? employeesResponse : (employeesResponse?.data || []), [employeesResponse])
  const departments = useMemo(() => Array.isArray(departmentsResponse) ? departmentsResponse : (departmentsResponse?.data || []), [departmentsResponse])

  const employeeOptions = useMemo(() => employees.map(e => ({ label: `${e.firstName} ${e.lastName}`, value: e.id })), [employees])
  const departmentOptions = useMemo(() => departments.map(d => ({ label: d.name, value: d.id })), [departments])

  const onSubmit = (data) => {
    const payload = {
      assetId,
      allocatedToUserId: allocationType === 'USER' ? data.entityId : null,
      allocatedToDepartmentId: allocationType === 'DEPARTMENT' ? data.entityId : null,
      ...(data.expectedReturnDate && { expectedReturnDate: new Date(data.expectedReturnDate).toISOString() })
    }

    allocateAsset(payload, {
      onSuccess: () => onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Allocate Asset</DialogTitle>
          <DialogDescription>
            Assign this asset to a specific user or department.
          </DialogDescription>
        </DialogHeader>

        <form id="allocate-asset-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Allocate To</Label>
            <RadioGroup 
              value={allocationType} 
              onValueChange={(val) => {
                setAllocationType(val)
                reset({ entityId: '', expectedReturnDate: '' }) // clear selection when switching
              }}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="USER" id="user" />
                <Label htmlFor="user" className="font-normal">User</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DEPARTMENT" id="department" />
                <Label htmlFor="department" className="font-normal">Department</Label>
              </div>
            </RadioGroup>
          </div>

          <FormSelect
            name="entityId"
            control={control}
            label={allocationType === 'USER' ? 'Select User *' : 'Select Department *'}
            options={allocationType === 'USER' ? employeeOptions : departmentOptions}
            placeholder={allocationType === 'USER' ? 'Search for a user' : 'Search for a department'}
            errors={errors}
          />

          <FormInputField
            name="expectedReturnDate"
            control={control}
            label="Expected Return Date"
            type="date"
            errors={errors}
          />
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="allocate-asset-form" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isPending ? 'Allocating...' : 'Allocate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
