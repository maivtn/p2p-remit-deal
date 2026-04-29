import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  CheckCircle2,
  Upload,
  AlertTriangle,
  Image,
  Video,
  Music,
  Trash2,
  ZoomIn,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { type ProofData, type ProofMediaFile } from "../../data/mockData";

// ── helpers ───────────────────────────────────────────────────
function detectMediaType(file: File): "image" | "video" | "audio" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "audio";
}

function MediaIcon({
  type,
  size = 16,
}: {
  type: "image" | "video" | "audio";
  size?: number;
}) {
  if (type === "image") return <Image size={size} />;
  if (type === "video") return <Video size={size} />;
  return <Music size={size} />;
}

// ── Lightbox ──────────────────────────────────────────────────
function Lightbox({
  files,
  startIndex,
  onClose,
}: {
  files: ProofMediaFile[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const file = files[idx];
  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(files.length - 1, i + 1));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.15)" }}
      >
        <X size={18} color="white" />
      </button>

      {/* Counter */}
      <p
        className="absolute top-4 left-4"
        style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}
      >
        {idx + 1} / {files.length}
      </p>

      {/* Content */}
      <div
        className="flex items-center justify-center w-full px-12"
        style={{ maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {file.type === "image" && (
          <img
            src={file.url}
            alt={file.name}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              borderRadius: 12,
              objectFit: "contain",
            }}
          />
        )}
        {file.type === "video" && (
          <video
            src={file.url}
            controls
            autoPlay
            style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 12 }}
          />
        )}
        {file.type === "audio" && (
          <div
            className="flex flex-col items-center gap-4 p-8 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.1)", minWidth: 260 }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.2)" }}
            >
              <Music size={36} color="#6EE7B7" />
            </div>
            <p
              style={{
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                textAlign: "center",
                maxWidth: 200,
              }}
            >
              {file.name}
            </p>
            <audio src={file.url} controls autoPlay style={{ width: "100%" }} />
          </div>
        )}
      </div>

      {/* Nav arrows */}
      {files.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            disabled={idx === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background:
                idx === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.2)",
            }}
          >
            <ChevronLeft size={20} color="white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            disabled={idx === files.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background:
                idx === files.length - 1
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.2)",
            }}
          >
            <ChevronRight size={20} color="white" />
          </button>
        </>
      )}

      {/* Filename */}
      <p
        className="absolute bottom-6"
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          maxWidth: 280,
          textAlign: "center",
        }}
      >
        {file.name}
      </p>
    </motion.div>
  );
}

// ── Media thumbnail tile ──────────────────────────────────────
function MediaTile({
  file,
  index,
  onRemove,
  onPreview,
}: {
  file: ProofMediaFile;
  index: number;
  onRemove?: () => void;
  onPreview: () => void;
}) {
  return (
    <div
      className="relative rounded-xl overflow-hidden flex-shrink-0 cursor-pointer group"
      style={{ width: 90, height: 90, background: "#1F2937" }}
      onClick={onPreview}
    >
      {file.type === "image" && (
        <img
          src={file.url}
          alt={file.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {file.type === "video" && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.25)" }}
          >
            <Play size={16} color="#6EE7B7" fill="#6EE7B7" />
          </div>
          <span
            style={{
              fontSize: 9,
              color: "#9CA3AF",
              textAlign: "center",
              padding: "0 4px",
              lineHeight: 1.2,
            }}
            className="line-clamp-2"
          >
            {file.name}
          </span>
        </div>
      )}
      {file.type === "audio" && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.25)" }}
          >
            <Music size={16} color="#A5B4FC" />
          </div>
          <span
            style={{
              fontSize: 9,
              color: "#9CA3AF",
              textAlign: "center",
              padding: "0 4px",
              lineHeight: 1.2,
            }}
            className="line-clamp-2"
          >
            {file.name}
          </span>
        </div>
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "rgba(0,0,0,0.45)" }}
      >
        <ZoomIn size={20} color="white" />
      </div>

      {/* Type badge */}
      <div
        className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded"
        style={{ background: "rgba(0,0,0,0.65)" }}
      >
        <div style={{ color: file.type === "audio" ? "#A5B4FC" : "#6EE7B7" }}>
          <MediaIcon type={file.type} size={10} />
        </div>
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "#EF4444" }}
        >
          <X size={10} color="white" />
        </button>
      )}
    </div>
  );
}

// ── Proof Card (display) ──────────────────────────────────────
export function ProofCard({
  proof,
  label,
}: {
  proof: ProofData;
  label?: string;
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const d = new Date(proof.timestamp);
  const dateStr = d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const media = proof.mediaFiles ?? [];

  return (
    <>
      <div
        className="overflow-hidden"
        style={{ background: "#F0FDF4" }}
      >
        {label && (
          <div
            className="  py-1.5 flex items-center gap-1.5"
            style={{ background: "#065F46" }}
          >
            <CheckCircle2 size={12} color="white" />
            <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>
              {label}
            </span>
          </div>
        )}
        <div className=" py-3">
          {/* Receipt row */}
          <div
            className="rounded-lg p-3 mb-2 border border-emerald-100"
            style={{ background: "white" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: 22 }}>{proof.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                  {proof.label}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: "#9CA3AF",
                    fontFamily: "monospace",
                  }}
                >
                  {proof.fakeRef}
                </p>
              </div>
              <div className="ml-auto">
                <span
                  style={{
                    background: "#D1FAE5",
                    color: "#065F46",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 10,
                  }}
                >
                  ✓ SUCCESS
                </span>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-2 mt-1">
              <p style={{ fontSize: 11, color: "#6B7280" }}>🕐 {dateStr}</p>
            </div>
          </div>

          {proof.note && (
            <p
              style={{
                fontSize: 12,
                color: "#374151",
                fontStyle: "italic",
                marginBottom: media.length ? 8 : 0,
              }}
            >
              "{proof.note}"
            </p>
          )}

          {/* Media thumbnails */}
          {media.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#065F46",
                  marginBottom: 6,
                }}
              >
                📎 {media.length} tệp đính kèm
              </p>
              <div className="flex gap-2 flex-wrap">
                {media.map((f, i) => (
                  <MediaTile
                    key={i}
                    file={f}
                    index={i}
                    onPreview={() => setLightboxIdx(i)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            files={media}
            startIndex={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Dual proof sections (detail screen) ───────────────────────
export function defaultOpenPaymentSection(status: string): boolean {
  return status === "accepted" || status === "payment_sent";
}

export function defaultOpenTransferSection(status: string): boolean {
  return ["payment_confirmed", "transfer_sent", "completed"].includes(status);
}

export function TransactionProofSections({
  status,
  paymentProof,
  transferProof,
  labels,
}: {
  status: string;
  paymentProof?: ProofData;
  transferProof?: ProofData;
  labels: { payment: string; transfer: string };
}) {
  const [openPayment, setOpenPayment] = useState(() =>
    defaultOpenPaymentSection(status),
  );
  const [openTransfer, setOpenTransfer] = useState(() =>
    defaultOpenTransferSection(status),
  );

  useEffect(() => {
    setOpenPayment(defaultOpenPaymentSection(status));
    setOpenTransfer(defaultOpenTransferSection(status));
  }, [status]);

  const summaryClass =
    "flex items-center justify-between w-full px-3 py-2.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden";
  const summaryStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    listStyle: "none",
    userSelect: "none",
  };

  return (
    <div className="mb-3 space-y-2">
      <details
        open={openPayment}
        onToggle={(e) => setOpenPayment(e.currentTarget.open)}
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: "#BFDBFE", background: "#EFF6FF" }}
      >
        <summary style={summaryStyle} className={summaryClass}>
          <span style={{ color: "#1E40AF" }}>{labels.payment}</span>
          <span style={{ color: "#3B82F6", fontSize: 11 }}>▾</span>
        </summary>
        <div
          className="px-3 pb-3"
          style={{ borderTop: "1px solid rgba(191,219,254,0.85)" }}
        >
          {paymentProof ? (
            <ProofCard proof={paymentProof} />
          ) : (
            <p
              style={{
                fontSize: 12,
                color: "#64748B",
                margin: 0,
                padding: "6px 0 4px",
              }}
            >
              Chưa có bằng chứng thanh toán.
            </p>
          )}
        </div>
      </details>
      <details
        open={openTransfer}
        onToggle={(e) => setOpenTransfer(e.currentTarget.open)}
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: "#6EE7B7", background: "#F0FDF4" }}
      >
        <summary
          style={{ ...summaryStyle, color: "#065F46" }}
          className={summaryClass}
        >
          <span>{labels.transfer}</span>
          <span style={{ color: "#059669", fontSize: 11 }}>▾</span>
        </summary>
        <div
          className="px-3 pb-3"
          style={{ borderTop: "1px solid rgba(110,231,183,0.65)" }}
        >
          {transferProof ? (
            <ProofCard proof={transferProof} />
          ) : (
            <p
              style={{
                fontSize: 12,
                color: "#64748B",
                margin: 0,
                padding: "6px 0 4px",
              }}
            >
              Chưa có bằng chứng chuyển tiền.
            </p>
          )}
        </div>
      </details>
    </div>
  );
}

// ── Proof Upload Modal ────────────────────────────────────────
interface ProofModalProps {
  title: string;
  subtitle?: string;
  allowedTypes?: string[];
  onConfirm: (proof: ProofData) => void;
  onClose: () => void;
  isDispute?: boolean;
}

export function ProofModal({
  title,
  subtitle,
  onConfirm,
  onClose,
  isDispute,
}: ProofModalProps) {
  const [note, setNote] = useState("");
  const [mediaFiles, setMediaFiles] = useState<ProofMediaFile[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accentColor = isDispute ? "#D97706" : "#059669";
  const bgLight = isDispute ? "#FEF3C7" : "#ECFDF5";
  const borderColor = isDispute ? "#FCD34D" : "#6EE7B7";

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files).slice(0, 10 - mediaFiles.length);
      const newFiles: ProofMediaFile[] = arr.map((f) => ({
        url: URL.createObjectURL(f),
        type: detectMediaType(f),
        name: f.name,
      }));
      setMediaFiles((prev) => [...prev, ...newFiles].slice(0, 10));
    },
    [mediaFiles.length],
  );

  const removeFile = (i: number) => {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[i].url);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const handleConfirm = () => {
    const proof: ProofData = {
      type: "upload",
      label: "Bằng chứng tải lên",
      icon:
        mediaFiles.length > 0
          ? mediaFiles[0].type === "image"
            ? "🖼️"
            : mediaFiles[0].type === "video"
              ? "🎬"
              : "🎵"
          : "📄",
      fakeRef:
        "REF-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      note,
      timestamp: new Date().toISOString(),
      mediaFiles,
    };
    onConfirm(proof);
  };

  const canConfirm = mediaFiles.length > 0 || note.trim().length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: "rgba(0,0,0,0.6)" }}
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
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between border-b border-gray-100"
            style={{ background: isDispute ? "#FFF7ED" : "#F0FDF4" }}
          >
            <div>
              <div className="flex items-center gap-2">
                {isDispute ? (
                  <AlertTriangle size={18} color="#D97706" />
                ) : (
                  <Upload size={18} color="#059669" />
                )}
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                  {title}
                </h2>
              </div>
              {subtitle && (
                <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
            >
              <X size={16} color="#6B7280" />
            </button>
          </div>

          <div
            className="overflow-y-auto px-5 py-4 space-y-4"
            style={{ maxHeight: "calc(92vh - 140px)" }}
          >
            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
              style={{
                padding: "20px 12px",
                border: `2px dashed ${dragOver ? accentColor : borderColor}`,
                background: dragOver ? bgLight : "#FAFAFA",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: bgLight }}
                >
                  <Image size={18} color={accentColor} />
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: bgLight }}
                >
                  <Video size={18} color={accentColor} />
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: bgLight }}
                >
                  <Music size={18} color={accentColor} />
                </div>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: accentColor }}>
                Chọn hoặc kéo thả tệp vào đây
              </p>
              <p
                style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center" }}
              >
                Hỗ trợ ảnh, video, audio · Tối đa 10 tệp
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                style={{ display: "none" }}
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </div>

            {/* Uploaded files preview */}
            {mediaFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p
                    style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
                  >
                    📎 {mediaFiles.length} tệp đã chọn
                  </p>
                  <button
                    onClick={() => {
                      mediaFiles.forEach((f) => URL.revokeObjectURL(f.url));
                      setMediaFiles([]);
                    }}
                    style={{
                      fontSize: 11,
                      color: "#EF4444",
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Xoá tất cả
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {mediaFiles.map((f, i) => (
                    <MediaTile
                      key={i}
                      file={f}
                      index={i}
                      onRemove={() => removeFile(i)}
                      onPreview={() => setLightboxIdx(i)}
                    />
                  ))}
                  {/* Add more */}
                  {mediaFiles.length < 10 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl flex flex-col items-center justify-center gap-1 flex-shrink-0"
                      style={{
                        width: 90,
                        height: 90,
                        border: `2px dashed ${borderColor}`,
                        background: bgLight,
                        cursor: "pointer",
                      }}
                    >
                      <Upload size={18} color={accentColor} />
                      <span
                        style={{
                          fontSize: 10,
                          color: accentColor,
                          fontWeight: 600,
                        }}
                      >
                        Thêm
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Note */}
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                📝 {isDispute ? "Mô tả vấn đề" : "Ghi chú / Mô tả"}
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  isDispute
                    ? "Mô tả chi tiết vấn đề khiếu nại..."
                    : "Ví dụ: Đã chuyển đủ số tiền, mã GD: ..."
                }
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 resize-none"
                style={{ fontSize: 14 }}
              />
            </div>

            {/* Ready banner */}
            {canConfirm && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{ background: "#ECFDF5", border: "1.5px solid #6EE7B7" }}
              >
                <CheckCircle2 size={18} color="#059669" />
                <div>
                  <p
                    style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}
                  >
                    ✅ Sẵn sàng gửi
                  </p>
                  <p style={{ fontSize: 11, color: "#059669" }}>
                    {mediaFiles.length > 0
                      ? `${mediaFiles.length} tệp`
                      : "Ghi chú"}{" "}
                    đã sẵn sàng
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl"
              style={{
                background: "#F3F4F6",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                color: "#6B7280",
              }}
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="flex-1 py-3 rounded-xl"
              style={{
                background: canConfirm
                  ? isDispute
                    ? "#D97706"
                    : "#059669"
                  : "#E5E7EB",
                border: "none",
                cursor: canConfirm ? "pointer" : "not-allowed",
                fontSize: 14,
                fontWeight: 700,
                color: canConfirm ? "white" : "#9CA3AF",
              }}
            >
              {isDispute ? "⚠️ Gửi khiếu nại" : "✅ Xác nhận gửi"}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Lightbox (portal level) */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            files={mediaFiles}
            startIndex={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Escrow Info Banner ────────────────────────────────────────
export function EscrowBanner({
  label,
  amount,
  currency,
  icon,
}: {
  label: string;
  amount: number;
  currency: string;
  icon: string;
}) {
  const fmt = (n: number) => {
    if (currency === "VND")
      return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "₫";
    return (
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n) +
      " " +
      currency
    );
  };
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ background: "#FFFBEB", border: "1.5px solid #FCD34D" }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div className="flex-1">
        <p style={{ fontSize: 11, color: "#92400E", fontWeight: 600 }}>
          {label}
        </p>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#D97706" }}>
          {fmt(amount)}
        </p>
      </div>
      <span
        style={{
          fontSize: 11,
          color: "#92400E",
          background: "#FEF3C7",
          padding: "2px 8px",
          borderRadius: 8,
          fontWeight: 600,
        }}
      >
        🔒 Đang giữ
      </span>
    </div>
  );
}

// ── Step Progress Bar ─────────────────────────────────────────
const STEPS: { key: string; label: string }[] = [
  { key: "accepted", label: "Chờ TT" },
  { key: "payment_sent", label: "XN nhận" },
  { key: "payment_confirmed", label: "Đang CK" },
  { key: "transfer_sent", label: "XN giao" },
  { key: "completed", label: "Xong ✓" },
];

export function StepProgress({ status }: { status: string }) {
  const idx = STEPS.findIndex((s) => s.key === status);
  if (idx < 0) return null;
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background:
                  i < idx ? "#059669" : i === idx ? "#2563EB" : "#E5E7EB",
                fontSize: 10,
                color: i <= idx ? "white" : "#9CA3AF",
                fontWeight: 700,
              }}
            >
              {i < idx ? "✓" : i + 1}
            </div>
            <p
              style={{
                fontSize: 9,
                color: i === idx ? "#2563EB" : i < idx ? "#059669" : "#9CA3AF",
                marginTop: 2,
                textAlign: "center",
                fontWeight: i === idx ? 700 : 400,
              }}
            >
              {step.label}
            </p>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className="h-0.5 flex-1"
              style={{
                background: i < idx ? "#059669" : "#E5E7EB",
                marginBottom: 14,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
