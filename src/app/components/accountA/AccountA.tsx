import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Bell, User, ArrowRight, BadgeCheck,
  ChevronRight, X, ArrowLeftRight, LogOut,
  CheckCircle2, XCircle, Inbox, Wallet, History, Settings,
  Star, Send, RefreshCw, ChevronLeft, Zap,
  UserRound, Phone, Building2, CreditCard, ArrowDown, MapPin, Mail,
  Check, Copy, Plus, Edit2, Trash2, Search, 
  BriefcaseBusiness,
} from 'lucide-react';
import {
  CURRENCIES, getCurrency, formatVND, formatAmount, timeAgo,
  getAvatarBg, getInitials,
  getPaymentMethodsByCurrency, getPaymentMethod,
  type Deal, type DealRequest, type PaymentMethod, type ProofData,
  type ProviderAccount, PROVIDER_ACCOUNTS_INIT_FROM_BENEFICIARY, REQUESTER_ACCOUNTS_INIT_FROM_BENEFICIARY, REQUESTER_DEALS_A_INIT,
} from '../../data/mockData';
import { ProofModal, ProofCard, EscrowBanner, StepProgress, TransactionProofSections } from '../shared/ProofModal';
import { RecipientDetails } from '../shared/RecipientDetails';
import { MethodIcon } from '../shared/MethodIcon';
import { AppBottomNav, OverviewScreen, type AppTab } from '../shared/AppNavigation';
import { ManageDealsTab } from '../shared/DealManagement';
import { TransactionHistoryTab } from '../shared/TransactionHistory';
import { PaymentAccountsTab } from '../shared/PaymentAccountsTab';
import { DealSearchTab } from '../shared/DealSearchTab';

type Tab = AppTab;
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
    pending:     { label: 'Chờ chấp nhận',  bg: '#FEF3C7', color: '#92400E' },
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

// ============================================================
// My Requests Tab – Full Escrow Flow
// ============================================================
type ReqFilter = 'active' | 'pending' | 'completed' | 'other';

const STATUS_CFG: Record<string, { label: string; bg: string; color: string }> = {
  pending:        { label: 'Chờ chấp nhận', bg: '#FEF3C7', color: '#92400E' },
  waiting_accept: { label: 'Chờ chấp nhận', bg: '#DBEAFE', color: '#1E40AF' },
  processing:     { label: 'Đang xử lý',    bg: '#EDE9FE', color: '#5B21B6' },
  completed:      { label: 'Hoàn thành',    bg: '#D1FAE5', color: '#065F46' },
  rejected:       { label: 'Từ chối',       bg: '#FEE2E2', color: '#991B1B' },
  cancelled:      { label: 'Đã hủy',        bg: '#F3F4F6', color: '#4B5563' },
  disputed:       { label: 'Khiếu nại',     bg: '#FFF7ED', color: '#9A3412' },
};

function TxStatusBadge({ status }: { status: string }) {
  const s = STATUS_CFG[status] ?? { label: status, bg: '#F3F4F6', color: '#4B5563' };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function MethodBadge({ currency, methodId }: { currency: string; methodId: string }) {
  const m = getPaymentMethod(currency, methodId);
  if (!m) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
      <MethodIcon id={m.id} icon={m.icon} size={13} />
      <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{m.name}</span>
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
  const isWaitingAccept = req.status === 'pending' || req.status === 'waiting_accept';
  const [showRecipient, setShowRecipient] = useState(
    variant === 'detail' || isWaitingAccept,
  );
  const senderMethod = getPaymentMethod(req.fromCurrency, req.senderPaymentMethod);
  const recipientMethod = getPaymentMethod(req.toCurrency, req.recipientPaymentMethod);
  const senderCurr = getCurrency(req.fromCurrency);
  const recipientCurr = getCurrency(req.toCurrency);
  const feeAmt = req.amount * req.systemFeeRate;
  const paymentMemo = req.memo || req.id;

  const isProcessing = req.status === 'processing';
  const hasMyProof = !!req.requesterProof;
  const hasCounterpartyProof = !!req.providerProof;
  const canUploadProof = isProcessing && !hasMyProof;
  const canConfirmReceived = isProcessing && hasCounterpartyProof && !req.requesterConfirmedReceived;
  const canDispute = isProcessing && hasMyProof;
  const showProviderPaymentInfo = isProcessing;
  const isDetail = variant === 'detail';

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
        {['processing', 'completed', 'disputed'].includes(req.status) && isDetail && (
          <div className="mb-3">
            <StepProgress
              status={req.status}
              hasRequesterProof={hasMyProof}
              hasProviderProof={hasCounterpartyProof}
              requesterConfirmed={!!req.requesterConfirmedReceived}
              providerConfirmed={!!req.providerConfirmedReceived}
            />
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
              <p style={{ fontSize: 10, color: '#9CA3AF' }}>Gửi qua</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{fmt(req.amount, req.fromCurrency)}</p>
              {senderMethod && <MethodBadge currency={req.fromCurrency} methodId={req.senderPaymentMethod} />}
            </div>
            <ArrowRight size={14} color="#9CA3AF" />
            <div className="text-right">
              <p style={{ fontSize: 10, color: '#9CA3AF' }}>Nhận qua</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: PRIMARY_REQ }}>{fmt(req.receiveAmount, req.toCurrency)}</p>
              {recipientMethod && <MethodBadge currency={req.toCurrency} methodId={req.recipientPaymentMethod} />}
            </div>
          </div>
          <p style={{ fontSize: 10, color: '#9CA3AF' }}>{fmtRate(req.rate, req.fromCurrency, req.toCurrency)}</p>
        </div>

        {isDetail && ['processing', 'completed', 'disputed'].includes(req.status) && (
            <TransactionProofSections
              status={req.status}
              paymentProof={req.requesterProof}
              transferProof={req.providerProof}
              labels={{
                payment: 'Bằng chứng của bạn (đã gửi)',
                transfer: 'Bằng chứng bên Tran *** B (view-only)',
              }}
            />
          )}

        {/* Provider payment info */}
        {isWaitingAccept && (
          <div className="rounded-xl mb-3" style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>⏳</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>Chờ người tạo deal chấp nhận</p>
              </div>
            </div>
          </div>
        )}
        {showProviderPaymentInfo && (
          <div className="rounded-xl mb-3" style={{ background: '#F0FDF4', border: '1.5px solid #6EE7B7', padding: '8px 10px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#065F46', letterSpacing: 0.4, marginBottom: 6 }}>💳 Bước 1: Gửi tiền cho người tạo deal</p>
            <p style={{ fontSize: 13, color: '#065F46', marginBottom: 8, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
              Chuyển <strong>{fmt(req.amount, req.fromCurrency)}</strong> qua
              {senderMethod && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><MethodIcon id={senderMethod.id} icon={senderMethod.icon} size={14} /><strong>{senderMethod.name}</strong></span>}
              cho <strong>{req.providerName}</strong>
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
                const autoAcc: ProviderAccount | undefined = PROVIDER_ACCOUNTS_INIT_FROM_BENEFICIARY.find(
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
                ⚠️ Vui lòng điền chính xác <strong>{paymentMemo}</strong> vào ghi chú / memo của giao dịch khi chuyển tiền cho người tạo deal.
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
            {/* EscrowBanner phí hệ thống người tạo deal – ẩn */}
          </div>
        )}

        {/* ── Status-specific actions (parallel flow) ──────── */}

        {/* PROCESSING — Case 02/03/04/05 */}
        {isProcessing && (
          <div className="space-y-3">
            {/* Case 02 & 03: mình chưa upload — nút upload nổi bật */}
            {canUploadProof && (
              <button
                onClick={() => setShowPaymentUpload(true)}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)`, border: 'none', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 16 }}>📤</span>
                <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>Upload bằng chứng chuyển tiền</span>
              </button>
            )}

            {/* Case 04: mình đã upload, bên Tran *** B chưa — chờ */}
            {hasMyProof && !hasCounterpartyProof && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#EDE9FE' }}>
                <span style={{ fontSize: 16 }}>⏳</span>
                <p style={{ fontSize: 13, color: '#5B21B6', fontWeight: 600 }}>Chờ bên Tran *** B upload bằng chứng...</p>
              </div>
            )}

            {/* Case 05: cả hai đã upload — xác nhận nhận tiền */}
            {canConfirmReceived && (
              <button
                onClick={() => {
                  const next: Partial<typeof req> = { requesterConfirmedReceived: true };
                  if (req.providerConfirmedReceived) {
                    next.status = 'completed';
                    next.completedAt = new Date().toISOString();
                    next.escrowLocked = false;
                  }
                  onUpdate(next);
                }}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)`, border: 'none', cursor: 'pointer' }}
              >
                <CheckCircle2 size={16} color="white" />
                <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>
                  Xác nhận đã nhận đủ tiền {req.toCurrency}
                </span>
              </button>
            )}

            {/* Đã xác nhận, chờ bên Tran *** B */}
            {req.requesterConfirmedReceived && !req.providerConfirmedReceived && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#D1FAE5', border: '1px solid #6EE7B7' }}>
                <CheckCircle2 size={15} color="#059669" />
                <p style={{ fontSize: 13, color: '#065F46', fontWeight: 600 }}>Bạn đã xác nhận — chờ bên Tran *** B xác nhận...</p>
              </div>
            )}
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
            <p style={{ fontSize: 13, color: '#991B1B' }}>Người tạo deal từ chối. Thử tìm deal khác.</p>
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
          {isWaitingAccept && (
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
            title="Upload bằng chứng chuyển tiền"
            subtitle={`Tải lên bằng chứng bạn đã gửi ${fmt(req.amount, req.fromCurrency)} qua ${senderMethod?.name}`}
            onConfirm={(proof: ProofData) => {
              onUpdate({ requesterProof: proof });
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

function MyRequestsTab({ requests, onUpdate, onCancel, initialFilter = 'active', onOpenDetail, onFilterChange, title = 'Yêu cầu của tôi', subtitle = 'Theo dõi trạng thái chuyển tiền' }: {
  requests: DealRequest[];
  onUpdate: (id: string, partial: Partial<DealRequest>) => void;
  onCancel: (id: string) => void;
  initialFilter?: ReqFilter;
  onOpenDetail: (requestId: string) => void;
  onFilterChange: (filter: ReqFilter) => void;
  title?: string;
  subtitle?: string;
}) {
  const [filter, setFilter] = useState<ReqFilter>(initialFilter);
  useEffect(() => {
    onFilterChange(filter);
  }, [filter, onFilterChange]);

  const ACTIVE_STATUSES = ['processing'];
  const filterMap: Record<ReqFilter, (r: DealRequest) => boolean> = {
    active:    r => ACTIVE_STATUSES.includes(r.status),
    pending:   r => r.status === 'pending' || r.status === 'waiting_accept',
    completed: r => r.status === 'completed',
    other:     r => ['rejected', 'cancelled', 'disputed'].includes(r.status),
  };
  const filtered = requests.filter(filterMap[filter]);
  const activeCount = requests.filter(filterMap.active).length;
  const pendingCount = requests.filter(filterMap.pending).length;

  const FILTER_LABELS: Record<ReqFilter, string> = {
    active:    `Đang xử lý${activeCount ? ` (${activeCount})` : ''}`,
    pending:   `Chờ chấp nhận${pendingCount ? ` (${pendingCount})` : ''}`,
    completed: 'Hoàn thành',
    other:     'Từ chối/Khiếu nại',
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 pt-12 pb-4" style={{ background: `linear-gradient(135deg, ${PRIMARY_REQ}, #047857)` }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>{title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>{subtitle}</p>
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
            ? "Tài khoản nhận"
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
              {getPaymentMethodsByCurrency(currency)
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
          <span style={{ color: '#047857', fontSize: 13, fontWeight: 600 }}>← Xem B ở khung bên trái</span>
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
  return <AppBottomNav tab={tab} onTab={onTab} accent={PRIMARY_REQ} />;
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
  const [accounts, setAccounts] = useState<ProviderAccount[]>(REQUESTER_ACCOUNTS_INIT_FROM_BENEFICIARY);
  const [deals, setDeals] = useState<Deal[]>(REQUESTER_DEALS_A_INIT);
  const [tab, setTab] = useState<Tab>('overview');
  const [requestsViewMode, setRequestsViewMode] = useState<RequestsViewMode>('list');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const selectedRequest = selectedRequestId
    ? myRequests.find(r => r.id === selectedRequestId) ?? null
    : null;
  const handleTabChange = (nextTab: Tab) => {
    setTab(nextTab);
    if (nextTab !== 'history') {
      setRequestsViewMode('list');
      setSelectedRequestId(null);
    }
  };
  const openRequestDetail = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRequestsViewMode('detail');
    setTab('history');
  };
  const processingRequests = myRequests.filter(r =>
    ['pending', 'waiting_accept', 'processing'].includes(r.status),
  );
  const recentHistory = [...myRequests]
    .filter(r => ['completed', 'rejected', 'cancelled'].includes(r.status))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
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
          {tab === 'overview' && (
            <OverviewScreen
              accent={PRIMARY_REQ}
              processingRequests={processingRequests}
              hotDeals={availableDeals}
              recentHistory={recentHistory}
              onOpenDeal={() => setTab('findDeals')}
              onOpenHistory={(request) => {
                setSelectedRequestId(request.id);
                setRequestsViewMode('detail');
                setTab('history');
              }}
            />
          )}
          {tab === 'findDeals' && (
            <DealSearchTab
              accounts={accounts}
              onAccountsChange={setAccounts}
              displayName="Nguyễn Văn A"
              onRequestSent={req => {
                onSubmitRequest(req);
                setSelectedRequestId(req.id);
                setRequestsViewMode('detail');
                setTab('history');
              }}
              availableDeals={availableDeals}
            />
          )}
          {tab === 'manageDeals' && (
            <ManageDealsTab
              title='Quản lý deals'
              deals={deals}
              requests={myRequests}
              accounts={accounts}
              onDealsChange={setDeals}
              onAccountsChange={setAccounts}
              ownerName='Nguyễn Văn A'
              accent={PRIMARY_REQ}
              onOpenRequestDetail={openRequestDetail}
            />
          )}
          {tab === 'history' && (
            requestsViewMode === 'list' ? (
              <TransactionHistoryTab
                requests={myRequests}
                onOpenDetail={openRequestDetail}
                title='Lịch sử'
                subtitle='Các giao dịch đã kết nối gần đây'
                accent={PRIMARY_REQ}
                getRequestTitle={(request) => request.providerName}
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
              <PaymentAccountsTab
                inline
                accounts={accounts}
                onSave={setAccounts}
                onClose={() => setTab('overview')}
                accent={PRIMARY_REQ}
                title="Tài khoản nhận"
                subtitle="Thêm, sửa hoặc xoá tài khoản nhận tiền"
              />
            </div>
          )}
          {tab === 'accounts' && null}
        </motion.div>
      </AnimatePresence>
      <AppBottomNav tab={tab} onTab={handleTabChange} accent={PRIMARY_REQ} />
    </div>
  );
}
