# Deal Bootstrap HTML v4.9 Case 8 Deal Info

Bộ HTML prototype dùng Bootstrap cho module Create Deal / Search Deal.

## Screens
- `overview.html`
- `search-deal.html`
- `create-deal.html`
- `manage-deals.html`
- `beneficiary-accounts.html`
- `history.html`
- `transaction-detail.html`

## Shared files
- `assets/css/app.css`
- `assets/js/mock-data.js`
- `assets/js/common.js`

Tab navigation được render chung trong `common.js`.


## v1.2 updates
- Chuyển giao diện sang desktop responsive, max-width 1180px.
- Chuyển nav fixed-bottom thành tab navigation ở đầu module.
- Bổ sung shared modal Thêm/Sửa tài khoản nhận.
- Modal render dynamic fields theo `paymentMethodMatrix`.
- Các nút Thêm tài khoản / Chọn tài khoản / Edit account dùng chung modal.


## v1.3 updates
- Bổ sung shared upload control.
- Upload control có 2 action: Take Photo và Choose File.
- Có preview card, remove file, View file.
- Dùng cho Transaction Detail proof upload.
- Config bằng data attributes:
  - `data-upload-control`
  - `data-upload-id`
  - `data-max-files`
  - `data-max-size-mb`
  - `data-label`


## v1.4 updates
- Bổ sung modal "Xác nhận đã gửi tiền".
- Modal có upload proof bắt buộc, nút Chụp ảnh / Chọn file.
- Có ghi chú/mô tả giao dịch.
- Nút "Xác nhận gửi" disabled cho tới khi có file proof.
- Button "Tôi đã gửi tiền" trong Transaction Detail mở modal dùng chung.
- Upload control hỗ trợ label tiếng Việt qua data attributes.


## v1.5 updates
- Tách Transaction Detail thành nhiều case HTML riêng.
- User chỉ upload bằng chứng cho khoản tiền mình gửi.
- Bằng chứng bên Tran *** B gửi là view-only.
- Nếu bên Tran *** B đã upload proof, bên mình sẽ có nút `Xác nhận đã nhận tiền`.
- Các case mới:
  - `transaction-detail-case-01-my-upload.html`
  - `transaction-detail-case-02-counterparty-proof.html`
  - `transaction-detail-case-03-my-proof.html`
  - `transaction-detail-case-04-both-proof.html`
  - `transaction-detail-case-05-completed.html`


## v1.6 updates
- Chỉnh lại logic transaction detail theo business case mới:
  - Case 01: Chờ bên Tran *** B chấp nhận sau khi mình tìm deal và chọn deal.
  - Case 02: Hai bên đã chấp nhận, mình upload bằng chứng chuyển tiền.
  - Case 03: Bên Tran *** B đã upload bằng chứng, mình chưa upload proof; có nút xác nhận đã nhận tiền và upload proof.
  - Case 04: Hoàn tất; có button đánh giá.
  - Case 05: Khiếu nại; có button rút khiếu nại.
- Giữ rule: mình chỉ upload bằng chứng cho khoản mình gửi; proof bên Tran *** B là view-only.


## v1.7 updates
- Bổ sung icon thanh toán thật vào `assets/images`.
- Cập nhật `paymentMethodMatrix` icon path sang `assets/images/...`.
- Sửa `promt-pay.png` thành `prompt-pay.png`.
- Chips, method tags và account cards render icon theo `paymentMethodMatrix`.


## v1.8 updates
- Form Tìm Deal mặc định chỉ hiển thị form và empty state.
- Danh sách deal phù hợp chỉ xuất hiện sau khi user bấm button `Tìm Deal Phù Hợp`.
- Thêm loading state mock trước khi render kết quả.


## v2.1 updates
- Tách màn `Deal phù hợp` ra riêng: `deal-results.html`.
- Màn `search-deal.html` chỉ còn form tìm deal, không render danh sách kết quả.
- Modal Thêm/Sửa tài khoản nhận đã xoá:
  - `Đặt làm tài khoản mặc định`
  - `Đang hoạt động`
- Cập nhật Transaction Detail thành 8 case:
  - Case 00: Chờ bên mình chấp nhận, có action Từ chối / Chấp nhận, click Chấp nhận mở modal confirm.
  - Case 01: Chờ bên Tran *** B chấp nhận sau khi mình chọn deal.
  - Case 02: Đã chấp nhận, upload bằng chứng chuyển tiền.
  - Case 03: Bên Tran *** B upload proof, mình chưa upload; có xác nhận đã nhận tiền + upload proof.
  - Case 04: Mình upload proof, bên Tran *** B chưa upload; có khiếu nại.
  - Case 05: Hai bên upload proof; có xác nhận đã nhận đủ tiền + khiếu nại.
  - Case 06: Hoàn tất; có đánh giá.
  - Case 07: Khiếu nại; có rút khiếu nại.


## v2.2 updates
- Kết quả tìm deal có một button quay lại form tìm ở cấp page/side panel; card kết quả chỉ còn action `Chọn deal`.
- Case 07: Bên mình khiếu nại, có button `Rút khiếu nại`.
- Case 08: Bên Tran *** B chờ bên mình chấp nhận, có action `Từ chối` và `Chấp nhận`; click `Chấp nhận` mở modal confirm.
- Case 09: Bên Tran *** B khiếu nại, bên mình có button `Giải thích về khiếu nại`.
- Button `Khiếu nại` mở modal khiếu nại:
  - upload hình ảnh / video / audio
  - nhiều file, tối đa 6 file
  - ghi chú
- Button `Giải thích về khiếu nại` mở modal giải thích:
  - upload hình ảnh / video / audio
  - nhiều file, tối đa 6 file
  - ghi chú


## v2.7 updates
- Rebuild từ v2.2 để phục hồi đầy đủ 9 case chi tiết giao dịch và các modal khiếu nại/giải thích.
- Case 01 có countdown 15 phút chờ bên Tran *** B chấp nhận hoặc huỷ.
- Case 02 có countdown 1 giờ cho hai bên upload bằng chứng chuyển tiền.
- Thêm lại `deal-detail.html`.
- Deal nổi bật / Kết quả tìm deal đi qua màn chi tiết deal trước khi chọn deal.
- Overview: Giao dịch đang xử lý và Lịch sử gần đây đều có `View detail`.
- Lịch sử giao dịch: chip có count và filter đúng data.
- Quản lý deal: mỗi chip có count và click chip sẽ filter data.


## v2.8 updates
- Danh sách giao dịch đã đưa button `View detail` lên cùng hàng với các `method-tag`.
- Áp dụng cho:
  - `Giao dịch đang xử lý` trong Overview
  - `Lịch sử gần đây` trong Overview
  - Danh sách giao dịch trong `history.html`
- Thêm class dùng chung:
  - `.txn-method-action-row`
  - `.txn-method-tags`


## v2.9 updates
- `tabs-wrap` trên desktop/tablet vẫn là tab navigation phía trên.
- Với mobile nhỏ `< 768px`, `tabs-wrap` chuyển thành navbar bottom fixed.
- Có padding bottom cho `.app-shell` để nội dung không bị che.
- Có hỗ trợ `safe-area-inset-bottom` cho iPhone.


## v3.0 updates
- Khi giao dịch chưa accept, hai bên không thấy tài khoản nhận của nhau.
- Thông tin đối tác hiển thị bằng tên mask: `Tran *** B` thay vì text chung `bên Tran *** B`.
- `deal-detail.html`: click `Chọn deal này` mở màn mới `select-deal.html`.
- Tạo màn mới `select-deal.html` tên `Chọn deal`.
- `select-deal.html` giống form tìm deal nhưng:
  - lock `form-select currency-select`;
  - chỉ enable payment methods có trong deal;
  - phía trên có thông tin tổng quát của deal;
  - button chính đổi thành `Xác nhận tạo deal`;
  - click `Xác nhận tạo deal` mở modal confirm.
- Sau confirm chuyển sang `Case 01: Chờ Tran *** B chấp nhận`.


## v3.1 updates
- `deal-detail.html`: ẩn `deal-detail-code`.
- `deal-detail.html`: không hiển thị section `Tài khoản người thụ hưởng của bên Tran *** B`.
- `select-deal.html`: ẩn `deal-detail-code` trong summary panel.
- Giữ rule: khi giao dịch chưa accept, hai bên không thấy tài khoản nhận của nhau.


## v3.2 updates
- `deal-detail.html`: button `Chọn deal này` chuyển trực tiếp sang `select-deal.html`.
- Xoá modal confirm cũ khỏi `deal-detail.html`; confirm sẽ nằm ở màn `select-deal.html`.


## v3.3 updates
- `select-deal.html`: khung `Thông tin tổng quát của deal` được làm gọn hơn.
- Summary hiển thị các thông tin cơ bản:
  - người tạo deal dạng mask tên;
  - tỷ giá;
  - giới hạn;
  - hình thức nhận USD của người tạo deal;
  - hình thức gửi VND của người tạo deal.
- Payment method trong summary dùng `method-tag` để đồng bộ UI.


## v3.4 updates
- `select-deal.html`: khung `Thông tin tổng quát của deal` chỉ giữ các field thuộc schema deal hiện tại.


## v3.5 updates
- `select-deal.html`: tối ưu lại khung `Thông tin tổng quát của deal` theo dạng slim compact.
- Summary deal chỉ giữ dữ liệu tỷ giá, giới hạn và phương thức thanh toán.
- Summary chỉ giữ thông tin cốt lõi:
  - người tạo deal mask tên;
  - tỷ giá;
  - giới hạn;
  - hình thức nhận USD;
  - hình thức gửi VND.
- Giảm padding, font size, card height và method-tag trong summary để tiết kiệm không gian.


## v3.6 updates
- `select-deal.html`: khung `Thông tin tổng quát của deal` thêm field `Cặp tiền tệ`.
- Summary hiện: `USD → VND`, tỷ giá, giới hạn, hình thức nhận/gửi.


## v3.7 updates
- `select-deal.html`: ở section `Tôi gửi USD bằng hình thức`, chỉ hiển thị method tồn tại trong deal.
- `select-deal.html`: ở section `Người thụ hưởng nhận VND bằng hình thức`, chỉ hiển thị method tồn tại trong deal.
- Các method không thuộc deal sẽ bị ẩn hoàn toàn, không còn hiển thị dạng disabled.


## v3.8 updates
- `select-deal.html`: các method không tồn tại trong deal vẫn bị ẩn hoàn toàn.
- UI method selection quay lại dạng chip/button cũ (`.chip`, `data-chip`, check mark).
- Không dùng layout `method-chip` dạng input/radio mới cho màn chọn deal.


## v3.9 updates
- `select-deal.html`: section `Thông tin tài khoản người thụ hưởng` có 2 button:
  - `Chọn tài khoản`;
  - `Thêm mới`.
- `Chọn tài khoản` mở modal picker.
- Modal picker chỉ hiển thị tài khoản phù hợp với:
  - currency `VND`;
  - phương thức đang chọn ở `Người thụ hưởng nhận VND bằng hình thức`;
  - status `active`.
- Khi chọn tài khoản, thông tin được đưa lên form.
- Tài khoản đã chọn có button:
  - `Đổi tài khoản`;
  - `Xoá`.
- Khi đổi method nhận, nếu tài khoản đang chọn không còn phù hợp thì tự xoá khỏi form.


## v4.0 updates
- Áp dụng account picker cho mọi màn có `Thông tin tài khoản người thụ hưởng`:
  - `search-deal.html`;
  - `create-deal.html`;
  - `select-deal.html`.
- Button `Chọn tài khoản` mở modal picker.
- Modal picker filter tài khoản theo:
  - currency của section;
  - phương thức đang được chọn;
  - status `active`.
- Thông tin tài khoản sau khi chọn được đưa lên form.
- Tài khoản đã chọn có action:
  - `Đổi tài khoản`;
  - `Xoá`.
- Khi đổi payment method, nếu tài khoản đã chọn không còn phù hợp thì tự xoá khỏi form.
- `common.js`: chip cũ được bổ sung `data-method` để đọc đúng method khi filter tài khoản.


## v4.1 updates
- `deal-results.html`: remove copy `Có thể xử lý $799...` vì deal results không còn hiển thị available/capacity amount.


## v4.2 updates
- `deal-results.html`: tách rõ payment methods trong mỗi deal result:
  - `Nhận qua:`
  - `Gửi qua:`
- Không còn gộp tất cả method tag chung một dòng.


## v4.3 updates
- `deal-results.html`: trong mỗi item, button `Xem chi tiết` được đặt cùng hàng với `Tỷ giá`.
- Remove vị trí button cũ ở cuối card để item gọn hơn.


## v4.4 updates
- `manage-deals.html`: mỗi item tách rõ payment methods:
  - `Gửi qua:`
  - `Nhận qua:`
- `manage-deals.html`: trên desktop, nhóm button action được thu nhỏ và nằm bên phải card.
- Mobile vẫn giữ action bên dưới để dễ bấm.


## v4.5 updates
- `transaction-detail-case-01-waiting-counterparty-acceptance.html`: thêm button `Huỷ giao dịch`.
- Trước khi Tran *** B accept, Nguyễn V*** A có quyền huỷ giao dịch và không mất phí.
- Thêm modal xác nhận huỷ:
  - phí huỷ `$0.00`;
  - USDV chưa bị hold.
- Khi accept giao dịch:
  - cả hai bên bị trừ phí `0.5%` trên số tiền giao dịch;
  - phí bị trừ bằng ví `USDV` trong VLINKPAY;
  - phí không hoàn lại;
  - ví USDV của cả hai bên bị hold số tiền bằng số tiền giao dịch.
- Các màn detail sau accept hiển thị panel `Phí & hold USDV`.


## v4.6 updates
- Fix lỗi `detail-cases.js` dùng sai `caseKey`, làm Case 1 không render được action bổ sung.
- `transaction-detail-case-01-waiting-counterparty-acceptance.html`:
  - thêm button `Huỷ giao dịch` trực tiếp trong chi tiết Case 1;
  - thêm modal xác nhận huỷ;
  - nêu rõ trước khi Tran *** B accept thì Nguyễn V*** A huỷ không mất phí.
- Chuẩn hoá rule phí:
  - phí thu của mỗi bên là `0.5%`;
  - trừ bằng ví `USDV` trong VLINKPAY;
  - không hoàn lại;
  - khi accept, ví USDV của cả hai bên bị hold số tiền bằng số tiền giao dịch.


## v4.7 updates
- Fix Case 7 thiếu button:
  - `Rút khiếu nại`;
  - `Liên hệ hỗ trợ`.
- Fix Case 9 thiếu button:
  - `Giải thích về khiếu nại`;
  - `Liên hệ hỗ trợ`.
- Thêm modal `Rút khiếu nại` cho Case 7.
- Thêm modal `Giải thích về khiếu nại` cho Case 9, có ghi chú và upload image/video/audio nhiều file, tối đa 6 file.
- Thêm static fallback trực tiếp trong HTML để button vẫn hiện nếu JS case render lỗi.


## v4.8 updates
- Modal `Xác nhận đã gửi tiền` hỗ trợ multi upload.
- File input trong modal support:
  - image;
  - video;
  - audio.
- Cập nhật label từ `Tải ảnh biên lai` thành `Upload bằng chứng đã gửi tiền`.
- `data-max-files="6"`, `data-max-size-mb="10"`.
- `common.js` bổ sung `data-formats-label` để hiển thị đúng format hỗ trợ theo từng upload control.


## v4.9 updates
- `transaction-detail-case-08-waiting-my-acceptance.html`: card `Yêu cầu chấp nhận deal` hiển thị thông tin deal của bên B.
- Thông tin hiển thị gồm:
  - người tạo deal dạng mask tên;
  - cặp tiền tệ;
  - tỷ giá;
  - B gửi;
  - B muốn nhận;
  - `Gửi qua:`;
  - `Nhận qua:`.
- Modal `Chấp nhận giao dịch` cũng hiển thị lại thông tin deal của bên B để xác nhận trước khi accept.
