# P2P Remit Deals — UI Text Wireframes & Screen Blueprint v4.0

| Thuộc tính | Giá trị |
|---|---|
| **Tên tài liệu** | UI Text Wireframes & Screen Blueprint |
| **Sản phẩm** | P2P Remit Deals — Nền tảng chuyển tiền ngang hàng |
| **Phiên bản** | v4.0 |
| **Nguồn đầu vào** | BA Final v4.0, BA v1/v2/v3, UX/UI Spec v4.0 đã dựng trước đó |
| **Mục tiêu** | Cung cấp tài liệu chi tiết để UI Designer dựng Figma, Frontend bóc component, QA kiểm tra giao diện theo nghiệp vụ |
| **Phạm vi** | Mobile app cho Requester & Provider; Web console cho Admin/Trọng tài; common system screens |
| **Trạng thái** | Bản đề xuất để triển khai design production/MVP pilot |

---

## 0. Cách đọc tài liệu

Tài liệu này được viết theo góc nhìn **UI Design handoff**. Mỗi màn hình có các phần:

| Phần | Ý nghĩa |
|---|---|
| **Mục tiêu màn hình** | Người dùng cần hoàn thành điều gì trên màn này. |
| **Entry / Exit** | Người dùng đi vào màn từ đâu và đi ra đâu. |
| **Thông tin cần hiển thị** | Data binding chính cho frontend. |
| **CTA chính/phụ** | Hành động ưu tiên, hành động phụ và hành động nguy hiểm. |
| **Text wireframe** | Bản vẽ mockup bằng text/ASCII để designer dựng layout. |
| **States** | Empty, loading, error, expired, disabled, dispute hoặc các trạng thái đặc biệt. |
| **UI notes** | Ghi chú về niềm tin, bảo mật, masking, accessibility, interaction. |

### 0.1. Nguyên tắc thiết kế bắt buộc từ BA v4

1. **Mỗi giao dịch luôn phải nói rõ ai đang cầm lượt**: Requester, Provider, Admin hay System.
2. **Mọi trạng thái sống đều có đồng hồ SLA/countdown**.
3. **Requester không bị ép ký quỹ hai lần**; Provider ký quỹ trong ví nội bộ khi chấp nhận giao dịch.
4. **Phí Requester tách khỏi khoản chuyển P2P**: UI phải hiển thị rõ khoản chuyển cho Provider, phí nền tảng và tổng chi phí/nghĩa vụ thanh toán theo mô hình v4.
5. **Dữ liệu nhạy cảm masking mặc định**; chỉ unmask khi đúng ngữ cảnh hành động.
6. **Proof/memo là vật chứng nghiệp vụ**: không được thiết kế như file đính kèm tùy chọn mờ nhạt.
7. **Dispute có Admin phân xử**: mọi màn dispute phải hiển thị SLA 48h, evidence và trạng thái freeze ký quỹ.
8. **Hành động không thể đảo ngược cần confirm 2 bước**: accept, xác nhận nhận tiền, hoàn tất, resolve dispute, delete/disable destructive.
9. **Không để người dùng rơi vào ngõ cụt**: rejected/expired/no deal đều phải có CTA phục hồi.

---

## 1. Information Architecture tổng quan

### 1.1. Role và kênh

| Role | Kênh | Navigation chính | Mục tiêu thiết kế |
|---|---|---|---|
| **Requester / Người gửi** | Mobile app | Bottom tabs: **Gửi tiền · Yêu cầu · Liên kết · Hồ sơ** | Gửi tiền nhanh, thanh toán đúng memo, theo dõi tiến độ, xác nhận/khiếu nại an toàn. |
| **Provider / Nhà cung cấp** | Mobile app | Bottom tabs: **Trang chủ · Deals · Yêu cầu · Ví/Hồ sơ** | Quản lý deal, duyệt request, xác nhận nhận tiền, chi trả, quản lý ký quỹ. |
| **Admin / Trọng tài** | Desktop web | Sidebar: **Disputes · Users · Deals · Ledger · Risk · Config · Reports** | Phân xử dispute, xem evidence, ra phán quyết, giám sát AML/rủi ro. |
| **System/Common** | Mobile + Web | Login, KYC, Notification, Help, Settings | Bảo vệ truy cập, xác minh, thông báo, trợ giúp. |

### 1.2. Screen inventory theo role

#### Common/System

| ID | Màn hình | Nền tảng | Priority |
|---|---|---|---|
| C-01 | Splash / Login / OTP | Mobile/Web | P0 |
| C-02 | Role Selection / Role Switch | Mobile | P1 |
| C-03 | KYC Gate & Tier Status | Mobile/Web | P0 |
| C-04 | Notification Center | Mobile/Web | P0 |
| C-05 | Help & Policy Center | Mobile/Web | P1 |
| C-06 | Security & Device Settings | Mobile/Web | P1 |

#### Requester Mobile

| ID | Màn hình | Tab | Priority |
|---|---|---|---|
| R-01 | Gửi tiền Step 1 — Nhập nhu cầu | Gửi tiền | P0 |
| R-02 | Beneficiary Inline Form / Account Picker | Gửi tiền | P0 |
| R-03 | Deal Results / Marketplace Matching | Gửi tiền | P0 |
| R-04 | Deal Detail / Provider Trust Sheet | Gửi tiền | P1 |
| R-05 | Confirm Request | Gửi tiền | P0 |
| R-06 | Request List | Yêu cầu | P0 |
| R-07 | Request Detail Shell | Yêu cầu | P0 |
| R-08 | Payment Instruction | Yêu cầu | P0 |
| R-09 | Proof Upload Sheet | Yêu cầu | P0 |
| R-10 | Tracking — Waiting Provider | Yêu cầu | P0 |
| R-11 | Transfer Proof Review & Complete | Yêu cầu | P0 |
| R-12 | Completed + Rating + Repeat | Yêu cầu | P1 |
| R-13 | Dispute Form | Yêu cầu | P0 |
| R-14 | Dispute Detail | Yêu cầu | P0 |
| R-15 | Linked Accounts | Liên kết | P0 |
| R-16 | Requester Profile | Hồ sơ | P1 |

#### Provider Mobile

| ID | Màn hình | Tab | Priority |
|---|---|---|---|
| P-01 | Provider Activation Checklist | Trang chủ | P0 |
| P-02 | Provider Dashboard — Action First | Trang chủ | P0 |
| P-03 | Deals List | Deals | P0 |
| P-04 | Create/Edit Deal | Deals | P0 |
| P-05 | Deal Detail & Version History | Deals | P1 |
| P-06 | Provider Request List | Yêu cầu | P0 |
| P-07 | Request Review — Accept/Reject | Yêu cầu | P0 |
| P-08 | Payment Proof Review / Confirm Received | Yêu cầu | P0 |
| P-09 | Transfer to Beneficiary | Yêu cầu | P0 |
| P-10 | Provider Dispute Form | Yêu cầu | P0 |
| P-11 | Provider Wallet & Ledger | Ví/Hồ sơ | P0 |
| P-12 | Provider Payment Accounts | Ví/Hồ sơ | P0 |
| P-13 | Provider Profile & Reputation | Hồ sơ | P1 |

#### Admin Web Console

| ID | Màn hình | Module | Priority |
|---|---|---|---|
| A-01 | Admin Shell / Dashboard | Dashboard | P0 |
| A-02 | Dispute Queue | Disputes | P0 |
| A-03 | Arbitration Workbench | Disputes | P0 |
| A-04 | Evidence Request / 3-party Chat | Disputes | P0 |
| A-05 | User Risk Profile | Users | P0 |
| A-06 | Deal Moderation | Deals | P1 |
| A-07 | Ledger & Reconciliation | Ledger | P0 |
| A-08 | AML / Risk Alerts | Risk | P0 |
| A-09 | Config Center | Config | P1 |
| A-10 | Reporting Dashboard | Reports | P1 |

---

## 2. Design System định hướng

### 2.1. Layout grid

| Nền tảng | Kích thước thiết kế | Grid | Safe area |
|---|---:|---|---|
| Mobile iOS/Android | 390 × 844 px | 4 columns, margin 16, gutter 12 | Top 44, bottom 34 |
| Mobile small | 360 × 800 px | 4 columns, margin 16 | Không đặt CTA dưới safe area |
| Desktop Admin | 1440 × 1024 px | 12 columns, sidebar 240, content max 1180 | Header sticky 64 |

### 2.2. Tokens trạng thái

| Semantic token | Dùng cho | UI copy ví dụ |
|---|---|---|
| `status.waiting` | Chờ phản hồi/chờ accept | “Chờ chấp nhận” |
| `status.action` | User hiện tại cần làm | “Cần bạn chuyển tiền” |
| `status.progress` | Bên kia đang làm | “Provider đang chuyển” |
| `status.success` | Completed/proof accepted | “Hoàn thành” |
| `status.warning` | Gần hết SLA/dispute pending | “Sắp quá hạn” |
| `status.danger` | Reject/dispute destructive | “Khiếu nại” |
| `status.neutral` | Closed/cancelled/expired | “Đã đóng” |

### 2.3. Component library cần dựng trước

| Component | Vai trò | Notes |
|---|---|---|
| **AppHeaderWithTimer** | Request detail, Provider request detail | Status + actor + countdown là bắt buộc. |
| **FourPhaseStepper** | Requester/Provider detail | Ghép nối → Bạn chuyển → Provider chuyển → Hoàn tất. |
| **MoneySummaryCard** | R-01, R-05, R-08 | Tách khoản P2P, phí nền tảng, tổng chi phí. |
| **DealCard** | R-03, P-03 | Rate, amount received, trust signal, SLA. |
| **TransferTicket** | R-08, P-09 | Account, amount, memo, QR, copy all. |
| **ProofCard** | R/P/A | Ref, timestamp, preview, immutable. |
| **ProofUploadSheet** | R-09/P-09/R-13/P-10 | File + note + quality warning + retry. |
| **ConfirmCriticalActionSheet** | Accept, confirm received, complete, resolve | Checkbox + hold-to-confirm/delay. |
| **DisputeForm** | R-13/P-10 | Category bắt buộc + evidence + SLA 48h. |
| **AdminDecisionPanel** | A-03 | R1/R2/R3/R4 + ledger preview. |
| **WalletCard / LedgerRow** | Provider/Admin | available/locked/frozen; immutable ledger. |
| **EmptyRecoveryState** | All lists | Empty phải có CTA phục hồi. |

### 2.4. Interaction chuẩn

- **CTA chính**: sticky bottom trên mobile; bên phải/sticky footer trên desktop.
- **Copy actions**: copy từng dòng + copy all; sau copy có toast và audit event nếu là dữ liệu nhạy cảm.
- **Unmask dữ liệu**: yêu cầu session hợp lệ; log `unmask_sensitive_data`.
- **Countdown**: hiển thị mm:ss nếu < 1h, hh:mm nếu >= 1h; quá 80% SLA đổi sang warning.
- **Proof upload**: có preview, retry, trạng thái “Đang tải”, không chuyển state khi upload chưa thành công.
- **Confirm destructive/irreversible**: bottom sheet có hệ quả + checkbox chủ động + CTA dạng hold/delay.

---

# 3. Common / System Screens

## C-01. Splash / Login / OTP

| Mục | Nội dung |
|---|---|
| **Mục tiêu màn hình** | Cho người dùng đăng nhập an toàn bằng email/SĐT và OTP. |
| **Entry** | Mở app hoặc session hết hạn. |
| **Exit** | C-02 Role Selection hoặc vào role gần nhất. |
| **Dữ liệu cần bind** | appVersion, maintenanceStatus, resendCountdown, loginMethod. |
| **CTA chính** | “Gửi mã OTP”, sau đó “Xác nhận”. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│                                      │
│          P2P Remit Deals             │
│  Chuyển tiền ngang hàng an toàn hơn  │
│                                      │
│  Email hoặc số điện thoại            │
│  ┌────────────────────────────────┐  │
│  │  example@email.com             │  │
│  └────────────────────────────────┘  │
│                                      │
│  [ Gửi mã OTP ]                      │
│                                      │
│  ───────── hoặc ─────────             │
│  [ Tiếp tục với Google ]             │
│  [ Tiếp tục với Apple  ]             │
│                                      │
│  Vì đây là sản phẩm tài chính,       │
│  chúng tôi xác minh thiết bị của bạn.│
└──────────────────────────────────────┘
```

**States**

| State | UI behavior |
|---|---|
| Sai OTP | Inline: “Mã không đúng. Còn {n} lần thử.” |
| Resend | Disable resend, hiện “Gửi lại sau 00:45”. |
| Device lạ | Hiện warning và yêu cầu xác minh bổ sung. |
| Maintenance | Blocking screen: “Hệ thống đang bảo trì, giao dịch sống vẫn được xử lý bởi Ops.” |

---

## C-02. Role Selection / Role Switch

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Cho người dùng chọn vai trò được phép sau đăng nhập. |
| **Entry** | Sau login lần đầu, hoặc từ Profile > Chuyển vai trò. |
| **Exit** | Requester app hoặc Provider app. |
| **CTA chính** | “Vào app Người gửi”, “Vào app Provider”. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Bạn muốn làm gì hôm nay?            │
│  Tài khoản: Nguyễn Văn A             │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Tôi cần gửi tiền              │  │
│  │  Tìm deal, gửi request,        │  │
│  │  theo dõi người nhận.          │  │
│  │  [ Vào Người gửi ]             │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Tôi là Provider               │  │
│  │  Đăng deal, nhận yêu cầu,      │  │
│  │  chi trả và quản lý ký quỹ.    │  │
│  │  KYC T2: Chưa hoàn tất         │  │
│  │  [ Hoàn tất để làm Provider ]  │  │
│  └────────────────────────────────┘  │
│                                      │
│  An toàn bằng KYC · Ký quỹ · Proof   │
└──────────────────────────────────────┘
```

**UI notes**

- Người dùng đại chúng không nên thấy thuật ngữ “Requester” trong copy chính; dùng “Người gửi”.
- Provider card bị khóa nếu chưa KYC T2 hoặc chưa ký điều khoản Provider.

---

## C-03. KYC Gate & Tier Status

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Hiển thị tier hiện tại, quyền được phép, hạn mức và bước cần làm tiếp. |
| **Entry** | Profile, tạo request vượt quyền, provider activation. |
| **Exit** | Bắt đầu eKYC, quay lại luồng trước đó. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Xác minh tài khoản                  │
│  Tăng hạn mức và mở khóa vai trò     │
│                                      │
│  T0 ━━━━━ T1 ───── T2                │
│  Hiện tại: T1 - Đã xác minh gửi tiền │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  T1 - Người gửi                │  │
│  │  ✓ Giấy tờ tùy thân            │  │
│  │  ✓ Liveness                    │  │
│  │  Hạn mức: $1.000/GD            │  │
│  │  Còn lại 30 ngày: $3.200       │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  T2 - Provider                 │  │
│  │  Cần: địa chỉ, nguồn tiền,     │  │
│  │  tài khoản ngân hàng chính chủ │  │
│  │  [ Nâng cấp lên T2 ]           │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**States**

- `not_started`: CTA “Bắt đầu xác minh”.
- `pending_review`: disable CTA, copy “Đang xét duyệt trong {x} giờ”.
- `rejected`: hiển thị lý do và CTA upload lại.
- `expired`: yêu cầu re-KYC trước khi giao dịch.

---

## C-04. Notification Center

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Tập trung thông báo tài chính, SLA, dispute, rating. |
| **Entry** | Bell icon toàn app, push deep link. |
| **Exit** | Màn detail tương ứng. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Thông báo                           │
│  [Tất cả] [Tài chính] [SLA] [Khiếu nại]
│                                      │
│  ● RQ-7K2M9 đã được chấp nhận        │
│    Bạn có 60 phút để chuyển tiền.    │
│    [ Mở màn thanh toán ]             │
│                                      │
│  ● Provider đã tải bằng chứng        │
│    Kiểm tra với người nhận trước     │
│    khi hoàn tất giao dịch.           │
│    [ Xem bằng chứng ]                │
│                                      │
│  ○ Khiếu nại RQ-8F12A đã phân xử     │
│    Kết cục: Hoàn tiền Requester.     │
│    [ Xem phán quyết ]                │
└──────────────────────────────────────┘
```

**Notification item anatomy**: icon/severity, title, requestId, body, relative time, CTA deep link, unread state.

---

## C-05. Help & Policy Center

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Trợ giúp & chính sách               │
│  Tìm kiếm: [ ký quỹ, phí, dispute ]  │
│                                      │
│  Chủ đề phổ biến                     │
│  • Tôi được bảo vệ thế nào?          │
│  • Phí hệ thống tính ra sao?         │
│  • Khi nào nên mở khiếu nại?         │
│  • Tôi nhập sai memo thì sao?        │
│  • Provider ký quỹ là gì?            │
│                                      │
│  [ Chat với hỗ trợ ]                 │
└──────────────────────────────────────┘
```

**UI notes**: Help phải có deep link theo context: từ màn thanh toán mở đúng bài “memo/protection”; từ dispute mở đúng bài “quy trình phân xử 48h”.

---

## C-06. Security & Device Settings

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Bảo mật & thiết bị                  │
│                                      │
│  Đăng nhập sinh trắc học       [On]  │
│  Thiết bị tin cậy                    │
│  • iPhone 15 Pro · hiện tại          │
│  • Chrome MacBook · 2 ngày trước     │
│                                      │
│  Lịch sử đăng nhập                   │
│  Cài đặt mã PIN giao dịch            │
│  [ Đăng xuất khỏi mọi thiết bị ]     │
└──────────────────────────────────────┘
```

**Security note**: Unmask/copy dữ liệu tài chính sau thời gian idle cần yêu cầu PIN/biometric lại.

---

# 4. Requester Mobile App

## 4.1. Navigation Requester

```text
Bottom Tab
[ Gửi tiền ] [ Yêu cầu ] [ Liên kết ] [ Hồ sơ ]
```

- Badge tab “Yêu cầu” = số request đang cần Requester hành động.
- Tab “Gửi tiền” là start point mặc định.
- Tab “Liên kết” quản lý Beneficiary/tài khoản nhận thường dùng.

---

## R-01. Gửi tiền Step 1 — Nhập nhu cầu

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Requester nhập số tiền, currency corridor, phương thức và người nhận để tìm deal phù hợp. |
| **Entry** | Tab Gửi tiền, CTA “Gửi lại”, CTA “Tìm deal tương tự”. |
| **Exit** | R-03 Deal Results. |
| **Dữ liệu cần bind** | senderCurrency, receiverCurrency, amount, previewRate, feePreview, totalCost, paymentMethodFrom, receiveMethodTo, beneficiaryAccount. |
| **CTA chính** | “Tìm deal phù hợp”. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Bạn muốn gửi tiền đi đâu?           │
│  Nhập nhu cầu - hệ thống tìm deal tốt│
│                                      │
│  SỐ TIỀN CHUYỂN                      │
│  ┌────────────────────────────────┐  │
│  │ Bạn gửi                        │  │
│  │ [ USD ▾ ]   [ 500             ]│  │
│  │ Người nhận sẽ nhận bằng        │  │
│  │ [ VND ▾ ]                      │  │
│  │ 1 USD ≈ 25.500 VND             │  │
│  │ *Tỷ giá thực theo Provider     │  │
│  └────────────────────────────────┘  │
│                                      │
│  TỔNG CHI PHÍ DỰ KIẾN                │
│  ┌────────────────────────────────┐  │
│  │ Khoản chuyển P2P        $500.00│  │
│  │ Phí hệ thống 0,5%        $2.50 │  │
│  │ Tổng chi phí             $502.50│ │
│  │ Người nhận dự kiến   12.750.000đ│ │
│  └────────────────────────────────┘  │
│                                      │
│  HÌNH THỨC THANH TOÁN                │
│  Bạn trả Provider qua [ Zelle ▾ ]    │
│  Người nhận nhận qua  [ Bank ▾  ]    │
│                                      │
│  NGƯỜI NHẬN                          │
│  [ Mẹ - Vietcombank ****1234 ▾ ]     │
│  [+ Thêm người nhận mới]             │
│                                      │
│  Ghi chú cho Provider                │
│  [ Cần chuyển trong hôm nay...     ] │
│                                      │
│  [ Tìm deal phù hợp ]                │
└──────────────────────────────────────┘
```

**States & validation**

| Case | UI response |
|---|---|
| Amount rỗng/≤0 | Inline error dưới input: “Nhập số tiền hợp lệ”. |
| Vượt hạn mức KYC | Blocking card dưới amount: “Số tiền vượt hạn mức T1. Nâng cấp để tiếp tục.” |
| Không có receiveCurrency khả dụng | Disable currency, copy “Chưa hỗ trợ hành lang này”. |
| Method đổi | Clear field phụ thuộc nhưng giữ beneficiary name nếu đang nhập mới. |
| Chưa chọn beneficiary | CTA disabled, helper “Chọn hoặc thêm người nhận”. |
| Draft từ repeat flow | Pre-fill beneficiary/currency/method, highlight “Dữ liệu từ giao dịch trước”. |

**UI notes**

- “Tổng chi phí” phải xuất hiện ngay Step 1, không để phí xuất hiện muộn.
- Currency selector phải có cờ + ISO code + tên quốc gia nếu đủ chỗ.
- Amount dùng font số tabular, format theo locale.

---

## R-02. Beneficiary Inline Form / Account Picker

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Cho Requester chọn tài khoản đã lưu hoặc nhập mới theo method nhận. |
| **Entry** | R-01 khi bấm account picker hoặc “+ Thêm người nhận mới”. |
| **Exit** | Quay lại R-01 với beneficiary đã chọn. |

**Text wireframe — picker**

```text
┌──────────────────────────────────────┐
│  Chọn người nhận                     │
│  Phù hợp: VND · Bank Transfer        │
│                                      │
│  [Search tên/ngân hàng/số cuối]      │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Mẹ - Vietcombank               │  │
│  │ Nguyễn Thị M · VCB ****1234    │  │
│  │ [ Chọn ]                       │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Em trai - Techcombank          │  │
│  │ Nguyễn Văn C · TCB ****8831    │  │
│  │ [ Chọn ]                       │  │
│  └────────────────────────────────┘  │
│                                      │
│  [+ Thêm tài khoản nhận mới]         │
└──────────────────────────────────────┘
```

**Text wireframe — form Bank Transfer**

```text
┌──────────────────────────────────────┐
│  Thêm tài khoản nhận                 │
│                                      │
│  Tiền tệ        [ VND ▾ ]            │
│  Phương thức    [ Chuyển khoản NH ▾ ]│
│  Tên gợi nhớ    [ Mẹ - Vietcombank ] │
│                                      │
│  Tên chủ TK *   [ Nguyễn Thị M     ] │
│  Ngân hàng *    [ Vietcombank ▾    ] │
│  Số tài khoản * [ 0123456789       ] │
│                                      │
│  [ Lưu & dùng tài khoản này ]        │
└──────────────────────────────────────┘
```

**Text wireframe — form Wallet/Phone**

```text
Tên chủ tài khoản * [ Nguyễn Thị M ]
Số điện thoại MoMo * [ 09xx xxx xxx ]
```

**Validation**

- Bank method: tên chủ TK + ngân hàng + số TK bắt buộc.
- E-wallet: tên + số điện thoại/email/handle tùy method bắt buộc.
- Duplicate warning nếu cùng currency + method + accountNumber/phone đã tồn tại.

---

## R-03. Deal Results / Marketplace Matching

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Cho Requester so sánh deal theo số nhận thực, tốc độ, độ tin cậy. |
| **Entry** | R-01 validate thành công. |
| **Exit** | R-04 Deal Detail hoặc R-05 Confirm Request. |
| **Dữ liệu cần bind** | providerProfile, rate, receiveAmount, totalCost, methodMatchScore, SLA, rating, onTimeRate, responseTime, verified, collateralCoverage. |
| **CTA chính** | “Chọn deal này”. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Chọn deal                           │
│  USD → VND · Bạn gửi $500            │
│                                      │
│  [Nhận nhiều nhất] [Nhanh nhất]      │
│  [Rating cao] [Đúng hạn]             │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ RECOMMENDED · Khớp 100%         │  │
│  │ Hùng Mạnh ✓                    │  │
│  │ 4,9★ · 512 GD · Đúng hạn 98%   │  │
│  │ Phản hồi ~12 phút              │  │
│  │                                │  │
│  │ Tỷ giá: 25.520                 │  │
│  │ Người nhận: 12.760.000 VND     │  │
│  │ Tổng chi phí: $502.50          │  │
│  │ SLA chi trả: 30-60 phút        │  │
│  │ Zelle → Bank Transfer          │  │
│  │ [ Chọn deal này ]              │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Thu Hà ✓                       │  │
│  │ 4,8★ · Đúng hạn 96%            │  │
│  │ Tỷ giá: 25.480                 │  │
│  │ Người nhận: 12.740.000 VND     │  │
│  │ SLA: 1-2 giờ                   │  │
│  │ [ Chọn deal này ]              │  │
│  └────────────────────────────────┘  │
│                                      │
│  Deal gần đúng số tiền               │
│  Card mờ · Không chọn được ·         │
│  [ Sửa số tiền ]                     │
└──────────────────────────────────────┘
```

**States**

| State | UI |
|---|---|
| No exact deal | Empty recovery: đổi amount/method, bật báo khi có deal. |
| Deal lệch hạn mức | Card disabled, show “Hạn mức $100-$3.000”. |
| Provider có SLA warning | Badge “Đang có giao dịch quá SLA”, giảm prominence. |
| Loading | Skeleton 3 deal cards. |

**UI notes**

- Card không chỉ show rate; phải show “người nhận thực nhận” và trust signals.
- Nếu có deal rate cao nhưng Provider risk cao, không gắn recommended mặc định.

---

## R-04. Deal Detail / Provider Trust Sheet

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Giải thích vì sao nên/không nên chọn Provider; tăng niềm tin trước khi request. |
| **Entry** | Tap Provider/deal card trong R-03. |
| **Exit** | R-05 Confirm hoặc quay lại R-03. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Hùng Mạnh ✓                         │
│  Provider đã xác minh                │
│                                      │
│  4,9★      512 GD     Đúng hạn 98%   │
│  Phản hồi trung bình: 12 phút        │
│  Tranh chấp 90 ngày: 0,4%            │
│                                      │
│  DEAL USD → VND                      │
│  Tỷ giá: 25.520                      │
│  Hạn mức: $50 - $10.000              │
│  SLA: 30-60 phút                     │
│  Nhận qua: Zelle, Bank Transfer      │
│  Chi qua: MoMo, ZaloPay, Bank        │
│                                      │
│  Bạn được bảo vệ bởi                 │
│  • Ký quỹ Provider                   │
│  • Proof/memo đối soát               │
│  • Admin phân xử trong 48h           │
│                                      │
│  [ Chọn deal này ]                   │
└──────────────────────────────────────┘
```

**UI notes**

- Không show dữ liệu cá nhân Provider như full phone/email trước khi accepted.
- Trust numbers cần có tooltip: cách tính rating/on-time/dispute rate.

---

## R-05. Confirm Request

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Requester kiểm tra lần cuối trước khi tạo request. |
| **Entry** | R-03/R-04 chọn deal. |
| **Exit** | R-07 detail trạng thái `pending_acceptance`. |
| **CTA chính** | “Gửi yêu cầu”. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Xác nhận yêu cầu                    │
│  Kiểm tra kỹ trước khi gửi           │
│                                      │
│  NHÀ CUNG CẤP                        │
│  Hùng Mạnh ✓ · 4,9★ · Đúng hạn 98%   │
│                                      │
│  LUỒNG GIAO DỊCH                     │
│  Bạn chuyển P2P:       $500.00       │
│  Phí hệ thống:           $2.50       │
│  Tổng chi phí:          $502.50      │
│  Provider chi trả: 12.760.000 VND    │
│  Tỷ giá áp dụng: 1 USD = 25.520 VND  │
│                                      │
│  NGƯỜI NHẬN                          │
│  Nguyễn Thị M                        │
│  Vietcombank · ****1234              │
│                                      │
│  CAM KẾT THỜI GIAN                   │
│  Sau khi Provider chấp nhận, bạn có  │
│  60 phút để chuyển tiền.             │
│                                      │
│  Ghi chú cho Provider                │
│  [ Cần chuyển trước 3h chiều...    ] │
│                                      │
│  [ Gửi yêu cầu ]                     │
└──────────────────────────────────────┘
```

**After submit**

- Toast: “Đã gửi yêu cầu RQ-7K2M9 tới Hùng Mạnh”.
- Navigate to R-07 with status `pending_acceptance`.
- If API conflict/deal changed: show diff “Tỷ giá vừa thay đổi từ X sang Y” + CTA reload deal.

---

## R-06. Request List

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Quản lý request theo trạng thái và ưu tiên việc cần làm. |
| **Entry** | Tab Yêu cầu. |
| **Exit** | R-07/R-08/R-11/R-14. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Yêu cầu của tôi                     │
│  Theo dõi trạng thái chuyển tiền     │
│                                      │
│  [Cần làm 1] [Đang xử lý 2]          │
│  [Chờ chấp nhận 1] [Đã đóng 8]       │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ RQ-7K2M9 · Hùng Mạnh ✓          │  │
│  │ Cần bạn chuyển tiền · còn 48:12 │  │
│  │ $500 → 12.760.000 VND           │  │
│  │ Người nhận: Mẹ - VCB ****1234   │  │
│  │ [ Mở thanh toán ]               │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ RQ-6A1T2 · Thu Hà ✓             │  │
│  │ Provider đang chuyển · còn 1:20 │  │
│  │ [ Theo dõi ]                    │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Filter logic đề xuất**

| Filter | Status |
|---|---|
| Cần làm | `accepted`, `transfer_sent`, pending user evidence request |
| Đang xử lý | `payment_sent`, `payment_confirmed`, `disputed` nếu đang chờ Admin/bên kia |
| Chờ chấp nhận | `pending_acceptance` |
| Đã đóng | `completed`, `rejected`, `cancelled`, `expired`, `resolved` |

---

## R-07. Request Detail Shell

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Màn trung tâm hiển thị trạng thái, lượt xử lý, timeline, proof, chat và action theo state. |
| **Entry** | Từ Request List, notification, deep link. |
| **Exit** | Payment, proof upload, completion, dispute, chat. |

**Text wireframe — detail shell chuẩn**

```text
┌──────────────────────────────────────┐
│  RQ-7K2M9                     [Help] │
│  Provider đang chuyển cho người nhận │
│  Lượt của Provider · còn 01:20       │
│                                      │
│  ① Ghép nối ✓                        │
│  ② Bạn chuyển ✓                      │
│  ③ Provider chuyển ●                 │
│  ④ Hoàn tất ○                        │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ACTION CARD THEO TRẠNG THÁI     │  │
│  │ Nội dung thay đổi theo status   │  │
│  │ [CTA chính] [CTA phụ]           │  │
│  └────────────────────────────────┘  │
│                                      │
│  TÓM TẮT                             │
│  Bạn chuyển: $500.00                 │
│  Phí hệ thống: $2.50                 │
│  Người nhận: 12.760.000 VND          │
│  Provider: Hùng Mạnh ✓               │
│  Beneficiary: Nguyễn Thị M           │
│                                      │
│  BẰNG CHỨNG                          │
│  Payment proof: Đã xác nhận          │
│  Transfer proof: Đang chờ            │
│                                      │
│  CHAT                                │
│  Hệ thống: Provider đã xác nhận...   │
│  [ Mở chat ]                         │
│                                      │
│  TIMELINE                            │
│  12:00 Request tạo                   │
│  12:08 Provider accepted             │
└──────────────────────────────────────┘
```

**Action card theo status**

| Status | Copy chính | CTA chính | CTA phụ |
|---|---|---|---|
| `pending_acceptance` | “Đã gửi tới {Provider}. Hết hạn sau {T1}.” | — | “Hủy yêu cầu” |
| `accepted` | “Provider đã chấp nhận. Bạn có {T2} để chuyển tiền.” | “Mở hướng dẫn thanh toán” | “Chat” |
| `payment_sent` | “Đã nộp proof. Chờ Provider xác nhận nhận tiền.” | — | “Khiếu nại” nếu cần |
| `payment_confirmed` | “Provider đang chuyển tiền cho người nhận.” | — | “Khiếu nại” nếu quá SLA/rủi ro |
| `transfer_sent` | “Provider đã tải bằng chứng chi trả.” | “Xác nhận đã nhận đủ” | “Khiếu nại” |
| `completed` | “Giao dịch hoàn tất.” | “Đánh giá Provider” | “Gửi lại” |
| `disputed` | “Khiếu nại đang được phân xử.” | “Xem dispute” | “Bổ sung bằng chứng” |
| `rejected/expired/cancelled/resolved` | “Giao dịch đã đóng: {reason/outcome}.” | “Tìm deal tương tự” | — |

---

## R-08. Payment Instruction

| Mục | Nội dung |
|---|---|
| **Status** | `accepted` |
| **Mục tiêu** | Giúp Requester chuyển tiền đúng số tiền/tài khoản/memo và hiểu mình được bảo vệ thế nào. |
| **Entry** | R-07 CTA “Mở hướng dẫn thanh toán”. |
| **Exit** | R-09 Proof Upload; R-07 payment_sent sau submit. |
| **Data** | providerReceivingAccount, amountToProvider, platformFee, memo, QR payload, countdown T2, collateralCoverage. |
| **CTA chính** | “Đã chuyển tiền & tải bằng chứng”. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Thanh toán cho Provider             │
│  RQ-7K2M9 · Còn 48:12                │
│                                      │
│  🛡 Bạn được bảo vệ                  │
│  Provider đã ký quỹ 12.9M VND.       │
│  Nếu có tranh chấp, Admin xử lý      │
│  trong 48h. [Xem chính sách]         │
│                                      │
│  PHIẾU CHUYỂN TIỀN                   │
│  ┌────────────────────────────────┐  │
│  │ Chuyển cho: Hùng Mạnh          │  │
│  │ Phương thức: Zelle             │  │
│  │ Tài khoản: +1 *** *** 7890     │  │
│  │ [Copy]                         │  │
│  │                                │  │
│  │ Khoản P2P cần chuyển: $500.00  │  │
│  │ [Copy]                         │  │
│  │                                │  │
│  │ Memo/Nội dung: RQ-7K2M9        │  │
│  │ [Copy]                         │  │
│  │                                │  │
│  │ [ QR / payment code ]          │  │
│  │ [ Sao chép tất cả ]            │  │
│  └────────────────────────────────┘  │
│                                      │
│  LƯU Ý QUAN TRỌNG                    │
│  Dán đúng mã RQ-7K2M9 vào nội dung. │
│  Sai memo có thể làm chậm đối soát. │
│                                      │
│  PHÍ HỆ THỐNG                        │
│  Phí 0,5%: $2.50                     │
│  Trạng thái: sẽ thu theo chính sách  │
│  nền tảng khi giao dịch hoàn tất.    │
│                                      │
│  [ Đã chuyển tiền & tải bằng chứng ] │
└──────────────────────────────────────┘
```

**States**

| Case | UI response |
|---|---|
| Countdown < 10 phút | Sticky warning “Sắp hết hạn, chỉ chuyển nếu bạn kịp upload proof.” |
| Expired | Disable copy/QR, copy “Yêu cầu đã hết hạn, không chuyển tiền nữa.” |
| Provider account missing | Không nên xảy ra v4; blocking: “Provider thiếu tài khoản nhận. Hỗ trợ đã được thông báo.” |
| User taps copy all | Toast “Đã sao chép số tiền, tài khoản và memo.” |
| Sensitive unmask | Button “Hiện đầy đủ” + PIN/biometric nếu cần. |

---

## R-09. Proof Upload Sheet

| Mục | Nội dung |
|---|---|
| **Dùng cho** | paymentProof, disputeProof, extraEvidence. |
| **Mục tiêu** | Nộp bằng chứng đủ rõ, đủ dữ liệu để đối soát. |
| **Entry** | R-08/R-13. |
| **Exit** | Request detail với proof submitted. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Tải bằng chứng thanh toán           │
│  Bạn đã chuyển $500.00 qua Zelle?    │
│                                      │
│  [ Chụp ảnh biên nhận ]              │
│  [ Chọn từ thư viện ]                │
│                                      │
│  FILES                               │
│  ┌────────────────────────────────┐  │
│  │ receipt_zelle.jpg              │  │
│  │ ✓ Ảnh rõ, có thời gian/số tiền │  │
│  └────────────────────────────────┘  │
│                                      │
│  Mã giao dịch / ghi chú              │
│  [ ZELLE-20260612-XYZ             ]  │
│                                      │
│  Checklist gợi ý                     │
│  ✓ Có số tiền                        │
│  ✓ Có thời gian                      │
│  ✓ Có người nhận hoặc reference      │
│                                      │
│  [ Nộp bằng chứng ]                  │
└──────────────────────────────────────┘
```

**Rules**

- Cho tối đa 10 file ảnh/video/audio; thumbnail ngang có remove trước submit.
- CTA enable khi có ≥1 file hoặc note không rỗng.
- Sau submit, proof immutable; muốn bổ sung phải qua flow “Bổ sung bằng chứng” nếu dispute/Admin yêu cầu.

---

## R-10. Tracking — Waiting Provider

| Mục | Nội dung |
|---|---|
| **Status** | `payment_sent` hoặc `payment_confirmed` |
| **Mục tiêu** | Giảm lo âu khi Requester đã xuống tiền; cho biết SLA, bằng chứng, quyền khiếu nại. |

**Text wireframe — payment_sent**

```text
┌──────────────────────────────────────┐
│  Chờ Provider xác nhận               │
│  Lượt của Hùng Mạnh · còn 38:21      │
│                                      │
│  ① Ghép nối ✓ ② Bạn chuyển ✓         │
│  ③ Provider chuyển ○ ④ Hoàn tất ○    │
│                                      │
│  Bạn đã nộp bằng chứng lúc 12:28.    │
│  Provider cần đối soát tài khoản     │
│  nhận tiền và memo.                  │
│                                      │
│  BẰNG CHỨNG CỦA BẠN                  │
│  REF-8F12A · receipt_zelle.jpg       │
│  Note: ZELLE-20260612-XYZ            │
│                                      │
│  [ Mở chat ]                         │
│  [ Khiếu nại nếu có vấn đề ]         │
└──────────────────────────────────────┘
```

**Text wireframe — payment_confirmed**

```text
Provider đã xác nhận nhận tiền lúc 12:42.
Hùng Mạnh đang chuyển 12.760.000 VND cho Nguyễn Thị M qua Vietcombank.
Cam kết trước 13:42.
[ Mở chat ] [ Khiếu nại nếu quá SLA ]
```

**UI notes**

- “Khiếu nại” không nên là CTA màu đỏ quá sớm; khi quá 80% SLA mới tăng prominence.
- Hệ thống tự chèn system message vào chat khi Provider xác nhận.

---

## R-11. Transfer Proof Review & Complete

| Mục | Nội dung |
|---|---|
| **Status** | `transfer_sent` |
| **Mục tiêu** | Requester xem proof chi trả, kiểm tra với Beneficiary rồi hoàn tất hoặc khiếu nại. |
| **CTA chính** | “Xác nhận đã nhận đủ”. |
| **CTA phụ** | “Chưa nhận đủ / Khiếu nại”. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Provider đã chuyển tiền             │
│  Lượt của bạn · còn 23:10:22         │
│                                      │
│  BẰNG CHỨNG CHI TRẢ                  │
│  REF-TRF-9931 · 13:05                │
│  File: vietcombank_receipt.jpg       │
│  Note: VCB-7650000-2402              │
│                                      │
│  NGƯỜI NHẬN                          │
│  Nguyễn Thị M                        │
│  Vietcombank · ****1234              │
│  Số tiền: 12.760.000 VND             │
│                                      │
│  Trước khi hoàn tất                  │
│  Hãy kiểm tra với người nhận rằng    │
│  tiền đã về đủ.                      │
│                                      │
│  [ Xác nhận đã nhận đủ ]             │
│  [ Chưa nhận đủ / Khiếu nại ]        │
└──────────────────────────────────────┘
```

**Confirm bottom sheet**

```text
Xác nhận Nguyễn Thị M đã nhận đủ 12.760.000 VND?
Hành động này hoàn tất giao dịch và không thể hoàn tác.
[ ] Tôi đã kiểm tra với người nhận.
[ Giữ để xác nhận hoàn tất ]
```

---

## R-12. Completed + Rating + Repeat

| Mục | Nội dung |
|---|---|
| **Status** | `completed` hoặc `resolved` outcome R1_complete. |
| **Mục tiêu** | Khép giao dịch, tạo rating, hỗ trợ repeat remittance. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  🎉 Giao dịch hoàn tất               │
│  Nguyễn Thị M đã nhận 12.760.000 VND │
│                                      │
│  TÓM TẮT                             │
│  Khoản P2P: $500.00                  │
│  Phí hệ thống: $2.50                 │
│  Thời gian xử lý: 54 phút            │
│  Provider ký quỹ: Đã mở khóa         │
│                                      │
│  ĐÁNH GIÁ PROVIDER                   │
│  Hùng Mạnh ✓                         │
│  [ ☆ ☆ ☆ ☆ ☆ ]                       │
│  Tags: Nhanh · Đúng cam kết ·        │
│        Dễ đối soát · Phản hồi tốt    │
│  Nhận xét tùy chọn                   │
│  [ Gửi đánh giá ]                    │
│                                      │
│  [ Gửi lại cho Nguyễn Thị M ]        │
│  [ Xem biên nhận giao dịch ]         │
└──────────────────────────────────────┘
```

**States**

- Rating double-blind: copy “Đánh giá sẽ công khai khi cả hai bên đánh giá hoặc sau 7 ngày.”
- If already rated: show submitted review read-only.
- Repeat CTA pre-fills R-01.

---

## R-13. Dispute Form

| Mục | Nội dung |
|---|---|
| **Status hợp lệ** | `payment_sent`, `payment_confirmed`, `transfer_sent`. |
| **Mục tiêu** | Thu thập khiếu nại có cấu trúc để Admin xử trong 48h. |
| **CTA chính** | “Gửi khiếu nại”. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Khiếu nại giao dịch                 │
│  RQ-7K2M9                            │
│                                      │
│  Case sẽ được phân xử trong 48h.     │
│  Ký quỹ Provider sẽ được freeze.     │
│                                      │
│  VẤN ĐỀ CỦA BẠN *                    │
│  ( ) Provider chưa chi trả           │
│  ( ) Chi thiếu tiền                  │
│  ( ) Chi sai người nhận              │
│  ( ) Quá SLA                         │
│  ( ) Khác                            │
│                                      │
│  MÔ TẢ *                             │
│  [ Người nhận chưa thấy tiền...    ] │
│                                      │
│  BẰNG CHỨNG                          │
│  [+ Thêm ảnh/sao kê/chat]            │
│                                      │
│  [ Gửi khiếu nại ]                   │
└──────────────────────────────────────┘
```

**Validation**

- Category bắt buộc.
- Mô tả tối thiểu đề xuất 20 ký tự.
- Evidence khuyến nghị nhưng không bắt buộc nếu đã có paymentProof; UI nên nhắc “Bằng chứng càng rõ, xử lý càng nhanh.”

---

## R-14. Dispute Detail

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Cho Requester theo dõi case, bổ sung evidence, chat 3 bên. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Khiếu nại đang phân xử              │
│  Case DS-1029 · SLA còn 37h          │
│                                      │
│  TRẠNG THÁI                          │
│  Admin Linh đã nhận case             │
│  Ký quỹ Provider: Đang freeze        │
│                                      │
│  VẤN ĐỀ                              │
│  Provider chưa chi trả               │
│  Bạn gửi lúc 14:10                   │
│                                      │
│  EVIDENCE                            │
│  Payment proof: REF-8F12A            │
│  Dispute proof: bank_screenshot.jpg  │
│                                      │
│  ADMIN YÊU CẦU                       │
│  Vui lòng bổ sung sao kê trong 12h   │
│  [ Bổ sung bằng chứng ]              │
│                                      │
│  CHAT 3 BÊN                          │
│  [ Mở chat ]                         │
└──────────────────────────────────────┘
```

**Outcome state**

```text
Phán quyết: Hoàn tiền Requester
Lý do: Provider đã nhận tiền nhưng không chứng minh được chi trả.
Thực thi: Trích ký quỹ Provider để hoàn tiền.
[ Xem ledger/biên nhận ] [ Phúc thẩm trong 7 ngày ]
```

---

## R-15. Linked Accounts

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Quản lý tài khoản người nhận để tự điền nhanh. |
| **Entry** | Tab Liên kết, R-01 account picker. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Tài khoản liên kết                  │
│  6 tài khoản · 3 loại tiền           │
│  [ + Thêm tài khoản ]                │
│                                      │
│  VND                                 │
│  ┌────────────────────────────────┐  │
│  │ Mẹ - Vietcombank               │  │
│  │ Nguyễn Thị M · VCB ****1234    │  │
│  │ [Copy] [Sửa] [Xóa]             │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Em trai - MoMo                 │  │
│  │ Nguyễn Văn C · 09**•••89       │  │
│  │ [Copy] [Sửa] [Xóa]             │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Delete confirmation**

```text
Xóa tài khoản này?
Tài khoản sẽ không còn được gợi ý khi gửi tiền. Hành động không thể hoàn tác.
[ Hủy ] [ Xóa tài khoản ]
```

---

## R-16. Requester Profile

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Hồ sơ                               │
│  Nguyễn Văn A · KYC T1               │
│  4,7★ · 12 giao dịch · Đúng hạn 92%  │
│                                      │
│  Hạn mức 30 ngày                     │
│  Đã dùng: $1.800 / $5.000            │
│  [ Nâng cấp KYC ]                    │
│                                      │
│  MENU                                │
│  Tài khoản liên kết                  │
│  Lịch sử giao dịch                   │
│  Thông báo                           │
│  Bảo mật & thiết bị                  │
│  Trợ giúp & chính sách               │
│  Chuyển vai trò                      │
│  Đăng xuất                           │
└──────────────────────────────────────┘
```

---

# 5. Provider Mobile App

## 5.1. Navigation Provider

```text
Bottom Tab
[ Trang chủ ] [ Deals ] [ Yêu cầu ] [ Ví/Hồ sơ ]
```

- Badge “Yêu cầu” = số item cần Provider xử lý.
- Provider dashboard ưu tiên “Cần xử lý ngay”, sau đó mới đến doanh thu/số liệu.

---

## P-01. Provider Activation Checklist

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Đưa user từ trạng thái chưa đủ điều kiện thành Provider active. |
| **Entry** | Chọn role Provider khi chưa KYC T2/chưa ví/chưa tài khoản nhận. |
| **Exit** | P-02 Dashboard. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Kích hoạt Provider                  │
│  Hoàn tất các bước để nhận yêu cầu   │
│                                      │
│  ✓ KYC T1 hoàn tất                   │
│  ○ KYC T2: địa chỉ + nguồn tiền      │
│    [ Tiếp tục KYC T2 ]               │
│                                      │
│  ○ Nạp ví ký quỹ tối thiểu           │
│    Cần tối thiểu: $500               │
│    [ Nạp ví ]                        │
│                                      │
│  ○ Thêm tài khoản nhận tiền          │
│    Ví dụ: Zelle/PayPal/Bank          │
│    [ Thêm tài khoản ]                │
│                                      │
│  ○ Chấp thuận điều khoản Provider    │
│    SLA, phí, phạt, dispute           │
│    [ Xem & đồng ý ]                  │
└──────────────────────────────────────┘
```

**UI notes**

- Không cho tạo deal nếu checklist chưa đạt điều kiện bắt buộc.
- Checklist cần resume được, không ép làm lại.

---

## P-02. Provider Dashboard — Action First

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Provider biết ngay việc nào cần xử lý để tránh quá SLA. |
| **Entry** | Tab Trang chủ. |
| **Exit** | Request detail, create deal, wallet. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Xin chào, Nguyễn Văn B              │
│  Cần xử lý ngay trước, số liệu sau   │
│                                      │
│  VÍ & KÝ QUỸ                         │
│  Khả dụng: $3.850                    │
│  Đang ký quỹ: $1.250                 │
│  Freeze: $0                          │
│  [ Nạp ví ] [ Xem ledger ]           │
│                                      │
│  CẦN XỬ LÝ NGAY                      │
│  ┌────────────────────────────────┐  │
│  │ RQ-7K2M9 · Chờ chấp nhận        │  │
│  │ Còn 01:12                      │  │
│  │ $500 → 12.760.000 VND           │  │
│  │ [ Xem & duyệt ]                 │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ RQ-6A1T2 · Đã có payment proof  │  │
│  │ Còn 00:33 để xác nhận           │  │
│  │ [ Đối soát ]                    │  │
│  └────────────────────────────────┘  │
│                                      │
│  TỔNG QUAN                           │
│  Deals mở: 4 · Hoàn tất: 248         │
│  Đúng SLA: 98% · Rating: 4,9★        │
│                                      │
│  [ Tạo deal ] [ Xem tất cả yêu cầu ] │
└──────────────────────────────────────┘
```

**States**

- Không có việc cần xử lý: “Bạn đang đúng hạn” + CTA “Tạo deal mới”.
- Sắp quá SLA: card đầu danh sách, warning màu cam.
- Ví thấp: wallet card warning “Ví khả dụng chỉ còn đủ nhận $X”.

---

## P-03. Deals List

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Quản lý deal active/paused/expired và hiệu quả từng deal. |
| **Entry** | Tab Deals. |
| **Exit** | P-04 Create/Edit, P-05 Detail. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Deals của tôi                       │
│  [ + Tạo deal ]                      │
│                                      │
│  [Tất cả] [Hoạt động] [Tạm dừng]     │
│  [Hết hạn] [Cần chú ý]               │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ USD → VND       Hoạt động       │  │
│  │ Rate: 25.520 · Market +0,08%    │  │
│  │ Limit: $50 - $3.000             │  │
│  │ SLA: 1-2 giờ                    │  │
│  │ Nhận: Zelle, Bank               │  │
│  │ Chi: MoMo, Bank                 │  │
│  │ Hôm nay: 8 request              │  │
│  │ [Sửa] [Tạm dừng] [Chi tiết]     │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Rules**

- “Xóa” chỉ ở detail/more menu, không đặt cạnh CTA thường.
- Pause active deal không ảnh hưởng request đang xử lý.
- Expired deal có CTA “Đăng lại” thay vì “Kích hoạt”.

---

## P-04. Create/Edit Deal

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Provider niêm yết hoặc sửa deal có version, bảo đảm đủ account và ký quỹ. |
| **Entry** | P-03 “Tạo deal”/“Sửa”. |
| **Exit** | P-03 với deal saved. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Tạo deal                            │
│  Điều kiện mới sẽ áp dụng cho request│
│  tạo sau thời điểm lưu.              │
│                                      │
│  CẶP TIỀN TỆ                         │
│  Tôi nhận       [ USD ▾ ]            │
│  Tôi chi trả    [ VND ▾ ]            │
│                                      │
│  TỶ GIÁ                              │
│  1 USD = [ 25.520 ] VND              │
│  Market: 25.500 · lệch +0,08%        │
│  Lãi/lỗ ước tính mỗi $1.000: +20.000đ│
│                                      │
│  HẠN MỨC                             │
│  Tối thiểu [ 50 ]  Tối đa [ 3000 ]   │
│  Ví khả dụng đủ nhận tối đa: $3.850  │
│                                      │
│  PHƯƠNG THỨC                         │
│  Người gửi trả tôi qua:              │
│  [✓ Zelle] [✓ Bank] [ PayPal ]       │
│  Tôi chi trả người nhận qua:         │
│  [✓ Bank] [✓ MoMo] [ ZaloPay ]       │
│                                      │
│  SLA CHI TRẢ                         │
│  [30-60 phút] [1-2 giờ] [Trong ngày] │
│                                      │
│  HIỆU LỰC                            │
│  [7 ngày] [14 ngày] [30 ngày]        │
│                                      │
│  Ghi chú                             │
│  [ Chỉ xử lý trước 22:00...       ]  │
│                                      │
│  [ Lưu deal ]                        │
└──────────────────────────────────────┘
```

**Validation**

| Case | UI |
|---|---|
| Rate lệch > ±3% | Warning: “Tỷ giá lệch thị trường, xác nhận trước khi lưu.” |
| Rate lệch > ±10% | Blocking: “Tỷ giá vượt ngưỡng an toàn.” |
| Thiếu account cho method nhận | Blocking: “Thiếu tài khoản Zelle USD. Thêm tài khoản trước khi đăng.” |
| Max vượt capacity | Error dưới max amount. |
| Edit deal | Header “Sửa deal — tạo version mới”; show current version number. |

---

## P-05. Deal Detail & Version History

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Deal USD → VND                      │
│  Active · Version v6                 │
│                                      │
│  Rate 25.520 · Market +0,08%         │
│  Limit $50-$3.000                    │
│  SLA 1-2 giờ                         │
│  Requests hôm nay: 8                 │
│  Completion: 98%                     │
│                                      │
│  ACTIONS                             │
│  [ Sửa tạo version mới ]             │
│  [ Tạm dừng deal ]                   │
│  [ Xóa deal ]                        │
│                                      │
│  VERSION HISTORY                     │
│  v6 · 12/06 10:15 · rate 25.520      │
│  v5 · 10/06 09:00 · rate 25.480      │
└──────────────────────────────────────┘
```

**Delete guard**: nếu còn request sống, “Không thể xóa deal đang có giao dịch sống. Hãy tạm dừng deal và xử lý xong request.”

---

## P-06. Provider Request List

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Yêu cầu                             │
│  [Cần làm 3] [Chờ khách] [Hoàn thành]
│  [Khiếu nại/Đã đóng]                 │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ RQ-7K2M9 · Nguyễn Văn A         │  │
│  │ Chờ chấp nhận · còn 01:12       │  │
│  │ KYC T1 · 4,7★ · 0 vi phạm       │  │
│  │ $500 → 12.760.000 VND           │  │
│  │ [ Duyệt ]                       │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ RQ-6A1T2 · Payment proof mới    │  │
│  │ Còn 00:33 để xác nhận           │  │
│  │ [ Đối soát ]                    │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Sort rule**: items cần Provider hành động sắp theo SLA còn lại tăng dần.

---

## P-07. Request Review — Accept/Reject

| Mục | Nội dung |
|---|---|
| **Status** | `pending_acceptance` |
| **Mục tiêu** | Provider quyết định nhận/từ chối request, thấy rõ ký quỹ và nghĩa vụ. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Duyệt yêu cầu                       │
│  RQ-7K2M9 · còn 01:12                │
│                                      │
│  REQUESTER                           │
│  Nguyễn Văn A · KYC T1               │
│  4,7★ · 12 GD · 0 vi phạm 30 ngày    │
│                                      │
│  NGHĨA VỤ GIAO DỊCH                  │
│  Nhận từ Requester: $500.00 qua Zelle│
│  Phí nền tảng liên quan: $2.50       │
│  Chi trả Beneficiary: 12.760.000 VND │
│  Người nhận: Nguyễn Thị M            │
│  Vietcombank · ****1234              │
│                                      │
│  KHI CHẤP NHẬN                       │
│  Ký quỹ sẽ khóa: 12.9M VND           │
│  Ví còn lại sau khóa: 86.2M VND      │
│  Requester có 60 phút để chuyển tiền │
│  Bạn phải chi trả trong SLA 1-2 giờ  │
│                                      │
│  [ Chấp nhận ]                       │
│  [ Từ chối ]                         │
└──────────────────────────────────────┘
```

**Accept confirm sheet**

```text
Xác nhận chấp nhận RQ-7K2M9?
Hệ thống sẽ khóa 12.9M VND ký quỹ trong ví của bạn.
Bạn chỉ được mở khóa khi giao dịch completed/expired/resolved.
[ ] Tôi hiểu nghĩa vụ nhận tiền và chi trả đúng SLA.
[ Giữ để chấp nhận ]
```

**Reject sheet**

```text
Từ chối yêu cầu
Chọn lý do bắt buộc:
( ) Tỷ giá đã thay đổi
( ) Hết hạn mức
( ) Không hỗ trợ phương thức
( ) Nghi ngờ rủi ro
( ) Khác
[ Xác nhận từ chối ]
```

---

## P-08. Payment Proof Review / Confirm Received

| Mục | Nội dung |
|---|---|
| **Status** | `payment_sent` |
| **Mục tiêu** | Provider đối soát tiền thật, memo và proof trước khi xác nhận không thể đảo ngược. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Đối soát tiền vào                   │
│  RQ-7K2M9 · còn 00:33                │
│                                      │
│  PAYMENT PROOF                       │
│  REF-8F12A · 12:28                   │
│  File: receipt_zelle.jpg             │
│  Note: ZELLE-20260612-XYZ            │
│  [ Xem full screen ]                 │
│                                      │
│  THÔNG TIN CẦN ĐỐI SOÁT              │
│  Số tiền cần nhận: $500.00           │
│  Phương thức: Zelle                  │
│  Memo: RQ-7K2M9                      │
│                                      │
│  CHECKLIST                           │
│  [ ] Tiền đã về tài khoản thật       │
│  [ ] Số tiền đúng                    │
│  [ ] Memo/reference đúng             │
│                                      │
│  [ Xác nhận đã nhận đủ ]             │
│  [ Tôi chưa nhận được / nhận sai ]   │
└──────────────────────────────────────┘
```

**UI notes**

- CTA confirm disabled đến khi Provider tick đủ checklist.
- Nếu “Tôi chưa nhận được/nhận sai” và đã qua 30 phút từ proof, mở P-10 dispute.
- Nếu chưa qua 30 phút, copy: “Vui lòng chờ ít nhất 30 phút để tránh khiếu nại do ngân hàng chậm.”

---

## P-09. Transfer to Beneficiary

| Mục | Nội dung |
|---|---|
| **Status** | `payment_confirmed` |
| **Mục tiêu** | Provider chi trả đúng người nhận, đúng số tiền, đúng memo và upload proof. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Chi trả người nhận                  │
│  RQ-7K2M9 · còn 01:38                │
│                                      │
│  PHIẾU CHI TRẢ                       │
│  ┌────────────────────────────────┐  │
│  │ Số tiền: 12.760.000 VND        │  │
│  │ [Copy]                         │  │
│  │ Người nhận: Nguyễn Thị M       │  │
│  │ Ngân hàng: Vietcombank         │  │
│  │ Số TK: ****1234 [Hiện/Copy]    │  │
│  │ Nội dung: RQ-7K2M9 [Copy]      │  │
│  │ [ QR/VietQR nếu khả dụng ]     │  │
│  │ [ Sao chép tất cả ]            │  │
│  └────────────────────────────────┘  │
│                                      │
│  CẢNH BÁO                            │
│  Chỉ bấm “Đã chuyển” sau khi giao    │
│  dịch ngân hàng/ví thành công.       │
│                                      │
│  [ Đã chuyển & tải proof ]           │
│  [ Chat với Requester ]              │
└──────────────────────────────────────┘
```

**Proof upload**: dùng R-09 component nhưng copy đổi thành “Tải bằng chứng chi trả”.

---

## P-10. Provider Dispute Form

| Mục | Nội dung |
|---|---|
| **Status hợp lệ** | `payment_sent` sau ≥30 phút hoặc `transfer_sent`. |
| **Mục tiêu** | Provider mở dispute có cấu trúc khi nhận thiếu/không nhận tiền hoặc Requester không xác nhận. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Khiếu nại giao dịch                 │
│  RQ-7K2M9                            │
│                                      │
│  Loại vấn đề *                       │
│  ( ) Không nhận được tiền            │
│  ( ) Nhận thiếu tiền                 │
│  ( ) Sai memo/reference              │
│  ( ) Requester không xác nhận        │
│  ( ) Khác                            │
│                                      │
│  Mô tả *                             │
│  [ Tôi chưa thấy tiền về Zelle...  ] │
│                                      │
│  Bằng chứng *                        │
│  [+ Tải sao kê / biên nhận chi trả]  │
│                                      │
│  [ Gửi khiếu nại ]                   │
└──────────────────────────────────────┘
```

**Validation**: Với “Không nhận/nhận thiếu/sai memo”, cần sao kê hoặc ảnh tài khoản nhận trong thời gian liên quan; nếu không, CTA vẫn có thể cho gửi nhưng warning “Thiếu sao kê có thể kéo dài phân xử”.

---

## P-11. Provider Wallet & Ledger

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Quản lý số dư khả dụng, ký quỹ, freeze và lịch sử bút toán. |
| **Entry** | Tab Ví/Hồ sơ, dashboard wallet card, accept insufficient wallet. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Ví & ký quỹ                         │
│                                      │
│  SỐ DƯ                               │
│  Khả dụng:       $3.850,00           │
│  Đang ký quỹ:    $1.250,00           │
│  Đang freeze:    $0,00               │
│  Tổng ví:        $5.100,00           │
│                                      │
│  [ Nạp ví ] [ Rút tiền ]             │
│                                      │
│  LEDGER                              │
│  [Tất cả] [Nạp/Rút] [Ký quỹ] [Phí]   │
│                                      │
│  LOCK_COLLATERAL                     │
│  RQ-7K2M9 · -12.9M VND · 12:08       │
│                                      │
│  UNLOCK_COLLATERAL                   │
│  RQ-6A1T2 · +7.6M VND · completed    │
│                                      │
│  FEE_PROVIDER                        │
│  RQ-6A1T2 · -$2.50                   │
└──────────────────────────────────────┘
```

**Top-up sheet**

```text
Nạp ví
Số tiền [ $500 ]
Phương thức [ Bank/Card/Partner ]
Phí nạp nếu có
[ Tiếp tục nạp ]
```

**UI notes**

- Ledger row là read-only, có detail popover chứa transaction id, request id, timestamp, balance before/after.
- Trạng thái pending top-up không được tính vào available balance cho accept.

---

## P-12. Provider Payment Accounts

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Provider khai báo tài khoản nhận tiền để Requester thanh toán. |

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Tài khoản nhận tiền                 │
│  Dùng để Requester thanh toán cho bạn│
│  [ + Thêm tài khoản ]                │
│                                      │
│  USD                                 │
│  ┌────────────────────────────────┐  │
│  │ Zelle chính                    │  │
│  │ +1 *** *** 7890                │  │
│  │ Đang dùng bởi 2 deal           │  │
│  │ [Copy] [Sửa] [Xóa]             │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Venmo                          │  │
│  │ @hungm                         │  │
│  │ [Copy] [Sửa] [Xóa]             │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Form**

```text
Tiền tệ [ USD ▾ ]
Phương thức [ Zelle ▾ ]
Tên gợi nhớ [ Zelle chính ]
Số điện thoại/email [ +1 ... ]
[ Lưu tài khoản ]
```

**Rules**

- Xóa account đang dùng bởi deal active: block và CTA “Tạm dừng/sửa deal trước”.
- Sửa account đang có request sống: cho tạo version/effective từ request mới, không thay đổi request đã chốt.

---

## P-13. Provider Profile & Reputation

**Text wireframe**

```text
┌──────────────────────────────────────┐
│  Hồ sơ Provider                      │
│  Nguyễn Văn B ✓ · KYC T2             │
│  4,9★ · 248 giao dịch                │
│  Đúng SLA 98% · Tranh chấp 0,4%      │
│                                      │
│  KPI                                 │
│  Hoàn tất tháng này: 18              │
│  Median response: 12 phút            │
│  Median payout: 42 phút              │
│                                      │
│  MENU                                │
│  Ví & ký quỹ                         │
│  Tài khoản nhận tiền                 │
│  Lịch sử giao dịch                   │
│  Đánh giá nhận được                  │
│  Điều khoản Provider                 │
│  Cài đặt thông báo SLA               │
│  Bảo mật & thiết bị                  │
│  Chuyển vai trò                      │
│  Đăng xuất                           │
└──────────────────────────────────────┘
```

---

# 6. Admin / Trọng tài Web Console

## 6.1. Admin layout shell

```text
┌────────────────────────────────────────────────────────────────────┐
│ Topbar: P2P Remit Ops · Search request/user · Admin Linh            │
├───────────────┬────────────────────────────────────────────────────┤
│ Sidebar       │ Content area                                       │
│ Dashboard     │                                                    │
│ Disputes      │                                                    │
│ Users         │                                                    │
│ Deals         │                                                    │
│ Ledger        │                                                    │
│ Risk/AML      │                                                    │
│ Config        │                                                    │
│ Reports       │                                                    │
└───────────────┴────────────────────────────────────────────────────┘
```

---

## A-01. Admin Shell / Dashboard

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Cho Admin nhìn việc vận hành cần xử lý: dispute, SLA escalation, AML alerts. |

**Text wireframe**

```text
┌────────────────────────────────────────────────────────────────────┐
│ Dashboard vận hành                                                 │
│                                                                    │
│ KPI CARDS                                                          │
│ Dispute đang mở: 12 | Quá SLA: 2 | Escalation: 5 | AML alerts: 7   │
│                                                                    │
│ CẦN XỬ LÝ NGAY                                                     │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ RQ-7K2M9 · Dispute · SLA còn 03:12 · Amount $502.50           │  │
│ │ Reason: Provider chưa chi trả · [Nhận case]                   │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ BIỂU ĐỒ NHANH                                                      │
│ Completion rate · Dispute outcome distribution · SLA trend          │
└────────────────────────────────────────────────────────────────────┘
```

---

## A-02. Dispute Queue

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Sắp xếp, lọc và assign case dispute/escalation theo SLA và mức rủi ro. |
| **Entry** | Sidebar Disputes, notification escalation. |
| **Exit** | A-03 Workbench. |

**Text wireframe**

```text
┌────────────────────────────────────────────────────────────────────┐
│ Hàng đợi khiếu nại                                                 │
│ Sắp theo SLA còn lại, ưu tiên case tiền lớn/rủi ro cao             │
│                                                                    │
│ [Disputed 12] [Escalated 5] [Resolved today 18] [Overdue 2]         │
│                                                                    │
│ Filters: Status ▾ Reason ▾ Corridor ▾ Amount ▾ Assignee ▾ SLA ▾    │
│                                                                    │
│ ┌──────────┬──────┬────────┬─────────────┬────────────┬─────────┐ │
│ │ Case     │ SLA  │ Amount │ Disputed by │ Reason     │ Action  │ │
│ ├──────────┼──────┼────────┼─────────────┼────────────┼─────────┤ │
│ │ RQ-7K2M9 │ 38h  │ $502   │ Requester   │ No payout  │ Open    │ │
│ │ RQ-8F12A │ 04h  │ $1200  │ Provider    │ No payment │ Open    │ │
│ └──────────┴──────┴────────┴─────────────┴────────────┴─────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

**Interactions**

- Row click mở A-03.
- Multi-assign chỉ cho role Ops Lead.
- SLA < 6h highlight warning; SLA overdue highlight danger.

---

## A-03. Arbitration Workbench

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Admin xem toàn cảnh transaction, evidence, chat, risk và ra phán quyết R1-R4. |
| **Entry** | A-02 row click. |
| **Exit** | `resolved` sau phán quyết hoặc request more evidence. |

**Text wireframe**

```text
┌────────────────────────────────────────────────────────────────────┐
│ Bàn phân xử RQ-7K2M9                                SLA còn 38h    │
│ Status: disputed · Collateral frozen: 12.9M VND                    │
├──────────────────────┬───────────────────────────┬────────────────┤
│ TIMELINE             │ TRANSACTION SUMMARY        │ EVIDENCE       │
│ 12:00 Request created│ Requester: Nguyễn Văn A    │ Payment proof  │
│ 12:08 Accepted       │ KYC T1 · 0 violation       │ ✓ REF-8F12A    │
│ 12:28 Payment proof  │ Provider: Hùng Mạnh        │ Transfer proof │
│ 12:42 Confirmed      │ KYC T2 · SLA 98%           │ ⚠ Need review  │
│ 14:10 Disputed       │ Amount: $500 → 12.76M VND │ Dispute proof  │
│                      │ Beneficiary: Nguyễn Thị M  │ ✓ screenshot   │
│                      │ Memo: RQ-7K2M9             │                │
├──────────────────────┴───────────────────────────┴────────────────┤
│ CHAT 3 BÊN                                                         │
│ Requester: Người nhận chưa thấy tiền.                              │
│ Provider: Tôi đã chuyển, đang tìm biên nhận.                       │
│ Admin: Vui lòng bổ sung sao kê trong 12h.                          │
├────────────────────────────────────────────────────────────────────┤
│ DECISION PANEL                                                     │
│ ( ) R1 Complete - xác nhận hoàn tất                                │
│ ( ) R2 Refund Requester - hoàn tiền từ ký quỹ Provider             │
│ ( ) R3 No Payment - Requester chưa thanh toán                      │
│ ( ) R4 Mutual Cancel - hủy đồng thuận/lỗi khách quan               │
│                                                                    │
│ Căn cứ phán quyết *                                                │
│ [ Nhập lý do, evidence tham chiếu...                             ] │
│                                                                    │
│ LEDGER PREVIEW                                                     │
│ Debit collateral: 12.760.000 VND                                   │
│ Penalty Provider: 0,5%                                              │
│ Credit Requester compensation wallet/account                       │
│                                                                    │
│ [ Yêu cầu bổ sung evidence ] [ Ra phán quyết & thực thi ]          │
└────────────────────────────────────────────────────────────────────┘
```

**Decision guard**

| Outcome | Điều kiện UI bắt buộc |
|---|---|
| R1_complete | Cần transfer evidence đủ hoặc xác nhận Beneficiary nhận tiền. |
| R2_refund_requester | Cần chứng minh Provider nhận tiền nhưng không/chi sai; ledger preview không âm vượt collateral. |
| R3_no_payment | Cần chứng minh payment proof giả/không có tiền về; mở khóa collateral Provider. |
| R4_mutual_cancel | Cần note lỗi khách quan/đồng thuận hoặc evidence ngân hàng. |

---

## A-04. Evidence Request / 3-party Chat

**Text wireframe**

```text
┌────────────────────────────────────────────────────────────────────┐
│ Yêu cầu bổ sung bằng chứng                                         │
│ Case RQ-7K2M9                                                       │
│                                                                    │
│ Gửi tới: [Requester] [Provider] [Cả hai]                            │
│ Deadline: [12 giờ ▾]                                                │
│ Nội dung yêu cầu:                                                   │
│ [ Vui lòng tải sao kê thể hiện giao dịch từ 12:00-14:00...       ] │
│                                                                    │
│ [ Gửi yêu cầu ]                                                     │
└────────────────────────────────────────────────────────────────────┘
```

**Chat rules**

- Admin message có badge “Admin/Trọng tài”.
- Không cho user xóa/sửa message.
- Attachment trong chat được liên kết vào evidence nếu Admin đánh dấu.

---

## A-05. User Risk Profile

**Text wireframe**

```text
┌────────────────────────────────────────────────────────────────────┐
│ User Risk Profile: Nguyễn Văn A                                    │
│ Role: Requester · KYC T1 · Status: Active                          │
│                                                                    │
│ SUMMARY                                                            │
│ Completed: 12 | Rating: 4.7 | Violation 30d: 0 | Dispute rate: 2%  │
│ Volume 30d: $1.800 / Limit $5.000                                  │
│                                                                    │
│ KYC                                                                │
│ ID verified ✓ | Liveness ✓ | Address not required for T1           │
│                                                                    │
│ TRANSACTION HISTORY                                                │
│ RQ-7K2M9 disputed · $500                                           │
│ RQ-6A1T2 completed · $300                                          │
│                                                                    │
│ RISK FLAGS                                                         │
│ None                                                               │
│                                                                    │
│ ADMIN ACTIONS                                                      │
│ [ Adjust limit ] [ Request re-KYC ] [ Temporary lock ]             │
└────────────────────────────────────────────────────────────────────┘
```

---

## A-06. Deal Moderation

**Text wireframe**

```text
┌────────────────────────────────────────────────────────────────────┐
│ Deal Moderation                                                    │
│ Filters: Active · Reported · Rate outlier · Provider warning        │
│                                                                    │
│ Deal ID | Provider | Corridor | Rate vs Market | Status | Action   │
│ D-1001  | Hùng Mạnh| USD/VND  | +0.08%         | Active | Review   │
│ D-1002  | A.B      | USD/VND  | +12.5%         | Blocked| Review   │
│                                                                    │
│ Detail panel: version history, method/account coverage, reports.   │
│ Actions: Warn Provider · Force pause · Hide deal · Require edit.    │
└────────────────────────────────────────────────────────────────────┘
```

---

## A-07. Ledger & Reconciliation

**Text wireframe**

```text
┌────────────────────────────────────────────────────────────────────┐
│ Ledger & Reconciliation                                            │
│ Search: requestId / userId / ledgerId                              │
│                                                                    │
│ Filters: Type · Currency · Date · Status · Reconciliation state     │
│                                                                    │
│ Ledger ID | Time | Type | User | Request | Debit | Credit | Balance│
│ L-8821    |12:08 |LOCK  |ProvB |RQ-7K2M9 |12.9M | 0      | ...    │
│ L-8822    |14:50 |REFUND|ReqA  |RQ-7K2M9 |0     |12.76M | ...    │
│                                                                    │
│ Reconciliation warnings                                            │
│ • Ledger missing external payout reference                         │
│ • Pending top-up > 24h                                             │
└────────────────────────────────────────────────────────────────────┘
```

**UI notes**: mọi bút toán read-only; correction phải qua adjustment flow có maker-checker nếu triển khai thật.

---

## A-08. AML / Risk Alerts

**Text wireframe**

```text
┌────────────────────────────────────────────────────────────────────┐
│ AML / Risk Alerts                                                  │
│                                                                    │
│ [High] Structuring detected                                         │
│ User: Nguyễn Văn A · 8 transactions below $1.000 in 3 days          │
│ Related beneficiaries: 2                                            │
│ [ Open investigation ] [ Dismiss with reason ]                      │
│                                                                    │
│ [Medium] Shared beneficiary pattern                                 │
│ 5 Requesters → same bank account ****1234                           │
│ [ View network ]                                                    │
│                                                                    │
│ [High] Off-platform attempt in chat                                 │
│ Message contains phone/fee bypass phrase                            │
│ [ Review chat ]                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## A-09. Config Center

**Text wireframe**

```text
┌────────────────────────────────────────────────────────────────────┐
│ System Configuration                                               │
│ Tabs: SLA Timers · Fee · Collateral · Corridor · Notifications      │
│                                                                    │
│ SLA TIMERS                                                         │
│ T1 pending_acceptance: [2h]                                         │
│ T2 accepted/payment due: [1h]                                       │
│ T3 payment_sent confirm: [1h]                                      │
│ T4 payout SLA: [deal SLA + 30m]                                     │
│ T5 transfer_sent completion: [24h]                                  │
│ T6 disputed admin SLA: [48h]                                        │
│                                                                    │
│ [ Save draft ] [ Submit for approval ]                             │
└────────────────────────────────────────────────────────────────────┘
```

**Maker-checker note**: cấu hình tài chính/SLA không nên apply ngay bởi một Admin đơn lẻ; cần submit/approve.

---

## A-10. Reporting Dashboard

**Text wireframe**

```text
┌────────────────────────────────────────────────────────────────────┐
│ Reports                                                           │
│ Date range: Last 30 days · Corridor: All                           │
│                                                                    │
│ TRANSACTION HEALTH                                                 │
│ Completion rate · Median phase time · Expired by timer             │
│                                                                    │
│ DISPUTE                                                            │
│ Dispute rate · Outcome R1/R2/R3/R4 · Median resolution time         │
│                                                                    │
│ FINANCE                                                            │
│ GMV · Fee revenue · Penalties · Collateral locked                   │
│                                                                    │
│ TRUST                                                              │
│ Provider SLA ranking · Rating distribution · Requester violations   │
│                                                                    │
│ RISK                                                               │
│ AML alerts · Fraud/no-payment rate · Off-platform attempts          │
└────────────────────────────────────────────────────────────────────┘
```

---

# 7. Component Wireframes chi tiết

## 7.1. AppHeaderWithTimer

```text
┌──────────────────────────────────────┐
│ < Back     RQ-7K2M9            Help  │
│ Provider đang chuyển cho người nhận  │
│ Lượt của Provider · còn 01:20        │
└──────────────────────────────────────┘
```

**Props**: `requestId`, `statusLabel`, `currentActor`, `deadlineAt`, `severity`, `helpLink`.

## 7.2. FourPhaseStepper

```text
① Ghép nối ✓ ━ ② Bạn chuyển ✓ ━ ③ Provider chuyển ● ━ ④ Hoàn tất ○
```

**Mapping**

| Phase | Status |
|---|---|
| Ghép nối | `pending_acceptance`, `accepted` |
| Bạn chuyển | `accepted`, `payment_sent` |
| Provider chuyển | `payment_confirmed`, `transfer_sent` |
| Hoàn tất | `completed`, `resolved R1` |

## 7.3. TransferTicket

```text
┌──────────────────────────────────────┐
│ PHIẾU CHUYỂN TIỀN                    │
│ Chuyển cho: Hùng Mạnh                │
│ Tài khoản: +1 *** *** 7890 [Copy]    │
│ Số tiền: $500.00 [Copy]              │
│ Memo: RQ-7K2M9 [Copy]                │
│ [QR]                                 │
│ [Sao chép tất cả]                    │
└──────────────────────────────────────┘
```

**Rules**: memo nổi bật, không wrap; QR full screen khi tap; copy all format chuẩn theo method.

## 7.4. DealCard

```text
┌──────────────────────────────────────┐
│ Recommended · Khớp 100%              │
│ Hùng Mạnh ✓                          │
│ 4.9★ · 512 GD · Đúng hạn 98%         │
│ Rate 25.520                          │
│ Bạn nhận 12.760.000 VND              │
│ SLA 30-60 phút                       │
│ [Chọn deal này]                      │
└──────────────────────────────────────┘
```

## 7.5. ProofCard

```text
┌──────────────────────────────────────┐
│ Bằng chứng thanh toán                │
│ REF-8F12A · 12/06/2026 12:28         │
│ receipt_zelle.jpg [thumbnail]        │
│ Note: ZELLE-20260612-XYZ             │
│ Status: Đã nộp · Không thể chỉnh sửa │
└──────────────────────────────────────┘
```

## 7.6. ConfirmCriticalActionSheet

```text
┌──────────────────────────────────────┐
│ Xác nhận hành động                   │
│ Hành động này không thể hoàn tác.    │
│ Hệ quả: ...                          │
│ [ ] Tôi đã kiểm tra và hiểu hệ quả.  │
│ [Giữ để xác nhận]                    │
└──────────────────────────────────────┘
```

## 7.7. AdminDecisionPanel

```text
┌──────────────────────────────────────┐
│ Phán quyết                           │
│ ( ) R1 Complete                      │
│ ( ) R2 Refund Requester              │
│ ( ) R3 No Payment                    │
│ ( ) R4 Mutual Cancel                 │
│ Căn cứ * [ ... ]                     │
│ Ledger preview                       │
│ [Ra phán quyết & thực thi]           │
└──────────────────────────────────────┘
```

---

# 8. State, Error, Empty, Loading patterns

## 8.1. Global empty states

| Context | Copy | CTA |
|---|---|---|
| No deals | “Chưa có deal phù hợp với nhu cầu này.” | “Sửa yêu cầu”, “Báo tôi khi có deal” |
| No requests | “Bạn chưa có giao dịch nào đang xử lý.” | “Gửi tiền” |
| No Provider tasks | “Bạn đang đúng hạn. Không có việc cần xử lý.” | “Tạo deal” |
| No linked accounts | “Thêm người nhận để gửi tiền nhanh hơn.” | “Thêm tài khoản” |

## 8.2. Business errors

| Error code UI | Copy | Recovery |
|---|---|---|
| `KYC_LIMIT_EXCEEDED` | “Số tiền vượt hạn mức KYC hiện tại.” | Nâng cấp KYC / giảm số tiền |
| `DEAL_CHANGED` | “Deal đã thay đổi trước khi bạn gửi yêu cầu.” | Reload deal / chọn deal khác |
| `INSUFFICIENT_COLLATERAL` | “Ví Provider không đủ ký quỹ.” | Nạp ví |
| `SLA_EXPIRED` | “Yêu cầu đã hết hạn, không chuyển tiền nữa.” | Tìm deal khác |
| `MISSING_PROVIDER_ACCOUNT` | “Provider thiếu tài khoản nhận tiền cho phương thức này.” | Hỗ trợ / chọn deal khác |
| `PROOF_UPLOAD_FAILED` | “Tải bằng chứng thất bại.” | Retry / lưu nháp |

## 8.3. Loading states

- Deal Results: skeleton 3 cards, header vẫn hiển thị nhu cầu đã nhập.
- Request Detail: load header/status first, proof/chat lazy load.
- Admin Workbench: timeline + summary first, evidence thumbnails lazy.
- Financial transition: disable CTA; show “Đang xử lý an toàn…”; prevent double submit.

## 8.4. Offline states

- Cho xem cached request detail nhưng không cho chuyển trạng thái.
- Proof upload có draft local; final submit cần online.
- Payment instruction nếu đã mở trước đó có thể cache masked values; unmask lại cần online/session hợp lệ.

---

# 9. Accessibility, Localization, Data Protection

| Hạng mục | Yêu cầu UI |
|---|---|
| Touch target | ≥44px cho button, chip, copy icon. |
| Contrast | Badge warning/danger đạt WCAG AA; không dùng màu là ý nghĩa duy nhất. |
| Screen reader | Stepper đọc “Bước 2/4: Bạn chuyển tiền”; countdown dùng aria-live polite. |
| Money format | VND không lẻ; USD/EUR 2 decimals; luôn có ISO code nếu dễ nhầm. |
| Time format | Relative + absolute khi tap/hover: “12 phút trước · 12/06 10:15”. |
| Masking | SĐT `09**•••89`, account `****1234`; unmask theo context + audit. |
| Proof privacy | Thumbnail không hiển thị full số tài khoản nếu không cần; full view cần quyền đúng role. |
| Emoji | Không dùng emoji làm carrier nghĩa duy nhất; luôn kèm text/icon system. |

---

# 10. Figma handoff đề xuất

## 10.1. Page structure

```text
00 Cover & Principles
01 Design Tokens
02 Components - Mobile
03 Components - Admin Web
04 Requester - Happy Path
05 Requester - Edge/Dispute/Completed
06 Provider - Dashboard/Deals
07 Provider - Request Execution/Wallet
08 Admin - Dispute Ops
09 Admin - Risk/Ledger/Config
10 Prototype Flows
11 QA State Matrix
```

## 10.2. Prototype flows cần click được

| Flow | Screens |
|---|---|
| Requester happy path | R-01 → R-02 → R-03 → R-05 → R-07 → R-08 → R-09 → R-10 → R-11 → R-12 |
| Requester no deal | R-01 → R-03 empty → edit amount/method |
| Requester dispute | R-10/R-11 → R-13 → R-14 → resolved outcome |
| Provider accept | P-02 → P-07 → accepted state |
| Provider insufficient collateral | P-07 → insufficient wallet → P-11 top-up |
| Provider execution | P-06 → P-08 → P-09 → transfer proof submitted |
| Admin dispute resolution | A-02 → A-03 → A-04 evidence → A-03 decision → resolved |

## 10.3. Checklist trước khi bàn giao dev

| Checklist | Pass |
|---|---|
| Mọi detail request có status + current actor + countdown. | ☐ |
| Payment instruction có amount, account, memo, QR, copy all, protection block. | ☐ |
| Fee/platform cost hiển thị rõ từ R-01/R-05/R-08. | ☐ |
| Memo nổi bật, copy riêng, không wrap. | ☐ |
| Confirm irreversible có checkbox/hold-to-confirm. | ☐ |
| DealCard có rating, on-time rate, response time, SLA, receive amount. | ☐ |
| Provider accept có collateral preview và wallet availability. | ☐ |
| Provider không accept được nếu ví không đủ ký quỹ. | ☐ |
| Proof upload có preview, retry, immutable note. | ☐ |
| Dispute form có category bắt buộc, evidence, SLA 48h. | ☐ |
| Admin decision có R1-R4 và ledger preview trước khi confirm. | ☐ |
| Sensitive data masked mặc định và có audit khi unmask/copy. | ☐ |
| Rejected/expired/no deal có CTA phục hồi. | ☐ |
| Empty/loading/offline states được thiết kế. | ☐ |
| Mobile touch target đạt ≥44px; badge đạt contrast. | ☐ |

---

# 11. Ghi chú triển khai design

1. **Không nên thiết kế app như ví chuyển tiền truyền thống** vì dòng tiền P2P chạy ngoài hệ thống; UI phải nhấn mạnh transfer ticket, memo và proof.
2. **Niềm tin phải xuất hiện đúng lúc**: protection block ở R-08 quan trọng hơn trang policy dài.
3. **Provider dashboard phải action-first**: request sắp quá SLA nằm trên KPI doanh thu.
4. **Admin workbench là sản phẩm lõi của trust model**: nếu workbench thiếu evidence/timeline/ledger preview, dispute sẽ không vận hành được.
5. **MVP design không được cắt các màn P0**: R-08 Payment Instruction, P-08 Confirm Received, P-09 Transfer, A-03 Workbench là luồng sống còn.

---

**Kết luận UI:** Bộ wireframe text này chuyển BA v4 thành bản mô tả màn hình đủ chi tiết để dựng Figma production. Thiết kế cần tập trung vào ba câu hỏi lặp lại ở mọi điểm rủi ro: *chuyện gì đang xảy ra, ai đang cầm lượt, và người dùng được bảo vệ thế nào nếu giao dịch gặp lỗi.*
