import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package, Clock, Settings, MapPin, Tag, Wrench, User } from 'lucide-react'
import PageWrapper from '@/layouts/PageWrapper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAsset, useAssetHistory } from '@/hooks/useAssets'
import { format } from 'date-fns'

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ALLOCATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  UNDER_MAINTENANCE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  RETIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  LOST: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

export default function AssetDetailsPage() {
  const { id } = useParams()
  const { data: assetData, isLoading: isLoadingAsset } = useAsset(id)
  const { data: historyResponse, isLoading: isLoadingHistory } = useAssetHistory(id)

  const asset = assetData?.data || assetData
  // Extract history array from envelope if exists
  const historyList = historyResponse?.data || (Array.isArray(historyResponse) ? historyResponse : [])

  if (isLoadingAsset) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 md:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (!asset) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <Package className="h-12 w-12 mb-4 text-slate-300" />
          <h2>Asset not found</h2>
          <Button variant="link" asChild className="mt-2">
            <Link to="/assets">Back to Assets</Link>
          </Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="mb-6">
        <Button variant="ghost" asChild className="-ml-4 mb-4">
          <Link to="/assets" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assets
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{asset.name}</h1>
            <p className="text-slate-500">{asset.assetTag} • {asset.category?.name || 'Uncategorized'}</p>
          </div>
          <div className="flex gap-2 items-center">
            <Badge className={`px-3 py-1 border-none ${STATUS_COLORS[asset.status] || STATUS_COLORS.AVAILABLE}`}>
              {asset.status?.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-500" /> General Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Serial Number</label>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{asset.serialNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Condition</label>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{asset.condition || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Acquisition Date</label>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                    {asset.acquisitionDate ? format(new Date(asset.acquisitionDate), 'PP') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Acquisition Cost</label>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                    {asset.acquisitionCost ? `$${Number(asset.acquisitionCost).toLocaleString()}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Location</label>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-slate-400" /> {asset.location || 'Not Specified'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Shared Bookable</label>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                    {asset.isSharedBookable ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Attributes */}
          {asset.customAttributes && Object.keys(asset.customAttributes).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-indigo-500" /> Custom Attributes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Object.entries(asset.customAttributes).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-slate-500 uppercase">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - History Timeline */}
        <div className="space-y-6">
          {asset.photoUrl && (
            <Card className="overflow-hidden">
              <img src={asset.photoUrl} alt={asset.name} className="w-full h-48 object-cover" />
            </Card>
          )}
          
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" /> Asset History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : historyList.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No history records found.</p>
              ) : (
                <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-6">
                  {historyList.map((entry, index) => {
                    const isAlloc = entry.type === 'ALLOCATION'
                    return (
                      <div key={index} className="pl-6 relative">
                        <div className={`absolute -left-[17px] top-1 h-8 w-8 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center ${isAlloc ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                          {isAlloc ? <User className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">
                            {format(new Date(entry.date), 'MMM d, yyyy - h:mm a')}
                          </p>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {isAlloc ? 'Allocation' : 'Maintenance'}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {entry.details}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}
