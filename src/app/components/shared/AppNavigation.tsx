import { ArrowRight, BriefcaseBusiness, History, Home, Search, Wallet } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import {
  getCurrency,
  getPaymentMethod,
  timeAgo,
  formatVND,
  formatAmount,
  type Deal,
  type DealRequest,
} from "../../data/mockData";
import { MethodIcon } from "./MethodIcon";

export type AppTab = "overview" | "findDeals" | "manageDeals" | "history" | "accounts";

type BottomNavItem = {
  key: AppTab;
  label: string;
  icon: ReactNode;
};

export function AppBottomNav({
  tab,
  onTab,
  accent,
}: {
  tab: AppTab;
  onTab: (tab: AppTab) => void;
  accent: string;
}) {
  const items: BottomNavItem[] = [
    { key: "overview", label: "Overview", icon: <Home size={22} /> },
    { key: "findDeals", label: "Tìm deal", icon: <Search size={22} /> },
    { key: "manageDeals", label: "Quản lý deals", icon: <BriefcaseBusiness size={22} /> },
    { key: "history", label: "Lịch sử", icon: <History size={22} /> },
    { key: "accounts", label: "Tài khoản nhận", icon: <Wallet size={22} /> },
  ];

  return (
    <div className="flex items-center border-t border-gray-100 bg-white px-2" style={{ paddingBottom: 8 }}>
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onTab(item.key)}
          className="flex-1 flex flex-col items-center py-3 gap-1 relative"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <div style={{ color: tab === item.key ? accent : "#9CA3AF" }}>{item.icon}</div>
          <span
            style={{
              fontSize: 10,
              color: tab === item.key ? accent : "#9CA3AF",
              fontWeight: tab === item.key ? 700 : 400,
            }}
          >
            {item.label}
          </span>
          {tab === item.key && (
            <motion.div
              layoutId={`app-nav-${accent}`}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
              style={{ background: accent }}
            />
          )}
        </button>
      ))}
    </div>
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

function CompactDealCard({
  deal,
  onSelect,
}: {
  deal: Deal;
  onSelect?: (deal: Deal) => void;
}) {
  const from = getCurrency(deal.fromCurrency);
  const to = getCurrency(deal.toCurrency);

  return (
    <button
      onClick={() => onSelect?.(deal)}
      className="w-full text-left bg-white rounded-2xl px-3 py-2.5 shadow-sm border border-gray-100"
      style={{ cursor: onSelect ? "pointer" : "default" }}
    >
      <div className="flex items-center justify-between gap-2">
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{deal.providerName}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#2563EB", whiteSpace: "nowrap" }}>
          {fmtRate(deal.rate, deal.fromCurrency, deal.toCurrency)}
        </div>
      </div>
      <div className="flex items-center justify-between mt-1" style={{ fontSize: 11, color: "#6B7280" }}>
        <span>{from?.flag} {deal.fromCurrency} → {to?.flag} {deal.toCurrency} · {fmt(deal.minAmount, deal.fromCurrency)}–{fmt(deal.maxAmount, deal.fromCurrency)}</span>
      </div>
      <div className="flex items-center gap-1 flex-wrap mt-1.5">
        {deal.senderPaymentMethods.slice(0, 2).map((id) => {
          const method = getPaymentMethod(deal.fromCurrency, id);
          return method ? (
            <span key={id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
              <MethodIcon id={method.id} icon={method.icon} size={11} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#1D4ED8" }}>{method.name}</span>
            </span>
          ) : null;
        })}
        {onSelect && <span style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", marginLeft: "auto" }}>Xem deal</span>}
      </div>
    </button>
  );
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  completed:         { label: "Hoàn thành",    bg: "#D1FAE5", color: "#065F46" },
  pending:           { label: "Chờ chấp nhận", bg: "#FEF3C7", color: "#92400E" },
  waiting_accept:    { label: "Chờ chấp nhận", bg: "#FEF3C7", color: "#92400E" },
  accepted:          { label: "Chờ thanh toán", bg: "#DBEAFE", color: "#1E40AF" },
  payment_sent:      { label: "Chờ xác nhận",  bg: "#EDE9FE", color: "#5B21B6" },
  payment_confirmed: { label: "Đang chuyển",   bg: "#FEF3C7", color: "#B45309" },
  transfer_sent:     { label: "Chờ hoàn tất",  bg: "#D1FAE5", color: "#065F46" },
  rejected:          { label: "Từ chối",        bg: "#FEE2E2", color: "#991B1B" },
  cancelled:         { label: "Đã hủy",         bg: "#F3F4F6", color: "#4B5563" },
};

function CompactRequestCard({
  request,
  onClick,
}: {
  request: DealRequest;
  onClick?: () => void;
}) {
  const senderMethod = getPaymentMethod(request.fromCurrency, request.senderPaymentMethod);
  const recipientMethod = getPaymentMethod(request.toCurrency, request.recipientPaymentMethod);
  const s = STATUS_LABEL[request.status] ?? { label: request.status, bg: "#F3F4F6", color: "#4B5563" };
  return (
    <div
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl px-3 py-2.5 shadow-sm border border-gray-100"
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="flex items-center justify-between gap-2">
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{request.requesterName}</div>
        <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>
          {s.label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-1" style={{ fontSize: 12, color: "#374151" }}>
        <span style={{ fontWeight: 600 }}>{fmt(request.amount, request.fromCurrency)}</span>
        <ArrowRight size={12} color="#9CA3AF" />
        <span style={{ fontWeight: 600 }}>{fmt(request.receiveAmount, request.toCurrency)}</span>
        <span style={{ color: "#9CA3AF", fontSize: 11, marginLeft: 2 }}>{timeAgo(request.createdAt)}</span>
      </div>
      <div className="flex items-center gap-1 flex-wrap mt-1.5">
        {senderMethod && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <MethodIcon id={senderMethod.id} icon={senderMethod.icon} size={11} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "#065F46" }}>{senderMethod.name}</span>
          </span>
        )}
        {recipientMethod && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
            <MethodIcon id={recipientMethod.id} icon={recipientMethod.icon} size={11} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "#1E40AF" }}>{recipientMethod.name}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function OverviewScreen({
  accent,
  processingRequests,
  hotDeals,
  recentHistory,
  onOpenDeal,
  onOpenHistory,
}: {
  accent: string;
  processingRequests: DealRequest[];
  hotDeals: Deal[];
  recentHistory: DealRequest[];
  onOpenDeal?: (deal: Deal) => void;
  onOpenHistory?: (request: DealRequest) => void;
}) {
  const activeCount = processingRequests.filter((r) => r.status !== "completed" && r.status !== "cancelled" && r.status !== "rejected").length;
  const pendingCount = processingRequests.filter((r) => r.status === "pending" || r.status === "waiting_accept").length;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div style={{ background: `linear-gradient(135deg, ${accent}, #1D4ED8)` }} className="px-5 pt-12 pb-7 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative z-10">
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>Overview</p>
          <h1 style={{ color: "white", fontSize: 24, fontWeight: 800, marginTop: 2 }}>
            Tổng quan hoạt động
          </h1>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/15 backdrop-blur rounded-2xl p-3">
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 11 }}>Đang xử lý</p>
              <div style={{ color: "white", fontSize: 22, fontWeight: 800, marginTop: 2 }}>{activeCount}</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-2xl p-3">
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 11 }}>Chờ chấp nhận</p>
              <div style={{ color: "white", fontSize: 22, fontWeight: 800, marginTop: 2 }}>{pendingCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
                Giao dịch đang xử lý
              </h2>
              <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                Ưu tiên các giao dịch đang xử lý và deal chờ chấp nhận
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            {processingRequests.slice(0, 3).map((request) => (
              <CompactRequestCard
                key={request.id}
                request={request}
                onClick={() => onOpenHistory?.(request)}
              />
            ))}
            {processingRequests.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-center" style={{ color: "#9CA3AF", fontSize: 13 }}>
                Chưa có giao dịch nào đang xử lý
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
                Deal hot toàn hệ thống
              </h2>
              <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                Danh sách deal nổi bật có thể xem và kết nối ngay
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            {hotDeals.slice(0, 4).map((deal) => (
              <CompactDealCard key={deal.id} deal={deal} onSelect={onOpenDeal} />
            ))}
            {hotDeals.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-center" style={{ color: "#9CA3AF", fontSize: 13 }}>
                Chưa có deal hot nào
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
                Lịch sử gần đây
              </h2>
              <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                Các kết nối giao dịch gần nhất
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            {recentHistory.slice(0, 4).map((request) => (
              <CompactRequestCard key={request.id} request={request} onClick={() => onOpenHistory?.(request)} />
            ))}
            {recentHistory.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-center" style={{ color: "#9CA3AF", fontSize: 13 }}>
                Chưa có lịch sử giao dịch gần đây
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
