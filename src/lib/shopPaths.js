/** Public website shop — full site header/footer */
export const publicShopPaths = {
  catalogue: '/shop',
  product: (id) => `/shop/product/${id}`,
  cart: '/shop/cart',
}

/** Customer portal / PWA shop — stays inside portal shell */
export const portalShopPaths = {
  catalogue: '/private-portal/shop',
  product: (id) => `/private-portal/shop/product/${id}`,
  cart: '/private-portal/shop/cart',
}

/** Account & orders (always portal) */
export const accountPaths = {
  order: (id) => `/private-portal/order/${id}`,
  orders: '/private-portal/orders',
  profile: '/private-portal/profile',
  login: '/private-portal/login',
  register: '/private-portal/register',
}

/** Pick shop URLs based on context (portal shell vs public site). */
export function shopPathsForPortal(portal) {
  return { ...(portal ? portalShopPaths : publicShopPaths), ...accountPaths }
}

/** Public site + account paths (legacy import). */
export const shopPaths = { ...publicShopPaths, ...accountPaths }
