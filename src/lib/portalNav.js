import { portalShopPaths } from './shopPaths'

const ROOT_PATHS = new Set([
  '/private-portal/dashboard',
  portalShopPaths.catalogue,
  portalShopPaths.cart,
  '/private-portal/orders',
  '/private-portal/profile',
  '/private-portal/settings',
  '/private-portal/private-reviews',
  '/private-portal/private-success-stories',
  '/private-portal/private-aftercare',
  '/private-portal/private-advice',
])

export function isPortalRootPath(pathname) {
  return ROOT_PATHS.has(pathname)
}

export function getPortalBackTarget(pathname) {
  if (pathname.startsWith('/private-portal/shop/product/')) return portalShopPaths.catalogue
  if (pathname.startsWith('/private-portal/order/')) return '/private-portal/orders'
  return '/private-portal/dashboard'
}

export function getPortalPageTitle(pathname) {
  if (pathname === '/private-portal/dashboard') return 'Dashboard'
  if (pathname === portalShopPaths.catalogue) return 'Shop'
  if (pathname.startsWith('/private-portal/shop/product/')) return 'Product'
  if (pathname === portalShopPaths.cart) return 'Cart'
  if (pathname === '/private-portal/orders') return 'Orders'
  if (pathname.startsWith('/private-portal/order/')) return 'Order details'
  if (pathname === '/private-portal/profile') return 'Profile'
  if (pathname === '/private-portal/settings') return 'Settings'
  if (pathname === '/private-portal/private-reviews') return 'Reviews'
  if (pathname === '/private-portal/private-success-stories') return 'Success Stories'
  if (pathname === '/private-portal/private-aftercare') return 'Aftercare'
  if (pathname === '/private-portal/private-advice') return 'Wellness Advice'
  return 'Wellness Lab'
}
