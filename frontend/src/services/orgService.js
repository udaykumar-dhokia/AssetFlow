import api from './api'

// ── Departments ───────────────────────────────────────────────
export const getDepartments = async () => {
  const { data } = await api.get('/organization/departments')
  return data
}

export const getDepartment = async (id) => {
  const { data } = await api.get(`/organization/departments/${id}`)
  return data
}

export const createDepartment = async (payload) => {
  const { data } = await api.post('/organization/departments', payload)
  return data
}

export const updateDepartment = async ({ id, ...payload }) => {
  const { data } = await api.patch(`/organization/departments/${id}`, payload)
  return data
}

export const deactivateDepartment = async (id) => {
  const { data } = await api.patch(`/organization/departments/${id}/deactivate`)
  return data
}

// ── Categories ────────────────────────────────────────────────
export const getCategories = async () => {
  const { data } = await api.get('/organization/categories')
  return data
}

export const getCategory = async (id) => {
  const { data } = await api.get(`/organization/categories/${id}`)
  return data
}

export const createCategory = async (payload) => {
  const { data } = await api.post('/organization/categories', payload)
  return data
}

export const updateCategory = async ({ id, ...payload }) => {
  const { data } = await api.patch(`/organization/categories/${id}`, payload)
  return data
}

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/organization/categories/${id}`)
  return data
}

// ── Employees ─────────────────────────────────────────────────
export const getEmployees = async () => {
  const { data } = await api.get('/organization/employees')
  return data
}

export const getEmployee = async (id) => {
  const { data } = await api.get(`/organization/employees/${id}`)
  return data
}

export const assignEmployeeDepartment = async ({ id, departmentId }) => {
  const { data } = await api.patch(`/organization/employees/${id}/department`, { departmentId })
  return data
}

export const changeEmployeeRole = async ({ id, role }) => {
  const { data } = await api.patch(`/organization/employees/${id}/role`, { role })
  return data
}

export const updateEmployeeStatus = async ({ id, status }) => {
  const { data } = await api.patch(`/organization/employees/${id}/status`, { status })
  return data
}
