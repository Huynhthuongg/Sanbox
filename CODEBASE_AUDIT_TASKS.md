# Codebase audit: đề xuất task sửa lỗi và cải tiến

## Phạm vi rà soát nhanh
- `README.md`
- `artifacts/api-server/src/routes/stripe.ts`
- `artifacts/sandbox-ai/src/pages/import-github.tsx`
- `artifacts/api-server/package.json`
- `artifacts/sandbox-ai/package.json`

---

## 1) [Medium] Task sửa lỗi đánh máy (typo)
- **Vấn đề**: Tên dự án ở tiêu đề README đang là **"Sanbox"** thay vì **"Sandbox"**.
- **Nguyên nhân**: Lỗi chính tả trong tài liệu gốc.
- **Cách sửa đề xuất**:
  1. Sửa tiêu đề `README.md` thành `# Sandbox — AI Agent Sandbox`.
  2. Rà soát toàn repo các chuỗi thương hiệu `Sanbox` để chuẩn hóa nếu đó không phải tên cố ý.
- **File liên quan**:
  - `README.md`
  - (khả năng mở rộng) `artifacts/sandbox-ai/src/pages/about.tsx` (link chứa tên repo)
- **Mức độ ảnh hưởng**: Trải nghiệm chuyên nghiệp/độ tin cậy thương hiệu; không ảnh hưởng runtime.

## 2) [Critical] Task sửa lỗi chức năng (bug)
- **Vấn đề**: Webhook Stripe hiện chỉ log TODO khi nhận sự kiện checkout/subscription, chưa cập nhật trạng thái gói người dùng trong DB.
- **Nguyên nhân**: Logic xử lý nghiệp vụ sau thanh toán chưa hoàn thiện (placeholder TODO).
- **Cách sửa đề xuất**:
  1. Triển khai cập nhật bảng user/subscription khi `checkout.session.completed` và các event huỷ gia hạn.
  2. Đảm bảo idempotency theo `event.id` để tránh xử lý lặp.
  3. Bổ sung kiểm tra mapping `customer/email -> userId` rõ ràng.
  4. Thêm logging có cấu trúc cho success/fail và dead-letter strategy khi DB lỗi.
- **File liên quan**:
  - `artifacts/api-server/src/routes/stripe.ts`
  - `lib/db/src/schema/*` (nếu thiếu cột bảng subscription/user plan)
- **Mức độ ảnh hưởng**: Doanh thu + phân quyền tính năng có nguy cơ sai lệch trực tiếp sau thanh toán.

## 3) [High] Task sửa chú thích mã / sai khác tài liệu
- **Vấn đề**: README quá tối giản (chỉ tiêu đề + ảnh), không phản ánh scripts thực tế và cách chạy multi-package trong monorepo.
- **Nguyên nhân**: Tài liệu chưa được cập nhật theo cấu trúc hiện tại (`api-server`, `sandbox-ai`, `lib/*`).
- **Cách sửa đề xuất**:
  1. Viết mục "Getting started" gồm yêu cầu môi trường, cài dependency, chạy từng app.
  2. Đồng bộ bảng scripts từ `package.json` (dev/build/typecheck).
  3. Thêm mục kiến trúc ngắn về quan hệ `artifacts/*` và `lib/*`.
- **File liên quan**:
  - `README.md`
  - `artifacts/api-server/package.json`
  - `artifacts/sandbox-ai/package.json`
- **Mức độ ảnh hưởng**: Giảm tốc onboarding, tăng rủi ro chạy sai lệnh và cấu hình sai môi trường.

## 4) [High] Task cải thiện quy trình kiểm thử
- **Vấn đề**: Hai app hiện chỉ có `typecheck`, chưa có test tự động (unit/integration/e2e) trong scripts chính.
- **Nguyên nhân**: Pipeline kiểm thử chưa được thiết lập đầy đủ.
- **Cách sửa đề xuất**:
  1. Thêm test framework cho backend (Vitest/Jest + supertest) để test route `health`, `stripe webhook`.
  2. Thêm test cho frontend (Vitest + Testing Library) cho flow quan trọng như `import-github` state transition.
  3. Thêm script chuẩn: `test`, `test:watch`, `test:coverage` trong từng package.
  4. Tạo CI job chạy tối thiểu: lint (nếu có) + typecheck + test.
- **File liên quan**:
  - `artifacts/api-server/package.json`
  - `artifacts/sandbox-ai/package.json`
  - (mới) cấu hình test và workflow CI
- **Mức độ ảnh hưởng**: Rủi ro hồi quy cao, khó phát hiện bug sớm trước release.

---

## Gợi ý ưu tiên triển khai
1. **Critical**: Hoàn thiện webhook Stripe (Task #2).
2. **High**: Thiết lập test automation (Task #4).
3. **High**: Chuẩn hóa tài liệu README (Task #3).
4. **Medium**: Sửa typo thương hiệu (Task #1).
