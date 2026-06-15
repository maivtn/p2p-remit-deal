# VLinkPay — P2P Remit Deal
# UI Text Wireframes / Screen Specification v1.6.1

| Thông tin | Nội dung |
|---|---|
| **Tài liệu** | UI Text Wireframes / Screen Specification |
| **Tính năng** | P2P Remit Deal |
| **Sản phẩm cha** | VLinkPay |
| **Version** | v1.6.1 |
| **Ngày tạo** | 15/06/2026 |
| **Nguồn tham chiếu** | BA Spec v1.6.1 + bộ màn hình demo/mockup hiện có |
| **Mục tiêu** | Mô tả chi tiết màn hình, bố cục, nội dung, CTA, trạng thái và rule hiển thị để UI/UX Designer dựng Figma và Dev/QC hiểu đúng nghiệp vụ |
| **Phạm vi** | Mobile-first UI wireframes cho Member trong P2P Remit Deal; Admin Portal/backoffice đã có ở project khác nên chỉ nêu điểm cần liên kết/cấu hình, không thiết kế Admin Portal mới |

---

## 0. Nguyên tắc thiết kế v1.6.1

### 0.1. Quyết định nghiệp vụ ảnh hưởng trực tiếp UI

| Nhóm | Quyết định UI cần tuân thủ |
|---|---|
| Vị trí truy cập | P2P Remit Deal nằm trong **VLinkPay**, truy cập từ menu **Exchange Hub**. |
| Điều kiện vào tính năng | User đã **KYC/KYB hợp lệ** trong VLinkPay mới vào được P2P Remit Deal. P2P không có flow KYC/KYB riêng. |
| Role | Một Member có thể là Requester, Provider hoặc dual-role. Không tách app Requester/Provider. |
| Navigation | Dùng navigation chính: **Overview / Gửi yêu cầu / Quản lý deals / Lịch sử yêu cầu / Lịch sử nhận yêu cầu / Tài khoản nhận**. |
| Marketplace | Không có marketplace browse độc lập trên Home. Danh sách deal chỉ hiện sau khi Requester nhập nhu cầu ở flow **Gửi yêu cầu**. |
| Home | Overview chỉ tập trung **Đang xử lý / cần xử lý** và CTA **Tạo deal & Gửi yêu cầu**. Không hiển thị số dư USDV, không hiển thị lịch sử gần đây, không hiển thị marketplace. |
| Deal SLA | Provider **không nhập SLA/thời gian chuyển** khi tạo/sửa deal. Deadline lấy từ Admin/backoffice config và chỉ hiển thị trong giao dịch phát sinh. |
| USDV | Phí/hold dùng ví USDV. Số dư không hiển thị trên Overview, chỉ hiển thị tại ngữ cảnh cần kiểm tra: tạo request, tạo deal, accept request, hủy/phạt. |
| Giao dịch đang diễn ra | Chuẩn thuật ngữ UI: dùng **“giao dịch đang diễn ra”**, không dùng “giao dịch sống” hoặc “active transaction” trong giao diện người dùng. |
| Pending rule | Một Requester chỉ có 1 yêu cầu chờ Provider chấp nhận. Một Provider chỉ nhận 1 yêu cầu chờ phản hồi. |
| Deal visibility | Nếu Provider có request chờ phản hồi hoặc giao dịch đang diễn ra, deal của Provider bị ẩn khỏi kết quả tìm deal. |
| Tài khoản nhận Provider | Mỗi currency có thể có nhiều method, ví dụ USD: Zelle, Venmo, Apple Cash, PayPal, Bank Transfer. Mỗi currency/method chỉ có tối đa 1 tài khoản Provider đang hoạt động trong MVP. |
| Privacy | Tên cá nhân/doanh nghiệp mask trước accept, hiển thị đầy đủ sau accept. Liên hệ trực tiếp không hiển thị; hai bên trao đổi qua chat trong giao dịch sau accept. |

### 0.2. Màu/visual direction kế thừa từ demo

| Khu vực | Hướng màu |
|---|---|
| Requester flow / Gửi yêu cầu | Xanh lá / emerald làm màu chính. |
| Provider flow / Quản lý deals / Lịch sử nhận yêu cầu | Xanh dương làm màu chính. |
| Warning / phí / escrow / hold | Vàng/amber. |
| Error / hủy / từ chối | Đỏ nhạt + text đỏ. |
| Success / completed | Xanh lá nhạt. |
| Pending / waiting | Vàng nhạt hoặc xanh nhạt tùy context. |

### 0.3. Component nền tảng

| Component | Mô tả |
|---|---|
| Header page | Tiêu đề + mô tả ngắn; màu theo context. |
| Tab/filter chip | Dùng cho trạng thái: Chờ chấp nhận, Đang xử lý, Hoàn tất, Đã hủy, Hết hạn, Đã phân xử. |
| Currency selector | Flag + mã tiền + tên tiền. |
| Method chip | Icon method + tên method; selected có border đậm. |
| Deal/request card | Card bo góc, shadow nhẹ, tách rõ amount send/receive, method, status badge, CTA. |
| Bottom sticky CTA | CTA chính dính đáy ở các flow nhập liệu/xác nhận. |
| Confirm modal/bottom sheet | Dùng cho accept, hủy sau accept, xác nhận đã gửi tiền, xác nhận đã nhận tiền, xác nhận hoàn tất. |
| Proof block | Collapsible section cho payment proof/transfer proof; proof immutable. |
| Hold/Fee block | Card cảnh báo thể hiện phí, hold USDV và hệ quả khi accept/hủy. |

---

## 1. Screen Inventory v1.6.1

### 1.1. Member screens

| ID | Màn hình | Menu/Flow | Vai dùng | Ưu tiên |
|---|---|---|---|---|
| M00 | Exchange Hub Entry Card | VLinkPay | Member | P0 |
| M01 | P2P Overview | Overview | Member dual-role | P0 |
| M02 | Gửi yêu cầu — Nhập nhu cầu | Gửi yêu cầu | Requester | P0 |
| M03 | Gửi yêu cầu — Kết quả deal phù hợp | Gửi yêu cầu | Requester | P0 |
| M04 | Gửi yêu cầu — Xác nhận yêu cầu | Gửi yêu cầu | Requester | P0 |
| M05 | Lịch sử yêu cầu — Requester list | Lịch sử yêu cầu | Requester | P0 |
| M06 | Chi tiết yêu cầu — Chờ Provider chấp nhận | Lịch sử yêu cầu | Requester | P0 |
| M07 | Chi tiết giao dịch — Chờ Requester chuyển tiền | Lịch sử yêu cầu | Requester | P0 |
| M08 | Hướng dẫn thanh toán Provider | Lịch sử yêu cầu | Requester | P0 |
| M09 | Modal upload payment proof | Lịch sử yêu cầu | Requester | P0 |
| M10 | Chi tiết giao dịch — Chờ Provider xác nhận | Lịch sử yêu cầu | Requester | P0 |
| M11 | Chi tiết giao dịch — Chờ Provider chuyển tiền | Lịch sử yêu cầu | Requester | P0 |
| M12 | Chi tiết giao dịch — Chờ xác nhận hoàn tất | Lịch sử yêu cầu | Requester | P0 |
| M13 | Modal xác nhận hoàn tất | Lịch sử yêu cầu | Requester | P0 |
| M14 | Modal hủy yêu cầu | Lịch sử yêu cầu | Requester | P0 |
| M15 | Rating sau hoàn tất | Lịch sử yêu cầu / Chi tiết | Requester + Provider | P1 |
| M16 | Quản lý deals — Danh sách | Quản lý deals | Provider | P0 |
| M17 | Tạo/Sửa deal | Quản lý deals | Provider | P0 |
| M18 | Chi tiết deal | Quản lý deals | Provider | P0 |
| M19 | Lịch sử nhận yêu cầu — Provider list | Lịch sử nhận yêu cầu | Provider | P0 |
| M20 | Chi tiết request nhận được — Chờ phản hồi | Lịch sử nhận yêu cầu | Provider | P0 |
| M21 | Modal xác nhận accept | Lịch sử nhận yêu cầu | Provider | P0 |
| M22 | Chi tiết request — Chờ Requester chuyển tiền | Lịch sử nhận yêu cầu | Provider | P0 |
| M23 | Chi tiết request — Đối soát payment proof | Lịch sử nhận yêu cầu | Provider | P0 |
| M24 | Chi tiết request — Chuyển tiền cho người thụ hưởng | Lịch sử nhận yêu cầu | Provider | P0 |
| M25 | Modal upload transfer proof | Lịch sử nhận yêu cầu | Provider | P0 |
| M26 | Chi tiết request — Chờ Requester xác nhận | Lịch sử nhận yêu cầu | Provider | P0 |
| M27 | Tài khoản nhận — Người thụ hưởng | Tài khoản nhận | Requester | P0 |
| M28 | Tài khoản nhận — Tài khoản nhận tiền Provider | Tài khoản nhận | Provider | P0 |
| M29 | Form thêm/sửa người thụ hưởng | Tài khoản nhận | Requester | P0 |
| M30 | Form thêm/sửa tài khoản nhận tiền Provider | Tài khoản nhận | Provider | P0 |
| M31 | Dispute form | Chi tiết giao dịch | Requester + Provider | P0 |
| M32 | Chat trong giao dịch | Chi tiết giao dịch | Requester + Provider | P1 |

### 1.2. Admin/backoffice screens ngoài scope thiết kế mới

Admin Portal/backoffice đã có ở project khác. P2P v1.6.1 chỉ cần đảm bảo các module backoffice hiện hữu có cấu hình/luồng sau:

- Cấu hình phí nền tảng 0,5%.
- Cấu hình phí hủy, phí phạt, tỷ lệ phân bổ.
- Cấu hình SLA/timer.
- Cấu hình currency/method.
- Cấu hình tỷ giá USDV snapshot.
- Cấu hình hạn mức min/max.
- Màn xử lý dispute R1/R2/R3/R4.

---

## 2. Navigation & Global Layout

### M00 — Exchange Hub Entry Card

**Mục đích:** Cho user đã KYC/KYB hợp lệ vào P2P Remit Deal từ VLinkPay.

```text
[VLinkPay App]
┌────────────────────────────────────┐
│ Exchange Hub                       │
├────────────────────────────────────┤
│ [Card] P2P Remit Deal              │
│ Chuyển tiền ngang hàng với tỷ giá  │
│ cạnh tranh, có hold USDV & proof.  │
│                                    │
│ [Vào P2P Remit Deal]               │
└────────────────────────────────────┘
```

**Rules:**

- Nếu user chưa KYC/KYB hợp lệ: không vào P2P, hiển thị message theo VLinkPay KYC/KYB chung.
- Không hiển thị onboarding Provider riêng trong P2P.

---

### M01 — P2P Overview

**Mục đích:** Màn đầu tiên sau khi vào P2P, tập trung việc cần xử lý và CTA chính.

```text
┌────────────────────────────────────┐
│ P2P Remit Deal                     │
│ Gửi yêu cầu hoặc tạo deal chuyển   │
│ tiền ngang hàng trong VLinkPay.    │
├────────────────────────────────────┤
│ ĐANG XỬ LÝ / CẦN XỬ LÝ             │
│                                    │
│ [Nếu có request/giao dịch]         │
│ ┌────────────────────────────────┐ │
│ │ RQ-1028 · Bạn cần xử lý        │ │
│ │ Vai: Tôi gửi / Tôi nhận yêu cầu│ │
│ │ Trạng thái: Chờ thanh toán     │ │
│ │ Còn: 18:45                    │ │
│ │ [Xem chi tiết]                │ │
│ └────────────────────────────────┘ │
│                                    │
│ [Nếu không có việc cần xử lý]      │
│ Không hiển thị empty card dài.     │
├────────────────────────────────────┤
│ HÀNH ĐỘNG NHANH                    │
│ [ + Tạo deal ]                     │
│ [   Gửi yêu cầu ]                  │
└────────────────────────────────────┘

Bottom/Nav:
[Overview] [Gửi yêu cầu] [Quản lý deals]
[Lịch sử yêu cầu] [Lịch sử nhận yêu cầu]
[Tài khoản nhận]
```

**Không hiển thị:**

- Không hiển thị Marketplace trên Home.
- Không hiển thị số dư USDV tóm tắt trên Home.
- Không hiển thị lịch sử gần đây.

**CTA rules:**

| CTA | Rule |
|---|---|
| Tạo deal | Cho phép nếu user đủ điều kiện Provider; vẫn có thể tạo deal mới dù đang có request chờ phản hồi, nhưng deal của Provider có thể bị ẩn khỏi kết quả tìm deal theo rule visibility. |
| Gửi yêu cầu | Block nếu user đang có 1 yêu cầu chờ Provider chấp nhận hoặc 1 giao dịch đang diễn ra; deep-link về request/giao dịch đó. |

---

## 3. Requester Flow — Gửi yêu cầu

### M02 — Gửi yêu cầu: Nhập nhu cầu

**Mục đích:** Requester nhập nhu cầu chuyển tiền trước khi hệ thống tìm deal phù hợp.

**Tham chiếu mockup:** Màn nhập nhu cầu trong demo hiện có.

**Ghi chú triển khai prototype:** Bản HTML hiện tại đi theo layout section trực tiếp ngay dưới topbar, không dùng hero banner; draft nhu cầu được giữ lại khi user quay về màn này trong cùng phiên.

```text
┌────────────────────────────────────┐
│ Bạn muốn gửi tiền đi đâu?          │
│ Nhập nhu cầu — hệ thống tìm deal   │
│ tốt nhất                           │
├────────────────────────────────────┤
│ SỐ TIỀN CHUYỂN                     │
│ Bạn gửi                            │
│ [🇺🇸 USD ▼]             [500]       │
│                  ↓                 │
│ 1 USD ≈ 25.500đ                    │
│ Người nhận sẽ nhận bằng            │
│ [🇻🇳 VND ▼]        [≈12.750.000đ]   │
│ * Tỷ giá ước tính. Tỷ giá thực     │
│   theo nhà cung cấp.               │
├────────────────────────────────────┤
│ HÌNH THỨC THANH TOÁN               │
│ Bạn trả nhà cung cấp qua           │
│ [Zelle] [Venmo] [PayPal]           │
│ [Bank Transfer]                    │
│                                    │
│ Người nhận sẽ nhận qua             │
│ [MoMo] [ZaloPay] [Chuyển khoản NH] │
├────────────────────────────────────┤
│ THÔNG TIN TÀI KHOẢN NHẬN  [MoMo]   │
│ Chọn tài khoản đã lưu: [Cài đặt]   │
│ [Ví MoMo · Nguyen Van A]           │
│                                    │
│ Tên người thụ hưởng                │
│ [Trần Văn C]                       │
│ Số điện thoại / tài khoản          │
│ [0901234567]                       │
├────────────────────────────────────┤
│ GHI CHÚ CHO NHÀ CUNG CẤP           │
│ [Cần chuyển gấp trong hôm nay]     │
└────────────────────────────────────┘
[Sticky CTA] ⚡ Tìm Deal Phù Hợp
```

**Validation:**

| Field | Rule | Lỗi hiển thị |
|---|---|---|
| Amount | Bắt buộc, > 0 | “Nhập số tiền hợp lệ” |
| Currency nhận | Phải có corridor hỗ trợ | “Chưa hỗ trợ cặp tiền tệ này” |
| Method trả/nhận | Bắt buộc mỗi bên 1 method | “Chọn hình thức thanh toán” |
| Người thụ hưởng | Theo method | “Nhập thông tin người nhận” |
| USDV Requester | Đủ 100% amount quy đổi USDV + phí 0,5% | Popup “Số dư USDV không đủ để tạo yêu cầu” |

**Behavior:**

- Nếu user đang có yêu cầu chờ Provider chấp nhận hoặc giao dịch đang diễn ra, CTA bị block và hiện modal/deep-link.
- Nếu người thụ hưởng chưa có trong P2P, cho thêm nhanh tại form.
- Người thụ hưởng là dữ liệu riêng trong P2P, không dùng danh bạ VLinkPay.
- Khi quay lại từ màn kết quả/xác nhận, form giữ lại draft đã nhập trong phiên hiện tại.

---

### M03 — Kết quả deal phù hợp

**Mục đích:** Hiển thị danh sách Provider/deal đủ điều kiện sau khi Requester nhập nhu cầu.

**Tham chiếu mockup:** Màn “4 deal phù hợp — sắp xếp theo hình thức + tỷ giá”.

```text
┌────────────────────────────────────┐
│ Tóm tắt nhu cầu                    │
│ Bạn thanh toán qua Zelle           │
│ $500  →  Bạn nhận qua VND · MoMo   │
│ Người thụ hưởng: Trần Văn C        │
├────────────────────────────────────┤
│ 4 deal phù hợp                     │
│ Sắp xếp: hình thức + tỷ giá        │
├────────────────────────────────────┤
│ [Banner] Khớp hoàn toàn hình thức  │
│ thanh toán · Tỷ giá tốt nhất       │
│ ┌────────────────────────────────┐ │
│ │ Nguyễn Văn B ✓                 │ │
│ │ ★ 4.9 · 248 đánh giá           │ │
│ │ Tỷ giá: 25.600đ/USD            │ │
│ │ Bạn nhận: 12.800.000đ          │ │
│ │ Nhận qua: [Zelle] [Venmo]      │ │
│ │ Gửi qua:  [MoMo] [ZaloPay]     │ │
│ │ Ghi chú: Chuyển nhanh.         │ │
│ │ [Chọn deal này]                │ │
│ └────────────────────────────────┘ │
├────────────────────────────────────┤
│ Deal khác...                       │
└────────────────────────────────────┘
```

**Eligibility rules:**

- Deal active, không tạm dừng, chưa hết hạn, chưa xóa.
- Amount nằm trong min/max của deal.
- Method khớp với nhu cầu.
- Không self-trading cùng tài khoản.
- Provider không có request chờ phản hồi/giao dịch đang diễn ra.
- Ví USDV Provider đủ cover amount request + phí Provider.
- Nếu Provider thiếu USDV cho amount request, deal bị ẩn khỏi kết quả.

**Empty state:**

```text
Không có deal phù hợp
Thử đổi số tiền, hình thức thanh toán hoặc quay lại sau.
[Thay đổi yêu cầu]
```

---

### M04 — Xác nhận yêu cầu

**Mục đích:** Requester xem lại thông tin trước khi gửi request.

**Tham chiếu mockup:** Màn “Xác nhận yêu cầu”.

```text
┌────────────────────────────────────┐
│ Xác nhận yêu cầu                   │
│ Kiểm tra kỹ trước khi gửi          │
├────────────────────────────────────┤
│ NHÀ CUNG CẤP                       │
│ Nguyễn Văn B ✓                     │
│ ★ 4.9 · 248 giao dịch/đánh giá     │
├────────────────────────────────────┤
│ LUỒNG GIAO DỊCH                    │
│ Bạn trả                            │
│ 🇺🇸 $500 qua Zelle                 │
│        →                           │
│ Người nhận nhận                    │
│ 🇻🇳 12.800.000đ qua MoMo           │
│ Tỷ giá áp dụng: 25.600đ/USD        │
├────────────────────────────────────┤
│ USDV SẼ KIỂM TRA                   │
│ Amount quy đổi USDV: {x} USDV      │
│ Phí nền tảng của bạn 0,5%: {y}     │
│ Trạng thái: Đủ điều kiện           │
├────────────────────────────────────┤
│ NGƯỜI THỤ HƯỞNG                    │
│ Trần Văn C                         │
│ MoMo · 0901234567                  │
├────────────────────────────────────┤
│ GHI CHÚ                            │
│ Cần chuyển gấp trong hôm nay       │
└────────────────────────────────────┘
[Sticky CTA] Gửi Yêu Cầu
```

**Submit behavior:**

- Khi bấm **Gửi Yêu Cầu**, hệ thống kiểm tra lại rule pending của Requester và số dư USDV.
- Nếu đủ: tạo request `pending_acceptance`, chưa trừ phí, chưa hold.
- Nếu thiếu USDV: popup thiếu số dư, không tạo request.

---

## 4. Requester — Lịch sử yêu cầu và chi tiết giao dịch

### M05 — Lịch sử yêu cầu

**Mục đích:** Danh sách request do Member tạo ở vai Requester.

**Tham chiếu mockup:** Màn “Yêu cầu của tôi”.

```text
┌────────────────────────────────────┐
│ Yêu cầu của tôi                    │
│ Theo dõi trạng thái chuyển tiền    │
├────────────────────────────────────┤
│ [Chờ chấp nhận] [Đang xử lý]       │
│ [Hoàn tất] [Đã hủy] [Hết hạn]      │
│ [Đã phân xử]                       │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ Nguyễn Văn B                  │ │
│ │ Badge: Chờ chấp nhận           │ │
│ │ Vừa xong                       │ │
│ │ 🇺🇸 USD → 🇻🇳 VND              │ │
│ │ Bạn gửi: $500                  │ │
│ │ Người nhận: 12.800.000đ        │ │
│ │ Zelle → MoMo                   │ │
│ │ [Xem chi tiết giao dịch]       │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

**Sort/filter:**

- Thứ tự mặc định: đang xử lý/cần xử lý trước, sau đó mới nhất.
- Filter trạng thái đóng tách riêng: Hoàn tất, Đã hủy, Hết hạn, Đã phân xử.
- Search theo mã request không bắt buộc trong MVP.

---

### M06 — Chi tiết yêu cầu: Chờ Provider chấp nhận

**Mục đích:** Requester xem request vừa tạo, có thể hủy trước accept không mất phí.

**Tham chiếu mockup:** Màn “Chi tiết giao dịch — Chờ chấp nhận”.

```text
┌────────────────────────────────────┐
│ Chi tiết giao dịch                 │
│ Theo dõi trạng thái và thao tác    │
├────────────────────────────────────┤
│ Nguyễn Văn B                       │
│ Badge: Chờ chấp nhận               │
│ Vừa xong                           │
├────────────────────────────────────┤
│ 🇺🇸 Đô la Mỹ → 🇻🇳 Việt Nam Đồng    │
│ Bạn gửi: $500                      │
│ Người nhận: 12.800.000đ            │
│ Zelle → MoMo                       │
│ Tỷ giá: 25.600đ/USD                │
├────────────────────────────────────┤
│ ⏳ Chờ nhà cung cấp chấp nhận       │
│ Còn: {mm:ss}                       │
├────────────────────────────────────┤
│ NGƯỜI THỤ HƯỞNG                    │
│ Trần Văn C                         │
│ Số điện thoại: 0901234567          │
├────────────────────────────────────┤
│ [Hủy yêu cầu]                      │
└────────────────────────────────────┘
```

**Rules:**

- Requester hủy trước accept: không mất phí.
- Provider không phản hồi trong thời hạn cấu hình: request `expired`, không phí.
- User không cần thấy timeline rút gọn; chỉ status hiện tại và CTA phù hợp.

---

### M07 — Chi tiết giao dịch: Accepted / Chờ Requester chuyển tiền

**Mục đích:** Sau khi Provider accept, Requester thấy giao dịch đã kết nối và cần thanh toán ngoài hệ thống.

```text
┌────────────────────────────────────┐
│ Chi tiết giao dịch                 │
│ Trạng thái: Chờ bạn chuyển tiền    │
├────────────────────────────────────┤
│ Provider: Nguyễn Văn B             │
│ Tên đã hiển thị đầy đủ sau accept  │
│ Chat: Đã mở                        │
├────────────────────────────────────┤
│ HOLD & PHÍ USDV                    │
│ Phí nền tảng của bạn: -0,5%        │
│ USDV của bạn đang hold: 100% amount│
│ Phí Provider đã trừ: 0,5%          │
│ USDV Provider đang hold: 100%      │
├────────────────────────────────────┤
│ Bước tiếp theo                     │
│ Chuyển $500 qua Zelle cho Provider │
│ và upload bằng chứng trước {timer}.│
├────────────────────────────────────┤
│ [Chuyển tiền cho Provider]         │
│ [Hủy giao dịch]                    │
│ [Chat]                             │
└────────────────────────────────────┘
```

**Rules:**

- Provider đã accept thì Provider không có nút hủy.
- Requester còn được hủy nếu chưa upload payment proof; mất phí nền tảng đã trừ + phí hủy cấu hình.
- Nếu hết hạn mà chưa upload proof: auto `cancelled`, xử lý như Requester hủy sau accept.

---

### M08 — Hướng dẫn thanh toán Provider

**Mục đích:** Requester chuyển tiền ngoài hệ thống theo phương thức đã chọn.

**Tham chiếu mockup:** Màn hướng dẫn gửi $500 qua Zelle cho Provider.

```text
┌────────────────────────────────────┐
│ Bước 1: Gửi tiền cho nhà cung cấp  │
│ Còn: {mm:ss}                       │
├────────────────────────────────────┤
│ PHIẾU LỆNH THANH TOÁN              │
│ Số tiền: $500                      │
│ Phương thức: Zelle                 │
│ Người nhận: Nguyễn Văn B           │
│ Zelle account: +1 (408) 555-0199   │
│ Memo / Nội dung chuyển khoản:      │
│ mr_1781496895256                   │
│                                    │
│ [Copy số tiền] [Copy tài khoản]    │
│ [Copy memo] [Sao chép tất cả]      │
├────────────────────────────────────┤
│ ⚠️ Vui lòng điền chính xác memo    │
│ vào ghi chú/nội dung giao dịch.    │
├────────────────────────────────────┤
│ NGƯỜI THỤ HƯỞNG                    │
│ Trần Văn C                         │
│ MoMo · 0901234567                  │
└────────────────────────────────────┘
[Sticky CTA] Xác nhận đã gửi tiền & tải bằng chứng
```

**Rules:**

- Thông tin Provider full chỉ hiện sau accept và đúng context thanh toán.
- Không hiển thị email/số điện thoại liên hệ cá nhân ngoài thông tin thanh toán cần thiết.
- Nếu method hỗ trợ QR, hiển thị thêm **Hiện QR**.

---

### M09 — Modal upload payment proof

```text
┌────────────────────────────────────┐
│ Xác nhận đã gửi tiền               │
│ Upload bằng chứng bạn đã gửi $500  │
│ qua Zelle                          │
├────────────────────────────────────┤
│ Memo: mr_1781496895256             │
│ [+ Chụp ảnh] [+ Tải file]          │
│ Ghi chú / Mã tham chiếu            │
│ [ZELLE-20260615-...]               │
├────────────────────────────────────┤
│ [Hủy] [Gửi bằng chứng]             │
└────────────────────────────────────┘
```

**Validation:** proof hợp lệ khi có ít nhất 1 file hoặc ghi chú khác rỗng. Proof sau submit là bất biến.

---

### M10 — Chi tiết giao dịch: Chờ Provider xác nhận nhận tiền

```text
┌────────────────────────────────────┐
│ Chi tiết giao dịch                 │
│ Trạng thái: Chờ Provider xác nhận  │
├────────────────────────────────────┤
│ Bằng chứng thanh toán của bạn      │
│ Ref: ZELLE-20260615...             │
│ Thời gian upload: ...              │
│ [Xem proof]                        │
├────────────────────────────────────┤
│ Bước tiếp theo                     │
│ Provider đang đối soát tiền vào.   │
│ Nếu có vấn đề, hai bên có thể mở   │
│ khiếu nại theo rule.               │
├────────────────────────────────────┤
│ [Chat] [Khiếu nại]                 │
└────────────────────────────────────┘
```

---

### M11 — Chi tiết giao dịch: Provider đã xác nhận, đang chuyển tiền

```text
┌────────────────────────────────────┐
│ Chi tiết giao dịch                 │
│ Trạng thái: Provider đang chuyển   │
├────────────────────────────────────┤
│ Provider đã xác nhận nhận $500.    │
│ Đang chuyển 12.800.000đ cho        │
│ Trần Văn C qua MoMo.               │
├────────────────────────────────────┤
│ Deadline xử lý: {deadline từ config}│
│ [Chat] [Khiếu nại nếu quá hạn]     │
└────────────────────────────────────┘
```

---

### M12 — Chi tiết giao dịch: Provider đã upload transfer proof

```text
┌────────────────────────────────────┐
│ Chi tiết giao dịch                 │
│ Trạng thái: Chờ bạn xác nhận       │
├────────────────────────────────────┤
│ Bằng chứng Provider đã chuyển tiền │
│ Ref: MOMO/VCB/...                  │
│ Amount: 12.800.000đ                │
│ [Xem proof]                        │
├────────────────────────────────────┤
│ Vui lòng kiểm tra với người thụ    │
│ hưởng trước khi hoàn tất.          │
│ Còn: {15 phút hoặc config}         │
├────────────────────────────────────┤
│ [Xác nhận hoàn tất] [Khiếu nại]    │
└────────────────────────────────────┘
```

**Auto-complete rule:** Nếu hết thời hạn xác nhận, hệ thống gửi thông báo cho hai bên; nếu sau 24h vẫn không bên nào xử lý, giao dịch tự chuyển `completed` và xử lý tài chính như hoàn tất bình thường.

---

### M13 — Modal xác nhận hoàn tất

```text
┌────────────────────────────────────┐
│ Xác nhận hoàn tất                  │
├────────────────────────────────────┤
│ Bạn xác nhận người thụ hưởng đã    │
│ nhận đủ 12.800.000đ?               │
│                                    │
│ Hành động này không thể hoàn tác.  │
│ □ Tôi đã kiểm tra với người nhận.  │
├────────────────────────────────────┤
│ [Hủy] [Xác nhận hoàn tất]          │
└────────────────────────────────────┘
```

---

### M14 — Modal hủy sau accept trước proof

```text
┌────────────────────────────────────┐
│ Xác nhận hủy giao dịch             │
├────────────────────────────────────┤
│ Giao dịch đã được Provider chấp    │
│ nhận và hai bên đã kết nối.        │
│                                    │
│ Nếu hủy lúc này, bạn sẽ mất:       │
│ - Phí nền tảng 0,5% đã trừ         │
│ - Phí hủy bổ sung theo cấu hình    │
│                                    │
│ Khoản phí hủy có thể được phân bổ  │
│ cho Provider và nền tảng theo      │
│ chính sách hiện hành.              │
├────────────────────────────────────┤
│ [Không hủy] [Xác nhận hủy]         │
└────────────────────────────────────┘
```

---

## 5. Provider Flow — Quản lý deals

### M16 — Quản lý deals: Danh sách

**Mục đích:** Provider xem và quản lý deal của mình.

**Tham chiếu mockup:** Màn “Deals của tôi”, tab Hoạt động/Tạm dừng.

```text
┌────────────────────────────────────┐
│ Deals của tôi                      │
│                         [+ Tạo mới]│
├────────────────────────────────────┤
│ [Tất cả] [Hoạt động] [Tạm dừng]    │
│ [Hết hạn] [Đã xóa]                 │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ 🇺🇸 → 🇻🇳 USD → VND             │ │
│ │ Badge: Hoạt động               │ │
│ │ Tỷ giá: 25.600đ/USD            │ │
│ │ Giới hạn: $100 - $5.000        │ │
│ │ Nhận: Zelle, Venmo, PayPal,    │ │
│ │       Bank Transfer            │ │
│ │ Gửi: MoMo, ZaloPay, Chuyển NH  │ │
│ │ 3 yêu cầu                      │ │
│ │ [Tạm dừng] [Xóa]               │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

**Rules:**

- Filter gồm: Đang hoạt động, Tạm dừng, Hết hạn, Đã xóa.
- Có tìm kiếm/filter theo corridor.
- Nếu deal hiện tại đã có request yêu cầu/giao dịch liên quan: không được sửa/xóa deal đó; vẫn được tạm dừng để không nhận request mới.
- Provider vẫn được tạo deal mới và sửa các deal khác không liên quan.
- Nếu deal active nhưng tạm thời không xuất hiện trong kết quả tìm deal do rule ví/giao dịch, chỉ cảnh báo trong chi tiết deal, không cần badge trên list.

---

### M17 — Tạo/Sửa deal

**Mục đích:** Provider tạo hoặc sửa deal.

```text
┌────────────────────────────────────┐
│ [X]  Tạo Deal Mới                  │
│      Provider: Hùng Mạnh Lê        │
├────────────────────────────────────┤
│ 1 · Cặp tiền tệ                    │
│ [🇺🇸 USD ▼] [⇄] [🇻🇳 VND ▼]        │
│ Hành lang: USD → VND               │
├────────────────────────────────────┤
│ 2 · Tỷ giá (1 USD = ? VND)  [⚡ TG]│
│ [Ví dụ: 25500              ]       │
├────────────────────────────────────┤
│ 3 · Giới hạn giao dịch (USD)       │
│ Tối thiểu     │   Tối đa           │
│ [100  ] [USD] │ [5000  ] [USD]     │
├────────────────────────────────────┤
│ 4 · Phương thức nhận tiền          │
│ 💳 Người gửi 🇺🇸 thanh toán tôi qua│
│ [✓Zelle] [✓Venmo] [PayPal] [Bank]  │
├────────────────────────────────────┤
│ 5 · Phương thức chi trả            │
│ 📤 Tôi gửi tiền 🇻🇳 qua            │
│ [✓MoMo] [✓ZaloPay] [Bank]          │
├────────────────────────────────────┤
│ 6 · Ghi chú (tuỳ chọn)             │
│ [Điều kiện, lưu ý thêm...]         │
└────────────────────────────────────┘
[Sticky CTA] Đăng Deal
```

**Không có field:**

- Không có “Thời gian chuyển” — Provider không nhập SLA; thời gian xử lý lấy từ Admin/backoffice config.
- Không có “Thời hạn hiệu lực” (validDays) — hệ thống quản lý visibility theo trạng thái và USDV.
- Không có “Ký quỹ ước tính” — **collateral chỉ bị hold khi Provider accept request**, không phải khi tạo deal.

**Dynamic UI:**

- Khi thay đổi `fromCurrency`: danh sách phương thức nhận tiền cập nhật theo currency; tỷ giá tham khảo cập nhật; tự động chọn 2 method đầu tiên.
- Khi thay đổi `toCurrency`: danh sách phương thức chi trả cập nhật; tự động chọn 2 method đầu tiên.
- `fromCurrency` ≠ `toCurrency` — nếu chọn trùng, hệ thống tự đổi bên còn lại.
- Nút [⇄] swap fromCurrency ↔ toCurrency và reset cả hai danh sách phương thức.

**Validation:**

| Field | Rule |
|---|---|
| Corridor | Bắt buộc; from ≠ to |
| Rate | > 0 |
| Min/Max | Min > 0, Max > Min |
| Phương thức nhận tiền | Ít nhất 1 method |
| Phương thức chi trả | Ít nhất 1 method |
| Deal đang sửa | Không được sửa nếu deal đang có request/giao dịch liên quan |

---

### M18 — Chi tiết deal

```text
┌────────────────────────────────────┐
│ Chi tiết deal                      │
├────────────────────────────────────┤
│ USD → VND                          │
│ Trạng thái: Hoạt động              │
│ Tỷ giá: 25.600đ/USD                │
│ Giới hạn: $100 - $5.000            │
│ Hiệu lực: đến 29/06/2026           │
├────────────────────────────────────┤
│ Nhận tiền từ Requester qua         │
│ Zelle, Venmo, PayPal, Bank Transfer│
├────────────────────────────────────┤
│ Chi trả người thụ hưởng qua        │
│ MoMo, ZaloPay, Chuyển khoản NH     │
├────────────────────────────────────┤
│ Cảnh báo ngữ cảnh                  │
│ [Nếu có] Deal đang tạm thời không  │
│ xuất hiện trong kết quả tìm deal   │
│ do Provider đang có request/giao   │
│ dịch hoặc USDV không đủ.           │
├────────────────────────────────────┤
│ Request phát sinh từ deal          │
│ RQ-... · Chờ phản hồi/Hoàn tất/... │
├────────────────────────────────────┤
│ Lịch sử version                    │
│ v3 · 15/06 · rate/min/max/method...│
├────────────────────────────────────┤
│ [Tạm dừng/Kích hoạt] [Sửa] [Xóa]   │
└────────────────────────────────────┘
```

**Action rules:**

- Deal có request/giao dịch liên quan: cho tạm dừng, không cho sửa/xóa.
- Deal đã xóa mềm: chỉ xem lịch sử, không khôi phục; muốn dùng lại thì tạo/đăng lại deal mới.
- Deal tạm dừng: ẩn khỏi kết quả tìm deal; request/giao dịch đã tạo vẫn tiếp tục bình thường.

---

## 6. Provider Flow — Lịch sử nhận yêu cầu

### M19 — Lịch sử nhận yêu cầu

**Mục đích:** Provider xem tất cả request từng gửi tới mình.

**Tham chiếu mockup:** Màn “Yêu cầu giao dịch” với các tab Chờ chấp nhận/Đang xử lý/Hoàn thành/Từ chối-Khiếu nại.

```text
┌────────────────────────────────────┐
│ Yêu cầu giao dịch                  │
│ Quản lý & xử lý yêu cầu chuyển tiền│
├────────────────────────────────────┤
│ [Chờ phản hồi] [Đang xử lý]        │
│ [Hoàn tất] [Đã hủy] [Hết hạn]      │
│ [Đã phân xử]                       │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ Nguyễn Văn An                  │ │
│ │ ★ 4.7 · 2 giờ trước            │ │
│ │ Badge: Chờ duyệt               │ │
│ │ 🇺🇸 USD → 🇻🇳 VND               │ │
│ │ Người gửi trả: $500            │ │
│ │ Người thụ hưởng nhận:          │ │
│ │ 12.750.000đ                    │ │
│ │ Zelle → MoMo                   │ │
│ │ [Từ chối] [Chấp nhận]          │ │
│ │ [Xem chi tiết giao dịch]       │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

**Rules:**

- Hiển thị tất cả request từng gửi tới Provider: chờ phản hồi, đã từ chối, hết hạn, đã hủy, đang xử lý, hoàn tất, đã phân xử.
- Sort mặc định: đang xử lý/cần xử lý trước, sau đó mới nhất.
- Lý do đóng chỉ hiển thị khi vào chi tiết, không cần hiện trên card.

---

### M20 — Chi tiết request nhận được: Chờ phản hồi

**Mục đích:** Provider xem request và accept/reject.

**Tham chiếu mockup:** Màn “Chi tiết giao dịch” Provider chờ chấp nhận + phí & escrow.

```text
┌────────────────────────────────────┐
│ Chi tiết giao dịch                 │
│ Chờ Provider phản hồi              │
├────────────────────────────────────┤
│ Requester                          │
│ Nguyễn V*** A                      │
│ ★ 4.7 · tên mask trước accept      │
├────────────────────────────────────┤
│ Giao dịch                          │
│ Requester trả: $500 qua Zelle      │
│ Người thụ hưởng nhận: 12.800.000đ  │
│ Method nhận: MoMo                  │
│ Beneficiary: Trần V*** C           │
│ Số tài khoản/SĐT: chưa hiển thị đủ │
├────────────────────────────────────┤
│ PHÍ & HOLD KHI CHẤP NHẬN           │
│ Phí của bạn 0,5%: -{x} USDV        │
│ Hold của bạn: 100% amount USDV     │
│ Hold Requester: 100% amount USDV   │
├────────────────────────────────────┤
│ [Từ chối] [Chấp nhận]              │
└────────────────────────────────────┘
```

**Rules:**

- Trước accept: tên và người thụ hưởng mask theo privacy rule.
- Sau accept: Provider xem đầy đủ người thụ hưởng để chi trả.
- Accept kiểm tra lại USDV hai bên; thiếu bất kỳ bên nào thì request chuyển Hết hạn, không phí/hold.

---

### M21 — Modal xác nhận accept

```text
┌────────────────────────────────────┐
│ Xác nhận chấp nhận                 │
├────────────────────────────────────┤
│ Khi chấp nhận, hai bên chính thức  │
│ kết nối giao dịch.                 │
│                                    │
│ Nhận từ người gửi: $500            │
│ Gửi đến người thụ hưởng:           │
│ 12.800.000đ                        │
├────────────────────────────────────┤
│ USDV sẽ bị xử lý ngay:             │
│ - Phí Provider 0,5%: -{x} USDV     │
│ - Hold Provider: {amount} USDV     │
│ - Requester cũng bị trừ phí/hold   │
├────────────────────────────────────┤
│ Sau khi accept, Provider không     │
│ được hủy giao dịch.                │
├────────────────────────────────────┤
│ [Hủy] [Đồng ý & Chấp nhận]         │
└────────────────────────────────────┘
```

---

### M22 — Chi tiết request Provider: Chờ Requester chuyển tiền

```text
┌────────────────────────────────────┐
│ Chi tiết giao dịch                 │
│ Trạng thái: Chờ Requester chuyển   │
├────────────────────────────────────┤
│ Requester: Nguyễn Văn A            │
│ Chat: Đã mở                        │
├────────────────────────────────────┤
│ Chờ người gửi chuyển $500 qua      │
│ Zelle và upload payment proof.     │
│ Deadline: {timer từ config}        │
├────────────────────────────────────┤
│ Bằng chứng thanh toán từ người gửi │
│ Chưa có bằng chứng thanh toán.     │
├────────────────────────────────────┤
│ [Chat]                             │
└────────────────────────────────────┘
```

---

### M23 — Chi tiết request Provider: Đối soát payment proof

```text
┌────────────────────────────────────┐
│ Chi tiết giao dịch                 │
│ Trạng thái: Cần đối soát tiền vào  │
├────────────────────────────────────┤
│ Requester đã upload payment proof  │
│ Amount: $500                       │
│ Method: Zelle                      │
│ Memo: mr_1781496895256             │
│ [Xem proof]                        │
├────────────────────────────────────┤
│ Provider kiểm tra tài khoản ngoài  │
│ hệ thống.                          │
├────────────────────────────────────┤
│ [Tôi chưa nhận / nhận sai]         │
│ [Xác nhận đã nhận đủ]              │
└────────────────────────────────────┘
```

**Rules:**

- Provider được mở khiếu nại ngay nếu chưa nhận/thiếu/sai memo/proof không hợp lệ.
- Provider có thể xác nhận muộn trong cửa 24h sau quá hạn theo rule SLA.

---

### M24 — Chi tiết request Provider: Chuyển tiền cho người thụ hưởng

```text
┌────────────────────────────────────┐
│ Chuyển tiền cho người thụ hưởng    │
├────────────────────────────────────┤
│ Người thụ hưởng                    │
│ Trần Văn C                         │
│ Method: MoMo                       │
│ SĐT: 0901234567                    │
│ Số tiền: 12.800.000đ               │
│ Nội dung/memo: mr_1781496895256    │
│ [Sao chép tất cả]                  │
├────────────────────────────────────┤
│ Deadline xử lý: {theo config}      │
├────────────────────────────────────┤
│ [Đã chuyển tiền & tải proof]       │
│ [Chat] [Khiếu nại nếu cần]         │
└────────────────────────────────────┘
```

**Privacy:** thông tin người thụ hưởng full chỉ hiện sau accept và ở bước Provider chi trả.

---

### M25 — Modal upload transfer proof

```text
┌────────────────────────────────────┐
│ Xác nhận đã chuyển tiền            │
│ Upload bằng chứng chuyển           │
│ 12.800.000đ cho Trần Văn C         │
├────────────────────────────────────┤
│ [+ Chụp ảnh] [+ Tải file]          │
│ Ghi chú / Mã tham chiếu            │
│ [MOMO/VCB-...]                     │
├────────────────────────────────────┤
│ [Hủy] [Gửi bằng chứng]             │
└────────────────────────────────────┘
```

---

### M26 — Chi tiết request Provider: Chờ Requester xác nhận

```text
┌────────────────────────────────────┐
│ Chi tiết giao dịch                 │
│ Trạng thái: Chờ Requester xác nhận │
├────────────────────────────────────┤
│ Bạn đã upload transfer proof.      │
│ Requester có {15 phút/config} để   │
│ xác nhận hoặc khiếu nại.           │
├────────────────────────────────────┤
│ Nếu Requester không phản hồi, hệ   │
│ thống gửi thông báo cho hai bên.   │
│ Sau 24h không xử lý, giao dịch tự  │
│ chuyển Hoàn tất.                   │
├────────────────────────────────────┤
│ [Chat] [Khiếu nại nếu được mở]     │
└────────────────────────────────────┘
```

---

## 7. Tài khoản nhận

### M27 — Tài khoản nhận: Người thụ hưởng

**Mục đích:** Quản lý người thụ hưởng riêng trong P2P.

```text
┌────────────────────────────────────┐
│ Tài khoản nhận                     │
├────────────────────────────────────┤
│ [Người thụ hưởng] [Tài khoản nhận  │
│                    tiền Provider]  │
├────────────────────────────────────┤
│ 🇻🇳 Việt Nam Đồng                  │
│ ┌────────────────────────────────┐ │
│ │ Ví MoMo                        │ │
│ │ Trần Văn C                     │ │
│ │ 0901234567                     │ │
│ │ [Sửa] [Xóa]                    │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ Vietcombank                    │ │
│ │ Nguyễn Thị M · ****1234        │ │
│ │ [Sửa] [Xóa]                    │ │
│ └────────────────────────────────┘ │
├────────────────────────────────────┤
│ [+ Thêm người thụ hưởng]           │
└────────────────────────────────────┘
```

**Rules:**

- Cho thêm/sửa/xóa.
- Không được xóa người thụ hưởng đang được dùng trong giao dịch đang diễn ra.
- Người thụ hưởng có thể thêm nhanh từ flow Gửi yêu cầu.

---

### M28 — Tài khoản nhận: Tài khoản nhận tiền Provider

**Mục đích:** Provider khai báo tài khoản để Requester chuyển tiền ngoài hệ thống.

**Tham chiếu mockup:** Màn “Tài khoản thanh toán” USD/EUR có Zelle, Venmo, PayPal, Chase Bank, SEPA.

```text
┌────────────────────────────────────┐
│ Tài khoản nhận                     │
├────────────────────────────────────┤
│ [Người thụ hưởng] [Tài khoản nhận  │
│                    tiền Provider]  │
├────────────────────────────────────┤
│ 🇺🇸 Đô la Mỹ (USD)                 │
│ ┌────────────────────────────────┐ │
│ │ Zelle chính                    │ │
│ │ +1 (408) 555-0199              │ │
│ │ [Copy] [Sửa] [Xóa]             │ │
│ ├────────────────────────────────┤ │
│ │ Venmo                          │ │
│ │ @nguyenvanb                    │ │
│ │ [Copy] [Sửa] [Xóa]             │ │
│ ├────────────────────────────────┤ │
│ │ PayPal                         │ │
│ │ vanb.remit@gmail.com           │ │
│ │ [Copy] [Sửa] [Xóa]             │ │
│ ├────────────────────────────────┤ │
│ │ Chase Bank                     │ │
│ │ ****4821                       │ │
│ │ Chase Bank · Nguyen Van B      │ │
│ │ [Copy] [Sửa] [Xóa]             │ │
│ └────────────────────────────────┘ │
├────────────────────────────────────┤
│ 🇪🇺 Euro (EUR)                     │
│ ┌────────────────────────────────┐ │
│ │ SEPA - Deutsche                │ │
│ │ DE89370400440532013000         │ │
│ │ Deutsche Bank · Nguyen Van B   │ │
│ │ [Copy] [Sửa] [Xóa]             │ │
│ └────────────────────────────────┘ │
├────────────────────────────────────┤
│ [+ Thêm tài khoản mới]             │
└────────────────────────────────────┘
```

**Rules:**

- Một currency có thể có nhiều method.
- Một currency/method chỉ có 1 tài khoản active.
- Không được xóa/sửa tài khoản đang được dùng bởi deal active hoặc request/giao dịch đang diễn ra.
- Nếu muốn đổi tài khoản đang gắn với deal active, Provider phải tạm dừng tất cả deal liên quan trước.

---

### M29 — Form thêm/sửa người thụ hưởng

```text
┌────────────────────────────────────┐
│ Thêm người thụ hưởng               │
├────────────────────────────────────┤
│ Tiền tệ nhận                       │
│ [VND ▼]                            │
│ Phương thức nhận                   │
│ [MoMo ▼]                           │
│ Tên gợi nhớ                        │
│ [Ví MoMo]                          │
│ Tên chủ tài khoản                  │
│ [Trần Văn C]                       │
│ Số điện thoại / Số tài khoản       │
│ [0901234567]                       │
└────────────────────────────────────┘
[CTA] Lưu người thụ hưởng
```

---

### M30 — Form thêm/sửa tài khoản nhận tiền Provider

```text
┌────────────────────────────────────┐
│ Thêm tài khoản nhận tiền Provider  │
├────────────────────────────────────┤
│ Currency                           │
│ [USD ▼]                            │
│ Method                             │
│ [Zelle ▼]                          │
│ Tên gợi nhớ                        │
│ [Zelle chính]                      │
│ Thông tin tài khoản                │
│ [Số điện thoại/email/handle...]    │
│ Tên chủ tài khoản                  │
│ [Nguyen Van B]                     │
└────────────────────────────────────┘
[CTA] Lưu tài khoản
```

**Validation:**

- Nếu đã có tài khoản active cho cùng currency/method, không cho tạo thêm; user phải sửa tài khoản hiện có.
- Field động theo method: Zelle/Apple Cash/PayPal/Venmo/Bank Transfer/SEPA...

---

## 8. Dispute, Chat, Rating — wireframe tối thiểu

### M31 — Dispute form

```text
┌────────────────────────────────────┐
│ Mở khiếu nại                       │
├────────────────────────────────────┤
│ Giao dịch: RQ-1028                 │
│ Trạng thái hiện tại: ...           │
├────────────────────────────────────┤
│ Vấn đề                             │
│ ( ) Chưa nhận tiền                 │
│ ( ) Nhận thiếu                     │
│ ( ) Sai memo / proof không hợp lệ  │
│ ( ) Provider không chuyển tiền     │
│ ( ) Người thụ hưởng chưa nhận      │
│ ( ) Khác                           │
├────────────────────────────────────┤
│ Mô tả                              │
│ [Nhập chi tiết...]                 │
│ Bổ sung bằng chứng                 │
│ [+ Upload file]                    │
├────────────────────────────────────┤
│ Admin xử lý trong 48 giờ.          │
│ [Gửi khiếu nại]                    │
└────────────────────────────────────┘
```

**Rules:**

- Khi vào dispute, trạng thái chuyển ngay sang `disputed`.
- Hai bên chỉ được bổ sung proof/ghi chú mới; proof cũ không sửa/xóa.
- Admin xử lý R1–R4 trong Admin Portal hiện hữu.

---

### M32 — Chat trong giao dịch

```text
┌────────────────────────────────────┐
│ Chat giao dịch RQ-1028             │
├────────────────────────────────────┤
│ System: Provider đã chấp nhận.     │
│ Bạn: Tôi đã chuyển, vui lòng check.│
│ Provider: Đang đối soát.           │
├────────────────────────────────────┤
│ [Nhập tin nhắn...] [+ Ảnh]         │
└────────────────────────────────────┘
```

**Rules:**

- Chat chỉ mở sau accept.
- Chỉ nhắn khi giao dịch đang xử lý.
- Sau khi giao dịch kết thúc, user không nhắn tiếp.
- Admin chỉ cần xem chat khi dispute; completed bình thường Admin không cần xem.

---

### M15 — Rating sau hoàn tất

```text
┌────────────────────────────────────┐
│ Đánh giá giao dịch                 │
├────────────────────────────────────┤
│ Bạn đánh giá đối tác               │
│ ★ ★ ★ ★ ☆                          │
│ Tag tích cực                       │
│ [Nhanh] [Đúng cam kết]             │
│ [Giao tiếp tốt] [Proof rõ ràng]    │
│ [Thao tác chuyên nghiệp]           │
│ Nhận xét                           │
│ [Tùy chọn]                         │
├────────────────────────────────────┤
│ [Gửi đánh giá]                     │
└────────────────────────────────────┘
```

**Rules:**

- Rating tùy chọn, không bắt buộc.
- Cả hai bên đánh giá lẫn nhau.
- Chỉ bắt buộc số sao; tag/nhận xét tùy chọn.
- Không giới hạn thời gian đánh giá sau completed.
- Đánh giá đã gửi không sửa/xóa.
- Hồ sơ chỉ hiển thị sao trung bình + số lượt; màn chi tiết đánh giá hiển thị toàn bộ, tên người đánh giá mask một phần.

---

## 9. State-based CTA Matrix

### 9.1. Requester detail CTA

| Status | CTA chính | CTA phụ | Ghi chú |
|---|---|---|---|
| pending_acceptance | Hủy yêu cầu | — | Không mất phí |
| accepted | Chuyển tiền cho Provider | Hủy giao dịch, Chat | Hủy trước proof mất phí hủy |
| payment_sent | — | Chat, Khiếu nại | Chờ Provider xác nhận |
| payment_confirmed | — | Chat, Khiếu nại nếu quá hạn/cần | Chờ Provider chuyển tiền |
| transfer_sent | Xác nhận hoàn tất | Khiếu nại, Chat | Sau timer + 24h không xử lý -> completed |
| completed | Đánh giá đối tác | Xem chi tiết | Rating tùy chọn |
| cancelled/expired/rejected/resolved | Xem kết quả | Tìm deal khác | Lý do ngắn cho Đã hủy/Hết hạn |
| disputed | Bổ sung proof/ghi chú | Chat nếu còn mở theo rule | Admin xử lý |

### 9.2. Provider detail CTA

| Status | CTA chính | CTA phụ | Ghi chú |
|---|---|---|---|
| pending_acceptance | Chấp nhận | Từ chối | Accept kiểm tra USDV 2 bên |
| accepted | — | Chat | Chờ Requester upload proof |
| payment_sent | Xác nhận đã nhận đủ | Tôi chưa nhận/nhận sai, Chat | Có thể dispute ngay |
| payment_confirmed | Đã chuyển tiền & tải proof | Chat, Khiếu nại nếu cần | Deadline từ Admin config |
| transfer_sent | — | Khiếu nại khi được mở, Chat | Chờ Requester xác nhận |
| completed | Đánh giá đối tác | Xem chi tiết | Rating tùy chọn |
| cancelled/expired/rejected/resolved | Xem kết quả | — | Timeline đầy đủ chỉ Admin |
| disputed | Bổ sung proof/ghi chú | — | Admin xử lý |

---

## 10. Mapping mockup demo cũ -> wireframe v1.6.1

| Mockup demo hiện có | Giữ lại | Cần chỉnh theo v1.6.1 |
|---|---|---|
| Gửi yêu cầu Step 1 | Bố cục amount/method/beneficiary/note | Thêm kiểm tra USDV; dữ liệu người thụ hưởng riêng P2P; CTA block nếu có request đang chờ/giao dịch đang diễn ra |
| Kết quả deal phù hợp | Card Provider, rate, method match, CTA chọn deal | Deal ẩn nếu Provider thiếu USDV hoặc đang có request/giao dịch; tên Provider mask trước accept |
| Xác nhận yêu cầu | Provider card, flow giao dịch, beneficiary, note | Thêm khối kiểm tra USDV/fee; chưa hold/chưa phí cho tới accept |
| Yêu cầu của tôi | Card request và filter | Filter đóng tách Hoàn tất/Đã hủy/Hết hạn/Đã phân xử; lý do ngắn cho hủy/hết hạn |
| Chi tiết chờ Provider | Status + beneficiary + hủy | Chuẩn thuật ngữ: yêu cầu chờ Provider chấp nhận; không timeline rút gọn |
| Chi tiết Provider accept | Phí/escrow/accept modal | Đổi escrow thành hold USDV hai phía; phí trừ ngay accept; Provider không hủy sau accept |
| Tạo Deal Mới | Corridor/rate/min-max/senderMethods/recipientMethods/note | Methods dynamic theo currency; bỏ transferTime, validDays, collateral banner — ký quỹ chỉ hold khi accept request |
| Deals của tôi | Tabs active/paused/expired, card deal | Thêm Đã xóa; deal có request liên quan được tạm dừng nhưng không sửa/xóa |
| Tài khoản thanh toán | Group theo currency và method | Đổi nhãn thành **Tài khoản nhận tiền Provider**; mỗi currency/method tối đa 1 tài khoản active |
| Yêu cầu giao dịch Provider | List chờ/đang xử lý/hoàn thành/đã đóng | Đổi thành Lịch sử nhận yêu cầu; hiển thị tất cả request từng gửi tới Provider |

---

## 11. Copy/Nhãn chuẩn v1.6.1

| Context | Nhãn chuẩn |
|---|---|
| Menu | Overview · Gửi yêu cầu · Quản lý deals · Lịch sử yêu cầu · Lịch sử nhận yêu cầu · Tài khoản nhận |
| Tài khoản nhận tabs | Người thụ hưởng · Tài khoản nhận tiền Provider |
| CTA Requester | Tìm Deal Phù Hợp · Gửi Yêu Cầu · Hủy yêu cầu · Chuyển tiền cho Provider · Xác nhận đã gửi tiền & tải bằng chứng · Xác nhận hoàn tất |
| CTA Provider | Tạo deal · Đăng Deal · Tạm dừng · Kích hoạt · Chấp nhận · Từ chối · Xác nhận đã nhận đủ · Đã chuyển tiền & tải proof |
| Status | Chờ Provider phản hồi · Chờ Requester chuyển tiền · Chờ Provider xác nhận nhận tiền · Chờ Provider chuyển tiền cho người thụ hưởng · Chờ Requester xác nhận hoàn tất · Hoàn tất · Đã hủy · Hết hạn · Đã phân xử |
| Thuật ngữ | Giao dịch đang diễn ra · Hold USDV · Phí nền tảng · Phí hủy · Phí phạt · Bằng chứng thanh toán · Bằng chứng chuyển tiền |
| Privacy | Tên được ẩn một phần trước khi giao dịch được chấp nhận. Sau khi chấp nhận, thông tin cần thiết sẽ được hiển thị theo từng bước xử lý. |

---

## 12. QC Checklist cho Wireframe

| Nhóm | Checklist |
|---|---|
| Version | Tất cả tiêu đề ghi v1.6.1. |
| Thuật ngữ | Không còn “giao dịch sống”; dùng “giao dịch đang diễn ra”. |
| SLA deal | Không có field SLA/thời gian chuyển trong Tạo/Sửa deal. |
| Overview | Không marketplace, không wallet balance, không lịch sử gần đây. |
| Gửi yêu cầu | Nhập nhu cầu trước rồi mới hiện kết quả deal. |
| Deal visibility | Ẩn deal nếu Provider bận hoặc thiếu USDV cho amount request. |
| Provider account | Một currency có nhiều method; mỗi currency/method tối đa 1 account active. |
| Tài khoản nhận | Có 2 tab: Người thụ hưởng và Tài khoản nhận tiền Provider. |
| Privacy | Tên mask trước accept, full sau accept. |
| Fee/Hold | Trừ phí 0,5% mỗi bên + hold 100% mỗi bên tại accept. |
| Cancel | Requester hủy sau accept trước proof có modal phí hủy; không cho khiếu nại case này. |
| Timeline | User không cần timeline rút gọn; Admin mới xem timeline đầy đủ. |
| History | Lịch sử yêu cầu và lịch sử nhận yêu cầu tách riêng. |

---

## 13. Ghi chú bàn giao Designer/Figma

1. Dùng mockup demo hiện có làm visual baseline nhưng update nghiệp vụ theo v1.6.1.
2. Màn tạo deal phải bỏ cụm “Thời gian chuyển”. Nếu cần hiển thị tốc độ xử lý, chỉ hiển thị ở chi tiết giao dịch dựa trên Admin config, không phải input của Provider.
3. Với các màn Provider, chuyển wording “Tài khoản thanh toán” thành “Tài khoản nhận tiền Provider” trong tab tương ứng để tránh nhầm với tài khoản người thụ hưởng.
4. Cần tạo component reusable cho:
   - Currency selector
   - Method chip
   - Request card
   - Deal card
   - Hold/Fee block
   - Proof block
   - Status badge
   - Confirm modal
5. Các mockup màu xanh lá/xanh dương hiện có có thể giữ, nhưng flow P2P là một tính năng duy nhất trong VLinkPay, không phải 2 app tách rời.

---

*Tài liệu wireframe v1.6.1 này dùng để bàn giao UI/UX Designer dựng Figma và làm căn cứ trao đổi với Dev/QC về cấu trúc màn hình. Các rule nghiệp vụ chi tiết lấy theo BA Spec v1.6.1.*
