import React, { useState, useMemo } from 'react'
import { ArrowLeftRight, MoreHorizontal, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageWrapper from '@/layouts/PageWrapper'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAssets } from '@/hooks/useAssets'
import { useRequestTransfer, useApproveTransfer } from '@/hooks/useAllocations'
import { useAuth } from '@/hooks/useAuth'
import { useEmployees, useDepartments } from '@/hooks/useOrgSetup'
import { format } from 'date-fns'
import AllocateAssetModal from '@/pages/assets/components/AllocateAssetModal'
import ReturnAssetModal from '@/pages/assets/components/ReturnAssetModal'
import { Package, Users, ArrowRightLeft } from 'lucide-react'

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ALLOCATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  UNDER_MAINTENANCE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  RETIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  LOST: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

export default function AllocationPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isAllocateOpen, setIsAllocateOpen] = useState(false)
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [selectedAssetId, setSelectedAssetId] = useState(null)
  const [selectedAllocationId, setSelectedAllocationId] = useState(null)

  const { isAdmin, isAssetManager, isDepartmentHead } = useAuth()
  const canAllocate = isAdmin || isAssetManager || isDepartmentHead

  const { mutate: requestTransfer } = useRequestTransfer()
  const { mutate: approveTransfer } = useApproveTransfer()

  // Fetch data
  const { data: response, isLoading } = useAssets({
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
    search: globalFilter || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined
  })

  // Destructure response depending on actual API format
  const assets = response?.assets || response?.data || []
  const total = response?.total || assets.length
  const pageCount = Math.ceil(total / pagination.pageSize)

  const { data: employeesData } = useEmployees()
  const { data: departmentsData } = useDepartments()

  const employeesMap = useMemo(() => {
    const arr = Array.isArray(employeesData) ? employeesData : employeesData?.data || []
    return arr.reduce((acc, curr) => ({ ...acc, [curr.id]: `${curr.firstName} ${curr.lastName}` }), {})
  }, [employeesData])

  const departmentsMap = useMemo(() => {
    const arr = Array.isArray(departmentsData) ? departmentsData : departmentsData?.data || []
    return arr.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.name }), {})
  }, [departmentsData])

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Asset" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 dark:text-slate-100">{row.getValue('name')}</span>
          <span className="text-xs text-muted-foreground">{row.original.assetTag}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') || 'AVAILABLE'
        return (
          <Badge variant="outline" className={`border-none ${STATUS_COLORS[status] || STATUS_COLORS.AVAILABLE}`}>
            {status.replace('_', ' ')}
          </Badge>
        )
      },
    },
    {
      id: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => {
        const activeAlloc = row.original.activeAllocation
        if (!activeAlloc) return <span className="text-muted-foreground italic">Unassigned</span>
        
        if (activeAlloc.allocatedToUserId) {
          const userName = employeesMap[activeAlloc.allocatedToUserId] || activeAlloc.user?.firstName || 'User'
          return <span>{userName}</span>
        }
        if (activeAlloc.allocatedToDepartmentId) {
          const deptName = departmentsMap[activeAlloc.allocatedToDepartmentId] || activeAlloc.department?.name || 'Department'
          return <span>{deptName} (Dept)</span>
        }
        return <span className="text-muted-foreground italic">Unknown</span>
      }
    },
    {
      id: 'expectedReturn',
      header: 'Expected Return',
      cell: ({ row }) => {
        const activeAlloc = row.original.activeAllocation
        if (!activeAlloc || !activeAlloc.expectedReturnDate) return <span className="text-muted-foreground">-</span>
        const dateStr = format(new Date(activeAlloc.expectedReturnDate), 'MMM d, yyyy')
        const isOverdue = new Date(activeAlloc.expectedReturnDate) < new Date()
        return (
          <span className={isOverdue ? 'text-red-600 font-medium dark:text-red-400' : ''}>
            {dateStr} {isOverdue && <span className="ml-1 text-xs uppercase bg-red-100 text-red-700 dark:bg-red-900/30 px-1 rounded">Overdue</span>}
          </span>
        )
      }
    },
    {
      id: 'transferStatus',
      header: 'Transfer Status',
      cell: ({ row }) => {
        const activeAlloc = row.original.activeAllocation
        if (activeAlloc?.status === 'TRANSFER_REQUESTED') {
          return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">Transfer Requested</Badge>
        }
        return <span className="text-muted-foreground">-</span>
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const asset = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to={`/assets/${asset.id}`} className="cursor-pointer">
               View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {asset.status === 'AVAILABLE' && canAllocate && (
                <DropdownMenuItem onClick={() => {
                  setSelectedAssetId(asset.id)
                  setIsAllocateOpen(true)
                }}>
                  Allocate Asset
                </DropdownMenuItem>
              )}

              {asset.status === 'ALLOCATED' && (
                <>
                  {asset.activeAllocation?.status === 'TRANSFER_REQUESTED' ? (
                    canAllocate && (
                      <DropdownMenuItem onClick={() => approveTransfer(asset.activeAllocation.id)}>
                        Approve Transfer
                      </DropdownMenuItem>
                    )
                  ) : (
                    <DropdownMenuItem onClick={() => requestTransfer(asset.id)}>
                      Request Transfer
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => {
                    const activeAllocId = asset.activeAllocation?.id || asset.activeAllocationId || 'demo-alloc-id'
                    setSelectedAllocationId(activeAllocId)
                    setIsReturnOpen(true)
                  }}>
                    Return Asset
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [requestTransfer, approveTransfer, canAllocate, employeesMap, departmentsMap])

  const stats = useMemo(() => {
    const available = assets.filter(a => a.status === 'AVAILABLE').length
    const allocated = assets.filter(a => a.status === 'ALLOCATED').length
    const pendingTransfers = assets.filter(a => a.activeAllocation?.status === 'TRANSFER_REQUESTED').length

    return [
      { label: 'Available in Pool', value: available, icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { label: 'Currently Allocated', value: allocated, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { label: 'Pending Transfers', value: pendingTransfers, icon: ArrowRightLeft, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ]
  }, [assets])

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Allocation & Transfer</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage asset assignments, returns, and transfer requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          {/* Status Filter */}
          <div className="w-full sm:!w-50">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Assets</SelectItem>
                <SelectItem value="AVAILABLE">Available for Allocation</SelectItem>
                <SelectItem value="ALLOCATED">Currently Allocated</SelectItem>
                <SelectItem value="UNDER_MAINTENANCE">In Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable 
          isLoading={isLoading}
          columns={columns} 
          data={assets} 
          // Pagination
          manualPagination
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          // Global Filter (Search)
          manualFiltering
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          searchPlaceholder="Search assets to allocate..."
        />
      </div>

      {selectedAssetId && (
        <AllocateAssetModal open={isAllocateOpen} onOpenChange={setIsAllocateOpen} assetId={selectedAssetId} />
      )}
      {selectedAllocationId && (
        <ReturnAssetModal open={isReturnOpen} onOpenChange={setIsReturnOpen} allocationId={selectedAllocationId} />
      )}
    </PageWrapper>
  )
}
