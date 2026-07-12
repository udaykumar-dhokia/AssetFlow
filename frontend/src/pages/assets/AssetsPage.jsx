import React, { useState, useMemo } from 'react'
import { Plus, MoreHorizontal, Eye } from 'lucide-react'
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
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAssets } from '@/hooks/useAssets'
import { useRequestTransfer } from '@/hooks/useAllocations'
import { format } from 'date-fns'
import RegisterAssetModal from './components/RegisterAssetModal'
import AllocateAssetModal from './components/AllocateAssetModal'
import ReturnAssetModal from './components/ReturnAssetModal'

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ALLOCATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  IN_MAINTENANCE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  RETIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  LOST: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

export default function AssetsPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isAllocateOpen, setIsAllocateOpen] = useState(false)
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [selectedAssetId, setSelectedAssetId] = useState(null)
  const [selectedAllocationId, setSelectedAllocationId] = useState(null)

  const { mutate: requestTransfer } = useRequestTransfer()

  // Fetch data
  const { data: response, isLoading } = useAssets({
    skip: pagination.pageIndex * pagination.pageSize,
    take: pagination.pageSize,
    search: globalFilter || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined
  })

  // Destructure response depending on actual API format (fallback to empty arrays if needed)
  const assets = response?.data || []
  const total = response?.total || assets.length
  const pageCount = Math.ceil(total / pagination.pageSize)

  const columns = useMemo(() => [
    {
      accessorKey: 'assetTag',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Asset Tag" />,
      cell: ({ row }) => <div className="font-medium text-slate-900 dark:text-slate-100">{row.getValue('assetTag')}</div>,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    },
    {
      accessorKey: 'category.name',
      id: 'category',
      header: 'Category',
      cell: ({ row }) => <div>{row.original.category?.name || 'N/A'}</div>,
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
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('location') || '-'}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const asset = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>}>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(asset.assetTag)}>
                Copy Asset Tag
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/assets/${asset.id}`} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
              
              {asset.status === 'AVAILABLE' && (
                <DropdownMenuItem onClick={() => {
                  setSelectedAssetId(asset.id)
                  setIsAllocateOpen(true)
                }}>
                  Allocate Asset
                </DropdownMenuItem>
              )}

              {asset.status === 'ALLOCATED' && (
                <>
                  <DropdownMenuItem onClick={() => requestTransfer(asset.id)}>
                    Request Transfer
                  </DropdownMenuItem>
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
  ], [requestTransfer])

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Assets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track your organization's physical and digital assets.</p>
        </div>
        <Button onClick={() => setIsRegisterOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none transition-all">
          <Plus className="mr-2 h-4 w-4" /> Register Asset
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="ALLOCATED">Allocated</SelectItem>
                <SelectItem value="IN_MAINTENANCE">In Maintenance</SelectItem>
                <SelectItem value="RETIRED">Retired</SelectItem>
                <SelectItem value="LOST">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-slate-500">Loading assets...</div>
        ) : (
          <DataTable 
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
            searchPlaceholder="Search assets by name or tag..."
          />
        )}
      </div>

      <RegisterAssetModal open={isRegisterOpen} onOpenChange={setIsRegisterOpen} />
      {selectedAssetId && (
        <AllocateAssetModal open={isAllocateOpen} onOpenChange={setIsAllocateOpen} assetId={selectedAssetId} />
      )}
      {selectedAllocationId && (
        <ReturnAssetModal open={isReturnOpen} onOpenChange={setIsReturnOpen} allocationId={selectedAllocationId} />
      )}
    </PageWrapper>
  )
}
