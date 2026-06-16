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

**File:** `src/app/components/provider/ProviderApp.tsx`, `src/app/components/requester/RequesterApp.tsx`

---

## Form Tạo Deal Mới (CreateDealModal – Provider)

### Field đã xoá
- **Thời gian chuyển** – bộ nút chọn thời gian (30–60 phút, 1–2 giờ, ...)
- **Hiệu lực** – bộ nút 7 / 14 / 30 ngày

### Label đổi tên
| Trước | Sau |
|---|---|
| `💳 Người gửi 🇺🇸 thanh toán cho tôi qua` | `Người thụ hưởng nhận USD bằng` |
| `📤 Tôi gửi tiền 🇻🇳 qua` | `Tôi gửi tiền VND bằng` |

### Section "Người thụ hưởng nhận USD bằng" – thiết kế lại

**Trước:** `PaymentMethodPicker` multi-select (chọn nhiều hình thức).

**Sau:** Chỉ chọn **1 tài khoản nhận**, với 2 nút hành động:

- **Chọn tài khoản** – mở overlay danh sách tài khoản (lọc theo `fromCurrency`), single-select.
- **Thêm tài khoản** – mở overlay form điền thông tin tài khoản mới (hình thức, tên gợi nhớ, số/email/handle tuỳ method). Sau khi lưu, tài khoản mới được chọn tự động.

**File:** `src/app/components/provider/ProviderApp.tsx` – `CreateDealModal`

---

## Form Tìm Deal (RequesterApp)

| Trước | Sau |
|---|---|
| `HÌNH THỨC THANH TOÁN` (section header) | `Tôi gửi bằng` |

**File:** `src/app/components/requester/RequesterApp.tsx`
