import { Building2, CreditCard, MapPin, Phone, UserRound } from "lucide-react";
import { type PaymentMethod } from "../../data/mockData";

type RecipientTone = {
  title: string;
  text: string;
  muted: string;
  label: string;
  icon: string;
};

const DEFAULT_TONE: RecipientTone = {
  title: "#1E40AF",
  text: "#1D4ED8",
  muted: "#9CA3AF",
  label: "#6B7280",
  icon: "#2563EB",
};

export type RecipientDetailsProps = {
  name: string;
  method?: PaymentMethod | null;
  phone?: string;
  bank?: string;
  account?: string;
  address?: string;
  mode?: "inline" | "stacked";
  showMethod?: boolean;
  tone?: Partial<RecipientTone>;
};

function mergeTone(tone?: Partial<RecipientTone>): RecipientTone {
  return { ...DEFAULT_TONE, ...tone };
}

export function RecipientDetails({
  name,
  method,
  phone,
  bank,
  account,
  address,
  mode = "stacked",
  showMethod = true,
  tone,
}: RecipientDetailsProps) {
  const t = mergeTone(tone);
  const isMomo = method?.id === "momo";
  const showsPhone = !!phone && (method?.requiresPhone || isMomo);
  const showsAccount = !!method?.requiresAccount;

  if (mode === "inline") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <UserRound size={13} color={t.icon} />
        <span style={{ color: t.text, fontSize: 13, fontWeight: 500 }}>
          {name}
        </span>
        {showsPhone && phone && (
          <span style={{ color: t.muted, fontSize: 12 }}>· {phone}</span>
        )}
        {showsAccount && bank && (
          <span style={{ color: t.muted, fontSize: 12 }}>· {bank}</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <UserRound size={14} color={t.icon} />
        <span style={{ fontSize: 14, fontWeight: 700, color: t.title }}>
          {name}
        </span>
      </div>

      {showMethod && method && !isMomo && (
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 15 }}>{method.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>
            {method.name}
          </span>
        </div>
      )}

      {showsPhone && phone && (
        isMomo ? (
          <div className="flex flex-col gap-0.5">
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: t.label,
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}
            >
              Số điện thoại
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: 0.3 }}>
              {phone}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Phone size={13} color={t.icon} />
            <span style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: 0.5 }}>
              {phone}
            </span>
          </div>
        )
      )}

      {showsAccount && bank && (
        <div className="flex items-center gap-2">
          <Building2 size={13} color={t.icon} />
          <span style={{ fontSize: 13, color: "#374151" }}>{bank}</span>
        </div>
      )}

      {showsAccount && account && (
        <div className="flex items-center gap-2">
          <CreditCard size={13} color={t.icon} />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: 1 }}>
            {account}
          </span>
        </div>
      )}

      {showsAccount && address && (
        <div className="flex items-center gap-2">
          <MapPin size={13} color={t.icon} />
          <span style={{ fontSize: 13, color: "#374151" }}>{address}</span>
        </div>
      )}
    </div>
  );
}
