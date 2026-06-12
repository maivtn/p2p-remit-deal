---
description: Mock data layer for HTML prototype screens — how to load data, what objects are available, and which request ID maps to which screen.
paths:
  - src/html/**/*.html
  - src/html/**/*.js
---

# Mock Data

**File:** `src/html/mock-data.js`  
**Global:** `window.P2P_DATA`  
**"Now" fixed at:** `2026-06-12T09:00:00Z` (tất cả countdown/timeAgo đều relative so với mốc này)

---

## Cách load vào HTML

```html
<!-- Sau Bootstrap, trước <script> của màn hình -->
<script src="mock-data.js"></script>
```

Sau đó dùng trực tiếp trong JS của màn hình:

```js
const req  = P2P_DATA.getRequest('RQ-4F8N1');    // object đầy đủ
const user = P2P_DATA.getUser('U-PRV-001');
const cd   = P2P_DATA.formatCountdown(req.t2Deadline);  // "00:28:43"
```

---

## Request ID → Screen mapping

| Request ID | Status | Màn hình chính | Actor cầm lượt |
|---|---|---|---|
| `RQ-7K2M9` | `pending_acceptance` | R-06 Request List / R-07 Detail | Provider |
| `RQ-4F8N1` | `accepted` | **R-08 Payment Instruction** | Requester |
| `RQ-2B5R7` | `payment_sent` | R-10 Tracking — Waiting Provider / P-08 Confirm | Provider |
| `RQ-9C3T6` | `payment_confirmed` | P-09 Transfer to Beneficiary | Provider |
| `RQ-6D1W4` | `transfer_sent` | R-11 Transfer Proof Review & Complete | Requester |
| `RQ-5A9P2` | `completed` | R-12 Completed + Rating | — |
| `RQ-3H7V0` | `disputed` | R-13/R-14 Dispute / A-01 Admin Dispute | Admin |
| `RQ-1J4K8` | `rejected` | R-07 (rejected state) | Requester |
| `RQ-8E2G5` | `cancelled` | R-07 (cancelled state) | — |
| `RQ-0L6Q3` | `expired` | R-07 (expired state) | — |
| `RQ-7N8M2` | `resolved` | R-14 Dispute Detail (resolved) | — |

---

## Object schemas

### User
```js
{
  id, role,         // 'requester' | 'provider' | 'admin'
  name, shortName, initials,
  email, phone,
  kycStatus,        // 'verified' | 'pending' | 'rejected'
  kycTier,          // 1 | 2 | 3
  avatarBg,         // CSS background cho avatar circle
  avatarColor,      // CSS color cho chữ initials
  // provider only:
  rating, completedCount, onTimeRate,
}
```

### Deal
```js
{
  id, versionId,    // versionId dùng trong request snapshot
  providerId,
  corridor: { sendCurrency, receiveCurrency },
  rate,             // VND per 1 USD (hoặc tương ứng với corridor)
  minAmount, maxAmount,
  methods,          // ['zelle','venmo','paypal',…]
  slaHours,
  status,           // 'active' | 'paused' | 'expired'
  rating, completedCount, onTimeRate,
}
```

### DealRequest
```js
{
  id, dealId, dealVersionId,   // INV-07: luôn dùng dealVersionId, không lấy deal.rate trực tiếp
  requesterId, providerId,
  status,                      // xem bảng trên
  amountSend, sendCurrency,
  amountReceive, receiveCurrency,
  requesterFee,                // 0.5% × amountSend — hiển thị tách riêng
  providerFee,
  memo,                        // bắt buộc ghi trong nội dung chuyển khoản
  beneficiary,                 // BeneficiaryInfo object
  collateralLocked,            // = 0 nếu terminal; frozen khi disputed
  createdAt,
  t1Deadline, t2Deadline, t3Deadline, t4Deadline, t5Deadline,
  // optional (theo status):
  providerPaymentInfo,         // { method, accountMasked, accountFull, holderName }
  paymentProof, transferProof, // Proof object
  dispute,                     // DisputeCase object (khi disputed/resolved)
  rejectedAt, rejectedReason,
  cancelledAt, cancelledReason,
  expiredAt, expiredReason,
  completedAt, resolvedAt,
  statusHistory,               // array { status, at, by, note }
}
```

### Proof
```js
{
  id, type,         // 'payment' | 'transfer' | 'dispute'
  files,            // array string (URL giả)
  note, refCode,
  submittedAt, submittedBy,
  // INV-06: immutable sau khi submit — không hiển thị nút edit/delete
}
```

---

## Fee breakdown — bắt buộc tách 3 dòng trong UI

```js
const req = P2P_DATA.getRequest('RQ-4F8N1');
// Dòng 1: Khoản P2P cần chuyển
req.amountSend          // 500 USD
// Dòng 2: Phí nền tảng (0.5%)
req.requesterFee        // 2.5 USD
// Dòng 3: Tổng chi phí của bạn
req.amountSend + req.requesterFee  // 502.5 USD
```

Không gộp thành một con số duy nhất — gây hiểu nhầm toàn bộ đều chuyển cho Provider.

---

## Helpers thường dùng

```js
// Định dạng tiền
P2P_DATA.formatVND(12750000)           // "12.750.000 ₫"
P2P_DATA.formatUSD(502.5)             // "$502.50"
P2P_DATA.formatAmount(500, 'USD')     // "$500.00"

// Countdown từ deadline ISO string
P2P_DATA.formatCountdown('2026-06-12T09:30:00Z')  // "00:28" (mm:ss nếu < 1h)
const cd = P2P_DATA.getCountdown('2026-06-12T09:30:00Z')
// cd.isUrgent  → true nếu < 10 phút (dùng .countdown.urgent class)
// cd.isWarning → true nếu < 30 phút

// Status badge CSS class (khớp với theme.css)
P2P_DATA.getStatusBadgeClass('accepted')  // "badge-accepted"
P2P_DATA.getStatusLabel('accepted')       // "Chờ bạn chuyển tiền"

// Payment method
P2P_DATA.getMethodLabel('zelle')   // "Zelle"
P2P_DATA.getMethodIcon('zelle')    // "💱"

// Thời gian tương đối (so với NOW = 2026-06-12T09:00:00Z)
P2P_DATA.timeAgo('2026-06-12T08:30:00Z')  // "30 phút trước"
```

---

## Demo shortcuts

```js
P2P_DATA.DEMO.requester     // User object U-REQ-001 (Minh Tuấn)
P2P_DATA.DEMO.provider      // User object U-PRV-001 (Hùng Mạnh)
P2P_DATA.DEMO.admin         // User object U-ADM-001
P2P_DATA.DEMO.activeRequest // Request RQ-4F8N1 (accepted — default cho R-08)
```

Mỗi màn hình có thể override `activeRequest` sau khi load:

```js
// Ví dụ trong screen R-11:
P2P_DATA.DEMO.activeRequest = P2P_DATA.getRequest('RQ-6D1W4'); // transfer_sent
```

---

## Masked data pattern

Dữ liệu nhạy cảm (số tài khoản, số điện thoại) lưu trong 2 field:
- `accountMasked` / `accountNumberMasked` → hiển thị mặc định
- `accountFull` / `accountNumberFull` → chỉ unmask sau khi user bấm "Hiện & Copy"

Unmask phải ghi audit log (INV-09) — trong HTML prototype, log ra `console.info`.

---

## Collateral display

```js
const req = P2P_DATA.getRequest('RQ-4F8N1');
// Hiển thị "Provider đã ký quỹ X ₫" trong banner bảo vệ:
P2P_DATA.formatVND(req.collateralLocked)  // "13.005.000 ₫"
```

Khi `status === 'disputed'`: collateral đang bị freeze (INV-04), hiển thị "Đang tạm giữ" thay vì số tiền bình thường.
