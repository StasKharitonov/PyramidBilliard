import client from './client'

export async function getTables(type) {
  const { data } = await client.get('/tables/', { params: type ? { type } : {} })
  return data
}

export async function getTable(id) {
  const { data } = await client.get(`/tables/${id}/`)
  return data
}

export async function getAvailability(id, date) {
  const { data } = await client.get(`/tables/${id}/availability/`, { params: { date } })
  return data
}

export async function createBooking(payload) {
  const { data } = await client.post('/bookings/', payload)
  return data
}

export async function getMyBookings() {
  const { data } = await client.get('/bookings/my/')
  return data
}

export async function cancelBooking(id) {
  const { data } = await client.patch(`/bookings/${id}/cancel/`)
  return data
}
