import { motion } from 'motion/react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, AlertCircle, Laptop } from 'lucide-react'

dayjs.extend(relativeTime)

const ReturnItem = ({ item, isOverdue }) => {
  const { asset, allocatedToUser, expectedReturnDate } = item
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
          {asset.photoUrl ? (
            <img src={asset.photoUrl} alt={asset.name} className="w-full h-full object-cover" />
          ) : (
            <Laptop size={24} className="text-slate-400" />
          )}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {asset.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">
              {asset.assetTag}
            </Badge>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-[8px]">{allocatedToUser.name.substring(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {allocatedToUser.name}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-medium flex items-center justify-end gap-1.5 ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
          {isOverdue ? <AlertCircle size={14} /> : <CalendarClock size={14} />}
          {dayjs(expectedReturnDate).format('MMM D, YYYY')}
        </div>
        <p className={`text-xs mt-1 ${isOverdue ? 'text-rose-500 font-medium' : 'text-slate-500'}`}>
          {dayjs(expectedReturnDate).fromNow()}
        </p>
      </div>
    </motion.div>
  )
}

export default function ReturnsList({ overdueReturns = [], upcomingReturns = [] }) {
  return (
    <Card className="border-slate-200/50 dark:border-slate-800/50 shadow-sm backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Asset Returns</CardTitle>
        <CardDescription>Track upcoming and overdue asset returns.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={overdueReturns.length > 0 ? "overdue" : "upcoming"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="overdue" className="data-[state=active]:bg-rose-50 data-[state=active]:text-rose-600 dark:data-[state=active]:bg-rose-500/10 dark:data-[state=active]:text-rose-400">
              Overdue
              {overdueReturns.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">{overdueReturns.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming
              {upcomingReturns.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">{upcomingReturns.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overdue" className="mt-0">
            {overdueReturns.length > 0 ? (
              <div className="space-y-1">
                {overdueReturns.map((item) => (
                  <ReturnItem key={item.id} item={item} isOverdue={true} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
                  <AlertCircle className="text-emerald-500" size={24} />
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300">All caught up!</p>
                <p className="text-sm">No overdue returns at this time.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-0">
            {upcomingReturns.length > 0 ? (
              <div className="space-y-1">
                {upcomingReturns.map((item) => (
                  <ReturnItem key={item.id} item={item} isOverdue={false} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-3">
                  <CalendarClock className="text-slate-400" size={24} />
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300">No upcoming returns</p>
                <p className="text-sm">There are no assets scheduled for return soon.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
