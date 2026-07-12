import React, { useEffect, useState, useMemo } from 'react'
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
import FormInputField from '@/components/common/FormInputField'
import FormSelect from '@/components/common/FormSelect'
import FormCheckbox from '@/components/common/FormCheckbox'
import { useCategories } from '@/hooks/useOrgSetup'
import { useCreateAsset } from '@/hooks/useAssets'
import { Separator } from '@/components/ui/separator'

// Base schema without custom attributes
const baseSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  serialNumber: z.string().optional(),
  acquisitionDate: z.string().optional(),
  acquisitionCost: z.coerce.number().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  photoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isSharedBookable: z.boolean().default(false),
})

export default function RegisterAssetModal({ open, onOpenChange }) {
  const { data: categoriesResponse } = useCategories()
  const { mutate: createAsset, isPending } = useCreateAsset()
  
  // Use a dynamic schema state if we want to strictly validate custom fields, 
  // but for simplicity, we'll validate base fields and pass custom attributes loosely.
  const { control, handleSubmit, reset, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      serialNumber: '',
      acquisitionDate: '',
      acquisitionCost: '',
      condition: 'New',
      location: '',
      photoUrl: '',
      isSharedBookable: false,
    }
  })

  // Watch the selected category ID to render custom fields dynamically
  const selectedCategoryId = useWatch({ control, name: 'categoryId' })
  const [customFields, setCustomFields] = useState({})

  // Fetch categories array from response envelope
  const categories = useMemo(() => {
    return Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.data || [])
  }, [categoriesResponse])

  const categoryOptions = useMemo(() => {
    return categories.map(cat => ({ label: cat.name, value: cat.id }))
  }, [categories])

  const selectedCategory = useMemo(() => {
    return categories.find(c => c.id === selectedCategoryId)
  }, [categories, selectedCategoryId])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      reset()
      setCustomFields({})
    }
  }, [open, reset])

  const handleCustomFieldChange = (key, value) => {
    setCustomFields(prev => ({ ...prev, [key]: value }))
  }

  const onSubmit = (data) => {
    // Strip empty optional strings
    const payload = { ...data }
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') {
        delete payload[key]
      }
    })

    // Attach custom attributes
    if (selectedCategory && selectedCategory.customFieldsSchema) {
      const keys = Object.keys(selectedCategory.customFieldsSchema)
      if (keys.length > 0) {
        payload.customAttributes = customFields
      }
    }

    createAsset(payload, {
      onSuccess: () => {
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Asset</DialogTitle>
          <DialogDescription>
            Enter the details to register a new physical or digital asset into the system.
          </DialogDescription>
        </DialogHeader>

        <form id="register-asset-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInputField
              name="name"
              control={control}
              label="Asset Name *"
              placeholder="e.g. MacBook Pro M3"
              errors={errors}
            />
            
            <FormSelect
              name="categoryId"
              control={control}
              label="Category *"
              options={categoryOptions}
              placeholder="Select Category"
              errors={errors}
            />

            <FormInputField
              name="serialNumber"
              control={control}
              label="Serial Number"
              placeholder="e.g. C02ZG123MD6R"
              errors={errors}
            />

            <FormInputField
              name="location"
              control={control}
              label="Location"
              placeholder="e.g. HQ - Floor 3"
              errors={errors}
            />

            <FormInputField
              name="acquisitionDate"
              control={control}
              label="Acquisition Date"
              type="date"
              errors={errors}
            />

            <FormInputField
              name="acquisitionCost"
              control={control}
              label="Acquisition Cost"
              type="number"
              placeholder="e.g. 2500.00"
              errors={errors}
            />

            <FormSelect
              name="condition"
              control={control}
              label="Condition"
              options={[
                { label: 'New', value: 'New' },
                { label: 'Excellent', value: 'Excellent' },
                { label: 'Good', value: 'Good' },
                { label: 'Fair', value: 'Fair' },
                { label: 'Poor', value: 'Poor' },
              ]}
              errors={errors}
            />

            <FormInputField
              name="photoUrl"
              control={control}
              label="Photo URL"
              placeholder="https://..."
              errors={errors}
            />
          </div>

          <FormCheckbox
            name="isSharedBookable"
            control={control}
            label="Is this asset bookable by multiple people?"
            description="Check this if the asset is a shared resource (e.g. Projector, Conference Room)."
            errors={errors}
          />

          {/* Dynamic Custom Fields */}
          {selectedCategory && selectedCategory.customFieldsSchema && Object.keys(selectedCategory.customFieldsSchema).length > 0 && (
            <div className="space-y-4">
              <Separator />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Category Specific Attributes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedCategory.customFieldsSchema).map(([key, type]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type={type === 'number' ? 'number' : 'text'}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={customFields[key] || ''}
                      onChange={(e) => handleCustomFieldChange(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="register-asset-form" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isPending ? 'Registering...' : 'Register Asset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
