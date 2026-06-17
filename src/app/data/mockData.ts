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
  new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + "₫";

export const formatAmount = (amount: number, code: string): string => {
  const c = getCurrency(code);
  if (!c) return amount.toString();
  if (code === "VND") return formatVND(amount);
  if (code === "JPY" || code === "KRW")
    return c.symbol + new Intl.NumberFormat("en-US").format(Math.round(amount));
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

// ── Shared payment/account models ────────────────────────────
export interface PaymentAccount {
  id: string;
  methodId: string;
  currency: string;
  label: string;
  country?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
  handle?: string;
  wechatId?: string;
  paypayId?: string;
  bankName?: string;
  bankCode?: string;
  branchName?: string;
  branchCode?: string;
  city?: string;
  province?: string;
  routingNumber?: string;
  sortCode?: string;
  accountNumber?: string;
  accountType?: string;
  accountName?: string;
  iban?: string;
  bic?: string;
  bsb?: string;
  payNowType?: string;
  payNowValue?: string;
  payIdType?: string;
  payIdValue?: string;
  promptPayType?: string;
  promptPayValue?: string;
}
export type ProviderAccount = PaymentAccount;

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  requiresPhone?: boolean; // MoMo, ZaloPay, PayNow, PromptPay...
  requiresAccount?: boolean; // Bank Transfer
}

export interface PaymentMethodMatrixMethod extends PaymentMethod {
  method: string;
  label: string;
  fields: string[];
  oneOf?: string[][];
  optionalFields?: string[];
}

export interface PaymentMethodMatrixEntry {
  currency: string;
  country: string;
  methods: PaymentMethodMatrixMethod[];
}

export const getPaymentMethodsByCurrency = (
  currency: string,
): PaymentMethod[] =>
  paymentMethodMatrix.find((item) => item.currency === currency)?.methods ?? [];

export const getPaymentMethod = (
  currency: string,
  id: string,
): PaymentMethod | undefined =>
  getPaymentMethodsByCurrency(currency).find((m) => m.id === id);

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
  status: "active" | "expired" | "completed";
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
  | "processing"   // both parties transferring & uploading proof simultaneously
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
  type: "image" | "video" | "audio";
  name: string;
}

export interface DealRequestBase {
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
  // Parallel proof chain — both sides upload simultaneously after accept
  requesterProof?: ProofData;              // A's proof: sent fromCurrency to B
  providerProof?: ProofData;              // B's proof: sent toCurrency to recipient
  requesterConfirmedReceived?: boolean;   // A confirmed recipient got B's transfer
  providerConfirmedReceived?: boolean;    // B confirmed they received A's transfer
  completedAt?: string;
  // Dispute
  disputedBy?: "requester" | "provider";
  disputeNote?: string;
  disputeProof?: ProofData;
  disputedAt?: string;
}
export type DealRequest = DealRequestBase;
export type ProviderDealRequest = DealRequestBase;
export type RequesterDealRequest = DealRequestBase;

// ── Incoming requests (Provider sees these) ───────────────────
export const INCOMING_REQUESTS_INIT: ProviderDealRequest[] = [
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
    message: "Mình cần chuyển gấp trong hôm nay, bạn có thể xử lý không?",
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
    status: "processing",
    createdAt: "2026-02-25T15:00:00",
    message: "",
    senderPaymentMethod: "paypal",
    recipientPaymentMethod: "zalopay",
    recipientName: "Lê Thị Hoa",
    recipientPhone: "0978123456",
    systemFeeRate: 0.005,
    systemFeeAmount: 1,
    escrowLocked: true,
    requesterProof: {
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
    escrowLocked: false,
    requesterProof: {
      type: "paypal",
      label: "PayPal",
      icon: "🅿️",
      fakeRef: "PP-20260224XYZ",
      note: "$300 gửi cho Nguyễn Văn B",
      timestamp: "2026-02-24T12:00:00",
    },
    providerProof: {
      type: "bank_transfer",
      label: "Chuyển khoản",
      icon: "🏦",
      fakeRef: "MB-7650000-2402",
      note: "Đã gửi 7,650,000₫ vào MB Bank",
      timestamp: "2026-02-24T13:00:00",
    },
    requesterConfirmedReceived: true,
    providerConfirmedReceived: true,
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
export const MY_REQUESTS_INIT: RequesterDealRequest[] = [];

import alipayIcon from "../../images/alipay.png";
import appleCashIcon from "../../images/apple_cash.png";
import bankTransferIcon from "../../images/bank-transfer.png";
import cashAppIcon from "../../images/cash_app.png";
import cashIcon from "../../images/cash.png";
import kakaoPayIcon from "../../images/kakao-pay.png";
import momoIcon from "../../images/momo.png";
import payIdIcon from "../../images/pay-id.png";
import payNowIcon from "../../images/pay-now.png";
import paypalIcon from "../../images/paypal.png";
import promptPayIcon from "../../images/prompt-pay.png";
import sepaIcon from "../../images/sepa.png";
import venmoIcon from "../../images/venmo.png";
import wechatPayIcon from "../../images/wechat-pay.png";
import zaloPayIcon from "../../images/zalo-pay.png";
import zelleIcon from "../../images/zelle.png";

export const paymentMethodMatrix: PaymentMethodMatrixEntry[] = [
  {
    currency: "USD",
    country: "US",
    methods: [
      {
        id: "zelle",
        name: "Zelle",
        method: "Zelle",
        label: "Zelle",
        icon: zelleIcon,
        fields: ["name"],
        oneOf: [["phoneNumber"], ["email"]],
      },
      {
        id: "venmo",
        name: "Venmo",
        method: "Venmo",
        label: "Venmo",
        icon: venmoIcon,
        fields: ["name", "handle"],
      },
      {
        id: "apple_cash",
        name: "Apple Cash",
        method: "Apple Cash",
        label: "Apple Cash",
        icon: appleCashIcon,
        fields: ["name"],
        oneOf: [["phoneNumber"], ["email"]],
      },
      {
        id: "paypal",
        name: "PayPal",
        method: "PayPal",
        label: "PayPal",
        icon: paypalIcon,
        fields: ["name", "email"],
      },
      {
        id: "cash_app",
        name: "Cash App",
        method: "Cash App",
        label: "Cash App",
        icon: cashAppIcon,
        fields: ["name"],
        oneOf: [["cashtag"], ["phoneNumber"], ["email"]],
      },
      {
        id: "cash",
        name: "Cash",
        method: "Cash",
        label: "Cash",
        icon: cashIcon,
        fields: ["name"],
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: bankTransferIcon,
        fields: [
          "name",
          "bankName",
          "routingNumber",
          "accountNumber",
          "accountType",
        ],
      },
    ],
  },

  {
    currency: "VND",
    country: "Vietnam",
    methods: [
      {
        id: "momo",
        name: "MoMo",
        method: "MoMo",
        label: "MoMo",
        icon: momoIcon,
        fields: ["name", "phoneNumber"],
      },
      {
        id: "zalopay",
        name: "ZaloPay",
        method: "ZaloPay",
        label: "ZaloPay",
        icon: zaloPayIcon,
        fields: ["name", "phoneNumber"],
      },
      {
        id: "bank_transfer",
        name: "Chuyển khoản NH",
        method: "Bank Transfer",
        label: "Chuyển khoản NH",
        icon: bankTransferIcon,
        fields: ["name", "accountNumber"],
        oneOf: [["bankName"], ["bankCode"]],
        optionalFields: ["branchName"],
      },
    ],
  },

  {
    currency: "EUR",
    country: "Eurozone",
    methods: [
      {
        id: "sepa",
        name: "SEPA Transfer",
        method: "SEPA Transfer",
        label: "SEPA Transfer",
        icon: sepaIcon,
        fields: ["name", "iban"],
        optionalFields: ["bic"],
      },
      {
        id: "paypal",
        name: "PayPal",
        method: "PayPal",
        label: "PayPal",
        icon: paypalIcon,
        fields: ["name", "email"],
      },
    ],
  },

  {
    currency: "GBP",
    country: "UK",
    methods: [
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: bankTransferIcon,
        fields: ["name", "bankName", "sortCode", "accountNumber"],
      },
      {
        id: "paypal",
        name: "PayPal",
        method: "PayPal",
        label: "PayPal",
        icon: paypalIcon,
        fields: ["name", "email"],
      },
    ],
  },

  {
    currency: "SGD",
    country: "Singapore",
    methods: [
      {
        id: "paynow",
        name: "PayNow",
        method: "PayNow",
        label: "PayNow",
        icon: payNowIcon,
        fields: ["name", "payNowType", "payNowValue"],
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: bankTransferIcon,
        fields: ["name", "bankName", "bankCode", "accountNumber"],
      },
    ],
  },

  {
    currency: "AUD",
    country: "Australia",
    methods: [
      {
        id: "payid",
        name: "PayID",
        method: "PayID",
        label: "PayID",
        icon: payIdIcon,
        fields: ["name", "payIdType", "payIdValue"],
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: bankTransferIcon,
        fields: ["name", "bankName", "bsb", "accountNumber"],
      },
    ],
  },

  {
    currency: "JPY",
    country: "Japan",
    methods: [
      {
        id: "paypay",
        name: "PayPay",
        method: "PayPay",
        label: "PayPay",
        icon: cashIcon,
        fields: ["name"],
        oneOf: [["phoneNumber"], ["paypayId"]],
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: bankTransferIcon,
        fields: [
          "name",
          "bankName",
          "bankCode",
          "branchName",
          "branchCode",
          "accountType",
          "accountNumber",
        ],
      },
    ],
  },

  {
    currency: "KRW",
    country: "Korea",
    methods: [
      {
        id: "kakaopay",
        name: "KakaoPay",
        method: "KakaoPay",
        label: "KakaoPay",
        icon: kakaoPayIcon,
        fields: ["name", "phoneNumber"],
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: bankTransferIcon,
        fields: ["name", "bankName", "bankCode", "accountNumber"],
      },
    ],
  },

  {
    currency: "THB",
    country: "Thailand",
    methods: [
      {
        id: "promptpay",
        name: "PromptPay",
        method: "PromptPay",
        label: "PromptPay",
        icon: promptPayIcon,
        fields: ["name", "promptPayType", "promptPayValue"],
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: bankTransferIcon,
        fields: ["name", "bankName", "bankCode", "accountNumber"],
      },
    ],
  },

  {
    currency: "CNY",
    country: "China",
    methods: [
      {
        id: "wechat_pay",
        name: "WeChat Pay",
        method: "WeChat Pay",
        label: "WeChat Pay",
        icon: wechatPayIcon,
        fields: ["name"],
        oneOf: [["wechatId"], ["phoneNumber"]],
      },
      {
        id: "alipay",
        name: "Alipay",
        method: "Alipay",
        label: "Alipay",
        icon: alipayIcon,
        fields: ["name"],
        oneOf: [["alipayId"], ["phoneNumber"], ["email"]],
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: bankTransferIcon,
        fields: ["name", "bankName", "accountNumber"],
        optionalFields: ["branchName", "city", "province"],
      },
    ],
  },
];

export interface BeneficiaryAccountSeed {
  id: string;
  currency: string;
  country: string;
  method: string;
  isDefault: boolean;
  status: string;
  details: Record<string, string>;
}

export type BeneficiaryAccountSeedA = BeneficiaryAccountSeed;
export type BeneficiaryAccountSeedB = BeneficiaryAccountSeed;

export const beneficiaryAccountsB: BeneficiaryAccountSeedB[] = [
  // USD accounts — used by deals referencing acc_b_us_*
  {
    id: "acc_b_us_zelle_001",
    currency: "USD",
    country: "US",
    method: "Zelle",
    isDefault: true,
    status: "active",
    details: {
      name: "Tran Van B",
      phoneNumber: "+1 415 555 2288",
    },
  },
  {
    id: "acc_b_us_paypal_001",
    currency: "USD",
    country: "US",
    method: "PayPal",
    isDefault: false,
    status: "active",
    details: {
      name: "Tran Van B",
      email: "tranminhb@gmail.com",
    },
  },
  {
    id: "acc_b_us_bank_001",
    currency: "USD",
    country: "US",
    method: "Bank Transfer",
    isDefault: false,
    status: "active",
    details: {
      name: "Tran Van B",
      bankName: "Bank of America",
      routingNumber: "026009593",
      accountNumber: "9876543210",
      accountType: "checking",
    },
  },
  // VND accounts — B can receive VND from A's friend
  {
    id: "acc_b_vn_momo_001",
    currency: "VND",
    country: "VN",
    method: "MoMo",
    isDefault: true,
    status: "active",
    details: {
      name: "Tran Van B",
      phoneNumber: "0987654321",
    },
  },
  {
    id: "acc_b_vn_bank_001",
    currency: "VND",
    country: "VN",
    method: "Bank Transfer",
    isDefault: false,
    status: "active",
    details: {
      name: "Tran Van B",
      bankName: "Techcombank",
      accountNumber: "19031234567890",
      branchName: "Chi nhánh TP.HCM",
    },
  },
  {
    id: "acc_b_sgd_paynow_001",
    currency: "SGD",
    country: "SG",
    method: "PayNow",
    isDefault: true,
    status: "active",
    details: {
      name: "Tran Van B",
      payNowType: "phone",
      payNowValue: "+6581234567",
    },
  },
  {
    id: "acc_b_sgd_bank_001",
    currency: "SGD",
    country: "SG",
    method: "Bank Transfer",
    isDefault: false,
    status: "active",
    details: {
      name: "Tran Van B",
      bankName: "DBS Bank",
      bankCode: "7171",
      accountNumber: "0012347788",
    },
  },
  {
    id: "acc_b_aud_payid_001",
    currency: "AUD",
    country: "AU",
    method: "PayID",
    isDefault: true,
    status: "active",
    details: {
      name: "Tran Van B",
      payIdType: "email",
      payIdValue: "tranminhb@gmail.com",
    },
  },
  {
    id: "acc_b_aud_bank_001",
    currency: "AUD",
    country: "AU",
    method: "Bank Transfer",
    isDefault: false,
    status: "active",
    details: {
      name: "Tran Van B",
      bankName: "Commonwealth Bank",
      bsb: "062-000",
      accountNumber: "12349900",
    },
  },
  {
    id: "acc_b_jpy_paypay_001",
    currency: "JPY",
    country: "JP",
    method: "PayPay",
    isDefault: true,
    status: "active",
    details: {
      name: "Tran Van B",
      paypayId: "paypay_tran_jp",
    },
  },
  {
    id: "acc_b_jpy_bank_001",
    currency: "JPY",
    country: "JP",
    method: "Bank Transfer",
    isDefault: false,
    status: "active",
    details: {
      name: "Tran Van B",
      bankName: "MUFG Bank",
      bankCode: "0005",
      branchName: "Tokyo Branch",
      branchCode: "001",
      accountType: "ordinary",
      accountNumber: "12347781",
    },
  },
  {
    id: "acc_b_krw_kakaopay_001",
    currency: "KRW",
    country: "KR",
    method: "KakaoPay",
    isDefault: true,
    status: "active",
    details: {
      name: "Tran Van B",
      phoneNumber: "+821012342211",
    },
  },
  {
    id: "acc_b_krw_bank_001",
    currency: "KRW",
    country: "KR",
    method: "Bank Transfer",
    isDefault: false,
    status: "active",
    details: {
      name: "Tran Van B",
      bankName: "Kookmin Bank",
      bankCode: "004",
      accountNumber: "1234564455",
    },
  },
  {
    id: "acc_b_thb_promptpay_001",
    currency: "THB",
    country: "TH",
    method: "PromptPay",
    isDefault: true,
    status: "active",
    details: {
      name: "Tran Van B",
      promptPayType: "phone",
      promptPayValue: "+66812348899",
    },
  },
  {
    id: "acc_b_thb_bank_001",
    currency: "THB",
    country: "TH",
    method: "Bank Transfer",
    isDefault: false,
    status: "active",
    details: {
      name: "Tran Van B",
      bankName: "Kasikorn Bank",
      bankCode: "004",
      accountNumber: "1234565522",
    },
  },
  {
    id: "acc_b_cny_wechat_001",
    currency: "CNY",
    country: "CN",
    method: "WeChat Pay",
    isDefault: true,
    status: "active",
    details: {
      name: "Tran Van B",
      wechatId: "tran_cn_88",
    },
  },
  {
    id: "acc_b_cny_alipay_001",
    currency: "CNY",
    country: "CN",
    method: "Alipay",
    isDefault: false,
    status: "active",
    details: {
      name: "Tran Van B",
      email: "tranminhb@email.com",
    },
  },
  {
    id: "acc_b_cny_bank_001",
    currency: "CNY",
    country: "CN",
    method: "Bank Transfer",
    isDefault: false,
    status: "active",
    details: {
      name: "Tran Van B",
      bankName: "ICBC Bank",
      accountNumber: "6222021234568890",
      branchName: "Shanghai Main Branch",
      city: "Shanghai",
      province: "Shanghai",
    },
  },
];

export const beneficiaryAccountsA: BeneficiaryAccountSeedA[] = [
  {
    id: "acc_a_us_zelle_001",
    currency: "USD",
    country: "US",
    method: "Zelle",
    isDefault: true,
    status: "active",
    details: {
      name: "Nguyen Van A",
      phoneNumber: "+1 408 555 0199",
    },
  },
  {
    id: "acc_a_us_venmo_001",
    currency: "USD",
    country: "US",
    method: "Venmo",
    isDefault: false,
    status: "active",
    details: {
      name: "Nguyen Van A",
      handle: "@nguyenvana",
    },
  },
  {
    id: "acc_a_us_apple_cash_001",
    currency: "USD",
    country: "US",
    method: "Apple Cash",
    isDefault: false,
    status: "active",
    details: {
      name: "Nguyen Van A",
      email: "nguyenvana@icloud.com",
    },
  },
  {
    id: "acc_a_us_paypal_001",
    currency: "USD",
    country: "US",
    method: "PayPal",
    isDefault: false,
    status: "active",
    details: {
      name: "Nguyen Van A",
      email: "nguyenvana@gmail.com",
    },
  },
  {
    id: "acc_a_us_bank_001",
    currency: "USD",
    country: "US",
    method: "Bank Transfer",
    isDefault: false,
    status: "active",
    details: {
      name: "Nguyen Van A",
      bankName: "Chase Bank",
      routingNumber: "021000021",
      accountNumber: "1234567890",
      accountType: "checking",
    },
  },
  {
    id: "acc_a_vn_momo_001",
    currency: "VND",
    country: "VN",
    method: "MoMo",
    isDefault: true,
    status: "active",
    details: {
      name: "Nguyen Van A",
      phoneNumber: "0901236789",
    },
  },
  {
    id: "acc_a_vn_zalopay_001",
    currency: "VND",
    country: "VN",
    method: "ZaloPay",
    isDefault: false,
    status: "active",
    details: {
      name: "Nguyen Van A",
      phoneNumber: "0918882222",
    },
  },
  {
    id: "acc_a_vn_bank_001",
    currency: "VND",
    country: "VN",
    method: "Bank Transfer",
    isDefault: false,
    status: "active",
    details: {
      name: "Nguyen Van A",
      bankCode: "VCB",
      accountNumber: "1029384321",
      branchName: "Chi nhánh Cần Thơ",
    },
  },
  {
    id: "acc_a_eur_sepa_001",
    currency: "EUR",
    country: "EU",
    method: "SEPA Transfer",
    isDefault: true,
    status: "active",
    details: {
      name: "Nguyen Van A",
      iban: "DE89370400440532013000",
      bic: "COBADEFFXXX",
    },
  },
  {
    id: "acc_a_gbp_bank_001",
    currency: "GBP",
    country: "UK",
    method: "Bank Transfer",
    isDefault: true,
    status: "active",
    details: {
      name: "Nguyen Van A",
      bankName: "Barclays Bank",
      sortCode: "20-00-00",
      accountNumber: "12343344",
    },
  },
];

function mapBeneficiaryAccount(seed: BeneficiaryAccountSeed): ProviderAccount {
  const methodId =
    getPaymentMethodsByCurrency(seed.currency)?.find(
      (method) =>
        method.method === seed.method ||
        method.label === seed.method ||
        method.name === seed.method ||
        method.id === seed.method,
    )?.id ?? "";
  const details = seed.details ?? {};
  const name = details.name ?? "";
  return {
    id: seed.id,
    methodId,
    currency: seed.currency,
    country: seed.country,
    label: `${seed.method}${name ? ` - ${name}` : ""}`,
    name,
    phone: details.phone ?? details.phoneNumber,
    phoneNumber: details.phoneNumber ?? details.phone,
    email: details.email,
    handle: details.handle,
    wechatId: details.wechatId,
    paypayId: details.paypayId,
    bankName: details.bankName,
    bankCode: details.bankCode,
    branchName: details.branchName,
    branchCode: details.branchCode,
    city: details.city,
    province: details.province,
    routingNumber: details.routingNumber,
    sortCode: details.sortCode,
    accountNumber: details.accountNumber,
    accountType: details.accountType,
    accountName: name,
    iban: details.iban,
    bic: details.bic,
    bsb: details.bsb,
    payNowType: details.payNowType,
    payNowValue: details.payNowValue,
    payIdType: details.payIdType,
    payIdValue: details.payIdValue,
    promptPayType: details.promptPayType,
    promptPayValue: details.promptPayValue,
  };
}

export const REQUESTER_ACCOUNTS_INIT_FROM_BENEFICIARY: ProviderAccount[] =
  beneficiaryAccountsA.map(mapBeneficiaryAccount);

export const PROVIDER_ACCOUNTS_INIT_FROM_BENEFICIARY: ProviderAccount[] =
  beneficiaryAccountsB.map(mapBeneficiaryAccount);

// ── B's deals (direct Deal objects, no seed mapping) ─────────
// fromCurrency = what A sends (USD) to B's US member
// toCurrency   = what B sends (VND) to A's friend in Vietnam
// senderPaymentMethods    = method A uses to pay B's US member (matches Deal.fromCurrency)
// recipientPaymentMethods = methods B uses to send VND to A's friend (matches Deal.toCurrency)

export const PROVIDER_DEALS_B_INIT: Deal[] = [
  {
    id: 'deal_b_001',
    providerId: 'self',
    providerName: 'Nguyễn Văn B',
    providerRating: 4.9,
    providerReviews: 248,
    providerVerified: true,
    fromCurrency: 'USD',
    toCurrency: 'VND',
    rate: 25500,
    minAmount: 99,
    maxAmount: 799,
    status: 'active',
    requestCount: 0,
    completedDeals: 0,
    expiresAt: '2026-06-16T12:30:00Z',
    notes: 'Có thể thanh toán VND qua MoMo, ZaloPay hoặc chuyển khoản ngân hàng.',
    transferTime: '',
    senderPaymentMethods: ['zelle'],
    recipientPaymentMethods: ['momo', 'zalopay', 'bank_transfer'],
  },
  {
    id: 'deal_b_002',
    providerId: 'self',
    providerName: 'Nguyễn Văn B',
    providerRating: 4.9,
    providerReviews: 248,
    providerVerified: true,
    fromCurrency: 'USD',
    toCurrency: 'VND',
    rate: 25480,
    minAmount: 50,
    maxAmount: 2000,
    status: 'active',
    requestCount: 0,
    completedDeals: 0,
    expiresAt: '2026-06-16T11:20:00Z',
    notes: 'Chỉ hỗ trợ ZaloPay.',
    transferTime: '',
    senderPaymentMethods: ['paypal'],
    recipientPaymentMethods: ['zalopay'],
  },
  {
    id: 'deal_b_003',
    providerId: 'self',
    providerName: 'Nguyễn Văn B',
    providerRating: 4.9,
    providerReviews: 248,
    providerVerified: true,
    fromCurrency: 'USD',
    toCurrency: 'VND',
    rate: 25600,
    minAmount: 300,
    maxAmount: 10000,
    status: 'active',
    requestCount: 0,
    completedDeals: 0,
    expiresAt: '2026-06-16T10:00:00Z',
    notes: 'Ưu tiên giao dịch số tiền lớn.',
    transferTime: '',
    senderPaymentMethods: ['bank_transfer'],
    recipientPaymentMethods: ['bank_transfer'],
  },
];

export const REQUESTER_DEALS_A_INIT: Deal[] = [];
export const AVAILABLE_DEALS: Deal[] = [];
