import React from 'react'
import PageWrapper from '@/layouts/PageWrapper'
import { Building2, Layers, Users } from 'lucide-react'
import { ReusableTabs } from '@/components/ui/reusable-tabs'

import DepartmentsTab from './tabs/DepartmentsTab'
import CategoriesTab from './tabs/CategoriesTab'
import EmployeesTab from './tabs/EmployeesTab'

export default function OrgSetupPage() {
  const orgTabs = [
    {
      value: 'departments',
      label: (
        <div className="flex items-center gap-2">
          <Building2 size={16} />
          <span>Departments</span>
        </div>
      ),
      content: <DepartmentsTab />,
    },
    {
      value: 'categories',
      label: (
        <div className="flex items-center gap-2">
          <Layers size={16} />
          <span>Asset Categories</span>
        </div>
      ),
      content: <CategoriesTab />,
    },
    {
      value: 'employees',
      label: (
        <div className="flex items-center gap-2">
          <Users size={16} />
          <span>Employees</span>
        </div>
      ),
      content: <EmployeesTab />,
    },
  ]

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Organization Setup
          </h2>
          <p className="text-sm text-slate-500">
            Manage your organization's departments, asset categories, and employees.
          </p>
        </div>

        <div className="w-full">
          <ReusableTabs 
            tabs={orgTabs} 
            defaultValue="departments"
          />
        </div>
      </div>
    </PageWrapper>
  )
}
