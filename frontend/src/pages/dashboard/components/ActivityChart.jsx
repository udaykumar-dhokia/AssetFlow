import {
  PieChart, 
  Pie, 
  Cell,
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Label
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from 'lucide-react'

export default function ActivityChart({ kpis }) {
  if (!kpis) return null;

  const data = [
    { name: 'Available', value: kpis.assetsAvailable || 0, color: '#3b82f6' }, // Blue
    { name: 'Allocated', value: kpis.assetsAllocated || 0, color: '#8b5cf6' }, // Violet
    { name: 'In Maintenance', value: kpis.maintenanceToday || 0, color: '#f59e0b' }, // Amber
  ]

  // Filter out 0 values so the chart renders cleanly, 
  // but if you want to keep them, you can remove this filter.
  const chartData = data.filter(item => item.value > 0)
  
  const hasData = chartData.length > 0;
  
  const totalAssets = (kpis?.assetsAvailable || 0) + (kpis?.assetsAllocated || 0) + (kpis?.maintenanceToday || 0)

  return (
    <Card className="h-full border-slate-200/50 dark:border-slate-800/50 shadow-sm backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Asset Distribution</CardTitle>
        <CardDescription>Current snapshot of asset statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4 flex items-center justify-center">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label 
                    value={`${totalAssets}`} 
                    position="centerBottom" 
                    className="text-3xl font-bold fill-slate-900 dark:fill-white" 
                    dy={-10}
                  />
                  <Label 
                    value="Total Assets" 
                    position="centerTop" 
                    className="text-sm fill-slate-500 dark:fill-slate-400" 
                    dy={15}
                  />
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  }}
                  itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-500 text-sm flex flex-col items-center">
               <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                 <Package className="text-slate-400" />
               </div>
               No asset data to display
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
