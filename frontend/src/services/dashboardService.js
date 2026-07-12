import api from './api'

export const getKPIs = async () => {
  const { data } = await api.get('/dashboard/kpis')
  return data
}

export const getReturns = async () => {
  const { data } = await api.get('/dashboard/returns')
  return data
}
