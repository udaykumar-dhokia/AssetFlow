import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import PageWrapper from '@/layouts/PageWrapper'
import { useDashboardKPIs, useDashboardReturns } from '@/hooks/useDashboard'
import PageLoader from '@/components/loaders/PageLoader'
import StatCard from './components/StatCard'
import ReturnsList from './components/ReturnsList'
import ActivityChart from './components/ActivityChart'
import { 
  Package, 
  PackageCheck, 
  Wrench, 
  CalendarCheck, 
  ArrowRightLeft, 
  Clock, 
  AlertOctagon,
  MonitorUp,
  CalendarPlus,
  AlertTriangle
} from 'lucide-react'
import { motion } from 'motion/react'

export default function DashboardPage() {
  const user = useSelector((state) => state.auth?.user)
  const navigate = useNavigate()
  
  const { 
    data: kpis, 
    isLoading: isLoadingKPIs, 
    error: kpiError 
  } = useDashboardKPIs()

  const { 
    data: returns, 
    isLoading: isLoadingReturns, 
    error: returnsError 
  } = useDashboardReturns()

  if (isLoadingKPIs || isLoadingReturns) {
    return <PageLoader />
  }

  if (kpiError || returnsError) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto mt-8 flex items-center gap-3 p-4 text-sm text-rose-800 border border-rose-200 rounded-lg bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900">
          <AlertOctagon className="h-4 w-4" />
          <p>Failed to load dashboard data. Please try again later.</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <div className="relative min-h-full">
      {/* Subtle modern background pattern */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 z-0" />
      
      <PageWrapper className="relative z-10">
        <div className="space-y-8 p-1">
          {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="text-slate-500">
              Here's what's happening with your assets today.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" onClick={() => navigate('/allocation')}>
              <MonitorUp className="mr-2 h-4 w-4" />
              Assign Asset
            </Button>
            <Button size="sm" variant="secondary" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm border border-slate-200 dark:border-slate-700" onClick={() => navigate('/booking')}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
            <Button size="sm" variant="secondary" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm border border-slate-200 dark:border-slate-700" onClick={() => navigate('/maintenance')}>
              <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
              Report Issue
            </Button>
          </div>
        </motion.div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <StatCard 
            title="Assets Available" 
            value={kpis?.assetsAvailable} 
            icon={Package} 
            color="blue" 
            delay={0.05} 
          />
          <StatCard 
            title="Assets Allocated" 
            value={kpis?.assetsAllocated} 
            icon={PackageCheck} 
            color="indigo" 
            delay={0.1} 
          />
          <StatCard 
            title="Maintenance Today" 
            value={kpis?.maintenanceToday} 
            icon={Wrench} 
            color="orange" 
            delay={0.15} 
          />
          <StatCard 
            title="Active Bookings" 
            value={kpis?.activeBookings} 
            icon={CalendarCheck} 
            color="green" 
            delay={0.2} 
          />
          <StatCard 
            title="Pending Transfers" 
            value={kpis?.pendingTransfers} 
            icon={ArrowRightLeft} 
            color="yellow" 
            delay={0.25} 
          />
          <StatCard 
            title="Upcoming Returns" 
            value={kpis?.upcomingReturns} 
            icon={Clock} 
            color="purple" 
            delay={0.3} 
          />
          <StatCard 
            title="Overdue Returns" 
            value={kpis?.overdueReturns} 
            icon={AlertOctagon} 
            color="red" 
            delay={0.35} 
          />
        </div>

        {/* Below KPI Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main content area (Returns) */}
          <div className="lg:col-span-2 flex">
            <div className="w-full">
              <ReturnsList 
                overdueReturns={returns?.overdueReturns} 
                upcomingReturns={returns?.upcomingReturns} 
              />
            </div>
          </div>

          {/* Right sidebar area for Chart */}
          <div className="lg:col-span-1 flex">
            <div className="w-full">
              <ActivityChart kpis={kpis} />
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
    </div>
  )
}
