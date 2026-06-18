export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
}

export function formatProductPrice(product) {
  if (product?.price_on_enquiry || !product?.price) return 'Price on enquiry'
  return formatCurrency(product.price)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

export function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
}

export const ORDER_STATUS_LABELS = {
  requested: 'Requested',
  awaiting_payment: 'Awaiting Payment',
  payment_received: 'Payment Received',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
}

export const PAYMENT_STATUS_LABELS = {
  pending: 'Pending',
  awaiting_payment: 'Awaiting Payment',
  paid: 'Paid',
  cash_due_on_delivery: 'Cash Due on Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const PAYMENT_METHOD_LABELS = {
  bank_transfer: 'Bank Transfer',
  cash_on_collection: 'Cash on Collection',
  cash_on_delivery: 'Cash on Delivery',
  sumup_link: 'SumUp Payment Link',
  manual: 'Manual Payment',
}

export const USER_STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
}

export function getStatusColor(status) {
  const colors = {
    requested: 'bg-blue-100 text-blue-800',
    awaiting_payment: 'bg-amber-100 text-amber-800',
    payment_received: 'bg-emerald-100 text-emerald-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    paid: 'bg-emerald-100 text-emerald-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
