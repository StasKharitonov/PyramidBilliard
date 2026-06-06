import client, { tokenStore } from './client'

export async function registerApi(payload) {
  const { data } = await client.post('/auth/register/', payload)
  return data
}

export async function loginApi(email, password) {
  const { data } = await client.post('/auth/login/', { email, password })
  tokenStore.set(data.access, data.refresh)
  return data
}

export async function getProfile() {
  const { data } = await client.get('/auth/profile/')
  return data
}
