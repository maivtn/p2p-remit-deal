# TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ — BẢN TỐI ƯU TRIỂN KHAI (v2.0)

# P2P REMIT DEALS — Nền tảng chuyển tiền ngang hàng

| | |
|---|---|
| **Tên hệ thống** | P2P Remit Deals |
| **Loại tài liệu** | BRD/FSD hợp nhất — **bản tối ưu để triển khai thực tế** |
| **Phiên bản** | 2.0 (kế thừa và thay thế v1.0 ngày 12/06/2026) |
| **Ngày lập** | 12/06/2026 |
| **Trạng thái** | Đề xuất — chờ phê duyệt Product Owner & Pháp chế |
| **Thay đổi chính so với v1.0** | Giải quyết 13 vấn đề mở (OI-01→OI-13); bổ sung vai trò **Admin/Trọng tài**; chuẩn hóa **state machine 12 trạng thái**; mô hình **escrow ký quỹ Provider**; **SLA & timeout tự động**; **đánh giá sau giao dịch**; **chat theo giao dịch**; chính sách **phí có hoàn theo lỗi**; KYC phân tầng; che dấu dữ liệu nhạy cảm; kèm **Phụ lục UX/UI** |

---

## TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)

Bản v1.0 mô tả trung thực prototype nhưng **chưa đủ điều kiện triển khai** vì 4 lỗ hổng cấu trúc:

1. **Không có lối thoát cho tranh chấp** — `disputed` là trạng thái treo vĩnh viễn, không có trọng tài, không có kết cục. Một marketplace tài chính không thể vận hành nếu xung đột không có cơ chế giải quyết.
2. **Escrow "ảo"** — chỉ là cờ hiển thị, không có tiền thật bị giữ → không tạo được niềm tin thực, không có nguồn đền bù khi xử thắng khiếu nại.
3. **Không có đồng hồ** — không timeout, không SLA tự động → giao dịch có thể treo vô hạn ở mọi pha, làm chết thanh khoản của Provider và niềm tin của Requester.
4. **Bất cân xứng quyền** — Provider không thể khiếu nại khi nhận thiếu tiền (`payment_sent`); phí không hoàn kể cả khi lỗi thuộc bên kia; vòng uy tín (rating) chưa khép kín.

Bản v2.0 thiết kế lại để **mọi giao dịch luôn kết thúc được** (mọi trạng thái sống đều có timeout hoặc lối thoát), **mọi tranh chấp có trọng tài và nguồn đền bù**, **mọi cam kết có đồng hồ đếm**, và **quyền – nghĩa vụ – phí đối xứng giữa hai bên**. Phần Phụ lục D bổ sung phân tích UX/UI với 21 khuyến nghị xếp ưu tiên P0/P1/P2.

### Bảng quyết định then chốt (Key Decisions)

| # | Vấn đề (OI v1.0) | Quyết định v2.0 | Lý do |
|---|---|---|---|
| D1 | OI-01 Khiếu nại treo | Thêm vai trò **Admin/Trọng tài** + quy trình phân xử 5 bước, SLA 48h, 4 kết cục chuẩn | Bắt buộc cho mọi marketplace tài chính |
| D2 | OI-02 Escrow ảo | **Ký quỹ một phía (Provider)** qua ví nội bộ + cổng thanh toán; Requester không ký quỹ | Requester đã chịu rủi ro "trả tiền trước"; ký quỹ 2 phía nhân đôi vốn chết, giết thanh khoản |
| D3 | OI-13 Phí không hoàn | **Thu phí khi `completed`** (thay vì khi accept); giao dịch đổ vỡ do tranh chấp → bên thua chịu phí phạt | Công bằng, đơn giản hạch toán, loại bỏ rủi ro pháp lý "thu tiền dịch vụ chưa cung cấp" |
| D4 | OI-03 Provider không khiếu nại được | Mở quyền khiếu nại cho Provider từ `payment_sent` | Đối xứng rủi ro |
| D5 | OI-04 Không timeout | **Ma trận SLA 5 pha** với đếm ngược, nhắc tự động, leo thang/tự hủy | Bảo vệ thanh khoản + trải nghiệm |
| D6 | OI-05 Không rating | Đánh giá 2 chiều bắt buộc trong 7 ngày sau `completed` | Khép kín vòng uy tín |
| D7 | OI-06 Từ điển trạng thái lệch | Hợp nhất `pending`/`waiting_accept` → **`pending_acceptance`**; 1 bộ nhãn duy nhất; thêm `expired`, `resolved` | Một nguồn sự thật |
| D8 | OI-08 Không sửa deal | Cho **sửa deal có version**; yêu cầu đã gửi giữ nguyên tỷ giá đã chốt | Giữ lịch sử, không phá cam kết |
| D9 | OI-07 Xóa không xác nhận | Mọi thao tác hủy hoại (xóa deal, xóa tài khoản) đều **xác nhận 2 bước**; deal có yêu cầu đang xử lý không xóa được, chỉ tạm dừng | Nhất quán, an toàn |
| D10 | OI-10 KYC/AML | **KYC 3 tầng** (T0 xem / T1 gửi có hạn mức / T2 Provider); sàng lọc AML | Điều kiện pháp lý tiên quyết |
| D11 | OI-11 Không kênh liên lạc | **Chat theo giao dịch** (gắn request, lưu vết, là bằng chứng phân xử) | Giảm treo, tăng tỷ lệ hoàn tất |
| D12 | OI-09 Tỷ giá tĩnh | Tích hợp nguồn tỷ giá thị trường, làm mới ≤ 5 phút, cảnh báo lệch > ±3% | Chống deal "mồi" tỷ giá ảo |
| D13 | OI-12 Lộ dữ liệu | Masking mặc định + lộ theo ngữ cảnh; bằng chứng chỉ 2 bên + Admin xem được | Bảo mật & tuân thủ PDPA/Nghị định 13 |

---

## MỤC LỤC

1. [Giới thiệu](#1-giới-thiệu)
2. [Tổng quan nghiệp vụ](#2-tổng-quan-nghiệp-vụ)
3. [Vòng đời giao dịch end-to-end (state machine v2)](#3-vòng-đời-giao-dịch-end-to-end)
4. [Mô hình phí & escrow v2](#4-mô-hình-phí--escrow-v2)
5. [SLA, timeout & thông báo](#5-sla-timeout--thông-báo)
6. [Nghiệp vụ vai trò PROVIDER](#6-nghiệp-vụ-vai-trò-provider)
7. [Nghiệp vụ vai trò REQUESTER](#7-nghiệp-vụ-vai-trò-requester)
8. [Nghiệp vụ vai trò ADMIN / TRỌNG TÀI (mới)](#8-nghiệp-vụ-vai-trò-admin--trọng-tài)
9. [Hệ thống uy tín & đánh giá (mới)](#9-hệ-thống-uy-tín--đánh-giá)
10. [Chat theo giao dịch (mới)](#10-chat-theo-giao-dịch)
11. [KYC, AML & tuân thủ (mới)](#11-kyc-aml--tuân-thủ)
12. [Ma trận quyền hành động theo trạng thái](#12-ma-trận-quyền-hành-động-theo-trạng-thái)
13. [Danh mục quy tắc nghiệp vụ v2](#13-danh-mục-quy-tắc-nghiệp-vụ-v2)
14. [Dữ liệu nghiệp vụ v2](#14-dữ-liệu-nghiệp-vụ-v2)
15. [KPI & báo cáo](#15-kpi--báo-cáo)
16. [Lộ trình triển khai (Roadmap MVP → V2)](#16-lộ-trình-triển-khai)
17. [Giả định, ràng buộc & rủi ro còn lại](#17-giả-định-ràng-buộc--rủi-ro-còn-lại)
- [Phụ lục A — Bảng trạng thái giao dịch v2](#phụ-lục-a--bảng-trạng-thái-giao-dịch-v2)
- [Phụ lục B — Ma trận tiền tệ × phương thức & dữ liệu tham chiếu](#phụ-lục-b)
- [Phụ lục C — Từ điển nhãn/thông điệp UI v2](#phụ-lục-c)
- [**Phụ lục D — PHÂN TÍCH & KHUYẾN NGHỊ UX/UI**](#phụ-lục-d--phân-tích--khuyến-nghị-uxui)

---

## 1. GIỚI THIỆU

### 1.1. Mục đích

Tài liệu này là **căn cứ duy nhất (single source of truth)** để: (a) đội phát triển thiết kế backend, API, CSDL và frontend production; (b) đội QA xây test case theo use case và business rule đánh số; (c) vận hành thiết kế quy trình trọng tài & CSKH; (d) pháp chế đánh giá tuân thủ.

### 1.2. Phạm vi v2.0

**Trong phạm vi (mở rộng so với v1.0):** toàn bộ nghiệp vụ v1.0 **cộng thêm** — quy trình phân xử khiếu nại; ví nội bộ & ký quỹ Provider; thu/hoàn phí; SLA & timeout tự động; đánh giá 2 chiều; chat theo giao dịch; KYC 3 tầng; thông báo đẩy; che dấu dữ liệu; vai trò Admin.

**Ngoài phạm vi:** chi tiết kỹ thuật cổng thanh toán cụ thể, hợp đồng đối tác eKYC, chi tiết hạ tầng (được tách sang tài liệu kỹ thuật riêng).

### 1.3. Thuật ngữ bổ sung so với v1.0

| Thuật ngữ | Định nghĩa |
|---|---|
| **Admin / Trọng tài (Arbitrator)** | Nhân sự vận hành của nền tảng, xử lý khiếu nại, quản trị người dùng/deal |
| **Ví nội bộ (Internal Wallet)** | Số dư tiền thật của người dùng trên nền tảng, nạp/rút qua cổng thanh toán; dùng để ký quỹ và thu phí |
| **Ký quỹ (Collateral/Escrow v2)** | Khoản tiền của Provider bị khóa trong ví nội bộ khi chấp nhận yêu cầu; nguồn đền bù nếu Provider thua khiếu nại |
| **SLA pha** | Hạn chót cho từng bước của giao dịch; quá hạn kích hoạt nhắc → leo thang → tự xử lý |
| **Kết cục phân xử (Resolution)** | 1 trong 4 kết quả chuẩn khi Admin đóng khiếu nại (mục 8.3) |
| **Tier KYC** | Tầng xác minh danh tính quyết định hạn mức và vai trò được phép |

Các thuật ngữ Deal, Request, Corridor, Proof, Memo... giữ nguyên định nghĩa v1.0.

---

## 2. TỔNG QUAN NGHIỆP VỤ

### 2.1. Bối cảnh & mô hình (giữ nguyên tinh thần v1.0, cập nhật dòng giá trị)

Mô hình vẫn là **marketplace hai chiều**: Provider niêm yết deal tỷ giá; Requester tìm – gửi yêu cầu – thanh toán; dòng tiền giao dịch chính (ngoại tệ và nội tệ) vẫn chạy **ngoài hệ thống** qua Zelle/MoMo/bank... Điểm khác biệt cốt lõi của v2.0: nền tảng **có cầm một phần tiền thật** — ví nội bộ phục vụ **ký quỹ Provider + thu phí + đền bù phân xử** — biến "5 lớp niềm tin" từ tuyên ngôn thành cơ chế có răng.

### 2.2. Các bên tham gia (Actors) — cập nhật

| Actor | Loại | Vai trò | Thay đổi v2 |
|---|---|---|---|
| Provider | Người dùng chính | Niêm yết deal, duyệt yêu cầu, nhận tiền, chi trả | Phải KYC Tier 2 + nạp ký quỹ; được khiếu nại từ `payment_sent`; được sửa deal có version |
| Requester | Người dùng chính | Tìm deal, gửi yêu cầu, thanh toán, xác nhận | Phải KYC Tier 1; được đánh giá Provider; có chat |
| Người thụ hưởng | Bên thứ ba | Nhận tiền cuối | Không đổi |
| **Admin/Trọng tài** | **Vận hành (mới)** | Phân xử khiếu nại; quản trị deal/người dùng; giám sát AML | **Mới hoàn toàn** |
| Nền tảng (System) | Hệ thống | Khớp deal, state machine, đồng hồ SLA, ví & phí, thông báo, lưu bằng chứng | Bổ sung scheduler SLA, ledger ví, notification service |

### 2.3. Mô hình doanh thu v2

| Nguồn thu | Mức | Thời điểm thu | Ghi chú |
|---|---|---|---|
| Phí hệ thống | 0,5% × số tiền gửi, **mỗi bên** (tổng 1%) | **Khi giao dịch `completed`** — trừ từ ví nội bộ (Provider) và cộng vào nghĩa vụ thanh toán (Requester, xem 4.2) | Thay đổi so với v1.0 (thu khi accept). Lý do tại Quyết định D3 |
| Phí phạt vi phạm | = phí hệ thống của bên vi phạm (0,5%) | Khi Admin xử thua khiếu nại hoặc bên vi phạm SLA gây hủy | Trừ từ ký quỹ (Provider) / ghi nợ uy tín + chặn giao dịch (Requester) |
| (V2+) Phí niêm yết ưu tiên, quảng cáo deal | Theo bảng giá | — | Ngoài phạm vi MVP |

---

## 3. VÒNG ĐỜI GIAO DỊCH END-TO-END

### 3.1. Nguyên tắc thiết kế lại state machine

1. **Hợp nhất trạng thái trùng nghĩa**: `pending` + `waiting_accept` → **`pending_acceptance`** (nhãn "Chờ chấp nhận"). Một mã – một nhãn – một màu.
2. **Mọi trạng thái sống đều có đồng hồ**: quá SLA → hệ thống tự chuyển trạng thái hoặc leo thang (mục 5).
3. **`disputed` không còn là ngõ cụt**: có nhánh ra `resolved` với 4 kết cục chuẩn.
4. **Thêm 2 trạng thái kết thúc mới**: `expired` (quá hạn chấp nhận/thanh toán, hệ thống tự đóng) và `resolved` (khiếu nại đã phân xử).

### 3.2. Sơ đồ trạng thái v2 (12 trạng thái)

```
                 Requester gửi yêu cầu
                          │
                          ▼
            ┌──────────────────────────┐   timeout T1 (Provider không phản hồi)
            │  pending_acceptance      │ ────────────────────────► [expired]
            │  «Chờ chấp nhận»         │
            └──────────────────────────┘
              │           │          │
   Provider   │           │          │ Requester "Hủy yêu cầu"
   "Từ chối"  ▼           │          ▼
         [rejected]       │     [cancelled]
                          │ Provider "Đồng ý & Chấp nhận"
                          │ → KHÓA KÝ QUỸ PROVIDER (BR-14v2)
                          ▼
            ┌──────────────────────────┐   timeout T2 (Requester không thanh toán)
            │  accepted                │ ────► [expired] + mở khóa ký quỹ
            │  «Chờ thanh toán»        │       + ghi nhận vi phạm Requester
            └──────────────────────────┘
                          │ Requester nộp paymentProof
                          ▼
            ┌──────────────────────────┐  Requester khiếu nại ──► [disputed]
            │  payment_sent            │  Provider  khiếu nại ──► [disputed]  ★mới (D4)
            │  «Chờ xác nhận»          │  timeout T3 → nhắc → leo thang Admin
            └──────────────────────────┘
                          │ Provider "Xác nhận đã nhận đủ"
                          ▼
            ┌──────────────────────────┐  Requester khiếu nại ──► [disputed]
            │  payment_confirmed       │  timeout T4 (theo SLA deal) → nhắc
            │  «Đang chuyển tiền»      │  → leo thang Admin
            └──────────────────────────┘
                          │ Provider nộp transferProof
                          ▼
            ┌──────────────────────────┐  Requester / Provider khiếu nại ──► [disputed]
            │  transfer_sent           │  timeout T5 → nhắc Requester
            │  «Chờ hoàn tất»          │  → leo thang Admin (KHÔNG tự hoàn tất)
            └──────────────────────────┘
                          │ Requester "Đã nhận đủ - Hoàn tất"
                          ▼
            ┌──────────────────────────┐
            │  completed 🎉            │ → thu phí 2 bên, mở khóa ký quỹ,
            │  «Hoàn thành»            │   mở cửa sổ đánh giá 7 ngày
            └──────────────────────────┘

            ┌──────────────────────────┐   Admin phân xử (SLA 48h)
            │  disputed «Khiếu nại»    │ ─────────► [resolved]
            └──────────────────────────┘   4 kết cục: xem mục 8.3
```

**Trạng thái kết thúc (6):** `completed`, `rejected`, `cancelled`, `expired`, `resolved`. `disputed` là trạng thái **chờ phân xử có SLA**, không còn là kết thúc.

### 3.3. Bảng chuyển trạng thái v2

| # | Từ | Người thực hiện | Hành động / điều kiện | Sang | Side effects |
|---|---|---|---|---|---|
| T1 | `pending_acceptance` | Provider | "Từ chối" (kèm lý do chọn nhanh — mới, BR-29) | `rejected` | Lưu `rejectReason` |
| T2 | `pending_acceptance` | Provider | "Đồng ý & Chấp nhận" — **điều kiện: ví ký quỹ đủ số dư** | `accepted` | Khóa ký quỹ = giá trị chi trả (tiền tệ nhận); chốt `feeRate`, `feeAmount` (chưa thu); start đồng hồ T2 |
| T3 | `pending_acceptance` | Requester | "Hủy yêu cầu" | `cancelled` | — |
| T4 | `pending_acceptance` | System | Quá SLA T1 | `expired` | Thông báo 2 bên |
| T5 | `accepted` | Requester | Nộp `paymentProof` | `payment_sent` | Lưu proof; start T3 |
| T6 | `accepted` | System | Quá SLA T2 | `expired` | Mở khóa ký quỹ; +1 vi phạm Requester |
| T7 | `payment_sent` | Provider | "Xác nhận đã nhận đủ" | `payment_confirmed` | `paymentConfirmedAt`; start T4 |
| T8 | `payment_confirmed` | Provider | Nộp `transferProof` | `transfer_sent` | Lưu proof; start T5 |
| T9 | `transfer_sent` | Requester | "Đã nhận đủ - Hoàn tất" | `completed` | Thu phí 2 bên; mở khóa ký quỹ; `completedAt`; mở cửa sổ rating |
| T10 | `payment_sent` / `payment_confirmed` / `transfer_sent` | Requester (có `paymentProof`) | "Khiếu nại" + mô tả + bằng chứng | `disputed` | `disputedBy=requester`; freeze ký quỹ; start SLA Admin 48h |
| T11 | `payment_sent` ★ / `transfer_sent` | Provider (có proof tương ứng) | "Khiếu nại" | `disputed` | `disputedBy=provider`; như trên |
| T12 | `disputed` | Admin | Ra phán quyết | `resolved` | Ghi `resolutionOutcome`, thực thi tài chính (8.3) |
| T13 | `payment_sent`/`payment_confirmed`/`transfer_sent` | System | Quá SLA T3/T4/T5 sau khi đã nhắc | (giữ trạng thái) + **ticket leo thang Admin** | Admin can thiệp chủ động |

★ = quyền mới của Provider (Quyết định D4): khiếu nại tại `payment_sent` khi đối soát thấy tiền về thiếu/sai memo/không về, kèm điều kiện đã chờ tối thiểu 30 phút kể từ khi Requester nộp bằng chứng (tránh khiếu nại vội khi ngân hàng chậm).

### 3.4. Hai pha thanh toán — không đổi nguyên tắc

Giữ nguyên nguyên tắc đối ứng v1.0: *bên chuyển tiền nộp bằng chứng — bên nhận tiền xác nhận* (BR-22). Bổ sung: mọi xác nhận hiển thị **hộp thoại cảnh báo không thể đảo ngược** nêu rõ hệ quả trước khi thực hiện (UX-P0-3, Phụ lục D).

---

## 4. MÔ HÌNH PHÍ & ESCROW V2

### 4.1. Phân tích lựa chọn escrow (căn cứ Quyết định D2)

| Phương án | Ưu | Nhược | Kết luận |
|---|---|---|---|
| A. Cờ hiển thị (v1.0) | Không cần ví | Không có giá trị bảo vệ thật; không có nguồn đền bù | Loại |
| B. Ký quỹ 2 phía, mỗi bên 100% giá trị | Bảo vệ tối đa | Requester phải nạp tiền vào ví **trước khi** chuyển tiền thật cho Provider → trả 2 lần giá trị; vốn chết khổng lồ; UX tồi | Loại |
| **C. Ký quỹ 1 phía (Provider)** ✅ | Đúng cấu trúc rủi ro: Requester là bên xuống tiền trước → bên cần được bảo vệ là Requester → bên phải ký quỹ là Provider. Ký quỹ = đúng nghĩa vụ chi trả, là nguồn đền bù thật khi Provider thua kiện | Provider cần vốn ký quỹ (rào cản gia nhập — chấp nhận được, đồng thời là bộ lọc chất lượng) | **Chọn cho MVP** |
| D. Nền tảng cầm hộ toàn bộ dòng tiền | An toàn nhất | Trở thành tổ chức trung gian thanh toán → giấy phép nặng, ngoài khả năng MVP | V2+ nếu có giấy phép |

### 4.2. Quy tắc ký quỹ (thay thế BR-14→BR-16 cũ)

| Mã | Quy tắc v2 |
|---|---|
| **BR-14v2** | Khi Provider chấp nhận yêu cầu: hệ thống **khóa trong ví nội bộ của Provider** số tiền = **100% giá trị chi trả** (theo tiền tệ nhận, quy đổi về tiền tệ ví theo tỷ giá hệ thống tại thời điểm khóa, cộng đệm 2%). Ví không đủ → không thể bấm "Chấp nhận"; UI hiển thị số cần nạp thêm |
| **BR-15v2** | Ký quỹ mở khóa khi: (a) `completed` — sau khi trừ phí; (b) `expired` do Requester không thanh toán; (c) `resolved` theo phán quyết (mục 8.3) |
| **BR-16v2** | Khi vào `disputed`: ký quỹ bị **freeze** (không mở khóa, không dùng cho giao dịch khác) cho đến `resolved` |
| **BR-16b** | Provider được phép nhận đồng thời nhiều yêu cầu miễn tổng ký quỹ khóa ≤ số dư ví; dashboard hiển thị "Ví khả dụng / Đang ký quỹ" |

### 4.3. Quy tắc phí v2 (thay thế BR-10→BR-13 cũ)

| Mã | Quy tắc v2 |
|---|---|
| **BR-10v2** | Tỷ lệ phí 0,5%/bên được **chốt (snapshot)** vào yêu cầu tại thời điểm Provider chấp nhận; **thu khi `completed`** |
| **BR-11v2** | Phí Provider: trừ trực tiếp từ ví nội bộ khi mở khóa ký quỹ. Phí Requester: cộng vào số tiền phải chuyển ở Pha 1 — UI Bước 1 hiển thị tách bạch: "Tiền gửi + Phí (0,5%) = **Tổng phải chuyển**" (loại bỏ mơ hồ của v1.0 về cách Requester nộp phí) |
| **BR-12v2** | Giao dịch kết thúc ở `rejected` / `cancelled` / `expired` trước khi có tiền chuyển: **không phát sinh phí**. Kết thúc ở `resolved`: bên thua chịu phí phạt = 0,5% (trừ ký quỹ nếu là Provider; ghi nợ + chặn giao dịch mới nếu là Requester); bên thắng miễn phí |
| **BR-13v2** | Trước mọi cam kết (gửi yêu cầu / chấp nhận), mỗi bên thấy bảng phí + ký quỹ sẽ phát sinh, kèm liên kết "Chính sách phí & hoàn phí" |

---

## 5. SLA, TIMEOUT & THÔNG BÁO

### 5.1. Ma trận SLA (giá trị mặc định, cấu hình được theo corridor)

| Đồng hồ | Pha (trạng thái) | Hạn mặc định | Nhắc | Hết hạn → hành động hệ thống |
|---|---|---|---|---|
| **T1** | `pending_acceptance` | 2 giờ | 1h, 1h45 (Provider) | → `expired`; gợi ý Requester deal thay thế |
| **T2** | `accepted` (chờ Requester chuyển tiền) | 1 giờ | 30', 50' (Requester) | → `expired`; mở khóa ký quỹ; +1 vi phạm Requester (3 vi phạm/30 ngày → tạm khóa gửi yêu cầu 7 ngày) |
| **T3** | `payment_sent` (chờ Provider xác nhận) | 1 giờ | 30', 50' (Provider) | Quá hạn → ticket leo thang Admin; đánh dấu "Quá SLA" công khai trên hồ sơ Provider |
| **T4** | `payment_confirmed` (chờ Provider chi trả) | = SLA cam kết trên deal + 30' đệm | tại 80% SLA | Quá hạn → ticket Admin; Requester được mở nút "Khiếu nại" nổi bật |
| **T5** | `transfer_sent` (chờ Requester hoàn tất) | 24 giờ | 6h, 20h (Requester) | Quá hạn → ticket Admin chủ động liên hệ. **Không tự động completed** (tiền thật chưa được xác nhận bởi người có quyền — tự hoàn tất là rủi ro pháp lý) |
| **T6** | `disputed` | 48 giờ (SLA Admin) | 24h (Admin) | Quá hạn → leo thang trưởng nhóm vận hành |

### 5.2. Hệ thống thông báo (mới — thay thế "nhãn MỚI" thuần UI của v1.0)

- Kênh: **in-app + push + email** (SMS cho sự kiện tài chính quan trọng — tùy chọn).
- Sự kiện bắt buộc thông báo: yêu cầu mới (Provider); được chấp nhận/từ chối (Requester); bằng chứng mới được nộp (bên đối tác); xác nhận nhận tiền; nhắc SLA (theo 5.1); khiếu nại mở/đóng; phán quyết; nhắc đánh giá.
- Mọi thông báo deep-link thẳng vào màn chi tiết giao dịch.
- BR-26 cũ (badge đếm, nhãn "MỚI") giữ nguyên ở tầng UI, nay được nuôi bằng notification service thay vì so sánh thời điểm mở phiên.

---

## 6. NGHIỆP VỤ VAI TRÒ PROVIDER

Cấu trúc 4 tab giữ nguyên (Trang chủ · Deals · Yêu cầu · Hồ sơ). Dưới đây liệt kê **thay đổi so với v1.0**; các use case không nêu nghĩa là giữ nguyên.

### 6.1. Điều kiện trở thành Provider (mới)

1. Hoàn tất **KYC Tier 2** (mục 11).
2. Nạp ví nội bộ tối thiểu (mặc định: tương đương 500 USD) — vừa là ký quỹ vận hành vừa là bộ lọc nghiêm túc.
3. Chấp thuận Điều khoản Provider (SLA, phí phạt, quy trình phân xử).

### 6.2. UC-P-02 Tạo deal — bổ sung

- Trường tỷ giá có **so sánh trực tiếp với tỷ giá thị trường thời gian thực** (nguồn API, làm mới ≤ 5 phút). Nếu tỷ giá nhập **lệch > ±3%** so với thị trường: cảnh báo và yêu cầu xác nhận; **lệch > ±10%**: chặn đăng (chống deal mồi/đánh máy nhầm). [BR-30]
- Hiển thị mô phỏng: "Với tỷ giá này, mỗi $1.000 bạn lãi/lỗ ≈ X so với thị trường".
- Hạn mức tối đa của deal không vượt quá **số dư ví khả dụng ÷ tỷ lệ ký quỹ** — tooltip giải thích.

### 6.3. UC-P-03 Quản lý deal — thay đổi lớn (D8, D9)

- **Sửa deal (mới):** Provider sửa được tỷ giá, hạn mức, phương thức, ghi chú, SLA. Mỗi lần lưu tạo **version mới**; yêu cầu đã gửi trước đó **giữ nguyên tỷ giá/điều kiện đã chốt** (snapshot tại request). Lịch sử version xem được. [BR-05v2]
- **Xóa deal:** xác nhận 2 bước ("Xóa deal? Hành động không thể hoàn tác"); **chặn xóa** nếu còn yêu cầu `pending_acceptance` hoặc đang xử lý — buộc tạm dừng trước, xử lý xong mới xóa. Xóa = soft delete (ẩn vĩnh viễn, giữ dữ liệu đối soát).
- Hết hạn: deal `expired` có nút **"Đăng lại"** (clone sang deal mới với tỷ giá cập nhật) — giảm ma sát tái niêm yết.

### 6.4. UC-P-04 Duyệt yêu cầu — bổ sung

- Modal "Xác nhận chấp nhận" v2 hiển thị: nghĩa vụ nhận/chi, **số ký quỹ sẽ khóa**, số dư ví sau khóa, phí 0,5% (thu khi hoàn tất), **đồng hồ T2** sẽ áp cho Requester, và SLA chi trả của chính mình.
- "Từ chối" yêu cầu chọn **lý do nhanh** (Tỷ giá đã thay đổi / Hết hạn mức / Không hỗ trợ phương thức / Nghi ngờ rủi ro / Khác) — dữ liệu này nuôi KPI và hiển thị cho Requester thay câu cụt "Nhà cung cấp từ chối". [BR-29]
- Hiển thị thêm về Requester: tier KYC, số giao dịch hoàn thành, **tỷ lệ hủy/vi phạm SLA 30 ngày** — đủ để ra quyết định, không lộ danh tính chi tiết.

### 6.5. UC-P-05 / UC-P-07 — quyền khiếu nại mở rộng (D4)

- Tại `payment_sent`, ngoài "Xác nhận đã nhận đủ", Provider có nút phụ **"Tôi chưa nhận được / nhận sai"** → mở khiếu nại (điều kiện: ≥ 30 phút từ lúc Requester nộp bằng chứng). Khiếu nại bắt buộc chọn loại: *Không nhận được tiền / Thiếu tiền / Sai memo / Khác* + bằng chứng sao kê.
- Tại `transfer_sent`: giữ nguyên quyền khiếu nại v1.0 khi Requester không xác nhận (nay có T5 + leo thang Admin hỗ trợ nên ít phải dùng).

### 6.6. UC-P-08 Tài khoản thanh toán — bổ sung

- Xóa tài khoản: **luôn xác nhận** (đồng nhất với Requester — D9); chặn xóa nếu tài khoản đang được tham chiếu bởi giao dịch sống.
- **Ràng buộc đăng deal [BR-23v2]:** khi đăng/sửa deal, hệ thống kiểm tra mỗi phương thức nhận tiền đã chọn phải có ≥ 1 tài khoản đã lưu tương ứng; thiếu → chặn đăng kèm CTA "Thêm tài khoản". Loại bỏ hoàn toàn tình huống Requester gặp "⚠️ Chưa có tài khoản · Liên hệ Provider" của v1.0.

### 6.7. Ví & ký quỹ (mục mới trên tab Hồ sơ)

- Thẻ "Ví của tôi": Số dư khả dụng / Đang ký quỹ / Đang freeze (tranh chấp); nút Nạp / Rút (qua cổng thanh toán); lịch sử bút toán (ledger) đầy đủ.

---

## 7. NGHIỆP VỤ VAI TRÒ REQUESTER

Cấu trúc 4 tab giữ nguyên (Gửi tiền · Yêu cầu · Liên kết · Hồ sơ). Thay đổi so với v1.0:

### 7.1. UC-R-01/02/03 Wizard gửi tiền — bổ sung

- Bước 1 hiển thị **tổng phải chuyển = tiền gửi + phí 0,5%** ngay từ đầu (BR-11v2) — không để phí "xuất hiện muộn".
- Bước 2 (kết quả deal): mỗi card bổ sung **"Tổng chi phí thực" và "Người nhận thực nhận"** sau phí — cho phép so sánh táo-với-táo giữa các deal (tỷ giá cao chưa chắc tốt nếu kèm điều kiện). Bộ lọc/sắp xếp: theo số nhận được, theo thời gian chuyển, theo rating.
- Thuật toán xếp hạng BR-07 giữ nguyên, bổ sung hệ số tin cậy: deal của Provider đang có ticket quá SLA mở bị giảm hạng; Provider "Quá SLA" gắn nhãn cảnh báo nhẹ.
- Bước 3: hiển thị đồng hồ cam kết: "Sau khi Provider chấp nhận, bạn có **60 phút** để chuyển tiền" — đặt kỳ vọng trước khi cam kết.

### 7.2. UC-R-05 Hủy yêu cầu — bổ sung

- Giữ quy tắc chỉ hủy ở `pending_acceptance` (BR-25). Thêm **xác nhận trước khi hủy** + ghi nhận tần suất hủy (hủy > 5 lần/7 ngày → cảnh báo hành vi).

### 7.3. UC-R-06 Thanh toán — bổ sung chống lỗi memo (UX-P0-2)

- Khối hướng dẫn chuyển tiền có nút **"Sao chép tất cả"** (số tài khoản + số tiền + memo trong 1 lần) và **mã QR** (VietQR cho VND, định dạng tương ứng cho ví khác nếu hỗ trợ) nhúng sẵn số tiền + memo — giảm lỗi gõ tay, là nguyên nhân tranh chấp số 1 của mô hình P2P.
- Hiển thị **đồng hồ đếm ngược T2** rõ ràng; quá hạn → yêu cầu tự `expired`.

### 7.4. UC-R-07 Xác nhận hoàn tất — bổ sung

- Hộp thoại xác nhận 2 bước, nêu rõ: "Hành động không thể hoàn tác. Chỉ xác nhận khi {tên người thụ hưởng} đã thực nhận đủ {số tiền}." kèm checkbox "Tôi đã kiểm tra với người nhận".
- Sau `completed`: chuyển thẳng vào màn **đánh giá Provider** (mục 9).

### 7.5. UC-R-08 Khiếu nại — bổ sung

- Form khiếu nại có **phân loại bắt buộc** (Provider không chi trả / Chi thiếu / Chi sai người nhận / Quá SLA / Khác) + mô tả + bằng chứng; hiển thị SLA phân xử 48h và các kết cục có thể.

---

## 8. NGHIỆP VỤ VAI TRÒ ADMIN / TRỌNG TÀI

### 8.1. Phân hệ Admin (web console — mới)

| Module | Chức năng |
|---|---|
| Hàng đợi khiếu nại | Danh sách `disputed` + ticket leo thang SLA, sắp theo hạn xử lý; nhận case (assign) |
| Bàn phân xử | Toàn cảnh 1 giao dịch: timeline trạng thái, 2 hồ sơ, chuỗi bằng chứng, lịch sử chat, sao kê đính kèm; công cụ yêu cầu bổ sung bằng chứng; nút ra phán quyết |
| Quản trị người dùng | Xem hồ sơ, tier KYC, lịch sử vi phạm; khóa/mở tài khoản; điều chỉnh hạn mức |
| Quản trị deal | Gỡ deal vi phạm (tỷ giá ảo, nội dung cấm); duyệt báo cáo từ người dùng |
| Giám sát AML | Cảnh báo giao dịch bất thường (mục 11.3); xuất báo cáo |
| Cấu hình | SLA từng đồng hồ theo corridor; tỷ lệ phí; ngưỡng cảnh báo tỷ giá; nội dung thông báo |

### 8.2. UC-A-01 — Quy trình phân xử khiếu nại (5 bước, SLA 48h)

1. **Tiếp nhận**: case vào hàng đợi khi giao dịch → `disputed`; ký quỹ Provider tự động freeze; 2 bên nhận thông báo "Khiếu nại đã được tiếp nhận, xử lý trong 48h".
2. **Thu thập**: Admin xem hồ sơ; có quyền yêu cầu mỗi bên bổ sung bằng chứng trong 12h (sao kê có dấu thời gian, video...). Bên không hợp tác đúng hạn bị suy đoán bất lợi.
3. **Đối chất qua chat 3 bên** (nếu cần): Admin tham gia luồng chat giao dịch.
4. **Phán quyết**: chọn 1 trong 4 kết cục chuẩn (8.3), bắt buộc viết căn cứ; phán quyết gửi 2 bên.
5. **Thực thi & đóng case**: hệ thống tự thực hiện bút toán; giao dịch → `resolved`; cập nhật điểm uy tín; lưu hồ sơ phục vụ khiếu nại phúc thẩm (1 lần, trong 7 ngày, do trưởng nhóm xử).

### 8.3. Bốn kết cục phân xử chuẩn (`resolutionOutcome`)

| Mã | Kết cục | Khi nào | Thực thi tài chính |
|---|---|---|---|
| `R1_complete` | Xác nhận giao dịch hoàn tất | Bằng chứng cho thấy người thụ hưởng đã nhận đủ (Requester "ỉm" xác nhận) | Như `completed`: thu phí 2 bên, mở ký quỹ; Requester +1 vi phạm |
| `R2_refund_requester` | Provider hoàn tiền cho Requester | Provider đã nhận tiền nhưng không chi trả/chi sai | **Trích ký quỹ Provider đền cho Requester** (quy đổi); phí phạt 0,5% Provider; vi phạm nặng → xem xét khóa |
| `R3_no_payment` | Xác định Requester chưa thanh toán | Bằng chứng thanh toán giả/không có tiền về | Hủy giao dịch, mở ký quỹ; phí phạt + vi phạm Requester; nghi gian lận → khóa + lưu hồ sơ AML |
| `R4_mutual_cancel` | Hủy đồng thuận / lỗi khách quan | Hai bên đồng ý hủy; lỗi hệ thống/ngân hàng | Hoàn trạng thái tiền về như trước giao dịch; không phí, không vi phạm |

> Đền bù từ ký quỹ (R2) là lý do tồn tại của mô hình escrow v2 — lời hứa "an toàn" có nguồn tiền thật bảo chứng.

---

## 9. HỆ THỐNG UY TÍN & ĐÁNH GIÁ (mới — D6)

- **UC-X-01 Đánh giá sau giao dịch:** khi `completed`, mỗi bên có **7 ngày** để chấm ★1–5 + nhận xét (tùy chọn) + thẻ nhanh ("Nhanh", "Đúng cam kết", "Phản hồi chậm"...). Đánh giá **ẩn hai chiều** (double-blind): chỉ công khai khi cả hai đã chấm hoặc hết 7 ngày — chống trả đũa.
- Rating hiển thị = trung bình 12 tháng gần nhất; hồ sơ công khai thêm: tỷ lệ hoàn thành, tỷ lệ quá SLA, thời gian xử lý trung vị, số giao dịch 30 ngày.
- Giao dịch `resolved`: hệ thống tự ghi chú kết cục vào hồ sơ bên thua (không cho đánh giá tự do để tránh lạm dụng).
- Chống thao túng: chỉ giao dịch `completed`/`resolved` mới sinh quyền đánh giá; phát hiện vòng lặp đánh giá chéo bất thường → gắn cờ AML.

---

## 10. CHAT THEO GIAO DỊCH (mới — D11)

- Mỗi Request có **1 luồng chat riêng**, mở từ khi `accepted` đến 7 ngày sau khi kết thúc; Admin tham gia khi `disputed`.
- Hỗ trợ văn bản + ảnh; **toàn bộ lưu vết, không xóa/sửa được** — là bằng chứng phân xử hợp lệ.
- Tự động chèn tin hệ thống tại mỗi mốc trạng thái ("Provider đã xác nhận nhận tiền lúc 12:10").
- Lọc nội dung: cảnh báo khi phát hiện trao đổi SĐT/đề nghị giao dịch ngoài nền tảng (chống dis-intermediation); nhắc "Chỉ giao dịch trong ứng dụng mới được bảo vệ".
- Trước `accepted`, Requester vẫn dùng "lời nhắn" 1 chiều như v1.0 (tránh spam Provider).

---

## 11. KYC, AML & TUÂN THỦ (mới — D10)

### 11.1. KYC 3 tầng

| Tier | Yêu cầu | Quyền | Hạn mức |
|---|---|---|---|
| **T0** | Đăng ký email/SĐT + OTP | Xem marketplace, lưu tài khoản liên kết | Không giao dịch |
| **T1** | eKYC: giấy tờ tùy thân + liveness | Gửi yêu cầu (Requester) | ≤ $1.000/GD; ≤ $5.000/30 ngày (cấu hình) |
| **T2** | T1 + xác minh địa chỉ + nguồn tiền + tài khoản ngân hàng chính chủ | Làm Provider; hạn mức Requester nâng | Theo thẩm định |

### 11.2. Nguyên tắc pháp lý tiên quyết

Mô hình chuyển tiền xuyên biên giới chịu điều chỉnh của pháp luật ngoại hối & phòng chống rửa tiền tại **mọi quốc gia có dòng tiền chạm tới** (tại VN: Pháp lệnh Ngoại hối, Luật PCRT 2022; tại Mỹ: đăng ký MSB/FinCEN, money transmitter license theo bang...). **Điều kiện dừng (gate) của dự án:** có ý kiến pháp lý chính thức về mô hình vận hành (marketplace thuần kết nối vs. tổ chức chuyển tiền) **trước khi** mở giao dịch thật. Tài liệu này thiết kế nghiệp vụ theo hướng "marketplace + ký quỹ dịch vụ", song quyết định cuối thuộc về pháp chế.

### 11.3. Kiểm soát AML vận hành

Sàng lọc tên theo danh sách cấm vận khi KYC; quy tắc cảnh báo: chia nhỏ giao dịch (structuring), tần suất bất thường, nhiều Requester trỏ về cùng người thụ hưởng, hành lang rủi ro cao; lưu hồ sơ giao dịch ≥ 5 năm; quy trình báo cáo giao dịch đáng ngờ theo luật địa phương.

### 11.4. Bảo vệ dữ liệu (D13 — thay OI-12)

- **Masking mặc định:** số tài khoản hiển thị dạng `****1234`; SĐT dạng `09**•••89`. Lộ đầy đủ **chỉ trong ngữ cảnh cần hành động** (Requester ở bước thanh toán; Provider ở bước chi trả) và ghi log truy cập.
- Bằng chứng/proof: chỉ 2 bên giao dịch + Admin xem được; URL có chữ ký hết hạn; cấm index.
- Tuân thủ Nghị định 13/2023/NĐ-CP (VN) và chuẩn tương đương tại thị trường nguồn; quyền xóa dữ liệu cá nhân sau thời hạn lưu trữ pháp định.

---

## 12. MA TRẬN QUYỀN HÀNH ĐỘNG THEO TRẠNG THÁI (v2)

| Trạng thái | Provider | Requester | Admin | Hệ thống |
|---|---|---|---|---|
| `pending_acceptance` | ✅ Chấp nhận (đủ ký quỹ) · ❌ Từ chối (kèm lý do) | 🚫 Hủy (có xác nhận) | — | Đồng hồ T1; badge; gợi ý deal khác khi expired |
| `accepted` | (chờ) · 💬 Chat | 📤 Thanh toán + bằng chứng · 💬 Chat | — | Khóa ký quỹ; hiện TK + memo + QR; đồng hồ T2 |
| `payment_sent` | ✅ Xác nhận đã nhận · ⚠️ Khiếu nại (≥30') · 💬 | ⚠️ Khiếu nại · 💬 | — | Đồng hồ T3; leo thang |
| `payment_confirmed` | 📤 Chi trả + bằng chứng · 💬 | ⚠️ Khiếu nại · 💬 | — | Đồng hồ T4 (=SLA deal); leo thang |
| `transfer_sent` | ⚠️ Khiếu nại · 💬 | ✅ Hoàn tất (2 bước) · ⚠️ Khiếu nại · 💬 | — | Đồng hồ T5; leo thang (không tự hoàn tất) |
| `disputed` | Bổ sung bằng chứng · 💬 | Bổ sung bằng chứng · 💬 | ⚖️ Phân xử (SLA 48h) | Freeze ký quỹ; đồng hồ T6 |
| `completed` | ⭐ Đánh giá (7 ngày) | ⭐ Đánh giá (7 ngày) | — | Thu phí; mở ký quỹ; tổng kết |
| `rejected`/`cancelled`/`expired`/`resolved` | Xem hồ sơ | Xem hồ sơ | Phúc thẩm (resolved, 7 ngày) | Lưu trữ; thực thi phán quyết |

---

## 13. DANH MỤC QUY TẮC NGHIỆP VỤ V2

Quy tắc giữ nguyên từ v1.0: BR-01→BR-04, BR-06→BR-09, BR-17→BR-22, BR-25→BR-28 (với `pending_acceptance` thay cho `pending`/`waiting_accept`). Quy tắc **thay thế/bổ sung**:

| Mã | Quy tắc |
|---|---|
| **BR-05v2** | Deal sửa được, mỗi lần sửa tạo version; request đã tạo giữ snapshot điều kiện cũ. Xóa deal: xác nhận 2 bước; chặn khi còn giao dịch sống; soft delete |
| **BR-10v2 → BR-13v2** | Phí: xem mục 4.3 |
| **BR-14v2 → BR-16b** | Ký quỹ: xem mục 4.2 |
| **BR-23v2** | Mỗi phương thức nhận tiền trên deal phải có tài khoản đã lưu tương ứng tại thời điểm đăng/sửa — kiểm tra chặn tại nguồn |
| **BR-24v2** | Khiếu nại: Requester — cần `paymentProof`, tại `payment_sent`/`payment_confirmed`/`transfer_sent`; Provider — tại `payment_sent` (≥30' sau proof, cần phân loại + sao kê) và `transfer_sent` (cần `transferProof`). Mọi khiếu nại bắt buộc phân loại |
| **BR-29** | Từ chối yêu cầu bắt buộc chọn lý do nhanh; lý do hiển thị cho Requester |
| **BR-30** | Tỷ giá deal lệch > ±3% thị trường → cảnh báo; > ±10% → chặn đăng |
| **BR-31** | Mọi trạng thái sống có đồng hồ SLA theo ma trận 5.1; quá hạn xử lý tự động hoặc leo thang — không tồn tại giao dịch treo vô hạn |
| **BR-32** | Phán quyết phân xử có 4 kết cục chuẩn (8.3); thực thi tài chính tự động từ ký quỹ; được phúc thẩm 1 lần trong 7 ngày |
| **BR-33** | Đánh giá double-blind trong 7 ngày sau completed; chỉ giao dịch thật sinh quyền đánh giá |
| **BR-34** | Chat theo giao dịch lưu vết bất biến, là bằng chứng phân xử; cảnh báo dis-intermediation |
| **BR-35** | Hạn mức giao dịch theo tier KYC (11.1); chặn tại validate Bước 1 và tại chấp nhận |
| **BR-36** | Dữ liệu nhạy cảm masking mặc định, lộ theo ngữ cảnh, log truy cập (11.4) |

---

## 14. DỮ LIỆU NGHIỆP VỤ V2

### 14.1. Thực thể & quan hệ (bổ sung so với v1.0)

```
USER (chung) ──< KYC_PROFILE (tier, trạng thái thẩm định)
USER ──< WALLET ──< LEDGER_ENTRY (bút toán: nạp/rút/khóa/mở/phí/đền bù)
PROVIDER ──< DEAL ──< DEAL_VERSION (snapshot điều kiện)
DEAL ──< REQUEST ──< PROOF (payment/transfer/dispute, bất biến)
REQUEST ──1:1── CHAT_THREAD ──< MESSAGE (bất biến)
REQUEST ──0..1── DISPUTE (phân loại, bằng chứng, assignee, resolutionOutcome, căn cứ)
REQUEST ──0..2── REVIEW (đánh giá 2 chiều, double-blind)
REQUEST ──< SLA_TIMER (loại đồng hồ, hạn, trạng thái)
USER ──< VIOLATION (loại vi phạm, thời điểm, hệ quả)
USER ──< PAYMENT_ACCOUNT (như v1.0 + cờ "đang được deal tham chiếu")
NOTIFICATION (người nhận, sự kiện, kênh, deep-link, đã đọc)
```

### 14.2. Thuộc tính Request bổ sung

`status` (12 giá trị mới) · `dealVersionId` (snapshot) · `totalPayable` (tiền gửi + phí Requester) · `collateralAmount/Currency` · `feeStatus` (pending/charged/penalized/waived) · `rejectReason` · `slaDeadlines{}` · `escalationTicketId` · `resolutionOutcome` · `reviewWindowEndsAt`.

### 14.3. Ma trận tiền tệ × phương thức

Giữ nguyên Phụ lục B v1.0 (10 tiền tệ); bổ sung: mỗi phương thức gắn cờ `supportsQR` (VND: VietQR cho MoMo/ZaloPay/Bank) phục vụ UC-R-06.

---

## 15. KPI & BÁO CÁO

Kế thừa mục 9 v1.0, chính thức hóa thêm các KPI vận hành nay đo được nhờ dữ liệu mới:

| Nhóm | KPI | Nguồn |
|---|---|---|
| Sức khỏe giao dịch | Tỷ lệ hoàn tất; thời gian trung vị từng pha so SLA; tỷ lệ expired theo đồng hồ (T1–T5) | SLA_TIMER |
| Tranh chấp | Tỷ lệ disputed; phân bố 4 kết cục; thời gian phân xử trung vị vs 48h; tỷ lệ phúc thẩm | DISPUTE |
| Tin cậy | Phân bố rating; tỷ lệ quá SLA theo Provider; vi phạm Requester | REVIEW, VIOLATION |
| Tài chính | Doanh thu phí theo corridor; phí phạt; tổng ký quỹ khóa (đo thanh khoản hệ sinh thái) | LEDGER |
| Tăng trưởng | GMV theo corridor; Provider/Requester hoạt động; tỷ lệ deal được khớp | DEAL, REQUEST |
| Rủi ro | Cảnh báo AML; tỷ lệ nghi gian lận R3; phát hiện giao dịch ngoài nền tảng | AML, CHAT |

---

## 16. LỘ TRÌNH TRIỂN KHAI

| Giai đoạn | Phạm vi | Gate ra |
|---|---|---|
| **M0 — Pháp lý & nền móng** | Ý kiến pháp lý mô hình; chọn đối tác eKYC + cổng thanh toán; thiết kế CSDL + state machine + ledger | Pháp chế phê duyệt; kiến trúc duyệt |
| **M1 — MVP giao dịch tin cậy** | State machine 12 trạng thái; ví + ký quỹ Provider; phí thu khi completed; SLA T1–T5 + thông báo; KYC T1/T2; chuỗi bằng chứng + memo + QR; admin console tối thiểu (phân xử, 4 kết cục) | E2E hoàn chỉnh kể cả nhánh disputed→resolved; audit ledger khớp 100% |
| **M2 — Vòng tin cậy** | Đánh giá double-blind; chat theo giao dịch; sửa deal có version; tỷ giá thị trường + BR-30; masking dữ liệu | Tỷ lệ tranh chấp < ngưỡng; NPS pilot |
| **M3 — Tăng trưởng** | Thêm corridor; rút gọn KYC bằng đối tác; AML nâng cao; dashboard KPI; tối ưu phí | Mở rộng theo thị trường |

**Nguyên tắc cắt phạm vi:** không được phát hành giao dịch thật nếu thiếu bất kỳ thành phần nào của M1 — đặc biệt **không phát hành nếu chưa có quy trình phân xử và ký quỹ**, vì đó chính là sản phẩm (niềm tin), không phải tính năng phụ.

---

## 17. GIẢ ĐỊNH, RÀNG BUỘC & RỦI RO CÒN LẠI

1. **Rủi ro pháp lý là rủi ro số 1** — đã đặt gate M0; mô hình có thể phải điều chỉnh theo từng thị trường nguồn.
2. **Vốn ký quỹ làm chậm tăng trưởng Provider** — chấp nhận có chủ đích (chất lượng trước số lượng); V2 cân nhắc ký quỹ theo bậc tín nhiệm (Provider uy tín cao được giảm tỷ lệ ký quỹ).
3. **Dis-intermediation** (hai bên quen nhau rồi giao dịch ngoài) — giảm thiểu bằng giá trị bảo vệ thật (ký quỹ + phân xử) và cảnh báo chat; chấp nhận một tỷ lệ rò rỉ.
4. **Tranh chấp tỷ giá quy đổi ký quỹ** (ký quỹ tiền tệ ví ≠ tiền tệ chi trả) — đệm 2% + chính sách quy đổi công bố; theo dõi và hiệu chỉnh.
5. **Chi phí vận hành trọng tài** — KPI M2 phải đưa tỷ lệ tranh chấp xuống đủ thấp; tự động hóa thu thập bằng chứng.
6. Các giả định demo v1.0 (định danh cố định, đồng hồ neo, số liệu tĩnh) **hết hiệu lực** từ M1.

---

## PHỤ LỤC A — BẢNG TRẠNG THÁI GIAO DỊCH V2

| Mã | Nhãn | Nhóm lọc | Màu (semantic token) | Kết thúc? | Đồng hồ |
|---|---|---|---|---|---|
| `pending_acceptance` | "Chờ chấp nhận" | Chờ chấp nhận | `--status-waiting` (vàng) | ✘ | T1 |
| `accepted` | "Chờ thanh toán" | Đang xử lý | `--status-action` (xanh dương) | ✘ | T2 |
| `payment_sent` | "Chờ xác nhận nhận tiền" | Đang xử lý | `--status-progress` (tím) | ✘ | T3 |
| `payment_confirmed` | "Đang chuyển cho người nhận" | Đang xử lý | `--status-progress` | ✘ | T4 |
| `transfer_sent` | "Chờ bạn xác nhận hoàn tất" / "Chờ người gửi xác nhận" | Đang xử lý | `--status-almost` (xanh lục nhạt) | ✘ | T5 |
| `completed` | "Hoàn thành" | Hoàn thành | `--status-success` (xanh lục) | ✔ | — |
| `rejected` | "Bị từ chối" | Đã đóng | `--status-danger` (đỏ) | ✔ | — |
| `cancelled` | "Đã hủy" | Đã đóng | `--status-neutral` (xám) | ✔ | — |
| `expired` | "Hết hạn" | Đã đóng | `--status-neutral` | ✔ | — |
| `disputed` | "Đang phân xử" | Khiếu nại | `--status-warning` (cam) | ✘ | T6 |
| `resolved` | "Đã phân xử" | Đã đóng | `--status-info` | ✔ | — |

> Một bộ nhãn duy nhất dùng cho **mọi** màn hình (xóa bỏ bộ badge cũ trên Trang chủ Provider — đóng OI-06). Nhãn `transfer_sent` viết theo góc nhìn từng vai trò để người dùng biết "ai đang cầm lượt".

## PHỤ LỤC B

Kế thừa nguyên trạng Phụ lục B v1.0 (ma trận tiền tệ × phương thức; bảng tỷ giá tham chiếu — nay thay bằng nguồn API thời gian thực, bảng tĩnh chỉ dùng làm fallback khi mất kết nối kèm nhãn "tỷ giá có thể cũ").

## PHỤ LỤC C

Kế thừa Phụ lục C v1.0, cập nhật theo nhãn mới tại Phụ lục A và microcopy mới tại Phụ lục D (mục D.5). Các nhãn liên quan phí sửa thành: *"💸 Phí hệ thống 0,5% — thu khi giao dịch hoàn tất"*; bổ sung nhóm nhãn đồng hồ: *"⏱ Còn {mm:ss} để chuyển tiền"*, *"⏱ Nhà cung cấp cần phản hồi trước {giờ}"*.

---

# PHỤ LỤC D — PHÂN TÍCH & KHUYẾN NGHỊ UX/UI

*(Vai trò: UX Researcher + UI Designer — đánh giá prototype theo heuristics Nielsen, hành trình cảm xúc người dùng, và đề xuất xếp ưu tiên)*

## D.1. Khung phân tích

Sản phẩm này có một đặc thù UX hiếm gặp: **khoảnh khắc lo âu cực đại** của người dùng (chuyển hàng trăm/nghìn đô cho một người lạ, ngoài hệ thống) nằm ngay giữa luồng chính. Toàn bộ thiết kế phải xoay quanh 3 câu hỏi của người dùng tại mỗi màn hình: **(1) Chuyện gì đang xảy ra? (2) Ai đang cầm lượt? (3) Tôi được bảo vệ thế nào nếu hỏng?** Prototype v1.0 trả lời tốt câu 1, trả lời mờ câu 2, và gần như bỏ trống câu 3.

## D.2. Bản đồ hành trình cảm xúc (Requester) & điểm gãy

| Giai đoạn | Cảm xúc | Điểm gãy quan sát được trong v1.0 | Khắc phục |
|---|---|---|---|
| Nhập nhu cầu | Tò mò, so sánh | Phí 0,5% chưa hiện ở ước tính → "tỷ giá tốt" hóa ra đắt hơn cảm nhận | Hiện "Tổng phải chuyển" ngay Bước 1 (UX-P0-1) |
| Chọn deal | Cân nhắc | Card thiếu chỉ số tin cậy hành vi (quá SLA, tỷ lệ tranh chấp); chỉ có rating tĩnh | Bổ sung "Đúng hạn 98% · Phản hồi ~12'" |
| Chờ chấp nhận | Sốt ruột | Không biết chờ bao lâu, không có ETA | Đồng hồ T1 + "thường phản hồi trong X phút" |
| **Chuyển tiền** | **Lo âu đỉnh** | Phải tự gõ số TK + số tiền + memo (3 nguồn lỗi); không có lời trấn an về bảo vệ | "Sao chép tất cả" + QR + khối "Bạn được bảo vệ bởi ký quỹ X₫" (UX-P0-2) |
| Chờ xác nhận/chi trả | Bồn chồn | Banner tĩnh "⏳ Chờ..." vô hạn | Tiến trình + đồng hồ SLA + nút khiếu nại xuất hiện đúng lúc |
| Hoàn tất | Nhẹ nhõm | Kết thúc cụt, không có vòng đánh giá | Màn 🎉 + đánh giá + "gửi lại lần nữa" (repeat flow) |

## D.3. Đánh giá theo 10 heuristics Nielsen (tóm tắt điểm chính)

| Heuristic | Đánh giá v1.0 | Vấn đề tiêu biểu |
|---|---|---|
| 1. Hiển thị trạng thái hệ thống | ◐ | Có badge/banner nhưng **không có chiều thời gian** (không ETA, không đếm ngược) |
| 2. Khớp với thế giới thực | ◐ | 10 mã trạng thái kỹ thuật lộ ra tư duy hệ thống; người dùng chỉ nghĩ theo 4 pha: *Chờ nhận → Tôi chuyển → Họ chuyển → Xong* |
| 3. Kiểm soát & tự do | ✗ | Xóa deal/tài khoản không xác nhận; không sửa được deal; hủy yêu cầu không hỏi lại |
| 4. Nhất quán & chuẩn | ✗ | 2 bộ nhãn badge song song; xóa có/không xác nhận tùy phía; `pending` vs `waiting_accept` |
| 5. Phòng lỗi | ✗ | Memo gõ tay — nguồn tranh chấp số 1; xác nhận không đảo ngược chỉ là 1 nút thường |
| 6. Nhận ra thay vì nhớ lại | ✓ | Tài khoản đã lưu, chip chọn nhanh — làm tốt |
| 7. Linh hoạt & hiệu quả | ◐ | Có "Tỷ giá thị trường", chọn nhanh; thiếu "Đăng lại deal", "Gửi lại yêu cầu cũ" |
| 8. Tối giản thẩm mỹ | ◐ | Màn chi tiết giao dịch dồn quá nhiều khối; cần progressive disclosure |
| 9. Giúp nhận diện & phục hồi lỗi | ✗ | "Nhà cung cấp từ chối. Thử tìm deal khác." — không lý do, không lối phục hồi 1 chạm |
| 10. Trợ giúp & tài liệu | ✗ | Không có giải thích escrow/phí/khiếu nại tại chỗ |

## D.4. Khuyến nghị xếp ưu tiên

### P0 — Bắt buộc trước khi có giao dịch thật (an toàn & niềm tin)

| Mã | Khuyến nghị | Thiết kế cụ thể |
|---|---|---|
| **UX-P0-1** | **Minh bạch tổng chi phí từ Bước 1** | Khối ước tính 3 dòng: Tiền gửi → Phí 0,5% → **Tổng phải chuyển**, và "Người nhận thực nhận ≈ X" — đồng nhất tới card deal và màn xác nhận |
| **UX-P0-2** | **Triệt tiêu lỗi nhập liệu khi chuyển tiền** | Màn thanh toán: (a) khối thông tin chuyển khoản dạng "phiếu lệnh" với từng dòng copy riêng + nút **"Sao chép tất cả"**; (b) **mã QR** nhúng số tiền + memo (VietQR...); (c) memo hiển thị cỡ chữ lớn, nền nổi bật, cấm xuống dòng |
| **UX-P0-3** | **Nghi thức cho hành động không thể đảo ngược** | "Xác nhận đã nhận đủ" (Provider) và "Hoàn tất" (Requester): bottom-sheet xác nhận nêu hệ quả + checkbox chủ động + nút giữ-để-xác-nhận hoặc delay 3s — ma sát có chủ đích đúng chỗ |
| **UX-P0-4** | **Khối "Bạn được bảo vệ" tại điểm lo âu đỉnh** | Trên màn thanh toán: thẻ nhỏ "🛡 Nhà cung cấp đã ký quỹ {X}. Nếu có tranh chấp, đội trọng tài xử lý trong 48h." + link chính sách — trả lời câu hỏi số 3 đúng lúc cần |
| **UX-P0-5** | **Đồng hồ & lượt đi hiển thị thường trực** | Header màn chi tiết: avatar 2 bên + mũi tên "lượt của {ai}" + countdown SLA pha hiện tại. Quá 80% thời gian → đổi màu cảnh báo |
| **UX-P0-6** | **Nhất quán mẫu xác nhận hủy hoại** | Một component AlertDialog duy nhất cho mọi thao tác xóa/hủy ở cả 2 vai trò: tiêu đề nêu hệ quả, nút hành động màu đỏ bên phải, nút thoát mặc định focus |

### P1 — Trước khi mở rộng người dùng (hiểu & phục hồi)

| Mã | Khuyến nghị | Thiết kế cụ thể |
|---|---|---|
| **UX-P1-1** | **Mô hình tinh thần 4 pha phủ lên 12 trạng thái** | Stepper cố định 4 bước: ① Ghép nối ② Bạn chuyển tiền ③ Nhà cung cấp chuyển ④ Hoàn tất — mã trạng thái chỉ là chú thích phụ. Trạng thái đóng (rejected/expired/...) hiển thị overlay kết cục thay vì stepper |
| **UX-P1-2** | **Từ chối có lý do + phục hồi 1 chạm** | "Bị từ chối: Tỷ giá đã thay đổi" + nút "Tìm deal tương tự với yêu cầu này" (mang theo toàn bộ dữ liệu đã nhập) |
| **UX-P1-3** | **Trang trạng thái rỗng có việc để làm** | Mỗi empty state = 1 minh họa + 1 câu + 1 CTA (đã có một phần; chuẩn hóa toàn bộ) |
| **UX-P1-4** | **Card deal nâng cấp tín hiệu tin cậy** | Dòng hành vi: "Đúng hạn 98% · Phản hồi trung bình 12 phút · 32 GD/30 ngày"; nhãn cảnh báo nhẹ cho Provider đang quá SLA |
| **UX-P1-5** | **Giải thích tại chỗ (tooltip/bottom-sheet)** | Icon ⓘ cạnh "Ký quỹ", "Phí", "Khiếu nại" mở giải thích 3 câu + 1 hình; lần đầu vào luồng có coach-mark 3 bước |
| **UX-P1-6** | **Luồng lặp lại (repeat remittance)** | Sau hoàn tất & trên Trang chủ Requester: "Gửi lại cho {người thụ hưởng}" — 1 chạm dựng sẵn Bước 1; đây là use case tần suất cao nhất của kiều hối |
| **UX-P1-7** | **Upload bằng chứng tối ưu mobile** | Mở camera trực tiếp, nén ảnh client, hiển thị tiến trình tải, cho phép nộp khi mạng yếu (retry queue); cảnh báo khi ảnh mờ/không đọc được số |

### P2 — Tinh chỉnh & hệ thống hóa

| Mã | Khuyến nghị |
|---|---|
| **UX-P2-1** | **Design system tokens**: bảng màu semantic cho trạng thái (Phụ lục A) — một trạng thái một màu trên mọi màn hình; kiểm tra tương phản WCAG AA (đặc biệt badge vàng/cam trên nền sáng); không truyền nghĩa chỉ bằng màu (luôn kèm icon + chữ) |
| **UX-P2-2** | **Typography số tiền**: font số tabular, phân tách hàng nghìn theo locale, cỡ lớn cho số tiền chính; tiền tệ luôn kèm cờ + mã ISO để tránh nhầm corridor |
| **UX-P2-3** | **Khả năng tiếp cận**: vùng chạm ≥ 44px; hỗ trợ screen reader cho stepper & countdown (aria-live polite); không dùng emoji làm vật mang nghĩa duy nhất trong nút |
| **UX-P2-4** | **Skeleton & optimistic UI** cho danh sách deal/yêu cầu; trạng thái offline có thông điệp + retry |
| **UX-P2-5** | **Thông điệp thời gian**: giữ thời gian tương đối (BR-28) nhưng kèm tuyệt đối khi chạm/hover ("2 giờ trước · 12/06 10:15") — quan trọng cho đối soát |
| **UX-P2-6** | **Màn 🎉 hoàn tất** thành khoảnh khắc giá trị: tổng kết tiết kiệm so kênh truyền thống ("Bạn tiết kiệm ≈ $18 so với phí ngân hàng"), CTA đánh giá + gửi lại |
| **UX-P2-7** | **Provider dashboard hành động trước, số liệu sau**: khối đầu tiên là "Cần xử lý ngay" (yêu cầu chờ + giao dịch sắp quá SLA, sắp theo hạn), số liệu thu nhập xuống dưới |
| **UX-P2-8** | **Dark mode & một ngôn ngữ hình ảnh**: chuẩn hóa icon set (bỏ trộn emoji/icon tùy tiện trong nút hành động chính — emoji giữ cho banner cảm xúc, icon hệ thống cho hành động) |

## D.5. Microcopy — nguyên tắc & ví dụ sửa

Nguyên tắc: **chủ động – nói rõ ai làm gì tiếp theo – kèm thời gian – kèm bảo vệ**.

| Ngữ cảnh | v1.0 | v2.0 đề xuất |
|---|---|---|
| Chờ chấp nhận | "⏳ Chờ nhà cung cấp chấp nhận" | "Đã gửi tới Hùng Mạnh — thường phản hồi trong ~12 phút. Hết hạn sau 1:47:20." |
| Bị từ chối | "Nhà cung cấp từ chối. Thử tìm deal khác." | "Hùng Mạnh từ chối: *Tỷ giá đã thay đổi*. → Tìm deal tương tự (giữ nguyên thông tin bạn đã nhập)" |
| Trước chuyển tiền | "⚠️ Vui lòng điền chính xác {memo}..." | "Bước quan trọng nhất: dán đúng mã **RQ-7K2M9** vào nội dung chuyển khoản — đây là cách hệ thống bảo vệ giao dịch của bạn. [Sao chép tất cả] [Quét QR]" |
| Chờ Provider chi trả | "🔄 Nhà cung cấp đang chuyển tiền cho {tên}..." | "Hùng Mạnh đang chuyển 7.650.000₫ cho mẹ bạn qua MB Bank — cam kết trước 14:30. Bạn sẽ nhận thông báo kèm bằng chứng." |
| Phí | "💸 Platform fee — thu ngay, không hoàn trả" | "Phí hệ thống 0,5% ($2,50) — chỉ thu khi giao dịch hoàn tất" |
| Xác nhận hoàn tất | "✓ Đã nhận đủ tiền {tiền tệ} - Hoàn tất" | Bottom-sheet: "Xác nhận mẹ bạn đã nhận đủ **7.650.000₫**? Hành động này hoàn tất giao dịch và không thể hoàn tác. ☑ Tôi đã kiểm tra với người nhận → [Giữ để xác nhận]" |

## D.6. Khoảng trống nghiên cứu cần làm trước M2

1. **Usability test** màn thanh toán (n≥8, người dùng kiều hối thật): đo tỷ lệ sai memo có/không QR.
2. **Phỏng vấn Provider** về ngưỡng ký quỹ chấp nhận được & độ nhạy với SLA phạt.
3. **A/B microcopy** khối "Bạn được bảo vệ" — đo tỷ lệ hoàn tất bước thanh toán.
4. **Card sorting** nhãn 4 pha (D.4 UX-P1-1) bằng tiếng Việt với người dùng không rành công nghệ.

---

*Tài liệu v2.0 được lập trên cơ sở phân tích toàn diện tài liệu v1.0 và prototype; mọi thay đổi được truy vết về 13 Open Issues gốc qua bảng Quyết định then chốt. Phê duyệt: Product Owner ▢ · Pháp chế ▢ · Kỹ thuật ▢ · Vận hành ▢.*
