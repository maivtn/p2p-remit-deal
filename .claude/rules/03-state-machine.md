---
description: Request state machine, status transitions, SLA timers, and hard invariants. Apply whenever writing or reviewing any request/deal status logic.
paths:
  - src/app/**/*.tsx
  - src/app/**/*.ts
---

# Request State Machine

## Transition diagram

```
pending_acceptance
  → accepted          (Provider accept, collateral locked)
    → payment_sent    (Requester upload paymentProof)
      → payment_confirmed  (Provider confirm received)
        → transfer_sent    (Provider upload transferProof)
          → completed      (Requester confirm — irreversible)
          → disputed       (Requester open dispute)
      → disputed           (Requester hoặc Provider open dispute)
    → expired              (T2 hết hạn — unlock collateral)
  → rejected               (Provider reject — cần lý do)
  → cancelled              (Requester cancel trước khi accepted)
  → expired                (T1 hết hạn)
disputed → resolved        (Admin ra outcome R1/R2/R3/R4)
```

## Actors và timers

| Status | Actor cầm lượt | Timer | Hết hạn |
|---|---|---|---|
| `pending_acceptance` | Provider | T1 = 2h | → `expired` |
| `accepted` | Requester | T2 = 1h | → `expired` + unlock collateral + violation Requester |
| `payment_sent` | Provider | T3 = 1h | → ticket Admin, mark Provider late |
| `payment_confirmed` | Provider | T4 = SLA deal + 30p | → ticket Admin, mở CTA dispute cho Requester |
| `transfer_sent` | Requester | T5 = 24h | → ticket Admin, không tự completed |
| `disputed` | Admin | T6 = 48h | → escalate trưởng nhóm vận hành |

## Dispute outcomes (Admin only)

| Outcome | Khi dùng | Tài chính |
|---|---|---|
| `R1_complete` | Beneficiary đã nhận, Requester không xác nhận | Thu phí 2 bên; unlock collateral |
| `R2_refund_requester` | Provider nhận tiền nhưng không chi trả | Trích collateral bồi hoàn Requester; Provider penalty |
| `R3_no_payment` | Requester chưa thanh toán hoặc proof giả | Unlock collateral; Requester penalty |
| `R4_mutual_cancel` | Hai bên đồng ý hủy hoặc lỗi khách quan | Hoàn trạng thái tiền, miễn phí/phạt |

## Invariants bắt buộc — KHÔNG ĐƯỢC VI PHẠM

| Mã | Rule |
|---|---|
| INV-01 | Một request chỉ có một status hiện hành; mọi transition phải ghi vào status history. |
| INV-02 | Terminal status (`completed`, `rejected`, `cancelled`, `expired`, `resolved`) không được chuyển tiếp. |
| INV-03 | Không thu phí hai lần cho cùng một `requestId`. |
| INV-04 | Không unlock collateral khi `status === 'disputed'`. |
| INV-05 | `balanceAfter = balanceBefore ± amount` — ledger phải cân bằng. |
| INV-06 | Proof sau khi submit là immutable: không sửa, không xóa. |
| INV-07 | Request luôn gắn `dealVersionId`; không dùng `deal.rate` hiện tại để tính request đã tạo. |
| INV-08 | Mọi action tài chính phải có idempotency key. |
| INV-09 | Mọi unmask dữ liệu nhạy cảm phải ghi audit log. |
| INV-10 | Không tự `completed` ở `transfer_sent` nếu thiếu xác nhận Requester hoặc outcome R1. |

## Guard conditions quan trọng

- **accept_request**: Provider KYC T2 + deal active + `wallet.available >= collateralRequired` + request chưa expired
- **submit_payment_proof**: proof hợp lệ (có note hoặc file) + request chưa ở terminal status
- **confirm_payment_received**: xác nhận 2 bước + không có dispute đang mở
- **complete_request**: `transferProof` tồn tại + xác nhận 2 bước + checkbox "đã nhận đủ" được check
- **open_dispute** (Provider tại `payment_sent`): tối thiểu 30 phút sau khi `paymentProof` được submit
