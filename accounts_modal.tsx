type AccountFormView = "list" | "form";

function PaymentAccountsModal({
  accounts,
  onSave,
  onClose,
}: {
  accounts: ProviderAccount[];
  onSave: (accounts: ProviderAccount[]) => void;
  onClose: () => void;
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
    onSave(accounts.filter((a) => a.id !== id));
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
    <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col">
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
            ? "Tài khoản thanh toán"
            : editTarget
              ? "Chỉnh sửa tài khoản"
              : "Thêm tài khoản"}
        </h2>
      </div>

      {view === "list" ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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
              {(
                [
                  "USD",
                  "EUR",
                  "GBP",
                  "SGD",
                  "AUD",
                  "JPY",
                  "KRW",
                  "THB",
                  "CNY",
                ] as const
              ).map((c) => {
                const ci = getCurrency(c);
                return (
                  <button
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      setForm((f) => ({
                        ...f,
                        currency: c,
                        methodId: undefined,
                      }));
                    }}
                    className="px-3 py-2 rounded-xl"
                    style={{
                      background: currency === c ? "#ECFDF5" : "#F9FAFB",
                      border: `2px solid ${currency === c ? PRIMARY_REQ : "#E5E7EB"}`,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: currency === c ? 700 : 400,
                        color: currency === c ? PRIMARY_REQ : "#374151",
                      }}
                    >
                      {ci?.flag} {c}
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
