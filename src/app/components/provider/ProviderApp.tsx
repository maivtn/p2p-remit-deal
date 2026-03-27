import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, LayoutGrid, Bell, User, Plus, Star, BadgeCheck, Clock,
  ChevronRight, ChevronLeft, X, TrendingUp, ArrowLeftRight,
  Pause, Play, Trash2, Wallet, History, Settings, LogOut,
  ArrowRight, CheckCheck, XCircle, Inbox, CheckCircle2,
  UserRound, Phone, Building2, CreditCard, MapPin, Edit2, Copy, Check,
} from 'lucide-react';
import {
  CURRENCIES, getCurrency, formatVND, formatAmount, timeAgo,
  getAvatarBg, getInitials,
  PAYMENT_METHODS_BY_CURRENCY, getPaymentMethod,
  type Deal, type DealRequest, type ProofData,
  type ProviderAccount, PROVIDER_ACCOUNTS_INIT,
} from '../../data/mockData';
import { ProofModal, ProofCard, EscrowBanner, StepProgress } from '../shared/ProofModal';

function fmt(amount: number, code: string) {
  if (code === 'VND') return formatVND(amount);
  return formatAmount(amount, code);
}
function fmtRate(rate: number, fromCode: string, toCode: string) {
  if (toCode === 'VND') return `${formatVND(rate)}/${fromCode}`;
  return `${fmt(rate, toCode)}/${fromCode}`;
}

type Tab = 'home' | 'deals' | 'requests' | 'profile';
type DealFilter = 'all' | 'active' | 'paused' | 'expired';
const PRIMARY = '#2563EB';



const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: getAvatarBg(name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <span style={{ color: 'white', fontSize: size * 0.38, fontWeight: 600 }}>{getInitials(name)}</span>
  </div>
);

const Stars = ({ rating }: { rating: number }) => (
  <span style={{ color: '#F59E0B', fontSize: 13 }}>
    {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    <span style={{ color: '#6B7280', marginLeft: 3 }}>{rating.toFixed(1)}</span>
  </span>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    active:      { label: 'Hoạt động',  bg: '#D1FAE5', color: '#065F46' },
    paused:      { label: 'Tạm dừng',   bg: '#FEF3C7', color: '#92400E' },
    expired:     { label: 'Hết hạn',    bg: '#F3F4F6', color: '#4B5563' },
    pending:     { label: 'Chờ duyệt',  bg: '#FEF3C7', color: '#92400E' },
    accepted:    { label: 'Đã nhận',    bg: '#DBEAFE', color: '#1E40AF' },
    in_progress: { label: 'Đang xử lý', bg: '#EDE9FE', color: '#5B21B6' },
    completed:   { label: 'Hoàn thành', bg: '#D1FAE5', color: '#065F46' },
    rejected:    { label: 'Từ chối',    bg: '#FEE2E2', color: '#991B1B' },
    cancelled:   { label: 'Đã hủy',     bg: '#F3F4F6', color: '#4B5563' },
  };
  const s = map[status] || { label: status, bg: '#F3F4F6', color: '#4B5563' };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
};

// ── Payment method multi-select picker ───────────────────────
function PaymentMethodPicker({ currency, selected, onToggle, label }: {
  currency: string; selected: string[]; onToggle: (id: string) => void; label: string;
}) {
  const methods = PAYMENT_METHODS_BY_CURRENCY[currency] ?? [];
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{label}</p>
      {methods.length === 0
        ? <p style={{ fontSize: 12, color: '#9CA3AF' }}>Không có hình thức nào cho {currency}</p>
        : (
          <div className="flex flex-wrap gap-2">
            {methods.map(m => (
              <button key={m.id} onClick={() => onToggle(m.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all"
                style={{ background: selected.includes(m.id) ? '#EFF6FF' : '#F9FAFB', border: `2px solid ${selected.includes(m.id) ? PRIMARY : '#E5E7EB'}`, cursor: 'pointer' }}>
                <span style={{ fontSize: 15 }}>{m.icon}</span>
                <span style={{ fontSize: 12, fontWeight: selected.includes(m.id) ? 700 : 400, color: selected.includes(m.id) ? PRIMARY : '#374151' }}>{m.name}</span>
              </button>
            ))}
          </div>
        )}
    </div>
  );
}

// ── Method badge (display) ────────────────────────────────────
function MethodBadge({ currency, methodId, highlight }: { currency: string; methodId: string; highlight?: boolean }) {
  const m = getPaymentMethod(currency, methodId);
  if (!m) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg"
      style={{ background: highlight ? '#ECFDF5' : '#F3F4F6', border: `1px solid ${highlight ? '#6EE7B7' : '#E5E7EB'}` }}>
      <span style={{ fontSize: 13 }}>{m.icon}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: highlight ? '#065F46' : '#374151' }}>{m.name}</span>
    </span>
  );
}

// ============================================================
// Create Deal Modal
// ============================================================
const TRANSFER_TIMES = ['30-60 phút', '1-2 giờ', '2-4 giờ', 'Trong ngày', 'Trong 24 giờ'];
const SUGGESTED_RATES: Record<string, string> = {
  USD: '25500', EUR: '27900', GBP: '32200', JPY: '172', KRW: '19', AUD: '16900', SGD: '19100', THB: '730', CNY: '3520',
};

function CreateDealModal({ onClose, onSave }: { onClose: () => void; onSave: (deal: Deal) => void }) {
  const [form, setForm] = useState({
    fromCurrency: 'USD', toCurrency: 'VND',
    rate: '', minAmount: '', maxAmount: '',
    transferTime: '1-2 giờ', notes: '', validDays: '14',
    senderPaymentMethods: ['zelle', 'paypal'] as string[],
    recipientPaymentMethods: ['momo', 'bank_transfer'] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleSender = (id: string) => setForm(f => ({
    ...f, senderPaymentMethods: f.senderPaymentMethods.includes(id)
      ? f.senderPaymentMethods.filter(x => x !== id) : [...f.senderPaymentMethods, id],
  }));
  const toggleRecipient = (id: string) => setForm(f => ({
    ...f, recipientPaymentMethods: f.recipientPaymentMethods.includes(id)
      ? f.recipientPaymentMethods.filter(x => x !== id) : [...f.recipientPaymentMethods, id],
  }));
  const changeFrom = (code: string) => {
    const methods = PAYMENT_METHODS_BY_CURRENCY[code] ?? [];
    setForm(f => ({ ...f, fromCurrency: code, senderPaymentMethods: methods.slice(0, 2).map(m => m.id) }));
  };
  const changeTo = (code: string) => {
    const methods = PAYMENT_METHODS_BY_CURRENCY[code] ?? [];
    setForm(f => ({ ...f, toCurrency: code, recipientPaymentMethods: methods.slice(0, 2).map(m => m.id) }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.rate || isNaN(Number(form.rate))) e.rate = 'Nhập tỷ giá hợp lệ';
    if (!form.minAmount || isNaN(Number(form.minAmount))) e.minAmount = 'Nhập số tiền tối thiểu';
    if (!form.maxAmount || isNaN(Number(form.maxAmount))) e.maxAmount = 'Nhập số tiền tối đa';
    if (Number(form.minAmount) >= Number(form.maxAmount)) e.maxAmount = 'Tối đa phải lớn hơn tối thiểu';
    if (form.senderPaymentMethods.length === 0) e.sender = 'Chọn ít nhất 1 hình thức';
    if (form.recipientPaymentMethods.length === 0) e.recipient = 'Chọn ít nhất 1 hình thức';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const expiry = new Date('2026-02-26');
    expiry.setDate(expiry.getDate() + Number(form.validDays));
    onSave({
      id: 'd_' + Date.now(), providerId: 'self', providerName: 'Nguyễn Văn B',
      providerRating: 4.9, providerReviews: 248, providerVerified: true,
      fromCurrency: form.fromCurrency, toCurrency: form.toCurrency,
      rate: Number(form.rate), minAmount: Number(form.minAmount), maxAmount: Number(form.maxAmount),
      status: 'active', requestCount: 0, completedDeals: 248,
      expiresAt: expiry.toISOString(), notes: form.notes, transferTime: form.transferTime,
      senderPaymentMethods: form.senderPaymentMethods,
      recipientPaymentMethods: form.recipientPaymentMethods,
    });
  };

  const fc = getCurrency(form.fromCurrency);
  const tc = getCurrency(form.toCurrency);
  const fromCurrs = CURRENCIES.filter(c => c.code !== 'VND');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        className="w-full max-w-[430px] bg-white rounded-t-3xl overflow-hidden" style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Tạo Deal Mới</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X size={16} color="#6B7280" /></button>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-5" style={{ maxHeight: 'calc(92vh - 130px)' }}>

          {/* Currency pair */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Cặp tiền tệ</label>
            <div className="flex items-center gap-3">
              <select value={form.fromCurrency} onChange={e => changeFrom(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-3 bg-gray-50" style={{ fontSize: 14 }}>
                {fromCurrs.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>)}
              </select>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <ArrowRight size={14} color={PRIMARY} />
              </div>
              <select value={form.toCurrency} onChange={e => changeTo(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-3 bg-gray-50" style={{ fontSize: 14 }}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
              </select>
            </div>
          </div>

          {/* Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                Tỷ giá (1 {form.fromCurrency} = ? {form.toCurrency})
              </label>
              <button type="button"
                onClick={() => { const val = SUGGESTED_RATES[form.fromCurrency]; if (val) setForm(f => ({ ...f, rate: val })); }}
                style={{ fontSize: 11, color: PRIMARY, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 6, padding: '3px 9px', cursor: 'pointer', fontWeight: 600 }}>
                ⚡ Tỷ giá thị trường
              </button>
            </div>
            <input type="number" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))}
              placeholder="Ví dụ: 25500" className="w-full border rounded-xl px-4 py-3 bg-gray-50"
              style={{ borderColor: errors.rate ? '#EF4444' : '#E5E7EB', fontSize: 16 }} />
            {errors.rate && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.rate}</p>}
          </div>

          {/* Min/Max */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Tối thiểu ({fc?.symbol})</label>
              <input type="number" value={form.minAmount} onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))}
                placeholder="100" className="w-full border rounded-xl px-4 py-3 bg-gray-50"
                style={{ borderColor: errors.minAmount ? '#EF4444' : '#E5E7EB', fontSize: 15 }} />
              {errors.minAmount && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.minAmount}</p>}
            </div>
            <div className="flex-1">
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Tối đa ({fc?.symbol})</label>
              <input type="number" value={form.maxAmount} onChange={e => setForm(f => ({ ...f, maxAmount: e.target.value }))}
                placeholder="5000" className="w-full border rounded-xl px-4 py-3 bg-gray-50"
                style={{ borderColor: errors.maxAmount ? '#EF4444' : '#E5E7EB', fontSize: 15 }} />
              {errors.maxAmount && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.maxAmount}</p>}
            </div>
          </div>

          {/* Sender payment methods */}
          <div className="rounded-2xl p-4" style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF', marginBottom: 10 }}>
              💳 Người gửi {fc?.flag} thanh toán cho tôi qua
            </p>
            <PaymentMethodPicker currency={form.fromCurrency} selected={form.senderPaymentMethods} onToggle={toggleSender} label="" />
            {errors.sender && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 6 }}>{errors.sender}</p>}
          </div>

          {/* Recipient payment methods */}
          <div className="rounded-2xl p-4" style={{ background: '#ECFDF5', border: '1.5px solid #6EE7B7' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#065F46', marginBottom: 10 }}>
              📤 Tôi gửi tiền {tc?.flag} cho người nhận qua
            </p>
            <PaymentMethodPicker currency={form.toCurrency} selected={form.recipientPaymentMethods} onToggle={toggleRecipient} label="" />
            {errors.recipient && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 6 }}>{errors.recipient}</p>}
          </div>

          {/* Transfer time */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Thời gian chuyển</label>
            <div className="flex flex-wrap gap-2">
              {TRANSFER_TIMES.map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, transferTime: t }))}
                  style={{ background: form.transferTime === t ? PRIMARY : '#F3F4F6', color: form.transferTime === t ? 'white' : '#374151', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Valid days */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Hiệu lực</label>
            <div className="flex gap-2">
              {['7', '14', '30'].map(d => (
                <button key={d} onClick={() => setForm(f => ({ ...f, validDays: d }))} className="flex-1 py-2 rounded-xl"
                  style={{ background: form.validDays === d ? PRIMARY : '#F3F4F6', color: form.validDays === d ? 'white' : '#374151', border: 'none', fontSize: 14, cursor: 'pointer' }}>
                  {d} ngày
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Ghi chú</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Điều kiện, lưu ý thêm..." rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 resize-none" style={{ fontSize: 14 }} />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100">
          <button onClick={handleSave} className="w-full py-4 rounded-2xl text-white"
            style={{ background: `linear-gradient(135deg, ${PRIMARY}, #1D4ED8)`, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Đăng Deal
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Home Tab
// ============================================================
function HomeTab({ deals, requests, onTabChange }: { deals: Deal[]; requests: DealRequest[]; onTabChange: (t: Tab) => void }) {
  const activeDeals = deals.filter(d => d.status === 'active').length;
  const pendingReqs = requests.filter(r => r.status === 'pending').length;
  const recentReqs = requests.filter(r => r.status === 'pending').slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto">
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY}, #1D4ED8)` }} className="px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-20 w-24 h-24 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Xin chào 👋</p>
              <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, marginTop: 2 }}>Nguyễn Văn B</h1>
            </div>
            <div className="relative">
              <Avatar name="Nguyễn Văn B" size={46} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white" />
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Thu nhập hôm nay</p>
            <p style={{ color: 'white', fontSize: 28, fontWeight: 800, marginTop: 4 }}>₫15,250,000</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={13} color="#86EFAC" />
              <span style={{ color: '#86EFAC', fontSize: 12 }}>+12% so với hôm qua</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Deals đang mở', value: String(activeDeals), icon: '📋', color: '#EFF6FF', text: PRIMARY },
            { label: 'Hoàn thành', value: '248', icon: '✅', color: '#F0FDF4', text: '#059669' },
            { label: 'Đánh giá', value: '4.9★', icon: '⭐', color: '#FFFBEB', text: '#D97706' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: s.color }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.text, marginTop: 2 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '➕', label: 'Tạo Deal', color: '#EFF6FF', text: PRIMARY, tab: 'deals' as Tab },
            { icon: '📋', label: 'Deals', color: '#F0FDF4', text: '#059669', tab: 'deals' as Tab },
            { icon: '🔔', label: 'Yêu cầu', color: '#FFFBEB', text: '#D97706', tab: 'requests' as Tab },
          ].map(item => (
            <button key={item.label} onClick={() => onTabChange(item.tab)}
              className="rounded-2xl p-3 flex flex-col items-center gap-1 active:scale-95 transition-transform relative"
              style={{ background: item.color, border: 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <span style={{ fontSize: 11, color: item.text, fontWeight: 600 }}>{item.label}</span>
              {item.label === 'Yêu c��u' && pendingReqs > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center" style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>{pendingReqs}</span>
              )}
            </button>
          ))}
        </div>

        {recentReqs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Yêu cầu mới nhất</h3>
              <button onClick={() => onTabChange('requests')} style={{ color: PRIMARY, fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Xem tất cả</button>
            </div>
            <div className="space-y-3">
              {recentReqs.map(req => {
                const senderMethod = getPaymentMethod(req.fromCurrency, req.senderPaymentMethod);
                const recipientMethod = getPaymentMethod(req.toCurrency, req.recipientPaymentMethod);
                return (
                  <div key={req.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
                    <Avatar name={req.requesterName} size={40} />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{req.requesterName}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>
                        {fmt(req.amount, req.fromCurrency)} → {fmt(req.receiveAmount, req.toCurrency)}
                      </div>
                      {senderMethod && recipientMethod && (
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                          {senderMethod.icon}{senderMethod.name} → {recipientMethod.icon}{recipientMethod.name}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <StatusBadge status={req.status} />
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{timeAgo(req.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {recentReqs.length === 0 && (
          <div className="flex flex-col items-center py-8 text-center">
            <Inbox size={40} color="#D1D5DB" />
            <p style={{ color: '#9CA3AF', marginTop: 8, fontSize: 14 }}>Chưa có yêu cầu mới</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Deals Tab
// ============================================================
function DealsTab({ deals, onDealsChange }: { deals: Deal[]; onDealsChange: (d: Deal[]) => void }) {
  const [filter, setFilter] = useState<DealFilter>('all');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = deals.filter(d => filter === 'all' || d.status === filter);
  const counts = { all: deals.length, active: deals.filter(d => d.status === 'active').length, paused: deals.filter(d => d.status === 'paused').length, expired: deals.filter(d => d.status === 'expired').length };

  const togglePause = (id: string) => onDealsChange(deals.map(d => d.id === id ? { ...d, status: d.status === 'active' ? 'paused' : 'active' } : d));
  const deleteDeal = (id: string) => onDealsChange(deals.filter(d => d.id !== id));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 pt-12 pb-4" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #1D4ED8)` }}>
        <div className="flex items-center justify-between">
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>Deals của tôi</h1>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20" style={{ color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            <Plus size={16} /> Tạo mới
          </button>
        </div>
      </div>

      <div className="flex gap-2 px-5 py-3 border-b border-gray-100 overflow-x-auto">
        {(['all', 'active', 'paused', 'expired'] as DealFilter[]).map(f => {
          const labels: Record<DealFilter, string> = { all: 'Tất cả', active: 'Hoạt động', paused: 'Tạm dừng', expired: 'Hết hạn' };
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter === f ? PRIMARY : '#F3F4F6', color: filter === f ? 'white' : '#6B7280', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {labels[f]} ({counts[f]})
            </button>
          );
        })}
      </div>

      <div className="px-4 py-4 space-y-3">
        {filtered.map(deal => {
          const from = getCurrency(deal.fromCurrency);
          const to = getCurrency(deal.toCurrency);
          return (
            <div key={deal.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 22 }}>{from?.flag}</span>
                  <ArrowRight size={14} color="#9CA3AF" />
                  <span style={{ fontSize: 22 }}>{to?.flag}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{deal.fromCurrency} → {deal.toCurrency}</span>
                </div>
                <StatusBadge status={deal.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-xl p-2">
                  <p style={{ fontSize: 10, color: '#9CA3AF' }}>Tỷ giá</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{fmtRate(deal.rate, deal.fromCurrency, deal.toCurrency)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2">
                  <p style={{ fontSize: 10, color: '#9CA3AF' }}>Giới hạn</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                    {fmt(deal.minAmount, deal.fromCurrency)} – {fmt(deal.maxAmount, deal.fromCurrency)}
                  </p>
                </div>
              </div>

              {/* Payment methods */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-1 flex-wrap">
                  <span style={{ fontSize: 10, color: '#9CA3AF' }}>Nhận:</span>
                  {deal.senderPaymentMethods.map(id => <MethodBadge key={id} currency={deal.fromCurrency} methodId={id} />)}
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span style={{ fontSize: 10, color: '#9CA3AF' }}>Gửi:</span>
                  {deal.recipientPaymentMethods.map(id => <MethodBadge key={id} currency={deal.toCurrency} methodId={id} />)}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  <Clock size={12} color="#9CA3AF" />
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{deal.transferTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bell size={12} color="#9CA3AF" />
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{deal.requestCount} yêu cầu</span>
                </div>
              </div>

              {deal.status !== 'expired' && (
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button onClick={() => togglePause(deal.id)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl" style={{ background: '#F3F4F6', border: 'none', cursor: 'pointer' }}>
                    {deal.status === 'active' ? <Pause size={14} color="#6B7280" /> : <Play size={14} color="#059669" />}
                    <span style={{ fontSize: 13, color: deal.status === 'active' ? '#6B7280' : '#059669', fontWeight: 600 }}>
                      {deal.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                    </span>
                  </button>
                  <button onClick={() => deleteDeal(deal.id)} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FEE2E2', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={15} color="#EF4444" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <LayoutGrid size={44} color="#E5E7EB" />
            <p style={{ color: '#9CA3AF', marginTop: 10, fontSize: 15 }}>Không có deal nào</p>
            <button onClick={() => setShowCreate(true)} className="mt-4 px-6 py-3 rounded-xl text-white" style={{ background: PRIMARY, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Tạo Deal Ngay</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateDealModal onClose={() => setShowCreate(false)} onSave={d => { onDealsChange([d, ...deals]); setShowCreate(false); }} />}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Requests Tab — Full Escrow Flow
// ============================================================
type ProvReqFilter = 'pending' | 'active' | 'completed' | 'other';

const TX_STATUS_CFG: Record<string, { label: string; bg: string; color: string }> = {
  pending:           { label: 'Chờ duyệt',       bg: '#FEF3C7', color: '#92400E' },
  accepted:          { label: 'Chờ thanh toán',   bg: '#DBEAFE', color: '#1E40AF' },
  payment_sent:      { label: 'Chờ xác nhận',     bg: '#EDE9FE', color: '#5B21B6' },
  payment_confirmed: { label: 'Đang chuyển tiền', bg: '#FEF3C7', color: '#B45309' },
  transfer_sent:     { label: 'Chờ hoàn tất',     bg: '#D1FAE5', color: '#065F46' },
  completed:         { label: 'Hoàn thành',        bg: '#D1FAE5', color: '#065F46' },
  rejected:          { label: 'Từ chối',           bg: '#FEE2E2', color: '#991B1B' },
  cancelled:         { label: 'Đã hủy',            bg: '#F3F4F6', color: '#4B5563' },
  disputed:          { label: 'Khiếu nại',         bg: '#FFF7ED', color: '#9A3412' },
};
function TxBadge({ status }: { status: string }) {
  const s = TX_STATUS_CFG[status] ?? { label: status, bg: '#F3F4F6', color: '#4B5563' };
  return <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</span>;
}

function ProviderRequestCard({ req, onUpdate, newRequestIds }: {
  req: DealRequest;
  onUpdate: (partial: Partial<DealRequest>) => void;
  newRequestIds: string[];
}) {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showTransferUpload, setShowTransferUpload] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showRecipient, setShowRecipient] = useState(false);
  const senderMethod = getPaymentMethod(req.fromCurrency, req.senderPaymentMethod);
  const recipientMethod = getPaymentMethod(req.toCurrency, req.recipientPaymentMethod);
  const feeAmt = req.amount * req.systemFeeRate;
  const providerFeeAmt = req.receiveAmount * req.systemFeeRate;
  const isNew = newRequestIds.includes(req.id);
  const canDispute = ['accepted','payment_sent','payment_confirmed','transfer_sent'].includes(req.status);

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
      style={{ border: isNew ? '2px solid #EF4444' : '1px solid #E5E7EB' }}>
      <div className="p-4 pb-3">

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar name={req.requesterName} size={44} />
          <div className="flex-1">
            <div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{req.requesterName}</span>
              <div><Stars rating={req.requesterRating} /></div>
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{timeAgo(req.createdAt)}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isNew && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full animate-pulse" style={{ background: '#EF4444', fontSize: 10, fontWeight: 700, color: 'white' }}>🔔 MỚI</span>}
            <TxBadge status={req.status} />
          </div>
        </div>

        {/* Step progress */}
        {['accepted','payment_sent','payment_confirmed','transfer_sent','completed'].includes(req.status) && (
          <div className="mb-3"><StepProgress status={req.status} /></div>
        )}

        {/* Escrow info */}
        {req.escrowLocked && !['completed','rejected','cancelled'].includes(req.status) && (
          <div className="space-y-2 mb-3">
            {/* EscrowBanner phí từ người gửi – ẩn */}
            {/* <EscrowBanner label={`Platform fee của bạn (${(req.systemFeeRate*100).toFixed(1)}%)`} amount={providerFeeAmt} currency={req.toCurrency} icon="🔒" /> */}
          </div>
        )}

        {/* Amount */}
        <div className="bg-gray-50 rounded-xl p-3 mb-3">
          {/* Country route */}
          {(() => {
            const from = getCurrency(req.fromCurrency);
            const to = getCurrency(req.toCurrency);
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 15 }}>{from?.flag}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{from?.name}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF', margin: '0 2px' }}>→</span>
                <span style={{ fontSize: 15 }}>{to?.flag}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{to?.name}</span>
              </div>
            );
          })()}
          <div className="flex items-center justify-between mb-1">
            <div>
              <p style={{ fontSize: 10, color: '#9CA3AF' }}>Người gửi trả</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{fmt(req.amount, req.fromCurrency)}</p>
              {senderMethod && <MethodBadge currency={req.fromCurrency} methodId={req.senderPaymentMethod} highlight />}
            </div>
            <ArrowRight size={16} color="#9CA3AF" />
            <div className="text-right">
              <p style={{ fontSize: 10, color: '#9CA3AF' }}>Người thụ hưởng nhận</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#059669' }}>{fmt(req.receiveAmount, req.toCurrency)}</p>
              {recipientMethod && <MethodBadge currency={req.toCurrency} methodId={req.recipientPaymentMethod} highlight />}
            </div>
          </div>
          <p style={{ fontSize: 10, color: '#9CA3AF' }}>{fmtRate(req.rate, req.fromCurrency, req.toCurrency)}</p>
        </div>

        {/* Recipient */}
        <div className="rounded-xl mb-3" style={{ background: '#F0FDF4', border: '1.5px solid #6EE7B7', display: req.status === 'pending' ? 'none' : undefined }}>
          <button
            onClick={() => setShowRecipient(v => !v)}
            className="w-full flex items-center justify-between p-3"
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: req.status === 'pending' ? 'none' : 'flex' }}
          >
            <p style={{ fontSize: 10, fontWeight: 700, color: '#065F46', letterSpacing: 0.4, margin: 0 }}>👤 NGƯỜI THỤ HƯỞNG</p>
            <ChevronRight size={14} color="#065F46" style={{ transform: showRecipient ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>
          {showRecipient && (
            <div className="space-y-1.5 px-3 pb-3">
              <div className="flex items-center gap-2"><UserRound size={14} color="#059669" /><span style={{ fontSize: 14, fontWeight: 700 }}>{req.recipientName}</span></div>
              {req.recipientPhone && <div className="flex items-center gap-2"><span style={{ fontSize: 15 }}>{recipientMethod?.icon}</span><span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>{req.recipientPhone}</span><span style={{ fontSize: 11, color: '#6B7280' }}>({recipientMethod?.name})</span></div>}
              {req.recipientBank && <div className="flex items-center gap-2"><Building2 size={13} color="#059669" /><span style={{ fontSize: 13 }}>{req.recipientBank}</span></div>}
              {req.recipientAccount && <div className="flex items-center gap-2"><CreditCard size={13} color="#059669" /><span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>{req.recipientAccount}</span></div>}
              {req.recipientAddress && <div className="flex items-center gap-2"><MapPin size={13} color="#059669" /><span style={{ fontSize: 13 }}>{req.recipientAddress}</span></div>}
            </div>
          )}
        </div>

        {req.message && (
          <details open={req.status !== 'completed'} className="bg-blue-50 rounded-xl mb-3" style={{ listStyle: 'none' }}>
            <summary className="flex items-center justify-between px-3 py-2.5 cursor-pointer" style={{ listStyle: 'none', userSelect: 'none' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#1E40AF', letterSpacing: 0.4, margin: 0 }}>💬 GHI CHÚ</p>
              <span style={{ fontSize: 11, color: '#3B82F6' }}>▾</span>
            </summary>
            <p style={{ fontSize: 13, color: '#1E40AF', padding: '0 12px 12px', margin: 0 }}>"{req.message}"</p>
          </details>
        )}

        {/* ── Status actions ────────��────────────────────── */}

        {req.status === 'pending' && (
          <div className="space-y-2">
            {/* Payment method summary */}
            {(() => {
              const fromC = getCurrency(req.fromCurrency);
              const toC = getCurrency(req.toCurrency);
              return (
                <div className="rounded-xl p-3" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', letterSpacing: 0.4, marginBottom: 10 }}>💳 HÌNH THỨC CHUYỂN TIỀN</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <span style={{ fontSize: 13 }}>{fromC?.flag}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7280' }}>{fromC?.name}</span>
                      </div>
                      <p style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3 }}>Người gửi thanh toán</p>
                      <div className="flex items-center gap-1">
                        <span style={{ fontSize: 15 }}>{senderMethod?.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{senderMethod?.name ?? '—'}</span>
                      </div>
                    </div>
                    <ArrowRight size={15} color="#D1D5DB" />
                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-1 mb-1">
                        <span style={{ fontSize: 13 }}>{toC?.flag}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7280' }}>{toC?.name}</span>
                      </div>
                      <p style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3 }}>Bạn chuyển đến người thụ hưởng</p>
                      <div className="flex items-center justify-end gap-1">
                        <span style={{ fontSize: 15 }}>{recipientMethod?.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{recipientMethod?.name ?? '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            <div className="rounded-xl p-3" style={{ background: '#FFFBEB', border: '1px solid #FCD34D' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#92400E', marginBottom: 8, letterSpacing: 0.4 }}>💰 PHÍ & ESCROW KHI CHẤP NHẬN</p>
              <div className="space-y-1.5">
                {/* Platform fee */}
                <p style={{ fontSize: 10, fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: 0.3 }}>💸 Platform fee — thu ngay, không hoàn trả</p>
                <div className="flex items-center justify-between pl-3">
                  <span style={{ fontSize: 11, color: '#B45309' }}>└ Người gửi (0.5%)</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#D97706' }}>−{fmt(feeAmt, req.fromCurrency)}</span>
                </div>
                <div className="flex items-center justify-between pl-3">
                  <span style={{ fontSize: 11, color: '#B45309' }}>└ Bạn (0.5%)</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#D97706' }}>−{fmt(feeAmt, req.fromCurrency)}</span>
                </div>
                <div className="my-1" style={{ borderTop: '1px dashed #FCD34D' }} />
                {/* Escrow */}
                <p style={{ fontSize: 10, fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: 0.3 }}>🔒 Escrow — tạm giữ trong suốt giao dịch</p>
                <div className="flex items-center justify-between pl-3">
                  <span style={{ fontSize: 11, color: '#1E40AF' }}>└ Người gửi escrow</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF' }}>{fmt(req.amount, req.fromCurrency)}</span>
                </div>
                <div className="flex items-center justify-between pl-3">
                  <span style={{ fontSize: 11, color: '#1E40AF' }}>└ Bạn escrow</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF' }}>{fmt(req.amount, req.fromCurrency)}</span>
                </div>
                <div className="my-1" style={{ borderTop: '1px dashed #FCD34D' }} />
                <p style={{ fontSize: 10, color: '#6B7280', fontStyle: 'italic' }}>🔓 Escrow giải phóng khi giao dịch hoàn tất.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onUpdate({ status: 'rejected' })} className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2" style={{ background: '#FEE2E2', border: 'none', cursor: 'pointer' }}>
                <XCircle size={16} color="#EF4444" /><span style={{ color: '#EF4444', fontSize: 14, fontWeight: 600 }}>Từ chối</span>
              </button>
              <button onClick={() => setShowAcceptModal(true)} className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2" style={{ background: PRIMARY, border: 'none', cursor: 'pointer' }}>
                <CheckCheck size={16} color="white" /><span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>Chấp nhận</span>
              </button>
            </div>
          </div>
        )}

        {req.status === 'accepted' && (
          <div className="flex items-center gap-2 px-3 py-3 rounded-xl" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <span style={{ fontSize: 16 }}>⏳</span>
            <p style={{ fontSize: 13, color: '#1E40AF', fontWeight: 600 }}>Chờ người gửi chuyển tiền qua {senderMethod?.icon} {senderMethod?.name} và upload bằng chứng...</p>
          </div>
        )}

        {req.status === 'payment_sent' && req.paymentProof && (
          <div className="space-y-3">
            <ProofCard proof={req.paymentProof} label="📤 Bằng chứng thanh toán từ người gửi" />
            <button onClick={() => onUpdate({ status: 'payment_confirmed', paymentConfirmedAt: new Date().toISOString() })}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, #1D4ED8)`, border: 'none', cursor: 'pointer' }}>
              <CheckCheck size={16} color="white" />
              <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>✅ Xác nhận đã nhận đủ tiền</span>
            </button>
          </div>
        )}

        {req.status === 'payment_confirmed' && (
          <div className="space-y-3">
            <div className="rounded-xl p-3" style={{ background: '#FEF3C7', border: '1.5px solid #FCD34D' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 6 }}>🔄 Chuyển tiền cho người nhận ngay</p>
              <p style={{ fontSize: 13, color: '#92400E' }}>
                Chuyển <strong>{fmt(req.receiveAmount, req.toCurrency)}</strong> → <strong>{req.recipientName}</strong>
                {req.recipientPhone && ` qua ${recipientMethod?.name}: ${req.recipientPhone}`}
                {req.recipientAccount && ` STK: ${req.recipientAccount}`}
              </p>
            </div>
            <button onClick={() => setShowTransferUpload(true)}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, #059669, #047857)`, border: 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 16 }}>📤</span>
              <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>Đã chuyển — Upload bằng chứng</span>
            </button>
          </div>
        )}

        {req.status === 'transfer_sent' && req.transferProof && (
          <div className="space-y-2">
            <ProofCard proof={req.transferProof} label="📋 Đã gửi bằng chứng chuyển tiền" />
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#ECFDF5' }}>
              <span style={{ fontSize: 16 }}>⏳</span>
              <p style={{ fontSize: 13, color: '#065F46', fontWeight: 600 }}>Chờ người dùng xác nhận người thân đã nhận...</p>
            </div>
          </div>
        )}

        {req.status === 'completed' && (
          <div className="rounded-xl p-3" style={{ background: '#F0FDF4', border: '1.5px solid #6EE7B7' }}>
            <div className="flex items-center gap-2 mb-1"><CheckCircle2 size={16} color="#059669" /><p style={{ fontSize: 14, fontWeight: 700, color: '#065F46' }}>🎉 Hoàn tất!</p></div>
            <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.7 }}>
              - Phí hệ thống ({(req.systemFeeRate * 100).toFixed(1)}%): {fmt(feeAmt, req.fromCurrency)}<br />
              - Escrow đã được giải phóng
            </p>
          </div>
        )}

        {req.status === 'disputed' && (
          <div className="space-y-2">
            <div className="rounded-xl p-3" style={{ background: '#FFF7ED', border: '1.5px solid #FCD34D' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9A3412' }}>⚠️ Khiếu nại bởi: {req.disputedBy === 'provider' ? 'Bạn' : req.requesterName}</p>
              {req.disputeNote && <p style={{ fontSize: 12, color: '#92400E', marginTop: 4, fontStyle: 'italic' }}>"{req.disputeNote}"</p>}
            </div>
            {req.disputeProof && <ProofCard proof={req.disputeProof} label="📎 Bằng chứng khiếu nại" />}
          </div>
        )}

        {canDispute && (
          <div className="mt-3">
            <button onClick={() => setShowDisputeModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: '#FFF7ED', border: '1.5px solid #FCD34D', cursor: 'pointer' }}>
              <span style={{ fontSize: 13 }}>⚠️</span><span style={{ fontSize: 12, fontWeight: 600, color: '#D97706' }}>Khiếu nại giao dịch</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAcceptModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAcceptModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Xác nhận chấp nhận</h3>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Escrow tạm giữ số tiền giao dịch của mỗi bên, platform fee thu ngay:</p>
              <div className="space-y-2 mb-5">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span style={{ fontSize: 13, color: '#374151' }}>Nhận từ người gửi</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{fmt(req.amount, req.fromCurrency)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span style={{ fontSize: 13, color: '#374151' }}>Gửi đến người nhận</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>{fmt(req.receiveAmount, req.toCurrency)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span style={{ fontSize: 13, color: '#374151' }}>Gửi đến người nhận ở</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    {getCurrency(req.toCurrency)?.flag} {({'VND':'Việt Nam','USD':'Mỹ','EUR':'Châu Âu','GBP':'Anh','JPY':'Nhật Bản','KRW':'Hàn Quốc','AUD':'Úc','SGD':'Singapore','THB':'Thái Lan','CNY':'Trung Quốc'} as Record<string,string>)[req.toCurrency] ?? req.toCurrency}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span style={{ fontSize: 13, color: '#1E40AF' }}>🔒 Escrow của bạn (tạm giữ)</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1E40AF' }}>{fmt(req.amount, req.fromCurrency)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span style={{ fontSize: 13, color: '#1E40AF' }}>🔒 Escrow người gửi (tạm giữ)</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1E40AF' }}>{fmt(req.amount, req.fromCurrency)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span style={{ fontSize: 13, color: '#D97706' }}>💸 Platform fee của bạn (thu ngay)</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#D97706' }}>−{fmt(req.amount * req.systemFeeRate, req.fromCurrency)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAcceptModal(false)} className="flex-1 py-3 rounded-xl" style={{ background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#6B7280' }}>Hủy</button>
                <button onClick={() => { onUpdate({ status: 'accepted', systemFeeRate: 0.005, systemFeeAmount: req.amount*0.005, escrowLocked: true }); setShowAcceptModal(false); }}
                  className="flex-1 py-3 rounded-xl"
                  style={{ background: PRIMARY, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'white' }}>
                  ✅ Đồng ý & Chấp nhận
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showTransferUpload && (
          <ProofModal
            title="Xác nhận đã chuyển tiền"
            subtitle={`Upload bằng chứng chuyển ${fmt(req.receiveAmount, req.toCurrency)} cho ${req.recipientName}`}
            allowedTypes={[req.recipientPaymentMethod, 'bank_transfer', 'photo']}
            onConfirm={(proof: ProofData) => { onUpdate({ status: 'transfer_sent', transferProof: proof }); setShowTransferUpload(false); }}
            onClose={() => setShowTransferUpload(false)}
          />
        )}
        {showDisputeModal && (
          <ProofModal
            title="Khiếu nại giao dịch" subtitle="Mô tả vấn đề và đính kèm bằng chứng"
            allowedTypes={['photo','bank_transfer','momo','zalopay','zelle','venmo']}
            isDispute
            onConfirm={(proof: ProofData) => { onUpdate({ status: 'disputed', disputedBy: 'provider', disputeNote: proof.note, disputeProof: proof, disputedAt: new Date().toISOString() }); setShowDisputeModal(false); }}
            onClose={() => setShowDisputeModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RequestsTab({ requests, onRequestsChange, newRequestIds }: {
  requests: DealRequest[];
  onRequestsChange: (r: DealRequest[]) => void;
  newRequestIds: string[];
}) {
  const [filter, setFilter] = useState<ProvReqFilter>('pending');
  const ACTIVE_STATUSES = ['accepted','payment_sent','payment_confirmed','transfer_sent'];
  const filterMap: Record<ProvReqFilter, (r: DealRequest) => boolean> = {
    pending:   r => r.status === 'pending',
    active:    r => ACTIVE_STATUSES.includes(r.status),
    completed: r => r.status === 'completed',
    other:     r => ['rejected','cancelled','disputed'].includes(r.status),
  };
  const filtered = requests.filter(filterMap[filter]);
  const pendingCount = requests.filter(filterMap.pending).length;
  const activeCount = requests.filter(filterMap.active).length;
  const LABELS: Record<ProvReqFilter, string> = {
    pending:   `Chờ duyệt${pendingCount ? ` (${pendingCount})` : ''}`,
    active:    `Đang xử lý${activeCount ? ` (${activeCount})` : ''}`,
    completed: 'Hoàn thành',
    other:     'Từ chối/Khiếu nại',
  };
  const handleUpdate = (id: string, partial: Partial<DealRequest>) =>
    onRequestsChange(requests.map(r => r.id === id ? { ...r, ...partial } : r));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 pt-12 pb-4" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #1D4ED8)` }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>Yêu cầu giao dịch</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>Quản lý & xử lý các yêu cầu chuyển tiền</p>
      </div>
      <div className="flex gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto">
        {(['pending','active','completed','other'] as ProvReqFilter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ background: filter===f ? PRIMARY : '#F3F4F6', color: filter===f ? 'white' : '#6B7280', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {LABELS[f]}
          </button>
        ))}
      </div>
      <div className="px-4 py-4 space-y-3">
        {filtered.map(req => (
          <ProviderRequestCard key={req.id} req={req} onUpdate={p => handleUpdate(req.id, p)} newRequestIds={newRequestIds} />
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12">
            <Inbox size={44} color="#E5E7EB" />
            <p style={{ color: '#9CA3AF', marginTop: 10, fontSize: 15 }}>Không có yêu cầu nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Payment Accounts Modal
// ============================================================
type AccountFormView = 'list' | 'form';

function PaymentAccountsModal({
  accounts, onSave, onClose,
}: {
  accounts: ProviderAccount[];
  onSave: (accounts: ProviderAccount[]) => void;
  onClose: () => void;
}) {
  const [view, setView] = useState<AccountFormView>('list');
  const [editTarget, setEditTarget] = useState<ProviderAccount | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [form, setForm] = useState<Partial<ProviderAccount>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const openAdd = () => {
    setCurrency('USD');
    setForm({ currency: 'USD' });
    setEditTarget(null);
    setView('form');
  };
  const openEdit = (acc: ProviderAccount) => {
    setCurrency(acc.currency);
    setForm({ ...acc });
    setEditTarget(acc);
    setView('form');
  };
  const handleDelete = (id: string) => onSave(accounts.filter(a => a.id !== id));
  const handleSave = () => {
    if (!form.methodId || !form.label) return;
    if (editTarget) {
      onSave(accounts.map(a => a.id === editTarget.id ? { ...a, ...form, currency } as ProviderAccount : a));
    } else {
      onSave([...accounts, { id: `pa${Date.now()}`, methodId: form.methodId!, currency, label: form.label!, phone: form.phone, email: form.email, handle: form.handle, bankName: form.bankName, accountNumber: form.accountNumber, accountName: form.accountName }]);
    }
    setView('list');
  };
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const selectedMethod = form.methodId ? getPaymentMethod(currency, form.methodId) : undefined;
  const grouped: Record<string, ProviderAccount[]> = {};
  accounts.forEach(a => { if (!grouped[a.currency]) grouped[a.currency] = []; grouped[a.currency].push(a); });

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827' };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' };

  return (
    <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-4 bg-white border-b border-gray-100">
        <button onClick={view === 'list' ? onClose : () => setView('list')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          {view === 'list' ? <X size={22} color="#374151" /> : <ChevronLeft size={22} color="#374151" />}
        </button>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', flex: 1, textAlign: 'center', marginRight: 30 }}>
          {view === 'list' ? 'Tài khoản thanh toán' : editTarget ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản'}
        </h2>
      </div>

      {view === 'list' ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {Object.keys(grouped).length === 0 && (
            <div className="flex flex-col items-center py-12">
              <Wallet size={44} color="#E5E7EB" />
              <p style={{ color: '#9CA3AF', marginTop: 10, fontSize: 15 }}>Chưa có tài khoản nào</p>
              <p style={{ color: '#D1D5DB', fontSize: 13, marginTop: 4 }}>Thêm tài khoản để nhận thanh toán</p>
            </div>
          )}
          {Object.entries(grouped).map(([cur, accs]) => {
            const ci = getCurrency(cur);
            return (
              <div key={cur}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8 }}>{ci?.flag} {ci?.name} ({cur})</p>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {accs.map((acc, i) => {
                    const m = getPaymentMethod(cur, acc.methodId);
                    const detail = acc.handle || acc.phone || acc.email || acc.accountNumber || '';
                    const subDetail = acc.bankName ? `${acc.bankName}${acc.accountName ? ` · ${acc.accountName}` : ''}` : '';
                    return (
                      <div key={acc.id} className="px-4 py-3" style={{ borderBottom: i < accs.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EFF6FF', fontSize: 20 }}>{m?.icon || '💳'}</div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{acc.label}</p>
                            {detail && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <p style={{ fontSize: 12, color: '#6B7280', wordBreak: 'break-all' }}>{detail}</p>
                                <button onClick={() => handleCopy(detail, acc.id + 'd')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                                  {copied === acc.id + 'd' ? <Check size={12} color="#059669" /> : <Copy size={12} color="#9CA3AF" />}
                                </button>
                              </div>
                            )}
                            {subDetail && <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{subDetail}</p>}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => openEdit(acc)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex' }}>
                              <Edit2 size={14} color="#6B7280" />
                            </button>
                            <button onClick={() => handleDelete(acc.id)} style={{ background: '#FEE2E2', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex' }}>
                              <Trash2 size={14} color="#EF4444" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <button onClick={openAdd} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
            style={{ background: '#EFF6FF', border: '2px dashed #93C5FD', cursor: 'pointer' }}>
            <Plus size={18} color={PRIMARY} />
            <span style={{ fontSize: 14, fontWeight: 600, color: PRIMARY }}>Thêm tài khoản mới</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Currency */}
          <div>
            <label style={labelStyle}>Loại tiền tệ</label>
            <div className="flex flex-wrap gap-2">
              {(['USD','EUR','GBP','SGD','AUD','JPY','KRW','THB','CNY'] as const).map(c => {
                const ci = getCurrency(c);
                return (
                  <button key={c} onClick={() => { setCurrency(c); setForm(f => ({ ...f, currency: c, methodId: undefined })); }}
                    className="px-3 py-2 rounded-xl"
                    style={{ background: currency === c ? '#EFF6FF' : '#F9FAFB', border: `2px solid ${currency === c ? PRIMARY : '#E5E7EB'}`, cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, fontWeight: currency === c ? 700 : 400, color: currency === c ? PRIMARY : '#374151' }}>{ci?.flag} {c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Method */}
          <div>
            <label style={labelStyle}>Hình thức thanh toán</label>
            <div className="flex flex-wrap gap-2">
              {(PAYMENT_METHODS_BY_CURRENCY[currency] ?? []).filter(m => m.id !== 'cash').map(m => (
                <button key={m.id} onClick={() => setForm(f => ({ ...f, methodId: m.id }))}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                  style={{ background: form.methodId === m.id ? '#EFF6FF' : '#F9FAFB', border: `2px solid ${form.methodId === m.id ? PRIMARY : '#E5E7EB'}`, cursor: 'pointer' }}>
                  <span style={{ fontSize: 15 }}>{m.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: form.methodId === m.id ? 700 : 400, color: form.methodId === m.id ? PRIMARY : '#374151' }}>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <label style={labelStyle}>Tên gợi nhớ</label>
            <input value={form.label || ''} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="Ví dụ: Zelle chính, PayPal cá nhân..." style={inputStyle} />
          </div>

          {/* Dynamic fields */}
          {selectedMethod && (
            <div className="space-y-3 p-4 rounded-2xl" style={{ background: '#F8FAFF', border: '1.5px solid #DBEAFE' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, marginBottom: 4 }}>📋 Thông tin tài khoản</p>

              {selectedMethod.id === 'venmo' && (
                <div>
                  <label style={labelStyle}>Venmo username</label>
                  <input value={form.handle || ''} onChange={e => setForm(f => ({ ...f, handle: e.target.value }))}
                    placeholder="@username" style={inputStyle} />
                </div>
              )}
              {selectedMethod.requiresPhone && selectedMethod.id !== 'venmo' && (
                <div>
                  <label style={labelStyle}>Số điện thoại / Email liên kết</label>
                  <input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+1 (xxx) xxx-xxxx hoặc email" style={inputStyle} />
                </div>
              )}
              {!selectedMethod.requiresPhone && !selectedMethod.requiresAccount && (
                <div>
                  <label style={labelStyle}>Email tài khoản</label>
                  <input value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com" style={inputStyle} />
                </div>
              )}
              {selectedMethod.requiresAccount && (
                <>
                  <div>
                    <label style={labelStyle}>Tên ngân hàng</label>
                    <input value={form.bankName || ''} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}
                      placeholder="Chase, Bank of America, Wells Fargo, SEPA..." style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Số tài khoản / IBAN / Routing</label>
                    <input value={form.accountNumber || ''} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))}
                      placeholder="Số tài khoản hoặc IBAN" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Tên chủ tài khoản</label>
                    <input value={form.accountName || ''} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))}
                      placeholder="Tên đầy đủ" style={inputStyle} />
                  </div>
                </>
              )}
            </div>
          )}

          <button onClick={handleSave}
            disabled={!form.methodId || !form.label}
            className="w-full py-4 rounded-2xl"
            style={{ background: form.methodId && form.label ? PRIMARY : '#E5E7EB', border: 'none', color: form.methodId && form.label ? 'white' : '#9CA3AF', fontSize: 15, fontWeight: 700, cursor: form.methodId && form.label ? 'pointer' : 'not-allowed' }}>
            {editTarget ? 'Cập nhật tài khoản' : 'Lưu tài kho��n'}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Profile Tab
// ============================================================
function ProfileTab({ onRoleChange }: { onRoleChange: () => void }) {
  const [accounts, setAccounts] = useState<ProviderAccount[]>(PROVIDER_ACCOUNTS_INIT);
  const [showAccountsModal, setShowAccountsModal] = useState(false);

  const menuItems = [
    { icon: <History size={18} color="#059669" />, label: 'Lịch sử giao dịch', bg: '#F0FDF4', onClick: () => {} },
    { icon: <Settings size={18} color="#6B7280" />, label: 'Cài đặt thông báo', bg: '#F9FAFB', onClick: () => {} },
    { icon: <ArrowLeftRight size={18} color="#D97706" />, label: 'Bảo mật & xác thực', bg: '#FFFBEB', onClick: () => {} },
  ];

  return (
    <div className="flex-1 overflow-y-auto relative">
      {showAccountsModal && (
        <PaymentAccountsModal accounts={accounts} onSave={setAccounts} onClose={() => setShowAccountsModal(false)} />
      )}
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY}, #1D4ED8)` }} className="px-5 pt-12 pb-12 relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="flex flex-col items-center relative z-10">
          <div className="relative mb-3">
            <Avatar name="Nguyễn Văn B" size={80} />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-400 border-2 border-white flex items-center justify-center">
              <BadgeCheck size={14} color="white" />
            </div>
          </div>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>Nguyễn Văn B</h2>
          <div className="flex items-center gap-2 mt-1">
            <BadgeCheck size={15} color="#93C5FD" />
            <span style={{ color: '#93C5FD', fontSize: 13 }}>Đã xác minh</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <Star size={14} color="#FCD34D" fill="#FCD34D" />
            <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>4.9</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>(248 đánh giá)</span>
          </div>
        </div>
      </div>
      <div className="px-4 -mt-6 relative z-10 pb-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'Giao dịch', value: '248', color: PRIMARY }, { label: 'Tháng này', value: '18', color: '#059669' }, { label: 'Tỷ lệ HT', value: '99%', color: '#D97706' }].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm text-center border border-gray-100">
              <p style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Payment Accounts Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button onClick={() => setShowAccountsModal(true)} className="w-full px-4 py-3 flex items-center justify-between" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                <Wallet size={18} color={PRIMARY} />
              </div>
              <div className="text-left">
                <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Tài khoản thanh toán</p>
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{accounts.length} tài khoản đã lưu</p>
              </div>
            </div>
            <ChevronRight size={16} color="#D1D5DB" />
          </button>
          {/* Preview of saved accounts */}
          {accounts.length > 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {accounts.slice(0, 4).map(acc => {
                const m = getPaymentMethod(acc.currency, acc.methodId);
                return (
                  <div key={acc.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: '#F8FAFF', border: '1px solid #DBEAFE' }}>
                    <span style={{ fontSize: 13 }}>{m?.icon || '💳'}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#1E40AF' }}>{acc.label}</span>
                  </div>
                );
              })}
              {accounts.length > 4 && (
                <div className="flex items-center px-2.5 py-1.5 rounded-xl" style={{ background: '#F3F4F6' }}>
                  <span style={{ fontSize: 11, color: '#6B7280' }}>+{accounts.length - 4} khác</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, i) => (
            <button key={i} onClick={item.onClick} className="w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50"
              style={{ background: 'none', border: 'none', cursor: 'pointer', borderBottom: i < menuItems.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>{item.icon}</div>
              <span style={{ fontSize: 15, color: '#111827', fontWeight: 500, flex: 1, textAlign: 'left' }}>{item.label}</span>
              <ChevronRight size={16} color="#D1D5DB" />
            </button>
          ))}
        </div>
        <div className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl" style={{ background: '#EFF6FF', border: '1px dashed #BFDBFE' }}>
          <ArrowLeftRight size={15} color="#3B82F6" />
          <span style={{ color: '#2563EB', fontSize: 13, fontWeight: 600 }}>Xem Người dùng ở khung bên phải →</span>
        </div>
        <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl" style={{ background: '#FEE2E2', border: 'none', cursor: 'pointer' }}>
          <LogOut size={16} color="#EF4444" />
          <span style={{ color: '#EF4444', fontSize: 14, fontWeight: 600 }}>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Bottom Nav & Main
// ============================================================
function BottomNav({ tab, onTab, pendingCount }: { tab: Tab; onTab: (t: Tab) => void; pendingCount: number }) {
  const items: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'home',     icon: <Home size={22} />,      label: 'Trang chủ' },
    { key: 'deals',    icon: <LayoutGrid size={22} />, label: 'Deals' },
    { key: 'requests', icon: <Bell size={22} />,       label: 'Yêu cầu' },
    { key: 'profile',  icon: <User size={22} />,       label: 'H�� sơ' },
  ];
  return (
    <div className="flex items-center border-t border-gray-100 bg-white px-2" style={{ paddingBottom: 8 }}>
      {items.map(item => (
        <button key={item.key} onClick={() => onTab(item.key)} className="flex-1 flex flex-col items-center py-3 gap-1 relative" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ color: tab === item.key ? PRIMARY : '#9CA3AF' }}>{item.icon}</div>
          <span style={{ fontSize: 10, color: tab === item.key ? PRIMARY : '#9CA3AF', fontWeight: tab === item.key ? 700 : 400 }}>{item.label}</span>
          {item.key === 'requests' && pendingCount > 0 && (
            <div className="absolute top-2 right-1/4 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center" style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>{pendingCount}</div>
          )}
          {tab === item.key && (
            <motion.div layoutId="provider-indicator" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full" style={{ background: PRIMARY }} />
          )}
        </button>
      ))}
    </div>
  );
}

export function ProviderApp({ onRoleChange, deals, requests, onDealsChange, onRequestsChange, newRequestIds }: {
  onRoleChange: () => void;
  deals: Deal[];
  requests: DealRequest[];
  onDealsChange: (d: Deal[]) => void;
  onRequestsChange: (r: DealRequest[]) => void;
  newRequestIds: string[];
}) {
  const [tab, setTab] = useState<Tab>('home');
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex-1 overflow-hidden flex flex-col">
          {tab === 'home'     && <HomeTab deals={deals} requests={requests} onTabChange={setTab} />}
          {tab === 'deals'    && <DealsTab deals={deals} onDealsChange={onDealsChange} />}
          {tab === 'requests' && <RequestsTab requests={requests} onRequestsChange={onRequestsChange} newRequestIds={newRequestIds} />}
          {tab === 'profile'  && <ProfileTab onRoleChange={onRoleChange} />}
        </motion.div>
      </AnimatePresence>
      <BottomNav tab={tab} onTab={setTab} pendingCount={pendingCount} />
    </div>
  );
}