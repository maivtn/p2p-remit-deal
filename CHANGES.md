# Changelog – UI Label & Form Changes

## Vai trò (Role Labels)

| Trước | Sau |
|---|---|
| `Nhà cung cấp (Provider)` | `Người đăng deal` |
| `Người dùng (Requester)` | `Người tìm deal` |
| `Tôi là Nhà cung cấp` (RoleSelection card) | `Tôi là Người đăng deal` |
| `Tôi cần Giao dịch` (RoleSelection card) | `Tôi là Người tìm deal` |

**File:** `src/app/App.tsx`, `src/app/components/RoleSelection.tsx`

---

## Trạng thái giao dịch (Status Labels)

| Trước | Sau |
|---|---|
| `Chờ duyệt` | `Chờ chấp nhận` |
| `Tạm dừng` (deal status) | `Đã hoàn tất` |

**File:** `src/app/components/provider/ProviderApp.tsx`, `src/app/components/requester/RequesterApp.tsx`

---

## Deal Status – thiết kế lại

### Type
`Deal.status` trước: `"active" | "paused" | "expired"`
`Deal.status` sau: `"active" | "expired" | "completed"` — xoá `paused`, thêm `completed`

### Badge
| Status | Label | Màu |
|---|---|---|
| `active` | Hoạt động | Xanh lá |
| `completed` | Đã hoàn tất | Xanh lá |
| `expired` | Hết hạn | Xám |

### Tab filter Deals của tôi
**Trước:** Tất cả / Hoạt động / Tạm dừng / Hết hạn
**Sau:** Tất cả / Hoạt động / Đã hoàn tất / Hết hạn

**File:** `src/app/data/mockData.ts`, `src/app/components/provider/ProviderApp.tsx`

---

## Logic Deal – 1 deal / 1 yêu cầu

- **Phía người tìm deal**: `availableDeals` chỉ hiển thị deal `active` chưa có request nào (non-cancelled/rejected). Deal đã có request biến mất khỏi danh sách.
- **Khi request `completed`**: deal tương ứng tự động chuyển sang `status: "completed"`.
- **Phía người đăng deal**: nút Sửa/Xoá ẩn khi deal đã có request đang xử lý hoặc khi deal không còn `active`.

**File:** `src/app/App.tsx`, `src/app/components/provider/ProviderApp.tsx`

---

## Deals của tôi – Action buttons

| Điều kiện | Nút hiển thị |
|---|---|
| Deal `active`, chưa có request | Xem deal · Sửa · Xoá |
| Deal `active`, đã có request | Xem deal · Xem yêu cầu (→ tab Yêu cầu) |
| Deal `completed` / `expired` | Xem deal (chỉ xem) |

- **"Xem yêu cầu"**: chuyển sang tab Yêu cầu (danh sách), không phải vào chi tiết.
- **Số yêu cầu** trên card: lấy từ `requests` thực tế, hiển thị `"0 yêu cầu"` hoặc `"1 yêu cầu"`.

### Modal Sửa Deal
`CreateDealModal` nhận prop `initialDeal?: Deal` — tiêu đề "Chỉnh sửa Deal", nút "Cập nhật Deal", form pre-fill.

### Modal Xem Deal
Bottom sheet: cặp tiền tệ + tỷ giá, khoảng min/max, phương thức nhận/gửi, ghi chú.

**File:** `src/app/components/provider/ProviderApp.tsx` – `DealsTab`

---

## Form Tạo Deal Mới (CreateDealModal – Provider)

### Field đã xoá
- **Thời gian chuyển** – bộ nút chọn thời gian (30–60 phút, 1–2 giờ, ...)
- **Hiệu lực** – bộ nút 7 / 14 / 30 ngày

### Section cặp tiền tệ – thiết kế lại

**Trước:** 1 label "Cặp tiền tệ" với 2 dropdown nằm ngang, có icon lá cờ.

**Sau:** 2 ô dọc, không icon lá cờ:

| Thứ tự | Label | Field | Ghi chú |
|---|---|---|---|
| 1 | `Người thụ hưởng nhận bằng` | `fromCurrency` | |
| 2 | `Tôi gửi bằng` | `toCurrency` | Subtitle: *"Đang ở quốc gia nào, trả bằng"* |

### Label section payment methods

| Trước | Sau |
|---|---|
| `💳 Người gửi 🇺🇸 thanh toán cho tôi qua` | `Người thụ hưởng nhận {fromCurrency} bằng hình thức` |
| `📤 Tôi gửi tiền 🇻🇳 qua` | `Tôi gửi tiền {toCurrency} bằng hình thức` |

### Section "Người thụ hưởng nhận … bằng hình thức" – thiết kế lại

**Sau:**
1. **Radio list phương thức** (inline, flex-wrap) – chọn 1 theo `fromCurrency`. Đổi currency reset phương thức và tài khoản.
2. **Chip tài khoản đang chọn** (hiển thị khi đã pick/add).
3. **2 nút:**
   - **Chọn tài khoản** – overlay, lọc theo currency + phương thức radio.
   - **Thêm tài khoản** – overlay form; nếu đã chọn phương thức thì ẩn bộ chọn, hiện thẳng form tương ứng.

### Section "Tôi gửi tiền … bằng hình thức"

Multi-select checkbox (ô vuông xanh có ✓ khi chọn), nhiều hình thức.

**File:** `src/app/components/provider/ProviderApp.tsx` – `CreateDealModal`

---

## Form Tìm Deal (RequesterApp)

| Trước | Sau |
|---|---|
| `HÌNH THỨC THANH TOÁN` (section header) | `Tôi gửi bằng` |

**File:** `src/app/components/requester/RequesterApp.tsx`
