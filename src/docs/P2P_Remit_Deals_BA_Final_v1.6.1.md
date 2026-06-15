# VLINKPAY — P2P REMIT DEAL

# TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ TRIỂN KHAI — BA SPEC v1.6.1

| Thông tin | Nội dung |
|---|---|
| **Tên tính năng** | P2P Remit Deal |
| **Sản phẩm cha** | VLinkPay |
| **Vị trí truy cập** | Menu **Exchange Hub** trong VLinkPay |
| **Loại tài liệu** | Business Requirement / Functional Business Spec |
| **Phiên bản** | v1.6.1 — VLinkPay-integrated, business-only implementation spec |
| **Ngày cập nhật** | 15/06/2026 |
| **Mục tiêu tài liệu** | Làm tài liệu bàn giao cho Product, Dev, QC, Operation để triển khai nghiệp vụ |
| **Phạm vi tài liệu** | Chỉ tập trung nghiệp vụ, luồng, trạng thái, màn hình, quyền, phí, hold USDV, lịch sử, cấu hình vận hành |
| **Không bao gồm** | Technical design, OpenAPI, database schema vật lý, test cases chi tiết |
| **Nguyên tắc phiên bản** | v1.6.1 kế thừa v6.0/v5, đồng thời override theo các quyết định mới đã chốt trong phiên phân tích |

---

## 0. TÓM TẮT THAY ĐỔI CHÍNH CỦA v1.6.1

v1.6.1 giữ định hướng P2P Remit Deal là **một tính năng nằm trong VLinkPay**, truy cập qua **Exchange Hub**. Người dùng đã hoàn tất **KYC/KYB hợp lệ trong VLinkPay** mới được vào tính năng; P2P không tự xây lại luồng KYC/KYB.

Các quyết định chính của v1.6.1:

| Nhóm | Quyết định v1.6.1 |
|---|---|
| Product placement | P2P Remit Deal là tính năng trong VLinkPay, vào từ menu **Exchange Hub** |
| Điều kiện vào tính năng | Chỉ user đã **KYC/KYB hợp lệ** mới vào được P2P Remit Deal |
| Loại người dùng | Cho phép cả **cá nhân/KYC** và **doanh nghiệp/KYB** |
| Vai trò | Cả cá nhân và doanh nghiệp đều có thể là **Requester**, **Provider**, hoặc **dual-role** |
| Provider eligibility | Không cần đăng ký/duyệt Provider riêng; KYC/KYB hợp lệ là đủ điều kiện sử dụng vai Provider |
| Ví dùng để hold/phí | Dùng **ví USDV** trong VLinkPay/P2P context |
| Hold khi Provider accept | Hold cả phía **Requester** và **Provider**, mỗi bên bằng **100% số tiền request quy đổi USDV** |
| Phí nền tảng | Mỗi bên chịu **0,5%**, trừ trực tiếp từ ví USDV tại thời điểm Provider accept thành công |
| Dòng tiền chính | Requester và Provider vẫn chuyển tiền **ngoài hệ thống** theo phương thức đã chọn; hệ thống lưu proof/memo/status |
| Provider không được hủy sau accept | Provider đã accept thì không được hủy, vì Requester có thể đã chuyển tiền ngoài hệ thống |
| Requester được hủy sau accept | Chỉ được hủy nếu **chưa upload payment proof**; mất phí nền tảng đã trừ + phí hủy cấu hình |
| Phí hủy | Admin cấu hình tỷ lệ phí hủy, mặc định có thể là 1%; tính trên số tiền request quy đổi USDV; phân bổ giữa Provider và nền tảng theo tỷ lệ cấu hình |
| Quy tắc 1 giao dịch đang diễn ra | Một tài khoản chỉ được có **1 giao dịch đang diễn ra tại một thời điểm**, tính gộp cả hai vai; giao dịch đang diễn ra bắt đầu từ lúc Provider accept thành công |
| Pending request rule | Một Requester chỉ có **1 yêu cầu chờ Provider chấp nhận** tại một thời điểm; một Provider chỉ nhận **1 yêu cầu chờ phản hồi** tại một thời điểm |
| Deal visibility | Provider đang có request chờ phản hồi hoặc giao dịch đang diễn ra thì deal của Provider bị ẩn khỏi kết quả tìm deal |
| Marketplace | Không có marketplace browse độc lập trên Home; danh sách deal chỉ xuất hiện sau khi Requester nhập nhu cầu |
| Navigation P2P | **Overview / Gửi yêu cầu / Quản lý deals / Lịch sử yêu cầu / Lịch sử nhận yêu cầu / Tài khoản nhận** |
| Dữ liệu người nhận | Người thụ hưởng và tài khoản nhận Provider là dữ liệu **riêng trong P2P**, không dùng chung danh bạ VLinkPay |
| Tài khoản nhận tiền Provider | Với mỗi currency, Provider có thể khai báo nhiều hình thức nhận tiền khác nhau như Zelle, Venmo, Apple Cash, PayPal, Bank Transfer...; mỗi currency/method chỉ có tối đa 1 tài khoản đang hoạt động |
| Notification Member | Chỉ dùng **in-app notification** trong Notification Center chung của VLinkPay |
| Admin config | Dùng Admin Portal/backoffice hiện hữu của hệ sinh thái, không xây Admin Portal mới trong scope P2P |
| Deal SLA | Provider **không nhập SLA khi tạo deal**; thời hạn xử lý/chi trả lấy từ cấu hình Admin/backoffice theo rule timer |

---

## 1. TỔNG QUAN NGHIỆP VỤ

### 1.1. Mục tiêu tính năng

P2P Remit Deal cho phép người dùng VLinkPay đã xác minh danh tính/doanh nghiệp tìm và thực hiện giao dịch chuyển tiền ngang hàng thông qua các Provider có thanh khoản ở hai đầu. Provider tạo deal với tỷ giá, phương thức nhận tiền, phương thức chi trả, hạn mức và hiệu lực; **không nhập SLA trong form tạo deal**. Thời hạn xử lý/chi trả lấy từ cấu hình Admin/backoffice. Requester nhập nhu cầu, chọn deal phù hợp, gửi yêu cầu, chuyển tiền ngoài hệ thống cho Provider, upload bằng chứng; Provider đối soát và chi trả cho người thụ hưởng.

Hệ thống VLinkPay đóng vai trò:

1. Kết nối Requester và Provider.
2. Kiểm tra KYC/KYB, rule giao dịch và số dư USDV.
3. Hold USDV hai phía sau khi Provider accept.
4. Trừ phí nền tảng bằng USDV.
5. Quản lý trạng thái, deadline, proof, memo, chat, lịch sử.
6. Cho phép Admin phân xử khi có dispute.
7. Tự động release/khấu trừ USDV theo rule nghiệp vụ hoặc quyết định Admin.

### 1.2. Nguyên tắc niềm tin của v1.6.1

| Nguyên tắc | Mô tả |
|---|---|
| KYC/KYB trước khi vào P2P | Người dùng chỉ vào được tính năng nếu đã xác minh trong VLinkPay |
| Hold USDV hai phía | Sau accept, cả Requester và Provider đều bị hold 100% số tiền request quy đổi USDV |
| Phí trừ ngay khi kết nối | Hai bên đã chính thức kết nối khi Provider accept; hệ thống trừ phí 0,5% mỗi bên ngay lúc này |
| Dòng tiền chính ngoài hệ thống | USDV hold không phải dòng tiền thanh toán chính; tiền gửi/chi trả vẫn qua kênh ngoài theo method đã chọn |
| Proof bất biến | Proof đã upload không sửa/xóa; chỉ được bổ sung proof/ghi chú mới khi dispute |
| Provider không được hủy sau accept | Tránh rủi ro Requester đã chuyển tiền ngoài hệ thống nhưng Provider hủy |
| Requester chịu phí nếu hủy sau accept | Vì hai bên đã kết nối, Provider đã bị giữ thanh khoản/thời gian xử lý |
| Không tự hoàn tất quá sớm | Chỉ completed khi Requester xác nhận, hoặc khi hết thời hạn sau transfer proof theo rule 24h |

---

## 2. ACTOR, LOẠI TÀI KHOẢN VÀ VAI TRÒ

### 2.1. Loại tài khoản tham gia

| Loại | Điều kiện | Có được vào P2P? | Ghi chú |
|---|---|---:|---|
| Cá nhân/KYC | KYC hợp lệ trong VLinkPay | Có | Dùng tên theo KYC, mask trước accept, full sau accept |
| Doanh nghiệp/KYB | KYB hợp lệ trong VLinkPay | Có | Hiển thị tên doanh nghiệp, mask trước accept, full sau accept |
| Admin | Tài khoản vận hành nội bộ | Có qua Admin Portal hiện hữu | Xử lý dispute/cấu hình; không đi qua luồng KYC/KYB P2P |

### 2.2. Vai trò nghiệp vụ

| Vai trò | Ai có thể giữ | Quyền chính |
|---|---|---|
| Requester | Cá nhân/KYC hoặc doanh nghiệp/KYB | Gửi yêu cầu, chọn deal, chuyển tiền ngoài hệ thống, upload payment proof, hủy trước proof, khiếu nại, xác nhận hoàn tất, đánh giá |
| Provider | Cá nhân/KYC hoặc doanh nghiệp/KYB | Tạo/quản lý deal, nhận request, accept/reject, đối soát tiền vào, upload transfer proof, khiếu nại, nhận đánh giá |
| Dual-role | Một tài khoản có thể giữ cả hai vai | Có thể vừa tạo deal vừa gửi yêu cầu, nhưng bị ràng buộc quy tắc 1 giao dịch đang diễn ra / 1 yêu cầu chờ |
| Admin | Vận hành | Phân xử dispute, cấu hình phí/SLA/rule, xem hồ sơ dispute, thực thi outcome tài chính |

### 2.3. Quy tắc dual-role

| Rule | Nội dung |
|---|---|
| DR-01 | Một tài khoản VLinkPay có thể vừa là Requester vừa là Provider. |
| DR-02 | Một tài khoản chỉ được có **1 giao dịch đang diễn ra** tại một thời điểm, tính gộp cả hai vai. |
| DR-03 | Giao dịch đang diễn ra bắt đầu từ thời điểm **Provider accept thành công**. |
| DR-04 | Một Requester chỉ được có **1 yêu cầu đang chờ Provider chấp nhận** tại một thời điểm. |
| DR-05 | Một Provider chỉ được có **1 yêu cầu chờ phản hồi** tại một thời điểm. |
| DR-06 | Nếu Provider đang có request chờ phản hồi hoặc giao dịch đang diễn ra, các deal của Provider bị ẩn khỏi kết quả tìm deal. |
| DR-07 | Nếu Member chỉ đang có request chờ ở vai Requester, deal của Member đó ở vai Provider chưa bị ẩn chỉ vì pending đó; deal chỉ bị ẩn khi đã có giao dịch đang diễn ra sau accept hoặc có request/giao dịch liên quan ở vai Provider. |
| DR-08 | Self-trading bị chặn trong phạm vi cùng một tài khoản VLinkPay. Member không được dùng chính account của mình để chọn deal do chính mình tạo. |

---

## 3. INFORMATION ARCHITECTURE VÀ NAVIGATION

### 3.1. Entry point trong VLinkPay

Người dùng truy cập P2P Remit Deal từ menu **Exchange Hub** trong VLinkPay.

Nếu user chưa KYC/KYB hợp lệ, hệ thống không cho vào P2P Remit Deal và điều hướng theo rule KYC/KYB chung của VLinkPay.

### 3.2. Navigation chính trong P2P Remit Deal

```text
P2P Remit Deal
├── Overview
├── Gửi yêu cầu
├── Quản lý deals
├── Lịch sử yêu cầu
├── Lịch sử nhận yêu cầu
└── Tài khoản nhận
```

| Menu | Mục đích |
|---|---|
| Overview | Màn tổng quan/cần xử lý, hiển thị việc đang cần hành động và CTA chính |
| Gửi yêu cầu | Luồng Requester nhập nhu cầu, tìm deal phù hợp, gửi request |
| Quản lý deals | Provider tạo, tạm dừng, kích hoạt, xem/sửa/xóa mềm deal theo rule |
| Lịch sử yêu cầu | Danh sách request do Member tạo ở vai Requester |
| Lịch sử nhận yêu cầu | Danh sách request gửi tới Member ở vai Provider |
| Tài khoản nhận | Gom 2 nhóm/tab con: **Người thụ hưởng** và **Tài khoản nhận tiền Provider** |

### 3.3. Overview

Overview là màn đầu tiên sau khi vào P2P Remit Deal. Màn này **không hiển thị marketplace**, **không hiển thị lịch sử gần đây**, **không hiển thị số dư USDV** vì VLinkPay đã có Wallet riêng.

Thứ tự nội dung:

```text
1. Đang xử lý / cần xử lý
2. CTA Tạo deal & Gửi yêu cầu
```

Nếu không có việc cần xử lý, màn giữ bố cục đơn giản, không cần empty state phức tạp.

### 3.4. CTA chính trên Overview

| CTA | Điều kiện hiển thị | Khi bị chặn / ghi chú |
|---|---|---|
| Tạo deal | User đủ điều kiện Provider | Chỉ bị chặn nếu số dư USDV không đủ theo rule tạo deal. Không bị chặn chỉ vì Provider đang có request chờ phản hồi; tuy nhiên deal mới/đang active có thể bị ẩn khỏi kết quả tìm deal theo rule visibility. |
| Gửi yêu cầu | User đủ điều kiện Requester | Bị chặn nếu đang có 1 request chờ Provider chấp nhận hoặc có giao dịch đang diễn ra; CTA deep-link về request/giao dịch đang mở. |

---

## 4. DỮ LIỆU RIÊNG TRONG P2P

### 4.1. Người thụ hưởng

Danh sách **Người thụ hưởng** là dữ liệu riêng trong P2P Remit Deal, không dùng chung danh bạ/beneficiary VLinkPay.

Người dùng có thể:

| Action | Rule |
|---|---|
| Thêm | Thêm từ màn Tài khoản nhận hoặc thêm nhanh trong flow Gửi yêu cầu |
| Sửa | Cho phép sửa nếu không ảnh hưởng giao dịch đang diễn ra |
| Xóa | Cho phép xóa nếu người thụ hưởng không đang được dùng trong giao dịch đang diễn ra |
| Xem | Danh sách theo currency/method; dữ liệu nhạy cảm mask theo ngữ cảnh |

### 4.2. Tài khoản nhận tiền của Provider

Provider quản lý tài khoản nhận tiền riêng trong P2P theo **currency/method**. Requester sẽ dùng thông tin này để chuyển tiền ngoài hệ thống sau khi Provider accept.

Nguyên tắc mới của v1.6.1: **một currency có thể có nhiều hình thức nhận tiền**. Ví dụ với USD, Provider có thể khai báo các hình thức như **Zelle, Venmo, Apple Cash, PayPal, Bank Transfer**. Mỗi hình thức cần có thông tin tài khoản tương ứng để Requester chuyển tiền đúng kênh.

| Rule | Nội dung |
|---|---|
| PA-01 | Mỗi currency có thể có nhiều **method/hình thức nhận tiền** được hỗ trợ. Ví dụ USD có thể gồm Zelle, Venmo, Apple Cash, PayPal, Bank Transfer. |
| PA-02 | Mỗi **currency/method** chỉ được có tối đa **1 tài khoản nhận tiền Provider active** trong MVP. |
| PA-03 | Không cho phép nhiều tài khoản đang hoạt động cho cùng một currency/method. Nếu cần đổi tài khoản, Provider phải sửa tài khoản hiện có theo rule PA-05. |
| PA-04 | Provider có màn riêng **Tài khoản nhận tiền** trong khu Tài khoản nhận. |
| PA-05 | Provider được thêm/sửa/xóa tài khoản nếu tài khoản không đang được dùng trong deal active hoặc request/giao dịch đang diễn ra. |
| PA-06 | Nếu muốn đổi tài khoản đang được dùng bởi deal active, Provider phải tạm dừng tất cả deal liên quan trước. |
| PA-07 | Khi tạo deal, Provider phải có tài khoản nhận tiền tương ứng với từng method/currency đã chọn. |
| PA-08 | Deal có thể chọn nhiều method nhận tiền trong cùng một currency nếu Provider đã khai báo đủ tài khoản tương ứng. |

---

## 5. LUỒNG GỬI YÊU CẦU — REQUESTER FLOW

### 5.1. Nguyên tắc flow

P2P v1.6.1 không có màn marketplace browse độc lập. Danh sách Provider/deal chỉ xuất hiện sau khi Requester nhập nhu cầu.

```text
Requester nhập nhu cầu
    -> hệ thống kiểm tra số dư USDV Requester
    -> hệ thống lọc deal đủ điều kiện
    -> Requester chọn Provider/deal
    -> xác nhận gửi request
    -> request chờ Provider phản hồi
```

### 5.2. Bước 1 — Nhập nhu cầu

Requester nhập:

| Nhóm | Trường |
|---|---|
| Corridor | Tiền gửi, tiền nhận |
| Amount | Số tiền gửi |
| Method | Phương thức Requester trả Provider, phương thức người nhận nhận tiền |
| Người thụ hưởng | Chọn từ danh sách đã lưu hoặc thêm nhanh |
| Ghi chú | Ghi chú cho Provider nếu cần |

### 5.3. Kiểm tra USDV khi tạo request

Khi Requester bấm tạo/tìm yêu cầu, hệ thống phải kiểm tra ví USDV của Requester có đủ:

```text
100% số tiền request quy đổi sang USDV + phí nền tảng Requester 0,5%
```

Nếu không đủ:

- Không tạo request.
- Hiển thị popup thông báo thiếu số dư.
- Yêu cầu nạp thêm USDV.

### 5.4. Tỷ giá quy đổi USDV

| Rule | Nội dung |
|---|---|
| FX-01 | Tỷ giá quy đổi sang USDV do Admin/backoffice cấu hình theo corridor/chính sách hệ thống. |
| FX-02 | Khi Requester tạo request, hệ thống lấy **snapshot tỷ giá USDV** tại thời điểm tạo request. |
| FX-03 | Snapshot này giữ nguyên cho toàn bộ giao dịch, dùng để kiểm tra số dư, hold, phí, hủy, phạt. |

### 5.5. Kết quả tìm deal

Hệ thống chỉ hiển thị deal đủ điều kiện:

| Điều kiện | Rule |
|---|---|
| Deal active | Deal đang hoạt động và còn hiệu lực |
| Không bị pause/delete/expired | Deal tạm dừng, hết hạn, đã xóa không hiển thị |
| Không self-trading | Không hiển thị deal do chính tài khoản Requester tạo |
| Provider rảnh | Provider không có request chờ phản hồi/giao dịch đang diễn ra |
| Provider đủ USDV | Ví USDV Provider đủ cover amount request + phí Provider tại mức amount Requester đang tìm |
| Amount hợp lệ | Amount nằm trong min/max của deal |
| Method hợp lệ | Method của request khớp deal |

Nếu Provider có deal phù hợp nhưng ví USDV không đủ cho amount request, deal đó bị **ẩn khỏi kết quả tìm deal**.

### 5.6. Gửi request

Sau khi chọn deal, Requester xác nhận gửi yêu cầu. Hệ thống tạo request trạng thái `pending_acceptance`.

Tại thời điểm này:

- Chưa hold USDV.
- Chưa trừ phí.
- Requester vẫn có thể hủy không mất phí.
- Provider nhận thông báo in-app để phản hồi trong thời hạn cấu hình.

---

## 6. LUỒNG PROVIDER PHẢN HỒI REQUEST

### 6.1. Thời hạn phản hồi

Provider có thời hạn **5–10 phút tùy Admin cấu hình** để accept/reject request.

Nếu Provider không phản hồi trong thời hạn:

- Request chuyển `expired`.
- Không phát sinh phí cho hai bên.
- Deal của Provider có thể hiển thị lại nếu vẫn active/đủ điều kiện.

### 6.2. Provider accept request

Khi Provider bấm Accept, hệ thống kiểm tra lại cả hai phía:

| Bên | Điều kiện bắt buộc |
|---|---|
| Requester | Ví USDV đủ để hold 100% amount request quy đổi USDV + trừ phí 0,5% |
| Provider | Ví USDV đủ để hold 100% amount request quy đổi USDV + trừ phí 0,5% |

Nếu cả hai đủ:

1. Trừ phí nền tảng Requester 0,5% từ ví USDV Requester.
2. Trừ phí nền tảng Provider 0,5% từ ví USDV Provider.
3. Hold USDV Requester bằng 100% amount request quy đổi USDV.
4. Hold USDV Provider bằng 100% amount request quy đổi USDV.
5. Chuyển request sang `accepted`.
6. Mở chat trong giao dịch.
7. Mở hướng dẫn thanh toán cho Requester.

### 6.3. Nếu Requester không đủ USDV tại thời điểm Provider accept

Nếu tại lúc Provider bấm Accept, ví USDV của Requester không còn đủ:

- Provider accept không thành công.
- Request tự đóng với trạng thái hiển thị là **Hết hạn**.
- Không trừ phí hai bên.
- Không hold USDV.
- Gửi thông báo cho người tạo request.

### 6.4. Nếu Provider không đủ USDV tại thời điểm accept

Nếu Provider không đủ USDV để hold + trừ phí:

- Accept không thành công.
- Request chuyển **Hết hạn**.
- Không trừ phí bên nào.
- Không ghi vi phạm/không ảnh hưởng uy tín Provider vì chưa accept thành công.
- Gửi thông báo phù hợp để tránh Requester chờ lâu.

### 6.5. Provider reject request

Provider có thể từ chối request trước accept. Request chuyển `rejected`; không phí, không hold.

---

## 7. PHÍ, HOLD USDV VÀ XỬ LÝ TÀI CHÍNH

### 7.1. Phí nền tảng

| Đối tượng | Mức phí | Thời điểm trừ | Nguồn trừ |
|---|---:|---|---|
| Requester | 0,5% amount request quy đổi USDV | Khi Provider accept thành công | Ví USDV Requester |
| Provider | 0,5% amount request quy đổi USDV | Khi Provider accept thành công | Ví USDV Provider |

Phí nền tảng đã trừ tại accept về nguyên tắc **không hoàn lại**, trừ khi có rule đặc biệt được Admin/outcome xử lý riêng. Với outcome hủy trung lập R4, v1.6.1 chốt **không hoàn phí nền tảng cho cả hai bên**.

### 7.2. Hold USDV sau accept

| Bên | Hold amount | Release khi nào |
|---|---:|---|
| Requester | 100% amount request quy đổi USDV | Completed, cancelled/expired theo rule, resolved theo Admin outcome |
| Provider | 100% amount request quy đổi USDV | Completed, cancelled/expired theo rule, resolved theo Admin outcome |

USDV hold không phải dòng tiền thanh toán chính. Dòng tiền chính vẫn do Requester/Provider chuyển ngoài hệ thống theo phương thức đã chọn.

### 7.3. Completed bình thường

Khi giao dịch completed:

- Release toàn bộ hold của Requester.
- Release toàn bộ hold của Provider.
- Không phát sinh thêm phí/phạt.
- Phí nền tảng đã trừ khi accept không hoàn lại.
- Mở quyền đánh giá hai bên.

### 7.4. Requester hủy sau accept nhưng chưa upload payment proof

Requester chỉ được hủy sau accept nếu **chưa upload payment proof**.

Khi bấm hủy, modal phải cảnh báo rõ:

> Bạn sẽ mất thêm khoản phí hủy vì giao dịch đã được kết nối với Provider. Khoản phí này được tính theo tỷ lệ do hệ thống cấu hình và có thể được phân bổ cho Provider/nền tảng theo chính sách hiện hành.

Xử lý:

| Hạng mục | Rule |
|---|---|
| Trạng thái | `cancelled` — Đã hủy bởi Requester |
| Phí nền tảng Requester | 0,5% đã trừ lúc accept, không hoàn |
| Phí nền tảng Provider | 0,5% đã trừ lúc accept, không mặc định hoàn |
| Phí hủy bổ sung | Do Admin cấu hình, mặc định có thể là 1%, tính trên amount request quy đổi USDV |
| Phân bổ phí hủy | Admin cấu hình tỷ lệ Provider nhận / nền tảng giữ lại, tổng 100% |
| Hold Requester | Release lại sau khi trừ phí hủy |
| Hold Provider | Release lại |
| Khiếu nại | Không cho mở khiếu nại cho case Requester đã chủ động hủy trước proof |

### 7.5. Requester không upload payment proof đúng hạn

Sau khi Provider accept, Requester có thời hạn do Admin cấu hình, ví dụ 20 hoặc 30 phút, để chuyển tiền ngoài hệ thống và upload payment proof.

Nếu hết hạn mà chưa upload proof:

- Xử lý giống Requester hủy sau accept.
- Request chuyển `cancelled` với lý do **Đã hủy do quá hạn thanh toán**.
- Requester mất phí nền tảng đã trừ + phí hủy cấu hình.
- Provider/nền tảng nhận phân bổ phí hủy theo cấu hình.
- Release hold hai bên theo rule.

### 7.6. Provider vi phạm/quá hạn dẫn tới tự hủy

Nếu Provider quá hạn xử lý ở các bước quy định và giao dịch tự hủy theo rule, Provider chịu:

1. Phí nền tảng 0,5% đã trừ lúc accept, không hoàn.
2. Phí phạt do Admin cấu hình, tính theo % trên amount request quy đổi USDV.

Phí phạt Provider:

| Rule | Nội dung |
|---|---|
| PEN-P-01 | Tỷ lệ % phạt do Admin cấu hình. |
| PEN-P-02 | Tính trên amount request quy đổi USDV. |
| PEN-P-03 | Phân bổ giữa Requester và nền tảng theo tỷ lệ Admin cấu hình. |
| PEN-P-04 | Trừ từ số dư khả dụng USDV Provider trước; nếu thiếu thì trừ tiếp từ hold Provider. |
| PEN-P-05 | Sau khi trừ phạt, hold Provider còn lại được release lại cho Provider. |
| PEN-P-06 | Hold Requester được release/hoàn lại toàn bộ nếu không có dispute. |

---

## 8. STATE MACHINE NGHIỆP VỤ v1.6.1

### 8.1. Danh sách trạng thái

| Status | Nhãn hiển thị | Nhóm | Terminal? |
|---|---|---|---:|
| `pending_acceptance` | Chờ Provider phản hồi | Chờ chấp nhận | No |
| `accepted` | Chờ Requester chuyển tiền | Đang xử lý | No |
| `payment_sent` | Chờ Provider xác nhận nhận tiền | Đang xử lý | No |
| `payment_confirmed` | Chờ Provider chuyển tiền cho người thụ hưởng | Đang xử lý | No |
| `transfer_sent` | Chờ Requester xác nhận hoàn tất | Đang xử lý | No |
| `disputed` | Đang khiếu nại/Admin xử lý | Khiếu nại | No |
| `completed` | Hoàn tất | Hoàn tất | Yes |
| `cancelled` | Đã hủy | Đã đóng | Yes |
| `expired` | Hết hạn | Đã đóng | Yes |
| `rejected` | Bị từ chối | Đã đóng | Yes |
| `resolved` | Đã phân xử | Đã đóng | Yes |

### 8.2. Transition chính

| Từ | Hành động | Người thực hiện | Sang | Ghi chú |
|---|---|---|---|---|
| — | Tạo request | Requester | `pending_acceptance` | Kiểm tra USDV Requester trước khi tạo; chưa hold/chưa phí |
| `pending_acceptance` | Hủy trước accept | Requester | `cancelled` | Không mất phí |
| `pending_acceptance` | Từ chối | Provider | `rejected` | Không mất phí |
| `pending_acceptance` | Không phản hồi đúng hạn | System | `expired` | Không mất phí |
| `pending_acceptance` | Accept đủ điều kiện | Provider/System | `accepted` | Hold hai bên + trừ phí hai bên |
| `pending_acceptance` | Accept nhưng một bên thiếu USDV | System | `expired` | Không phí, không hold |
| `accepted` | Requester hủy trước proof | Requester | `cancelled` | Mất phí nền tảng + phí hủy |
| `accepted` | Requester upload payment proof | Requester | `payment_sent` | Proof immutable |
| `accepted` | Quá hạn không proof | System | `cancelled` | Xử lý như Requester hủy sau accept |
| `payment_sent` | Provider xác nhận đã nhận tiền | Provider | `payment_confirmed` | Có thể xác nhận muộn trong cửa 24h theo rule |
| `payment_sent` | Provider mở khiếu nại | Provider | `disputed` | Được mở ngay nếu chưa nhận/thiếu/sai memo/proof không hợp lệ |
| `payment_sent` | Requester mở khiếu nại | Requester | `disputed` | Sau payment proof |
| `payment_sent` | Quá hạn + hết gia hạn + Requester không dispute 24h | System | `cancelled` | Provider bị phạt; Requester hold release |
| `payment_confirmed` | Provider upload transfer proof | Provider | `transfer_sent` | Proof immutable |
| `payment_confirmed` | Requester mở khiếu nại | Requester | `disputed` | Nếu Provider quá hạn/không chi trả |
| `payment_confirmed` | Quá hạn + hết gia hạn + Requester không dispute | System | `cancelled` | Provider bị phạt; release hold theo rule |
| `transfer_sent` | Requester xác nhận hoàn tất | Requester | `completed` | Release hold hai bên |
| `transfer_sent` | Requester khiếu nại | Requester | `disputed` | Nếu người thụ hưởng chưa nhận/thiếu/sai |
| `transfer_sent` | Provider khiếu nại | Provider | `disputed` | Nếu Requester không xác nhận sau thời hạn |
| `transfer_sent` | Sau 24h không ai xử lý | System | `completed` | Auto completed bình thường sau khi đã thông báo |
| `disputed` | Admin phân xử R1-R4 | Admin | `resolved` | Hệ thống tự bút toán theo outcome |

---

## 9. SLA / TIMER NGHIỆP VỤ

### 9.1. Provider phản hồi request

| Rule | Nội dung |
|---|---|
| SLA-01 | Provider có 5–10 phút tùy Admin cấu hình để accept/reject request. |
| SLA-02 | Hết hạn không phản hồi: request `expired`, không phí hai bên. |

### 9.2. Requester upload payment proof sau accept

| Rule | Nội dung |
|---|---|
| SLA-03 | Requester có 20/30 phút hoặc thời hạn do Admin cấu hình để chuyển tiền ngoài hệ thống và upload payment proof. |
| SLA-04 | Hết hạn không upload proof: request `cancelled`, xử lý như Requester hủy sau accept. |

### 9.3. Provider xác nhận đã nhận tiền sau payment proof

| Rule | Nội dung |
|---|---|
| SLA-05 | Provider có thời hạn do Admin cấu hình để xác nhận nhận tiền hoặc mở khiếu nại. |
| SLA-06 | Provider được gia hạn đúng **1 lần**, thêm 15 phút. |
| SLA-07 | Nếu hết hạn + hết gia hạn mà Provider chưa xử lý, hệ thống mở quyền khiếu nại cho Requester. |
| SLA-08 | Trong 24 giờ chờ Requester khiếu nại, Provider vẫn được xác nhận đã nhận tiền. Nếu Provider xác nhận, giao dịch tiếp tục bình thường, không phạt. |
| SLA-09 | Nếu hết 24 giờ mà Requester không khiếu nại và Provider vẫn không xử lý, giao dịch tự `cancelled`; Provider chịu phí/phạt theo cấu hình. |

### 9.4. Provider chuyển tiền cho người thụ hưởng sau khi xác nhận nhận tiền

| Rule | Nội dung |
|---|---|
| SLA-10 | Deadline Provider chuyển tiền cho người thụ hưởng = thời hạn xử lý do Admin/backoffice cấu hình theo rule hệ thống/corridor/method; **không lấy từ SLA do Provider nhập trên deal**. |
| SLA-11 | Provider được gia hạn 1 lần, thời lượng gia hạn giống rule trước và do Admin cấu hình. |
| SLA-12 | Sau khi quá deadline + gia hạn, Requester được mở khiếu nại. |
| SLA-13 | Nếu Requester không khiếu nại trong thời hạn Admin cấu hình, giao dịch tự `cancelled`; Provider bị phạt. |

### 9.5. Requester xác nhận sau transfer proof

| Rule | Nội dung |
|---|---|
| SLA-14 | Sau khi Provider upload transfer proof, Requester có 15 phút hoặc thời hạn do Admin cấu hình để xác nhận hoàn tất hoặc khiếu nại. |
| SLA-15 | Nếu hết thời hạn mà Requester không phản hồi, hệ thống gửi thông báo cho cả 2 bên. |
| SLA-16 | Provider được mở khiếu nại nếu Requester không xác nhận. |
| SLA-17 | Nếu sau 24 giờ vẫn không bên nào xử lý tiếp, hệ thống tự chuyển giao dịch sang `completed`. |
| SLA-18 | Auto completed ở bước này xử lý tài chính như completed bình thường. |

### 9.6. Dispute SLA

| Rule | Nội dung |
|---|---|
| SLA-19 | Admin xử lý dispute trong 48 giờ. |
| SLA-20 | Nếu quá 48 giờ, hệ thống chỉ cảnh báo Admin bằng email + notification; không tự xử lý tài chính. |

---

## 10. DEAL MANAGEMENT

### 10.1. Tạo deal

Provider tạo deal với:

| Nhóm | Trường |
|---|---|
| Corridor | Tiền nhận từ Requester, tiền chi cho người thụ hưởng |
| Tỷ giá | Rate deal |
| Hạn mức | Min/max amount |
| Method | Requester trả Provider qua method nào; Provider chi người nhận qua method nào |
| Ghi chú | Điều kiện/gợi ý nếu có |

**Lưu ý:**

- Provider **không nhập SLA/thời gian cam kết chi trả** khi tạo hoặc sửa deal.
- Provider **không nhập thời hạn hiệu lực/validDays** cho deal.
- Deadline xử lý sau từng trạng thái giao dịch do cấu hình Admin/backoffice quyết định và được hiển thị trong chi tiết request/giao dịch khi phát sinh.
- Trạng thái visibility/expiry của deal do hệ thống quản lý theo trạng thái deal, rule USDV và cấu hình vận hành, không do Provider nhập tay ở form tạo deal.

Khi tạo deal, hệ thống block nếu ví USDV Provider không đủ cover:

```text
max amount của deal quy đổi USDV + phí Provider 0,5%
```

Nếu Provider có nhiều deal active, hệ thống kiểm tra theo **deal có max amount cao nhất**, vì Provider chỉ xử lý 1 request/giao dịch tại một thời điểm.

**Quy tắc UI/logic khi đổi corridor:**

- `fromCurrency` và `toCurrency` không được trùng nhau; nếu trùng, UI tự đổi bên còn lại.
- Khi đổi `fromCurrency`, danh sách method nhận tiền được cập nhật theo currency mới và tự chọn tối đa 2 method đầu tiên còn hợp lệ.
- Khi đổi `toCurrency`, danh sách method chi trả được cập nhật theo currency mới và tự chọn tối đa 2 method đầu tiên còn hợp lệ.
- Nút swap đổi chéo `fromCurrency`/`toCurrency` và reset cả hai danh sách method theo currency mới.
- Deal chỉ hợp lệ để lưu nếu mỗi phía có ít nhất 1 method được chọn.

### 10.2. Deal visibility sau khi tạo

Nếu sau khi tạo deal, ví USDV của Provider giảm xuống dưới mức cover max amount + phí:

- Deal vẫn giữ trạng thái **Đang hoạt động**.
- Khi Requester tìm deal, hệ thống kiểm tra theo amount request cụ thể.
- Nếu ví Provider không đủ cho amount request, deal bị ẩn khỏi kết quả.
- Nếu Provider nạp đủ lại, deal tự hiển thị lại nếu còn active/còn hiệu lực.

### 10.3. Quản lý deal

Màn Quản lý deals gồm 4 nhóm:

| Nhóm | Ý nghĩa |
|---|---|
| Đang hoạt động | Có thể xuất hiện trong kết quả tìm deal nếu đủ điều kiện |
| Tạm dừng | Không xuất hiện trong kết quả tìm deal |
| Hết hạn | Hết thời hạn hiệu lực |
| Đã xóa | Deal đã soft delete, chỉ xem lịch sử, không khôi phục |

Có tìm kiếm và filter theo corridor.

Quy tắc khi deal có request/giao dịch liên quan:

| Tình huống | Provider được làm | Provider không được làm |
|---|---|---|
| Deal hiện tại đang có request chờ phản hồi | Được tạm dừng deal hiện tại để không nhận request mới; được tạo deal mới; được sửa/tạm dừng/xóa các deal khác không liên quan nếu đủ điều kiện | Không được sửa hoặc xóa deal hiện tại vì đã có request yêu cầu |
| Deal hiện tại đang có giao dịch đang diễn ra sau khi Provider accept | Được tạm dừng deal hiện tại; được tạo deal mới; được sửa/tạm dừng/xóa các deal khác không liên quan nếu đủ điều kiện | Không được sửa hoặc xóa deal hiện tại cho đến khi giao dịch đóng |
| Provider có request chờ phản hồi hoặc giao dịch đang diễn ra | Các deal của Provider bị ẩn khỏi kết quả tìm deal theo rule visibility | Không phát sinh thêm request mới từ marketplace trong thời gian này |

### 10.4. Tạm dừng deal

Provider có thể tạm dừng deal. Khi tạm dừng:

- Deal ẩn khỏi kết quả tìm deal ngay.
- Các request/giao dịch đã tạo từ deal đó vẫn tiếp tục bình thường.

Nếu deal đang có request/giao dịch liên quan:

- Provider được tạm dừng để không nhận request mới.
- Provider không được sửa deal.
- Provider không được xóa deal.

### 10.5. Sửa deal và version

Provider được sửa deal nếu deal không có request/giao dịch đang diễn ra liên quan.

Khi sửa:

- Tạo version mới.
- Request đã tạo trước đó giữ snapshot version cũ.
- Không ảnh hưởng request/giao dịch đang tồn tại.

### 10.6. Xóa deal

Deal đã xóa mềm:

- Không khôi phục/kích hoạt lại.
- Chỉ để xem lịch sử.
- Muốn dùng lại thì tạo/đăng lại deal mới.

---

## 11. LỊCH SỬ VÀ DANH SÁCH

### 11.1. Lịch sử yêu cầu — vai Requester

Màn **Lịch sử yêu cầu** hiển thị các request do Member tạo.

Filter trạng thái:

```text
Chờ chấp nhận / Đang xử lý / Hoàn tất / Đã hủy / Hết hạn / Đã phân xử
```

Card tối thiểu hiển thị:

| Thông tin | Ghi chú |
|---|---|
| Mã request | Ví dụ RQ-xxxxx |
| Trạng thái | Badge trạng thái |
| Provider | Tên theo rule mask/full |
| Số tiền gửi/nhận | Theo snapshot request |
| Thời gian còn lại nếu có | Chỉ hiển thị nếu status đang có SLA |
| Lý do ngắn | Với lịch sử đóng, hiển thị trạng thái + lý do ngắn, ví dụ “Hết hạn do Provider không phản hồi”, “Đã hủy bởi Requester” |
| CTA | Xem chi tiết |

Sắp xếp mặc định:

```text
Ưu tiên giao dịch đang xử lý/cần xử lý trước, sau đó mới nhất.
```

Tìm kiếm theo mã request: **không bắt buộc trong MVP**.

### 11.2. Lịch sử nhận yêu cầu — vai Provider

Màn **Lịch sử nhận yêu cầu** hiển thị tất cả request từng gửi tới Provider, bao gồm:

- Chờ phản hồi.
- Đã từ chối.
- Hết hạn.
- Đã hủy.
- Đang xử lý.
- Hoàn tất.
- Đã phân xử.

Filter trạng thái:

```text
Chờ phản hồi / Đang xử lý / Hoàn tất / Đã hủy / Hết hạn / Đã phân xử
```

Card tối thiểu hiển thị:

| Thông tin | Ghi chú |
|---|---|
| Mã request | Ví dụ RQ-xxxxx |
| Trạng thái | Badge trạng thái |
| Requester | Tên theo rule mask/full |
| Số tiền gửi/nhận | Theo snapshot request |
| Thời gian còn lại | Nếu đang cần phản hồi/xử lý |
| CTA | Xem chi tiết |

Với Provider history, lý do đóng chỉ cần hiển thị khi vào chi tiết request, không bắt buộc hiện ngay trên card.

Tìm kiếm theo mã request: **không bắt buộc trong MVP**.

### 11.3. Chi tiết request đã đóng

Với user thường:

- Chỉ xem trạng thái/kết quả cuối.
- Hiển thị lý do ngắn nếu trạng thái là **Đã hủy** hoặc **Hết hạn**.
- Không hiển thị timeline đầy đủ.

Với Admin:

- Xem timeline đầy đủ.
- Xem proof, ghi chú, chat dispute, trạng thái, quyết định tài chính.

### 11.4. Chi tiết request đang xử lý

Với user thường:

- Không hiển thị timeline chữ/rút gọn.
- Chỉ cần hiển thị trạng thái hiện tại, bên đang cần hành động, thông tin giao dịch chính và CTA tương ứng.
- Các bước/proof chỉ hiển thị theo ngữ cảnh hiện tại của giao dịch.

Với Admin:

- Có thể xem timeline đầy đủ trong màn vận hành/phân xử.

---

## 12. PAYMENT, PROOF VÀ MEMO

### 12.1. Sau khi Provider accept

Sau khi Provider accept thành công, Requester sẽ chuyển tiền ngoài hệ thống theo method đã chọn lúc tạo yêu cầu.

Màn hướng dẫn thanh toán hiển thị:

| Nội dung | Ghi chú |
|---|---|
| Số tiền cần chuyển ngoài hệ thống | Amount request theo currency gửi |
| Method | Method Requester đã chọn |
| Tài khoản Provider | Hiển thị đầy đủ theo context thanh toán |
| Memo | Mã đối soát bắt buộc |
| Copy all | Copy thông tin cần chuyển |
| Cảnh báo | Nhắc nhập đúng memo và đúng tài khoản |

### 12.2. Payment proof

Requester upload payment proof sau khi chuyển tiền ngoài hệ thống.

Proof gồm:

- File hoặc ghi chú.
- Mã tham chiếu nếu có.
- Timestamp.
- Uploader.

Sau khi upload:

- Proof cũ giữ nguyên, không sửa/xóa.
- Provider có thể xác nhận nhận tiền hoặc mở khiếu nại ngay nếu không nhận/nhận thiếu/sai memo/proof không hợp lệ.

### 12.3. Transfer proof

Sau khi Provider xác nhận đã nhận tiền, Provider chuyển tiền ngoài hệ thống cho người thụ hưởng theo method Requester đã chọn và upload transfer proof.

Sau transfer proof:

- Requester kiểm tra người thụ hưởng đã nhận đủ.
- Requester xác nhận completed hoặc mở khiếu nại.
- Nếu không phản hồi theo rule, hệ thống thông báo và có thể auto completed sau 24 giờ.

---

## 13. CHAT VÀ HIỂN THỊ THÔNG TIN ĐỐI TÁC

### 13.1. Chat trong giao dịch

| Rule | Nội dung |
|---|---|
| CHAT-01 | Chat chỉ mở sau khi Provider accept thành công. |
| CHAT-02 | Chat chỉ cho nhắn khi giao dịch đang xử lý. |
| CHAT-03 | Sau khi giao dịch kết thúc, user không nhắn tiếp. |
| CHAT-04 | Admin chỉ cần xem chat khi giao dịch có dispute. |
| CHAT-05 | Giao dịch completed bình thường thì Admin không cần xem chat. |
| CHAT-06 | Không cần audit log riêng cho việc Admin xem chat. |

### 13.2. Hiển thị tên và thông tin liên hệ

| Đối tượng | Trước accept | Sau accept |
|---|---|---|
| Cá nhân/KYC | Tên mask một phần | Tên đầy đủ theo KYC |
| Doanh nghiệp/KYB | Tên doanh nghiệp mask một phần | Tên doanh nghiệp đầy đủ |
| SĐT/email liên hệ | Không hiển thị | Không hiển thị; chỉ chat trong giao dịch |
| Thông tin thanh toán | Chỉ khi đến bước cần hành động | Hiển thị đầy đủ theo ngữ cảnh thanh toán/chi trả |

---

## 14. DISPUTE VÀ ADMIN OUTCOME

### 14.1. Mở dispute

Requester/Provider có thể mở dispute theo trạng thái và quyền tương ứng.

Khi mở dispute:

- Request chuyển `disputed` ngay.
- Các hành động giao dịch chính bị khóa.
- Hai bên được bổ sung proof/ghi chú mới.
- Proof cũ giữ nguyên, không sửa/xóa.
- Admin xử lý trong SLA 48 giờ.

### 14.2. Admin visibility và notification

| Rule | Nội dung |
|---|---|
| ADM-01 | Chỉ Admin phân xử được xem hồ sơ dispute trong MVP. |
| ADM-02 | Admin xử lý trong 48 giờ. |
| ADM-03 | Quá 48 giờ chỉ cảnh báo Admin bằng email + notification, không tự xử lý tiền/giao dịch. |
| ADM-04 | Khi phân xử xong, notification gửi hai bên chỉ hiển thị kết quả tóm tắt. |
| ADM-05 | Trong chi tiết giao dịch sau phân xử, user xem đầy đủ kết quả tài chính: USDV được hoàn/bồi hoàn/bị phạt/release hold và ghi chú Admin. |

### 14.3. Admin outcome v1.6.1

v1.6.1 giữ 4 outcome Admin:

| Outcome | Ý nghĩa | Xử lý chính |
|---|---|---|
| R1 | Admin xác nhận giao dịch hoàn tất | Xử lý như completed bình thường; release hold hai bên; không hoàn phí nền tảng; không thêm phí/phạt |
| R2 | Requester thắng / được hoàn tiền hoặc bồi hoàn | Release hold Requester + bồi hoàn từ Provider theo amount request quy đổi USDV; hệ thống tự tính và tự bút toán |
| R3 | Provider thắng / Requester chưa thanh toán hoặc proof không hợp lệ | Release hold Provider; release hold Requester sau khi trừ phí/phạt nếu có; phí nền tảng đã trừ không hoàn |
| R4 | Hủy trung lập do lỗi khách quan hoặc hai bên đồng thuận | Release toàn bộ hold hai bên; không hoàn phí nền tảng; không thêm phí/phạt |

### 14.4. Phí phạt trong dispute

Khi Admin phân xử bên sai và áp dụng phí phạt:

| Rule | Nội dung |
|---|---|
| DSP-PEN-01 | Phạt theo % số tiền request quy đổi USDV. |
| DSP-PEN-02 | Tỷ lệ do Admin cấu hình. |
| DSP-PEN-03 | Phân bổ khoản phạt giữa bên còn lại và nền tảng theo tỷ lệ Admin cấu hình. |
| DSP-PEN-04 | Hệ thống tự thực hiện bút toán theo outcome, Admin không nhập tay số tiền. |

---

## 15. RATING / ĐÁNH GIÁ

### 15.1. Khi nào được đánh giá

| Rule | Nội dung |
|---|---|
| REV-01 | Giao dịch đã completed thì được đánh giá. |
| REV-02 | Completed bình thường và auto completed sau 24h đều được đánh giá. |
| REV-03 | Giao dịch resolved bởi Admin R1 không phát sinh quyền đánh giá. |
| REV-04 | Đánh giá là tùy chọn, không chặn tạo giao dịch mới. |
| REV-05 | Không giới hạn thời gian đánh giá; nếu chưa đánh giá, user có thể vào chi tiết giao dịch để đánh giá sau. |

### 15.2. Nội dung đánh giá

Đánh giá gồm 3 phần:

1. Số sao 1–5 — bắt buộc.
2. Tag nhanh tích cực — tùy chọn.
3. Nhận xét văn bản — tùy chọn.

Bộ tag cố định:

- Nhanh.
- Đúng cam kết.
- Giao tiếp tốt.
- Proof rõ ràng.
- Thao tác chuyên nghiệp.

### 15.3. Rule đánh giá

| Rule | Nội dung |
|---|---|
| REV-06 | Hai bên được đánh giá lẫn nhau. |
| REV-07 | Đánh giá đã gửi không được sửa. |
| REV-08 | Đánh giá đã gửi không được xóa. |
| REV-09 | Rating trên hồ sơ Member tính chung, không tách vai Requester/Provider. |
| REV-10 | Rating tính trung bình toàn bộ đánh giá từ trước đến nay. |
| REV-11 | Với tài khoản doanh nghiệp/KYB, rating gắn với hồ sơ doanh nghiệp, không gắn người vận hành. |
| REV-12 | Hồ sơ chỉ hiển thị sao trung bình + số lượt đánh giá. |
| REV-13 | Màn chi tiết đánh giá hiển thị toàn bộ đánh giá, nhưng tên người đánh giá bị mask một phần, ví dụ Nguyễn V*** A. |
| REV-14 | Đánh giá không hiển thị trong chi tiết giao dịch; chi tiết giao dịch chỉ có CTA đánh giá nếu user chưa đánh giá. |

---

## 16. NOTIFICATION

### 16.1. Nguyên tắc notification

Notification P2P của Member dùng **in-app notification trong Notification Center chung của VLinkPay**. Không yêu cầu push/email cho Member trong v1.6.1.

Notification quan trọng deep-link trực tiếp vào chi tiết giao dịch P2P.

### 16.2. Sự kiện cần notification

| Event | Người nhận | Deep-link |
|---|---|---|
| Request tạo mới | Provider | Chi tiết request nhận được |
| Provider accept | Requester | Chi tiết giao dịch / hướng dẫn thanh toán |
| Provider reject | Requester | Chi tiết request |
| Request expired/cancelled | Bên liên quan | Chi tiết request |
| Payment proof uploaded | Provider | Chi tiết giao dịch |
| Provider xác nhận nhận tiền | Requester | Chi tiết giao dịch |
| Transfer proof uploaded | Requester | Chi tiết giao dịch |
| Quá hạn/nhắc xử lý | Actor đang cầm lượt | Chi tiết giao dịch |
| Dispute opened/resolved | Hai bên | Chi tiết giao dịch |
| Completed | Hai bên | Chi tiết giao dịch |

---

## 17. ADMIN CONFIG TRONG BACKOFFICE HIỆN HỮU

P2P không xây Admin Portal riêng trong scope v1.6.1. Các cấu hình P2P nằm trong Admin Portal/backoffice hiện hữu của hệ sinh thái VLinkPay.

### 17.1. Nhóm cấu hình MVP

| Nhóm | Nội dung |
|---|---|
| Phí nền tảng | Mặc định 0,5% mỗi bên |
| Phí hủy Requester | Tỷ lệ %, mặc định có thể là 1% |
| Phí phạt Provider | Tỷ lệ % |
| Phí phạt Requester | Tỷ lệ % |
| Phân bổ phí/phạt | Tỷ lệ Provider/Requester nhận và nền tảng giữ lại |
| SLA/timer | Provider phản hồi, Requester upload proof, Provider xác nhận, Provider chuyển tiền cho người thụ hưởng, Requester xác nhận, dispute 48h; toàn bộ timer do Admin/backoffice cấu hình, không do Provider nhập trên deal |
| Currency/method | Method được hỗ trợ theo currency; một currency có thể có nhiều method, ví dụ USD: Zelle, Venmo, Apple Cash, PayPal, Bank Transfer |
| Tỷ giá USDV snapshot | Chính sách/tỷ giá quy đổi theo corridor |
| Hạn mức min/max | Theo cấu hình hệ thống hoặc corridor |

Corridor đã có sẵn ở hệ thống khác, P2P chỉ dùng lại và không tạo module corridor mới.

---

## 18. BUSINESS RULES TỔNG HỢP v1.6.1

| ID | Rule |
|---|---|
| BR-161-001 | P2P Remit Deal là tính năng trong VLinkPay, truy cập qua Exchange Hub. |
| BR-161-002 | Chỉ user đã KYC/KYB hợp lệ mới vào được P2P. |
| BR-161-003 | Cá nhân và doanh nghiệp đều có thể giữ vai Requester, Provider hoặc dual-role. |
| BR-161-004 | Không cần duyệt Provider riêng nếu KYC/KYB hợp lệ. |
| BR-161-005 | Một tài khoản chỉ được có 1 giao dịch đang diễn ra tại một thời điểm, giao dịch đang diễn ra tính từ Provider accept thành công. |
| BR-161-006 | Một Requester chỉ có 1 request chờ chấp nhận tại một thời điểm. |
| BR-161-007 | Một Provider chỉ có 1 request chờ phản hồi tại một thời điểm. |
| BR-161-008 | Deal của Provider bị ẩn khi Provider có request chờ phản hồi hoặc giao dịch đang diễn ra. |
| BR-161-009 | Deal của Provider hiển thị lại khi request/giao dịch đóng nếu deal vẫn active/còn hiệu lực/đủ điều kiện. |
| BR-161-010 | Self-trading cùng tài khoản VLinkPay bị chặn. |
| BR-161-011 | Requester tạo request phải đủ USDV = amount quy đổi + phí 0,5%; thiếu thì popup và không tạo request. |
| BR-161-012 | Provider tạo deal bị block nếu USDV không đủ cover max amount deal + phí Provider. |
| BR-161-013 | Nếu có nhiều deal active, kiểm tra theo deal có max amount cao nhất. |
| BR-161-014 | Deal phù hợp nhưng Provider không đủ USDV cho amount request thì bị ẩn khỏi kết quả tìm deal. |
| BR-161-015 | Khi Provider accept, hệ thống kiểm tra lại USDV cả hai bên. |
| BR-161-016 | Accept thành công thì hold 100% amount quy đổi USDV cho mỗi bên và trừ phí 0,5% mỗi bên. |
| BR-161-017 | Nếu một bên thiếu USDV tại accept, request hết hạn, không phí, không hold. |
| BR-161-018 | Provider không được hủy sau accept. |
| BR-161-019 | Requester được hủy sau accept chỉ khi chưa upload payment proof. |
| BR-161-020 | Requester hủy sau accept chịu phí nền tảng đã trừ + phí hủy cấu hình; không được khiếu nại case này. |
| BR-161-021 | Dòng tiền chính chuyển ngoài hệ thống; USDV hold chỉ bảo vệ/ràng buộc nghiệp vụ. |
| BR-161-022 | Proof đã upload không sửa/xóa; chỉ được bổ sung proof/ghi chú trong dispute. |
| BR-161-023 | Chat mở sau accept, chỉ nhắn khi đang xử lý. |
| BR-161-024 | Admin chỉ xem chat khi dispute. |
| BR-161-025 | Đánh giá tùy chọn, hai bên, không giới hạn thời gian, không sửa/xóa. |
| BR-161-026 | Rating hiển thị chung trên hồ sơ Member, gồm sao trung bình và số lượt đánh giá. |
| BR-161-027 | Người nhận và tài khoản Provider là dữ liệu riêng trong P2P. |
| BR-161-028 | Mỗi currency có thể có nhiều hình thức nhận tiền Provider; mỗi currency/method chỉ có tối đa 1 tài khoản nhận tiền Provider active trong MVP. |
| BR-161-029 | Tên cá nhân/doanh nghiệp mask trước accept, full sau accept. |
| BR-161-030 | Không hiển thị số điện thoại/email liên hệ trực tiếp; chỉ dùng chat và thông tin thanh toán theo ngữ cảnh. |
| BR-161-031 | Menu Tài khoản nhận có 2 tab con: **Người thụ hưởng** và **Tài khoản nhận tiền Provider**. |
| BR-161-032 | Khi Requester đang có 1 request chờ Provider chấp nhận, CTA Gửi yêu cầu bị block và deep-link về request đang chờ. |
| BR-161-033 | Deal đang có request chờ phản hồi hoặc giao dịch đang diễn ra không được sửa/xóa; Provider vẫn được tạo deal mới và sửa các deal khác không liên quan nếu đủ điều kiện. |
| BR-161-034 | Tìm kiếm theo mã request trong lịch sử không bắt buộc trong MVP. |
| BR-161-035 | User thường không xem timeline rút gọn trong chi tiết request đang xử lý; chỉ xem trạng thái hiện tại và CTA. Timeline đầy đủ dành cho Admin. |
| BR-161-036 | Provider không nhập SLA/thời gian xử lý khi tạo/sửa deal; deadline giao dịch lấy từ cấu hình Admin/backoffice và chỉ hiển thị theo từng request/giao dịch. |
| BR-161-037 | Thuật ngữ hiển thị trong tài liệu và UI dùng **giao dịch đang diễn ra** thay cho các thuật ngữ cũ. |
| BR-161-038 | Provider không nhập thời hạn hiệu lực/validDays khi tạo/sửa deal; hệ thống quản lý expiry/visibility theo trạng thái và cấu hình vận hành. |
| BR-161-039 | Khi đổi `fromCurrency`, danh sách method nhận tiền cập nhật theo currency và auto-select tối đa 2 method đầu tiên hợp lệ. |
| BR-161-040 | Khi đổi `toCurrency`, danh sách method chi trả cập nhật theo currency và auto-select tối đa 2 method đầu tiên hợp lệ. |
| BR-161-041 | `fromCurrency` và `toCurrency` không được trùng nhau; nếu người dùng chọn trùng, UI tự đổi bên còn lại. |
| BR-161-042 | Deal chỉ được lưu nếu mỗi phía có ít nhất 1 method được chọn; nếu không đủ method, form tạo deal báo lỗi. |
| BR-161-043 | Requester chỉ được chọn currency nhận nằm trong corridor hỗ trợ; nếu currency nhận hiện tại không hợp lệ sau khi đổi currency gửi, UI tự chuyển sang currency hợp lệ đầu tiên. |
| BR-161-044 | Method nhận quyết định các field người thụ hưởng cần nhập; nếu Requester đổi method sau khi đã chọn beneficiary preset, form phải reset phần dữ liệu người thụ hưởng để tránh sai ngữ cảnh. |
| BR-161-045 | Beneficiary preset là dữ liệu P2P riêng theo user/method/currency, có thể chọn nhanh trong form và được lưu trong draft request hiện tại. |

---

## 19. MÀN HÌNH NGHIỆP VỤ v1.6.1

### 19.1. Overview

Mục tiêu: cho Member biết có việc gì đang cần xử lý và cung cấp CTA chính.

Nội dung:

```text
[Đang xử lý / cần xử lý]
- Request đang chờ bạn thanh toán
- Request đang chờ bạn phản hồi
- Giao dịch quá hạn cần xử lý

[CTA]
- Tạo deal
- Gửi yêu cầu
```

Không hiển thị:

- Marketplace.
- Lịch sử gần đây.
- Số dư USDV.

### 19.2. Gửi yêu cầu

Luồng gồm:

1. Nhập nhu cầu.
2. Chọn người thụ hưởng hoặc thêm nhanh.
3. Kiểm tra USDV Requester.
4. Tìm deal phù hợp.
5. Chọn deal.
6. Xác nhận gửi request.

Ghi chú UI prototype:

- Màn nhập nhu cầu trong prototype HTML triển khai trực tiếp các section: amount, payment method, beneficiary, note, USDV check.
- Khi người dùng quay lại màn nhập nhu cầu từ các bước sau, draft nhập trước đó được giữ lại trong cùng phiên.
- Currency nhận chỉ được phép nằm trong corridor đang hỗ trợ; nếu currency nhận hiện tại không còn hợp lệ sau khi đổi currency gửi, UI tự chuyển sang currency hợp lệ đầu tiên.
- Method nhận và các field người thụ hưởng là động theo method; beneficiary preset là dữ liệu riêng trong P2P và phải khớp ngữ cảnh method/currency hiện tại.
- Nếu người dùng đổi method sau khi đã chọn beneficiary preset, form phải reset phần dữ liệu người thụ hưởng để tránh sai ngữ cảnh.

### 19.3. Quản lý deals

Nội dung:

- Tab/filter: Đang hoạt động, Tạm dừng, Hết hạn, Đã xóa.
- Tìm kiếm/filter corridor.
- Card deal: corridor, rate, min/max, method, trạng thái. Không hiển thị SLA do Provider nhập vì deal không có field SLA.
- Nếu deal active nhưng tạm thời không xuất hiện trong kết quả tìm deal, cảnh báo chỉ hiển thị khi Provider mở chi tiết deal.
- Action: Tạo deal, Tạm dừng/Kích hoạt lại, Sửa, Xóa mềm.

### 19.4. Lịch sử yêu cầu

Danh sách request do Member tạo ở vai Requester.

Filter: Chờ chấp nhận / Đang xử lý / Hoàn tất / Đã hủy / Hết hạn / Đã phân xử.

### 19.5. Lịch sử nhận yêu cầu

Danh sách request từng gửi tới Member ở vai Provider.

Filter: Chờ phản hồi / Đang xử lý / Hoàn tất / Đã hủy / Hết hạn / Đã phân xử.

### 19.6. Tài khoản nhận

Gồm 2 tab con trong một màn:

1. **Người thụ hưởng** — dùng khi Member là Requester.
2. **Tài khoản nhận tiền Provider** — dùng khi Member là Provider.

### 19.7. Chi tiết request / giao dịch

Với user thường:

- Request đang xử lý: chỉ hiển thị status hiện tại, thông tin giao dịch chính, bên đang cầm lượt nếu có và CTA tương ứng; không cần timeline chữ.
- Request đã đóng: chỉ hiển thị kết quả cuối; với **Đã hủy** và **Hết hạn** thì hiển thị thêm lý do ngắn.

Với Admin:

- Được xem timeline đầy đủ, status history, proof, ghi chú, chat dispute và quyết định tài chính trong màn vận hành/phân xử.

---

## 20. QUYẾT ĐỊNH BỔ SUNG ĐÃ CHỐT SAU RÀ SOÁT CUỐI

| Nhóm | Quyết định |
|---|---|
| Menu Tài khoản nhận | Tab con dùng nhãn **Người thụ hưởng** và **Tài khoản nhận tiền Provider**. |
| CTA Gửi yêu cầu | Nếu Member đang có request chờ Provider chấp nhận, không cho tạo request mới; deep-link về request đang chờ. |
| Deal có request liên quan | Deal hiện tại không được sửa/xóa khi đã có request yêu cầu hoặc giao dịch liên quan. Provider vẫn được tạo deal mới và sửa các deal khác không liên quan. |
| Tìm kiếm lịch sử | Không bắt buộc tìm theo mã request trong MVP. |
| Chi tiết request | User không cần timeline rút gọn; chỉ thấy trạng thái hiện tại/kết quả cuối. Timeline đầy đủ dành cho Admin. |
| Tài khoản nhận Provider | Với mỗi currency có thể có nhiều hình thức nhận tiền như Zelle, Venmo, Apple Cash, PayPal, Bank Transfer; mỗi currency/method tối đa 1 tài khoản đang hoạt động trong MVP. |
| Thuật ngữ | Chuẩn hóa thuật ngữ thành **giao dịch đang diễn ra** trong tài liệu và UI. |
| Version tài liệu | Đổi version tài liệu thành **v1.6.1**. |

---

## 21. OPEN POINTS CẦN PRODUCT/OPS XÁC NHẬN SAU v1.6.1

Các điểm dưới đây không chặn BA v1.6.1 nhưng cần chốt khi bước vào backlog triển khai:

| ID | Open point | Gợi ý owner |
|---|---|---|
| OP-01 | Giá trị cụ thể của các SLA/timer trong Admin config | Product/Ops |
| OP-02 | Tỷ lệ phí hủy mặc định và tỷ lệ phân bổ Provider/nền tảng | Product/Finance |
| OP-03 | Tỷ lệ phạt Provider/Requester và tỷ lệ phân bổ | Product/Finance/Ops |
| OP-04 | Chính sách tỷ giá USDV snapshot theo corridor | Finance/Ops |
| OP-05 | Danh sách currency/method MVP | Product/Ops |
| OP-06 | Nội dung microcopy chính xác cho modal hủy, accept, completed, dispute | Product/UX |
| OP-07 | Quy định lưu trữ proof/chat/transaction history | Legal/Ops |

---

## 22. KẾT LUẬN BA

v1.6.1 đã điều chỉnh P2P Remit Deal thành một tính năng đúng ngữ cảnh trong VLinkPay, dùng Exchange Hub làm entry point và dùng KYC/KYB/Ví USDV của hệ sinh thái làm nền tảng niềm tin. Điểm khác biệt quan trọng nhất so với các bản trước là mô hình hold USDV **hai phía** tại thời điểm Provider accept, phí nền tảng trừ ngay khi hai bên kết nối, và rule xử lý rõ cho các trường hợp hủy/quá hạn.

Bản v1.6.1 tập trung vào nghiệp vụ và đủ để Product bóc scope, Dev hiểu rule cần triển khai, QC xây test theo luồng, Ops cấu hình vận hành trong Admin Portal hiện hữu.
