import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Search, Banknote, Clock, RotateCcw,
  CheckCircle2, FileText,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input, { Select, Textarea } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { PageLoader } from '../../components/ui/Skeleton'
import {
  formatCurrency, formatDate, formatDateTime,
  ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS,
} from '../../lib/utils'
import {
  getPeriodRange, formatPeriodLabel, shiftAnchor,
  filterOrdersInRange, summariseOrders,
  filterOrdersBySearch, filterOrdersByPaymentStatus,
} from '../../lib/earnings'
import toast from 'react-hot-toast'

const PERIOD_TABS = [
  { id: 'week', label: 'Weekly' },
  { id: 'month', label: 'Monthly' },
  { id: 'year', label: 'Annual' },
  { id: 'custom', label: 'Custom' },
]

function SummaryCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <Card className={`p-5 ${accent ? 'bg-gradient-to-br from-primary/5 to-accent/30 border-primary/15' : ''}`}>
      <Icon className={`w-6 h-6 mb-2 ${accent ? 'text-primary' : 'text-text-muted'}`} />
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </Card>
  )
}

export default function AdminEarnings() {
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [periodType, setPeriodType] = useState('month')
  const [anchorDate, setAnchorDate] = useState(new Date())
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState(() => searchParams.get('filter') || 'all')
  const [selected, setSelected] = useState(null)
  const [items, setItems] = useState([])
  const [adminNote, setAdminNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    supabase.from('orders').select('*, profiles(full_name, email)').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message)
        setOrders(data || [])
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  const range = getPeriodRange(periodType, anchorDate, customFrom, customTo)
  const periodLabel = formatPeriodLabel(periodType, anchorDate, customFrom, customTo)

  const statementOrders = useMemo(() => {
    let list = filterOrdersInRange(orders, range.start, range.end)
    list = filterOrdersByPaymentStatus(list, paymentFilter)
    list = filterOrdersBySearch(list, search)
    return list
  }, [orders, range, paymentFilter, search])

  const summary = useMemo(() => summariseOrders(
    filterOrdersInRange(orders, range.start, range.end)
  ), [orders, range])

  const openOrder = async (order) => {
    setSelected(order)
    setAdminNote(order.admin_notes || '')
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id)
    setItems(data || [])
  }

  const patchOrder = async (patch, message) => {
    if (!selected) return
    setSaving(true)
    const payload = { ...patch }
    if (adminNote !== (selected.admin_notes || '')) payload.admin_notes = adminNote
    const { error } = await supabase.from('orders').update(payload).eq('id', selected.id)
    if (error) toast.error(error.message)
    else {
      toast.success(message)
      setSelected(null)
      load()
    }
    setSaving(false)
  }

  const markPaid = (method = 'cash_on_collection') => {
    patchOrder({
      payment_status: 'paid',
      status: selected.status === 'requested' ? 'payment_received' : selected.status,
      payment_method: method,
    }, 'Marked as paid')
  }

  const processRefund = () => {
    const note = adminNote.trim()
      ? `${adminNote.trim()}\n[Refund ${new Date().toLocaleDateString('en-GB')}]`
      : `[Refund processed ${new Date().toLocaleDateString('en-GB')}]`
    patchOrder({
      payment_status: 'cancelled',
      status: 'cancelled',
      admin_notes: note,
    }, 'Refund recorded — no card processing; cash/bank handled manually')
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Earnings & statements</h1>
        <p className="text-sm text-text-muted mt-1">
          Cash & manual payments — mark paid, track outstanding, and record refunds. No card processing in the app.
        </p>
      </div>

      {/* Period selector */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {PERIOD_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPeriodType(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                periodType === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-50 text-text-muted hover:bg-gray-100 hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {periodType === 'custom' ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="From" type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
            <Input label="To" type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" size="sm" onClick={() => setAnchorDate(shiftAnchor(periodType, anchorDate, -1))}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <p className="text-sm font-semibold text-text text-center">{periodLabel}</p>
            <Button variant="ghost" size="sm" onClick={() => setAnchorDate(shiftAnchor(periodType, anchorDate, 1))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </Card>

      {/* Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          icon={Banknote}
          label="Earned this period"
          value={formatCurrency(summary.earned)}
          sub={`${summary.earnedCount} paid order${summary.earnedCount === 1 ? '' : 's'}`}
          accent
        />
        <SummaryCard
          icon={Clock}
          label="Outstanding"
          value={formatCurrency(summary.outstanding)}
          sub={`${summary.outstandingCount} awaiting payment`}
        />
        <SummaryCard
          icon={RotateCcw}
          label="Refunded / cancelled"
          value={formatCurrency(summary.refunded)}
          sub="Manual refunds recorded"
        />
        <SummaryCard
          icon={FileText}
          label="Orders in period"
          value={summary.orderCount}
          sub={summary.earnedCount ? `Avg ${formatCurrency(summary.averageOrder)} paid` : 'No paid orders'}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search customer name, email, or order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>
        <div className="lg:w-56 shrink-0">
          <Select label="Payment filter" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
          <option value="all">All payments</option>
          <option value="earned">Paid / earned</option>
          <option value="outstanding">Outstanding</option>
          <option value="refunded">Refunded / cancelled</option>
          <option value="paid">Paid only</option>
          <option value="awaiting_payment">Awaiting payment</option>
          <option value="pending">Pending</option>
          <option value="cash_due_on_delivery">Cash due on delivery</option>
          </Select>
        </div>
      </div>

      {/* Statement */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/80">
          <h2 className="font-semibold text-text">Statement</h2>
          <p className="text-xs text-text-muted mt-0.5">{periodLabel} · {statementOrders.length} line{statementOrders.length === 1 ? '' : 's'}</p>
        </div>

        {statementOrders.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm">No orders match this period or filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-text-muted">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {statementOrders.map(o => (
                  <tr
                    key={o.id}
                    onClick={() => openOrder(o)}
                    className="border-b border-gray-50 hover:bg-accent/30 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap text-text-muted">{formatDate(o.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-text">{o.profiles?.full_name || '—'}</p>
                      <p className="text-xs text-text-muted">{o.profiles?.email}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-text-muted">#{o.id.slice(0, 8)}</td>
                    <td className="px-5 py-3.5 text-text-muted">
                      {o.payment_method ? PAYMENT_METHOD_LABELS[o.payment_method] : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={o.payment_status}>{PAYMENT_STATUS_LABELS[o.payment_status]}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-text">{formatCurrency(o.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50/80 font-semibold text-text">
                  <td colSpan={5} className="px-5 py-4 text-right">Period total (shown rows)</td>
                  <td className="px-5 py-4 text-right">
                    {formatCurrency(statementOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Order / payment actions */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={`Statement line · #${selected?.id?.slice(0, 8)}`}
        footer={<Button variant="outline" onClick={() => setSelected(null)}>Close</Button>}
      >
        {selected && (
          <div className="space-y-5">
            <div className="text-sm space-y-1 text-text-muted">
              <p><span className="text-text font-medium">{selected.profiles?.full_name}</span> · {selected.profiles?.email}</p>
              <p>{formatDateTime(selected.created_at)}</p>
              <p className="text-lg font-bold text-text pt-1">{formatCurrency(selected.total_amount)}</p>
              <div className="flex gap-2 flex-wrap pt-1">
                <Badge status={selected.status}>{ORDER_STATUS_LABELS[selected.status]}</Badge>
                <Badge status={selected.payment_status}>{PAYMENT_STATUS_LABELS[selected.payment_status]}</Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
              {items.map(i => (
                <div key={i.id} className="flex justify-between text-text-muted">
                  <span>{i.product_name} × {i.quantity}</span>
                  <span>{formatCurrency(i.unit_price * i.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Cash & manual actions</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => markPaid('cash_on_collection')} loading={saving}>
                  <CheckCircle2 className="w-4 h-4" /> Mark paid (cash)
                </Button>
                <Button size="sm" variant="secondary" onClick={() => markPaid('bank_transfer')} loading={saving}>
                  Mark paid (bank)
                </Button>
                <Button size="sm" variant="outline" onClick={() => patchOrder({ payment_status: 'awaiting_payment' }, 'Marked awaiting payment')} loading={saving}>
                  Awaiting payment
                </Button>
                <Button size="sm" variant="danger" onClick={processRefund} loading={saving}>
                  <RotateCcw className="w-4 h-4" /> Record refund
                </Button>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Refunds are recorded here only — return cash or bank transfer to the customer yourself. No card processing in this app.
              </p>
            </div>

            <Textarea
              label="Admin notes"
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Payment received in cash, refund issued, etc."
            />
            <Button
              variant="secondary"
              size="sm"
              loading={saving}
              onClick={() => patchOrder({}, 'Notes saved')}
            >
              Save notes only
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
