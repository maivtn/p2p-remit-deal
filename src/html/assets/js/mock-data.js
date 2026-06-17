
const CURRENCIES = [
  { code: "VND", name: "Việt Nam Đồng", flag: "🇻🇳", symbol: "₫" },
  { code: "USD", name: "Đô la Mỹ", flag: "🇺🇸", symbol: "$" },
  { code: "EUR", name: "Euro", flag: "🇪🇺", symbol: "€" },
  { code: "GBP", name: "Bảng Anh", flag: "🇬🇧", symbol: "£" },
  { code: "JPY", name: "Yên Nhật", flag: "🇯🇵", symbol: "¥" },
  { code: "KRW", name: "Won Hàn Quốc", flag: "🇰🇷", symbol: "₩" },
  { code: "AUD", name: "Đô la Úc", flag: "🇦🇺", symbol: "A$" },
  { code: "SGD", name: "Đô la Singapore", flag: "🇸🇬", symbol: "S$" },
  { code: "THB", name: "Baht Thái", flag: "🇹🇭", symbol: "฿" },
  { code: "CNY", name: "Nhân dân tệ", flag: "🇨🇳", symbol: "¥" },
  { code: "CAD", name: "Đô la Canada", flag: "🇨🇦", symbol: "C$" },
  { code: "NZD", name: "Đô la New Zealand", flag: "🇳🇿", symbol: "NZ$" },
  { code: "CHF", name: "Franc Thụy Sĩ", flag: "🇨🇭", symbol: "CHF" },
  { code: "HKD", name: "Đô la Hồng Kông", flag: "🇭🇰", symbol: "HK$" },
  { code: "TWD", name: "Đô la Đài Loan", flag: "🇹🇼", symbol: "NT$" },
  { code: "MYR", name: "Ringgit Malaysia", flag: "🇲🇾", symbol: "RM" },
  { code: "IDR", name: "Rupiah Indonesia", flag: "🇮🇩", symbol: "Rp" },
  { code: "PHP", name: "Peso Philippines", flag: "🇵🇭", symbol: "₱" },
  { code: "INR", name: "Rupee Ấn Độ", flag: "🇮🇳", symbol: "₹" },
  { code: "AED", name: "Dirham UAE", flag: "🇦🇪", symbol: "د.إ" },
  { code: "SAR", name: "Riyal Ả Rập Xê Út", flag: "🇸🇦", symbol: "﷼" },
  { code: "TRY", name: "Lira Thổ Nhĩ Kỳ", flag: "🇹🇷", symbol: "₺" },
  { code: "MXN", name: "Peso Mexico", flag: "🇲🇽", symbol: "MX$" },
  { code: "BRL", name: "Real Brazil", flag: "🇧🇷", symbol: "R$" },
  { code: "ZAR", name: "Rand Nam Phi", flag: "🇿🇦", symbol: "R" },
];

const paymentMethodMatrix = [
  {
    currency: "USD",
    country: "US",
    methods: [
      { method: "Zelle", label: "Zelle", icon: "assets/images/zelle.png", fields: ["name"], oneOf: [["phoneNumber"], ["email"]] },
      { method: "Venmo", label: "Venmo", icon: "assets/images/venmo.png", fields: ["name", "handle"] },
      { method: "Apple Cash", label: "Apple Cash", icon: "assets/images/apple_cash.png", fields: ["name"], oneOf: [["phoneNumber"], ["email"]] },
      { method: "PayPal", label: "PayPal", icon: "assets/images/paypal.png", fields: ["name", "email"] },
      { method: "Cash App", label: "Cash App", icon: "assets/images/cash_app.png", fields: ["name"], oneOf: [["cashtag"], ["phoneNumber"], ["email"]] },
      { method: "Cash", label: "Cash", icon: "assets/images/cash.png", fields: ["name"] },
      { method: "Bank Transfer", label: "Bank Transfer", icon: "assets/images/bank-transfer.png", fields: ["name", "bankName", "routingNumber", "accountNumber", "accountType"] },
    ],
  },
  {
    currency: "VND",
    country: "VN",
    methods: [
      { method: "MoMo", label: "MoMo", icon: "assets/images/momo.png", fields: ["name", "phoneNumber"] },
      { method: "ZaloPay", label: "ZaloPay", icon: "assets/images/zalo-pay.png", fields: ["name", "phoneNumber"] },
      { method: "Bank Transfer", label: "Chuyển khoản NH", icon: "assets/images/bank-transfer.png", fields: ["name", "accountNumber"], oneOf: [["bankName"], ["bankCode"]], optionalFields: ["branchName"] },
    ],
  },
  {
    currency: "EUR",
    country: "EU",
    methods: [
      { method: "SEPA Transfer", label: "SEPA Transfer", icon: "assets/images/sepa.png", fields: ["name", "iban"], optionalFields: ["bic"] },
      { method: "PayPal", label: "PayPal", icon: "assets/images/paypal.png", fields: ["name", "email"] },
    ],
  },
  {
    currency: "GBP",
    country: "UK",
    methods: [
      { method: "Bank Transfer", label: "Bank Transfer", icon: "assets/images/bank-transfer.png", fields: ["name", "bankName", "sortCode", "accountNumber"] },
      { method: "PayPal", label: "PayPal", icon: "assets/images/paypal.png", fields: ["name", "email"] },
    ],
  },
  {
    currency: "SGD",
    country: "SG",
    methods: [
      { method: "PayNow", label: "PayNow", icon: "assets/images/pay-now.png", fields: ["name", "payNowType", "payNowValue"] },
      { method: "Bank Transfer", label: "Bank Transfer", icon: "assets/images/bank-transfer.png", fields: ["name", "bankName", "bankCode", "accountNumber"] },
    ],
  },
  {
    currency: "AUD",
    country: "AU",
    methods: [
      { method: "PayID", label: "PayID", icon: "assets/images/pay-id.png", fields: ["name", "payIdType", "payIdValue"] },
      { method: "Bank Transfer", label: "Bank Transfer", icon: "assets/images/bank-transfer.png", fields: ["name", "bankName", "bsb", "accountNumber"] },
    ],
  },
  {
    currency: "JPY",
    country: "JP",
    methods: [
      { method: "PayPay", label: "PayPay", icon: "assets/images/cash.png", fields: ["name"], oneOf: [["phoneNumber"], ["paypayId"]] },
      { method: "Bank Transfer", label: "Bank Transfer", icon: "assets/images/bank-transfer.png", fields: ["name", "bankName", "bankCode", "branchName", "branchCode", "accountType", "accountNumber"] },
    ],
  },
  {
    currency: "KRW",
    country: "KR",
    methods: [
      { method: "KakaoPay", label: "KakaoPay", icon: "assets/images/kakao-pay.png", fields: ["name", "phoneNumber"] },
      { method: "Bank Transfer", label: "Bank Transfer", icon: "assets/images/bank-transfer.png", fields: ["name", "bankName", "bankCode", "accountNumber"] },
    ],
  },
  {
    currency: "THB",
    country: "TH",
    methods: [
      { method: "PromptPay", label: "PromptPay", icon: "assets/images/prompt-pay.png", fields: ["name", "promptPayType", "promptPayValue"] },
      { method: "Bank Transfer", label: "Bank Transfer", icon: "assets/images/bank-transfer.png", fields: ["name", "bankName", "bankCode", "accountNumber"] },
    ],
  },
  {
    currency: "CNY",
    country: "CN",
    methods: [
      { method: "WeChat Pay", label: "WeChat Pay", icon: "assets/images/wechat-pay.png", fields: ["name"], oneOf: [["wechatId"], ["phoneNumber"]] },
      { method: "Alipay", label: "Alipay", icon: "assets/images/alipay.png", fields: ["name"], oneOf: [["alipayId"], ["phoneNumber"], ["email"]] },
      { method: "Bank Transfer", label: "Bank Transfer", icon: "assets/images/bank-transfer.png", fields: ["name", "bankName", "accountNumber"], optionalFields: ["branchName", "city", "province"] },
    ],
  },
];

const beneficiaryAccountsA = [
  { id: "acc_a_vn_momo_001", currency: "VND", country: "VN", method: "MoMo", isDefault: true, status: "active", details: { name: "Nguyen Van A", phoneNumber: "0901236789" } },
  { id: "acc_a_vn_bank_001", currency: "VND", country: "VN", method: "Bank Transfer", isDefault: false, status: "active", details: { name: "Nguyen Van A", bankCode: "VCB", accountNumber: "1029384321", branchName: "Chi nhánh Cần Thơ" } },
  { id: "acc_a_us_zelle_001", currency: "USD", country: "US", method: "Zelle", isDefault: true, status: "active", details: { name: "Nguyen Van A", phoneNumber: "+1 408 555 0199" } },
  { id: "acc_a_us_paypal_001", currency: "USD", country: "US", method: "PayPal", isDefault: false, status: "active", details: { name: "Nguyen Van A", email: "nguyenvana@gmail.com" } },
];

const beneficiaryAccountsB = [
  { id: "acc_b_us_zelle_001", currency: "USD", country: "US", method: "Zelle", isDefault: true, status: "active", details: { name: "Tran Van B", phoneNumber: "+1 415 555 2288" } },
  { id: "acc_b_us_paypal_001", currency: "USD", country: "US", method: "PayPal", isDefault: false, status: "active", details: { name: "Tran Van B", email: "tranminhb@gmail.com" } },
  { id: "acc_b_us_bank_001", currency: "USD", country: "US", method: "Bank Transfer", isDefault: false, status: "active", details: { name: "Tran Van B", bankName: "Bank of America", routingNumber: "026009593", accountNumber: "9876543210", accountType: "checking" } },
  { id: "acc_b_vn_momo_001", currency: "VND", country: "VN", method: "MoMo", isDefault: true, status: "active", details: { name: "Tran Van B", phoneNumber: "0987654321" } },
  { id: "acc_b_vn_bank_001", currency: "VND", country: "VN", method: "Bank Transfer", isDefault: false, status: "active", details: { name: "Tran Van B", bankName: "Techcombank", accountNumber: "19031234567890", branchName: "Chi nhánh TP.HCM" } },
];

const beneficiaryAccounts = [...beneficiaryAccountsA, ...beneficiaryAccountsB];

const mockDealsB = [
  {
    id: "deal_b_001",
    dealCode: "DL-B-VND-USD-001",
    status: "active",
    statusLabel: "Đang hoạt động",
    beneficiaryReceiveCurrency: { currency: "USD", country: "US", label: "USD - Đô la Mỹ" },
    senderPayCurrency: { currency: "VND", country: "VN", label: "VND - Việt Nam Đồng" },
    exchangeRate: { from: "USD", to: "VND", rate: 25500, source: "market", updatedAt: "2026-06-16T12:30:00Z" },
    amountLimit: { minUsd: 99, maxUsd: 799 },
    availableAmountUsd: 799,
    beneficiaryReceiveMethod: "Zelle",
    beneficiaryAccountId: "acc_b_us_zelle_001",
    senderPaymentMethods: ["MoMo", "ZaloPay", "Bank Transfer"],
    note: "Có thể thanh toán VND qua MoMo, ZaloPay hoặc chuyển khoản ngân hàng.",
    createdAt: "2026-06-16T08:00:00Z",
    updatedAt: "2026-06-16T12:30:00Z",
    completedAt: null,
    deletedAt: null,
  },
  {
    id: "deal_b_002",
    dealCode: "DL-B-VND-USD-002",
    status: "active",
    statusLabel: "Đang hoạt động",
    beneficiaryReceiveCurrency: { currency: "USD", country: "US", label: "USD - Đô la Mỹ" },
    senderPayCurrency: { currency: "VND", country: "VN", label: "VND - Việt Nam Đồng" },
    exchangeRate: { from: "USD", to: "VND", rate: 25480, source: "custom", updatedAt: "2026-06-16T11:20:00Z" },
    amountLimit: { minUsd: 50, maxUsd: 2000 },
    availableAmountUsd: 1200,
    beneficiaryReceiveMethod: "PayPal",
    beneficiaryAccountId: "acc_b_us_paypal_001",
    senderPaymentMethods: ["ZaloPay"],
    note: "Chỉ hỗ trợ ZaloPay.",
    createdAt: "2026-06-16T09:15:00Z",
    updatedAt: "2026-06-16T11:20:00Z",
    completedAt: null,
    deletedAt: null,
  },
  {
    id: "deal_b_003",
    dealCode: "DL-B-VND-USD-003",
    status: "active",
    statusLabel: "Đang hoạt động",
    beneficiaryReceiveCurrency: { currency: "USD", country: "US", label: "USD - Đô la Mỹ" },
    senderPayCurrency: { currency: "VND", country: "VN", label: "VND - Việt Nam Đồng" },
    exchangeRate: { from: "USD", to: "VND", rate: 25600, source: "market", updatedAt: "2026-06-16T10:00:00Z" },
    amountLimit: { minUsd: 300, maxUsd: 10000 },
    availableAmountUsd: 8000,
    beneficiaryReceiveMethod: "Bank Transfer",
    beneficiaryAccountId: "acc_b_us_bank_001",
    senderPaymentMethods: ["Bank Transfer"],
    note: "Ưu tiên giao dịch số tiền lớn.",
    createdAt: "2026-06-15T15:00:00Z",
    updatedAt: "2026-06-16T10:00:00Z",
    completedAt: null,
    deletedAt: null,
  },
];

const overviewData = {
  summary: { processingCount: 4, waitingAcceptanceCount: 2 },
  processingTransactions: [
    { id:"txn_001", name:"Nguyễn Văn A", status:"processing", statusLabel:"Đang xử lý", send:"$500", receive:"12.750.000đ", time:"Vừa xong", senderMethod:"Zelle", beneficiaryMethod:"MoMo" },
    { id:"txn_002", name:"Nguyễn Văn An", status:"waiting", statusLabel:"Chờ chấp nhận", send:"$500", receive:"12.750.000đ", time:"2 phút trước", senderMethod:"Zelle", beneficiaryMethod:"MoMo" },
  ],
  recentHistory: [
    { id:"txn_003", name:"Phạm Quỳnh Anh", status:"completed", statusLabel:"Hoàn thành", send:"$300", receive:"7.650.000đ", time:"2 ngày trước", senderMethod:"PayPal", beneficiaryMethod:"Chuyển khoản NH" },
    { id:"txn_004", name:"Đoàn Thành Long", status:"rejected", statusLabel:"Từ chối", send:"$150", receive:"3.825.000đ", time:"3 ngày trước", senderMethod:"Bank Transfer", beneficiaryMethod:"Chuyển khoản NH" },
  ]
};

const transactionDetail = {
  id:"txn_001",
  transactionCode:"TXN-USD-VND-001",
  status:"waiting_for_payment",
  statusLabel:"Đang chờ thanh toán",
  summary:{ send:"$500", receive:"12.750.000đ", rate:"1 USD = 25.500đ" },
  flows:[
    { id:"flow_a_to_b", title:"Bạn gửi USD cho người thụ hưởng của B", amount:"$500", method:"Zelle", receiverName:"Tran Van B", details:{ phoneNumber:"+1 415 555 2288" }, status:"waiting_for_payment" },
    { id:"flow_b_to_a", title:"B gửi VND cho người thụ hưởng của bạn", amount:"12.750.000đ", method:"MoMo", receiverName:"Nguyen Van A", details:{ phoneNumber:"0901236789" }, status:"waiting_for_payment" },
  ],
  logs:[
    { time:"13:15", message:"Hai bên đã chấp nhận giao dịch." },
    { time:"13:20", message:"Đang chờ các bên gửi tiền và upload bằng chứng." },
  ]
};
