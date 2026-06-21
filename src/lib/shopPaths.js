/** Canonical public shop URLs — portal catalogue/cart redirect here */

export const shopPaths = {
  catalogue: '/shop',
  product: (id) => `/shop/product/${id}`,
  cart: '/shop/cart',
  order: (id) => `/private-portal/order/${id}`,
  orders: '/private-portal/orders',
  login: '/private-portal/login',
  register: '/private-portal/register',
}
