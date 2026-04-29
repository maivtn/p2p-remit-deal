import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Bell, User, ArrowRight, BadgeCheck, Clock,
  ChevronRight, X, ArrowLeftRight, LogOut,
  CheckCircle2, XCircle, Inbox, Wallet, History, Settings,
  Star, Send, RefreshCw, ChevronLeft, Zap,
  UserRound, Phone, Building2, CreditCard, ArrowDown, MapPin, Mail,
  Check, Copy, Plus, Edit2, Trash2,
} from 'lucide-react';
import {
  CURRENCIES, getCurrency, formatVND, formatAmount, timeAgo,
  getAvatarBg, getInitials,
  PAYMENT_METHODS_BY_CURRENCY, getPaymentMethod,
  type Deal, type DealRequest, type PaymentMethod, type ProofData,
  type ProviderAccount, PROVIDER_ACCOUNTS_INIT, REQUESTER_ACCOUNTS_INIT,
} from '../../data/mockData';
import { ProofModal, ProofCard, EscrowBanner, StepProgress, TransactionProofSections } from '../shared/ProofModal';
import { RecipientDetails } from '../shared/RecipientDetails';

type Tab = 'home' | 'requests' | 'accounts' | 'profile';
type RequestsViewMode = 'list' | 'detail';
const PRIMARY_REQ = '#059669';

function safeCopy(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  } catch {
    fallbackCopy(text);
  }
}
function fallbackCopy(text: string) {
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

function fmt(amount: number, code: string) {
  if (code === 'VND') return formatVND(amount);
  return formatAmount(amount, code);
}
function fmtRate(rate: number, fromCode: string, toCode: string) {
  if (toCode === 'VND') return `${formatVND(rate)}/${fromCode}`;
  return `${fmt(rate, toCode)}/${fromCode}`;
}

const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: getAvatarBg(name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <span style={{ color: 'white', fontSize: size * 0.38, fontWeight: 600 }}>{getInitials(name)}</span>
  </div>
);

const Stars = ({ rating }: { rating: number }) => (
  <span style={{ color: '#F59E0B', fontSize: 12 }}>
    {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    <span style={{ color: '#6B7280', marginLeft: 3 }}>{rating.toFixed(1)}</span>
  </span>
);

const StatusBadge = ({ status }: { status: DealRequest['status'] }) => {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending:     { label: 'Chờ duyệt',  bg: '#FEF3C7', color: '#92400E' },
    accepted:    { label: 'Đã nhận',    bg: '#DBEAFE', color: '#1E40AF' },
    in_progress: { label: 'Đang xử lý', bg: '#EDE9FE', color: '#5B21B6' },
    completed:   { label: 'Hoàn thành', bg: '#D1FAE5', color: '#065F46' },
    rejected:    { label: 'Từ chối',    bg: '#FEE2E2', color: '#991B1B' },
    cancelled:   { label: 'Đã hủy',     bg: '#F3F4F6', color: '#4B5563' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
};

// ── Payment method chip selector ──────────────────────────────
function PaymentMethodSelector({
  currency, selected, onSelect, label,
}: { currency: string; selected: string; onSelect: (id: string) => void; label: string }) {
  const methods = PAYMENT_METHODS_BY_CURRENCY[currency] ?? [];
  return (
    <div>
      <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {methods.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all"
            style={{
              background: selected === m.id ? '#ECFDF5' : '#F9FAFB',
              border: `2px solid ${selected === m.id ? PRIMARY_REQ : '#E5E7EB'}`,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 16 }}>{m.icon}</span>
            <span style={{ fontSize: 13, fontWeight: selected === m.id ? 700 : 500, color: selected === m.id ? PRIMARY_REQ : '#374151' }}>
              {m.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Method badge (display only) ───────────────────────────────
function MethodBadge({ currency, methodId }: { currency: string; methodId: string }) {
  const m = getPaymentMethod(currency, methodId);
  if (!m) return <span style={{ fontSize: 12, color: '#6B7280' }}>{methodId}</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
      <span style={{ fontSize: 14 }}>{m.icon}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#065F46' }}>{m.name}</span>
    </span>
  );
}

// ── Estimated rates ───────────────────────────────────────────
const PREVIEW_RATES: Record<string, Record<string, number>> = {
  USD: { VND: 25500, USD: 0.98, EUR: 0.92, GBP: 0.79, AUD: 1.54, SGD: 1.33 },
  EUR: { VND: 27900, USD: 1.08, EUR: 0.97, GBP: 0.86 },
  GBP: { VND: 32200, USD: 1.26, EUR: 1.16 },
  SGD: { VND: 19050, USD: 0.74 },
  AUD: { VND: 16900, USD: 0.65 },
  JPY: { VND: 172, USD: 0.0067 },
  KRW: { VND: 19, USD: 0.00073 },
  THB: { VND: 730, USD: 0.028 },
  CNY: { VND: 3520, USD: 0.138 },
};

// ============================================================
// Need (what user wants)
// ============================================================
interface Need {
  senderCurrency: string;
  recipientCurrency: string;
  amount: string;
  senderPaymentMethod: string;
  recipientPaymentMethod: string;
  recipientName: string;
  recipientPhone: string;
  recipientBank: string;
  recipientAccount: string;
  recipientAddress: string;
  message: string;
}

// ============================================================
// STEP 1 – Nhập nhu cầu
// ============================================================
function NeedForm({
  onSearch,
  accounts = [],
  onAccountsChange,
}: {
  onSearch: (need: Need) => void;
  accounts?: ProviderAccount[];
  onAccountsChange: (accounts: ProviderAccount[]) => void;
}) {
  const [need, setNeed] = useState<Need>({
    senderCurrency: 'USD', recipientCurrency: 'VND',
    amount: '500',
    senderPaymentMethod: 'zelle',
    recipientPaymentMethod: 'momo',
    recipientName: 'Trần Văn C', recipientPhone: '0901234567',
    recipientBank: 'Vietcombank', recipientAccount: '1234567890',
    recipientAddress: '123 Lê Lợi, Q1, TP.HCM', message: 'Cần chuyển gấp trong hôm nay',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const set = (k: keyof Need, v: string) => { setNeed(n => ({ ...n, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const senderCurr = getCurrency(need.senderCurrency);
  const recipientCurr = getCurrency(need.recipientCurrency);
  const previewRate = PREVIEW_RATES[need.senderCurrency]?.[need.recipientCurrency] ?? 0;
  const previewAmount = need.amount && !isNaN(Number(need.amount)) && previewRate > 0
    ? Number(need.amount) * previewRate : 0;

  const availableRecipientCurrencies = Object.keys(PREVIEW_RATES[need.senderCurrency] ?? {});

  const recipientMethod: PaymentMethod | undefined = getPaymentMethod(need.recipientCurrency, need.recipientPaymentMethod);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!need.amount || isNaN(Number(need.amount)) || Number(need.amount) <= 0) e.amount = 'Nhập số tiền hợp lệ';
    if (!need.recipientName.trim()) e.recipientName = 'Nhập tên chủ tài khoản';
    if (recipientMethod?.requiresPhone && !need.recipientPhone.trim()) e.recipientPhone = 'Nhập số điện thoại';
    if (recipientMethod?.requiresAccount && !need.recipientAccount.trim()) e.recipientAccount = 'Nhập số tài khoản';
    return e;
  };

  const handleSearch = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSearch(need);
  };

  // When sender currency changes, reset sender payment method to first available
  const changeSenderCurrency = (code: string) => {
    const methods = PAYMENT_METHODS_BY_CURRENCY[code] ?? [];
    const available = Object.keys(PREVIEW_RATES[code] ?? {});
    const newRecipient = available.includes(need.recipientCurrency) ? need.recipientCurrency : (available[0] ?? 'VND');
    const recipientMethods = PAYMENT_METHODS_BY_CURRENCY[newRecipient] ?? [];
    setNeed(n => ({
      ...n, senderCurrency: code, recipientCurrency: newRecipient,
      senderPaymentMethod: methods[0]?.id ?? '',
      recipientPaymentMethod: recipientMethods[0]?.id ?? '',
    }));
  };

  const changeRecipientCurrency = (code: string) => {
    const methods = PAYMENT_METHODS_BY_CURRENCY[code] ?? [];
    setNeed(n => ({ ...n, recipientCurrency: code, recipientPaymentMethod: methods[0]?.id ?? '' }));
  };

  const BANKS = ['Vietcombank', 'Techcombank', 'MB Bank', 'BIDV', 'Agribank', 'VPBank', 'ACB', 'TPBank', 'Sacombank'];

  return (
    <div className="flex-1 overflow-y-auto">
      {showAccountsModal && (
        <PaymentAccountsModal
          accounts={accounts}
          onSave={onAccountsChange}
          onClose={() => setShowAccountsModal(false)}
        />
      )}
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)` }} className="px-5 pt-12 pb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-44 h-44 rounded-full bg-white/10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Xin chào 👋</p>
              <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginTop: 2 }}>Nguyễn Văn A</h1>
            </div>
            <Avatar name="Nguyễn Văn A" size={44} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 600 }}>Bạn muốn gửi tiền đi đâu?</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }}>Nhập nhu cầu — hệ thống tìm deal tốt nhất</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">

        {/* ── CARD 1: Số tiền & đơn vị ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5 }}>SỐ TIỀN CHUYỂN</p>
          </div>
          <div className="px-4 pb-4 pt-2">
            {/* Sender row */}
            <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>Bạn gửi (đang ở quốc gia nào, trả bằng)</p>
            <div className="flex items-stretch gap-2">
              <div className="relative flex-shrink-0" style={{ minWidth: 118 }}>
                <select
                  value={need.senderCurrency}
                  onChange={e => changeSenderCurrency(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 bg-gray-50 w-full h-full appearance-none"
                  style={{ fontSize: 14, fontWeight: 700, color: '#111827', paddingRight: 24 }}
                >
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <svg className="absolute top-1/2 -translate-y-1/2 pointer-events-none" style={{ right: 8 }} width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4L6 8L10 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="relative flex-1">
                <input
                  type="number"
                  value={need.amount}
                  onChange={e => set('amount', e.target.value)}
                  placeholder="0"
                  className="w-full h-full border rounded-xl pl-4 pr-4 py-3 bg-gray-50 text-right"
                  style={{ borderColor: errors.amount ? '#EF4444' : '#E5E7EB', fontSize: 14, fontWeight: 800, color: '#111827' }}
                />
              </div>
            </div>
            {errors.amount && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.amount}</p>}

            {/* Arrow */}
            <div className="flex items-center py-2 gap-2">
              <div className="w-28 flex justify-center">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <ArrowDown size={15} color={PRIMARY_REQ} />
                </div>
              </div>
              {previewRate > 0 && (
                <p style={{ fontSize: 11, color: '#9CA3AF' }}>
                  1 {need.senderCurrency} ≈ {fmtRate(previewRate, need.senderCurrency, need.recipientCurrency).split('/')[0]}
                </p>
              )}
            </div>

            {/* Recipient currency + preview */}
            <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>Người nhận sẽ nhận bằng</p>
            <div className="flex items-stretch gap-2">
              <select
                value={need.recipientCurrency}
                onChange={e => changeRecipientCurrency(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-3 bg-gray-50 flex-shrink-0 appearance-none"
                style={{
                  fontSize: 14, fontWeight: 700, color: '#111827', minWidth: 118,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2 4L6 8L10 4' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  paddingRight: 24,
                }}
              >
                {availableRecipientCurrencies.map(code => {
                  const c = getCurrency(code);
                  return <option key={code} value={code}>{c?.flag} {code}</option>;
                })}
              </select>
              <div className="flex-1 border border-emerald-200 rounded-xl px-4 py-3 bg-emerald-50 flex items-center justify-end"><span style={{ fontSize: 14, fontWeight: 800, color: '#065F46' }}>{previewAmount > 0 ? `≈ ${fmt(previewAmount, need.recipientCurrency)}` : '—'}</span></div>
            </div>
            {previewAmount > 0 && (
              <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>* Tỷ giá ước tính. Tỷ giá thực theo nhà cung cấp.</p>
            )}
          </div>
        </div>

        {/* ── CARD 2: Hình thức thanh toán ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 14 }}>HÌNH THỨC THANH TOÁN</p>
            <div className="space-y-4">
              <PaymentMethodSelector
                currency={need.senderCurrency}
                selected={need.senderPaymentMethod}
                onSelect={id => set('senderPaymentMethod', id)}
                label={`Bạn trả nhà cung cấp qua (tại ${senderCurr?.name ?? need.senderCurrency})`}
              />
              <div className="border-t border-gray-100" />
              <PaymentMethodSelector
                currency={need.recipientCurrency}
                selected={need.recipientPaymentMethod}
                onSelect={id => {
                  set('recipientPaymentMethod', id);
                  // reset recipient detail fields when switching method
                  setNeed(n => ({ ...n, recipientPaymentMethod: id, recipientPhone: '', recipientBank: '', recipientAccount: '', recipientAddress: '' }));
                }}
                label={`Người nhận sẽ nhận qua (tại ${recipientCurr?.name ?? need.recipientCurrency})`}
              />
            </div>
          </div>
        </div>

        {/* ── CARD 3: Thông tin tài khoản nhận (adaptive) ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5 }}>THÔNG TIN TÀI KHOẢN NHẬN</p>
              {recipientMethod && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <span style={{ fontSize: 13 }}>{recipientMethod.icon}</span>
                  <span style={{ fontSize: 11, color: '#065F46', fontWeight: 600 }}>{recipientMethod.name}</span>
                </span>
              )}
            </div>

            <div className="space-y-3">

              {/* Saved Accounts Dropdown */}
              {accounts.filter(a => a.currency === need.recipientCurrency && a.methodId === need.recipientPaymentMethod).length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p style={{ fontSize: 12, color: '#6B7280' }}>Chọn tài khoản đã lưu:</p>
                    <button
                      type="button"
                      onClick={() => setShowAccountsModal(true)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                      style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', cursor: 'pointer' }}
                    >
                      <Settings size={12} color="#6B7280" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#4B5563' }}>Cài đặt</span>
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {accounts.filter(a => a.currency === need.recipientCurrency && a.methodId === need.recipientPaymentMethod).map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          set('recipientName', acc.accountName || '');
                          if (acc.phone) set('recipientPhone', acc.phone);
                          if (acc.accountNumber) set('recipientAccount', acc.accountNumber);
                          if (acc.bankName) set('recipientBank', acc.bankName);
                        }}
                        className="whitespace-nowrap px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 active:bg-gray-100 text-left"
                      >
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{acc.label}</p>
                        <p style={{ fontSize: 11, color: '#6B7280' }}>{acc.accountName}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name – always shown */}

              <div>
                <div className="flex items-center gap-2 border rounded-xl px-3 py-3 bg-gray-50" style={{ borderColor: errors.recipientName ? '#EF4444' : '#E5E7EB' }}>
                  <UserRound size={16} color="#9CA3AF" />
                  <input
                    value={need.recipientName}
                    onChange={e => set('recipientName', e.target.value)}
                    placeholder="Tên chủ tài khoản *"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: 14, color: '#111827' }}
                  />
                </div>
                {errors.recipientName && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 3 }}>{errors.recipientName}</p>}
              </div>

              {/* Phone – for mobile wallets & digital methods */}
              {recipientMethod?.requiresPhone && (
                <div>
                  <div className="flex items-center gap-2 border rounded-xl px-3 py-3 bg-gray-50" style={{ borderColor: errors.recipientPhone ? '#EF4444' : '#E5E7EB' }}>
                    <span style={{ fontSize: 16 }}>{recipientMethod.icon}</span>
                    <input
                      value={need.recipientPhone}
                      onChange={e => set('recipientPhone', e.target.value)}
                      placeholder={`Số điện thoại ${recipientMethod.name} *`}
                      className="flex-1 bg-transparent outline-none"
                      style={{ fontSize: 14, color: '#111827' }}
                      type="tel"
                    />
                  </div>
                  {errors.recipientPhone && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 3 }}>{errors.recipientPhone}</p>}
                </div>
              )}

              {/* Bank + account – for bank transfer */}
              {recipientMethod?.requiresAccount && (
                <>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-3 bg-gray-50">
                    <Building2 size={16} color="#9CA3AF" />
                    {need.recipientCurrency === 'VND' ? (
                      <select
                        value={need.recipientBank}
                        onChange={e => set('recipientBank', e.target.value)}
                        className="flex-1 bg-transparent outline-none"
                        style={{ fontSize: 14, color: need.recipientBank ? '#111827' : '#9CA3AF' }}
                      >
                        <option value="">Chọn ngân hàng</option>
                        {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    ) : (
                      <input
                        value={need.recipientBank}
                        onChange={e => set('recipientBank', e.target.value)}
                        placeholder="Tên ngân hàng"
                        className="flex-1 bg-transparent outline-none"
                        style={{ fontSize: 14, color: '#111827' }}
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 border rounded-xl px-3 py-3 bg-gray-50" style={{ borderColor: errors.recipientAccount ? '#EF4444' : '#E5E7EB' }}>
                      <CreditCard size={16} color="#9CA3AF" />
                      <input
                        value={need.recipientAccount}
                        onChange={e => set('recipientAccount', e.target.value)}
                        placeholder="Số tài khoản *"
                        className="flex-1 bg-transparent outline-none"
                        style={{ fontSize: 14, color: '#111827' }}
                      />
                    </div>
                    {errors.recipientAccount && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 3 }}>{errors.recipientAccount}</p>}
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

        {/* ── Note ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 8 }}>GHI CHÚ CHO NHÀ CUNG CẤP</p>
          <textarea
            value={need.message}
            onChange={e => set('message', e.target.value)}
            placeholder="Ví dụ: Cần chuyển gấp trước 3h chiều..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 resize-none"
            style={{ fontSize: 14 }}
          />
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)`, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' }}
        >
          <Zap size={18} />
          Tìm Deal Phù Hợp
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STEP 2 – Danh sách deal phù hợp
// ============================================================
function DealResults({ need, onBack, onSelectDeal, availableDeals }: {
  need: Need; onBack: () => void; onSelectDeal: (deal: Deal) => void; availableDeals: Deal[];
}) {
  const amount = Number(need.amount);
  const senderCurr = getCurrency(need.senderCurrency);
  const recipientCurr = getCurrency(need.recipientCurrency);

  // Score deals: perfect match (both methods) > partial match > no match but same corridor
  const scoreDeal = (d: Deal) => {
    let score = 0;
    if (d.senderPaymentMethods.includes(need.senderPaymentMethod)) score += 10;
    if (d.recipientPaymentMethods.includes(need.recipientPaymentMethod)) score += 10;
    return score;
  };

  const corridor = availableDeals.filter(d =>
    d.fromCurrency === need.senderCurrency &&
    d.toCurrency === need.recipientCurrency &&
    d.status === 'active'
  );

  const matching = corridor.filter(d => amount >= d.minAmount && amount <= d.maxAmount)
    .sort((a, b) => (scoreDeal(b) - scoreDeal(a)) || (b.rate - a.rate));

  const nearby = corridor.filter(d => !matching.find(m => m.id === d.id))
    .sort((a, b) => b.rate - a.rate);

  const senderMethod = getPaymentMethod(need.senderCurrency, need.senderPaymentMethod);
  const recipientMethod = getPaymentMethod(need.recipientCurrency, need.recipientPaymentMethod);

  return (
    <div className="flex-1 overflow-y-auto">
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)` }} className="px-5 pt-12 pb-5">
        <button onClick={onBack} className="flex items-center gap-1 mb-3" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>
          <ChevronLeft size={18} />
          <span style={{ fontSize: 14 }}>Thay đổi yêu cầu</span>
        </button>
        <div className="bg-white/15 rounded-2xl px-4 py-3 space-y-2">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 20 }}>{senderCurr?.flag}</span>
            <div className="flex-1">
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Bạn thanh toán qua</p>
              <p style={{ color: 'white', fontSize: 15, fontWeight: 800 }}>
                {fmt(amount, need.senderCurrency)}
                {senderMethod && <span style={{ fontSize: 12, fontWeight: 500 }}> · {senderMethod.icon} {senderMethod.name}</span>}
              </p>
            </div>
            <ArrowRight size={14} color="rgba(255,255,255,0.5)" />
            <span style={{ fontSize: 20 }}>{recipientCurr?.flag}</span>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Bạn nhận qua</p>
              <p style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>
                {need.recipientCurrency}
                {recipientMethod && <span style={{ fontSize: 11, fontWeight: 400 }}> · {recipientMethod.icon} {recipientMethod.name}</span>}
              </p>
            </div>
          </div>
          <div className="pt-1 border-t border-white/20">
            <RecipientDetails
              mode="inline"
              name={need.recipientName}
              method={recipientMethod}
              phone={need.recipientPhone}
              bank={need.recipientBank}
              tone={{
                icon: "rgba(255,255,255,0.7)",
                text: "rgba(255,255,255,0.8)",
                muted: "rgba(255,255,255,0.6)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {matching.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={15} color={PRIMARY_REQ} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                {matching.length} deal phù hợp — sắp xếp theo hình thức + tỷ giá
              </p>
            </div>

            {matching.map((deal, i) => {
              const receiveAmount = amount * deal.rate;
              const supportsSender = deal.senderPaymentMethods.includes(need.senderPaymentMethod);
              const supportsRecipient = deal.recipientPaymentMethods.includes(need.recipientPaymentMethod);
              const perfectMatch = supportsSender && supportsRecipient;

              return (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl shadow-sm border overflow-hidden"
                  style={{ borderColor: perfectMatch ? PRIMARY_REQ : '#E5E7EB', borderWidth: perfectMatch ? 2 : 1 }}
                >
                  {perfectMatch && i === 0 && (
                    <div className="px-4 py-2 flex items-center gap-1" style={{ background: PRIMARY_REQ }}>
                      <Star size={12} color="white" fill="white" />
                      <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>Khớp hoàn toàn hình thức thanh toán · Tỷ giá tốt nhất</span>
                    </div>
                  )}
                  {perfectMatch && i > 0 && (
                    <div className="px-4 py-1.5 flex items-center gap-1" style={{ background: '#F0FDF4' }}>
                      <CheckCircle2 size={11} color={PRIMARY_REQ} />
                      <span style={{ color: PRIMARY_REQ, fontSize: 11, fontWeight: 600 }}>Hỗ trợ {senderMethod?.name} & {recipientMethod?.name}</span>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={deal.providerName} size={42} />
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{deal.providerName}</span>
                          {deal.providerVerified && <BadgeCheck size={13} color="#2563EB" />}
                        </div>
                        <Stars rating={deal.providerRating} />
                      </div>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{deal.completedDeals} GD</span>
                    </div>

                    {/* Rate box */}
                    <div className="rounded-xl p-3 mb-3" style={{ background: i === 0 ? '#ECFDF5' : '#F9FAFB' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p style={{ fontSize: 11, color: '#6B7280' }}>Tỷ giá</p>
                          <p style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? '#065F46' : '#374151' }}>
                            {fmtRate(deal.rate, deal.fromCurrency, deal.toCurrency)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span style={{ fontSize: 18 }}>{senderCurr?.flag}</span>
                          <ArrowRight size={12} color="#9CA3AF" />
                          <span style={{ fontSize: 18 }}>{recipientCurr?.flag}</span>
                        </div>
                        <div className="text-right">
                          <p style={{ fontSize: 11, color: '#6B7280' }}>Bạn nhận</p>
                          <p style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? '#065F46' : '#374151' }}>
                            {fmt(receiveAmount, deal.toCurrency)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment method badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <span style={{ fontSize: 11, color: '#6B7280' }}>Nhận qua:</span>
                        {deal.senderPaymentMethods.slice(0, 3).map(id => {
                          const m = getPaymentMethod(deal.fromCurrency, id);
                          const match = id === need.senderPaymentMethod;
                          return m ? (
                            <span key={id} className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs"
                              style={{ background: match ? '#ECFDF5' : '#F3F4F6', border: `1px solid ${match ? '#6EE7B7' : '#E5E7EB'}`, fontWeight: match ? 700 : 400, color: match ? '#065F46' : '#6B7280' }}>
                              {m.icon} {m.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <span style={{ fontSize: 11, color: '#6B7280' }}>Gửi qua:</span>
                        {deal.recipientPaymentMethods.slice(0, 3).map(id => {
                          const m = getPaymentMethod(deal.toCurrency, id);
                          const match = id === need.recipientPaymentMethod;
                          return m ? (
                            <span key={id} className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs"
                              style={{ background: match ? '#ECFDF5' : '#F3F4F6', border: `1px solid ${match ? '#6EE7B7' : '#E5E7EB'}`, fontWeight: match ? 700 : 400, color: match ? '#065F46' : '#6B7280' }}>
                              {m.icon} {m.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={12} color="#9CA3AF" />
                      <span style={{ fontSize: 12, color: '#6B7280' }}>{deal.transferTime}</span>
                    </div>

                    {deal.notes && (
                      <div className="bg-amber-50 rounded-xl px-3 py-2 mb-3 flex items-start gap-1">
                        <span style={{ fontSize: 13 }}>💬</span>
                        <p style={{ fontSize: 12, color: '#92400E' }}>{deal.notes}</p>
                      </div>
                    )}

                    <button
                      onClick={() => onSelectDeal(deal)}
                      className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                      style={{ background: i === 0 ? `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)` : '#F0FDF4', border: 'none', cursor: 'pointer' }}
                    >
                      <Send size={14} color={i === 0 ? 'white' : PRIMARY_REQ} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: i === 0 ? 'white' : PRIMARY_REQ }}>Chọn deal này</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </>
        ) : (
          <div className="flex flex-col items-center py-10 text-center">
            <div style={{ fontSize: 48 }}>🔍</div>
            <p style={{ color: '#374151', marginTop: 10, fontSize: 15, fontWeight: 600 }}>
              Chưa có deal {need.senderCurrency} → {need.recipientCurrency} phù hợp
            </p>
            <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>Thử đổi số tiền hoặc hình thức thanh toán</p>
            <button onClick={onBack} className="mt-5 px-6 py-3 rounded-xl" style={{ background: PRIMARY_REQ, color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Thay đổi yêu cầu
            </button>
          </div>
        )}

        {nearby.length > 0 && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', marginBottom: 8 }}>Deal gần đúng số tiền</p>
            {nearby.map(deal => (
              <div key={deal.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 mb-2 opacity-70 flex items-center gap-3">
                <Avatar name={deal.providerName} size={34} />
                <div className="flex-1">
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{deal.providerName}</span>
                  <p style={{ fontSize: 11, color: '#9CA3AF' }}>
                    Giới hạn: {fmt(deal.minAmount, deal.fromCurrency)} – {fmt(deal.maxAmount, deal.fromCurrency)}
                  </p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#374151' }}>{fmtRate(deal.rate, deal.fromCurrency, deal.toCurrency)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// STEP 3 – Xác nh��n
// ============================================================
function ConfirmRequest({ deal, need, onBack, onConfirm }: {
  deal: Deal; need: Need; onBack: () => void; onConfirm: (req: DealRequest) => void;
}) {
  const amount = Number(need.amount);
  const receiveAmount = amount * deal.rate;
  const [message, setMessage] = useState(need.message);
  const senderCurr = getCurrency(deal.fromCurrency);
  const recipientCurr = getCurrency(deal.toCurrency);
  const senderMethod = getPaymentMethod(need.senderCurrency, need.senderPaymentMethod);
  const recipientMethod = getPaymentMethod(need.recipientCurrency, need.recipientPaymentMethod);

  const handleConfirm = () => {
    const req: DealRequest = {
      id: 'mr_' + Date.now(),
      dealId: deal.id, requesterId: 'self', requesterName: 'Nguyễn Văn A', requesterRating: 4.7,
      providerName: deal.providerName, providerId: deal.providerId,
      amount, fromCurrency: deal.fromCurrency, toCurrency: deal.toCurrency,
      rate: deal.rate, receiveAmount, status: 'pending',
      createdAt: new Date().toISOString(), message,
      senderPaymentMethod: need.senderPaymentMethod,
      recipientPaymentMethod: need.recipientPaymentMethod,
      recipientName: need.recipientName,
      recipientPhone: need.recipientPhone || undefined,
      recipientBank: need.recipientBank || undefined,
      recipientAccount: need.recipientAccount || undefined,
      recipientAddress: need.recipientAddress || undefined,
      systemFeeRate: 0.005,
      systemFeeAmount: amount * 0.005,
      escrowLocked: false,
    };
    onConfirm(req);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)` }} className="px-5 pt-12 pb-5">
        <button onClick={onBack} className="flex items-center gap-1 mb-4" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>
          <ChevronLeft size={18} /><span style={{ fontSize: 14 }}>Chọn deal khác</span>
        </button>
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>Xác nhận yêu cầu</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 3 }}>Kiểm tra kỹ trước khi gửi</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Provider */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 10 }}>NHÀ CUNG CẤP</p>
          <div className="flex items-center gap-3">
            <Avatar name={deal.providerName} size={48} />
            <div>
              <div className="flex items-center gap-1">
                <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{deal.providerName}</span>
                {deal.providerVerified && <BadgeCheck size={15} color="#2563EB" />}
              </div>
              <Stars rating={deal.providerRating} />
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{deal.completedDeals} giao dịch</p>
            </div>
          </div>
        </div>

        {/* Payment flow */}
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginBottom: 12 }}>LUỒNG GIAO DỊCH</p>
          <div className="flex items-start justify-between gap-2">
            <div className="text-center flex-1">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                <span style={{ fontSize: 20 }}>{senderCurr?.flag}</span>
              </div>
              <p style={{ fontSize: 11, color: '#6B7280' }}>Bạn trả</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>{fmt(amount, deal.fromCurrency)}</p>
              {senderMethod && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg mt-1" style={{ background: 'white', border: '1px solid #D1FAE5' }}>
                  <span style={{ fontSize: 13 }}>{senderMethod.icon}</span>
                  <span style={{ fontSize: 11, color: '#065F46', fontWeight: 600 }}>{senderMethod.name}</span>
                </span>
              )}
            </div>
            <div className="flex flex-col items-center pt-3 gap-1 flex-shrink-0">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: PRIMARY_REQ }}>
                <ArrowRight size={12} color="white" />
              </div>
              <p style={{ fontSize: 10, color: '#9CA3AF' }}>{deal.transferTime}</p>
            </div>
            <div className="text-center flex-1">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                <span style={{ fontSize: 20 }}>{recipientCurr?.flag}</span>
              </div>
              <p style={{ fontSize: 11, color: '#6B7280' }}>Bạn nhận</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#065F46' }}>{fmt(receiveAmount, deal.toCurrency)}</p>
              {recipientMethod && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg mt-1" style={{ background: 'white', border: '1px solid #D1FAE5' }}>
                  <span style={{ fontSize: 13 }}>{recipientMethod.icon}</span>
                  <span style={{ fontSize: 11, color: '#065F46', fontWeight: 600 }}>{recipientMethod.name}</span>
                </span>
              )}
            </div>
          </div>
          {/* Exchange rate — prominent row */}
          <div className="mt-3 rounded-xl px-3 py-2 flex items-center justify-between" style={{ background: 'white', border: '1px solid #D1FAE5' }}>
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 13 }}>💱</span>
              <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>Tỉ giá áp dụng</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#065F46', letterSpacing: 0.2 }}>
              {fmtRate(deal.rate, deal.fromCurrency, deal.toCurrency)}
            </span>
          </div>
        </div>

        {/* Recipient details */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 12 }}>NGƯỜI THỤ HƯỞNG</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <UserRound size={14} color="#2563EB" />
              </div>
              <div><p style={{ fontSize: 11, color: '#9CA3AF' }}>Tên</p><p style={{ fontSize: 14, fontWeight: 700 }}>{need.recipientName}</p></div>
            </div>
            {recipientMethod?.requiresPhone && need.recipientPhone && recipientMethod?.id === 'momo' && (
              <div>
                <p style={{ fontSize: 11, color: '#9CA3AF' }}>Số điện thoại</p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{need.recipientPhone}</p>
              </div>
            )}
            {recipientMethod?.requiresPhone && need.recipientPhone && recipientMethod?.id !== 'momo' && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F0FDF4' }}>
                  <span style={{ fontSize: 16 }}>{recipientMethod?.icon}</span>
                </div>
                <div><p style={{ fontSize: 11, color: '#9CA3AF' }}>{recipientMethod?.name}</p><p style={{ fontSize: 14, fontWeight: 600 }}>{need.recipientPhone}</p></div>
              </div>
            )}
            {recipientMethod?.requiresAccount && need.recipientBank && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Building2 size={14} color="#7C3AED" />
                </div>
                <div><p style={{ fontSize: 11, color: '#9CA3AF' }}>Ngân hàng</p><p style={{ fontSize: 14, fontWeight: 600 }}>{need.recipientBank}</p></div>
              </div>
            )}
            {recipientMethod?.requiresAccount && need.recipientAccount && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <CreditCard size={14} color="#D97706" />
                </div>
                <div><p style={{ fontSize: 11, color: '#9CA3AF' }}>Số tài khoản</p><p style={{ fontSize: 14, fontWeight: 600, letterSpacing: 0.5 }}>{need.recipientAccount}</p></div>
              </div>
            )}
            {recipientMethod?.requiresAccount && need.recipientAddress && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} color="#EF4444" />
                </div>
                <div><p style={{ fontSize: 11, color: '#9CA3AF' }}>Địa chỉ nhận tiền mặt</p><p style={{ fontSize: 14, fontWeight: 600 }}>{need.recipientAddress}</p></div>
              </div>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100">
          <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, marginBottom: 8 }}>GHI CHÚ</p>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2}
            placeholder="Ghi chú thêm nếu cần..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 resize-none" style={{ fontSize: 14 }} />
        </div>

        <button onClick={handleConfirm}
          className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)`, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          <Send size={18} />Gửi Yêu Cầu
        </button>
        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>Nhà cung cấp sẽ xác nhận và liên hệ sớm nhất có thể</p>
      </div>
    </div>
  );
}

// ============================================================
// Home Tab – state machine
// ============================================================
type HomeStep = 'input' | 'results' | 'confirm';

function HomeTab({ onRequestSent, availableDeals, accounts, onAccountsChange }: {
  onRequestSent: (req: DealRequest) => void;
  availableDeals: Deal[];
  accounts: ProviderAccount[];
  onAccountsChange: (accounts: ProviderAccount[]) => void;
}) {
  const [step, setStep] = useState<HomeStep>('input');
  const [need, setNeed] = useState<Need | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div key="input" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }} className="flex-1 overflow-hidden flex flex-col">
            <NeedForm
              accounts={accounts}
              onAccountsChange={onAccountsChange}
              onSearch={n => { setNeed(n); setStep('results'); }}
            />
          </motion.div>
        )}
        {step === 'results' && need && (
          <motion.div key="results" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.22 }} className="flex-1 overflow-hidden flex flex-col">
            <DealResults need={need} onBack={() => setStep('input')} onSelectDeal={d => { setSelectedDeal(d); setStep('confirm'); }} availableDeals={availableDeals} />
          </motion.div>
        )}
        {step === 'confirm' && need && selectedDeal && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.22 }} className="flex-1 overflow-hidden flex flex-col">
            <ConfirmRequest deal={selectedDeal} need={need} onBack={() => setStep('results')}
              onConfirm={req => { onRequestSent(req); setStep('input'); setNeed(null); setSelectedDeal(null); }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// My Requests Tab – Full Escrow Flow
// ============================================================
type ReqFilter = 'active' | 'pending' | 'completed' | 'other';

const STATUS_CFG: Record<string, { label: string; bg: string; color: string }> = {
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

function TxStatusBadge({ status }: { status: string }) {
  const s = STATUS_CFG[status] ?? { label: status, bg: '#F3F4F6', color: '#4B5563' };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function RequestCard({
  req,
  onUpdate,
  onCancel,
  variant = 'list',
}: {
  req: DealRequest;
  onUpdate: (updated: Partial<DealRequest>) => void;
  onCancel: () => void;
  /** `detail`: mở sẵn phần người thụ hưởng để xem đủ thông tin. */
  variant?: 'list' | 'detail';
}) {
  const [showPaymentUpload, setShowPaymentUpload] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showTransferProof, setShowTransferProof] = useState(false);
  const [showRecipient, setShowRecipient] = useState(
    variant === 'detail' || req.status === 'pending',
  );
  const senderMethod = getPaymentMethod(req.fromCurrency, req.senderPaymentMethod);
  const recipientMethod = getPaymentMethod(req.toCurrency, req.recipientPaymentMethod);
  const senderCurr = getCurrency(req.fromCurrency);
  const recipientCurr = getCurrency(req.toCurrency);
  const feeAmt = req.amount * req.systemFeeRate;
  const providerFeeAmt = req.receiveAmount * req.systemFeeRate;
  const paymentMemo = req.memo || req.id;

  const canDispute =
    !!req.paymentProof &&
    ['payment_sent', 'payment_confirmed', 'transfer_sent'].includes(req.status);
  const isDetail = variant === 'detail';
  const showProviderPaymentInfo = req.status === 'accepted';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Avatar name={req.providerName} size={42} />
          <div className="flex-1">
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{req.providerName}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{timeAgo(req.createdAt)}</div>
          </div>
          <TxStatusBadge status={req.status} />
        </div>

        {/* Step progress — danh sách tạm ẩn; chi tiết hiện đủ */}
        {['accepted', 'payment_sent', 'payment_confirmed', 'transfer_sent', 'completed'].includes(req.status) &&
          isDetail && (
          <div className="mb-3">
            <StepProgress status={req.status} />
          </div>
        )}

        {/* Amount summary */}
        <div className="rounded-xl p-3 mb-3" style={{ background: '#F9FAFB' }}>
          {/* Country route */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 15 }}>{senderCurr?.flag}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{senderCurr?.name}</span>
            <span style={{ fontSize: 11, color: '#9CA3AF', margin: '0 2px' }}>→</span>
            <span style={{ fontSize: 15 }}>{recipientCurr?.flag}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{recipientCurr?.name}</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p style={{ fontSize: 10, color: '#9CA3AF' }}>Bạn gửi</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{fmt(req.amount, req.fromCurrency)}</p>
              {senderMethod && <MethodBadge currency={req.fromCurrency} methodId={req.senderPaymentMethod} />}
            </div>
            <ArrowRight size={14} color="#9CA3AF" />
            <div className="text-right">
              <p style={{ fontSize: 10, color: '#9CA3AF' }}>Người nhận</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: PRIMARY_REQ }}>{fmt(req.receiveAmount, req.toCurrency)}</p>
              {recipientMethod && <MethodBadge currency={req.toCurrency} methodId={req.recipientPaymentMethod} />}
            </div>
          </div>
          <p style={{ fontSize: 10, color: '#9CA3AF' }}>{fmtRate(req.rate, req.fromCurrency, req.toCurrency)}</p>
        </div>

        {isDetail &&
          ['accepted', 'payment_sent', 'payment_confirmed', 'transfer_sent', 'completed', 'disputed'].includes(req.status) && (
            <TransactionProofSections
              status={req.status}
              paymentProof={req.paymentProof}
              transferProof={req.transferProof}
              labels={{
                payment: 'Bằng chứng thanh toán của bạn',
                transfer: 'Bằng chứng nhà cung cấp đã chuyển tiền',
              }}
            />
          )}

        {/* Provider payment info */}
        {req.status === 'pending' && (
          <div className="rounded-xl mb-3" style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>⏳</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>Chờ nhà cung cấp chấp nhận</p>
              </div>
            </div>
          </div>
        )}
        {showProviderPaymentInfo && (
          <div className="rounded-xl mb-3" style={{ background: '#F0FDF4', border: '1.5px solid #6EE7B7', padding: '8px 10px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#065F46', letterSpacing: 0.4, marginBottom: 6 }}>💳 Bước 1: Gửi tiền cho nhà cung cấp</p>
            <p style={{ fontSize: 13, color: '#065F46', marginBottom: 8 }}>
              Chuyển <strong>{fmt(req.amount, req.fromCurrency)}</strong> qua{' '}
              <strong>{senderMethod?.icon} {senderMethod?.name}</strong> cho{' '}
              <strong>{req.providerName}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <UserRound size={12} color="#059669" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#065F46' }}>{req.providerName}</span>
              </div>
              {senderMethod && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 11, color: '#6B7280' }}>Hình thức thanh toán:</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#047857' }}>{senderMethod.icon} {senderMethod.name}</span>
                </div>
              )}
              {req.providerPaymentAccount && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Phone size={12} color="#059669" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#047857', letterSpacing: 0.4 }}>{req.providerPaymentAccount}</span>
                  </div>
                  <button onClick={() => safeCopy(req.providerPaymentAccount!)} style={{ fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 1 }} title="Sao chép">📋</button>
                </div>
              )}
              {req.providerEmail && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Mail size={12} color="#059669" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#047857' }}>{req.providerEmail}</span>
                  </div>
                  <button onClick={() => safeCopy(req.providerEmail!)} style={{ fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 1 }} title="Sao chép">📋</button>
                </div>
              )}
              {req.providerBank && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Building2 size={12} color="#059669" />
                  <span style={{ fontSize: 11, color: '#374151' }}>{req.providerBank}</span>
                </div>
              )}
              {req.providerBankAccount && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CreditCard size={12} color="#059669" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#047857', letterSpacing: 1 }}>{req.providerBankAccount}</span>
                  </div>
                  <button onClick={() => safeCopy(req.providerBankAccount!)} style={{ fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 1 }} title="Sao chép">📋</button>
                </div>
              )}
              {!req.providerPaymentAccount && !req.providerEmail && !req.providerBank && (() => {
                const autoAcc: ProviderAccount | undefined = PROVIDER_ACCOUNTS_INIT.find(
                  a => a.methodId === req.senderPaymentMethod && a.currency === req.fromCurrency
                );
                return autoAcc ? (
                  <>
                    {autoAcc.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 11, color: '#6B7280' }}>{senderMethod?.name ?? autoAcc.label} account:</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#047857', letterSpacing: 0.4 }}>{autoAcc.phone}</span>
                        </div>
                        <button onClick={() => safeCopy(autoAcc.phone!)} style={{ fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 1 }} title="Sao chép">📋</button>
                      </div>
                    )}
                    {autoAcc.handle && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <UserRound size={12} color="#059669" />
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#047857' }}>{autoAcc.handle}</span>
                        </div>
                        <button onClick={() => safeCopy(autoAcc.handle!)} style={{ fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 1 }} title="Sao chép">📋</button>
                      </div>
                    )}
                    {autoAcc.email && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Mail size={12} color="#059669" />
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#047857' }}>{autoAcc.email}</span>
                        </div>
                        <button onClick={() => safeCopy(autoAcc.email!)} style={{ fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 1 }} title="Sao chép">📋</button>
                      </div>
                    )}
                    {(autoAcc.bankName || autoAcc.accountNumber) && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                          {autoAcc.bankName && <><Building2 size={12} color="#059669" /><span style={{ fontSize: 11, color: '#374151' }}>{autoAcc.bankName}</span></>}
                          {autoAcc.accountNumber && <><CreditCard size={12} color="#059669" /><span style={{ fontSize: 12, fontWeight: 700, color: '#047857', letterSpacing: 1 }}>{autoAcc.accountNumber}</span></>}
                        </div>
                        {autoAcc.accountNumber && <button onClick={() => safeCopy(autoAcc.accountNumber!)} style={{ fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 1 }} title="Sao chép">📋</button>}
                      </div>
                    )}
                    {autoAcc.accountName && <span style={{ fontSize: 10, color: '#6B7280' }}>Chủ TK: {autoAcc.accountName}</span>}
                  </>
                ) : (
                  <div style={{ background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: 8, padding: '5px 8px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>⚠️ Chưa có tài khoản · Liên hệ <span style={{ fontWeight: 700 }}>{req.providerName}</span></p>
                  </div>
                );
              })()}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontSize: 11, color: '#047857' }}>
                  <span style={{ color: '#6B7280' }}>Memo / Nội dung chuyển khoản:</span>{' '}
                  <strong style={{ letterSpacing: 0.3 }}>{paymentMemo}</strong>
                </span>
                <button onClick={() => safeCopy(paymentMemo)} style={{ fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 1 }} title="Sao chép">📋</button>
              </div>
              <p style={{ fontSize: 10, color: '#92400E', background: '#FEF3C7', borderRadius: 5, padding: '4px 7px', marginTop: 4, lineHeight: 1.5 }}>
                ⚠️ Vui lòng điền chính xác <strong>{paymentMemo}</strong> vào ghi chú / memo của giao dịch khi chuyển tiền cho nhà cung cấp.
              </p>
            </div>
          </div>
        )}

        {/* Recipient — danh sách tạm ẩn; chi tiết hiện đủ */}
        {isDetail && (
        <div className="rounded-xl mb-3" style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE' }}>
          <button
            onClick={() => setShowRecipient(v => !v)}
            className="w-full flex items-center justify-between p-3"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <p style={{ fontSize: 10, fontWeight: 700, color: '#1E40AF', letterSpacing: 0.4, margin: 0 }}>👤 NGƯỜI THỤ HƯỞNG</p>
            <ChevronRight size={14} color="#1E40AF" style={{ transform: showRecipient ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>
        {showRecipient && (
            <div className="px-3 pb-3">
              <RecipientDetails
                mode="stacked"
                name={req.recipientName}
                method={recipientMethod}
                phone={req.recipientPhone}
                bank={req.recipientBank}
                account={req.recipientAccount}
                address={req.recipientAddress}
                tone={{
                  title: '#1E40AF',
                  text: '#1D4ED8',
                  muted: '#9CA3AF',
                  label: '#9CA3AF',
                  icon: '#2563EB',
                }}
              />
            </div>
          )}
        </div>
        )}

        {/* Escrow info */}
        {req.escrowLocked && !['completed', 'rejected', 'cancelled'].includes(req.status) && (
          <div className="space-y-2 mb-3">
{/* EscrowBanner phí hệ thống người dùng – đã ẩn */}
            {/* EscrowBanner phí hệ thống nhà cung cấp – ẩn */}
          </div>
        )}

        {/* ── Status-specific actions ─────────────────────── */}

        {/* ACCEPTED: requester needs to send payment */}
        {req.status === 'accepted' && (
          <div className="space-y-3">
            <button
              onClick={() => setShowPaymentUpload(true)}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)`, border: 'none', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 16 }}>📤</span>
              <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>Xác nhận đã gửi tiền & tải bằng chứng</span>
            </button>
          </div>
        )}

        {/* PAYMENT_SENT: waiting for provider */}
        {req.status === 'payment_sent' && req.paymentProof && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#EDE9FE' }}>
              <span style={{ fontSize: 16 }}>⏳</span>
              <p style={{ fontSize: 13, color: '#5B21B6', fontWeight: 600 }}>Chờ nhà cung cấp xác nhận đã nhận tiền...</p>
            </div>
          </div>
        )}

        {/* PAYMENT_CONFIRMED: provider transferring */}
        {req.status === 'payment_confirmed' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }}>
              <span style={{ fontSize: 16 }}>🔄</span>
              <p style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>
                Nhà cung cấp đang chuyển tiền cho <strong>{req.recipientName}</strong> qua {recipientMethod?.icon} {recipientMethod?.name}...
              </p>
            </div>
          </div>
        )}

        {/* TRANSFER_SENT: provider uploaded proof, requester confirms */}
        {req.status === 'transfer_sent' && req.transferProof && (
          <div className="space-y-3">
            <button
              onClick={() => onUpdate({ status: 'completed', completedAt: new Date().toISOString(), escrowLocked: false })}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)`, border: 'none', cursor: 'pointer' }}
            >
              <CheckCircle2 size={16} color="white" />
              <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>
                Đã nhận đủ tiền {req.toCurrency} - Hoàn tất
              </span>
            </button>
          </div>
        )}

        {/* COMPLETED */}
        {req.status === 'completed' && (
          <div className="rounded-xl p-3" style={{ background: '#F0FDF4', border: '1.5px solid #6EE7B7' }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} color="#059669" />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#065F46' }}>🎉 Giao dịch hoàn tất!</p>
            </div>
            <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.7 }}>
              - Phí hệ thống ({(req.systemFeeRate * 100).toFixed(1)}%): {fmt(feeAmt, req.fromCurrency)}<br />
              - Escrow đã được giải phóng
            </p>
          </div>
        )}

        {/* REJECTED */}
        {req.status === 'rejected' && (
          <div className="bg-red-50 rounded-xl p-3 flex items-center gap-2">
            <XCircle size={15} color="#EF4444" />
            <p style={{ fontSize: 13, color: '#991B1B' }}>Nhà cung cấp từ chối. Thử tìm deal khác.</p>
          </div>
        )}

        {/* DISPUTED */}
        {req.status === 'disputed' && req.disputeProof && (
          <div className="space-y-2">
            <div className="rounded-xl p-3" style={{ background: '#FFF7ED', border: '1.5px solid #FCD34D' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9A3412', marginBottom: 4 }}>⚠️ Đang trong quá trình khiếu nại</p>
              <p style={{ fontSize: 12, color: '#92400E' }}>Khiếu nại bởi: {req.disputedBy === 'requester' ? 'Bạn' : req.providerName}</p>
              {req.disputeNote && <p style={{ fontSize: 12, color: '#92400E', marginTop: 4, fontStyle: 'italic' }}>"{req.disputeNote}"</p>}
            </div>
            {isDetail && <ProofCard proof={req.disputeProof} label="📎 Bằng chứng khiếu nại" />}
          </div>
        )}

        {/* Actions row */}
        <div className="flex gap-2 mt-3">
          {req.status === 'pending' && (
            <button onClick={onCancel} className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1" style={{ background: '#FEE2E2', border: 'none', cursor: 'pointer' }}>
              <X size={13} color="#EF4444" />
              <span style={{ color: '#EF4444', fontSize: 13, fontWeight: 600 }}>Hủy yêu cầu</span>
            </button>
          )}
          {canDispute && (
            <button
              onClick={() => setShowDisputeModal(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl"
              style={{ background: '#FFF7ED', border: '1.5px solid #FCD34D', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 13 }}>⚠️</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#D97706' }}>Khiếu Nại</span>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPaymentUpload && (
          <ProofModal
            title="Xác nhận đã gửi tiền"
            subtitle={`Tải lên bằng chứng bạn đã gửi ${fmt(req.amount, req.fromCurrency)} qua ${senderMethod?.name}`}
            allowedTypes={[req.senderPaymentMethod, 'bank_transfer', 'photo']}
            onConfirm={(proof: ProofData) => {
              onUpdate({ status: 'payment_sent', paymentProof: proof });
              setShowPaymentUpload(false);
            }}
            onClose={() => setShowPaymentUpload(false)}
          />
        )}
        {showDisputeModal && (
          <ProofModal
            title="Khiếu nại giao dịch"
            subtitle="Mô tả vấn đề và đính kèm bằng chứng"
            allowedTypes={['photo', 'bank_transfer', 'paypal', 'zelle', 'venmo', 'momo']}
            isDispute
            onConfirm={(proof: ProofData) => {
              onUpdate({
                status: 'disputed',
                disputedBy: 'requester',
                disputeNote: proof.note,
                disputeProof: proof,
                disputedAt: new Date().toISOString(),
              });
              setShowDisputeModal(false);
            }}
            onClose={() => setShowDisputeModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MyRequestsTab({ requests, onUpdate, onCancel, initialFilter = 'active', onOpenDetail, onFilterChange }: {
  requests: DealRequest[];
  onUpdate: (id: string, partial: Partial<DealRequest>) => void;
  onCancel: (id: string) => void;
  initialFilter?: ReqFilter;
  onOpenDetail: (requestId: string) => void;
  onFilterChange: (filter: ReqFilter) => void;
}) {
  const [filter, setFilter] = useState<ReqFilter>(initialFilter);
  useEffect(() => {
    onFilterChange(filter);
  }, [filter, onFilterChange]);

  const ACTIVE_STATUSES = ['accepted', 'payment_sent', 'payment_confirmed', 'transfer_sent'];
  const filterMap: Record<ReqFilter, (r: DealRequest) => boolean> = {
    active:    r => ACTIVE_STATUSES.includes(r.status),
    pending:   r => r.status === 'pending',
    completed: r => r.status === 'completed',
    other:     r => ['rejected', 'cancelled', 'disputed'].includes(r.status),
  };
  const filtered = requests.filter(filterMap[filter]);
  const activeCount = requests.filter(filterMap.active).length;
  const pendingCount = requests.filter(filterMap.pending).length;

  const FILTER_LABELS: Record<ReqFilter, string> = {
    active:    `Đang xử lý${activeCount ? ` (${activeCount})` : ''}`,
    pending:   `Chờ duyệt${pendingCount ? ` (${pendingCount})` : ''}`,
    completed: 'Hoàn thành',
    other:     'Từ chối/Khiếu nại',
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 pt-12 pb-4" style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)` }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>Yêu cầu của tôi</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>Theo dõi trạng thái chuyển tiền</p>
      </div>
      <div className="flex gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto">
        {(['active', 'pending', 'completed', 'other'] as ReqFilter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ background: filter === f ? PRIMARY_REQ : '#F3F4F6', color: filter === f ? 'white' : '#6B7280', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-3">
        {filtered.map(req => (
          <div key={req.id}>
            <RequestCard
              req={req}
              onUpdate={partial => onUpdate(req.id, partial)}
              onCancel={() => onCancel(req.id)}
            />
            <button
              onClick={() => onOpenDetail(req.id)}
              className="w-full py-2 rounded-xl flex items-center justify-center gap-1 mt-2"
              style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', cursor: 'pointer' }}
            >
              <ChevronRight size={14} color={PRIMARY_REQ} />
              <span style={{ color: PRIMARY_REQ, fontSize: 12, fontWeight: 700 }}>Xem chi tiết giao dịch</span>
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <Inbox size={44} color="#E5E7EB" />
            <p style={{ color: '#9CA3AF', marginTop: 10, fontSize: 15 }}>Chưa có yêu cầu nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RequesterTransactionDetailScreen({
  request,
  onUpdateRequest,
  onCancelRequest,
  onBack,
}: {
  request: DealRequest | null;
  onUpdateRequest: (id: string, partial: Partial<DealRequest>) => void;
  onCancelRequest: (id: string) => void;
  onBack: () => void;
}) {
  if (!request) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-12 pb-4" style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)` }}>
          <button onClick={onBack} className="flex items-center gap-1 mb-3" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>
            <ChevronLeft size={18} />
            <span style={{ fontSize: 14 }}>Quay lại danh sách</span>
          </button>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>Chi tiết giao dịch</h1>
        </div>
        <div className="px-4 py-8 text-center" style={{ color: '#9CA3AF' }}>
          Giao dịch không tồn tại hoặc đã thay đổi trạng thái.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 pt-12 pb-4" style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)` }}>
        <button onClick={onBack} className="flex items-center gap-1 mb-3" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>
          <ChevronLeft size={18} />
          <span style={{ fontSize: 14 }}>Quay lại danh sách</span>
        </button>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>Chi tiết giao dịch</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>Theo dõi trạng thái và thao tác giao dịch đã chọn</p>
      </div>
      <div className="px-4 py-4">
        <RequestCard
          req={request}
          onUpdate={partial => onUpdateRequest(request.id, partial)}
          onCancel={() => onCancelRequest(request.id)}
          variant="detail"
        />
      </div>
    </div>
  );
}

// ============================================================
// Profile Tab
// ============================================================
type AccountFormView = "list" | "form";

function PaymentAccountsModal({
  accounts,
  onSave,
  onClose,
  inline = false,
}: {
  accounts: ProviderAccount[];
  onSave: (accounts: ProviderAccount[]) => void;
  onClose: () => void;
  inline?: boolean;
}) {
  const [view, setView] = useState<AccountFormView>("list");
  const [editTarget, setEditTarget] = useState<ProviderAccount | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [form, setForm] = useState<Partial<ProviderAccount>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const openAdd = () => {
    setCurrency("USD");
    setForm({ currency: "USD" });
    setEditTarget(null);
    setView("form");
  };
  const openEdit = (acc: ProviderAccount) => {
    setCurrency(acc.currency);
    setForm({ ...acc });
    setEditTarget(acc);
    setView("form");
  };
  const handleDelete = (id: string) =>
    {
      if (!window.confirm("Xoá tài khoản này?")) return;
      onSave(accounts.filter((a) => a.id !== id));
    };
  const handleSave = () => {
    if (!form.methodId || !form.label) return;
    if (editTarget) {
      onSave(
        accounts.map((a) =>
          a.id === editTarget.id
            ? ({ ...a, ...form, currency } as ProviderAccount)
            : a,
        ),
      );
    } else {
      onSave([
        ...accounts,
        {
          id: `pa${Date.now()}`,
          methodId: form.methodId!,
          currency,
          label: form.label!,
          phone: form.phone,
          email: form.email,
          handle: form.handle,
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          accountName: form.accountName,
        },
      ]);
    }
    setView("list");
  };
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const selectedMethod = form.methodId
    ? getPaymentMethod(currency, form.methodId)
    : undefined;
  const grouped: Record<string, ProviderAccount[]> = {};
  accounts.forEach((a) => {
    if (!grouped[a.currency]) grouped[a.currency] = [];
    grouped[a.currency].push(a);
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1.5px solid #E5E7EB",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    color: "#111827",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div className={inline ? "flex-1 overflow-y-auto bg-gray-50 flex flex-col" : "absolute inset-0 z-50 bg-gray-50 flex flex-col"}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-4 bg-white border-b border-gray-100">
        <button
          onClick={view === "list" ? onClose : () => setView("list")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            display: "flex",
          }}
        >
          {view === "list" ? (
            <X size={22} color="#374151" />
          ) : (
            <ChevronLeft size={22} color="#374151" />
          )}
        </button>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#111827",
            flex: 1,
            textAlign: "center",
            marginRight: 30,
          }}
        >
          {view === "list"
            ? "Tài khoản liên kết"
            : editTarget
              ? "Chỉnh sửa tài khoản"
              : "Thêm tài khoản"}
        </h2>
      </div>

      {view === "list" ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div
            className="rounded-2xl p-4 border"
            style={{ background: "#ECFDF5", borderColor: "#BBF7D0" }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, color: "#065F46" }}>
              Tài khoản nhận tiền
            </p>
            <p style={{ fontSize: 13, color: "#047857", marginTop: 4 }}>
              Quản lý tài khoản đã lưu, thêm mới hoặc sửa thông tin để dùng nhanh khi tạo yêu cầu.
            </p>
            <div className="flex gap-2 flex-wrap mt-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "white", color: "#047857" }}>
                {accounts.length} tài khoản
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "white", color: "#047857" }}>
                {Object.keys(grouped).length} loại tiền
              </span>
            </div>
          </div>

          {Object.keys(grouped).length === 0 && (
            <div className="flex flex-col items-center py-12">
              <Wallet size={44} color="#E5E7EB" />
              <p style={{ color: "#9CA3AF", marginTop: 10, fontSize: 15 }}>
                Chưa có tài khoản nào
              </p>
              <p style={{ color: "#D1D5DB", fontSize: 13, marginTop: 4 }}>
                Thêm tài khoản để nhận thanh toán
              </p>
            </div>
          )}
          {Object.entries(grouped).map(([cur, accs]) => {
            const ci = getCurrency(cur);
            return (
              <div key={cur}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6B7280",
                    marginBottom: 8,
                  }}
                >
                  {ci?.flag} {ci?.name} ({cur})
                </p>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {accs.map((acc, i) => {
                    const m = getPaymentMethod(cur, acc.methodId);
                    const detail =
                      acc.handle ||
                      acc.phone ||
                      acc.email ||
                      acc.accountNumber ||
                      "";
                    const subDetail = acc.bankName
                      ? `${acc.bankName}${acc.accountName ? ` · ${acc.accountName}` : ""}`
                      : "";
                    return (
                      <div
                        key={acc.id}
                        className="px-4 py-3"
                        style={{
                          borderBottom:
                            i < accs.length - 1 ? "1px solid #F3F4F6" : "none",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "#ECFDF5", fontSize: 20 }}
                          >
                            {m?.icon || "💳"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#111827",
                              }}
                            >
                              {acc.label}
                            </p>
                            {detail && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <p
                                  style={{
                                    fontSize: 12,
                                    color: "#6B7280",
                                    wordBreak: "break-all",
                                  }}
                                >
                                  {detail}
                                </p>
                                <button
                                  onClick={() =>
                                    handleCopy(detail, acc.id + "d")
                                  }
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 2,
                                    flexShrink: 0,
                                  }}
                                >
                                  {copied === acc.id + "d" ? (
                                    <Check size={12} color="#059669" />
                                  ) : (
                                    <Copy size={12} color="#9CA3AF" />
                                  )}
                                </button>
                              </div>
                            )}
                            {subDetail && (
                              <p
                                style={{
                                  fontSize: 11,
                                  color: "#9CA3AF",
                                  marginTop: 1,
                                }}
                              >
                                {subDetail}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => openEdit(acc)}
                              style={{
                                background: "#F3F4F6",
                                border: "none",
                                borderRadius: 8,
                                padding: "6px 8px",
                                cursor: "pointer",
                                display: "flex",
                              }}
                            >
                              <Edit2 size={14} color="#6B7280" />
                            </button>
                            <button
                              onClick={() => handleDelete(acc.id)}
                              style={{
                                background: "#FEE2E2",
                                border: "none",
                                borderRadius: 8,
                                padding: "6px 8px",
                                cursor: "pointer",
                                display: "flex",
                              }}
                            >
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
          <button
            onClick={openAdd}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
            style={{
              background: "#ECFDF5",
              border: "2px dashed #93C5FD",
              cursor: "pointer",
            }}
          >
            <Plus size={18} color={PRIMARY_REQ} />
            <span style={{ fontSize: 14, fontWeight: 600, color: PRIMARY_REQ }}>
              Thêm tài khoản mới
            </span>
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Currency */}
          <div>
            <label style={labelStyle}>Loại tiền tệ</label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => {
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setForm((f) => ({
                        ...f,
                        currency: c.code,
                        methodId: undefined,
                      }));
                    }}
                    className="px-3 py-2 rounded-xl"
                    style={{
                      background: currency === c.code ? "#ECFDF5" : "#F9FAFB",
                      border: `2px solid ${currency === c.code ? PRIMARY_REQ : "#E5E7EB"}`,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: currency === c.code ? 700 : 400,
                        color: currency === c.code ? PRIMARY_REQ : "#374151",
                      }}
                    >
                      {c.flag} {c.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Method */}
          <div>
            <label style={labelStyle}>Hình thức thanh toán</label>
            <div className="flex flex-wrap gap-2">
              {(PAYMENT_METHODS_BY_CURRENCY[currency] ?? [])
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setForm((f) => ({ ...f, methodId: m.id }))}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                    style={{
                      background:
                        form.methodId === m.id ? "#ECFDF5" : "#F9FAFB",
                      border: `2px solid ${form.methodId === m.id ? PRIMARY_REQ : "#E5E7EB"}`,
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{m.icon}</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: form.methodId === m.id ? 700 : 400,
                        color: form.methodId === m.id ? PRIMARY_REQ : "#374151",
                      }}
                    >
                      {m.name}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <label style={labelStyle}>Tên gợi nhớ</label>
            <input
              value={form.label || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, label: e.target.value }))
              }
              placeholder="Ví dụ: Zelle chính, PayPal cá nhân..."
              style={inputStyle}
            />
          </div>

          {/* Dynamic fields */}
          {selectedMethod && (
            <div
              className="space-y-3 p-4 rounded-2xl"
              style={{ background: "#F8FAFF", border: "1.5px solid #DBEAFE" }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: PRIMARY_REQ,
                  marginBottom: 4,
                }}
              >
                📋 Thông tin tài khoản
              </p>

              {selectedMethod.id === "venmo" && (
                <div>
                  <label style={labelStyle}>Venmo username</label>
                  <input
                    value={form.handle || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, handle: e.target.value }))
                    }
                    placeholder="@username"
                    style={inputStyle}
                  />
                </div>
              )}
              {selectedMethod.requiresPhone &&
                selectedMethod.id !== "venmo" && (
                  <div>
                    <label style={labelStyle}>
                      Số điện thoại / Email liên kết
                    </label>
                    <input
                      value={form.phone || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="+1 (xxx) xxx-xxxx hoặc email"
                      style={inputStyle}
                    />
                  </div>
                )}
              {!selectedMethod.requiresPhone &&
                !selectedMethod.requiresAccount && (
                  <div>
                    <label style={labelStyle}>Email tài khoản</label>
                    <input
                      value={form.email || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="email@example.com"
                      style={inputStyle}
                    />
                  </div>
                )}
              {selectedMethod.requiresAccount && (
                <>
                  <div>
                    <label style={labelStyle}>Tên ngân hàng</label>
                    <input
                      value={form.bankName || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, bankName: e.target.value }))
                      }
                      placeholder="Chase, Bank of America, Wells Fargo, SEPA..."
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Số tài khoản / IBAN / Routing
                    </label>
                    <input
                      value={form.accountNumber || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          accountNumber: e.target.value,
                        }))
                      }
                      placeholder="Số tài khoản hoặc IBAN"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Tên chủ tài khoản</label>
                    <input
                      value={form.accountName || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, accountName: e.target.value }))
                      }
                      placeholder="Tên đầy đủ"
                      style={inputStyle}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!form.methodId || !form.label}
            className="w-full py-4 rounded-2xl"
            style={{
              background: form.methodId && form.label ? PRIMARY_REQ : "#E5E7EB",
              border: "none",
              color: form.methodId && form.label ? "white" : "#9CA3AF",
              fontSize: 15,
              fontWeight: 700,
              cursor: form.methodId && form.label ? "pointer" : "not-allowed",
            }}
            >
            {editTarget ? "Cập nhật tài khoản" : "Lưu tài khoản"}
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileTabReq({
  onRoleChange,
  onOpenAccounts,
}: {
  onRoleChange: () => void;
  onOpenAccounts: () => void;
}) {

  const menuItems = [
    { icon: <Wallet size={18} color={PRIMARY_REQ} />, label: 'Tài khoản liên kết', bg: '#F0FDF4', onClick: onOpenAccounts },
    { icon: <History size={18} color="#2563EB" />, label: 'Lịch sử giao dịch', bg: '#EFF6FF' },
    { icon: <Settings size={18} color="#6B7280" />, label: 'Cài đặt thông báo', bg: '#F9FAFB' },
    { icon: <RefreshCw size={18} color="#D97706" />, label: 'Bảo mật & xác thực', bg: '#FFFBEB' },
  ];
  return (
    <div className="flex-1 overflow-y-auto relative">
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)` }} className="px-5 pt-12 pb-12 relative overflow-hidden">

        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="flex flex-col items-center relative z-10">
          <div className="relative mb-3">
            <Avatar name="Nguyễn Văn A" size={80} />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-300 border-2 border-white flex items-center justify-center">
              <BadgeCheck size={14} color="white" />
            </div>
          </div>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>Nguyễn Văn A</h2>
          <div className="flex items-center gap-1 mt-2">
            <Star size={14} color="#FCD34D" fill="#FCD34D" />
            <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>4.7</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>(12 đánh giá)</span>
          </div>
        </div>
      </div>
      <div className="px-4 -mt-6 relative z-10 pb-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'Giao dịch', value: '12', color: PRIMARY_REQ }, { label: 'Tháng này', value: '3', color: '#2563EB' }, { label: 'Tỷ lệ HT', value: '92%', color: '#D97706' }].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm text-center border border-gray-100">
              <p style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, i) => (
            <button key={i} onClick={item.onClick} className="w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50" style={{ borderBottom: i < menuItems.length - 1 ? '1px solid #F3F4F6' : 'none', background: 'none', border: 'none', cursor: 'pointer', borderBottomWidth: i < menuItems.length - 1 ? 1 : 0, borderBottomColor: '#F3F4F6', borderBottomStyle: 'solid' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>{item.icon}</div>
              <span style={{ fontSize: 15, color: '#111827', fontWeight: 500, flex: 1, textAlign: 'left' }}>{item.label}</span>
              <ChevronRight size={16} color="#D1D5DB" />
            </button>
          ))}
        </div>
        <div className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl" style={{ background: '#F0FDF4', border: '1px dashed #6EE7B7' }}>
          <ArrowLeftRight size={15} color="#059669" />
          <span style={{ color: '#047857', fontSize: 13, fontWeight: 600 }}>← Xem Nhà cung cấp ở khung bên trái</span>
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
function BottomNavReq({ tab, onTab, pendingCount }: { tab: Tab; onTab: (t: Tab) => void; pendingCount: number }) {
  const items: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'home', icon: <Home size={22} />, label: 'Gửi tiền' },
    { key: 'requests', icon: <Bell size={22} />, label: 'Yêu cầu' },
    { key: 'accounts', icon: <Wallet size={22} />, label: 'Liên kết' },
    { key: 'profile', icon: <User size={22} />, label: 'Hồ sơ' },
  ];
  return (
    <div className="flex items-center border-t border-gray-100 bg-white px-2" style={{ paddingBottom: 8 }}>
      {items.map(item => (
        <button key={item.key} onClick={() => onTab(item.key)} className="flex-1 flex flex-col items-center py-3 gap-1 relative" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ color: tab === item.key ? PRIMARY_REQ : '#9CA3AF' }}>{item.icon}</div>
          <span style={{ fontSize: 10, color: tab === item.key ? PRIMARY_REQ : '#9CA3AF', fontWeight: tab === item.key ? 700 : 400 }}>{item.label}</span>
          {item.key === 'requests' && pendingCount > 0 && (
            <div className="absolute top-2 right-1/4 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center" style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>{pendingCount}</div>
          )}
          {tab === item.key && (
            <motion.div layoutId="req-indicator" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full" style={{ background: PRIMARY_REQ }} />
          )}
        </button>
      ))}
    </div>
  );
}

export function RequesterApp({ onRoleChange, availableDeals, myRequests, onSubmitRequest, onCancelRequest, onUpdateRequest }: {
  accounts?: ProviderAccount[];

  onRoleChange: () => void;
  availableDeals: Deal[];
  myRequests: DealRequest[];
  onSubmitRequest: (req: DealRequest) => void;
  onCancelRequest: (id: string) => void;
  onUpdateRequest: (id: string, partial: Partial<DealRequest>) => void;
}) {
  const [accounts, setAccounts] = useState<ProviderAccount[]>(REQUESTER_ACCOUNTS_INIT);
  const [tab, setTab] = useState<Tab>('home');
  const [requestsViewMode, setRequestsViewMode] = useState<RequestsViewMode>('list');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [reqTabKey, setReqTabKey] = useState(0);
  const [reqInitFilter, setReqInitFilter] = useState<ReqFilter>('active');
  const pendingCount = myRequests.filter(r => r.status === 'pending').length;
  const selectedRequest = selectedRequestId
    ? myRequests.find(r => r.id === selectedRequestId) ?? null
    : null;
  const handleTabChange = (nextTab: Tab) => {
    setTab(nextTab);
    if (nextTab !== 'requests') {
      setRequestsViewMode('list');
      setSelectedRequestId(null);
    }
  };
  const openRequestDetail = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRequestsViewMode('detail');
    setTab('requests');
  };
  useEffect(() => {
    if (requestsViewMode === 'detail' && selectedRequestId && !selectedRequest) {
      setRequestsViewMode('list');
      setSelectedRequestId(null);
    }
  }, [requestsViewMode, selectedRequestId, selectedRequest]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex-1 overflow-hidden flex flex-col">
          {tab === 'home' && (
            <HomeTab
              accounts={accounts}
              onAccountsChange={setAccounts}
              onRequestSent={req => { onSubmitRequest(req); setReqInitFilter('pending'); setReqTabKey(k => k + 1); setRequestsViewMode('list'); setTab('requests'); }}
              availableDeals={availableDeals}
            />
          )}
          {tab === 'requests' && (
            requestsViewMode === 'list' ? (
              <MyRequestsTab
                key={reqTabKey}
                requests={myRequests}
                onUpdate={onUpdateRequest}
                onCancel={onCancelRequest}
                initialFilter={reqInitFilter}
                onOpenDetail={openRequestDetail}
                onFilterChange={setReqInitFilter}
              />
            ) : (
              <RequesterTransactionDetailScreen
                request={selectedRequest}
                onUpdateRequest={onUpdateRequest}
                onCancelRequest={onCancelRequest}
                onBack={() => setRequestsViewMode('list')}
              />
            )
          )}
          {tab === 'accounts' && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-5 pt-12 pb-4" style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)` }}>
                <button onClick={() => setTab('profile')} className="flex items-center gap-1 mb-3" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>
                  <ChevronLeft size={18} />
                  <span style={{ fontSize: 14 }}>Quay lại hồ sơ</span>
                </button>
                <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>Tài khoản liên kết</h1>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>Thêm, sửa hoặc xoá tài khoản nhận tiền</p>
              </div>
              <PaymentAccountsModal
                inline
                accounts={accounts}
                onSave={setAccounts}
                onClose={() => setTab('profile')}
              />
            </div>
          )}
          {tab === 'profile' && (
            <ProfileTabReq
              onRoleChange={onRoleChange}
              onOpenAccounts={() => setTab('accounts')}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <BottomNavReq tab={tab} onTab={handleTabChange} pendingCount={pendingCount} />
    </div>
  );
}
