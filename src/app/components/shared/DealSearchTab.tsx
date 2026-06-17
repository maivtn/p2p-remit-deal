import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  CreditCard,
  Plus,
  Send,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import {
  CURRENCIES,
  formatAmount,
  formatVND,
  getCurrency,
  getPaymentMethod,
  getPaymentMethodsByCurrency,
  PROVIDER_ACCOUNTS_INIT_FROM_BENEFICIARY,
  type Deal,
  type DealRequest,
  type PaymentMethod,
  type ProviderAccount,
} from "../../data/mockData";
import { MethodIcon } from "./MethodIcon";

type HomeStep = "input" | "results" | "confirm";

interface Need {
  senderCurrency: string;
  recipientCurrency: string;
  amount: string;
  senderPaymentMethods: string[];
  recipientPaymentMethod: string;
  recipientName: string;
  recipientPhone: string;
  recipientBank: string;
  recipientAccount: string;
  recipientAddress: string;
  message: string;
}

const PREVIEW_RATES: Record<string, Record<string, number>> = {
  USD: { VND: 25500, EUR: 0.92, GBP: 0.79, SGD: 1.33, AUD: 1.54 },
  VND: { USD: 0.0000392, EUR: 0.0000358, GBP: 0.0000311, SGD: 0.0000525, AUD: 0.0000592 },
  EUR: { VND: 27900, USD: 1.08, GBP: 0.86 },
  GBP: { VND: 32200, USD: 1.26, EUR: 1.16 },
  SGD: { VND: 19050, USD: 0.74 },
  AUD: { VND: 16900, USD: 0.65 },
  JPY: { VND: 172, USD: 0.0067 },
  KRW: { VND: 19, USD: 0.00073 },
  THB: { VND: 730, USD: 0.028 },
  CNY: { VND: 3520, USD: 0.138 },
};

function fmt(amount: number, code: string) {
  if (code === "VND") return formatVND(amount);
  return formatAmount(amount, code);
}

function fmtRate(rate: number, fromCode: string, toCode: string) {
  if (toCode === "VND") return `${formatVND(rate)}/${fromCode}`;
  return `${fmt(rate, toCode)}/${fromCode}`;
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const colors = ["#2563EB", "#059669", "#7C3AED", "#D97706", "#0EA5E9"];
  const bg =
    colors[name.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0) % colors.length];
  const initials = name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ color: "white", fontSize: size * 0.38, fontWeight: 700 }}>
        {initials || "U"}
      </span>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#F59E0B", fontSize: 12 }}>
      {"★".repeat(Math.floor(rating))}
      {"☆".repeat(5 - Math.floor(rating))}
      <span style={{ color: "#6B7280", marginLeft: 3 }}>
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

function PaymentMethodSelector({
  currency,
  selected,
  onToggle,
  label,
  selectionMode = "checkbox",
}: {
  currency: string;
  selected: string[];
  onToggle: (id: string) => void;
  label: string;
  selectionMode?: "checkbox" | "radio";
}) {
  const methods = getPaymentMethodsByCurrency(currency);
  return (
    <div>
      <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {methods.map((m) => {
          const isSelected = selected.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onToggle(m.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                background: isSelected ? "#ECFDF5" : "#F9FAFB",
                border: `2px solid ${isSelected ? "#059669" : "#E5E7EB"}`,
                cursor: "pointer",
              }}
            >
              <span
                className="inline-flex items-center justify-center flex-shrink-0"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: selectionMode === "radio" ? 999 : 4,
                  border: `1.5px solid ${isSelected ? "#059669" : "#D1D5DB"}`,
                  background: isSelected ? "#059669" : "white",
                }}
              >
                {isSelected && <Check size={10} color="white" strokeWidth={3} />}
              </span>
              <MethodIcon id={m.id} icon={m.icon} size={15} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? "#047857" : "#374151",
                }}
              >
                {m.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DealSearchTab({
  onRequestSent,
  availableDeals,
  accounts,
  onAccountsChange,
  displayName = "Nguyễn Văn A",
}: {
  onRequestSent: (req: DealRequest) => void;
  availableDeals: Deal[];
  accounts: ProviderAccount[];
  onAccountsChange: (accounts: ProviderAccount[]) => void;
  displayName?: string;
}) {
  const [step, setStep] = useState<HomeStep>("input");
  const [need, setNeed] = useState<Need>({
    senderCurrency: "USD",
    recipientCurrency: "VND",
    amount: "500",
    senderPaymentMethods: ["zelle"],
    recipientPaymentMethod: "momo",
    recipientName: "",
    recipientPhone: "",
    recipientBank: "",
    recipientAccount: "",
    recipientAddress: "",
    message: "",
  });
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedRecipientAccountId, setSelectedRecipientAccountId] =
    useState("");
  const [showPickAccount, setShowPickAccount] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addForm, setAddForm] = useState<Partial<ProviderAccount>>({});

  const senderMethods = getPaymentMethodsByCurrency(need.senderCurrency);
  const recipientMethods =
    getPaymentMethodsByCurrency(need.recipientCurrency);
  const selectedRecipientAccount = accounts.find(
    (a) => a.id === selectedRecipientAccountId,
  );
  const previewRate =
    PREVIEW_RATES[need.senderCurrency]?.[need.recipientCurrency] ?? 0;
  const previewAmount =
    need.amount && !Number.isNaN(Number(need.amount)) && previewRate > 0
      ? Number(need.amount) * previewRate
      : 0;
  const availableRecipientCurrencies = Object.keys(
    PREVIEW_RATES[need.senderCurrency] ?? {},
  );
  const selectedAddMethod = addForm.methodId
    ? getPaymentMethod(need.recipientCurrency, addForm.methodId)
    : undefined;

  const recipientAccounts = useMemo(
    () =>
      accounts.filter(
        (account) =>
          account.currency === need.recipientCurrency &&
          account.methodId === need.recipientPaymentMethod,
      ),
    [accounts, need.recipientCurrency, need.recipientPaymentMethod],
  );

  const setNeedField = (key: keyof Need, value: string) => {
    setNeed((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const changeSenderCurrency = (currency: string) => {
    const methods = getPaymentMethodsByCurrency(currency);
    const nextRecipientCurrencies = Object.keys(PREVIEW_RATES[currency] ?? {});
    const recipientCurrency = nextRecipientCurrencies.includes(
      need.recipientCurrency,
    )
      ? need.recipientCurrency
      : nextRecipientCurrencies[0] ?? "VND";
    const nextRecipientMethods =
      getPaymentMethodsByCurrency(recipientCurrency);
    setNeed((current) => ({
      ...current,
      senderCurrency: currency,
      senderPaymentMethods: methods[0] ? [methods[0].id] : [],
      recipientCurrency,
      recipientPaymentMethod: nextRecipientMethods[0]?.id ?? "",
      recipientName: "",
      recipientPhone: "",
      recipientBank: "",
      recipientAccount: "",
    }));
    setSelectedRecipientAccountId("");
  };

  const changeRecipientCurrency = (currency: string) => {
    const methods = getPaymentMethodsByCurrency(currency);
    setNeed((current) => ({
      ...current,
      recipientCurrency: currency,
      recipientPaymentMethod: methods[0]?.id ?? "",
      recipientName: "",
      recipientPhone: "",
      recipientBank: "",
      recipientAccount: "",
    }));
    setSelectedRecipientAccountId("");
  };

  const handleAddRecipientAccount = () => {
    if (!addForm.methodId || !addForm.label) return;
    const newAcc: ProviderAccount = {
      id: `ra_${Date.now()}`,
      methodId: addForm.methodId,
      currency: need.recipientCurrency,
      label: addForm.label,
      name: addForm.name,
      phone: addForm.phone,
      phoneNumber: addForm.phone,
      email: addForm.email,
      handle: addForm.handle,
      bankName: addForm.bankName,
      accountNumber: addForm.accountNumber,
      accountName: addForm.accountName || addForm.name,
      bankCode: addForm.bankCode,
      branchName: addForm.branchName,
      routingNumber: addForm.routingNumber,
      sortCode: addForm.sortCode,
      accountType: addForm.accountType,
      iban: addForm.iban,
      bic: addForm.bic,
      bsb: addForm.bsb,
      payNowType: addForm.payNowType,
      payNowValue: addForm.payNowValue,
      payIdType: addForm.payIdType,
      payIdValue: addForm.payIdValue,
      promptPayType: addForm.promptPayType,
      promptPayValue: addForm.promptPayValue,
    };
    onAccountsChange([...accounts, newAcc]);
    setSelectedRecipientAccountId(newAcc.id);
    setNeed((current) => ({
      ...current,
      recipientName: newAcc.accountName || "",
      recipientPhone: newAcc.phone || newAcc.phoneNumber || "",
      recipientBank: newAcc.bankName || "",
      recipientAccount: newAcc.accountNumber || "",
    }));
    setAddForm({});
    setShowAddAccount(false);
  };

  const handleSearch = () => {
    const nextErrors: Record<string, string> = {};
    if (!need.amount || Number.isNaN(Number(need.amount)) || Number(need.amount) <= 0) {
      nextErrors.amount = "Nhập số tiền hợp lệ";
    }
    if (!need.recipientName.trim()) {
      nextErrors.recipientName = "Vui lòng chọn hoặc thêm tài khoản nhận";
    }
    const recipientMethod = getPaymentMethod(
      need.recipientCurrency,
      need.recipientPaymentMethod,
    );
    if (recipientMethod?.requiresPhone && !need.recipientPhone.trim()) {
      nextErrors.recipientPhone = "Nhập số điện thoại";
    }
    if (recipientMethod?.requiresAccount && !need.recipientAccount.trim()) {
      nextErrors.recipientAccount = "Nhập số tài khoản";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setStep("results");
  };

  const matchingDeals = availableDeals.filter((deal) => {
    if (deal.fromCurrency !== need.senderCurrency) return false;
    if (deal.toCurrency !== need.recipientCurrency) return false;
    if (deal.status !== "active") return false;
    const amount = Number(need.amount);
    if (amount < deal.minAmount || amount > deal.maxAmount) return false;
    if (!need.senderPaymentMethods.some((m) => deal.senderPaymentMethods.includes(m))) return false;
    if (!deal.recipientPaymentMethods.includes(need.recipientPaymentMethod)) return false;
    return true;
  }).sort((a, b) => b.rate - a.rate);

  const confirmRequest = (deal: Deal) => {
    const amount = Number(need.amount);
    const senderMethod = need.senderPaymentMethods.find((m) => deal.senderPaymentMethods.includes(m)) ?? need.senderPaymentMethods[0] ?? "";
    const providerAcc = PROVIDER_ACCOUNTS_INIT_FROM_BENEFICIARY.find(
      (a) => a.methodId === senderMethod && a.currency === deal.fromCurrency,
    );
    const req: DealRequest = {
      id: `mr_${Date.now()}`,
      dealId: deal.id,
      requesterId: "self",
      requesterName: displayName,
      requesterRating: 4.7,
      providerName: deal.providerName,
      providerId: deal.providerId,
      amount,
      fromCurrency: deal.fromCurrency,
      toCurrency: deal.toCurrency,
      rate: deal.rate,
      receiveAmount: amount * deal.rate,
      status: "waiting_accept",
      createdAt: new Date().toISOString(),
      message: need.message,
      senderPaymentMethod: senderMethod,
      recipientPaymentMethod: need.recipientPaymentMethod,
      recipientName: need.recipientName,
      recipientPhone: need.recipientPhone || undefined,
      recipientBank: need.recipientBank || undefined,
      recipientAccount: need.recipientAccount || undefined,
      recipientAddress: need.recipientAddress || undefined,
      providerPaymentAccount: providerAcc?.phone || providerAcc?.phoneNumber || providerAcc?.handle || undefined,
      providerEmail: providerAcc?.email || undefined,
      providerBank: providerAcc?.bankName || undefined,
      providerBankAccount: providerAcc?.accountNumber || undefined,
      systemFeeRate: 0.005,
      systemFeeAmount: amount * 0.005,
      escrowLocked: false,
    };
    onRequestSent(req);
    setStep("input");
    setSelectedDeal(null);
  };

  return (
    <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-gray-50">
      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-h-0 overflow-y-auto"
          >
            {showPickAccount && (
              <div className="fixed inset-0 z-50 bg-white flex flex-col">
                <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
                  <button
                    onClick={() => setShowPickAccount(false)}
                    style={{ background: "none", border: "none", padding: 4 }}
                  >
                    <ChevronLeft size={22} color="#374151" />
                  </button>
                  <h3 style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#111827", marginRight: 30 }}>
                    Chọn tài khoản
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                  {recipientAccounts.length === 0 ? (
                    <div className="flex flex-col items-center py-12">
                      <Wallet size={40} color="#E5E7EB" />
                      <p style={{ color: "#9CA3AF", marginTop: 10, fontSize: 14 }}>
                        Chưa có tài khoản nào phù hợp
                      </p>
                    </div>
                  ) : (
                    recipientAccounts.map((acc) => {
                      const method = getPaymentMethod(acc.currency, acc.methodId);
                      const detail =
                        acc.phone ||
                        acc.phoneNumber ||
                        acc.email ||
                        acc.handle ||
                        acc.accountNumber ||
                        "";
                      const isSelected = selectedRecipientAccountId === acc.id;
                      return (
                        <button
                          key={acc.id}
                          onClick={() => {
                            setSelectedRecipientAccountId(acc.id);
                            setNeed((current) => ({
                              ...current,
                              recipientName: acc.accountName || "",
                              recipientPhone: acc.phone || acc.phoneNumber || "",
                              recipientBank: acc.bankName || "",
                              recipientAccount: acc.accountNumber || "",
                            }));
                            setShowPickAccount(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left"
                          style={{
                            background: isSelected ? "#ECFDF5" : "white",
                            border: `1.5px solid ${isSelected ? "#059669" : "#E5E7EB"}`,
                          }}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F3F4F6" }}>
                            {method ? (
                              <MethodIcon id={method.id} icon={method.icon} size={20} />
                            ) : (
                              <CreditCard size={20} color="#6B7280" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                              {acc.label}
                            </p>
                            {detail && (
                              <p style={{ fontSize: 12, color: "#6B7280" }}>{detail}</p>
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
              <div className="fixed inset-0 z-50 bg-white flex flex-col">
                <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
                  <button
                    onClick={() => setShowAddAccount(false)}
                    style={{ background: "none", border: "none", padding: 4 }}
                  >
                    <ChevronLeft size={22} color="#374151" />
                  </button>
                  <h3 style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#111827", marginRight: 30 }}>
                    Thêm tài khoản
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  <PaymentMethodSelector
                    currency={need.recipientCurrency}
                    selected={addForm.methodId ? [addForm.methodId] : []}
                    onToggle={(id) =>
                      setAddForm((current) => ({ ...current, methodId: id }))
                    }
                    label="Phương thức thanh toán"
                    selectionMode="radio"
                  />
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                      Tên gợi nhớ
                    </label>
                    <input
                      value={addForm.label || ""}
                      onChange={(e) =>
                        setAddForm((current) => ({
                          ...current,
                          label: e.target.value,
                        }))
                      }
                      placeholder="Ví dụ: Vietcombank chính"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
                    />
                  </div>
                  {selectedAddMethod && (
                    <div className="space-y-3 rounded-2xl border border-gray-100 p-4 bg-gray-50">
                      {(selectedAddMethod.requiresPhone ||
                        selectedAddMethod.id === "venmo" ||
                        selectedAddMethod.id === "paypal") && (
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                            Số điện thoại / Email / Handle
                          </label>
                          <input
                            value={addForm.phone || addForm.email || addForm.handle || ""}
                            onChange={(e) =>
                              setAddForm((current) => ({
                                ...current,
                                phone: e.target.value,
                              }))
                            }
                            placeholder="Nhập thông tin liên hệ"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                          />
                        </div>
                      )}
                      {selectedAddMethod.requiresAccount && (
                        <>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                              Tên ngân hàng
                            </label>
                            <input
                              value={addForm.bankName || ""}
                              onChange={(e) =>
                                setAddForm((current) => ({
                                  ...current,
                                  bankName: e.target.value,
                                }))
                              }
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                              Số tài khoản
                            </label>
                            <input
                              value={addForm.accountNumber || ""}
                              onChange={(e) =>
                                setAddForm((current) => ({
                                  ...current,
                                  accountNumber: e.target.value,
                                }))
                              }
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                              Tên chủ tài khoản
                            </label>
                            <input
                              value={addForm.accountName || addForm.name || ""}
                              onChange={(e) =>
                                setAddForm((current) => ({
                                  ...current,
                                  accountName: e.target.value,
                                  name: e.target.value,
                                }))
                              }
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="px-4 py-4 border-t border-gray-100">
                  <button
                    onClick={handleAddRecipientAccount}
                    disabled={!addForm.methodId || !addForm.label}
                    className="w-full py-3.5 rounded-2xl text-white"
                    style={{
                      background:
                        addForm.methodId && addForm.label
                          ? "linear-gradient(135deg, #059669, #047857)"
                          : "#D1D5DB",
                      border: "none",
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    Lưu tài khoản
                  </button>
                </div>
              </div>
            )}

            <div className="px-4 pt-12 pb-4 space-y-3">
              <div>
                <h1 style={{ color: "#111827", fontSize: 24, fontWeight: 800 }}>
                  Tìm Deal
                </h1>
                <p style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}>
                  Tìm người phù hợp để chuyển tiền chéo
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF" }}>Tôi gửi bằng</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <select
                      value={need.senderCurrency}
                      onChange={(e) => changeSenderCurrency(e.target.value)}
                      className="border border-gray-200 rounded-xl px-3 py-3 bg-gray-50"
                      style={{ fontWeight: 700 }}
                    >
                      {CURRENCIES.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.flag} {currency.code}
                        </option>
                      ))}
                    </select>
                    <input
                      value={need.amount}
                      onChange={(e) => setNeedField("amount", e.target.value)}
                      className="border border-gray-200 rounded-xl px-3 py-3 bg-gray-50 text-right"
                      style={{ fontWeight: 800 }}
                    />
                  </div>
                  {previewRate > 0 && (
                    <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>
                      1 {need.senderCurrency} ≈ {fmtRate(previewRate, need.senderCurrency, need.recipientCurrency).split("/")[0]}
                    </p>
                  )}
                  {errors.amount && (
                    <p style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.amount}</p>
                  )}
                </div>

                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 8 }}>
                    Người thụ hưởng sẽ nhận bằng
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={need.recipientCurrency}
                      onChange={(e) => changeRecipientCurrency(e.target.value)}
                      className="border border-gray-200 rounded-xl px-3 py-3 bg-gray-50"
                      style={{ fontWeight: 700 }}
                    >
                      {availableRecipientCurrencies.map((code) => {
                        const c = getCurrency(code);
                        return (
                          <option key={code} value={code}>
                            {c?.flag} {code}
                          </option>
                        );
                      })}
                    </select>
                    <div className="rounded-xl px-3 py-3 bg-emerald-50 border border-emerald-200 flex items-center justify-end">
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#065F46" }}>
                        {previewAmount > 0 ? `≈ ${fmt(previewAmount, need.recipientCurrency)}` : "—"}
                      </span>
                    </div>
                  </div>
                  {previewRate > 0 && (
                    <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>
                      1 {need.senderCurrency} ≈ {fmtRate(previewRate, need.senderCurrency, need.recipientCurrency).split("/")[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
                <PaymentMethodSelector
                  currency={need.senderCurrency}
                  selected={need.senderPaymentMethods}
                  onToggle={(id) =>
                    setNeed((current) => ({
                      ...current,
                      senderPaymentMethods: current.senderPaymentMethods.includes(id)
                        ? current.senderPaymentMethods.filter((item) => item !== id)
                        : [...current.senderPaymentMethods, id],
                    }))
                  }
                  label={`Tôi gửi ${need.senderCurrency} bằng hình thức`}
                  selectionMode="checkbox"
                />
                <PaymentMethodSelector
                  currency={need.recipientCurrency}
                  selected={[need.recipientPaymentMethod]}
                  onToggle={(id) =>
                    setNeed((current) => ({
                      ...current,
                      recipientPaymentMethod: id,
                      recipientName: "",
                      recipientPhone: "",
                      recipientBank: "",
                      recipientAccount: "",
                    }))
                  }
                  label={`Người thụ hưởng nhận ${need.recipientCurrency} bằng hình thức`}
                  selectionMode="radio"
                />
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                <div className="flex items-center gap-2">
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                    Thông tin tài khoản người thụ hưởng
                  </p>
                  {recipientMethods.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                      <MethodIcon id={recipientMethods[0].id} icon={recipientMethods[0].icon} size={13} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#065F46" }}>
                        {recipientMethods[0].name}
                      </span>
                    </span>
                  )}
                </div>

                {selectedRecipientAccount ? (
                  <div className="rounded-xl p-3" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                          {selectedRecipientAccount.label}
                        </p>
                        <p style={{ fontSize: 12, color: "#6B7280" }}>
                          {selectedRecipientAccount.phone ||
                            selectedRecipientAccount.phoneNumber ||
                            selectedRecipientAccount.email ||
                            selectedRecipientAccount.handle ||
                            selectedRecipientAccount.accountNumber ||
                            ""}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedRecipientAccountId("")}
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        <X size={14} color="#9CA3AF" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl p-3 border border-dashed border-gray-200 bg-gray-50">
                    <p style={{ fontSize: 13, color: "#6B7280" }}>
                      Chưa chọn tài khoản người thụ hưởng.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPickAccount(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl"
                    style={{ background: "white", border: "1.5px solid #D1FAE5" }}
                  >
                    <Wallet size={14} color="#059669" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#059669" }}>
                      Chọn tài khoản
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setAddForm({ methodId: need.recipientPaymentMethod });
                      setShowAddAccount(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl"
                    style={{ background: "#059669", border: "none" }}
                  >
                    <Plus size={14} color="white" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
                      Thêm tài khoản
                    </span>
                  </button>
                </div>

                {errors.recipientName && (
                  <p style={{ color: "#EF4444", fontSize: 12 }}>{errors.recipientName}</p>
                )}
                {errors.recipientPhone && (
                  <p style={{ color: "#EF4444", fontSize: 12 }}>{errors.recipientPhone}</p>
                )}
                {errors.recipientAccount && (
                  <p style={{ color: "#EF4444", fontSize: 12 }}>{errors.recipientAccount}</p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                  Ghi chú
                </label>
                <textarea
                  value={need.message}
                  onChange={(e) => setNeedField("message", e.target.value)}
                  rows={3}
                  placeholder="Điều kiện, lưu ý thêm..."
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50"
                  style={{ resize: "vertical" }}
                />
              </div>

              <button
                onClick={handleSearch}
                className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #059669, #047857)",
                  fontSize: 16,
                  fontWeight: 700,
                  border: "none",
                }}
              >
                <Zap size={18} />
                Tìm Deal Phù Hợp
              </button>
            </div>
          </motion.div>
        )}

        {step === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-h-0 overflow-y-auto bg-gray-50"
          >
            <div className="px-5 pt-12 pb-5" style={{ background: "linear-gradient(135deg, #059669, #047857)" }}>
              <button
                onClick={() => setStep("input")}
                className="flex items-center gap-1 mb-3"
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.85)" }}
              >
                <ChevronLeft size={18} />
                <span style={{ fontSize: 14 }}>Thay đổi yêu cầu</span>
              </button>
              <div className="bg-white/15 rounded-2xl px-4 py-3">
                <p style={{ color: "white", fontSize: 15, fontWeight: 700 }}>
                  {need.senderCurrency} → {need.recipientCurrency}
                </p>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>
                  {need.amount} {need.senderCurrency}
                </p>
              </div>
            </div>
            <div className="px-4 py-4 space-y-3">
              {matchingDeals.length > 0 ? (
                matchingDeals.map((deal, index) => {
                  const receiveAmount = Number(need.amount) * deal.rate;
                  const isBest = index === 0;
                  return (
                    <motion.button
                      key={deal.id}
                      onClick={() => {
                        setSelectedDeal(deal);
                        setStep("confirm");
                      }}
                      className="w-full bg-white rounded-2xl p-4 shadow-sm border text-left"
                      style={{ borderColor: isBest ? "#059669" : "#E5E7EB", borderWidth: isBest ? 2 : 1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                            {deal.providerName}
                          </p>
                          <Stars rating={deal.providerRating} />
                        </div>
                        {deal.providerVerified && <BadgeCheck size={15} color="#2563EB" />}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="rounded-xl p-3" style={{ background: "#F9FAFB" }}>
                          <p style={{ fontSize: 10, color: "#9CA3AF" }}>Tỷ giá</p>
                          <p style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                            {fmtRate(deal.rate, deal.fromCurrency, deal.toCurrency)}
                          </p>
                        </div>
                        <div className="rounded-xl p-3" style={{ background: "#F9FAFB" }}>
                          <p style={{ fontSize: 10, color: "#9CA3AF" }}>Nhận</p>
                          <p style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                            {fmt(receiveAmount, deal.toCurrency)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(deal.senderPaymentMethods[0] ? [deal.senderPaymentMethods[0]] : []).map((id) => {
                          const method = getPaymentMethod(deal.fromCurrency, id);
                          return method ? (
                            <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "#ECFDF5", border: "1px solid #BBF7D0" }}>
                              <MethodIcon id={method.id} icon={method.icon} size={13} />
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#065F46" }}>{method.name}</span>
                            </span>
                          ) : null;
                        })}
                      </div>
                      <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: isBest ? "linear-gradient(135deg, #059669, #047857)" : "#F0FDF4" }}>
                        <Send size={14} color={isBest ? "white" : "#059669"} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: isBest ? "white" : "#059669" }}>
                          Chọn deal này
                        </span>
                      </div>
                    </motion.button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>
                    Chưa có deal phù hợp
                  </p>
                  <button
                    onClick={() => setStep("input")}
                    className="mt-4 px-5 py-3 rounded-xl text-white"
                    style={{ background: "#059669", border: "none" }}
                  >
                    Thay đổi yêu cầu
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        )}

        {step === "confirm" && selectedDeal && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-h-0 overflow-y-auto bg-gray-50"
          >
            <div className="px-5 pt-12 pb-5" style={{ background: "linear-gradient(135deg, #059669, #047857)" }}>
              <button
                onClick={() => setStep("results")}
                className="flex items-center gap-1 mb-4"
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.85)" }}
              >
                <ChevronLeft size={18} />
                <span style={{ fontSize: 14 }}>Chọn deal khác</span>
              </button>
              <h1 style={{ color: "white", fontSize: 20, fontWeight: 700 }}>
                Xác nhận deal
              </h1>
            </div>

            <div className="px-4 py-4 space-y-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedDeal.providerName} size={44} />
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                      {selectedDeal.providerName}
                    </p>
                    <Stars rating={selectedDeal.providerRating} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3" style={{ background: "#F9FAFB" }}>
                    <p style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>Bạn gửi</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
                      {fmt(Number(need.amount), selectedDeal.fromCurrency)}
                    </p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: "#F0FDF4" }}>
                    <p style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>Người nhận được</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "#065F46" }}>
                      {fmt(Number(need.amount) * selectedDeal.rate, selectedDeal.toCurrency)}
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: "#9CA3AF" }}>
                  Tỷ giá: {fmtRate(selectedDeal.rate, selectedDeal.fromCurrency, selectedDeal.toCurrency)}
                </p>
              </div>

              {(() => {
                const senderMethodId = need.senderPaymentMethods.find((m) => selectedDeal.senderPaymentMethods.includes(m)) ?? need.senderPaymentMethods[0] ?? "";
                const senderMethod = getPaymentMethod(selectedDeal.fromCurrency, senderMethodId);
                const providerAcc = PROVIDER_ACCOUNTS_INIT_FROM_BENEFICIARY.find(
                  (a) => a.methodId === senderMethodId && a.currency === selectedDeal.fromCurrency,
                );
                const recipientMethodObj = getPaymentMethod(selectedDeal.toCurrency, need.recipientPaymentMethod);
                return (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                    <div className="rounded-xl p-3" style={{ background: "#F0FDF4", border: "1.5px solid #6EE7B7" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#065F46", letterSpacing: 0.4, marginBottom: 6 }}>
                        💳 Bạn sẽ gửi tiền tới
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        {senderMethod && <MethodIcon id={senderMethod.id} icon={senderMethod.icon} size={14} />}
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#047857" }}>
                          {senderMethod?.name ?? senderMethodId} — {selectedDeal.providerName}
                        </span>
                      </div>
                      {providerAcc && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          {(providerAcc.phone || providerAcc.phoneNumber) && (
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#047857", letterSpacing: 0.4 }}>
                              {providerAcc.phone || providerAcc.phoneNumber}
                            </span>
                          )}
                          {providerAcc.email && (
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#047857" }}>
                              {providerAcc.email}
                            </span>
                          )}
                          {providerAcc.bankName && (
                            <span style={{ fontSize: 12, color: "#374151" }}>{providerAcc.bankName}</span>
                          )}
                          {providerAcc.accountNumber && (
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#047857", letterSpacing: 1 }}>
                              {providerAcc.accountNumber}
                            </span>
                          )}
                          {providerAcc.accountName && (
                            <span style={{ fontSize: 10, color: "#6B7280" }}>Chủ TK: {providerAcc.accountName}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {need.recipientName && (
                      <div className="rounded-xl p-3" style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#1E40AF", letterSpacing: 0.4, marginBottom: 6 }}>
                          👤 Người thụ hưởng
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          {recipientMethodObj && <MethodIcon id={recipientMethodObj.id} icon={recipientMethodObj.icon} size={14} />}
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8" }}>
                            {need.recipientName}
                          </span>
                        </div>
                        {need.recipientPhone && (
                          <p style={{ fontSize: 12, color: "#374151" }}>{need.recipientPhone}</p>
                        )}
                        {need.recipientBank && (
                          <p style={{ fontSize: 12, color: "#374151" }}>{need.recipientBank}</p>
                        )}
                        {need.recipientAccount && (
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#1D4ED8" }}>{need.recipientAccount}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              <button
                onClick={() => confirmRequest(selectedDeal)}
                className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #059669, #047857)", border: "none", fontSize: 16, fontWeight: 700 }}
              >
                <Send size={18} />
                Xác nhận deal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
