import React, { useState } from 'react'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Plus, Edit, Ban } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDepartments, useDeactivateDepartment } from '@/hooks/useOrgSetup'
import DepartmentForm from '../components/DepartmentForm'

export default function DepartmentsTab() {
  const { data: envelope, isLoading } = useDepartments()
  const { mutate: deactivateDepartment } = useDeactivateDepartment()
  
  const [formOpen, setFormOpen] = useState(false)
  const [editingDept, setEditingDept] = useState(null)

  const departments = envelope?.data || []

  const handleEdit = (dept) => {
    setEditingDept(dept)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setEditingDept(null)
    setFormOpen(true)
  }

  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Department Name" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'parentDepartment',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Parent" />,
      cell: ({ row }) => {
        const parent = row.getValue('parentDepartment')
        return parent ? parent.name : <span className="text-muted-foreground italic">None</span>
      },
    },
    {
      accessorKey: 'headUser',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Head" />,
      cell: ({ row }) => {
        const head = row.getValue('headUser')
        return head ? head.name : <span className="text-muted-foreground italic">Unassigned</span>
      },
    },
    {
      accessorKey: '_count',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Members" />,
      cell: ({ row }) => {
        const count = row.getValue('_count')?.members || 0
        return <span>{count}</span>
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue('status')
        return (
          <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'} className={status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const dept = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(dept)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              {dept.status !== 'INACTIVE' && (
                <DropdownMenuItem 
                  onClick={() => deactivateDepartment(dept.id)}
                  className="text-danger-600 focus:text-danger-600"
                >
                  <Ban className="mr-2 h-4 w-4" /> Deactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate} className="gap-2">
          <Plus size={16} /> Add Department
        </Button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground">Loading departments...</div>
      ) : (
        <DataTable
          columns={columns}
          data={departments}
          searchKey="name"
          searchPlaceholder="Search departments..."
        />
      )}

      <DepartmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingDept}
      />
    </div>
  )
}
