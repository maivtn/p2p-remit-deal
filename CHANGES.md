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

- Tab filter "Tạm dừng" đã bị xoá khỏi Deals của tôi (chỉ còn: Tất cả / Hoạt động / Hết hạn)

**File:** `src/app/components/provider/ProviderApp.tsx`, `src/app/components/requester/RequesterApp.tsx`

---

## Form Tạo Deal Mới (CreateDealModal – Provider)

### Field đã xoá
- **Thời gian chuyển** – bộ nút chọn thời gian (30–60 phút, 1–2 giờ, ...)
- **Hiệu lực** – bộ nút 7 / 14 / 30 ngày

### Section cặp tiền tệ – thiết kế lại

**Trước:** 1 label "Cặp tiền tệ" với 2 dropdown nằm ngang.

**Sau:** 2 ô dọc với label riêng:

| Input | Label | Ghi chú |
|---|---|---|
| 1 | `Người thụ hưởng nhận bằng` | `fromCurrency` |
| 2 | `Tôi gửi bằng` | `toCurrency` – có subtitle *"Đang ở quốc gia nào, trả bằng"* |

### Label đổi tên

| Trước | Sau |
|---|---|
| `💳 Người gửi 🇺🇸 thanh toán cho tôi qua` | `Người thụ hưởng nhận {fromCurrency} bằng` |
| `📤 Tôi gửi tiền 🇻🇳 qua` | `Tôi gửi tiền {toCurrency} bằng` |

### Section "Người thụ hưởng nhận … bằng" – thiết kế lại

**Trước:** `PaymentMethodPicker` multi-select.

**Sau:**
1. **Radio list phương thức** (inline, flex-wrap) – chọn 1 trong các phương thức theo `fromCurrency`. Đổi currency reset cả phương thức lẫn tài khoản đã chọn.
2. **Chip tài khoản đang chọn** (hiển thị khi đã pick/add).
3. **2 nút hành động:**
   - **Chọn tài khoản** – overlay danh sách, lọc theo currency + phương thức đang chọn ở radio.
   - **Thêm tài khoản** – overlay form; nếu đã chọn phương thức ở radio thì ẩn bộ chọn hình thức và hiện thẳng form tương ứng.

### Section "Tôi gửi tiền … bằng"

`PaymentMethodPicker` multi-select giữ nguyên, thêm **checkbox icon** vào mỗi item (ô vuông xanh có dấu ✓ khi chọn).

**File:** `src/app/components/provider/ProviderApp.tsx` – `CreateDealModal`

---

## Deals của tôi (DealsTab – Provider)

### Action buttons

**Trước:** Nút "Tạm dừng / Kích hoạt" + nút Xoá.

**Sau:** 3 nút trên mỗi deal card:

| Nút | Icon | Hiển thị |
|---|---|---|
| **Xem** | Eye | Luôn hiện – mở bottom sheet chi tiết deal |
| **Sửa** | Edit2 | Ẩn nếu `expired` – mở `CreateDealModal` pre-fill, lưu cập nhật deal |
| **Xoá** | Trash2 | Ẩn nếu `expired` |

### Modal Sửa Deal

`CreateDealModal` nhận thêm prop `initialDeal?: Deal`:
- Tiêu đề: **"Chỉnh sửa Deal"**
- Nút lưu: **"Cập nhật Deal"**
- Form pre-fill từ dữ liệu deal hiện tại

### Modal Xem Deal

Bottom sheet hiển thị: cặp tiền tệ + tỷ giá, khoảng min/max, phương thức nhận/gửi, ghi chú.

**File:** `src/app/components/provider/ProviderApp.tsx` – `DealsTab`

---

## Form Tìm Deal (RequesterApp)

| Trước | Sau |
|---|---|
| `HÌNH THỨC THANH TOÁN` (section header) | `Tôi gửi bằng` |

**File:** `src/app/components/requester/RequesterApp.tsx`
