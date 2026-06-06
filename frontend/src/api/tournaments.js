import client from './client'

export async function getTournaments(status) {
  const { data } = await client.get('/tournaments/', {
    params: status ? { status } : {},
  })
  return data
}

export async function getTournament(id) {
  const { data } = await client.get(`/tournaments/${id}/`)
  return data
}

export async function registerTournament(id) {
  const { data } = await client.post(`/tournaments/${id}/register/`)
  return data
}

export async function unregisterTournament(id) {
  const { data } = await client.delete(`/tournaments/${id}/unregister/`)
  return data
}
