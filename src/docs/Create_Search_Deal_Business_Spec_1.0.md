# 1.0 — Business Specification: Create Deal & Search Deal

## 1. Tổng quan nghiệp vụ

Tính năng **Tạo Deal** và **Tìm Deal** phục vụ flow **chuyển tiền chéo giữa 2 member ở 2 quốc gia khác nhau**.

Đây không phải flow chuyển tiền trực tiếp từ A sang người nhận của A qua hệ thống. Hệ thống đóng vai trò **matching engine**, giúp ghép 2 member có nhu cầu ngược chiều.

Ví dụ:

- Account A đang ở US.
- A muốn gửi USD.
- Người thụ hưởng của A ở Việt Nam muốn nhận VND.

Ở chiều ngược lại:

- Account B đang ở Việt Nam.
- B muốn gửi VND.
- Người thụ hưởng/member của B ở US muốn nhận USD.

Khi match thành công:

1. A gửi USD cho người thụ hưởng/member của B tại US.
2. B gửi VND cho người thụ hưởng của A tại Việt Nam.

Như vậy tiền được xử lý **local-to-local** ở từng quốc gia, thay vì chuyển tiền xuyên biên giới trực tiếp.

---

## 2. Khái niệm chính

### 2.1 Account

Là user/member trong hệ thống.

Ví dụ:

```ts
account_a
account_b
```

---

### 2.2 Beneficiary

Là người thụ hưởng, người sẽ nhận tiền.

Ví dụ:

- Người thụ hưởng của A ở Việt Nam nhận VND.
- Người thụ hưởng/member của B ở US nhận USD.

---

### 2.3 Beneficiary Account

Là tài khoản nhận tiền cụ thể của người thụ hưởng.

Ví dụ:

```ts
acc_a_vn_momo_001
acc_b_us_zelle_001
```

Mỗi tài khoản nhận tiền phải bám sát `paymentMethodMatrix`.

Không tự thêm field dư trong `details`.

Ví dụ Zelle trong matrix:

```ts
{
  method: "Zelle",
  fields: ["name"],
  oneOf: [["phoneNumber"], ["email"]]
}
```

Thì account Zelle chỉ được có một trong hai dạng:

```ts
details: {
  name: "Nguyen Van A",
  phoneNumber: "+1 408 555 0199"
}
```

hoặc:

```ts
details: {
  name: "Nguyen Van A",
  email: "user@gmail.com"
}
```

Không thêm field không có trong matrix.

---

## 3. Source of Truth: Currency & Payment Method Matrix

### 3.1 Currency type

```ts
export type CurrencyCode =
  | "VND"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "KRW"
  | "AUD"
  | "SGD"
  | "THB"
  | "CNY"
  | "CAD"
  | "NZD"
  | "CHF"
  | "HKD"
  | "TWD"
  | "MYR"
  | "IDR"
  | "PHP"
  | "INR"
  | "AED"
  | "SAR"
  | "TRY"
  | "MXN"
  | "BRL"
  | "ZAR";

export type Currency = {
  code: CurrencyCode;
  name: string;
  flag: string;
  symbol: string;
};
```

---

### 3.2 Currency options

`CURRENCIES` dùng cho các control chọn currency trong form **Tạo Deal** và **Tìm Deal**.

```ts
export const CURRENCIES: Currency[] = [
  {
    code: "VND",
    name: "Việt Nam Đồng",
    flag: "🇻🇳",
    symbol: "₫",
  },
  {
    code: "USD",
    name: "Đô la Mỹ",
    flag: "🇺🇸",
    symbol: "$",
  },
  {
    code: "EUR",
    name: "Euro",
    flag: "🇪🇺",
    symbol: "€",
  },
  {
    code: "GBP",
    name: "Bảng Anh",
    flag: "🇬🇧",
    symbol: "£",
  },
  {
    code: "JPY",
    name: "Yên Nhật",
    flag: "🇯🇵",
    symbol: "¥",
  },
  {
    code: "KRW",
    name: "Won Hàn Quốc",
    flag: "🇰🇷",
    symbol: "₩",
  },
  {
    code: "AUD",
    name: "Đô la Úc",
    flag: "🇦🇺",
    symbol: "A$",
  },
  {
    code: "SGD",
    name: "Đô la Singapore",
    flag: "🇸🇬",
    symbol: "S$",
  },
  {
    code: "THB",
    name: "Baht Thái",
    flag: "🇹🇭",
    symbol: "฿",
  },
  {
    code: "CNY",
    name: "Nhân dân tệ",
    flag: "🇨🇳",
    symbol: "¥",
  },
  {
    code: "CAD",
    name: "Đô la Canada",
    flag: "🇨🇦",
    symbol: "C$",
  },
  {
    code: "NZD",
    name: "Đô la New Zealand",
    flag: "🇳🇿",
    symbol: "NZ$",
  },
  {
    code: "CHF",
    name: "Franc Thụy Sĩ",
    flag: "🇨🇭",
    symbol: "CHF",
  },
  {
    code: "HKD",
    name: "Đô la Hồng Kông",
    flag: "🇭🇰",
    symbol: "HK$",
  },
  {
    code: "TWD",
    name: "Đô la Đài Loan",
    flag: "🇹🇼",
    symbol: "NT$",
  },
  {
    code: "MYR",
    name: "Ringgit Malaysia",
    flag: "🇲🇾",
    symbol: "RM",
  },
  {
    code: "IDR",
    name: "Rupiah Indonesia",
    flag: "🇮🇩",
    symbol: "Rp",
  },
  {
    code: "PHP",
    name: "Peso Philippines",
    flag: "🇵🇭",
    symbol: "₱",
  },
  {
    code: "INR",
    name: "Rupee Ấn Độ",
    flag: "🇮🇳",
    symbol: "₹",
  },
  {
    code: "AED",
    name: "Dirham UAE",
    flag: "🇦🇪",
    symbol: "د.إ",
  },
  {
    code: "SAR",
    name: "Riyal Ả Rập Xê Út",
    flag: "🇸🇦",
    symbol: "﷼",
  },
  {
    code: "TRY",
    name: "Lira Thổ Nhĩ Kỳ",
    flag: "🇹🇷",
    symbol: "₺",
  },
  {
    code: "MXN",
    name: "Peso Mexico",
    flag: "🇲🇽",
    symbol: "MX$",
  },
  {
    code: "BRL",
    name: "Real Brazil",
    flag: "🇧🇷",
    symbol: "R$",
  },
  {
    code: "ZAR",
    name: "Rand Nam Phi",
    flag: "🇿🇦",
    symbol: "R",
  },
];
```

> Lưu ý: `CURRENCIES` có thể nhiều hơn `paymentMethodMatrix`. Khi render phương thức thanh toán, chỉ những currency có trong `paymentMethodMatrix` mới có method để chọn.

---

### 3.3 Payment method matrix

`paymentMethodMatrix` là source of truth để render:

- Phương thức thanh toán theo currency.
- Icon của từng method.
- Field bắt buộc trong tài khoản nhận.
- Field optional.
- Field oneOf.

Không hard-code field ngoài matrix này.

```ts
export const paymentMethodMatrix = [
  {
    currency: "USD",
    country: "US",
    methods: [
      {
        method: "Zelle",
        label: "Zelle",
        icon: "src/images/zelle.png",
        fields: ["name"],
        oneOf: [["phoneNumber"], ["email"]],
      },
      {
        method: "Venmo",
        label: "Venmo",
        icon: "src/images/venmo.png",
        fields: ["name", "handle"],
      },
      {
        method: "Apple Cash",
        label: "Apple Cash",
        icon: "src/images/apple_cash.png",
        fields: ["name"],
        oneOf: [["phoneNumber"], ["email"]],
      },
      {
        method: "PayPal",
        label: "PayPal",
        icon: "src/images/paypal.png",
        fields: ["name", "email"],
      },
      {
        method: "Cash App",
        label: "Cash App",
        icon: "src/images/cash_app.png",
        fields: ["name"],
        oneOf: [["cashtag"], ["phoneNumber"], ["email"]],
      },
      {
        method: "Cash",
        label: "Cash",
        icon: "src/images/cash.png",
        fields: ["name"],
      },
      {
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: "src/images/bank-transfer.png",
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
    country: "VN",
    methods: [
      {
        method: "MoMo",
        label: "MoMo",
        icon: "src/images/momo.png",
        fields: ["name", "phoneNumber"],
      },
      {
        method: "ZaloPay",
        label: "ZaloPay",
        icon: "src/images/zalo-pay.png",
        fields: ["name", "phoneNumber"],
      },
      {
        method: "Bank Transfer",
        label: "Chuyển khoản NH",
        icon: "src/images/bank-transfer.png",
        fields: ["name", "accountNumber"],
        oneOf: [["bankName"], ["bankCode"]],
        optionalFields: ["branchName"],
      },
    ],
  },

  {
    currency: "EUR",
    country: "EU",
    methods: [
      {
        method: "SEPA Transfer",
        label: "SEPA Transfer",
        icon: "src/images/sepa.png",
        fields: ["name", "iban"],
        optionalFields: ["bic"],
      },
      {
        method: "PayPal",
        label: "PayPal",
        icon: "src/images/paypal.png",
        fields: ["name", "email"],
      },
    ],
  },

  {
    currency: "GBP",
    country: "UK",
    methods: [
      {
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: "src/images/bank-transfer.png",
        fields: ["name", "bankName", "sortCode", "accountNumber"],
      },
      {
        method: "PayPal",
        label: "PayPal",
        icon: "src/images/paypal.png",
        fields: ["name", "email"],
      },
    ],
  },

  {
    currency: "SGD",
    country: "SG",
    methods: [
      {
        method: "PayNow",
        label: "PayNow",
        icon: "src/images/pay-now.png",
        fields: ["name", "payNowType", "payNowValue"],
      },
      {
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: "src/images/bank-transfer.png",
        fields: ["name", "bankName", "bankCode", "accountNumber"],
      },
    ],
  },

  {
    currency: "AUD",
    country: "AU",
    methods: [
      {
        method: "PayID",
        label: "PayID",
        icon: "src/images/pay-id.png",
        fields: ["name", "payIdType", "payIdValue"],
      },
      {
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: "src/images/bank-transfer.png",
        fields: ["name", "bankName", "bsb", "accountNumber"],
      },
    ],
  },

  {
    currency: "JPY",
    country: "JP",
    methods: [
      {
        method: "PayPay",
        label: "PayPay",
        icon: "src/images/cash.png",
        fields: ["name"],
        oneOf: [["phoneNumber"], ["paypayId"]],
      },
      {
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: "src/images/bank-transfer.png",
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
    country: "KR",
    methods: [
      {
        method: "KakaoPay",
        label: "KakaoPay",
        icon: "src/images/kakao-pay.png",
        fields: ["name", "phoneNumber"],
      },
      {
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: "src/images/bank-transfer.png",
        fields: ["name", "bankName", "bankCode", "accountNumber"],
      },
    ],
  },

  {
    currency: "THB",
    country: "TH",
    methods: [
      {
        method: "PromptPay",
        label: "PromptPay",
        icon: "src/images/promt-pay.png",
        fields: ["name", "promptPayType", "promptPayValue"],
      },
      {
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: "src/images/bank-transfer.png",
        fields: ["name", "bankName", "bankCode", "accountNumber"],
      },
    ],
  },

  {
    currency: "CNY",
    country: "CN",
    methods: [
      {
        method: "WeChat Pay",
        label: "WeChat Pay",
        icon: "src/images/wechat-pay.png",
        fields: ["name"],
        oneOf: [["wechatId"], ["phoneNumber"]],
      },
      {
        method: "Alipay",
        label: "Alipay",
        icon: "src/images/alipay.png",
        fields: ["name"],
        oneOf: [["alipayId"], ["phoneNumber"], ["email"]],
      },
      {
        method: "Bank Transfer",
        label: "Bank Transfer",
        icon: "src/images/bank-transfer.png",
        fields: ["name", "bankName", "accountNumber"],
        optionalFields: ["branchName", "city", "province"],
      },
    ],
  },
];
```

> Lưu ý: file icon hiện đang là `promt-pay.png`. Nếu đổi đúng chính tả thành `prompt-pay.png` thì phải sửa lại path trong matrix.

---

## 4. Mock data: Beneficiary Accounts

### 4.1 Account A beneficiary accounts

```ts
export const beneficiaryAccountsA = [
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
];
```

### 4.2 Account B beneficiary accounts

```ts
export const beneficiaryAccountsB = [
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
];
```

### 4.3 Combine beneficiary accounts

```ts
export const beneficiaryAccounts = [
  ...beneficiaryAccountsA,
  ...beneficiaryAccountsB,
];
```

---

## 5. Tạo Deal

### 5.1 Mục tiêu

User tạo một deal để nói rằng:

> Người thụ hưởng của tôi muốn nhận loại tiền X, bằng phương thức Y.  
> Tôi có thể gửi/trả loại tiền Z bằng các phương thức A, B, C.

Ví dụ Account B ở Việt Nam tạo deal:

- Người thụ hưởng/member của B ở US nhận USD.
- Người thụ hưởng/member của B nhận bằng Zelle.
- B ở Việt Nam có thể gửi VND bằng MoMo hoặc Bank Transfer.

---

### 5.2 Form Tạo Deal gồm các control

#### Control 1: Người thụ hưởng nhận bằng

Type: `currencySelect`

```ts
beneficiaryReceiveCurrency: {
  currency: "USD",
  country: "US",
  label: "USD - Đô la Mỹ"
}
```

Ý nghĩa: loại tiền mà người thụ hưởng của người tạo deal sẽ nhận.

---

#### Control 2: Tôi gửi bằng

Type: `currencySelect`

```ts
senderPayCurrency: {
  currency: "VND",
  country: "VN",
  label: "VND - Việt Nam Đồng"
}
```

Ý nghĩa: loại tiền mà người tạo deal có thể gửi/trả ở quốc gia của họ.

---

#### Control 3: Tỷ giá

Type: `numberInput`

```ts
exchangeRate: {
  from: "USD",
  to: "VND",
  rate: 25500,
  source: "market"
}
```

Có thể có nút lấy tỷ giá thị trường.

---

#### Control 4: Tối thiểu / Tối đa

Type: `numberInput`

```ts
amountLimit: {
  minUsd: 100,
  maxUsd: 5000
}
```

Dùng để kiểm tra search request có nằm trong khoảng deal cho phép hay không.

---

#### Control 5: Người thụ hưởng nhận USD bằng hình thức

Type: `singleSelectChips`

```ts
beneficiaryReceiveMethod: "Zelle"
```

Quan trọng: một deal chỉ có **1 hình thức người thụ hưởng nhận tiền**.

Không dùng:

```ts
beneficiaryReceiveMethods: ["Zelle", "PayPal"]
```

Vì mỗi deal phải gắn với **1 tài khoản nhận cụ thể**.

---

#### Control 6: Thông tin tài khoản người thụ hưởng

Type: `accountSelectCard`

```ts
beneficiaryAccountId: "acc_b_us_zelle_001"
```

Rule lọc account:

```ts
account.currency === beneficiaryReceiveCurrency.currency
account.method === beneficiaryReceiveMethod
account.status === "active"
```

---

#### Control 7: Tôi gửi VND bằng hình thức

Type: `multiSelectChips`

```ts
senderPaymentMethods: ["MoMo", "Bank Transfer"]
```

Người tạo deal có thể hỗ trợ nhiều hình thức gửi tiền ở phía của họ.

Field này là **multi-select**.

---

#### Control 8: Ghi chú

Type: `textarea`

```ts
note: "Có thể xử lý trong ngày."
```

---

### 5.3 Schema Tạo Deal

```ts
export const createDealForm = {
  ownerAccountId: "account_b",

  beneficiaryReceiveCurrency: {
    currency: "USD",
    country: "US",
    label: "USD - Đô la Mỹ",
  },

  senderPayCurrency: {
    currency: "VND",
    country: "VN",
    label: "VND - Việt Nam Đồng",
  },

  exchangeRate: {
    from: "USD",
    to: "VND",
    rate: 25500,
    source: "market",
  },

  amountLimit: {
    minUsd: 100,
    maxUsd: 5000,
  },

  beneficiaryReceiveMethod: "Zelle",
  beneficiaryAccountId: "acc_b_us_zelle_001",

  senderPaymentMethods: ["MoMo", "Bank Transfer"],

  note: "Có thể xử lý trong ngày.",
  status: "active",
};
```

---

### 5.4 Text mockup form Tạo Deal

```txt
┌──────────────────────────────────────┐
│ Tạo Deal Mới                         │
│ Thiết lập deal chuyển tiền chéo       │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Người thụ hưởng nhận bằng            │
│ [ 🇺🇸 USD ]                          │
│                                      │
│ Tôi gửi bằng                         │
│ [ 🇻🇳 VND ]                          │
│                                      │
│ Tỷ giá                               │
│ [ 1 USD = 25.500 VND ]               │
│                                      │
│ Giới hạn giao dịch                   │
│ [ Min 100 ] [ Max 5000 ]             │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Người thụ hưởng nhận USD bằng        │
│ [ ● Zelle ] [ ○ PayPal ]             │
│ [ ○ Bank Transfer ]                  │
│                                      │
│ Thông tin tài khoản người thụ hưởng  │
│ [ Zelle chính - +1 408 *** 0199 ]    │
│                                      │
│ Tôi gửi VND bằng hình thức           │
│ [ ✓ MoMo ] [ ✓ Bank Transfer ]       │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Ghi chú                              │
│ [ Có thể xử lý trong ngày... ]        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│              Tạo Deal                │
└──────────────────────────────────────┘
```

---

## 6. Tìm Deal

### 6.1 Mục tiêu

User tìm deal phù hợp với nhu cầu chuyển tiền của họ.

Ví dụ Account A:

- A gửi USD.
- Người thụ hưởng của A nhận VND.
- A có thể gửi USD bằng Zelle.
- Người thụ hưởng của A chỉ nhận VND bằng MoMo.

Hệ thống sẽ tìm deal của B sao cho:

- B cần người thụ hưởng/member ở US nhận USD.
- B nhận được USD bằng Zelle.
- B có thể gửi VND bằng MoMo cho người thụ hưởng của A.

---

### 6.2 Form Tìm Deal gồm các control

#### Control 1: Tôi gửi bằng

Type: `currencyAmountGroup`

Currency select + amount input trên cùng một hàng.

```ts
senderPayCurrency: {
  currency: "USD",
  country: "US",
  label: "USD"
}

amount: {
  value: 500,
  currency: "USD"
}
```

UI:

```txt
Tôi gửi bằng
[ 🇺🇸 USD ] [ 500 ]
```

---

#### Control 2: Tỷ giá tham khảo

Type: `readonlyText`

```ts
exchangeRatePreview: "1 USD ≈ 25.500đ"
```

---

#### Control 3: Người thụ hưởng sẽ nhận bằng

Type: `currencyAmountGroup`

Currency select + converted amount readonly trên cùng một hàng.

```ts
beneficiaryReceiveCurrency: {
  currency: "VND",
  country: "VN",
  label: "VND"
}

convertedAmountPreview: {
  value: 12750000,
  currency: "VND",
  displayText: "12.750.000đ"
}
```

UI:

```txt
Người thụ hưởng sẽ nhận bằng
[ 🇻🇳 VND ] [ 12.750.000đ ]
```

---

#### Control 4: Tôi gửi USD bằng hình thức

Type: `multiSelectChips`

```ts
senderPaymentMethods: ["Zelle"]
```

Ý nghĩa: A có thể dùng các phương thức này để gửi USD cho người thụ hưởng/member của B ở US.

Field này là **multi-select**.

Ví dụ:

```ts
["Zelle", "Venmo", "PayPal", "Bank Transfer"]
```

---

#### Control 5: Người thụ hưởng nhận VND bằng hình thức

Type: `singleSelectChips`

```ts
beneficiaryReceiveMethod: "MoMo"
```

Ý nghĩa: người thụ hưởng của A ở Việt Nam chỉ nhận tiền bằng **1 phương thức cụ thể**.

Field này là **single-select**.

Không dùng:

```ts
beneficiaryReceiveMethods: ["MoMo", "Bank Transfer"]
```

---

#### Control 6: Thông tin tài khoản người thụ hưởng

Type: `accountSelectCard`

```ts
beneficiaryAccountId: "acc_a_vn_momo_001"
```

Rule lọc account:

```ts
account.currency === beneficiaryReceiveCurrency.currency
account.method === beneficiaryReceiveMethod
account.status === "active"
```

Nếu chưa chọn tài khoản thì hiển thị:

```txt
Chưa chọn tài khoản người thụ hưởng.
[ Chọn tài khoản ] [ + Thêm tài khoản ]
```

---

#### Control 7: Ghi chú

Type: `textarea`

```ts
note: "Cần chuyển gấp trong hôm nay"
```

---

### 6.3 Schema Tìm Deal

```ts
export const searchDealForm = {
  requesterAccountId: "account_a",

  senderPayCurrency: {
    currency: "USD",
    country: "US",
    label: "USD",
  },

  amount: {
    value: 500,
    currency: "USD",
  },

  exchangeRatePreview: {
    from: "USD",
    to: "VND",
    rate: 25500,
    displayText: "1 USD ≈ 25.500đ",
  },

  beneficiaryReceiveCurrency: {
    currency: "VND",
    country: "VN",
    label: "VND",
  },

  convertedAmountPreview: {
    value: 12750000,
    currency: "VND",
    displayText: "12.750.000đ",
  },

  senderPaymentMethods: ["Zelle"],

  beneficiaryReceiveMethod: "MoMo",
  beneficiaryAccountId: "acc_a_vn_momo_001",

  note: "Cần chuyển gấp trong hôm nay",
};
```

---

### 6.4 Text mockup form Tìm Deal

```txt
┌──────────────────────────────────────┐
│ Tìm Deal                             │
│ Tìm người phù hợp để chuyển tiền chéo │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Tôi gửi bằng                         │
│                                      │
│ ┌─────────────────┐ ┌──────────────┐ │
│ │ 🇺🇸 USD       ▾ │ │ 500          │ │
│ └─────────────────┘ └──────────────┘ │
│                                      │
│ 1 USD ≈ 25.500đ                      │
│                                      │
│ Người thụ hưởng sẽ nhận bằng         │
│                                      │
│ ┌─────────────────┐ ┌──────────────┐ │
│ │ 🇻🇳 VND       ▾ │ │ 12.750.000đ  │ │
│ └─────────────────┘ └──────────────┘ │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Tôi gửi USD bằng hình thức           │
│                                      │
│ ┌──────────┐ ┌──────────┐            │
│ │ ✓ Zelle  │ │ ○ Venmo  │            │
│ └──────────┘ └──────────┘            │
│                                      │
│ ┌──────────┐ ┌──────────────────┐    │
│ │ ○ PayPal │ │ ○ Bank Transfer  │    │
│ └──────────┘ └──────────────────┘    │
│                                      │
│ Người thụ hưởng nhận VND bằng        │
│                                      │
│ ┌──────────┐ ┌───────────┐           │
│ │ ● MoMo   │ │ ○ ZaloPay │           │
│ └──────────┘ └───────────┘           │
│                                      │
│ ┌─────────────────────┐              │
│ │ ○ Chuyển khoản NH   │              │
│ └─────────────────────┘              │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Thông tin tài khoản người thụ hưởng  │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Chưa chọn tài khoản người thụ    │ │
│ │ hưởng.                          │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌────────────────┐ ┌──────────────┐ │
│ │ Chọn tài khoản │ │ + Thêm mới   │ │
│ └────────────────┘ └──────────────┘ │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Ghi chú                              │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Cần chuyển gấp trong hôm nay     │ │
│ │                                  │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│              Tìm Deal                │
└──────────────────────────────────────┘
```

---

## 7. Mock data: Deals & Search Result

### 7.1 Deal status

```ts
export const dealStatusOptions = [
  {
    value: "active",
    label: "Đang hoạt động",
  },
  {
    value: "completed",
    label: "Đã hoàn tất",
  },
  {
    value: "deleted",
    label: "Đã xoá",
  },
];
```

---

### 7.2 Deals from Account B

```ts
export const dealsFromB = [
  {
    id: "deal_b_001",
    dealCode: "DL-B-USD-VND-001",
    ownerAccountId: "account_b",
    status: "active",

    beneficiaryReceiveCurrency: {
      currency: "USD",
      country: "US",
      label: "USD - Đô la Mỹ",
    },

    beneficiaryReceiveMethod: "Zelle",
    beneficiaryAccountId: "acc_b_us_zelle_001",

    senderPayCurrency: {
      currency: "VND",
      country: "VN",
      label: "VND - Việt Nam Đồng",
    },

    senderPaymentMethods: ["MoMo", "Bank Transfer"],

    exchangeRate: {
      from: "USD",
      to: "VND",
      rate: 25500,
      source: "market",
      updatedAt: "2026-06-16T12:30:00Z",
    },

    amountLimit: {
      minUsd: 100,
      maxUsd: 5000,
    },

    note: "Có thể thanh toán VND qua MoMo hoặc chuyển khoản ngân hàng.",
    createdAt: "2026-06-16T08:00:00Z",
    updatedAt: "2026-06-16T12:30:00Z",
  },

  {
    id: "deal_b_002",
    dealCode: "DL-B-USD-VND-002",
    ownerAccountId: "account_b",
    status: "active",

    beneficiaryReceiveCurrency: {
      currency: "USD",
      country: "US",
      label: "USD - Đô la Mỹ",
    },

    beneficiaryReceiveMethod: "PayPal",
    beneficiaryAccountId: "acc_b_us_paypal_001",

    senderPayCurrency: {
      currency: "VND",
      country: "VN",
      label: "VND - Việt Nam Đồng",
    },

    senderPaymentMethods: ["ZaloPay"],

    exchangeRate: {
      from: "USD",
      to: "VND",
      rate: 25480,
      source: "custom",
      updatedAt: "2026-06-16T11:20:00Z",
    },

    amountLimit: {
      minUsd: 50,
      maxUsd: 2000,
    },

    note: "Chỉ hỗ trợ ZaloPay.",
    createdAt: "2026-06-16T09:15:00Z",
    updatedAt: "2026-06-16T11:20:00Z",
  },

  {
    id: "deal_b_003",
    dealCode: "DL-B-USD-VND-003",
    ownerAccountId: "account_b",
    status: "active",

    beneficiaryReceiveCurrency: {
      currency: "USD",
      country: "US",
      label: "USD - Đô la Mỹ",
    },

    beneficiaryReceiveMethod: "Bank Transfer",
    beneficiaryAccountId: "acc_b_us_bank_001",

    senderPayCurrency: {
      currency: "VND",
      country: "VN",
      label: "VND - Việt Nam Đồng",
    },

    senderPaymentMethods: ["Bank Transfer"],

    exchangeRate: {
      from: "USD",
      to: "VND",
      rate: 25600,
      source: "market",
      updatedAt: "2026-06-16T10:00:00Z",
    },

    amountLimit: {
      minUsd: 300,
      maxUsd: 10000,
    },

    note: "Ưu tiên giao dịch số tiền lớn.",
    createdAt: "2026-06-15T15:00:00Z",
    updatedAt: "2026-06-16T10:00:00Z",
  },
];
```

---

### 7.3 Matched deal result for Account A

Với search request A:

```ts
senderPaymentMethods: ["Zelle"]
beneficiaryReceiveMethod: "MoMo"
```

Chỉ `deal_b_001` match vì:

```ts
A.senderPaymentMethods.includes(B.beneficiaryReceiveMethod)
// ["Zelle"].includes("Zelle") === true

B.senderPaymentMethods.includes(A.beneficiaryReceiveMethod)
// ["MoMo", "Bank Transfer"].includes("MoMo") === true
```

```ts
export const matchedDealsForA = [
  {
    searchId: "search_a_001",
    dealId: "deal_b_001",
    dealCode: "DL-B-USD-VND-001",
    ownerAccountId: "account_b",
    status: "matched",

    matchResult: {
      isMatched: true,
      senderSideMatchedMethod: "Zelle",
      beneficiarySideMatchedMethod: "MoMo",
      matchedReason:
        "A có thể gửi USD bằng Zelle cho B, và B có thể gửi VND bằng MoMo cho người thụ hưởng của A.",
    },

    flow: {
      step1: {
        fromAccountId: "account_a",
        toBeneficiaryAccountId: "acc_b_us_zelle_001",
        currency: "USD",
        amount: 500,
        method: "Zelle",
        description:
          "A gửi USD bằng Zelle cho người thụ hưởng/member của B tại US.",
      },

      step2: {
        fromAccountId: "account_b",
        toBeneficiaryAccountId: "acc_a_vn_momo_001",
        currency: "VND",
        amount: 12750000,
        method: "MoMo",
        description:
          "B gửi VND bằng MoMo cho người thụ hưởng của A tại Việt Nam.",
      },
    },
  },
];
```

---

## 8. Rule match giữa Search Deal và Created Deal

Giả sử:

- A đang search deal.
- B đã tạo deal.

A search request match với deal của B khi thỏa tất cả điều kiện sau.

### 8.1 Currency phải đảo chiều

```ts
A.senderPayCurrency.currency === B.beneficiaryReceiveCurrency.currency
```

và:

```ts
A.beneficiaryReceiveCurrency.currency === B.senderPayCurrency.currency
```

Ví dụ:

```txt
A gửi USD, người thụ hưởng của A nhận VND.
B có người thụ hưởng nhận USD, B gửi VND.
```

=> Match currency.

---

### 8.2 A phải gửi được tiền cho người thụ hưởng của B

```ts
A.senderPaymentMethods.includes(B.beneficiaryReceiveMethod)
```

Ví dụ:

```ts
A.senderPaymentMethods = ["Zelle"]
B.beneficiaryReceiveMethod = "Zelle"
```

=> Match.

Nếu:

```ts
A.senderPaymentMethods = ["PayPal"]
B.beneficiaryReceiveMethod = "Zelle"
```

=> Không match.

---

### 8.3 B phải gửi được tiền đúng phương thức người thụ hưởng của A chọn

```ts
B.senderPaymentMethods.includes(A.beneficiaryReceiveMethod)
```

Ví dụ:

```ts
A.beneficiaryReceiveMethod = "MoMo"
B.senderPaymentMethods = ["MoMo", "Bank Transfer"]
```

=> Match.

Nếu:

```ts
A.beneficiaryReceiveMethod = "MoMo"
B.senderPaymentMethods = ["Bank Transfer"]
```

=> Không match.

---

### 8.4 Amount phải nằm trong limit của deal B

```ts
A.amount.value >= B.amountLimit.minUsd
A.amount.value <= B.amountLimit.maxUsd
```

---

### 8.5 Full match rule

```ts
const isMatched =
  A.senderPayCurrency.currency === B.beneficiaryReceiveCurrency.currency &&
  A.beneficiaryReceiveCurrency.currency === B.senderPayCurrency.currency &&
  A.senderPaymentMethods.includes(B.beneficiaryReceiveMethod) &&
  B.senderPaymentMethods.includes(A.beneficiaryReceiveMethod) &&
  A.amount.value >= B.amountLimit.minUsd &&
  A.amount.value <= B.amountLimit.maxUsd;
```

---

## 9. Sau khi hai bên chấp nhận giao dịch

### 9.1 Mục tiêu

Sau khi A tìm thấy deal phù hợp và chọn deal, hệ thống cần tạo một **transaction detail** để hai bên theo dõi và thực hiện giao dịch.

Flow này dùng để:

- Hai bên xác nhận đồng ý giao dịch.
- Hiển thị thông tin chuyển tiền của từng bên.
- Theo dõi trạng thái từng bước.
- Upload bằng chứng gửi tiền.
- Xác nhận đã nhận tiền.
- Hoàn tất hoặc mở tranh chấp nếu có vấn đề.

---

### 9.2 Trạng thái giao dịch đề xuất

```ts
export const transactionStatusOptions = [
  {
    value: "pending_acceptance",
    label: "Chờ hai bên chấp nhận",
  },
  {
    value: "accepted",
    label: "Hai bên đã chấp nhận",
  },
  {
    value: "waiting_for_payment",
    label: "Chờ gửi tiền",
  },
  {
    value: "proof_submitted",
    label: "Đã upload bằng chứng",
  },
  {
    value: "partially_confirmed",
    label: "Một bên đã xác nhận nhận tiền",
  },
  {
    value: "completed",
    label: "Hoàn tất",
  },
  {
    value: "cancelled",
    label: "Đã huỷ",
  },
  {
    value: "disputed",
    label: "Đang tranh chấp",
  },
];
```

---

### 9.3 Transaction detail schema

```ts
export const mockTransactionDetail = {
  id: "txn_001",
  transactionCode: "TXN-USD-VND-001",

  searchId: "search_a_001",
  dealId: "deal_b_001",

  status: "accepted",

  createdAt: "2026-06-16T13:10:00Z",
  acceptedAt: "2026-06-16T13:15:00Z",
  completedAt: null,

  exchangeRate: {
    from: "USD",
    to: "VND",
    rate: 25500,
  },

  amount: {
    sendAmount: {
      value: 500,
      currency: "USD",
    },
    receiveAmount: {
      value: 12750000,
      currency: "VND",
    },
  },

  parties: {
    requester: {
      accountId: "account_a",
      role: "searcher",
      displayName: "Account A",
      acceptedAt: "2026-06-16T13:14:00Z",
    },
    dealOwner: {
      accountId: "account_b",
      role: "deal_owner",
      displayName: "Account B",
      acceptedAt: "2026-06-16T13:15:00Z",
    },
  },

  paymentFlows: [
    {
      id: "flow_a_to_b",
      payerAccountId: "account_a",
      receiverAccountId: "account_b",
      receiverBeneficiaryAccountId: "acc_b_us_zelle_001",

      currency: "USD",
      amount: 500,
      method: "Zelle",

      title: "A gửi USD cho người thụ hưởng/member của B",
      instruction:
        "Account A cần gửi 500 USD bằng Zelle tới tài khoản nhận của Account B.",

      status: "waiting_for_payment",

      proof: {
        uploaded: false,
        files: [],
        note: "",
        uploadedAt: null,
      },

      confirmedByReceiver: false,
      confirmedAt: null,
    },

    {
      id: "flow_b_to_a",
      payerAccountId: "account_b",
      receiverAccountId: "account_a",
      receiverBeneficiaryAccountId: "acc_a_vn_momo_001",

      currency: "VND",
      amount: 12750000,
      method: "MoMo",

      title: "B gửi VND cho người thụ hưởng của A",
      instruction:
        "Account B cần gửi 12.750.000 VND bằng MoMo tới tài khoản người thụ hưởng của Account A.",

      status: "waiting_for_payment",

      proof: {
        uploaded: false,
        files: [],
        note: "",
        uploadedAt: null,
      },

      confirmedByReceiver: false,
      confirmedAt: null,
    },
  ],
};
```

---

### 9.4 Màn hình chi tiết theo dõi giao dịch

Sau khi hai bên chấp nhận, UI nên điều hướng vào màn hình:

```txt
Chi tiết giao dịch / Transaction Detail
```

Màn hình này cần có các section:

1. Thông tin tổng quan giao dịch.
2. Tỷ giá và số tiền.
3. Trạng thái hai bên.
4. Việc A cần làm.
5. Việc B cần làm.
6. Upload bằng chứng gửi tiền.
7. Xác nhận đã nhận tiền.
8. Lịch sử hoạt động.
9. Nút mở tranh chấp nếu có vấn đề.

---

### 9.5 Text mockup Transaction Detail

```txt
┌──────────────────────────────────────┐
│ Chi tiết giao dịch                   │
│ TXN-USD-VND-001                      │
│ Trạng thái: Hai bên đã chấp nhận      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Tổng quan                            │
│ A gửi: 500 USD                       │
│ Người thụ hưởng của A nhận:          │
│ 12.750.000 VND                       │
│ Tỷ giá: 1 USD = 25.500 VND           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Bước 1: A gửi USD cho B              │
│ Phương thức: Zelle                   │
│ Số tiền: 500 USD                     │
│ Người nhận: Tran Van B              │
│ Phone: +1 415 555 2288               │
│                                      │
│ Trạng thái: Chờ gửi tiền             │
│                                      │
│ [ Tôi đã gửi tiền ]                  │
│ [ Upload bằng chứng ]                │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Bước 2: B gửi VND cho A              │
│ Phương thức: MoMo                    │
│ Số tiền: 12.750.000 VND              │
│ Người nhận: Nguyen Van A             │
│ Phone: 0901236789                    │
│                                      │
│ Trạng thái: Chờ gửi tiền             │
│                                      │
│ [ Tôi đã gửi tiền ]                  │
│ [ Upload bằng chứng ]                │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Xác nhận nhận tiền                   │
│ [ Tôi đã nhận tiền ]                 │
│ [ Báo cáo sự cố / Tranh chấp ]       │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Lịch sử hoạt động                    │
│ 13:15 - Hai bên đã chấp nhận giao dịch│
│ 13:20 - A upload bằng chứng gửi USD  │
└──────────────────────────────────────┘
```

---

### 9.6 Upload bằng chứng gửi tiền

Mỗi bên sau khi gửi tiền cần upload bằng chứng.

Control upload proof:

```ts
export const proofUploadControl = {
  key: "paymentProof",
  label: "Upload bằng chứng gửi tiền",
  type: "fileUpload",
  required: true,
  acceptedFileTypes: ["image/png", "image/jpeg", "image/webp", "application/pdf"],
  maxFiles: 5,
  maxFileSizeMb: 5,
  description:
    "Upload ảnh chụp màn hình, biên lai, hoặc file xác nhận giao dịch.",
};
```

Proof object:

```ts
export const mockPaymentProof = {
  id: "proof_001",
  transactionId: "txn_001",
  flowId: "flow_a_to_b",

  uploaderAccountId: "account_a",

  files: [
    {
      id: "file_001",
      name: "zelle-payment-proof.png",
      url: "/mock/proofs/zelle-payment-proof.png",
      mimeType: "image/png",
      sizeMb: 1.2,
      uploadedAt: "2026-06-16T13:20:00Z",
    },
  ],

  note: "Đã gửi 500 USD bằng Zelle.",
  uploadedAt: "2026-06-16T13:20:00Z",
};
```

---

### 9.7 Action sau khi gửi tiền

Khi user bấm:

```txt
Tôi đã gửi tiền
```

Hệ thống nên:

1. Yêu cầu upload bằng chứng nếu chưa upload.
2. Đổi status của payment flow thành `proof_submitted`.
3. Ghi activity log.
4. Thông báo cho bên còn lại kiểm tra và xác nhận.

Ví dụ update flow:

```ts
const updatedPaymentFlow = {
  ...paymentFlow,
  status: "proof_submitted",
  proof: {
    uploaded: true,
    files: ["file_001"],
    note: "Đã gửi 500 USD bằng Zelle.",
    uploadedAt: "2026-06-16T13:20:00Z",
  },
};
```

---

### 9.8 Action xác nhận đã nhận tiền

Khi người nhận kiểm tra và bấm:

```txt
Tôi đã nhận tiền
```

Hệ thống nên:

1. Đánh dấu flow đó là `confirmed`.
2. Ghi nhận thời gian xác nhận.
3. Nếu cả 2 flow đều confirmed thì transaction status chuyển thành `completed`.

Ví dụ:

```ts
const isTransactionCompleted = paymentFlows.every(
  (flow) => flow.status === "confirmed"
);
```

---

### 9.9 Dispute / tranh chấp

Nếu một bên đã upload bằng chứng nhưng bên còn lại không nhận được tiền, user có thể mở tranh chấp.

Control:

```txt
Báo cáo sự cố / Tranh chấp
```

Dispute schema:

```ts
export const mockDispute = {
  id: "dispute_001",
  transactionId: "txn_001",
  openedByAccountId: "account_a",
  reason: "Tôi chưa nhận được tiền.",
  description: "Bên B báo đã gửi MoMo nhưng người thụ hưởng của tôi chưa nhận được.",
  status: "open",
  createdAt: "2026-06-16T14:00:00Z",
};
```

---

## 10. Helper functions

### 10.1 Get payment methods by currency

```ts
export const getPaymentMethodsByCurrency = (currency: string) => {
  return (
    paymentMethodMatrix.find((item) => item.currency === currency)?.methods || []
  );
};
```

---

### 10.2 Get payment method config

```ts
export const getPaymentMethodConfig = (currency: string, method: string) => {
  const currencyConfig = paymentMethodMatrix.find(
    (item) => item.currency === currency
  );

  return currencyConfig?.methods.find((item) => item.method === method) || null;
};
```

---

### 10.3 Get account form fields

```ts
export const getAccountFormFields = (currency: string, method: string) => {
  const methodConfig = getPaymentMethodConfig(currency, method);

  if (!methodConfig) {
    return {
      requiredFields: [],
      oneOfFields: [],
      optionalFields: [],
    };
  }

  return {
    requiredFields: methodConfig.fields || [],
    oneOfFields: methodConfig.oneOf || [],
    optionalFields: methodConfig.optionalFields || [],
  };
};
```

---

### 10.4 Validate account details by matrix

```ts
export const validateAccountDetailsByMatrix = ({
  currency,
  method,
  details,
}: {
  currency: string;
  method: string;
  details: Record<string, unknown>;
}) => {
  const methodConfig = getPaymentMethodConfig(currency, method);

  if (!methodConfig) return false;

  const hasRequiredFields = (methodConfig.fields || []).every((field) => {
    return (
      details[field] !== undefined &&
      details[field] !== null &&
      details[field] !== ""
    );
  });

  const hasOneOfFields = methodConfig.oneOf
    ? methodConfig.oneOf.some((group) =>
        group.every((field) => {
          return (
            details[field] !== undefined &&
            details[field] !== null &&
            details[field] !== ""
          );
        })
      )
    : true;

  return hasRequiredFields && hasOneOfFields;
};
```

---

### 10.5 Search deals

```ts
export const searchDeals = (searchRequest: any, deals: any[]) => {
  return deals
    .filter((deal) => deal.status === "active")
    .filter((deal) => {
      const isCurrencyPairMatched =
        searchRequest.senderPayCurrency.currency ===
          deal.beneficiaryReceiveCurrency.currency &&
        searchRequest.beneficiaryReceiveCurrency.currency ===
          deal.senderPayCurrency.currency;

      const canRequesterPayToDealOwner = searchRequest.senderPaymentMethods.includes(
        deal.beneficiaryReceiveMethod
      );

      const canDealOwnerPayToRequester = deal.senderPaymentMethods.includes(
        searchRequest.beneficiaryReceiveMethod
      );

      const isAmountValid =
        searchRequest.amount.value >= deal.amountLimit.minUsd &&
        searchRequest.amount.value <= deal.amountLimit.maxUsd;

      return (
        isCurrencyPairMatched &&
        canRequesterPayToDealOwner &&
        canDealOwnerPayToRequester &&
        isAmountValid
      );
    });
};
```

---

### 10.6 Create transaction after both parties accept

```ts
export const createTransactionAfterAccepted = ({
  searchRequest,
  deal,
}: {
  searchRequest: any;
  deal: any;
}) => {
  return {
    id: `txn_${Date.now()}`,
    searchId: searchRequest.searchId,
    dealId: deal.id,
    status: "accepted",

    paymentFlows: [
      {
        id: "flow_requester_to_deal_owner",
        payerAccountId: searchRequest.requesterAccountId,
        receiverBeneficiaryAccountId: deal.beneficiaryAccountId,
        currency: searchRequest.senderPayCurrency.currency,
        amount: searchRequest.amount.value,
        method: deal.beneficiaryReceiveMethod,
        status: "waiting_for_payment",
        proof: {
          uploaded: false,
          files: [],
        },
      },
      {
        id: "flow_deal_owner_to_requester",
        payerAccountId: deal.ownerAccountId,
        receiverBeneficiaryAccountId: searchRequest.beneficiaryAccountId,
        currency: searchRequest.beneficiaryReceiveCurrency.currency,
        amount: searchRequest.convertedAmountPreview.value,
        method: searchRequest.beneficiaryReceiveMethod,
        status: "waiting_for_payment",
        proof: {
          uploaded: false,
          files: [],
        },
      },
    ],
  };
};
```

---

## 11. Điểm dễ sai cần tránh

### Sai 1: Dùng `beneficiaryReceiveMethods` dạng array trong search

Không đúng:

```ts
beneficiaryReceiveMethods: ["MoMo", "Bank Transfer"]
```

Đúng:

```ts
beneficiaryReceiveMethod: "MoMo"
beneficiaryAccountId: "acc_a_vn_momo_001"
```

Lý do: người thụ hưởng chỉ nhận bằng 1 tài khoản cụ thể.

---

### Sai 2: Dùng `beneficiaryReceiveMethods` dạng array trong create deal

Không đúng:

```ts
beneficiaryReceiveMethods: ["Zelle", "PayPal"]
```

Đúng:

```ts
beneficiaryReceiveMethod: "Zelle"
beneficiaryAccountId: "acc_b_us_zelle_001"
```

Lý do: một deal chỉ gắn với 1 tài khoản nhận của người thụ hưởng.

---

### Sai 3: Render field account không theo `paymentMethodMatrix`

Không được hard-code field.

Phải render field dựa theo:

```ts
currency + method
```

trong `paymentMethodMatrix`.

---

### Sai 4: Hiểu nhầm `senderPaymentMethods` và `beneficiaryReceiveMethod`

`senderPaymentMethods` là multi-select.

```ts
senderPaymentMethods: ["MoMo", "Bank Transfer"]
```

`beneficiaryReceiveMethod` là single-select.

```ts
beneficiaryReceiveMethod: "MoMo"
```

---

### Sai 5: Không tạo màn hình chi tiết giao dịch sau khi hai bên accept

Sau khi hai bên chấp nhận, không được dừng ở trạng thái matched/accepted.

Phải tạo `transactionDetail` để:

- Theo dõi từng bước gửi tiền.
- Hiển thị thông tin tài khoản nhận của mỗi bên.
- Cho phép upload bằng chứng gửi tiền.
- Cho phép xác nhận đã nhận tiền.
- Cho phép mở tranh chấp nếu có vấn đề.

---

## 12. Tóm tắt cho AI/dev

### Create Deal

Create Deal là nơi user tạo offer:

```txt
Người thụ hưởng của tôi nhận currency A bằng 1 method + 1 account.
Tôi có thể gửi currency B bằng nhiều method.
```

### Search Deal

Search Deal là nơi user tìm offer phù hợp:

```txt
Tôi gửi currency A bằng nhiều method.
Người thụ hưởng của tôi nhận currency B bằng 1 method + 1 account.
```

### Match logic

Match deal bằng cách đảo chiều currency và kiểm tra method ở cả 2 phía:

```ts
A.senderPaymentMethods includes B.beneficiaryReceiveMethod
B.senderPaymentMethods includes A.beneficiaryReceiveMethod
```

### Sau khi match và hai bên chấp nhận

Hệ thống tạo transaction detail:

```txt
A gửi tiền cho người thụ hưởng/member của B.
B gửi tiền cho người thụ hưởng của A.
Mỗi bên upload bằng chứng gửi tiền.
Mỗi bên xác nhận đã nhận tiền.
Nếu cả hai flow confirmed thì giao dịch hoàn tất.
```

Đây là logic cốt lõi của chuyển tiền chéo.
