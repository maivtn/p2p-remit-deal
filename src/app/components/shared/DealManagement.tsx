import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Bell,
  ChevronLeft,
  Check,
  Edit2,
  Eye,
  LayoutGrid,
  Plus,
  Wallet,
  Trash2,
  X,
} from "lucide-react";
import {
  CURRENCIES,
  formatAmount,
  formatVND,
  getCurrency,
  getPaymentMethod,
  paymentMethodMatrix,
  getPaymentMethodsByCurrency,
  type Deal,
  type DealRequest,
  type ProviderAccount,
} from "../../data/mockData";
import { MethodIcon } from "./MethodIcon";

export type DealFilter = "all" | "active" | "completed" | "expired";

const SUGGESTED_RATES: Record<string, string> = {
  VND: "1",
  USD: "25500",
  EUR: "27900",
  GBP: "32200",
  JPY: "172",
  KRW: "19",
  AUD: "16900",
  SGD: "19100",
  THB: "730",
  CNY: "3520",
};

type AccountForm = Partial<ProviderAccount> & {
  selectedFieldKey?: string;
  [key: string]: string | undefined;
};

const ACCOUNT_FIELD_LABELS: Record<string, string> = {
  name: "Tên người nhận",
  phoneNumber: "Số điện thoại",
  email: "Email",
  handle: "Handle",
  bankName: "Tên ngân hàng",
  bankCode: "Mã ngân hàng",
  branchName: "Chi nhánh",
  routingNumber: "Routing number",
  sortCode: "Sort code",
  accountNumber: "Số tài khoản",
  accountType: "Loại tài khoản",
  iban: "IBAN",
  bic: "BIC",
  bsb: "BSB",
  payNowType: "PayNow type",
  payNowValue: "PayNow value",
  payIdType: "PayID type",
  payIdValue: "PayID value",
};

function resolveMatrixMethodId(currency: string, label: string) {
  return (
    getPaymentMethodsByCurrency(currency)?.find(
      (method) => method.name === label || method.id === label,
    )?.id ?? ""
  );
}

function fmt(amount: number, code: string) {
  if (code === "VND") return formatVND(amount);
  return formatAmount(amount, code);
}

function fmtRate(rate: number, fromCode: string, toCode: string) {
  if (toCode === "VND") return `${formatVND(rate)}/${fromCode}`;
  return `${fmt(rate, toCode)}/${fromCode}`;
}

function statusLabel(status: Deal["status"]) {
  if (status === "active") return "Đang hoạt động";
  if (status === "completed") return "Đã hoàn tất";
  return "Đã xoá";
}

function statusColor(status: Deal["status"]) {
  if (status === "active") return { bg: "#D1FAE5", fg: "#065F46" };
  if (status === "completed") return { bg: "#DBEAFE", fg: "#1E40AF" };
  return { bg: "#F3F4F6", fg: "#4B5563" };
}

function DealCard({
  deal,
  activeRequestCount,
  onEdit,
  onDelete,
  onView,
  onOpenRequest,
  accent,
}: {
  deal: Deal;
  activeRequestCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onOpenRequest?: () => void;
  accent: string;
}) {
  const from = getCurrency(deal.fromCurrency);
  const to = getCurrency(deal.toCurrency);
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
            {deal.fromCurrency} → {deal.toCurrency}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            {deal.providerName}
          </div>
        </div>
        <span
          style={{
            background: statusColor(deal.status).bg,
            color: statusColor(deal.status).fg,
            borderRadius: 20,
            padding: "2px 10px",
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {statusLabel(deal.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-50 rounded-xl p-2">
          <p style={{ fontSize: 10, color: "#9CA3AF" }}>Tỷ giá</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
            {fmtRate(deal.rate, deal.fromCurrency, deal.toCurrency)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2">
          <p style={{ fontSize: 10, color: "#9CA3AF" }}>Giới hạn</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
            {fmt(deal.minAmount, deal.fromCurrency)} –{" "}
            {fmt(deal.maxAmount, deal.fromCurrency)}
          </p>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-1 flex-wrap">
          <span style={{ fontSize: 10, color: "#9CA3AF" }}>Nhận qua:</span>
          {deal.senderPaymentMethods[0] ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
            >
              <MethodIcon
                id={deal.senderPaymentMethods[0]}
                icon={
                  getPaymentMethod(
                    deal.fromCurrency,
                    deal.senderPaymentMethods[0],
                  )?.icon ?? "💳"
                }
                size={13}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#1D4ED8" }}>
                {getPaymentMethod(
                  deal.fromCurrency,
                  deal.senderPaymentMethods[0],
                )?.name ?? deal.senderPaymentMethods[0]}
              </span>
            </span>
          ) : (
            <span style={{ fontSize: 11, color: "#D1D5DB" }}>—</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <span style={{ fontSize: 10, color: "#9CA3AF" }}>Gửi qua:</span>
          {deal.recipientPaymentMethods.map((id) => {
            const m = getPaymentMethod(deal.toCurrency, id);
            return m ? (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
              >
                <MethodIcon id={m.id} icon={m.icon} size={13} />
                <span
                  style={{ fontSize: 11, fontWeight: 600, color: "#065F46" }}
                >
                  {m.name}
                </span>
              </span>
            ) : null;
          })}
        </div>
      </div>

      <div className="flex items-center gap-1 mb-3">
        <Bell size={12} color="#9CA3AF" />
        <span style={{ fontSize: 12, color: "#6B7280" }}>
          {activeRequestCount} yêu cầu
        </span>
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
          style={{ background: "#F3F4F6", border: "none", cursor: "pointer" }}
        >
          <Eye size={14} color="#6B7280" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#6B7280" }}>
            Xem deal
          </span>
        </button>
        {onOpenRequest && activeRequestCount > 0 && (
          <button
            onClick={onOpenRequest}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
            style={{ background: "#EFF6FF", border: "none", cursor: "pointer" }}
          >
            <Bell size={14} color={accent} />
            <span style={{ fontSize: 13, fontWeight: 600, color: accent }}>
              Xem yêu cầu
            </span>
          </button>
        )}
        {deal.status === "active" && activeRequestCount === 0 && (
          <>
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
              style={{
                background: "#EFF6FF",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Edit2 size={14} color={accent} />
              <span style={{ fontSize: 13, fontWeight: 600, color: accent }}>
                Sửa
              </span>
            </button>
            <button
              onClick={onDelete}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "#FEE2E2",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Trash2 size={15} color="#EF4444" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function DealEditorModal({
  onClose,
  onSave,
  accounts,
  initialDeal,
  accent,
  ownerName,
}: {
  onClose: () => void;
  onSave: (deal: Deal) => void;
  accounts: ProviderAccount[];
  initialDeal?: Deal;
  accent: string;
  ownerName: string;
}) {
  const [form, setForm] = useState({
    fromCurrency: initialDeal?.fromCurrency ?? "USD",
    toCurrency: initialDeal?.toCurrency ?? "VND",
    rate: initialDeal ? String(initialDeal.rate) : "",
    minAmount: initialDeal ? String(initialDeal.minAmount) : "",
    maxAmount: initialDeal ? String(initialDeal.maxAmount) : "",
    notes: initialDeal?.notes ?? "",
    selectedAccountId: "",
    senderPaymentMethods: initialDeal?.senderPaymentMethods ?? [],
    recipientPaymentMethods: initialDeal?.recipientPaymentMethods ?? ["momo"],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localAccounts, setLocalAccounts] =
    useState<ProviderAccount[]>(accounts);
  const [showPickAccount, setShowPickAccount] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addForm, setAddForm] = useState<AccountForm>({});

  const methods = getPaymentMethodsByCurrency(form.toCurrency);
  const senderMethods = getPaymentMethodsByCurrency(form.fromCurrency);
  const beneficiaryMatrix = paymentMethodMatrix.find(
    (entry) => entry.currency === form.fromCurrency,
  );
  const beneficiaryMethods = beneficiaryMatrix?.methods ?? [];
  const selectedAccount = localAccounts.find(
    (a) => a.id === form.selectedAccountId,
  );
  const selectedBeneficiaryMethodId = form.senderPaymentMethods[0] ?? "";
  const accountMethodFilter = selectedBeneficiaryMethodId
    ? [selectedBeneficiaryMethodId]
    : senderMethods.map((m) => m.id);
  const addSelectedMethod = beneficiaryMethods.find(
    (method) => resolveMatrixMethodId(form.fromCurrency, method.label) === addForm.methodId,
  );
  const selectedOneOfField =
    addForm.selectedFieldKey &&
    addSelectedMethod?.oneOf?.flat().includes(addForm.selectedFieldKey)
      ? addForm.selectedFieldKey
      : addSelectedMethod?.oneOf?.[0]?.[0] ?? "";

  const handleAddAccount = () => {
    if (!addForm.methodId || !addForm.label) return;
    const newAcc: ProviderAccount = {
      id: `pa${Date.now()}`,
      methodId: addForm.methodId,
      currency: form.fromCurrency,
      country: beneficiaryMatrix?.country,
      label: addForm.label,
      name: addForm.name,
      phone: addForm.phoneNumber ?? addForm.phone,
      phoneNumber: addForm.phoneNumber ?? addForm.phone,
      email: addForm.email,
      handle: addForm.handle,
      bankName: addForm.bankName,
      bankCode: addForm.bankCode,
      branchName: addForm.branchName,
      routingNumber: addForm.routingNumber,
      sortCode: addForm.sortCode,
      accountNumber: addForm.accountNumber,
      accountType: addForm.accountType,
      accountName: addForm.name ?? addForm.accountName,
      iban: addForm.iban,
      bic: addForm.bic,
      bsb: addForm.bsb,
      payNowType: addForm.payNowType,
      payNowValue: addForm.payNowValue,
      payIdType: addForm.payIdType,
      payIdValue: addForm.payIdValue,
    };
    setLocalAccounts((prev) => [...prev, newAcc]);
    setForm((f) => ({ ...f, selectedAccountId: newAcc.id }));
    setAddForm({});
    setShowAddAccount(false);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.rate || Number.isNaN(Number(form.rate)))
      e.rate = "Nhập tỷ giá hợp lệ";
    if (!form.minAmount || Number.isNaN(Number(form.minAmount)))
      e.minAmount = "Nhập số tiền tối thiểu";
    if (!form.maxAmount || Number.isNaN(Number(form.maxAmount)))
      e.maxAmount = "Nhập số tiền tối đa";
    if (Number(form.minAmount) >= Number(form.maxAmount))
      e.maxAmount = "Tối đa phải lớn hơn tối thiểu";
    if (!form.selectedAccountId && !initialDeal) e.account = "Chọn tài khoản";
    if (form.senderPaymentMethods.length === 0)
      e.sender = "Chọn ít nhất 1 hình thức";
    if (form.recipientPaymentMethods.length === 0)
      e.recipient = "Chọn ít nhất 1 hình thức";
    return e;
  };

  const save = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave({
      ...(initialDeal ?? {
        id: `d_${Date.now()}`,
        providerId: "self",
        providerName: ownerName,
        providerRating: 4.9,
        providerReviews: 0,
        providerVerified: true,
        requestCount: 0,
        completedDeals: 0,
        expiresAt: "",
        transferTime: "",
        status: "active",
        senderPaymentMethods: [],
        recipientPaymentMethods: [],
      }),
      fromCurrency: form.fromCurrency,
      toCurrency: form.toCurrency,
      rate: Number(form.rate),
      minAmount: Number(form.minAmount),
      maxAmount: Number(form.maxAmount),
      notes: form.notes,
      senderPaymentMethods: form.senderPaymentMethods,
      recipientPaymentMethods: form.recipientPaymentMethods,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30 }}
        className="w-full max-w-[430px] bg-white rounded-t-3xl overflow-hidden"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
            {initialDeal ? "Chỉnh sửa Deal" : "Tạo Deal Mới"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X size={16} color="#6B7280" />
          </button>
        </div>

        <div
          className="overflow-y-auto px-5 py-4 space-y-4"
          style={{ maxHeight: "calc(92vh - 130px)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                Tôi gửi bằng
              </label>
              <select
                value={form.toCurrency}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    toCurrency: e.target.value,
                    recipientPaymentMethods: [
                      getPaymentMethodsByCurrency(e.target.value)[0]
                        ?.id ?? "",
                    ].filter(Boolean),
                  }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-3 bg-gray-50"
                style={{ fontSize: 14 }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}  
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Thụ hưởng nhận qua
              </label>
              <select
                value={form.fromCurrency}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    fromCurrency: e.target.value,
                    selectedAccountId: "",
                    senderPaymentMethods: [],
                  }));
                  setAddForm({});
                }}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 bg-gray-50"
                style={{ fontSize: 14 }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}  
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
              >
                Tỷ giá (1 {form.fromCurrency} = ? {form.toCurrency})
              </label>
              <button
                type="button"
                onClick={() => {
                  const val = SUGGESTED_RATES[form.fromCurrency];
                  if (val) setForm((f) => ({ ...f, rate: val }));
                }}
                style={{
                  fontSize: 11,
                  color: "#2563EB",
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: 6,
                  padding: "3px 9px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ⚡ Tỷ giá thị trường
              </button>
            </div>
            <input
              value={form.rate}
              onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
              placeholder="Ví dụ: 25500"
              className="w-full border rounded-xl px-4 py-3 bg-gray-50"
              style={{
                borderColor: errors.rate ? "#EF4444" : "#E5E7EB",
                fontSize: 16,
              }}
            />
            {errors.rate && (
              <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                {errors.rate}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Tối thiểu ({getCurrency(form.fromCurrency)?.symbol ?? ""})
              </label>
              <input
                value={form.minAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minAmount: e.target.value }))
                }
                placeholder="100"
                className="w-full border rounded-xl px-4 py-3 bg-gray-50"
                style={{
                  borderColor: errors.minAmount ? "#EF4444" : "#E5E7EB",
                  fontSize: 15,
                }}
              />
              {errors.minAmount && (
                <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                  {errors.minAmount}
                </p>
              )}
            </div>
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Tối đa ({getCurrency(form.fromCurrency)?.symbol ?? ""})
              </label>
              <input
                value={form.maxAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxAmount: e.target.value }))
                }
                placeholder="5000"
                className="w-full border rounded-xl px-4 py-3 bg-gray-50"
                style={{
                  borderColor: errors.maxAmount ? "#EF4444" : "#E5E7EB",
                  fontSize: 15,
                }}
              />
              {errors.maxAmount && (
                <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                  {errors.maxAmount}
                </p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#047857",
                marginBottom: 2,
              }}
            >
              Tôi gửi tiền {form.toCurrency} bằng hình thức
            </p>
            <div className="flex flex-wrap gap-2">
              {methods.map((m) => {
                const selected = form.recipientPaymentMethods.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        recipientPaymentMethods: selected
                          ? f.recipientPaymentMethods.filter((x) => x !== m.id)
                          : [...f.recipientPaymentMethods, m.id],
                      }))
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                    style={{
                      background: selected ? "#ECFDF5" : "white",
                      border: `2px solid ${selected ? "#10B981" : "#A7F3D0"}`,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 rounded-[4px] flex-shrink-0"
                      style={{
                        border: `1.5px solid ${selected ? "#10B981" : "#A7F3D0"}`,
                        background: selected ? "#10B981" : "white",
                      }}
                    >
                      <Check
                        size={11}
                        color="white"
                        strokeWidth={3}
                        style={{ opacity: selected ? 1 : 0 }}
                      />
                    </span>
                    <MethodIcon id={m.id} icon={m.icon} size={15} />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: selected ? 700 : 500,
                        color: selected ? "#047857" : "#374151",
                      }}
                    >
                      {m.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.recipient && (
              <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                {errors.recipient}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 space-y-3">
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1D4ED8",
                  marginBottom: 8,
                }}
              >
                Người thụ hưởng nhận {form.fromCurrency} bằng hình thức
              </p>
              <div className="flex flex-wrap gap-2">
                {senderMethods.map((m) => {
                  const selected = selectedBeneficiaryMethodId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          senderPaymentMethods: [m.id],
                        }))
                      }
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{
                        background: selected ? "#EFF6FF" : "white",
                        border: `2px solid ${selected ? "#2563EB" : "#BFDBFE"}`,
                        cursor: "pointer",
                      }}
                    >
                      <span
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full"
                        style={{
                          border: `2px solid ${selected ? "#2563EB" : "#C7D2FE"}`,
                          background: selected ? "#2563EB" : "white",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: "white",
                            opacity: selected ? 1 : 0,
                          }}
                        />
                      </span>
                      <MethodIcon id={m.id} icon={m.icon} size={15} />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: selected ? 700 : 500,
                          color: selected ? "#1D4ED8" : "#374151",
                        }}
                      >
                        {m.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.sender && (
                <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>
                  {errors.sender}
                </p>
              )}
            </div>

            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1D4ED8",
                  marginBottom: 8,
                }}
              >
                Thông tin tài khoản người thụ hưởng
              </p>
              {selectedAccount ? (
                <div className="rounded-2xl border border-blue-200 bg-white p-3 mb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        {selectedAccount.label}
                      </p>
                      <p
                        style={{ fontSize: 12, color: "#2563EB", marginTop: 2 }}
                      >
                        {getPaymentMethod(
                          selectedAccount.currency,
                          selectedAccount.methodId,
                        )?.name ?? selectedAccount.methodId}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#2563EB",
                        fontWeight: 700,
                      }}
                    >
                      {selectedAccount.currency}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: "#374151",
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedAccount.phone && (
                      <div>SĐT: {selectedAccount.phone}</div>
                    )}
                    {selectedAccount.email && (
                      <div>Email: {selectedAccount.email}</div>
                    )}
                    {selectedAccount.handle && (
                      <div>Handle: {selectedAccount.handle}</div>
                    )}
                    {selectedAccount.bankName && (
                      <div>Ngân hàng: {selectedAccount.bankName}</div>
                    )}
                    {selectedAccount.accountNumber && (
                      <div>Số tài khoản: {selectedAccount.accountNumber}</div>
                    )}
                    {selectedAccount.accountName && (
                      <div>Tên chủ TK: {selectedAccount.accountName}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-3 mb-3">
                  <p style={{ fontSize: 13, color: "#6B7280" }}>
                    Chưa chọn tài khoản người thụ hưởng.
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPickAccount(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl"
                  style={{
                    background: "white",
                    border: "1.5px solid #BFDBFE",
                    cursor: "pointer",
                  }}
                >
                  <Wallet size={14} color="#2563EB" />
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#2563EB" }}
                  >
                    Chọn tài khoản
                  </span>
                </button>
                <button
                  onClick={() => setShowAddAccount(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl"
                  style={{
                    background: "#2563EB",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} color="white" />
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "white" }}
                  >
                    Thêm tài khoản
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                display: "block",
                marginBottom: 6,
              }}
            >
              Ghi chú
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={3}
              placeholder="Điều kiện, lưu ý thêm..."
              className="w-full border rounded-2xl px-4 py-3 bg-gray-50"
              style={{
                borderColor: "#E5E7EB",
                fontSize: 14,
                resize: "vertical",
              }}
            />
          </div>

          {showPickAccount && (
            <div
              className="fixed inset-0 z-50 bg-white flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
                <button
                  onClick={() => setShowPickAccount(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <ChevronLeft size={22} color="#374151" />
                </button>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#111827",
                    flex: 1,
                    textAlign: "center",
                    marginRight: 30,
                  }}
                >
                  Chọn tài khoản
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {localAccounts.filter(
                  (a) =>
                    a.currency === form.fromCurrency &&
                    accountMethodFilter.includes(a.methodId),
                ).length === 0 ? (
                  <div className="flex flex-col items-center py-12">
                    <Wallet size={44} color="#E5E7EB" />
                    <p
                      style={{ color: "#9CA3AF", marginTop: 10, fontSize: 15 }}
                    >
                      Chưa có tài khoản nào phù hợp phương thức đã chọn
                    </p>
                  </div>
                ) : (
                  localAccounts
                    .filter(
                      (a) =>
                        a.currency === form.fromCurrency &&
                        accountMethodFilter.includes(a.methodId),
                    )
                    .map((acc) => {
                      const method = getPaymentMethod(
                        acc.currency,
                        acc.methodId,
                      );
                      const detail =
                        acc.phone ||
                        acc.email ||
                        acc.handle ||
                        acc.accountNumber ||
                        "";
                      return (
                        <button
                          key={acc.id}
                          onClick={() => {
                            setForm((f) => ({
                              ...f,
                              selectedAccountId: acc.id,
                            }));
                            setShowPickAccount(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left"
                          style={{
                            background:
                              form.selectedAccountId === acc.id
                                ? "#ECFDF5"
                                : "white",
                            border: `1.5px solid ${form.selectedAccountId === acc.id ? "#10B981" : "#E5E7EB"}`,
                            cursor: "pointer",
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "#EFF6FF" }}
                          >
                            <MethodIcon
                              id={method?.id ?? acc.methodId}
                              icon={method?.icon ?? "💳"}
                              size={20}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#111827",
                              }}
                            >
                              {acc.label}
                            </p>
                            {detail && (
                              <p style={{ fontSize: 12, color: "#6B7280" }}>
                                {detail}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {showAddAccount && (
            <div
              className="fixed inset-0 z-50 bg-white flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
                <button
                  onClick={() => setShowAddAccount(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <ChevronLeft size={22} color="#374151" />
                </button>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#111827",
                    flex: 1,
                    textAlign: "center",
                    marginRight: 30,
                  }}
                >
                  Thêm tài khoản
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {beneficiaryMatrix ? (
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#374151",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Quốc gia
                    </label>
                    <div
                      className="rounded-xl px-3 py-3"
                      style={{
                        background: "#F9FAFB",
                        border: "1px solid #E5E7EB",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {beneficiaryMatrix.country} ({form.fromCurrency})
                    </div>
                  </div>
                ) : null}

                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Phương thức thanh toán
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {beneficiaryMethods.map((method) => {
                      const methodId = resolveMatrixMethodId(
                        form.fromCurrency,
                        method.label,
                      );
                      const selected = addForm.methodId === methodId;
                      return (
                        <button
                          key={method.label}
                          onClick={() =>
                            setAddForm((f) => ({
                              ...f,
                              methodId,
                              selectedFieldKey: method.oneOf?.[0]?.[0] ?? "",
                            }))
                          }
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                          style={{
                            background: selected ? "#ECFDF5" : "#F9FAFB",
                            border: `2px solid ${selected ? "#10B981" : "#E5E7EB"}`,
                            cursor: "pointer",
                          }}
                        >
                          <MethodIcon
                            id={methodId}
                            icon={getPaymentMethod(form.fromCurrency, methodId)?.icon ?? "💳"}
                            size={15}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: selected ? 700 : 400,
                              color: selected ? "#047857" : "#374151",
                            }}
                          >
                            {method.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {addSelectedMethod ? (
                  <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#374151",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Tên gợi nhớ
                      </label>
                      <input
                        value={addForm.label || ""}
                        onChange={(e) =>
                          setAddForm((f) => ({ ...f, label: e.target.value }))
                        }
                        placeholder="Ví dụ: MoMo chính, Bank phụ..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                        style={{ fontSize: 14 }}
                      />
                    </div>

                    <div className="space-y-3">
                      {addSelectedMethod.fields.map((field) => (
                        <div key={field}>
                          <label
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#374151",
                              display: "block",
                              marginBottom: 6,
                            }}
                          >
                            {ACCOUNT_FIELD_LABELS[field] ?? field}
                          </label>
                          <input
                            value={addForm[field] || ""}
                            onChange={(e) =>
                              setAddForm((f) => ({
                                ...f,
                                [field]: e.target.value,
                              }))
                            }
                            placeholder={ACCOUNT_FIELD_LABELS[field] ?? field}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                            style={{ fontSize: 14 }}
                          />
                        </div>
                      ))}
                    </div>

                    {addSelectedMethod.oneOf?.length ? (
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#374151",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Chọn 1 thông tin
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {addSelectedMethod.oneOf.flat().map((field) => {
                            const selected = selectedOneOfField === field;
                            return (
                              <button
                                key={field}
                                type="button"
                                onClick={() =>
                                  setAddForm((f) => ({
                                    ...f,
                                    selectedFieldKey: field,
                                  }))
                                }
                                className="px-3 py-2 rounded-xl"
                                style={{
                                  background: selected ? "#EFF6FF" : "white",
                                  border: `2px solid ${selected ? "#2563EB" : "#E5E7EB"}`,
                                  color: selected ? "#1D4ED8" : "#374151",
                                  fontWeight: selected ? 700 : 500,
                                  fontSize: 12,
                                }}
                              >
                                {ACCOUNT_FIELD_LABELS[field] ?? field}
                              </button>
                            );
                          })}
                        </div>
                        {selectedOneOfField ? (
                          <div>
                            <label
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#374151",
                                display: "block",
                                marginBottom: 6,
                              }}
                            >
                              {ACCOUNT_FIELD_LABELS[selectedOneOfField] ??
                                selectedOneOfField}
                            </label>
                            <input
                              value={addForm[selectedOneOfField] || ""}
                              onChange={(e) =>
                                setAddForm((f) => ({
                                  ...f,
                                  [selectedOneOfField]: e.target.value,
                                }))
                              }
                              placeholder={
                                ACCOUNT_FIELD_LABELS[selectedOneOfField] ??
                                selectedOneOfField
                              }
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                              style={{ fontSize: 14 }}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {addSelectedMethod.optionalFields?.length ? (
                      <div className="space-y-3">
                        {addSelectedMethod.optionalFields.map((field) => (
                          <div key={field}>
                            <label
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#374151",
                                display: "block",
                                marginBottom: 6,
                              }}
                            >
                              {ACCOUNT_FIELD_LABELS[field] ?? field} (tuỳ chọn)
                            </label>
                            <input
                              value={addForm[field] || ""}
                              onChange={(e) =>
                                setAddForm((f) => ({
                                  ...f,
                                  [field]: e.target.value,
                                }))
                              }
                              placeholder={
                                ACCOUNT_FIELD_LABELS[field] ?? field
                              }
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                              style={{ fontSize: 14 }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div
                    className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4"
                  >
                    <p style={{ fontSize: 13, color: "#6B7280" }}>
                      Chọn phương thức thanh toán để hiển thị form tài khoản.
                    </p>
                  </div>
                )}

              </div>
              <div className="px-4 py-4 border-t border-gray-100">
                <button
                  onClick={handleAddAccount}
                  disabled={!addForm.methodId || !addForm.label}
                  className="w-full py-3.5 rounded-2xl text-white"
                  style={{
                    background:
                      addForm.methodId && addForm.label ? "#2563EB" : "#D1D5DB",
                    border: "none",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor:
                      addForm.methodId && addForm.label
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  Lưu tài khoản
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 bg-white">
          <button
            onClick={save}
            className="w-full py-4 rounded-2xl"
            style={{
              background: accent,
              border: "none",
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {initialDeal ? "Cập nhật deal" : "Đăng Deal"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ManageDealsTab({
  title,
  deals,
  requests,
  accounts,
  onDealsChange,
  onRequestsChange,
  onAccountsChange,
  ownerName,
  accent,
  onOpenRequestDetail,
}: {
  title: string;
  deals: Deal[];
  requests: DealRequest[];
  accounts: ProviderAccount[];
  onDealsChange: (deals: Deal[]) => void;
  onRequestsChange?: (requests: DealRequest[]) => void;
  onAccountsChange: (accounts: ProviderAccount[]) => void;
  ownerName: string;
  accent: string;
  onOpenRequestDetail?: (requestId: string) => void;
}) {
  const [filter, setFilter] = useState<DealFilter>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [viewingDeal, setViewingDeal] = useState<Deal | null>(null);

  const counts = useMemo(
    () => ({
      all: deals.length,
      active: deals.filter((d) => d.status === "active").length,
      completed: deals.filter((d) => d.status === "completed").length,
      expired: deals.filter((d) => d.status === "expired").length,
    }),
    [deals],
  );

  const filtered = deals.filter(
    (d) =>
      filter === "all" ||
      (filter === "completed" ? d.status === "completed" : d.status === filter),
  );

  const chipLabels: Record<DealFilter, string> = {
    all: "Tất cả",
    active: "Đang hoạt động",
    completed: "Đã hoàn tất",
    expired: "Đã xoá",
  };

  const closeEditor = () => {
    setShowCreate(false);
    setEditingDeal(null);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div
        className="px-5 pt-12 pb-4"
        style={{ background: `linear-gradient(135deg, ${accent}, #1D4ED8)` }}
      >
        <div className="flex items-center justify-between">
          <h1 style={{ color: "white", fontSize: 22, fontWeight: 700 }}>
            {title}
          </h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20"
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus size={16} /> Tạo mới
          </button>
        </div>
      </div>

      <div className="flex gap-2 px-5 py-3 border-b border-gray-100 overflow-x-auto">
        {(["all", "active", "completed", "expired"] as DealFilter[]).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? accent : "#F3F4F6",
                color: filter === f ? "white" : "#6B7280",
                border: "none",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {chipLabels[f]} ({counts[f] ?? 0})
            </button>
          ),
        )}
      </div>

      <div className="px-4 py-4 space-y-3">
        {filtered.map((deal) => {
          const activeReq = requests.find(
            (r) =>
              r.dealId === deal.id &&
              !["cancelled", "rejected"].includes(r.status),
          );
          return (
            <DealCard
              key={deal.id}
              deal={deal}
              activeRequestCount={activeReq ? 1 : 0}
              accent={accent}
              onView={() => setViewingDeal(deal)}
              onEdit={() => setEditingDeal(deal)}
              onDelete={() =>
                onDealsChange(deals.filter((x) => x.id !== deal.id))
              }
              onOpenRequest={
                activeReq && onOpenRequestDetail
                  ? () => onOpenRequestDetail(activeReq.id)
                  : undefined
              }
            />
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <LayoutGrid size={44} color="#E5E7EB" />
            <p style={{ color: "#9CA3AF", marginTop: 10, fontSize: 15 }}>
              Không có deal nào
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 px-6 py-3 rounded-xl text-white"
              style={{
                background: accent,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Tạo Deal Ngay
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {(showCreate || editingDeal) && (
          <DealEditorModal
            onClose={closeEditor}
            onSave={(deal) => {
              if (editingDeal) {
                onDealsChange(deals.map((x) => (x.id === deal.id ? deal : x)));
              } else {
                onDealsChange([deal, ...deals]);
              }
              closeEditor();
            }}
            accounts={accounts}
            initialDeal={editingDeal ?? undefined}
            accent={accent}
            ownerName={ownerName}
          />
        )}
        {viewingDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setViewingDeal(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="w-full max-w-[430px] bg-white rounded-t-3xl overflow-hidden"
              style={{ maxHeight: "80vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
                  Chi tiết Deal
                </h2>
                <button
                  onClick={() => setViewingDeal(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X size={16} color="#6B7280" />
                </button>
              </div>
              <div className="overflow-y-auto px-5 py-4 space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 22 }}>
                      {getCurrency(viewingDeal.fromCurrency)?.flag}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>
                      {viewingDeal.fromCurrency}
                    </span>
                    <ArrowRight size={16} color="#9CA3AF" />
                    <span style={{ fontSize: 22 }}>
                      {getCurrency(viewingDeal.toCurrency)?.flag}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>
                      {viewingDeal.toCurrency}
                    </span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: accent }}>
                    {viewingDeal.rate.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                    <p style={{ fontSize: 11, color: "#9CA3AF" }}>Tối thiểu</p>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {viewingDeal.minAmount.toLocaleString()}{" "}
                      {viewingDeal.fromCurrency}
                    </p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                    <p style={{ fontSize: 11, color: "#9CA3AF" }}>Tối đa</p>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {viewingDeal.maxAmount.toLocaleString()}{" "}
                      {viewingDeal.fromCurrency}
                    </p>
                  </div>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#6B7280",
                      marginBottom: 8,
                    }}
                  >
                    Người thụ hưởng nhận bằng
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {viewingDeal.senderPaymentMethods.map((id) => {
                      const m = getPaymentMethod(viewingDeal.fromCurrency, id);
                      return m ? (
                        <div
                          key={id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50"
                        >
                          <MethodIcon id={m.id} icon={m.icon} size={14} />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: accent,
                            }}
                          >
                            {m.name}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#6B7280",
                      marginBottom: 8,
                    }}
                  >
                    Bạn gửi qua
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {viewingDeal.recipientPaymentMethods.map((id) => {
                      const m = getPaymentMethod(viewingDeal.toCurrency, id);
                      return m ? (
                        <div
                          key={id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50"
                        >
                          <MethodIcon id={m.id} icon={m.icon} size={14} />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#047857",
                            }}
                          >
                            {m.name}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#6B7280",
                      marginBottom: 6,
                    }}
                  >
                    Ghi chú
                  </p>
                  <p
                    style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}
                  >
                    {viewingDeal.notes}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
