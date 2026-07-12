import React, { useState } from 'react'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Plus, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { useCategories, useDeleteCategory } from '@/hooks/useOrgSetup'
import CategoryForm from '../components/CategoryForm'

export default function CategoriesTab() {
  const { data: categoriesData, isLoading } = useCategories()
  const { mutate: deleteCategory } = useDeleteCategory()
  
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const categories = categoriesData || []

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setFormOpen(true)
  }

  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category Name" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: '_count',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assets Count" />,
      cell: ({ row }) => {
        const count = row.getValue('_count')?.assets || 0
        return <span>{count}</span>
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created Date" />,
      cell: ({ row }) => {
        const dateStr = row.getValue('createdAt')
        return <span>{dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A'}</span>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const category = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(category)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => deleteCategory(category.id)}
                className="text-danger-600 focus:text-danger-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0">
          <Plus size={16} /> Add Category
        </Button>
      </div>

      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={categories}
        searchKey="name"
        searchPlaceholder="Search categories..."
      />

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingCategory}
      />
    </div>
  )
}
