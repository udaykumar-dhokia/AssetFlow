import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as orgService from '@/services/orgService'
import { toast } from 'sonner'

export const ORG_KEYS = {
  all: ['organization'],
  departments: () => [...ORG_KEYS.all, 'departments'],
  department: (id) => [...ORG_KEYS.departments(), id],
  categories: () => [...ORG_KEYS.all, 'categories'],
  category: (id) => [...ORG_KEYS.categories(), id],
  employees: () => [...ORG_KEYS.all, 'employees'],
  employee: (id) => [...ORG_KEYS.employees(), id],
}

// ── Departments ───────────────────────────────────────────────

export const useDepartments = () => {
  return useQuery({
    queryKey: ORG_KEYS.departments(),
    queryFn: orgService.getDepartments,
    select: (res) => res.data, // Access envelope data
  })
}

export const useCreateDepartment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orgService.createDepartment,
    onSuccess: (res) => {
      toast.success(res.message || 'Department created successfully')
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.departments() })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create department')
    },
  })
}

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orgService.updateDepartment,
    onSuccess: (res) => {
      toast.success(res.message || 'Department updated successfully')
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.departments() })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update department')
    },
  })
}

export const useDeactivateDepartment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orgService.deactivateDepartment,
    onSuccess: (res) => {
      toast.success(res.message || 'Department deactivated')
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.departments() })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to deactivate department')
    },
  })
}

// ── Categories ────────────────────────────────────────────────

export const useCategories = () => {
  return useQuery({
    queryKey: ORG_KEYS.categories(),
    queryFn: orgService.getCategories,
    select: (res) => res.data,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orgService.createCategory,
    onSuccess: (res) => {
      toast.success(res.message || 'Category created successfully')
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.categories() })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create category')
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orgService.updateCategory,
    onSuccess: (res) => {
      toast.success(res.message || 'Category updated successfully')
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.categories() })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update category')
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orgService.deleteCategory,
    onSuccess: (res) => {
      toast.success(res.message || 'Category deleted successfully')
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.categories() })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete category')
    },
  })
}

// ── Employees ─────────────────────────────────────────────────

export const useEmployees = () => {
  return useQuery({
    queryKey: ORG_KEYS.employees(),
    queryFn: orgService.getEmployees,
    select: (res) => res.data,
  })
}

export const useAssignEmployeeDepartment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orgService.assignEmployeeDepartment,
    onSuccess: (res) => {
      toast.success(res.message || 'Department assigned successfully')
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.employees() })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to assign department')
    },
  })
}

export const useChangeEmployeeRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orgService.changeEmployeeRole,
    onSuccess: (res) => {
      toast.success(res.message || 'Role updated successfully')
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.employees() })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update role')
    },
  })
}

export const useUpdateEmployeeStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: orgService.updateEmployeeStatus,
    onSuccess: (res) => {
      toast.success(res.message || 'Employee status updated')
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.employees() })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update status')
    },
  })
}
