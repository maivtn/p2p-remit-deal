export interface Currency {
  code: string;
  name: string;
  flag: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  {
    code: "VND",
    name: "Việt Nam Đồng",
    flag: "🇻🇳",
    symbol: "₫",
  },
  { code: "USD", name: "Đô la Mỹ", flag: "🇺🇸", symbol: "$" },
  { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€" },
  { code: "GBP", name: "Bảng Anh", flag: "🇬🇧", symbol: "£" },
  { code: "JPY", name: "Yên Nhật", flag: "🇯🇵", symbol: "¥" },
  {
    code: "KRW",
    name: "Won Hàn Quốc",
    flag: "🇰🇷",
    symbol: "₩",
  },
  { code: "AUD", name: "Đô la Úc", flag: "🇦🇺", symbol: "A$" },
  {
    code: "SGD",
    name: "Đô la Singapore",
    flag: "🇸🇬",
    symbol: "S$",
  },
  { code: "THB", name: "Baht Thái", flag: "🇹🇭", symbol: "฿" },
  { code: "CNY", name: "Nhân dân tệ", flag: "🇨🇳", symbol: "¥" },
];

export const getCurrency = (code: string) =>
  CURRENCIES.find((c) => c.code === code);

export const formatVND = (amount: number): string =>
  new Intl.NumberFormat("vi-VN").format(Math.round(amount)) +
  "₫";

export const formatAmount = (
  amount: number,
  code: string,
): string => {
  const c = getCurrency(code);
  if (!c) return amount.toString();
  if (code === "VND") return formatVND(amount);
  if (code === "JPY" || code === "KRW")
    return (
      c.symbol +
      new Intl.NumberFormat("en-US").format(Math.round(amount))
    );
  return (
    c.symbol +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  );
};

const NOW = new Date("2026-02-26T12:00:00");
export const timeAgo = (dateStr: string): string => {
  const d = new Date(dateStr);
  const diffMs = NOW.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffH < 24) return `${diffH} giờ trước`;
  return `${diffD} ngày trước`;
};

const AVATAR_COLORS = [
  "#4F46E5",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#F97316",
  "#06B6D4",
];
export const getAvatarBg = (name: string): string => {
  const idx =
    name.split("").reduce((s, c) => s + c.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};
export const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  return (parts[parts.length - 1][0] ?? "U").toUpperCase();
};

// ── Provider Payment Accounts (shared) ───────────────────────
export interface ProviderAccount {
  id: string;
  methodId: string;
  currency: string;
  label: string;
  phone?: string;
  email?: string;
  handle?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}


export const REQUESTER_ACCOUNTS_INIT: ProviderAccount[] = [
  {
    id: "ra1",
    methodId: "bank_transfer",
    currency: "VND",
    label: "Vietcombank chính",
    bankName: "VCB",
    accountNumber: "0123456789",
    accountName: "Nguyen Van A",
  },
  {
    id: "ra2",
    methodId: "momo",
    currency: "VND",
    label: "Ví MoMo",
    phone: "0901234567",
    accountName: "Nguyen Van A",
  },
  {
    id: "ra3",
    methodId: "bank_transfer",
    currency: "VND",
    label: "Techcombank phụ",
    bankName: "Techcombank",
    accountNumber: "0987654321",
    accountName: "Nguyen Van A",
  },
  {
    id: "ra4",
    methodId: "zelle",
    currency: "USD",
    label: "Zelle cá nhân",
    phone: "+1 (415) 555-0128",
    accountName: "Nguyen Van A",
  },
  {
    id: "ra5",
    methodId: "paypal",
    currency: "USD",
    label: "PayPal USD",
    email: "van.a.remit@gmail.com",
    accountName: "Nguyen Van A",
  },
  {
    id: "ra6",
    methodId: "bank_transfer",
    currency: "EUR",
    label: "SEPA Euro",
    bankName: "ING",
    accountNumber: "NL91INGB0001234567",
    accountName: "Nguyen Van A",
  },
];

export const PROVIDER_ACCOUNTS_INIT: ProviderAccount[] = [
  {
    id: "pa1",
    methodId: "zelle",
    currency: "USD",
    label: "Zelle chính",
    phone: "+1 (408) 555-0199",
  },
  {
    id: "pa2",
    methodId: "venmo",
    currency: "USD",
    label: "Venmo",
    handle: "@nguyenvanb",
  },
  {
    id: "pa3",
    methodId: "paypal",
    currency: "USD",
    label: "PayPal",
    email: "vanb.remit@gmail.com",
  },
  {
    id: "pa4",
    methodId: "bank_transfer",
    currency: "USD",
    label: "Chase Bank",
    bankName: "Chase Bank",
    accountNumber: "****4821",
    accountName: "Nguyen Van B",
  },
  {
    id: "pa5",
    methodId: "bank_transfer",
    currency: "EUR",
    label: "SEPA – Deutsche",
    bankName: "Deutsche Bank",
    accountNumber: "DE89370400440532013000",
    accountName: "Nguyen Van B",
  },
];

// ── Payment methods by currency/country ──────────────────────
export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  requiresPhone?: boolean; // MoMo, ZaloPay, PayNow, PromptPay...
  requiresAccount?: boolean; // Bank Transfer
}

export const PAYMENT_METHODS_BY_CURRENCY: Record<
  string,
  PaymentMethod[]
> = {
  USD: [
    {
      id: "zelle",
      name: "Zelle",
      icon: "⚡",
      requiresPhone: true,
    },
    {
      id: "venmo",
      name: "Venmo",
      icon: "V",
      requiresPhone: true,
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: "🅿️",
      requiresPhone: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: "🏦",
      requiresAccount: true,
    },
  ],
  EUR: [
    {
      id: "paypal",
      name: "PayPal",
      icon: "🅿️",
      requiresPhone: true,
    },
    {
      id: "sepa",
      name: "SEPA Transfer",
      icon: "🇪🇺",
      requiresAccount: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: "🏦",
      requiresAccount: true,
    },
  ],
  GBP: [
    {
      id: "paypal",
      name: "PayPal",
      icon: "🅿️",
      requiresPhone: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: "🏦",
      requiresAccount: true,
    },
  ],
  SGD: [
    {
      id: "paynow",
      name: "PayNow",
      icon: "📱",
      requiresPhone: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: "🏦",
      requiresAccount: true,
    },
  ],
  AUD: [
    {
      id: "payid",
      name: "PayID",
      icon: "📱",
      requiresPhone: true,
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: "🅿️",
      requiresPhone: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: "🏦",
      requiresAccount: true,
    },
  ],
  JPY: [
    {
      id: "paypay",
      name: "PayPay",
      icon: "📱",
      requiresPhone: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: "🏦",
      requiresAccount: true,
    },
  ],
  KRW: [
    {
      id: "kakaopay",
      name: "KakaoPay",
      icon: "💛",
      requiresPhone: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: "🏦",
      requiresAccount: true,
    },
  ],
  THB: [
    {
      id: "promptpay",
      name: "PromptPay",
      icon: "📱",
      requiresPhone: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: "🏦",
      requiresAccount: true,
    },
  ],
  CNY: [
    {
      id: "wechat_pay",
      name: "WeChat Pay",
      icon: "💚",
      requiresPhone: true,
    },
    {
      id: "alipay",
      name: "Alipay",
      icon: "🔵",
      requiresPhone: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: "🏦",
      requiresAccount: true,
    },
  ],
  VND: [
    {
      id: "momo",
      name: "MoMo",
      icon: "🟣",
      requiresPhone: true,
    },
    {
      id: "zalopay",
      name: "ZaloPay",
      icon: "🔵",
      requiresPhone: true,
    },
    {
      id: "bank_transfer",
      name: "Chuyển khoản NH",
      icon: "🏦",
      requiresAccount: true,
    },
  ],
};

export const getPaymentMethod = (
  currency: string,
  id: string,
): PaymentMethod | undefined =>
  PAYMENT_METHODS_BY_CURRENCY[currency]?.find(
    (m) => m.id === id,
  );

// ── Deal & DealRequest interfaces ─────────────────────────────
export interface Deal {
  id: string;
  providerId: string;
  providerName: string;
  providerRating: number;
  providerReviews: number;
  providerVerified: boolean;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  minAmount: number;
  maxAmount: number;
  status: "active" | "paused" | "expired";
  requestCount: number;
  completedDeals: number;
  expiresAt: string;
  notes: string;
  transferTime: string;
  senderPaymentMethods: string[]; // how provider accepts from sender
  recipientPaymentMethods: string[]; // how provider sends to recipient
}

export type TxStatus =
  | "pending"
  | "waiting_accept"
  | "accepted"
  | "payment_sent"
  | "payment_confirmed"
  | "transfer_sent"
  | "completed"
  | "rejected"
  | "cancelled"
  | "disputed";

export interface ProofData {
  type: string;
  label: string;
  icon: string;
  fakeRef: string;
  note: string;
  timestamp: string;
  mediaFiles?: ProofMediaFile[];
}

export interface ProofMediaFile {
  url: string;
  type: 'image' | 'video' | 'audio';
  name: string;
}

export interface DealRequest {
  id: string;
  dealId: string;
  requesterId: string;
  requesterName: string;
  requesterRating: number;
  providerName: string;
  providerId: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  receiveAmount: number;
  status: TxStatus;
  createdAt: string;
  message: string;
  senderPaymentMethod: string;
  recipientPaymentMethod: string;
  recipientName: string;
  recipientPhone?: string;
  recipientBank?: string;
  recipientAccount?: string;
  recipientAddress?: string;
  // Provider payment info (for requester to send payment)
  providerPaymentAccount?: string; // e.g. Zelle phone/email, Venmo handle, PayPal email
  memo?: string; // transfer memo/reference
  providerEmail?: string; // PayPal, bank email
  providerBank?: string; // Bank transfer - bank name
  providerBankAccount?: string; // Bank transfer - account number
  // Escrow & Fee (set when accepted)
  systemFeeRate: number;
  systemFeeAmount: number;
  escrowLocked: boolean;
  // Proof chain
  paymentProof?: ProofData;
  paymentConfirmedAt?: string;
  transferProof?: ProofData;
  completedAt?: string;
  // Dispute
  disputedBy?: "requester" | "provider";
  disputeNote?: string;
  disputeProof?: ProofData;
  disputedAt?: string;
}

// ── System wallet balances (mock) ─────────────────────────────
export const PROVIDER_WALLET_INIT: Record<string, number> = {
  USD: 18500,
  VND: 480_000_000,
  EUR: 6200,
};
export const REQUESTER_WALLET_INIT: Record<string, number> = {
  USD: 4800,
};

// ── Provider's own deals ──────────────────────────────────────
export const PROVIDER_DEALS_INIT: Deal[] = [
  {
    id: "d1",
    providerId: "self",
    providerName: "Nguyễn Văn B",
    providerRating: 4.9,
    providerReviews: 248,
    providerVerified: true,
    fromCurrency: "USD",
    toCurrency: "VND",
    rate: 25600,
    minAmount: 100,
    maxAmount: 5000,
    status: "active",
    requestCount: 3,
    completedDeals: 248,
    expiresAt: "2026-03-10T00:00:00",
    notes: "Chuyển nhanh 1-2 giờ.",
    transferTime: "1-2 giờ",
    senderPaymentMethods: [
      "zelle",
      "venmo",
      "paypal",
      "bank_transfer",
    ],
    recipientPaymentMethods: [
      "momo",
      "zalopay",
      "bank_transfer",
      ],
  },
  {
    id: "d2",
    providerId: "self",
    providerName: "Nguyễn Văn B",
    providerRating: 4.9,
    providerReviews: 248,
    providerVerified: true,
    fromCurrency: "EUR",
    toCurrency: "VND",
    rate: 27900,
    minAmount: 50,
    maxAmount: 2000,
    status: "active",
    requestCount: 1,
    completedDeals: 248,
    expiresAt: "2026-03-08T00:00:00",
    notes: "EUR → VND tỷ giá tốt.",
    transferTime: "2-4 giờ",
    senderPaymentMethods: ["paypal", "sepa", "bank_transfer"],
    recipientPaymentMethods: [
      "momo",
      "zalopay",
      "bank_transfer",
    ],
  },
  {
    id: "d3",
    providerId: "self",
    providerName: "Nguyễn Văn B",
    providerRating: 4.9,
    providerReviews: 248,
    providerVerified: true,
    fromCurrency: "USD",
    toCurrency: "VND",
    rate: 25480,
    minAmount: 500,
    maxAmount: 20000,
    status: "paused",
    requestCount: 0,
    completedDeals: 248,
    expiresAt: "2026-03-15T00:00:00",
    notes: "Chỉ xử lý lượng lớn, liên hệ trước.",
    transferTime: "Trong ngày",
    senderPaymentMethods: ["bank_transfer", "zelle"],
    recipientPaymentMethods: ["bank_transfer"],
  },
];

// ── Available deals on marketplace ───────────────────────────
export const AVAILABLE_DEALS: Deal[] = [
  {
    id: "ad1",
    providerId: "p1",
    providerName: "Hùng Mạnh",
    providerRating: 4.9,
    providerReviews: 512,
    providerVerified: true,
    fromCurrency: "USD",
    toCurrency: "VND",
    rate: 25520,
    minAmount: 50,
    maxAmount: 10000,
    status: "active",
    requestCount: 5,
    completedDeals: 512,
    expiresAt: "2026-03-15T00:00:00",
    notes: "Chuyển trong 30-60 phút. Hỗ trợ mọi hình thức.",
    transferTime: "30-60 phút",
    senderPaymentMethods: [
      "zelle",
      "venmo",
      "paypal",
      "bank_transfer",
    ],
    recipientPaymentMethods: [
      "momo",
      "zalopay",
      "bank_transfer",
      ],
  },
  {
    id: "ad2",
    providerId: "p2",
    providerName: "Thu Hà",
    providerRating: 4.8,
    providerReviews: 187,
    providerVerified: true,
    fromCurrency: "USD",
    toCurrency: "VND",
    rate: 25480,
    minAmount: 100,
    maxAmount: 3000,
    status: "active",
    requestCount: 2,
    completedDeals: 187,
    expiresAt: "2026-03-10T00:00:00",
    notes: "Chuyển trong ngày.",
    transferTime: "1-3 giờ",
    senderPaymentMethods: ["zelle", "paypal"],
    recipientPaymentMethods: ["momo", "bank_transfer"],
  },
  {
    id: "ad3",
    providerId: "p3",
    providerName: "Đức Anh",
    providerRating: 4.6,
    providerReviews: 94,
    providerVerified: false,
    fromCurrency: "USD",
    toCurrency: "VND",
    rate: 25460,
    minAmount: 200,
    maxAmount: 5000,
    status: "active",
    requestCount: 1,
    completedDeals: 94,
    expiresAt: "2026-03-05T00:00:00",
    notes: "Ưu tiên Venmo.",
    transferTime: "2-4 giờ",
    senderPaymentMethods: ["venmo", "bank_transfer"],
    recipientPaymentMethods: [
      "zalopay",
      "bank_transfer",
      ],
  },
  {
    id: "ad4",
    providerId: "p4",
    providerName: "Lan Anh",
    providerRating: 5.0,
    providerReviews: 63,
    providerVerified: true,
    fromCurrency: "EUR",
    toCurrency: "VND",
    rate: 27850,
    minAmount: 50,
    maxAmount: 2000,
    status: "active",
    requestCount: 0,
    completedDeals: 63,
    expiresAt: "2026-03-12T00:00:00",
    notes: "Tỷ giá tốt nhất thị trường.",
    transferTime: "1-2 giờ",
    senderPaymentMethods: ["paypal", "sepa", "bank_transfer"],
    recipientPaymentMethods: [
      "momo",
      "zalopay",
      "bank_transfer",
    ],
  },
  {
    id: "ad5",
    providerId: "p5",
    providerName: "Minh Phúc",
    providerRating: 4.7,
    providerReviews: 302,
    providerVerified: true,
    fromCurrency: "GBP",
    toCurrency: "VND",
    rate: 32150,
    minAmount: 50,
    maxAmount: 3000,
    status: "active",
    requestCount: 3,
    completedDeals: 302,
    expiresAt: "2026-03-08T00:00:00",
    notes: "GBP → VND. Uy tín, nhanh chóng.",
    transferTime: "1-2 giờ",
    senderPaymentMethods: ["paypal", "bank_transfer"],
    recipientPaymentMethods: ["momo", "bank_transfer"],
  },
  {
    id: "ad6",
    providerId: "p6",
    providerName: "Bảo Ngọc",
    providerRating: 4.8,
    providerReviews: 155,
    providerVerified: true,
    fromCurrency: "SGD",
    toCurrency: "VND",
    rate: 19050,
    minAmount: 100,
    maxAmount: 5000,
    status: "active",
    requestCount: 2,
    completedDeals: 155,
    expiresAt: "2026-03-11T00:00:00",
    notes: "Nhận PayNow, chuyển MoMo/ZaloPay.",
    transferTime: "2-4 giờ",
    senderPaymentMethods: ["paynow", "bank_transfer"],
    recipientPaymentMethods: [
      "momo",
      "zalopay",
      "bank_transfer",
    ],
  },
  {
    id: "ad7",
    providerId: "p7",
    providerName: "Quốc Bảo",
    providerRating: 4.5,
    providerReviews: 78,
    providerVerified: false,
    fromCurrency: "AUD",
    toCurrency: "VND",
    rate: 16900,
    minAmount: 100,
    maxAmount: 4000,
    status: "active",
    requestCount: 1,
    completedDeals: 78,
    expiresAt: "2026-03-07T00:00:00",
    notes: "AUD → VND. PayID được ưu tiên.",
    transferTime: "2-3 giờ",
    senderPaymentMethods: ["payid", "paypal", "bank_transfer"],
    recipientPaymentMethods: ["bank_transfer", "momo"],
  },
  {
    id: "ad8",
    providerId: "p8",
    providerName: "Thanh Thảo",
    providerRating: 4.9,
    providerReviews: 421,
    providerVerified: true,
    fromCurrency: "JPY",
    toCurrency: "VND",
    rate: 172,
    minAmount: 10000,
    maxAmount: 500000,
    status: "active",
    requestCount: 4,
    completedDeals: 421,
    expiresAt: "2026-03-14T00:00:00",
    notes: "Yen → VND. PayPay hoặc chuyển khoản.",
    transferTime: "1-2 giờ",
    senderPaymentMethods: ["paypay", "bank_transfer"],
    recipientPaymentMethods: [
      "momo",
      "zalopay",
      "bank_transfer",
    ],
  },
  {
    id: "ad9",
    providerId: "p9",
    providerName: "Việt Anh",
    providerRating: 4.8,
    providerReviews: 233,
    providerVerified: true,
    fromCurrency: "USD",
    toCurrency: "USD",
    rate: 0.98,
    minAmount: 100,
    maxAmount: 8000,
    status: "active",
    requestCount: 2,
    completedDeals: 233,
    expiresAt: "2026-03-13T00:00:00",
    notes:
      "USD → USD tại VN. Phí 2%. Mọi ngân hàng có tài khoản ngoại tệ.",
    transferTime: "1-2 giờ",
    senderPaymentMethods: [
      "zelle",
      "venmo",
      "paypal",
      "bank_transfer",
    ],
    recipientPaymentMethods: ["bank_transfer"],
  },
  {
    id: "ad10",
    providerId: "p10",
    providerName: "Hải Yến",
    providerRating: 4.7,
    providerReviews: 118,
    providerVerified: true,
    fromCurrency: "EUR",
    toCurrency: "USD",
    rate: 1.06,
    minAmount: 50,
    maxAmount: 3000,
    status: "active",
    requestCount: 1,
    completedDeals: 118,
    expiresAt: "2026-03-09T00:00:00",
    notes: "EUR → USD. Phí thấp, chuyển nhanh.",
    transferTime: "2-3 giờ",
    senderPaymentMethods: ["paypal", "sepa", "bank_transfer"],
    recipientPaymentMethods: ["bank_transfer", "zelle"],
  },
];

// ── Incoming requests (Provider sees these) ───────────────────
export const INCOMING_REQUESTS_INIT: DealRequest[] = [
  {
    id: "r1",
    dealId: "d1",
    requesterId: "u1",
    requesterName: "Nguyễn Văn An",
    requesterRating: 4.7,
    providerName: "Nguyễn Văn B",
    providerId: "self",
    amount: 500,
    fromCurrency: "USD",
    toCurrency: "VND",
    rate: 25500,
    receiveAmount: 12750000,
    status: "pending",
    createdAt: "2026-02-26T09:30:00",
    message:
      "Mình cần chuyển gấp trong hôm nay, bạn có thể xử lý không?",
    senderPaymentMethod: "zelle",
    recipientPaymentMethod: "momo",
    recipientName: "Nguyễn Thị Mai",
    recipientPhone: "0901234567",
    systemFeeRate: 0.005,
    systemFeeAmount: 2.5,
    escrowLocked: false,
  },
  {
    id: "r2",
    dealId: "d1",
    requesterId: "u2",
    requesterName: "Trần Thị Bích",
    requesterRating: 5.0,
    providerName: "Nguyễn Văn B",
    providerId: "self",
    amount: 1000,
    fromCurrency: "USD",
    toCurrency: "VND",
    rate: 25500,
    receiveAmount: 25500000,
    status: "pending",
    createdAt: "2026-02-26T08:15:00",
    message: "Đã giao dịch với bạn nhiều lần, rất tin tưởng.",
    senderPaymentMethod: "venmo",
    recipientPaymentMethod: "bank_transfer",
    recipientName: "Trần Minh Khoa",
    recipientBank: "Techcombank",
    recipientAccount: "9988776655",
    systemFeeRate: 0.005,
    systemFeeAmount: 5,
    escrowLocked: false,
  },
  {
    id: "r3",
    dealId: "d2",
    requesterId: "u3",
    requesterName: "Lê Hoàng Minh",
    requesterRating: 4.5,
    providerName: "Nguyễn Văn B",
    providerId: "self",
    amount: 200,
    fromCurrency: "EUR",
    toCurrency: "VND",
    rate: 27900,
    receiveAmount: 5580000,
    status: "payment_sent",
    createdAt: "2026-02-25T15:00:00",
    message: "",
    senderPaymentMethod: "paypal",
    recipientPaymentMethod: "zalopay",
    recipientName: "Lê Thị Hoa",
    recipientPhone: "0978123456",
    systemFeeRate: 0.005,
    systemFeeAmount: 1,
    escrowLocked: true,
    paymentProof: {
      type: "paypal",
      label: "PayPal",
      icon: "🅿️",
      fakeRef: "PP-20260225ABC",
      note: "Đã chuyển €200 qua PayPal",
      timestamp: "2026-02-25T18:30:00",
    },
  },
  {
    id: "r4",
    dealId: "d1",
    requesterId: "u4",
    requesterName: "Phạm Quỳnh Anh",
    requesterRating: 4.8,
    providerName: "Nguyễn Văn B",
    providerId: "self",
    amount: 300,
    fromCurrency: "USD",
    toCurrency: "VND",
    rate: 25500,
    receiveAmount: 7650000,
    status: "completed",
    createdAt: "2026-02-24T11:00:00",
    message: "",
    senderPaymentMethod: "paypal",
    recipientPaymentMethod: "bank_transfer",
    recipientName: "Phạm Văn Bình",
    recipientBank: "MB Bank",
    recipientAccount: "6677889900",
    systemFeeRate: 0.005,
    systemFeeAmount: 1.5,
    escrowLocked: true,
    paymentProof: {
      type: "paypal",
      label: "PayPal",
      icon: "🅿️",
      fakeRef: "PP-20260224XYZ",
      note: "$300 gửi cho Nguyễn Văn B",
      timestamp: "2026-02-24T12:00:00",
    },
    paymentConfirmedAt: "2026-02-24T12:10:00",
    transferProof: {
      type: "bank_transfer",
      label: "Chuyển khoản",
      icon: "🏦",
      fakeRef: "MB-7650000-2402",
      note: "Đã gửi 7,650,000₫ vào MB Bank",
      timestamp: "2026-02-24T13:00:00",
    },
    completedAt: "2026-02-24T13:15:00",
  },
  {
    id: "r5",
    dealId: "d1",
    requesterId: "u5",
    requesterName: "Đoàn Thành Long",
    requesterRating: 4.2,
    providerName: "Nguyễn Văn B",
    providerId: "self",
    amount: 150,
    fromCurrency: "USD",
    toCurrency: "VND",
    rate: 25500,
    receiveAmount: 3825000,
    status: "rejected",
    createdAt: "2026-02-23T09:00:00",
    message: "Tỷ giá 25600 được không?",
    senderPaymentMethod: "bank_transfer",
    recipientPaymentMethod: "bank_transfer",
    recipientName: "Đoàn Thị Lan",
    recipientAddress: "123 Lê Lợi, Q1, TP.HCM",
    systemFeeRate: 0.005,
    systemFeeAmount: 0.75,
    escrowLocked: false,
  },
];

// ── My requests (Requester sees these) ───────────────────────
export const MY_REQUESTS_INIT: DealRequest[] = [];
