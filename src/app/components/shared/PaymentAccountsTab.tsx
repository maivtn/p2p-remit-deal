import { useMemo, useState } from "react";
import { Check, Copy, ChevronLeft, Edit2, Plus, Trash2, Wallet, X } from "lucide-react";
import {
  CURRENCIES,
  getCurrency,
  getPaymentMethod,
  getPaymentMethodsByCurrency,
  type ProviderAccount,
} from "../../data/mockData";
import { MethodIcon } from "./MethodIcon";

type AccountFormView = "list" | "form";

export function PaymentAccountsTab({
  accounts,
  onSave,
  onClose,
  inline = false,
  accent,
  title = "Tài khoản nhận",
  subtitle = "Thêm, sửa hoặc xoá tài khoản nhận tiền",
}: {
  accounts: ProviderAccount[];
  onSave: (accounts: ProviderAccount[]) => void;
  onClose: () => void;
  inline?: boolean;
  accent: string;
  title?: string;
  subtitle?: string;
}) {
  const [view, setView] = useState<AccountFormView>("list");
  const [editTarget, setEditTarget] = useState<ProviderAccount | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [form, setForm] = useState<Partial<ProviderAccount>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const next: Record<string, ProviderAccount[]> = {};
    accounts.forEach((account) => {
      if (!next[account.currency]) next[account.currency] = [];
      next[account.currency].push(account);
    });
    return next;
  }, [accounts]);

  const openAdd = () => {
    setCurrency("USD");
    setForm({ currency: "USD" });
    setEditTarget(null);
    setView("form");
  };

  const openEdit = (account: ProviderAccount) => {
    setCurrency(account.currency);
    setForm({ ...account });
    setEditTarget(account);
    setView("form");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Xoá tài khoản này?")) return;
    onSave(accounts.filter((account) => account.id !== id));
  };

  const handleSave = () => {
    if (!form.methodId || !form.label) return;

    if (editTarget) {
      onSave(
        accounts.map((account) =>
          account.id === editTarget.id
            ? ({ ...account, ...form, currency } as ProviderAccount)
            : account,
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
    <div
      className={
        inline
          ? "flex-1 overflow-y-auto bg-gray-50 flex flex-col"
          : "absolute inset-0 z-50 bg-gray-50 flex flex-col"
      }
    >
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
            ? title
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
              {title}
            </p>
            <p style={{ fontSize: 13, color: "#047857", marginTop: 4 }}>
              {subtitle}
            </p>
            <div className="flex gap-2 flex-wrap mt-3">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: "white", color: "#047857" }}
              >
                {accounts.length} tài khoản
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: "white", color: "#047857" }}
              >
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

          {Object.entries(grouped).map(([currencyCode, accountsInCurrency]) => {
            const currencyInfo = getCurrency(currencyCode);
            return (
              <div key={currencyCode}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6B7280",
                    marginBottom: 8,
                  }}
                >
                  {currencyInfo?.flag} {currencyInfo?.name} ({currencyCode})
                </p>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {accountsInCurrency.map((account, index) => {
                    const method = getPaymentMethod(currencyCode, account.methodId);
                    const detail =
                      account.handle ||
                      account.phone ||
                      account.email ||
                      account.accountNumber ||
                      "";
                    const subDetail = account.bankName
                      ? `${account.bankName}${account.accountName ? ` · ${account.accountName}` : ""}`
                      : "";

                    return (
                      <div
                        key={account.id}
                        className="px-4 py-3"
                        style={{
                          borderBottom:
                            index < accountsInCurrency.length - 1
                              ? "1px solid #F3F4F6"
                              : "none",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "#EFF6FF" }}
                          >
                            {method ? (
                              <MethodIcon id={method.id} icon={method.icon} size={22} />
                            ) : (
                              <span style={{ fontSize: 20 }}>💳</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#111827",
                              }}
                            >
                              {account.label}
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
                                  onClick={() => handleCopy(detail, account.id + "d")}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 2,
                                    flexShrink: 0,
                                  }}
                                >
                                  {copied === account.id + "d" ? (
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
                              onClick={() => openEdit(account)}
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
                              onClick={() => handleDelete(account.id)}
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
              border: `2px dashed ${accent}`,
              cursor: "pointer",
            }}
          >
            <Plus size={18} color={accent} />
            <span style={{ fontSize: 14, fontWeight: 600, color: accent }}>
              Thêm tài khoản mới
            </span>
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div>
            <label style={labelStyle}>Loại tiền tệ</label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((currencyItem) => (
                <button
                  key={currencyItem.code}
                  onClick={() => {
                    setCurrency(currencyItem.code);
                    setForm((next) => ({
                      ...next,
                      currency: currencyItem.code,
                      methodId: undefined,
                    }));
                  }}
                  className="px-3 py-2 rounded-xl"
                  style={{
                    background:
                      currency === currencyItem.code ? "#EFF6FF" : "#F9FAFB",
                    border: `2px solid ${currency === currencyItem.code ? accent : "#E5E7EB"}`,
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: currency === currencyItem.code ? 700 : 400,
                      color: currency === currencyItem.code ? accent : "#374151",
                    }}
                  >
                    {currencyItem.flag} {currencyItem.code}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Hình thức thanh toán</label>
            <div className="flex flex-wrap gap-2">
              {getPaymentMethodsByCurrency(currency).map((method) => (
                <button
                  key={method.id}
                  onClick={() => setForm((next) => ({ ...next, methodId: method.id }))}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                  style={{
                    background:
                      form.methodId === method.id ? "#EFF6FF" : "#F9FAFB",
                    border: `2px solid ${form.methodId === method.id ? accent : "#E5E7EB"}`,
                    cursor: "pointer",
                  }}
                >
                  <MethodIcon id={method.id} icon={method.icon} size={15} />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: form.methodId === method.id ? 700 : 400,
                      color: form.methodId === method.id ? accent : "#374151",
                    }}
                  >
                    {method.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tên gợi nhớ</label>
            <input
              value={form.label || ""}
              onChange={(e) =>
                setForm((next) => ({ ...next, label: e.target.value }))
              }
              placeholder="Ví dụ: Zelle chính, PayPal cá nhân..."
              style={inputStyle}
            />
          </div>

          {selectedMethod && (
            <div
              className="space-y-3 p-4 rounded-2xl"
              style={{ background: "#F8FAFF", border: "1.5px solid #DBEAFE" }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: accent,
                  marginBottom: 4,
                }}
              >
                📋 Thông tin tài khoản
              </p>

              {selectedMethod.requiresPhone && (
                <div>
                  <label style={labelStyle}>Số điện thoại</label>
                  <input
                    value={form.phone || ""}
                    onChange={(e) =>
                      setForm((next) => ({ ...next, phone: e.target.value }))
                    }
                    placeholder="+84..."
                    style={inputStyle}
                  />
                </div>
              )}

              {selectedMethod.id === "paypal" && (
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    value={form.email || ""}
                    onChange={(e) =>
                      setForm((next) => ({ ...next, email: e.target.value }))
                    }
                    placeholder="email@example.com"
                    style={inputStyle}
                  />
                </div>
              )}

              {(selectedMethod.id === "bank_transfer" ||
                selectedMethod.requiresAccount) && (
                <>
                  <div>
                    <label style={labelStyle}>Ngân hàng</label>
                    <input
                      value={form.bankName || ""}
                      onChange={(e) =>
                        setForm((next) => ({ ...next, bankName: e.target.value }))
                      }
                      placeholder="VCB, Techcombank..."
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Số tài khoản</label>
                    <input
                      value={form.accountNumber || ""}
                      onChange={(e) =>
                        setForm((next) => ({
                          ...next,
                          accountNumber: e.target.value,
                        }))
                      }
                      placeholder="0123456789"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Tên chủ tài khoản</label>
                    <input
                      value={form.accountName || ""}
                      onChange={(e) =>
                        setForm((next) => ({
                          ...next,
                          accountName: e.target.value,
                        }))
                      }
                      placeholder="Nguyen Van A"
                      style={inputStyle}
                    />
                  </div>
                </>
              )}

              {selectedMethod.id === "venmo" && (
                <div>
                  <label style={labelStyle}>Venmo username</label>
                  <input
                    value={form.handle || ""}
                    onChange={(e) =>
                      setForm((next) => ({ ...next, handle: e.target.value }))
                    }
                    placeholder="@username"
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setView("list")}
              className="flex-1 py-3 rounded-2xl"
              style={{
                background: "#F3F4F6",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Huỷ
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-2xl"
              style={{
                background: accent,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                color: "white",
              }}
            >
              Lưu tài khoản
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
