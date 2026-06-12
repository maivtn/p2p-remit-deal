# P2P Remit Deals — UX/UI Screen Specification & Text Wireframes v4.0

**Loại tài liệu:** UX Screen Specification / Wireframe Text / UI Blueprint  
**Nguồn nghiệp vụ:** BA Final v4.0 — P2P Remit Deals Implementation Ready  
**Mục tiêu:** biến tài liệu BA thành bộ mô tả màn hình đủ chi tiết để UX/UI Designer dựng Figma, Frontend bóc component, QA đối chiếu acceptance UI.  
**Phạm vi thiết kế:** MVP/M1 + các màn P1 cần thiết để luồng giao dịch thật có thể vận hành an toàn.  
**Nền tảng:** Mobile app cho Requester & Provider; Web console cho Admin/Trọng tài.  
**Nguyên tắc:** tài liệu này không thay Legal/Compliance; mọi màn hình liên quan tiền thật phải tuân thủ hard gates của BA v4: KYC, ví/ledger, ký quỹ Provider, SLA, proof, dispute và audit log.

---

## 0. Tư duy UX chủ đạo

P2P Remit Deals là sản phẩm tài chính có điểm lo âu cao: Requester phải chuyển tiền thật cho một Provider bên ngoài hệ thống, còn Provider phải chi trả đúng cho Beneficiary và chịu ký quỹ. Vì vậy thiết kế phải trả lời rõ 3 câu hỏi ở mọi màn hình quan trọng:

| Câu hỏi người dùng | Cách UI phải trả lời |
|---|---|
| **Chuyện gì đang xảy ra?** | Hiển thị trạng thái nghiệp vụ bằng nhãn dễ hiểu, stepper 4 pha, timeline và proof. |
| **Ai đang cầm lượt?** | Header chi tiết request luôn có `Lượt của ai` + countdown SLA. |
| **Tôi được bảo vệ thế nào?** | Màn thanh toán có khối “Bạn được bảo vệ”, ký quỹ Provider, SLA phân xử, proof/memo/copy/QR. |

### 0.1. Design principles

| Principle | Áp dụng cụ thể |
|---|---|
| Trust-first | Ký quỹ, KYC, rating, on-time rate, proof và dispute phải hiển thị đúng lúc, không giấu trong profile. |
| Action-first | Dashboard ưu tiên việc cần xử lý trước số liệu đẹp. |
| One primary action | Mỗi trạng thái sống chỉ có 1 CTA chính; CTA phụ không cạnh tranh thị giác. |
| Prevent mistakes | Memo lớn, copy all, QR, confirm 2 bước cho hành động không đảo ngược. |
| Progressive disclosure | Màn detail chia khối gấp/mở: Tóm tắt → Hành động → Proof → Chat → Chi tiết người nhận. |
| Mask by default | Số điện thoại/tài khoản/proof chỉ lộ đủ khi đúng ngữ cảnh hành động. |
| Mobile-first for money movement | Requester/Provider thao tác trên mobile; Admin xử lý case trên desktop. |

---

## 1. Information Architecture tổng quan

### 1.1. Role và kênh giao diện

| Role | Kênh chính | Navigation chính | Mục tiêu UI |
|---|---|---|---|
| Requester | Mobile app | Bottom tabs: **Gửi tiền · Yêu cầu · Liên kết · Hồ sơ** | Tạo request nhanh, thanh toán đúng memo, theo dõi và khiếu nại an toàn. |
| Provider | Mobile app | Bottom tabs: **Trang chủ · Deals · Yêu cầu · Hồ sơ/Ví** | Nhìn việc cần xử lý, quản lý deal, xác nhận tiền vào, chi trả, quản lý ký quỹ. |
| Admin/Trọng tài | Desktop web | Sidebar: **Disputes · Users · Deals · Ledger · Risk · Config** | Phân xử tranh chấp, xem evidence, thực thi outcome, giám sát rủi ro. |
| Common/System | Mobile + Web | Auth/KYC, Notification, Help, Settings | Đảm bảo quyền truy cập, thông báo và trợ giúp nhất quán. |

### 1.2. Screen map MVP

![Screen map](ux_ui_v4/mockup_00_screen_map.png)

### 1.3. State-to-screen mapping

| Request status | Requester screen/action chính | Provider screen/action chính | Admin screen/action chính |
|---|---|---|---|
| `pending_acceptance` | Request detail: chờ Provider; có hủy + countdown T1 | Request review: accept/reject + collateral preview | Không cần |
| `accepted` | Payment instruction: chuyển tiền, copy all, QR, upload proof | Chờ Requester thanh toán | Không cần |
| `payment_sent` | Tracking: chờ Provider xác nhận; có dispute nếu cần | Confirm payment: xem proof, xác nhận hoặc mở dispute | Escalation nếu quá T3 |
| `payment_confirmed` | Tracking: Provider đang chuyển | Transfer instruction: chi trả Beneficiary + upload proof | Escalation nếu quá T4 |
| `transfer_sent` | Confirm completed hoặc dispute | Chờ Requester xác nhận, có dispute | Escalation nếu quá T5 |
| `disputed` | Dispute detail + chat 3 bên | Dispute detail + bổ sung evidence | Case workbench + decision panel |
| `completed` | Success + rating + repeat remittance | Success + rating + ledger summary | Không cần |
| `rejected/expired/cancelled/resolved` | Closed result + CTA phục hồi phù hợp | Closed result + record | Resolved/appeal nếu có |

---

## 2. Design System Blueprint

### 2.1. Color tokens đề xuất

| Token | Màu | Dùng cho |
|---|---|---|
| `primary` | #2563EB | CTA chính, active tab, link. |
| `teal` | #0F766E | Money movement thành công, Provider action. |
| `success` | #16A34A | Completed, verified, proof accepted. |
| `warning` | #F59E0B | Countdown gần hết, pending, SLA warning. |
| `danger` | #EF4444 | Reject, dispute, destructive action. |
| `purple` | #7C3AED | Proof/payment_sent, Admin focus. |
| `bg` | #F4F7FB | App background. |
| `card` | #FFFFFF | Card container. |
| `text` | #111827 | Text chính. |
| `muted` | #6B7280 | Secondary text. |
| `line` | #E5E7EB | Divider/border. |

### 2.2. Typography

| Loại text | Mobile | Desktop Admin | Ghi chú |
|---|---:|---:|---|
| Page title | 22–24px semibold | 26–30px semibold | Không quá dài; ưu tiên động từ. |
| Section title | 15–17px semibold | 17–20px semibold | Trong card. |
| Body | 13–15px regular | 14–15px regular | Dễ đọc trên mobile. |
| Caption | 11–12px regular | 12px regular | Trạng thái, helper text. |
| Money number | 18–28px semibold/monospace | 18–30px | Dùng tabular number nếu có. |
| Memo/ref code | 16–20px bold/mono | 14–18px mono | Không xuống dòng; có copy riêng. |

### 2.3. Component inventory

| Component | Biến thể | Quy tắc |
|---|---|---|
| App Header | Basic, detail with actor/timer | Detail request bắt buộc có status + current actor + timer. |
| Status Badge | waiting/action/progress/success/danger/warning | Không truyền nghĩa chỉ bằng màu; luôn có text. |
| Four-step Stepper | Ghép nối → Bạn chuyển → Provider chuyển → Hoàn tất | Che phức tạp state machine kỹ thuật. |
| Money Summary Card | Compact/expanded | Luôn có fee và total payable từ đầu luồng. |
| Deal Card | Recommended, warning, disabled | Có provider trust signal, rate, receive amount, SLA, CTA. |
| Transfer Ticket | Provider account, amount, memo, QR | Có copy từng dòng + copy all. |
| Proof Card | Payment/transfer/dispute | Immutable, có ref, timestamp, file preview. |
| Action Bottom Sheet | Confirm received, complete, delete, reject | Dùng confirm 2 bước cho irreversible/destructive. |
| Dispute Form | Requester/Provider | Bắt buộc category, note, evidence; hiển thị SLA 48h. |
| Admin Decision Panel | R1/R2/R3/R4 | Preview ledger effect trước khi confirm. |
| Wallet Card | Available/locked/frozen | Dùng cho Provider và Admin ledger. |
| Empty State | No deals/no requests/no accounts | 1 câu giải thích + 1 CTA phục hồi. |

### 2.4. Interaction rules chung

1. CTA chính đặt cuối màn hình hoặc sticky bottom, không để người dùng phải tìm.
2. Trạng thái loading cho danh sách dùng skeleton; thao tác tài chính dùng disabled + spinner + idempotency.
3. Error nghiệp vụ cần nói rõ cách sửa: “Thiếu tài khoản Zelle để đăng deal — Thêm tài khoản”.
4. Hành động `accept`, `confirm_payment_received`, `complete_request`, `resolve_dispute`, `delete` phải có confirmation.
5. Mọi màn thanh toán/chi trả có copy action đều ghi audit event khi unmask/copy dữ liệu nhạy cảm.

---

# 3. Common / System Screens

## C-00. Role Selection / App Entry

| Thuộc tính | Nội dung |
|---|---|
| Mục tiêu | Cho người dùng chọn vai trò khi đăng nhập lần đầu hoặc chuyển role được phép. |
| Entry | Sau onboarding/login hoặc từ profile role switch. |
| Exit | Requester App hoặc Provider App. |
| Priority | P1, nhưng cần cho prototype/pilot nếu 1 user có thể có nhiều role. |

**Wireframe text**

```text
[P2P Remit Deals]
Chuyển tiền ngang hàng an toàn hơn

[Card] Tôi cần gửi tiền
Tìm deal tốt, gửi request, theo dõi người nhận.
CTA: Vào Requester App

[Card] Tôi là Provider
Đăng deal, nhận yêu cầu, chi trả, quản lý ký quỹ.
CTA: Vào Provider App

Footer: An toàn bằng KYC · Ký quỹ · Proof · Trọng tài
```

**UX notes**

- Nếu user chưa đạt tier tương ứng, CTA chuyển thành “Hoàn tất KYC để dùng vai trò này”.
- Không dùng thuật ngữ “Requester” ở UI đại chúng; dùng “Người gửi”.

## C-01. Login / OTP

```text
[Title] Đăng nhập
[Input] Số điện thoại hoặc email
[CTA] Gửi mã OTP
[Secondary] Tiếp tục bằng Google/Apple nếu hỗ trợ
[Help] Vì giao dịch tài chính, chúng tôi cần xác minh thiết bị của bạn.
```

**States**: nhập sai OTP, resend countdown, device trust warning, account locked.

## C-02. KYC Tier Status

```text
[Title] Xác minh tài khoản
[Progress] T0 -> T1 -> T2

[Card T1] Gửi tiền
Yêu cầu: giấy tờ tùy thân + liveness
Hạn mức: ≤ $1.000/GD · ≤ $5.000/30 ngày
CTA: Bắt đầu xác minh T1

[Card T2] Trở thành Provider
Yêu cầu: T1 + địa chỉ + nguồn tiền + tài khoản chính chủ
CTA: Nâng cấp T2
```

**Rules**

- Nếu đang tạo request mà chưa T1: hiển thị blocking modal.
- Nếu Provider chưa T2 hoặc ví chưa nạp: dashboard hiển thị checklist thay vì list yêu cầu.

## C-03. Notification Center

```text
[Title] Thông báo
[Filters] Tất cả · Tài chính · SLA · Khiếu nại · Rating

[List Item]
Yêu cầu RQ-7K2M9 đã được chấp nhận
Bạn có 60 phút để chuyển tiền.
CTA deep-link: Mở màn thanh toán
```

**Events bắt buộc**: request mới, accept/reject, proof uploaded, confirmation, SLA reminder, dispute opened/resolved, rating reminder.

---

# 4. Requester Mobile App

## 4.1. Requester navigation

| Tab | Mục tiêu | P0 screens |
|---|---|---|
| Gửi tiền | Tạo request từ nhu cầu | R-01, R-02, R-03, R-04 |
| Yêu cầu | Theo dõi/chuyển tiền/khiếu nại/hoàn tất | R-05, R-06, R-07, R-08, R-09, R-10, R-11 |
| Liên kết | Quản lý Beneficiary account | R-12 |
| Hồ sơ | KYC, rating, settings, help | R-13 |

## R-01. Gửi tiền — Step 1: Nhập nhu cầu

![Requester Send Money](ux_ui_v4/mockup_R01_requester_send_money.png)

| Thuộc tính | Nội dung |
|---|---|
| Mục tiêu | Requester nhập số tiền, phương thức và Beneficiary để hệ thống tìm deal. |
| Entry | Tab Gửi tiền; CTA “Gửi lại” từ completed; CTA “Tìm deal tương tự”. |
| Exit | R-02 Deal Results. |
| Key UX | Minh bạch fee/total payable ngay từ đầu; giảm nhầm phương thức/người nhận. |

**Layout anatomy**

1. Header: “Bạn muốn gửi tiền đi đâu?” + KYC/hạn mức nếu cần.
2. Card Số tiền chuyển: tiền tệ gửi, amount, tiền tệ nhận, estimated receive.
3. Card Tổng chi phí: tiền gửi, phí 0,5%, tổng phải chuyển, người nhận dự kiến.
4. Card Hình thức: “Bạn trả qua”, “Người nhận nhận qua”.
5. Card Beneficiary: chọn tài khoản đã lưu hoặc nhập mới.
6. Note cho Provider: optional, collapsed by default.
7. Sticky CTA: “Tìm deal phù hợp”.

**Wireframe text**

```text
HEADER
Bạn muốn gửi tiền đi đâu?
Nhập nhu cầu - hệ thống tìm deal tốt nhất

CARD: Số tiền chuyển
Bạn gửi [USD v] [500]
Người nhận sẽ nhận bằng [VND v]
1 USD ≈ 25.500 VND · tỷ giá thực theo deal

CARD: Tổng chi phí
Tiền gửi                 $500.00
Phí hệ thống 0,5%          $2.50
Tổng phải chuyển         $502.50
Người nhận dự kiến       12.750.000 VND

CARD: Hình thức & người nhận
Bạn trả Provider qua      [Zelle v]
Người nhận nhận qua       [Bank Transfer v]
Tài khoản nhận            [Mẹ - Vietcombank ****1234]
[+ Thêm người nhận mới]

CTA: Tìm deal phù hợp
```

**Validation & states**

| Case | UI response |
|---|---|
| Amount rỗng/≤0 | Inline error: “Nhập số tiền hợp lệ”. |
| Vượt hạn mức KYC | Blocking card: “Hạn mức T1 là $1.000/GD — Nâng cấp KYC”. |
| Chưa có Beneficiary phù hợp | Empty selector + CTA “Thêm tài khoản nhận”. |
| Method đổi | Clear các field method-specific nhưng giữ tên Beneficiary nếu đã nhập. |
| No internet | Disable CTA, show offline banner. |

## R-02. Gửi tiền — Step 2: Deal Results

![Requester Deal Results](ux_ui_v4/mockup_R02_requester_deal_results.png)

| Thuộc tính | Nội dung |
|---|---|
| Mục tiêu | So sánh deal theo số nhận thực, tốc độ và độ tin cậy. |
| Entry | R-01 validate thành công. |
| Exit | R-03 Request Confirmation. |

**Card deal bắt buộc có**

| Khu | Nội dung |
|---|---|
| Provider identity | Tên, avatar, verified, KYC tier nếu cần, rating, số GD. |
| Trust signal | On-time rate, response time, dispute/open SLA warning. |
| Economics | Rate, người nhận thực nhận, total payable, fee. |
| Fit | Method match badge, SLA transfer, corridor. |
| Action | CTA “Chọn deal này”. |

**Wireframe text**

```text
HEADER: Chọn deal
3 deal phù hợp USD -> VND

FILTER CHIPS: Nhận nhiều nhất · Nhanh nhất · Rating cao · Đúng hạn

DEAL CARD
Hùng Mạnh ✓
4,9★ · 512 GD · Đúng hạn 98% · Phản hồi ~12 phút
Badge: Khớp 100% hình thức thanh toán
Tỷ giá: 25.520
Người nhận: 12.760.000 VND
Tổng phải chuyển: $502.50
SLA: 30-60 phút
CTA: Chọn deal này

SECTION: Deal gần đúng số tiền
Card disabled + CTA: Sửa số tiền
```

**Empty state**

```text
Chưa có deal USD -> VND phù hợp
Thử đổi số tiền, phương thức hoặc bật thông báo khi có deal mới.
CTA: Thay đổi yêu cầu
Secondary: Báo tôi khi có deal
```

## R-03. Gửi tiền — Step 3: Xác nhận yêu cầu

| Thuộc tính | Nội dung |
|---|---|
| Mục tiêu | Cho Requester kiểm tra lần cuối trước khi gửi request. |
| Entry | Chọn deal từ R-02. |
| Exit | Request detail `pending_acceptance`. |

**Wireframe text**

```text
HEADER: Xác nhận yêu cầu
Kiểm tra kỹ trước khi gửi

CARD: Nhà cung cấp
Hùng Mạnh ✓ · 4,9★ · Đúng hạn 98% · Phản hồi ~12 phút

CARD: Luồng giao dịch
Bạn chuyển: $502.50 qua Zelle
Provider chi trả: 12.760.000 VND qua Vietcombank
Tỷ giá áp dụng: 1 USD = 25.520 VND
Provider SLA: 30-60 phút sau khi xác nhận nhận tiền

CARD: Người thụ hưởng
Nguyễn Thị M
Vietcombank · ****1234

CARD: Cam kết thời gian
Sau khi Provider chấp nhận, bạn có 60 phút để chuyển tiền.
Nếu quá hạn, request sẽ hết hạn và Provider được mở ký quỹ.

INPUT: Ghi chú cho Provider (optional)
CTA: Gửi yêu cầu
```

**Confirmation behavior**

- Sau khi gửi: hiển thị toast “Đã gửi yêu cầu tới Hùng Mạnh” và điều hướng sang R-05/R-08 detail.
- Header detail lúc này: “Chờ Provider chấp nhận · hết hạn sau 01:59:40”.

## R-04. Yêu cầu — Request List

| Thuộc tính | Nội dung |
|---|---|
| Mục tiêu | Theo dõi các request theo nhóm trạng thái. |
| Entry | Tab Yêu cầu. |
| Exit | R-05/R-06/R-08 theo status. |

**Wireframe text**

```text
HEADER: Yêu cầu của tôi
Theo dõi trạng thái chuyển tiền

FILTER TABS
Đang xử lý (2) · Chờ chấp nhận (1) · Hoàn thành (8) · Đã đóng (3)

REQUEST CARD
RQ-7K2M9 · Hùng Mạnh ✓
Status: Chờ bạn chuyển tiền · còn 48:12
Bạn chuyển: $502.50 -> Mẹ nhận: 12.760.000 VND
CTA: Mở thanh toán

REQUEST CARD
RQ-6A1T2
Status: Provider đang chuyển · còn 01:20
CTA: Theo dõi
```

**Empty states**

- Đang xử lý trống: “Bạn chưa có giao dịch đang xử lý” + CTA “Gửi tiền”.
- Đã đóng trống: “Chưa có giao dịch đã đóng”.

## R-05. Request Detail — Header/Tracking chung

![Requester Tracking](ux_ui_v4/mockup_R04_requester_tracking.png)

| Thuộc tính | Nội dung |
|---|---|
| Mục tiêu | Màn trung tâm cho mọi trạng thái request. |
| Key UX | Header luôn nói rõ status, actor đang cầm lượt, countdown. |

**Layout anatomy**

1. Header: request code, status, current actor, countdown, risk/protection icon.
2. Stepper 4 pha.
3. Action card theo trạng thái.
4. Summary card: amount, fee, receive amount, Provider, Beneficiary.
5. Proof sections: payment proof, transfer proof, dispute proof.
6. Chat thread preview.
7. Secondary links: timeline, policy, help.

**Wireframe text**

```text
HEADER
RQ-7K2M9
Provider đang chuyển cho người nhận
Lượt của Provider · còn 01:20

STEPPER
① Ghép nối ✓  ② Bạn chuyển ✓  ③ Provider chuyển ●  ④ Hoàn tất ○

ACTION CARD
Hùng Mạnh đang chuyển 12.760.000 VND cho Nguyễn Thị M qua Vietcombank.
Bạn sẽ nhận thông báo khi Provider tải bằng chứng.
CTA phụ: Khiếu nại nếu quá SLA

SUMMARY
Bạn đã chuyển: $502.50
Người nhận sẽ nhận: 12.760.000 VND
Memo: RQ-7K2M9 [Copy]

PROOF
Bằng chứng thanh toán của bạn: Đã xác nhận
Bằng chứng Provider: Đang chờ

CHAT PREVIEW
Hệ thống: Provider đã xác nhận nhận tiền lúc 12:10
```

## R-06. Payment Instruction — Chuyển tiền cho Provider

![Requester Payment Instruction](ux_ui_v4/mockup_R03_requester_payment_instruction.png)

| Thuộc tính | Nội dung |
|---|---|
| Status | `accepted` |
| Mục tiêu | Requester chuyển tiền đúng số tiền/tài khoản/memo và upload proof. |
| Risk | Màn lo âu cao nhất; phải giảm lỗi nhập liệu và tăng niềm tin. |

**Wireframe text**

```text
HEADER
Thanh toán cho Provider
RQ-7K2M9 · Còn 48:12 để chuyển tiền

PROTECTION CARD
Bạn được bảo vệ
Hùng Mạnh đã ký quỹ 12.9M VND. Nếu có tranh chấp, đội trọng tài xử lý trong 48h.
Link: Chính sách bảo vệ giao dịch

TRANSFER TICKET
Chuyển cho: Hùng Mạnh qua Zelle
Số tiền: $502.50 [Copy]
Tài khoản: (+1) *** *** 7890 [Copy]
Memo/Nội dung: RQ-7K2M9 [Copy]
QR: [QR code]
CTA: Sao chép tất cả

WARNING
Dán đúng memo RQ-7K2M9 vào nội dung chuyển khoản. Sai memo có thể làm chậm xác nhận.

CTA PRIMARY
Đã chuyển tiền & tải bằng chứng
```

**Interactions**

| Action | Expected behavior |
|---|---|
| Copy all | Copy formatted text: amount + account + memo; show toast; audit copy event. |
| QR tap | Mở QR full screen; có brightness hint. |
| Upload proof | Mở R-07 Proof Modal. |
| Deadline passed | Disable upload nếu policy không cho late proof; request expired; show closed state. |

## R-07. Proof Upload Modal

| Thuộc tính | Nội dung |
|---|---|
| Dùng cho | paymentProof, transferProof, disputeProof. |
| Mục tiêu | Nộp bằng chứng đủ chất lượng, không bị mất khi mạng yếu. |

**Wireframe text**

```text
BOTTOM SHEET: Tải bằng chứng thanh toán
Bạn đã chuyển $502.50 qua Zelle?

[Camera] Chụp ảnh biên nhận
[Upload] Chọn ảnh/video/audio
Preview file 1: receipt.jpg · rõ nét
Input: Ghi chú/mã giao dịch ngân hàng
CTA: Nộp bằng chứng
Secondary: Lưu nháp nếu mạng yếu
```

**Rules**

- Hợp lệ khi có ít nhất 1 file hoặc note khác rỗng.
- Sau submit proof là immutable; chỉ Admin cho bổ sung proof dispute mới.
- Nếu ảnh mờ: warning “Ảnh có thể khó đọc, bạn vẫn muốn nộp?”.

## R-08. Confirm Completion Bottom Sheet

| Thuộc tính | Nội dung |
|---|---|
| Status | `transfer_sent` |
| Mục tiêu | Xác nhận Beneficiary đã nhận đủ, tránh bấm nhầm. |

**Wireframe text**

```text
BOTTOM SHEET
Xác nhận Nguyễn Thị M đã nhận đủ 12.760.000 VND?

Hành động này hoàn tất giao dịch, thu phí và mở ký quỹ Provider. Không thể hoàn tác.

[ ] Tôi đã kiểm tra với người nhận và xác nhận đã nhận đủ tiền.
CTA disabled until checked: Giữ để xác nhận hoàn tất
Secondary: Chưa nhận đủ / Khiếu nại
```

## R-09. Completed + Rating

![Requester Completed Rating](ux_ui_v4/mockup_R05_requester_completed_rating.png)

**Wireframe text**

```text
SUCCESS
Giao dịch hoàn tất!
Mẹ đã nhận 12.760.000 VND

SUMMARY
Phí hệ thống: $2.50
Ký quỹ Provider: Đã mở khóa
Thời gian xử lý: 52 phút

RATING
Đánh giá Hùng Mạnh
[★ ★ ★ ★ ★]
Tags: Nhanh · Đúng cam kết · Dễ đối soát
Comment optional
CTA: Gửi đánh giá
Secondary CTA: Gửi lại cho mẹ
```

## R-10. Dispute Form

| Thuộc tính | Nội dung |
|---|---|
| Status | `payment_sent`, `payment_confirmed`, `transfer_sent`. |
| Mục tiêu | Gửi khiếu nại có cấu trúc để Admin xử nhanh. |

**Wireframe text**

```text
HEADER: Khiếu nại giao dịch
Case sẽ được xử lý trong 48h

CATEGORY REQUIRED
( ) Provider không chi trả
( ) Chi thiếu
( ) Chi sai người nhận
( ) Quá SLA
( ) Khác

DESCRIPTION
Mô tả vấn đề...

EVIDENCE
+ Thêm bằng chứng / sao kê / ảnh chat

INFO BOX
Ký quỹ Provider đang được freeze cho đến khi Admin ra phán quyết.

CTA: Gửi khiếu nại
```

## R-11. Linked Accounts / Beneficiary Accounts

| Thuộc tính | Nội dung |
|---|---|
| Mục tiêu | Lưu người nhận thường dùng, tự điền ở R-01. |

**Wireframe text**

```text
HEADER: Tài khoản liên kết
6 tài khoản · 3 loại tiền
CTA: + Thêm tài khoản

GROUP: VND
[Card]
Mẹ - Vietcombank
Nguyễn Thị M · VCB ****1234
Actions: Copy · Sửa · Xóa

[Card]
Em trai - MoMo
Nguyễn Văn C · 09**•••89
Actions: Copy · Sửa · Xóa

FORM ADD/EDIT
Loại tiền tệ [VND]
Hình thức [Bank Transfer]
Tên gợi nhớ [Mẹ - VCB]
Tên chủ tài khoản
Ngân hàng
Số tài khoản
CTA: Lưu tài khoản
```

**Destructive confirmation**: “Xóa tài khoản này? Tài khoản đang dùng trong request sống sẽ không thể xóa.”

## R-12. Requester Profile

```text
HEADER: Hồ sơ
Nguyễn Văn A · KYC T1
Rating: 4,7★ · 12 giao dịch · Đúng hạn 92%

CARDS
Hạn mức còn lại 30 ngày
Tài khoản liên kết
Lịch sử giao dịch
Bảo mật & thiết bị
Thông báo
Trợ giúp / Chính sách bảo vệ
Đăng xuất
```

---

# 5. Provider Mobile App

## 5.1. Provider navigation

| Tab | Mục tiêu | P0 screens |
|---|---|---|
| Trang chủ | Nhìn việc cần xử lý và ví | P-01 |
| Deals | Tạo/sửa/pause/repost deal | P-02, P-03 |
| Yêu cầu | Duyệt, xác nhận, chi trả, dispute | P-04, P-05, P-06, P-07, P-08 |
| Hồ sơ/Ví | Ví, ledger, account, KYC, profile | P-09, P-10, P-11 |

## P-01. Dashboard cần xử lý

![Provider Dashboard](ux_ui_v4/mockup_P01_provider_dashboard.png)

| Thuộc tính | Nội dung |
|---|---|
| Mục tiêu | Provider biết ngay giao dịch nào cần hành động trước khi xem số liệu. |
| Entry | Tab Trang chủ. |

**Wireframe text**

```text
HEADER
Xin chào, Nguyễn Văn B
Cần xử lý ngay trước, số liệu sau

WALLET CARD
Ví khả dụng: $3,850
Đang ký quỹ: $1,250
Freeze tranh chấp: $0
CTA: Nạp ví · Rút

SECTION: Cần xử lý ngay
[Request card]
RQ-7K2M9 · Chờ chấp nhận · còn 01:12
500 USD -> 12.76M VND
CTA: Xem & duyệt

[Request card]
RQ-6A1T2 · Đã có proof · còn 00:33
CTA: Đối soát

SECTION: Tổng quan
Deals mở · Hoàn tất · Đúng SLA · Rating
CTA: Tạo deal · Xem yêu cầu
```

**States**

- Chưa KYC T2: show checklist “Hoàn tất Provider KYC”.
- Ví không đủ mức tối thiểu: blocking card “Nạp ví để nhận request”.
- Không có việc cần xử lý: show “Bạn đang đúng hạn” + CTA tạo deal.

## P-02. Deals List

| Thuộc tính | Nội dung |
|---|---|
| Mục tiêu | Quản lý deal active/paused/expired, xem sức khỏe từng deal. |

**Wireframe text**

```text
HEADER: Deals của tôi
CTA: + Tạo deal

FILTERS: Tất cả · Hoạt động · Tạm dừng · Hết hạn · Cần chú ý

DEAL CARD
USD -> VND · Active
Rate: 25.520 · Market +0,08%
Limit: $50-$3.000 · SLA 1-2 giờ
Methods: Zelle, Bank -> MoMo, Bank
Today: 8 requests · Completion 98%
Actions: Sửa · Tạm dừng · Xem version
```

**Rules**

- Xóa deal = soft delete + confirm 2 bước.
- Deal có request sống không được delete, chỉ pause.
- Sửa deal tạo version mới, request cũ dùng snapshot.

## P-03. Deal Form — Tạo/Sửa deal

![Provider Deal Form](ux_ui_v4/mockup_P02_provider_deal_form.png)

**Wireframe text**

```text
HEADER: Tạo / sửa deal
Điều kiện mới tạo version riêng

FORM
Bạn nhận: [USD]
Bạn chi trả: [VND]
Tỷ giá: [25.520]
Market indicator: Lệch +0,08% so với thị trường
Hạn mức: Min [$50] Max [$3.000]
Phương thức nhận tiền: [Zelle] [Bank Transfer]
Phương thức chi trả: [MoMo] [Bank Transfer]
SLA chi trả: [1-2 giờ]
Hiệu lực: [14 ngày]
Ghi chú: optional

CAPACITY CHECK
Khả năng nhận tối đa theo ví: $3,850
Thiếu tài khoản Bank? Thêm trước khi lưu.

CTA: Lưu deal version mới
```

**Validation**

| Case | UI response |
|---|---|
| Rate lệch > ±3% | Warning, bắt xác nhận. |
| Rate lệch > ±10% | Blocking error. |
| Thiếu Provider account cho method | Blocking card + CTA “Thêm tài khoản”. |
| Max vượt collateral capacity | Error: “Ví khả dụng chỉ đủ nhận tối đa $X”. |

## P-04. Request List

```text
HEADER: Yêu cầu
FILTERS: Chờ chấp nhận · Đang xử lý · Hoàn thành · Khiếu nại/Đã đóng

REQUEST CARD
RQ-7K2M9 · Nguyễn Văn A · KYC T1
Status: Cần phản hồi · còn 01:12
Amount: $502.50 -> 12.76M VND
Signals: 4,7★ · 0 vi phạm SLA 30 ngày
CTA: Duyệt
```

## P-05. Request Review — Accept/Reject

![Provider Request Review](ux_ui_v4/mockup_P03_provider_request_review.png)

| Thuộc tính | Nội dung |
|---|---|
| Status | `pending_acceptance` |
| Mục tiêu | Provider ra quyết định có nhận giao dịch không. |

**Wireframe text**

```text
HEADER: Duyệt yêu cầu
RQ-7K2M9 · Chờ chấp nhận

REQUESTER TRUST
Nguyễn Văn A · KYC T1
4,7★ · 12 GD · Hủy/SLA 30 ngày: 0
Badge: Rủi ro thấp

OBLIGATION
Nhận từ Requester: $502.50 qua Zelle
Chi trả Beneficiary: 12.760.000 VND
Người nhận: Nguyễn Thị M · VCB ****1234
Memo: RQ-7K2M9

WHEN ACCEPT
Ký quỹ sẽ khóa: 12.9M VND
Phí Provider: $2.50 khi completed
Requester có 60 phút để chuyển tiền

CTA: Chấp nhận
Secondary: Từ chối
```

**Reject bottom sheet**

```text
Từ chối yêu cầu
Chọn lý do:
( ) Tỷ giá đã thay đổi
( ) Hết hạn mức
( ) Không hỗ trợ phương thức
( ) Nghi ngờ rủi ro
( ) Khác
CTA: Xác nhận từ chối
```

## P-06. Confirm Payment Received

| Thuộc tính | Nội dung |
|---|---|
| Status | `payment_sent` |
| Mục tiêu | Provider đối soát proof/memo/tài khoản thật trước khi xác nhận. |

**Wireframe text**

```text
HEADER: Đối soát tiền vào
RQ-7K2M9 · Còn 00:33 để xác nhận

PAYMENT PROOF CARD
Requester đã upload proof
Ref: REF-8F12A · 12:28
File preview: receipt.jpg
Note: PayPal PP-20260224XYZ

MATCH CHECKLIST
[ ] Số tiền thực nhận đúng $502.50
[ ] Memo đúng RQ-7K2M9
[ ] Tài khoản nhận đúng Zelle chính

CTA disabled until checked: Xác nhận đã nhận đủ
Secondary: Tôi chưa nhận được / nhận sai
```

**Irreversible confirmation**

```text
BOTTOM SHEET
Bạn xác nhận đã nhận đủ $502.50?
Sau bước này bạn phải chi trả 12.760.000 VND cho Beneficiary theo SLA.
[ ] Tôi đã đối soát tài khoản thật và memo.
CTA: Giữ để xác nhận
```

## P-07. Transfer to Beneficiary + Proof

![Provider Transfer](ux_ui_v4/mockup_P04_provider_transfer.png)

| Thuộc tính | Nội dung |
|---|---|
| Status | `payment_confirmed` |
| Mục tiêu | Provider chi trả đúng Beneficiary và upload transfer proof. |

**Wireframe text**

```text
HEADER: Chi trả người nhận
Đã xác nhận nhận tiền · còn 01:38

TRANSFER TICKET
Số tiền: 12.760.000 VND [Copy]
Người nhận: Nguyễn Thị M
Ngân hàng: Vietcombank
Số TK: ****1234 [Unmask/Copy]
Nội dung: RQ-7K2M9 [Copy]
QR/VietQR nếu khả dụng

WARNING
Chỉ bấm “Đã chuyển” sau khi giao dịch ngân hàng/ví thành công.

CTA: Đã chuyển & tải proof
Secondary: Tôi chưa nhận được / nhận sai
```

## P-08. Provider Dispute Form

| Status | Lý do mở dispute | UI đặc thù |
|---|---|---|
| `payment_sent` | Không nhận tiền / thiếu tiền / sai memo | Bắt buộc đợi ≥30 phút từ paymentProof, upload sao kê. |
| `transfer_sent` | Đã chi trả nhưng Requester không xác nhận | Bắt buộc có transferProof. |

**Wireframe text**

```text
HEADER: Khiếu nại giao dịch
Case được xử lý trong 48h

CATEGORY
( ) Không nhận được tiền
( ) Nhận thiếu tiền
( ) Sai memo
( ) Requester không xác nhận dù đã nhận
( ) Khác

EVIDENCE
+ Tải sao kê / biên nhận chuyển tiền

CTA: Gửi khiếu nại
```

## P-09. Wallet & Ledger

![Provider Wallet](ux_ui_v4/mockup_P05_provider_wallet.png)

**Wireframe text**

```text
HEADER: Ví & ký quỹ
Theo dõi số dư và ledger

WALLET SUMMARY
Số dư khả dụng: $3,850.00
Đang ký quỹ: $1,250
Đang freeze: $0
CTA: Nạp ví · Rút tiền

LEDGER LIST
LOCK_COLLATERAL · RQ-7K2M9 · -12.9M VND
DEPOSIT · Top-up Stripe · +$500.00
FEE_PROVIDER · RQ-6A1T2 · -$2.50
UNLOCK_COLLATERAL · RQ-6A1T2 · +7.6M VND

FILTERS
Tất cả · Nạp/Rút · Ký quỹ · Phí · Phạt/Đền bù
```

## P-10. Provider Payment Accounts

```text
HEADER: Tài khoản nhận tiền
Dùng để Requester thanh toán cho bạn
CTA: + Thêm tài khoản

GROUP USD
Zelle chính · (+1) *** *** 7890
Venmo · @hungm
Bank Chase · ****9812
Actions: Copy · Sửa · Xóa

FORM
Tiền tệ [USD]
Phương thức [Zelle]
Tên gợi nhớ
Số điện thoại/email/handle hoặc bank fields
CTA: Lưu tài khoản
```

**Rules**

- Chặn xóa nếu account đang tham chiếu bởi deal active hoặc request sống.
- Nếu method trong deal thiếu account: deal form hiển thị lỗi tại nguồn.

## P-11. Provider Profile / Settings

```text
HEADER: Hồ sơ Provider
Nguyễn Văn B · KYC T2 · Verified
Rating: 4,9★ · 248 GD · Đúng SLA 98%

CARDS
Ví & ký quỹ
Tài khoản nhận tiền
Lịch sử giao dịch
Điều khoản Provider
Bảo mật & thiết bị
Thông báo SLA
Trợ giúp vận hành
Đăng xuất
```

---

# 6. Admin / Trọng tài Web Console

## 6.1. Admin navigation

| Module | Mục tiêu | Screens |
|---|---|---|
| Disputes | Xử lý khiếu nại và SLA escalation | A-01, A-02 |
| Users | Xem KYC, hạn mức, violation, khóa/mở user | A-03 |
| Deals | Gỡ deal vi phạm, xem version, risk flag | A-04 |
| Ledger | Tra cứu bút toán, reconcile case | A-05/A-07 |
| Risk/AML | Cảnh báo structuring, multiple beneficiaries, fraud | A-05 |
| Config | SLA, fee, corridor, notification template | A-06 |

## A-01. Dispute Queue

![Admin Dispute Queue](ux_ui_v4/mockup_A01_admin_dispute_queue.png)

| Thuộc tính | Nội dung |
|---|---|
| Mục tiêu | Admin ưu tiên case theo SLA, tiền, rủi ro, assignee. |
| Entry | Admin login; notification escalation; side nav Disputes. |
| Exit | A-02 Arbitration Workbench. |

**Wireframe text**

```text
SIDEBAR
Disputes · Arbitration · Users · Deals · AML Risk · Config

HEADER
Hàng đợi khiếu nại
Sắp theo SLA còn lại, ưu tiên case tài chính cao

KPI CARDS
Đang phân xử: 12
Quá SLA: 2
R2 có thể hoàn tiền: 4
Median xử lý: 18h

FILTER BAR
Status: disputed/escalated/resolved
Reason: no payout / short payout / no payment / SLA breach
Corridor · Amount range · Assignee · SLA remaining

TABLE
Case | SLA | Amount | Disputed by | Reason | Assignee | Action
RQ-7K2M9 | 38h | $502.50 | Requester | Provider chưa chi trả | Linh | Nhận case
```

**Interactions**

- Click row mở A-02.
- Bulk assign chỉ cho trưởng nhóm Ops.
- SLA < 6h row highlight warning; quá SLA highlight danger.

## A-02. Arbitration Workbench / Case Detail

![Admin Arbitration Workbench](ux_ui_v4/mockup_A02_admin_arbitration_workbench.png)

| Thuộc tính | Nội dung |
|---|---|
| Mục tiêu | Admin xem toàn cảnh, yêu cầu bằng chứng, ra outcome R1-R4 có preview ledger. |
| Entry | Chọn case từ A-01. |
| Exit | Resolved case; hoặc request evidence. |

**Layout anatomy**

1. Left panel: timeline/status history/SLA.
2. Center panel: transaction details, two parties, Beneficiary, memo, chat 3 bên.
3. Right panel: proof/evidence list, risk signals, decision panel.
4. Sticky footer/right action: Request evidence, choose outcome, preview ledger, confirm.

**Wireframe text**

```text
HEADER
Bàn phân xử RQ-7K2M9
Freeze ký quỹ Provider · SLA còn 38h

LEFT: Timeline
pending_acceptance 12:00 Request tạo
accepted 12:08 Provider accept
payment_sent 12:28 Requester proof
payment_confirmed 12:42 Provider xác nhận
 disputed 14:10 Requester khiếu nại

CENTER: Transaction
Requester: Nguyễn Văn A · KYC T1 · 0 violation
Provider: Hùng Mạnh · KYC T2 · Đúng SLA 98%
Amount: $502.50 -> 12.760.000 VND
Beneficiary: Nguyễn Thị M · VCB ****1234
Memo: RQ-7K2M9
Collateral freeze: 12.9M VND

CENTER: Chat 3 bên
Requester: Người nhận chưa thấy tiền.
Provider: Tôi đã chuyển qua MB Bank.
Admin: Vui lòng bổ sung sao kê trong 12h.

RIGHT: Evidence
paymentProof: Đủ
transferProof: Cần kiểm tra
bank statement: Chưa có

DECISION
R1 Complete
R2 Refund Requester
R3 No Payment
R4 Mutual Cancel
Rationale input
Preview ledger effect
CTA: Ra phán quyết & thực thi ledger
```

**Decision guard**

| Outcome | Required evidence | Ledger preview bắt buộc |
|---|---|---|
| R1_complete | Transfer proof đủ + bằng chứng Beneficiary nhận | Charge fee; unlock collateral; Requester violation nếu ỉm. |
| R2_refund_requester | Provider nhận tiền nhưng không/chi sai | Debit collateral; compensate Requester; Provider penalty. |
| R3_no_payment | Payment proof giả/không có tiền về | Unlock collateral; Requester penalty/violation. |
| R4_mutual_cancel | Lỗi khách quan/đồng thuận | Return to pre-transaction; no fee/no violation. |

## A-03. User Risk Profile

```text
HEADER: User profile
Nguyễn Văn A · Requester · KYC T1

SUMMARY
Rating · Completed count · Violation 30/90 ngày · Dispute rate · Volume

SECTIONS
KYC documents status
Linked payment/beneficiary accounts (masked)
Transaction history
Violation log
Risk flags
Admin actions: adjust limit · temporary lock · request re-KYC
```

## A-04. Deal Moderation

```text
HEADER: Deal moderation

FILTERS
Active · Paused · Reported · Rate outlier · Provider warning

DEAL CARD/TABLE
Deal ID · Provider · Corridor · Rate vs market · Limit · SLA · Reports · Action
Actions: View version history · Hide deal · Warn Provider · Force pause
```

## A-05. AML/Risk Alerts

```text
HEADER: AML/Risk Alerts

ALERT TYPES
Structuring: nhiều giao dịch nhỏ gần hạn mức
Shared beneficiary: nhiều Requester trỏ cùng người nhận
High dispute provider
Repeated no-payment requester
Suspicious chat/off-platform attempt

ALERT DETAIL
Pattern summary
Related users/requests
Evidence links
Actions: Dismiss · Create case · Lock user · Export report
```

## A-06. Config Center

```text
HEADER: System configuration

TABS
SLA timers · Fee · Collateral formula · Corridor · Notification template · Rate threshold

SLA ROW
T1 pending_acceptance: 2h
T2 accepted: 1h
T3 payment_sent: 1h
T4 payment_confirmed: deal SLA + 30m
T5 transfer_sent: 24h
T6 disputed: 48h

CTA: Save draft · Submit for approval
```

## A-07. Reporting Dashboard

```text
HEADER: Operations dashboard

KPI GROUPS
Transaction health: completion rate, median phase time, expired by timer
Dispute: disputed rate, outcome distribution, SLA resolution
Finance: GMV, fee revenue, penalties, collateral locked
Trust: rating distribution, Provider SLA, Requester violation
Risk: AML alerts, fraud/no-payment rate
```

---

# 7. Screen-level microcopy chuẩn

| Context | Copy đề xuất |
|---|---|
| Chờ Provider | “Đã gửi tới {Provider} — thường phản hồi trong ~{x} phút. Hết hạn sau {countdown}.” |
| Payment warning | “Dán đúng mã {memo} vào nội dung chuyển khoản — đây là cách hệ thống đối soát và bảo vệ giao dịch của bạn.” |
| Protection block | “{Provider} đã ký quỹ {amount}. Nếu có tranh chấp, đội trọng tài xử lý trong 48h.” |
| Provider accept | “Khi chấp nhận, hệ thống sẽ khóa {collateral}. Bạn chỉ được mở khóa khi giao dịch hoàn tất/được phân xử.” |
| Confirm received | “Chỉ xác nhận khi tiền đã thực nhận đủ trong tài khoản của bạn. Hành động này không thể hoàn tác.” |
| Complete | “Chỉ hoàn tất khi {Beneficiary} đã thực nhận đủ {amount}. Hành động này không thể hoàn tác.” |
| Reject recovery | “{Provider} từ chối: {reason}. Bạn có thể tìm deal tương tự mà không cần nhập lại thông tin.” |
| Expired recovery | “Yêu cầu đã hết hạn vì {reason}. Không phát sinh phí. Tìm deal khác?” |
| Dispute submitted | “Khiếu nại đã được tiếp nhận. Ký quỹ Provider được freeze cho đến khi có phán quyết.” |

---

# 8. Error, Empty, Loading, Offline States

## 8.1. Form errors

| Screen | Error | Copy |
|---|---|---|
| R-01 | Amount invalid | “Nhập số tiền hợp lệ.” |
| R-01 | KYC limit exceeded | “Số tiền vượt hạn mức KYC hiện tại. Nâng cấp để tiếp tục.” |
| R-02 | No deal | “Chưa có deal phù hợp. Thử đổi số tiền hoặc phương thức.” |
| R-06 | No Provider account | P0 không nên xảy ra; nếu xảy ra: “Provider chưa có tài khoản nhận tiền cho phương thức này. Giao dịch tạm dừng, vui lòng chọn deal khác hoặc liên hệ hỗ trợ.” |
| P-03 | Missing provider account | “Thiếu tài khoản {method} cho {currency}. Thêm tài khoản trước khi đăng deal.” |
| P-05 | Wallet insufficient | “Ví khả dụng không đủ ký quỹ. Cần nạp thêm {amount} để chấp nhận.” |
| A-02 | Outcome missing rationale | “Cần nhập căn cứ phán quyết trước khi đóng case.” |

## 8.2. Loading patterns

- Deal list: skeleton card 3 items.
- Request detail: load header/status first, then proof/chat asynchronously.
- Admin case: timeline + transaction summary load first; evidence thumbnails lazy load.
- Submit financial action: disable CTA + show “Đang xử lý an toàn…”; never allow double click.

## 8.3. Offline patterns

- User can view cached request detail but cannot submit transition/proof while offline.
- Proof upload can queue local draft; final submit only when online.
- Payment instruction can be cached once unmasked; re-unmask requires auth if session expired.

---

# 9. Accessibility & Localization

| Area | Requirement |
|---|---|
| Touch target | ≥ 44px cho buttons/chips/copy icons. |
| Contrast | Status badges đạt WCAG AA; warning yellow không dùng chữ trắng. |
| Screen reader | Countdown dùng `aria-live polite`; stepper đọc được “Bước 2/4: Bạn chuyển tiền”. |
| Emoji | Không dùng emoji làm carrier nghĩa duy nhất; luôn kèm text/icon system. |
| Locale | Tiền VND không lẻ; USD/EUR tối đa 2 decimals; luôn kèm ISO code. |
| Time | Hiển thị tương đối + absolute khi tap/hover: “12 phút trước · 12/06 10:15”. |
| Masking | SĐT: `09**•••89`; account: `****1234`; full value chỉ khi action cần. |

---

# 10. Handoff Notes cho Designer/Figma

## 10.1. Figma page structure đề xuất

```text
00 Cover & Design Principles
01 Design System / Components
02 Requester App - Happy Path
03 Requester App - Error/Dispute/Completed
04 Provider App - Operations
05 Provider App - Wallet/Deal Management
06 Admin Console - Dispute Ops
07 Prototype Flows
08 Archive / Explorations
```

## 10.2. Components cần dựng đầu tiên

1. App Header with actor/timer.
2. Four-step Stepper.
3. Money Summary Card.
4. Deal Card.
5. Transfer Ticket with Copy/QR.
6. Proof Card + Proof Upload Sheet.
7. Confirm Bottom Sheet.
8. Dispute Form.
9. Wallet Summary + Ledger Row.
10. Admin Queue Table + Decision Panel.

## 10.3. Prototype flows cần click được

| Flow | Screens |
|---|---|
| Requester happy path | R-01 → R-02 → R-03 → R-06 → R-07 → R-05 tracking → R-08 → R-09 |
| Requester no deal/recovery | R-01 → R-02 empty → edit requirement |
| Provider accept & transfer | P-01 → P-05 → P-06 → P-07 |
| Provider insufficient wallet | P-05 → wallet insufficient modal → P-09 top-up |
| Dispute | R-10/P-08 → A-01 → A-02 → resolved state |
| Admin R2 outcome | A-02 → preview ledger → confirm → resolved notification |

---

# 11. Mockup assets đi kèm

| File | Mục đích |
|---|---|
| `ux_ui_v4/mockup_00_screen_map.png` | Screen map tổng quan. |
| `ux_ui_v4/mockup_R01_requester_send_money.png` | Requester Step 1 — nhập nhu cầu. |
| `ux_ui_v4/mockup_R02_requester_deal_results.png` | Requester Step 2 — chọn deal. |
| `ux_ui_v4/mockup_R03_requester_payment_instruction.png` | Requester thanh toán — transfer ticket + QR + protection. |
| `ux_ui_v4/mockup_R04_requester_tracking.png` | Request detail tracking. |
| `ux_ui_v4/mockup_R05_requester_completed_rating.png` | Completed + rating + repeat. |
| `ux_ui_v4/mockup_P01_provider_dashboard.png` | Provider dashboard action-first. |
| `ux_ui_v4/mockup_P02_provider_deal_form.png` | Provider create/edit deal. |
| `ux_ui_v4/mockup_P03_provider_request_review.png` | Provider accept/reject request. |
| `ux_ui_v4/mockup_P04_provider_transfer.png` | Provider transfer to Beneficiary. |
| `ux_ui_v4/mockup_P05_provider_wallet.png` | Provider wallet & ledger. |
| `ux_ui_v4/mockup_A01_admin_dispute_queue.png` | Admin dispute queue. |
| `ux_ui_v4/mockup_A02_admin_arbitration_workbench.png` | Admin arbitration workbench. |
| `ux_ui_v4/mockup_contact_sheet.png` | Contact sheet toàn bộ mockup. |

![Contact sheet](ux_ui_v4/mockup_contact_sheet.png)

---

# 12. Checklist để duyệt thiết kế trước khi dev

| Checklist | Pass? |
|---|---|
| Mọi request detail đều có status + actor + countdown. | ☐ |
| Màn thanh toán có total payable, account, memo, copy all, QR, protection block. | ☐ |
| Memo không xuống dòng và có copy riêng. | ☐ |
| Hành động irreversible có confirm 2 bước. | ☐ |
| Deal card có trust signals: verified, rating, on-time rate, response time. | ☐ |
| Provider accept có collateral preview và wallet availability. | ☐ |
| Provider không thấy CTA accept nếu không đủ ký quỹ. | ☐ |
| Dispute form có category bắt buộc và hiển thị SLA 48h. | ☐ |
| Admin decision có preview ledger effect. | ☐ |
| Sensitive data masked mặc định; unmask/copy có explanation. | ☐ |
| Empty/rejected/expired state có CTA phục hồi. | ☐ |
| Upload proof có preview/retry và warning ảnh mờ. | ☐ |
| Mobile touch target đạt ≥44px. | ☐ |

---

**Kết luận UX:** bộ màn hình v4 phải được thiết kế quanh niềm tin vận hành: người dùng biết ai đang cầm lượt, còn bao lâu, tiền/proof/memo đang ở đâu, và cơ chế bảo vệ nào sẽ kích hoạt nếu có lỗi. Không nên tối giản quá mức các điểm tài chính; cần “ma sát đúng chỗ” cho chuyển tiền, xác nhận, dispute và phán quyết.
