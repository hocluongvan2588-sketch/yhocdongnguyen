# Tài liệu Kiến thức Gốc - Mai Hoa Dịch Số

## Mục lục

### 1. Tài liệu Lý thuyết Nền tảng
- **[mai-hoa-theoretical-foundation.md](./mai-hoa-theoretical-foundation.md)** - Nghiên cứu tổng thể về Kiến trúc Hệ thống và Cơ sở Lý luận trong Xây dựng Website Chẩn đoán Sức khỏe qua Mai Hoa Dịch Số (2025-2026)

### 2. Cấu trúc Dữ liệu (lib/data/)
- **bagua-matrix.ts** - Ma trận Bát Quái với ánh xạ cơ quan và bệnh lý
- **liushen-liuqin.ts** - Thư viện Lục Thần và Lục Thân
- **yao-system.ts** - Hệ thống 6 hào định vị cơ thể
- **theoretical-knowledge.ts** - Index tổng hợp kiến thức lý thuyết

## Tổng quan Kiến thức

### Nền tảng Triết học
Mai Hoa Dịch Số là phương pháp chiêm bốc dựa trên Kinh Dịch, được Thiệu Khang Tiết sáng tạo thời Bắc Tống. Nguyên lý cốt lõi: "Vạn vật đều có số" - mọi hiện tượng trong vũ trụ đều có thể định lượng và dự đoán.

### Quy trình Toán học
Các phương pháp lập quẻ:
1. **Niên Nguyệt Nhật Thời Khởi Quẻ** - Phương pháp phổ biến nhất
2. **Thanh Âm Khởi Quẻ** - Từ âm thanh và ngôn ngữ
3. **Phương Vị Khởi Quẻ** - Từ hướng và vị trí không gian

### Hệ thống Chẩn đoán Y học
- **Bát Quái** → Ánh xạ cơ quan và bộ phận cơ thể
- **Lục Thần** → Xác định tính chất bệnh
- **Lục Thân** → Đánh giá mức độ nghiêm trọng
- **Hào vị** → Định vị chính xác vị trí bệnh

### Kiến trúc Hệ thống
Các mô-đun chính:
1. Mô-đun Lập Quẻ (Hexagram Generator)
2. Mô-đun Phân Tích Y Lý (Medical Analysis Engine)
3. Mô-đun AI Chatbot Tư vấn
4. Mô-đun Quản lý Lịch sử

### Khung Pháp lý và Đạo đức
- Chỉ là "tham vấn tâm linh", không phải "chẩn đoán y khoa"
- Bảo mật thông tin người dùng (GDPR, PDPA)
- Không thay thế ý kiến bác sĩ chuyên khoa
- Minh bạch về phương pháp và giới hạn

### Xu hướng Công nghệ Tương lai
- AI & Machine Learning
- Tích hợp Wearable Devices
- Blockchain & Traceability
- Multimodal AI Analysis

## Cách sử dụng

### Cho Developer
```typescript
import { knowledgeBaseIndex } from '@/lib/data/theoretical-knowledge';

// Truy cập kiến thức triết học
const philosophy = knowledgeBaseIndex.philosophical;

// Truy cập quy trình toán học
const math = knowledgeBaseIndex.mathematical;

// Truy cập hệ thống chẩn đoán
const diagnosis = knowledgeBaseIndex.medical;
```

### Cho AI Chatbot
Sử dụng các file này làm context khi xây dựng RAG (Retrieval-Augmented Generation) để chatbot có thể:
- Trả lời câu hỏi về lý thuyết Mai Hoa Dịch Số
- Giải thích các thuật ngữ chuyên môn
- Cung cấp phân tích y lý dựa trên cơ sở tri thức

## Tài liệu Tham khảo
1. Kinh Dịch (I Ching)
2. Mai Hoa Dịch Số - Thiệu Khang Tiết
3. Hoàng Đế Nội Kinh
4. Nghiên cứu: Kiến trúc Hệ thống và Cơ sở Lý luận (2025-2026)

## Lưu ý quan trọng
Tất cả thông tin trong hệ thống này chỉ mang tính chất tham khảo tâm linh và văn hóa. Không thay thế cho việc khám, chữa bệnh tại các cơ sở y tế chuyên nghiệp.
