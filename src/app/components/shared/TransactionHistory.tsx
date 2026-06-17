import { useMemo, useState } from "react";
import { ArrowRight, ChevronRight, Inbox } from "lucide-react";
import { motion } from "motion/react";
import {
  formatAmount,
  formatVND,
  getCurrency,
  getPaymentMethod,
  timeAgo,
  type DealRequest,
} from "../../data/mockData";
import { MethodIcon } from "./MethodIcon";

export type HistoryFilter =
  | "all"
  | "processing"
  | "pending"
  | "waiting_accept"
  | "completed"
  | "disputed";

const HISTORY_FILTERS: Array<{
  key: HistoryFilter;
  label: string;
  statuses: DealRequest["status"][] | null;
}> = [
  { key: "all", label: "All", statuses: null },
  {
    key: "processing",
    label: "Đang xử lý",
    statuses: ["accepted", "payment_sent", "payment_confirmed", "transfer_sent"],
  },
  { key: "pending", label: "Chờ xử lý", statuses: ["pending"] },
  { key: "waiting_accept", label: "Chờ chấp nhận", statuses: ["waiting_accept"] },
  { key: "completed", label: "Hoàn thành", statuses: ["completed"] },
  { key: "disputed", label: "Khiếu nại", statuses: ["disputed"] },
];

function fmt(amount: number, code: string) {
  if (code === "VND") return formatVND(amount);
  return formatAmount(amount, code);
}

function HistoryStatusBadge({ status }: { status: DealRequest["status"] }) {
  const map: Record<DealRequest["status"], { label: string; bg: string; fg: string }> = {
    pending: { label: "Chờ xử lý", bg: "#FEF3C7", fg: "#92400E" },
    waiting_accept: { label: "Chờ chấp nhận", bg: "#DBEAFE", fg: "#1E40AF" },
    accepted: { label: "Đang xử lý", bg: "#EDE9FE", fg: "#5B21B6" },
    payment_sent: { label: "Đang xử lý", bg: "#EDE9FE", fg: "#5B21B6" },
    payment_confirmed: { label: "Đang xử lý", bg: "#FEF3C7", fg: "#B45309" },
    transfer_sent: { label: "Đang xử lý", bg: "#D1FAE5", fg: "#065F46" },
    completed: { label: "Hoàn thành", bg: "#D1FAE5", fg: "#065F46" },
    rejected: { label: "Từ chối", bg: "#FEE2E2", fg: "#991B1B" },
    cancelled: { label: "Đã huỷ", bg: "#F3F4F6", fg: "#4B5563" },
    disputed: { label: "Khiếu nại", bg: "#FFF7ED", fg: "#9A3412" },
  };
  const s = map[status];
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

function HistoryRequestCard({
  request,
  title,
  accent,
  onOpenDetail,
}: {
  request: DealRequest;
  title: string;
  accent: string;
  onOpenDetail?: (requestId: string) => void;
}) {
  const senderMethod = getPaymentMethod(
    request.fromCurrency,
    request.senderPaymentMethod,
  );
  const recipientMethod = getPaymentMethod(
    request.toCurrency,
    request.recipientPaymentMethod,
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            {timeAgo(request.createdAt)}
          </div>
        </div>
        <HistoryStatusBadge status={request.status} />
      </div>

      <div className="rounded-xl p-3 mt-3" style={{ background: "#F9FAFB" }}>
        <div className="flex items-center gap-1 flex-wrap mb-2">
          <span style={{ fontSize: 10, color: "#9CA3AF" }}>Tuyến:</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>
            {getCurrency(request.fromCurrency)?.flag} {request.fromCurrency}
          </span>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>→</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>
            {getCurrency(request.toCurrency)?.flag} {request.toCurrency}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 mb-1">
          <div>
            <p style={{ fontSize: 10, color: "#9CA3AF" }}>Số tiền gửi</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
              {fmt(request.amount, request.fromCurrency)}
            </p>
            {senderMethod && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg mt-1" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                <MethodIcon id={senderMethod.id} icon={senderMethod.icon} size={13} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#1D4ED8" }}>
                  {senderMethod.name}
                </span>
              </span>
            )}
          </div>
          <ArrowRight size={14} color="#9CA3AF" />
          <div className="text-right">
            <p style={{ fontSize: 10, color: "#9CA3AF" }}>Số tiền nhận</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: accent }}>
              {fmt(request.receiveAmount, request.toCurrency)}
            </p>
            {recipientMethod && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg mt-1" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                <MethodIcon id={recipientMethod.id} icon={recipientMethod.icon} size={13} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#065F46" }}>
                  {recipientMethod.name}
                </span>
              </span>
            )}
          </div>
        </div>

        <p style={{ fontSize: 10, color: "#9CA3AF" }}>
          Tỷ giá: {fmt(request.rate, request.toCurrency)}/{request.fromCurrency}
        </p>
      </div>

      <button
        onClick={() => onOpenDetail?.(request.id)}
        className="w-full py-2 rounded-xl flex items-center justify-center gap-1.5 mt-3"
        style={{
          background: "#ECFDF5",
          border: "1px solid #6EE7B7",
          cursor: onOpenDetail ? "pointer" : "default",
        }}
      >
        <ChevronRight size={14} color={accent} />
        <span style={{ color: accent, fontSize: 12, fontWeight: 700 }}>
          Xem chi tiết giao dịch
        </span>
      </button>
    </motion.div>
  );
}

export function TransactionHistoryTab({
  title,
  subtitle,
  requests,
  accent,
  onOpenDetail,
  getRequestTitle,
}: {
  title: string;
  subtitle: string;
  requests: DealRequest[];
  accent: string;
  onOpenDetail?: (requestId: string) => void;
  getRequestTitle: (request: DealRequest) => string;
}) {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const counts = useMemo(() => {
    const byStatus = (statuses: DealRequest["status"][] | null) =>
      statuses === null
        ? requests.length
        : requests.filter((request) => statuses.includes(request.status)).length;

    return HISTORY_FILTERS.reduce<Record<HistoryFilter, number>>((acc, item) => {
      acc[item.key] = byStatus(item.statuses);
      return acc;
    }, {
      all: 0,
      processing: 0,
      pending: 0,
      waiting_accept: 0,
      completed: 0,
      disputed: 0,
    });
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const selected = HISTORY_FILTERS.find((item) => item.key === filter);
    if (!selected || selected.statuses === null) {
      return [...requests].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }

    return requests
      .filter((request) => selected.statuses?.includes(request.status))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [filter, requests]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div
        className="px-5 pt-12 pb-4"
        style={{ background: `linear-gradient(135deg, ${accent}, #1D4ED8)` }}
      >
        <h1 style={{ color: "white", fontSize: 22, fontWeight: 700 }}>
          {title}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 }}>
          {subtitle}
        </p>
      </div>

      <div className="flex gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto">
        {HISTORY_FILTERS.map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            style={{
              background: filter === item.key ? accent : "#F3F4F6",
              color: filter === item.key ? "white" : "#6B7280",
              border: "none",
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {item.label} ({counts[item.key] ?? 0})
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-3">
        {filteredRequests.map((request) => (
          <HistoryRequestCard
            key={request.id}
            request={request}
            title={getRequestTitle(request)}
            accent={accent}
            onOpenDetail={onOpenDetail}
          />
        ))}

        {filteredRequests.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <Inbox size={44} color="#E5E7EB" />
            <p style={{ color: "#9CA3AF", marginTop: 10, fontSize: 15 }}>
              Chưa có giao dịch nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
