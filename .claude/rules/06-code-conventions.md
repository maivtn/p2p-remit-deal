---
description: Coding conventions — naming, imports, forbidden patterns, and business logic boundaries. Apply to all TypeScript/TSX files in this project.
alwaysApply: true
---

# Code Conventions

## Forbidden patterns — KHÔNG được làm

| Pattern | Lý do |
|---|---|
| Dùng `deal.rate` trực tiếp cho request đã tạo | Phải dùng `dealVersionId` snapshot (INV-07) |
| Tự chuyển `transfer_sent` → `completed` bằng timer/system | Phải có xác nhận Requester hoặc Admin R1 (INV-10) |
| Gộp `requesterFee` vào `amountSend` trong UI | UI phải tách 3 dòng: khoản chuyển / phí / tổng (BA v4-FEE-01) |
| Unlock collateral khi `status === 'disputed'` | INV-04 |
| Gọi fee collection 2 lần cho cùng `requestId` | INV-03 — dùng idempotency key |
| Action tài chính không có idempotency key | INV-08 |
| Sửa/xóa proof đã submit | INV-06 — proof là immutable |
| Unmask tài khoản/SĐT mà không ghi audit log | INV-09 |

## Naming conventions

| Loại | Convention | Ví dụ |
|---|---|---|
| Request status string | snake_case — khớp chính xác BA | `pending_acceptance`, `payment_sent` |
| Component files | PascalCase | `RequesterApp.tsx`, `ProofModal.tsx` |
| Data/util files | camelCase | `mockData.ts`, `paymentIcons.ts` |
| CSS | Tailwind utility classes | Chỉ dùng CSS global/module khi Tailwind không đủ |

## Import alias

Dùng `@/` thay cho đường dẫn tương đối sâu (alias `@` → `src/`):

```typescript
// Đúng
import { formatAmount, type DealRequest } from '@/app/data/mockData';
import { ProofModal } from '@/app/components/shared/ProofModal';

// Sai
import { formatAmount } from '../../../data/mockData';
```

## Component boundaries

- `src/app/components/ui/` — shadcn/ui primitives: **không đặt logic nghiệp vụ ở đây**
- `src/app/components/shared/` — components dùng chung cả Requester lẫn Provider
- `src/app/components/requester/` — màn hình và logic đặc thù Requester
- `src/app/components/provider/` — màn hình và logic đặc thù Provider
- `src/app/data/mockData.ts` — interfaces và mock data; không import từ component files

## State management

State hiện tại được lift lên `App.tsx` và truyền qua props. Khi thêm state mới:
- State liên quan đến cả 2 phía (Requester + Provider) → lift lên `App.tsx`
- State local UI (modal open, tab active) → giữ trong component
- Không dùng global state library khi chưa có sự đồng thuận về kiến trúc

## TypeScript

- Luôn type rõ props component — không dùng `any`
- Dùng `interface` cho object shapes (Deal, DealRequest, Proof)
- Dùng `type` cho union types (RequestStatus, ResolutionOutcome)
- Export types từ `mockData.ts` với keyword `export type`
