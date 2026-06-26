# 1.1 - Business Specification: Create Deal & Search Deal

## 1. Mục đích bản 1.1

Bản 1.1 cập nhật spec Create Deal / Search Deal theo base business doc `src/docs/p2p-remit-deal.md`, implementation hiện tại trong `src/html`, và API reference `src/docs/p2p-remit-deal-api.html`.

`src/docs/p2p-remit-deal.md` là source of truth nghiệp vụ đã Approved. Nếu HTML/API hiện tại lệch base doc, bản 1.1 ghi nhận thành integration gap thay vì đổi nghiệp vụ.

Nguồn đối chiếu chính:

| Source | Nội dung dùng trong spec |
|---|---|
| `src/docs/p2p-remit-deal.md` | Base business rules: Creator/Matcher semantics, USDV hold/fee, SLA, proof, status lifecycle |
| `src/html/create-deal.html`, `src/html/assets/js/create.js` | Form tạo deal, currency/method dynamic, market rate toggle, beneficiary account picker, availability hours |
| `src/html/search-deal.html`, `src/html/assets/js/search.js` | Form tìm deal, default USD -> VND, multi-select method filters |
| `src/html/deal-results.html`, `src/html/assets/js/deal-results.js` | Danh sách marketplace, card/table view, pagination |
| `src/html/deal-detail.html`, `src/html/assets/js/deal-detail.js` | Chi tiết deal, privacy theo owner/non-owner |
| `src/html/select-deal.html`, `src/html/assets/js/select-deal.js` | Chọn deal, chọn method/account cuối cùng, confirm tạo giao dịch |
| `src/html/manage-deals.html`, `src/html/assets/js/manage.js` | Quản lý deal của tôi, trạng thái mock, view/filter/pagination |
| `src/html/assets/js/mock-data.js`, `src/html/assets/js/common.js` | Data shape, payment method matrix, beneficiary account matrix, helper render/validation |
| `src/docs/p2p-remit-deal-api.html` | API contract v1: endpoints, request/response fields, enum, status |

## 2. Changelog so với bản 1.0

1. Cập nhật thuật ngữ theo base doc/API: `Creator` là người tạo/post deal, nhận source currency từ Matcher và trả destination currency cho beneficiary của Matcher; `Matcher` là người chọn/accept deal từ marketplace.
2. Base flow yêu cầu Matcher chọn saved beneficiary/payment profile trong flow Find/Accept Deal; HTML hiện defer bước này sang `select-deal.html`.
3. Search method ở cả hai phía đang là multi-select trong prototype; khi chọn một deal cụ thể, UI khóa thành single method/profile để tạo match.
4. Create Deal bổ sung `Availability Hours` với cấu trúc nhiều ngày trong HTML. API v1 hiện chỉ có `workingHoursStart`, `workingHoursEnd`, `workingHoursTimezone`; cần mapping hoặc mở rộng API nếu muốn giữ full weekly schedule.
5. Results page hiện render card/table view, lưu view mode vào `localStorage`, page size = 5.
6. Create/Select account picker lọc theo `currency + method + status === "active"` và reset account đã chọn nếu method/currency đổi.
7. API integration dùng `/api/remit-deal`: `/setting`, `/corridors`, `/marketplace`, `/payment-methods`, `/payment-profiles`, create/update/accept/approve/cancel. Base business doc vẫn là source of truth khi API text mâu thuẫn.
8. `amountLimit.minUsd/maxUsd` trong mock chỉ là tên field prototype. Khi gọi API phải dùng `minAmount/maxAmount` theo asset/corridor, không giả định mọi corridor đều tính bằng USD.
9. `active/completed/deleted` trong HTML là trạng thái mock cho quản lý deal; backend API dùng enum `New/Paused/WaitingUploadProof/Completed/Cancelled/PendingApproval/Disputed/Resolved`.
10. Ghi nhận gap: HTML payment method matrix rộng hơn API enum v1. API enum hiện chỉ hỗ trợ Momo, ZaloPay, BankTransfer, Zelle, Venmo, AppleCash, Paypal, CashApp.

## 3. Business context

Create/Search Deal phục vụ luồng chuyển tiền local-to-local giữa hai member có nhu cầu ngược chiều.

Ví dụ:

- Account A ở US muốn gửi USD, người thụ hưởng của A ở Việt Nam nhận VND.
- Account B ở Việt Nam tạo deal: B có thể nhận USD từ Matcher qua tài khoản nhận của B và có thể trả VND cho người thụ hưởng của Matcher.
- Khi A chọn deal của B:
  - A gửi USD cho Creator payment account của B tại US.
  - B gửi VND cho tài khoản người thụ hưởng của A tại Việt Nam.

Platform đóng vai trò marketplace/matching engine, lưu deal, lock/hold khi cần, theo dõi proof/SLA/dispute và không tự chuyển tiền local payment thay hai bên.

## 4. Roles và thuật ngữ chuẩn

| Thuật ngữ | Ý nghĩa trong UI | Ý nghĩa trong API |
|---|---|---|
| Creator | Người tạo/post deal, ví dụ Account B; nhận source currency từ Matcher và trả destination currency cho beneficiary của Matcher | `currentUserRole = Creator`, caller của `POST /api/remit-deal` |
| Matcher | Người tìm và chọn deal, ví dụ Account A; trả source currency cho Creator và khai báo beneficiary nhận destination currency | `currentUserRole = Matcher`, caller của `POST /api/remit-deal/{id}/accept` |
| Creator payment account | Tài khoản external của Creator nơi Matcher gửi source currency off-system | API hiện dùng `/payment-profiles`; field naming cần align theo base doc |
| Matcher beneficiary profile | Saved payment profile của Matcher cho người thụ hưởng nhận destination currency | `/payment-profiles`, field `beneficiaryPaymentMethodId` khi accept |
| Payment method | Kênh local payment như MoMo, Zelle, Bank Transfer | `RemitPaymentMethod` enum hoặc `PaymentMethodDto` |
| Corridor | Cặp asset/currency được phép tạo/tìm deal | `/corridors`, dùng `corridorId` khi create/search |
| Marketplace | Danh sách deal còn có thể match | `GET /api/remit-deal/marketplace` |

## 5. Screen inventory

| Screen | File | Business responsibility |
|---|---|---|
| Search Deal | `src/html/search-deal.html` | Nhập nhu cầu gửi/nhận, chọn nhiều method để lọc marketplace |
| Deal Results | `src/html/deal-results.html` | Hiển thị deals phù hợp dạng card/table, mở detail hoặc chọn deal |
| Deal Detail | `src/html/deal-detail.html` | Xem tỷ giá, hạn mức, method, note, role-aware payment account/profile visibility |
| Select Deal | `src/html/select-deal.html` | Khóa deal đã chọn, chọn amount/method/account cuối cùng, confirm accept |
| Manage Deals | `src/html/manage-deals.html` | Danh sách deal do tôi tạo, filter trạng thái mock, sửa/xem/xóa |
| Create Deal | `src/html/create-deal.html` | Creator cấu hình corridor, rate, limit, accepted receiving methods/accounts, availability hours |

## 6. Source of truth: currency, method, profile

### 6.1 Currency

`CURRENCIES` trong `mock-data.js` là danh sách hiển thị cho UI, nhưng không phải tất cả currency đều có payment method.

Prototype hiện có payment method cho các currency:

```ts
["USD", "VND", "EUR", "GBP", "SGD", "AUD", "JPY", "KRW", "THB", "CNY"]
```

Production phải lấy currency/corridor từ:

```http
GET /api/remit-deal/corridors
```

Response trả về `CorridorDto[]`:

```ts
{
  id: number;
  fromAsset: AssetBasicModel;
  toAsset: AssetBasicModel;
  rate: number;
}
```

### 6.2 Payment method matrix trong HTML

`paymentMethodMatrix` trong `mock-data.js` dùng để:

- Render method chips theo currency.
- Render dynamic fields khi thêm/sửa beneficiary account.
- Validate required fields, optional fields và `oneOf`.
- Map icon hiển thị.

Ví dụ Zelle:

```ts
{
  currency: "USD",
  method: "Zelle",
  fields: ["name"],
  oneOf: [["phoneNumber"], ["email"]]
}
```

Ví dụ VND Bank Transfer:

```ts
{
  currency: "VND",
  method: "Bank Transfer",
  fields: ["name", "accountNumber"],
  oneOf: [["bankName"], ["bankCode"]],
  optionalFields: ["branchName"]
}
```

### 6.3 Payment methods từ API

Production phải lấy danh sách method và field definition từ:

```http
GET /api/remit-deal/payment-methods?assetIds={ids}&isActive=true
```

Response `PaymentMethodDto`:

```ts
{
  id: number;
  asset: AssetBasicModel;
  paymentMethod: RemitPaymentMethod;
  paymentMethodName: string;
  isActive: boolean;
  fields: { key: string; label: string }[];
}
```

API enum v1:

| Value | Name | UI label |
|---:|---|---|
| 1 | Momo | MoMo |
| 2 | ZaloPay | ZaloPay |
| 3 | BankTransfer | Bank Transfer / Chuyển khoản NH |
| 4 | Zelle | Zelle |
| 5 | Venmo | Venmo |
| 6 | AppleCash | Apple Cash |
| 7 | Paypal | PayPal |
| 8 | CashApp | Cash App |

Các method trong prototype nhưng chưa có trong API enum v1 như SEPA Transfer, PayNow, PayID, PayPay, KakaoPay, PromptPay, WeChat Pay, Alipay chỉ được xem là UI/mock extension. Không đưa vào production flow nếu backend chưa hỗ trợ.

### 6.4 Payment profiles và account semantics

Trong base doc có hai loại account/profile cần phân biệt:

| Loại | Ai sở hữu | Dùng khi nào | Business meaning |
|---|---|---|---|
| Creator payment account | Creator | Khi tạo deal | Nơi Matcher gửi source currency cho Creator off-system |
| Matcher beneficiary profile | Matcher | Khi accept deal | Nơi Creator gửi destination currency cho beneficiary của Matcher |

Trong HTML, cả hai đang dùng chung mock object `beneficiaryAccountsA/B`:

```ts
{
  id: "acc_a_vn_momo_001",
  currency: "VND",
  country: "VN",
  method: "MoMo",
  isDefault: true,
  status: "active",
  details: {
    name: "Nguyen Van A",
    phoneNumber: "0901236789"
  }
}
```

Trong API, object này tương ứng `ProfileDto`:

```ts
{
  id: number;
  asset: AssetBasicModel;
  paymentMethod: number;
  paymentMethodName: string;
  isActive: boolean;
  fields: FieldDef[];
  fieldValues: Record<string, string>;
}
```

API:

```http
GET    /api/remit-deal/payment-profiles?assetId={assetId}&paymentMethod={method}
POST   /api/remit-deal/payment-profiles
PUT    /api/remit-deal/payment-profiles/{id}
DELETE /api/remit-deal/payment-profiles/{id}
```

Rule lọc profile/account trong UI:

```ts
account.currency === selectedCurrency &&
account.method === selectedMethod &&
account.status === "active"
```

Production rule:

```ts
profile.asset.id === selectedAssetId &&
profile.paymentMethod === selectedPaymentMethod &&
profile.isActive === true
```

Important base-doc correction:

- Khi **Creator tạo deal**, profile/account được chọn phải được hiểu là **Creator payment account** cho source currency mà Matcher sẽ gửi vào. Creator phải có registered account cho mỗi accepted payment method trong current version.
- Khi **Matcher accept deal**, profile/account được chọn là **Matcher beneficiary profile** cho destination currency mà Creator sẽ trả ra.
- Các label HTML như “Thông tin tài khoản người thụ hưởng” trong Create Deal là legacy/prototype wording. Production copy phải đổi để không hiểu nhầm Creator đang khai báo beneficiary riêng của mình.

## 7. Create Deal

### 7.1 Mục tiêu

Creator tạo một deal để công bố:

```txt
Tôi có thể nhận source currency từ Matcher qua các payment account đã đăng ký.
Sau khi match được confirm, tôi sẽ trả destination currency cho beneficiary của Matcher.
Deal có corridor, tỷ giá, hạn mức, accepted payment methods, ghi chú và giờ sẵn sàng xử lý.
```

Trong mock mặc định:

- Business corridor là `USD -> VND`: Matcher gửi USD cho Creator, beneficiary của Matcher nhận VND.
- HTML hiện render legacy labels: `createSenderCurrency = VND` và `createBeneficiaryCurrency = USD`; khi production hóa phải remap/copy lại theo base doc.
- Tỷ giá default lấy từ market deal nếu có.
- Min/max default trên UI: `99` và `799`.
- Availability default: Mon-Fri 09:00-19:00, Sat 10:00-16:00, Sun off.

### 7.2 Controls hiện có trong `create-deal.html`

| Control | HTML id | Behavior |
|---|---|---|
| Tôi gửi bằng | `createSenderCurrency` | Legacy label. Theo base doc đây là destination currency Creator sẽ trả cho Matcher beneficiary |
| Thụ hưởng nhận qua | `createBeneficiaryCurrency` | Legacy label. Theo base doc đây là source currency Creator nhận từ Matcher; đổi currency sẽ reset selected account |
| Tỷ giá | `createExchangeRateInput` | Manual input hoặc readonly khi bật market rate |
| Tỷ giá thị trường | `createMarketRateToggle` | Khi checked, lấy rate từ `mockDealsB` exact/reverse pair |
| Tối thiểu / Tối đa | text inputs | Label đổi theo sender currency |
| Tôi gửi tiền {currency} bằng hình thức | `createSenderVndMethods` | Legacy copy. Theo base doc đây là payout capability của Creator; API semantics cần chốt |
| Người thụ hưởng nhận {currency} bằng hình thức | `createBeneficiaryUsdMethods` | Legacy copy. Theo base doc đây là Creator receiving method/source payment account |
| Thông tin tài khoản người thụ hưởng | `createBeneficiaryAccount` | Legacy copy. Theo base doc đây là Creator payment account, không phải beneficiary của Creator |
| Chọn tài khoản | `createBeneficiaryAccountPickerModal` | Lọc account theo currency/method/status |
| Thêm mới | shared account modal | Dynamic fields theo payment method matrix |
| Availability Hours | `operatingHoursModal` | Multi-day enabled/start/end rows |
| Ghi chú | textarea | Public note |
| Đăng Deal | button | Submit action, mock chưa gọi API |

### 7.3 Create Deal target form model

```ts
type CreateDealForm = {
  creatorAccountId: string;

  // Base-doc orientation: Matcher pays source -> Creator; Creator pays destination -> Matcher beneficiary.
  sourceCurrency: CurrencyRef;
  destinationCurrency: CurrencyRef;

  exchangeRate: {
    from: string; // source currency
    to: string;   // destination currency
    rate: number;
    source: "market" | "custom";
  };

  amountLimit: {
    minAmount: number;
    maxAmount: number;
  };

  availabilityHours: AvailabilityHour[];

  // Methods/accounts where Matcher can send source currency to Creator.
  acceptedPaymentMethods: string[];
  creatorPaymentAccountIds: string[];

  note: string;
  status: "New";
};
```

`amountLimit` không được đặt tên production là `minUsd/maxUsd`; đó chỉ là tên mock. Với non-USD corridor, amount phải theo source amount của corridor/API.

Base doc rule: khi tạo deal hợp lệ, status là `New` và **không giữ USDV ở thời điểm tạo deal**.

### 7.4 API create mapping

Endpoint:

```http
POST /api/remit-deal
Authorization: Bearer <JWT>
```

API request:

```ts
{
  corridorId: number;
  rate: number;
  note: string;
  minAmount: number;
  maxAmount: number;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  workingHoursTimezone?: string;
  paymentMethodIds: number[];
  beneficiaryPaymentMethodId: number;
}
```

Mapping đề xuất từ UI:

| UI field | API field | Rule |
|---|---|---|
| `sourceCurrency + destinationCurrency` | `corridorId` | Resolve từ `GET /corridors`; base orientation là source -> destination |
| `exchangeRate.rate` | `rate` | Decimal > 0 |
| `note` | `note` | Required, max 200 chars theo API |
| `amountLimit.minAmount` | `minAmount` | > 0 |
| `amountLimit.maxAmount` | `maxAmount` | >= `minAmount` |
| `availabilityHours` | `workingHoursStart/End/Timezone` | API v1 chỉ hỗ trợ 1 window; xem gap bên dưới |
| `acceptedPaymentMethods` | `paymentMethodIds` | Methods Matcher có thể dùng để gửi source currency cho Creator |
| `creatorPaymentAccountIds` | API gap | Base doc yêu cầu Creator có registered account cho mỗi method đã chọn; API v1 chỉ có một `beneficiaryPaymentMethodId`, cần clarify/extend |

Do not map `beneficiaryPaymentMethodId` on create as a Matcher beneficiary or as "Creator's beneficiary". Theo base doc, tại thời điểm tạo deal chưa có Matcher beneficiary; field này chỉ có thể được hiểu như Creator payment account/profile naming gap, hoặc API cần tách/đổi tên để phản ánh đúng Creator receiving account.

Response:

```ts
Guid // new deal id
```

Financial effect on create:

```txt
No USDV hold and no platform fee at deal creation.
```

### 7.5 Availability Hours gap

HTML đang lưu lịch theo nhiều ngày:

```ts
type AvailabilityHour = {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  enabled: boolean;
  start: "HH:mm";
  end: "HH:mm";
};
```

API v1 chỉ có:

```ts
workingHoursStart?: string;
workingHoursEnd?: string;
workingHoursTimezone?: string;
```

Decision cho v1.1:

1. Nếu backend giữ API hiện tại, frontend chỉ gửi một primary window và hiển thị summary đơn giản.
2. Nếu muốn đúng prototype, API cần thêm field weekly schedule, ví dụ:

```ts
workingHours?: {
  dayOfWeek: number;
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
}[];
```

## 8. Search Deal

### 8.1 Mục tiêu

Matcher nhập nhu cầu chuyển tiền để tìm deals còn mở trên marketplace.

Trong mock mặc định:

- Matcher gửi `USD`, amount `500`.
- Beneficiary của Matcher nhận `VND`, preview `12.750.000đ`.
- Matcher có thể gửi USD bằng `Zelle`.
- Beneficiary của Matcher có thể nhận VND bằng `MoMo` và `Bank Transfer`.

### 8.2 Controls hiện có trong `search-deal.html`

| Control | Behavior hiện tại |
|---|---|
| Tôi gửi bằng | Currency select đang hardcode option USD; amount input default 500 |
| Rate preview | Hardcode `1 USD ≈ 25.500đ` |
| Người thụ hưởng sẽ nhận bằng | Currency select hardcode VND; converted amount readonly |
| Tôi gửi USD bằng hình thức | Multi-select chips từ `paymentMethodMatrix.USD`; default Zelle |
| Người thụ hưởng nhận VND bằng hình thức | Multi-select chips từ `paymentMethodMatrix.VND`; default MoMo + Bank Transfer |
| Tìm Deal Phù Hợp | Link sang `deal-results.html`; mock chưa persist query |

Base flow nói Matcher chọn saved beneficiary trong Find/Accept Deal flow. HTML hiện tách thành hai bước: search dùng multi-select để lọc rộng, còn `select-deal.html` mới khóa exact beneficiary profile trước khi accept. Đây là acceptable prototype split, nhưng production không được cho accept nếu chưa có Matcher beneficiary profile.

### 8.3 Search form model

```ts
type SearchDealForm = {
  matcherAccountId: string;
  sourceCurrency: CurrencyRef;
  amount: {
    value: number;
    currency: string;
  };
  destinationCurrency: CurrencyRef;
  convertedAmountPreview: {
    value: number;
    currency: string;
    displayText: string;
  };
  senderPaymentMethods: string[];
  beneficiaryReceiveMethods: string[];

  // Required by base flow before accept; may be selected on Select Deal screen.
  selectedBeneficiaryProfileId?: string;
};
```

### 8.4 API marketplace mapping

Endpoint:

```http
GET /api/remit-deal/marketplace
```

Query:

```ts
{
  pageIndex: number; // 0-based
  pageSize: number;
  corridorId?: number;
  amount?: number;
  fromPaymentMethods?: number[];
  toPaymentMethods?: number[];
}
```

Mapping:

| UI field | API query | Rule |
|---|---|---|
| `sourceCurrency + destinationCurrency` | `corridorId` | Resolve from `/corridors`; base orientation is source -> destination |
| `amount.value` | `amount` | Marketplace filters deals where amount is between min/max |
| `senderPaymentMethods` | `fromPaymentMethods` | Methods Matcher can use to pay source currency to Creator |
| `beneficiaryReceiveMethods` | `toPaymentMethods` | Methods Matcher beneficiary can receive destination currency through |
| results page | `pageIndex/pageSize` | UI page size = 5 in mock; API is 0-based |

Response:

```ts
PaginatedResult<MarketplaceDealDto>
```

Key fields used by UI:

```ts
{
  id: Guid;
  fromAssetSymbol: string;
  toAssetSymbol: string;
  minAmount: number;
  maxAmount: number;
  rate: number;
  createdAt: string;
  creatorDisplayName: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  workingHoursTimezone?: string;
  rating?: { averageScore: number; count: number };
  fromPaymentMethods: number[];
  toPaymentMethod?: number;
}
```

## 9. Results, detail và chọn deal

### 9.1 Deal Results behavior

`deal-results.js` hiện:

- Render từ `mockDealsB`.
- Page size = 5.
- View mode = `cards` hoặc `table`.
- Lưu view mode trong `localStorage.dealResultsViewMode`.
- Card/table đều có CTA:
  - Chi tiết: `deal-detail.html?dealId={deal.id}`
  - Chọn: `select-deal.html?dealId={deal.id}&from=results`

Known UI issue: header HTML đang hardcode `3 deal phù hợp` trong khi JS render toàn bộ `mockDealsB` và pagination. Khi tích hợp API, title phải dùng `totalCount` từ `PaginatedResult`.

### 9.2 Deal Detail behavior

`deal-detail.js` load deal theo query:

```ts
const deal = sourceDeals.find(item => item.id === requestedDealId || item.dealCode === requestedDealId)
```

Role-aware privacy:

- Non-owner: ẩn Creator payment account/full identity trước khi Creator confirm.
- Owner: có thể xem payment account của chính mình.

API tương ứng:

```http
GET /api/remit-deal/{id}
```

`RemitDealDetailDto` đã có role-aware fields:

```ts
{
  currentUserRole: 1 | 2 | 3;
  creatorBeneficiary?: { paymentMethod: number; fieldValues: object };
  matcherBeneficiary?: { paymentMethod: number; fieldValues: object };
  creatorDisplayName: string;
  matcherDisplayName?: string;
  paymentMethods: { id: number; paymentMethod: number; isChosen: boolean }[];
}
```

### 9.3 Select Deal behavior

`select-deal.js` là bước chuyển từ marketplace browsing sang match request.

Behavior:

- Load deal theo `dealId`.
- Back link về results hoặc detail dựa trên query `from`.
- "Tôi gửi ... bằng hình thức" chỉ render method mà deal cho phép ở chiều Matcher trả cho Creator:

```ts
renderAllowedOldStyleChips("selectDealSenderMethods", [deal.beneficiaryReceiveMethod], { single: true })
```

- "Người thụ hưởng nhận ... bằng hình thức" render các method Creator có thể dùng để trả cho Matcher:

```ts
renderAllowedOldStyleChips("selectDealReceiveMethods", deal.senderPaymentMethods, { single: true })
```

- Account picker lọc `beneficiaryAccountsA`:

```ts
account.currency === "VND" &&
account.method === selectedReceiveMethod &&
account.status === "active"
```

- Khi đổi receive method, nếu selected account không còn phù hợp thì reset account.
- Confirm modal hiển thị:
  - Amount gửi.
  - Converted amount.
  - Matcher USDV hold/fee reserve khi accept.
  - Creator confirm deadline.
  - Warning đủ số dư.

### 9.4 Accept API mapping

Endpoint:

```http
POST /api/remit-deal/{id}/accept
```

Request:

```ts
{
  amount: number;
  beneficiaryPaymentMethodId: number;
  chosenCreatorPaymentMethod: number;
}
```

Mapping:

| Select Deal UI | API field |
|---|---|
| `deal.id` | path `{id}` |
| amount input | `amount` |
| selected beneficiary account/profile of Matcher | `beneficiaryPaymentMethodId` |
| selected method used to pay Creator side | `chosenCreatorPaymentMethod` |

Response:

```ts
Guid // deal id
```

Status transition:

```txt
New -> PendingApproval
```

Financial effect by base doc:

```txt
Matcher accept:
- Lock/deduct Matcher USDV hold plus platform-fee amount.
- If Matcher cancels in PendingApproval or Creator does not confirm in time, return Matcher hold/fee amount in full; no fee is recognized.

Creator approve:
- Lock/deduct Creator USDV hold plus platform fee.
- Deal moves to WaitingUploadProof.
- Platform fee becomes non-refundable once deducted at/after Creator confirmation.
- If Creator USDV balance is insufficient, approval fails, Matcher hold/fee amount is returned, and deal reverts to New.
```

Creator then approves or declines:

```http
POST /api/remit-deal/{id}/approve
POST /api/remit-deal/{id}/decline
```

If Creator approves:

```txt
PendingApproval -> WaitingUploadProof
```

## 10. Matching rules

### 10.1 Filter-stage matching

Search request matches a deal when all conditions are true:

```ts
const creatorReceivingMethods =
  deal.acceptedPaymentMethods || [deal.beneficiaryReceiveMethod]; // HTML legacy fallback
const creatorPayoutMethods =
  deal.destinationPaymentMethods || deal.senderPaymentMethods; // HTML legacy fallback

const isMatched =
  search.sourceCurrency.currency === deal.sourceCurrency.currency &&
  search.destinationCurrency.currency === deal.destinationCurrency.currency &&
  search.senderPaymentMethods.some(method => creatorReceivingMethods.includes(method)) &&
  search.beneficiaryReceiveMethods.some(method => creatorPayoutMethods.includes(method)) &&
  search.amount.value >= deal.amountLimit.minAmount &&
  search.amount.value <= deal.amountLimit.maxAmount &&
  deal.status === "New";
```

Notes:

- `search.senderPaymentMethods` is multi-select.
- `search.beneficiaryReceiveMethods` is multi-select at filter stage.
- `deal.beneficiaryReceiveMethod` and `deal.senderPaymentMethods` are HTML legacy field names. Production should use base-doc terms: Creator receiving methods/accounts and destination payout methods.
- At select/accept stage, both sides must be resolved to exact single methods and exact payment profiles.

### 10.2 API-stage matching

Production should not duplicate full matching logic only on frontend. Frontend sends marketplace filters and backend returns eligible deals:

```http
GET /api/remit-deal/marketplace?pageIndex=0&pageSize=5&corridorId=...&amount=500&fromPaymentMethods=...&toPaymentMethods=...
```

Backend must enforce again when accepting:

- Deal is still in `New`.
- Matcher is not the Creator.
- Amount is within min/max.
- Chosen payment method belongs to the deal.
- Matcher beneficiary profile is active and matches destination asset/method.
- Account has no conflicting active/non-terminal remit deal if INV-11 applies.

## 11. Status model

### 11.1 HTML mock statuses

`manage.js` currently filters:

| Mock status | UI label |
|---|---|
| `active` | Đang hoạt động |
| `completed` | Đã hoàn tất |
| `deleted` | Đã xoá |

### 11.2 API statuses

`RemitDealStatus`:

| Value | Name | Meaning |
|---:|---|---|
| 1 | New | Listed on marketplace |
| 2 | Paused | Hidden from marketplace; can reopen |
| 3 | WaitingUploadProof | Match locked; parties upload proof and confirm |
| 4 | Completed | Both parties confirmed |
| 5 | Cancelled | Cancelled by user/system |
| 6 | PendingApproval | Matcher accepted; waiting Creator approval |
| 7 | Disputed | Dispute raised |
| 8 | Resolved | Admin resolved dispute |
| 9 | Declined | Audit-log only, not persisted as status |

Recommended UI mapping:

| API status | Marketplace visible? | UI group |
|---|---:|---|
| New | Yes | Đang hoạt động |
| Paused | No | Tạm dừng |
| PendingApproval | No | Chờ chấp nhận |
| WaitingUploadProof | No | Đang xử lý |
| Completed | No | Đã hoàn tất |
| Cancelled | No | Đã huỷ |
| Disputed | No | Tranh chấp |
| Resolved | No | Đã xử lý tranh chấp |

Do not use `deleted` as a production backend status unless API adds soft-delete. Use `Cancelled` or `Paused` depending on business intent.

## 12. Base-doc guardrails

Các rule dưới đây đến trực tiếp từ base doc và áp dụng cho mọi implementation Create/Search:

### 12.1 Eligibility and visibility

1. KYC/KYB verified member mới được dùng P2P Remit Deal.
2. Một member không được có hơn một transaction in-progress tại cùng thời điểm, dù đang là Creator hay Matcher.
3. Matcher không được accept deal của chính mình.
4. Creator deal bị ẩn khỏi Matcher search khi Creator có pending incoming match hoặc transaction in-progress; status vẫn là `New` và tự hiện lại khi Creator free.
5. Một Creator deal chỉ có một pending/active transaction liên kết tại một thời điểm.

### 12.2 Deal creation and editing

1. Tạo deal hợp lệ -> status `New`; không lock USDV và không thu phí.
2. Creator có thể maintain nhiều active deals, nhưng khi có transaction in-progress thì các deal khác bị ẩn khỏi search.
3. Creator không được edit/delete deal khi deal có pending match hoặc transaction in-progress; pause luôn được phép nếu không ảnh hưởng transaction đang chạy.
4. Rate do Creator set tại deal creation và được snapshot/fixed cho vòng đời deal đó; subsequent rate changes không ảnh hưởng active deal.
5. Creator phải có registered payment receiving account cho từng selected payment method trong current version.

### 12.3 Payment, proof, and timing after accept

1. Fiat/local payments luôn diễn ra off-system; platform chỉ cung cấp instruction, memo reference, proof upload và dispute handling.
2. Memo/reference code bắt buộc trong off-system payment để reconciliation/dispute.
3. Proof immutable sau khi submit; tối đa 3 proof files mỗi party.
4. Creator confirm timeout mặc định 15 phút: timeout hoặc Matcher cancel trong `PendingApproval` -> deal về `New`, Matcher hold/fee amount được trả đủ.
5. SLA bắt đầu khi Creator confirm; base default là 24h (`PostAcceptSlaMinutes = 1440`).
6. Nếu SLA hết hạn mà chưa bên nào upload proof -> auto-cancel, both holds returned, no additional penalty.
7. Nếu có proof nhưng transaction chưa hoàn tất -> không auto-cancel; party có proof có thể raise dispute, holds frozen.
8. Sau transfer proof, Matcher có confirmation window; nếu quá auto-complete delay 24h mà không action thì system auto-completes và release both holds.

## 13. API endpoint checklist cho Create/Search

### 13.1 Bootstrap page data

Call before rendering forms:

```http
GET /api/remit-deal/setting
GET /api/remit-deal/corridors
GET /api/remit-deal/payment-methods?isActive=true
GET /api/remit-deal/payment-profiles
```

Use `/setting` fields:

| Field | UI usage |
|---|---|
| `platformFeePercent` | Fee line in confirm modal |
| `creatorConfirmTimeoutMinutes` | "Creator có 15 phút để chấp nhận/decline" |
| `postAcceptSlaMinutes` | SLA sau khi Creator confirm. Base doc default là 1440 phút / 24 giờ; API reference đang ghi 60 phút nên cần align backend config |
| `canCreateDeal` | Hide/disable Create Deal CTA if false |

### 13.2 Create/manage

```http
POST /api/remit-deal
PUT /api/remit-deal/{id}
POST /api/remit-deal/{id}/cancel
POST /api/remit-deal/{id}/reopen
GET /api/remit-deal/history?pageIndex=0&pageSize=5&status={status}
GET /api/remit-deal/statistics
```

### 13.3 Search/select

```http
GET /api/remit-deal/marketplace
GET /api/remit-deal/{id}
POST /api/remit-deal/{id}/accept
POST /api/remit-deal/{id}/approve
POST /api/remit-deal/{id}/decline
```

### 13.4 After accept

Not the main scope of this spec, but next screens depend on:

```http
POST   /api/remit-deal/{id}/proof
POST   /api/remit-deal/{id}/confirm
POST   /api/remit-deal/{id}/dispute
POST   /api/remit-deal/{id}/dispute/cancel
POST   /api/remit-deal/{id}/rating
```

Proof rule from base doc:

```txt
Proofs are immutable once submitted. UI must not expose edit/delete after submit.
API reference includes DELETE /proof/{fileId}; if kept, it must be restricted to pre-submit/draft files only or removed from production flow.
Max proof files per party: 3.
```

## 14. Validation rules

### 14.1 Create Deal validations

Frontend and backend must enforce:

1. User is eligible to create deal (`canCreateDeal === true`, KYC/role policy satisfied).
2. `corridorId` exists and active.
3. `rate > 0`.
4. `minAmount > 0`.
5. `maxAmount >= minAmount`.
6. `note` required and max 200 chars.
7. At least one accepted payment method selected for the source-currency receiving side.
8. Creator has an active registered payment account for each selected accepted payment method.
9. Working hours are valid: `start < end`, timezone valid if provided.
10. No USDV hold or platform fee is applied at create time.

### 14.2 Search validations

1. Send currency and receive currency must be different.
2. Amount must be positive.
3. At least one sender method selected.
4. At least one beneficiary receive method selected at search stage, or a saved beneficiary profile selected before accept.
5. If no corridor exists for the pair, disable search CTA and show no-results/unsupported corridor state.
6. Block search/accept if Matcher already has PendingApproval or any active in-progress transaction.

### 14.3 Select/Accept validations

1. Deal is still `New` / marketplace-visible.
2. Amount is within deal min/max.
3. Selected sender method is allowed by deal.
4. Selected beneficiary receive method is allowed by deal.
5. Selected Matcher beneficiary profile is active and matches destination asset/method.
6. Matcher has sufficient USDV for hold plus fee reserve.
7. Fee/hold lines must be displayed separately from source transfer amount.
8. Backend must block self-trading and revalidate one-active-transaction constraints across both roles.
9. Deal must be hidden/excluded if Creator has a pending incoming match or in-progress transaction even if status remains `New`.

## 15. Data examples from current mock

### 15.1 Deal shape

Current mock field names are legacy/prototype names. Base-doc interpretation for `deal_b_001` is:

```txt
Business corridor: USD -> VND
Matcher pays USD to Creator's receiving account.
Creator pays VND to Matcher's beneficiary.
```

```ts
{
  id: "deal_b_001",
  dealCode: "DL-B-VND-USD-001",
  ownerNameMasked: "Tran ***",
  ownerInitial: "T",
  ownerRating: 5.0,
  ownerRatingCount: 1,
  status: "active",
  statusLabel: "Đang hoạt động",
  beneficiaryReceiveCurrency: { currency: "USD", country: "US", label: "USD - Đô la Mỹ" },
  senderPayCurrency: { currency: "VND", country: "VN", label: "VND - Việt Nam Đồng" },
  exchangeRate: { from: "USD", to: "VND", rate: 25500, source: "market" },
  amountLimit: { minUsd: 99, maxUsd: 799 },
  availabilityHours: availabilityHoursPresets.standard,
  beneficiaryReceiveMethod: "Zelle",
  beneficiaryAccountId: "acc_b_us_zelle_001",
  senderPaymentMethods: ["MoMo", "ZaloPay", "Bank Transfer"],
  note: "Có thể thanh toán VND qua MoMo, ZaloPay hoặc chuyển khoản ngân hàng."
}
```

Production should normalize this into API DTOs:

```ts
{
  id: Guid;
  code: string;
  status: RemitDealStatus;
  fromAsset: AssetBasicModel;
  toAsset: AssetBasicModel;
  minAmount: number;
  maxAmount: number;
  rate: number;
  creatorDisplayName: string;
  rating?: { averageScore: number; count: number };
  paymentMethods: { id: number; paymentMethod: number; isChosen: boolean }[];
}
```

### 15.2 Current mock deal set

| Deal | Business corridor | Mock code/pair note | Rate | Limit | Creator receiving method | Creator payout methods |
|---|---|---|---:|---|---|---|
| `deal_b_001` | USD -> VND | Mock code says VND-USD | 25500 | 99-799 | Zelle | MoMo, ZaloPay, Bank Transfer |
| `deal_b_002` | USD -> VND | Mock code says VND-USD | 25480 | 50-2000 | PayPal | ZaloPay |
| `deal_b_003` | USD -> VND | Mock code says VND-USD | 25600 | 300-10000 | Bank Transfer | Bank Transfer |
| `deal_b_004` | EUR -> VND | Mock code says VND-EUR | 27850 | 100-3500 | SEPA Transfer | MoMo, Bank Transfer |
| `deal_b_005` | GBP -> VND | Mock code says VND-GBP | 32400 | 25-500 | Bank Transfer | MoMo, ZaloPay, Bank Transfer |
| `deal_b_006` | USD -> SGD | Mock code says SGD-USD | 1.35 | 500-12000 | Bank Transfer | PayNow, Bank Transfer |
| `deal_b_007` | AUD -> VND | Mock code says VND-AUD | 16680 | 75-1500 | PayID | ZaloPay, Bank Transfer |
| `deal_b_008` | USD -> THB | Mock code says THB-USD | 36.8 | 150-4200 | PayPal | PromptPay, Bank Transfer |

Rows using methods outside API enum v1 must be hidden or disabled in production until API supports those payment methods.

## 16. Privacy, masking, and role-aware display

1. Marketplace and result cards show masked creator name, e.g. `Tran ***`.
2. Non-owner detail view must not show Creator payment account/full identity before Creator confirms.
3. Owner detail view may show own Creator payment account.
4. Payment profile field values are sensitive. If UI supports unmask/copy later, backend must audit it.
5. API `GET /api/remit-deal/{id}` must remain role-aware:
   - `creatorBeneficiary` visible only to Matcher when needed.
   - `matcherBeneficiary` visible only to Creator when needed.

## 17. Open integration gaps

| Gap | Current state | Required decision |
|---|---|---|
| Weekly availability | HTML supports per-day schedule; API supports one start/end/timezone | Flatten to one window or extend API |
| Payment method coverage | HTML supports many regional methods; API enum supports 8 | Hide unsupported methods or extend enum/API |
| Create Deal labels/account semantics | HTML labels imply Creator's beneficiary receives source currency | Update copy/model to base: Creator receiving accounts for source currency |
| `paymentMethodIds` semantics | API wording says Creator accepted methods; UI labels multi side as Creator payout methods | Confirm backend direction and rename/mapping if needed |
| Creator account cardinality / create profile field | Base requires Creator receiving account for each chosen method; API v1 exposes one `beneficiaryPaymentMethodId` on create and describes it as receiving destination currency | Rename/split API field or constrain create flow to one Creator receiving account; do not treat it as Matcher beneficiary at create time |
| SLA default | Base doc says 1440 min / 24 h; API reference says default 60 min | Align backend config/reference with base |
| Proof delete | API reference exposes DELETE proof; base says proof immutable | Restrict delete to draft/pre-submit or remove from UI/API |
| Proof max files | Base doc says max 3 proof files per party; shared HTML upload control defaults to 5 unless overridden | Use max 3 for remit proof screens |
| Search query persistence | Search page currently links to results without persisting selected filters | Store query in URL/session or call API directly before rendering results |
| Results count | HTML says `3 deal phù hợp`, JS renders all mock deals | Use API `totalCount` |
| Deleted status | HTML mock has `deleted`; API has `Cancelled/Paused` | Decide status mapping |
| Multi-day working hours in marketplace cards | Results card summarizes weekly schedule | API needs schedule data or UI falls back to single working-hours label |

## 18. Implementation checklist

### Create Deal

1. Load setting/corridors/payment-methods/payment-profiles.
2. Populate currency selects from corridors and supported assets.
3. Populate methods from API active payment methods, not hardcoded labels.
4. Require Creator registered receiving account(s) for selected source-currency payment method(s).
5. Require one or more accepted payment methods; each method must have an active Creator account.
6. Validate min/max/rate/note/working hours.
7. Submit `POST /api/remit-deal`.
8. Redirect to manage/detail after success.

### Search Deal

1. Load corridors and active payment methods.
2. Build search filters from selected pair, amount, sender methods, receiver methods.
3. Call `GET /api/remit-deal/marketplace`.
4. Render `totalCount`, card/table view, pagination.
5. On detail, call `GET /api/remit-deal/{id}`.
6. On select, lock exact method/profile choices and require Matcher beneficiary profile.
7. Submit `POST /api/remit-deal/{id}/accept`.
8. Redirect to transaction/detail state `PendingApproval` and show Creator confirm deadline.

## 19. Summary for dev/AI

Create Deal:

```txt
Creator creates a marketplace offer with corridor, rate, limits, note,
availability, and accepted source-currency payment methods/accounts.
No USDV is held at creation.
```

Search Deal:

```txt
Matcher filters marketplace by source/destination currency need, amount, and method sets.
Search is broad; Select Deal locks exact method and exact Matcher beneficiary profile.
```

API flow:

```txt
GET setting/corridors/payment-methods/payment-profiles
POST /api/remit-deal
GET /api/remit-deal/marketplace
GET /api/remit-deal/{id}
POST /api/remit-deal/{id}/accept
POST /api/remit-deal/{id}/approve or /decline
```

Core invariant:

```txt
Do not rely on frontend-only matching. Backend must revalidate corridor,
amount, method, active profiles, role, status, and active-deal constraints
when creating or accepting a deal.

Base business doc wins over prototype/API wording when conflicts appear.
```
