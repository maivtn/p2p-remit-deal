---
description: Core data interfaces (Deal, DealRequest, Proof), fee model, wallet balance model, and collateral rules. Apply when working with mockData.ts or any file that creates/reads request/deal objects.
paths:
  - src/app/data/**
  - src/app/components/**/*.tsx
  - src/app/components/**/*.ts
---

# Data Model

Source of truth: [src/app/data/mockData.ts](../../src/app/data/mockData.ts)

## Deal

```typescript
interface Deal {
  id: string;
  providerId: string;
  providerName: string;
  corridor: { sendCurrency: string; receiveCurrency: string };
  rate: number;           // VD: 25500 (VND/USD)
  minAmount: number;
  maxAmount: number;
  methods: string[];      // VD: ['bank-transfer', 'momo']
  slaHours: number;
  expiryDate: string;
  status: 'active' | 'paused' | 'expired';
  // trust signals
  rating: number;
  completedCount: number;
  onTimeRate: number;
}
```

## DealRequest

```typescript
interface DealRequest {
  id: string;
  dealId: string;
  dealVersionId: string;  // snapshot tại thời điểm tạo request — KHÔNG dùng deal.rate trực tiếp
  requesterId: string;
  providerId: string;
  status: RequestStatus;
  amountSend: number;
  sendCurrency: string;
  amountReceive: number;
  receiveCurrency: string;
  requesterFee: number;   // 0.5% của amountSend
  providerFee: number;    // 0.5% của amountSend
  memo: string;           // mã đối soát — bắt buộc ghi trong nội dung chuyển khoản
  beneficiary: BeneficiaryInfo;
  paymentProof?: Proof;
  transferProof?: Proof;
  collateralLocked?: number;
  createdAt: string;
  t1Deadline?: string;
  t2Deadline?: string;
  t3Deadline?: string;
  t4Deadline?: string;
  t5Deadline?: string;
}
```

## Fee model

| Hạng mục | Giá trị |
|---|---|
| Phí Requester | 0.5% của `amountSend` |
| Phí Provider | 0.5% của `amountSend` |
| Tổng phí hệ thống | 1% |
| Khi thu phí | Chỉ khi `completed` hoặc theo outcome `resolved` |
| Thời điểm chốt | Khi Provider `accept_request` (snapshot vào request) |

**Tổng chi phí Requester** = `amountSend + requesterFee`

UI **bắt buộc tách thành 3 dòng riêng**:
1. Số tiền chuyển cho Provider: `amountSend`
2. Phí nền tảng: `requesterFee`
3. Tổng chi phí của bạn: `amountSend + requesterFee`

Không gộp thành một con số "tổng phải chuyển" nếu nó gây hiểu nhầm toàn bộ đều chuyển cho Provider.

## Wallet balance model (Provider)

| Balance | Ý nghĩa | Accept request? | Rút được? |
|---|---|---|---|
| `available` | Số dư khả dụng | Yes | Yes |
| `locked` | Đang ký quỹ cho request sống | No | No |
| `frozen` | Đang freeze do dispute | No | No |

**Invariant ví:** `totalBalance = available + locked + frozen`

## Collateral formula

```
collateralRequired = max(payoutObligationFxEquivalent, requesterRefundExposure) × (1 + bufferRate)
```

- `bufferRate` mặc định pilot = 2%
- Provider không thể `accept_request` nếu `wallet.available < collateralRequired`
- Không unlock collateral khi request đang `disputed` (INV-04)

## Proof

```typescript
interface Proof {
  id: string;
  type: 'payment' | 'transfer' | 'dispute';
  files: string[];         // signed URL, hết hạn sau N giờ
  note: string;
  refCode: string;         // reference number từ chuyển khoản
  submittedAt: string;
  submittedBy: string;     // userId
  // immutable sau khi submit — không sửa, không xóa
}
```

## Utility helpers (mockData.ts)

```typescript
formatAmount(amount: number, currencyCode: string): string
formatVND(amount: number): string
getCurrency(code: string): Currency | undefined
timeAgo(dateStr: string): string
```
