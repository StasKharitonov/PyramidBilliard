import client from './client'

export async function getCategories() {
  const { data } = await client.get('/food/categories/')
  return data
}

export async function getItems(category) {
  const { data } = await client.get('/food/items/', {
    params: category ? { category } : {},
  })
  return data
}

export async function createOrder(items) {
  // items: [{ food_item: <id>, quantity: <n> }]
  // The backend computes the authoritative total_price — we only send ids/qty.
  const { data } = await client.post('/food/orders/', { items })
  return data
}

export async function getMyOrders() {
  const { data } = await client.get('/food/orders/my/')
  return data
}
