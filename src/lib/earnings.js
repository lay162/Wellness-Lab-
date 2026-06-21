const PAID_PAYMENT = new Set(['paid', 'completed'])
const EARNED_ORDER = new Set(['payment_received', 'completed', 'shipped'])

export function isOrderEarned(order) {
  return PAID_PAYMENT.has(order.payment_status) || EARNED_ORDER.has(order.status)
}

export function isRefundedOrCancelled(order) {
  return order.payment_status === 'cancelled' || order.status === 'cancelled' || order.status === 'rejected'
}

export function orderAmount(order) {
  return Number(order.total_amount) || 0
}

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

/** Monday-start week (UK) */
export function getWeekRange(anchor = new Date()) {
  const d = new Date(anchor)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const start = startOfDay(d)
  start.setDate(d.getDate() + diff)
  const end = endOfDay(start)
  end.setDate(start.getDate() + 6)
  return { start, end }
}

export function getMonthRange(anchor = new Date()) {
  const start = startOfDay(new Date(anchor.getFullYear(), anchor.getMonth(), 1))
  const end = endOfDay(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0))
  return { start, end }
}

export function getYearRange(anchor = new Date()) {
  const start = startOfDay(new Date(anchor.getFullYear(), 0, 1))
  const end = endOfDay(new Date(anchor.getFullYear(), 11, 31))
  return { start, end }
}

export function getPeriodRange(type, anchor, customFrom, customTo) {
  if (type === 'custom' && customFrom && customTo) {
    return { start: startOfDay(new Date(customFrom)), end: endOfDay(new Date(customTo)) }
  }
  if (type === 'week') return getWeekRange(anchor)
  if (type === 'year') return getYearRange(anchor)
  return getMonthRange(anchor)
}

export function formatPeriodLabel(type, anchor, customFrom, customTo) {
  if (type === 'custom' && customFrom && customTo) {
    const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${fmt.format(new Date(customFrom))} – ${fmt.format(new Date(customTo))}`
  }
  if (type === 'week') {
    const { start, end } = getWeekRange(anchor)
    const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
    return `Week: ${fmt.format(start)} – ${fmt.format(end)} ${end.getFullYear()}`
  }
  if (type === 'year') return `Year: ${anchor.getFullYear()}`
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(anchor)
}

export function shiftAnchor(type, anchor, direction) {
  const d = new Date(anchor)
  if (type === 'week') d.setDate(d.getDate() + direction * 7)
  else if (type === 'year') d.setFullYear(d.getFullYear() + direction)
  else d.setMonth(d.getMonth() + direction)
  return d
}

export function filterOrdersInRange(orders, start, end) {
  return orders.filter(o => {
    const t = new Date(o.created_at).getTime()
    return t >= start.getTime() && t <= end.getTime()
  })
}

export function summariseOrders(orders) {
  let earned = 0
  let outstanding = 0
  let refunded = 0
  let earnedCount = 0
  let outstandingCount = 0

  for (const o of orders) {
    const amt = orderAmount(o)
    if (isRefundedOrCancelled(o)) {
      refunded += amt
    } else if (isOrderEarned(o)) {
      earned += amt
      earnedCount += 1
    } else if (o.payment_status === 'awaiting_payment' || o.payment_status === 'pending' || o.payment_status === 'cash_due_on_delivery') {
      outstanding += amt
      outstandingCount += 1
    }
  }

  return {
    earned,
    outstanding,
    refunded,
    earnedCount,
    outstandingCount,
    orderCount: orders.length,
    averageOrder: earnedCount ? earned / earnedCount : 0,
  }
}

export function filterOrdersBySearch(orders, query) {
  if (!query.trim()) return orders
  const q = query.toLowerCase()
  return orders.filter(o =>
    o.profiles?.full_name?.toLowerCase().includes(q)
    || o.profiles?.email?.toLowerCase().includes(q)
    || o.id?.toLowerCase().includes(q)
  )
}

export function filterOrdersByPaymentStatus(orders, status) {
  if (!status || status === 'all') return orders
  if (status === 'earned') return orders.filter(isOrderEarned)
  if (status === 'outstanding') {
    return orders.filter(o =>
      !isOrderEarned(o) && !isRefundedOrCancelled(o)
      && ['pending', 'awaiting_payment', 'cash_due_on_delivery'].includes(o.payment_status)
    )
  }
  if (status === 'refunded') return orders.filter(isRefundedOrCancelled)
  return orders.filter(o => o.payment_status === status)
}
