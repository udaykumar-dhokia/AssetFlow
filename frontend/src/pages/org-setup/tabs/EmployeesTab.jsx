import React, { useState } from 'react'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Building, UserCog, Power } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  useEmployees, 
  useUpdateEmployeeStatus, 
  useAssignEmployeeDepartment, 
  useChangeEmployeeRole,
  useDepartments
} from '@/hooks/useOrgSetup'

export default function EmployeesTab() {
  const { data: envEmps, isLoading } = useEmployees()
  const { data: envDepts } = useDepartments()
  
  const { mutate: updateStatus } = useUpdateEmployeeStatus()
  const { mutate: assignDepartment, isPending: isAssigning } = useAssignEmployeeDepartment()
  const { mutate: changeRole, isPending: isChangingRole } = useChangeEmployeeRole()
  
  const [assignDeptModalOpen, setAssignDeptModalOpen] = useState(false)
  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false)
  const [selectedEmp, setSelectedEmp] = useState(null)
  
  const [selectedDeptId, setSelectedDeptId] = useState('')
  const [selectedRole, setSelectedRole] = useState('')

  const employees = envEmps || []
  const departments = envDepts || []

  const handleAssignDeptClick = (emp) => {
    setSelectedEmp(emp)
    setSelectedDeptId(emp.department?.id || 'unassigned')
    setAssignDeptModalOpen(true)
  }

  const handleChangeRoleClick = (emp) => {
    setSelectedEmp(emp)
    setSelectedRole(emp.role || 'EMPLOYEE')
    setChangeRoleModalOpen(true)
  }

  const handleSaveDepartment = () => {
    if (!selectedEmp || !selectedDeptId) return
    const payloadDeptId = selectedDeptId === 'unassigned' ? null : selectedDeptId
    assignDepartment({ id: selectedEmp.id, departmentId: payloadDeptId }, {
      onSuccess: () => setAssignDeptModalOpen(false)
    })
  }

  const handleSaveRole = () => {
    if (!selectedEmp || !selectedRole) return
    changeRole({ id: selectedEmp.id, role: selectedRole }, {
      onSuccess: () => setChangeRoleModalOpen(false)
    })
  }

  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('name')}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => <Badge variant="outline">{row.getValue('role')}</Badge>,
    },
    {
      accessorKey: 'department',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
      cell: ({ row }) => {
        const dept = row.getValue('department')
        return dept ? dept.name : <span className="text-muted-foreground italic">Unassigned</span>
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
        const emp = row.original
        const isInactive = emp.status === 'INACTIVE'
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
              <DropdownMenuItem onClick={() => handleAssignDeptClick(emp)}>
                <Building className="mr-2 h-4 w-4" /> Assign Department
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeRoleClick(emp)}>
                <UserCog className="mr-2 h-4 w-4" /> Change Role
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => updateStatus({ id: emp.id, status: isInactive ? 'ACTIVE' : 'INACTIVE' })}
                className={isInactive ? 'text-green-600' : 'text-danger-600'}
              >
                <Power className="mr-2 h-4 w-4" /> {isInactive ? 'Activate' : 'Deactivate'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={employees}
        searchKey="name"
        searchPlaceholder="Search employees by name..."
      />

      {/* Assign Department Modal */}
      <Dialog open={assignDeptModalOpen} onOpenChange={setAssignDeptModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Department for {selectedEmp?.name}</Label>
              <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a department">
                    {selectedDeptId === 'unassigned' ? 'Unassigned (Remove Department)' : departments.find(d => String(d.id) === String(selectedDeptId))?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned" label="Unassigned (Remove Department)" textValue="Unassigned (Remove Department)">Unassigned (Remove Department)</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id} label={d.name} textValue={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDeptModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDepartment} disabled={isAssigning || !selectedDeptId} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
              {isAssigning ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Modal */}
      <Dialog open={changeRoleModalOpen} onOpenChange={setChangeRoleModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Role for {selectedEmp?.name}</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role">
                    {selectedRole === 'EMPLOYEE' ? 'Employee' : 
                     selectedRole === 'DEPT_HEAD' ? 'Department Head' : 
                     selectedRole === 'ASSET_MANAGER' ? 'Asset Manager' : 
                     selectedRole === 'ADMIN' ? 'Admin' : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE" label="Employee" textValue="Employee">Employee</SelectItem>
                  <SelectItem value="DEPT_HEAD" label="Department Head" textValue="Department Head">Department Head</SelectItem>
                  <SelectItem value="ASSET_MANAGER" label="Asset Manager" textValue="Asset Manager">Asset Manager</SelectItem>
                  <SelectItem value="ADMIN" label="Admin" textValue="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Note: To be promoted to Department Head, the employee must be assigned to a department.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRole} disabled={isChangingRole || !selectedRole} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
              {isChangingRole ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
