/**
 * @deprecated Đã gộp vào unified-medical.prompt.ts
 * File này được giữ lại để tham khảo.
 * 
 * TẦNG 2 CŨ - CLINICAL APPLICATION
 * Mục tiêu: Triển khai chi tiết lâm sàng từ phân tích Tầng 1
 * Temperature: 0.5 (cân bằng)
 * Output: Text có cấu trúc, không JSON
 */

interface ClinicalInput {
  coreAnalysis: string; // Output từ Tầng 1
  patientContext: {
    gender: string;
    age: number;
    question: string;
  };
  maihua: {
    mainHexagram: { name: string };
    changedHexagram: { name: string };
    mutualHexagram: { name: string };
    movingLine: number;
  };
  diagnostic: {
    mapping: {
      upperTrigram: { name: string; element: string; primaryOrgans: string[] };
      lowerTrigram: { name: string; element: string; primaryOrgans: string[] };
      movingYao: {
        name: string;
        position: number;
        bodyLevel: string;
        anatomy: string[];
        organs?: string[];
      };
    };
    expertAnalysis: {
      tiDung: {
        ti: { element: string };
        dung: { element: string };
        relation: string;
        severity: string;
        prognosis: string;
      };
    };
  };
}

export function buildClinicalPrompt(input: ClinicalInput): string {
  const { coreAnalysis, patientContext, maihua, diagnostic } = input;

  return `Bạn là BÁC SĨ ĐÔNG Y ứng dụng lâm sàng.

DƯỚI ĐÂY LÀ PHÂN TÍCH Y LÝ CỐT LÕI (KHÔNG ĐƯỢC PHỦ ĐỊNH HOẶC THAY ĐỔI):

"""
${coreAnalysis}
"""

NHIỆM VỤ:
Từ phân tích trên, triển khai CÁC NỘI DUNG ỨNG DỤNG cho người bệnh ${patientContext.gender} ${patientContext.age} tuổi.

THÔNG TIN BỔ SUNG:
- Quẻ Hổ: ${maihua.mutualHexagram.name}
- Hào động: Hào ${maihua.movingLine} (${diagnostic.mapping.movingYao.bodyLevel})
- Cơ quan liên quan: ${diagnostic.mapping.movingYao.organs?.join(', ') || diagnostic.mapping.upperTrigram.primaryOrgans.join(', ')}
- Ngũ hành Thể (cần bổ): ${diagnostic.expertAnalysis.tiDung.ti.element}
- Ngũ hành Dụng (đang mạnh): ${diagnostic.expertAnalysis.tiDung.dung.element}

YÊU CẦU VIẾT (Có tiêu đề rõ ràng cho mỗi mục):

【TRIỆU CHỨNG CÓ THỂ GẶP】
Liệt kê 6-8 triệu chứng cụ thể:
- Phải liên quan đến Hào ${maihua.movingLine} (${diagnostic.mapping.movingYao.bodyLevel})
- Phải liên quan đến cơ quan: ${diagnostic.mapping.movingYao.organs?.join(', ') || diagnostic.mapping.upperTrigram.primaryOrgans.join(', ')}
- Cá nhân hóa theo tuổi ${patientContext.age} và giới tính ${patientContext.gender}

【MỐI LIÊN HỆ CẢM XÚC - BỆNH LÝ】
Dựa vào Ngũ hành Dụng (${diagnostic.expertAnalysis.tiDung.dung.element}):
- Xác định cảm xúc chính đang ảnh hưởng
- Giải thích cơ chế sinh lý (hormone, thần kinh)
- Đưa lời khuyên cân bằng cảm xúc cụ thể

【CHẾ ĐỘ ĂN UỐNG】
Dựa vào Ngũ hành cần bổ (${diagnostic.expertAnalysis.tiDung.ti.element}):
- NÊN ĂN: 4-5 thực phẩm bổ sung Ngũ hành yếu (có lý do)
- NÊN KIÊNG: 3-4 thực phẩm làm tăng Ngũ hành đang mạnh (có lý do)
- THỨC UỐNG: 2-3 loại phù hợp (có công thức đơn giản)

【LỜI KHUYÊN SINH HOẠT】
Từ Quẻ Hổ ${maihua.mutualHexagram.name}:
- Thời gian ngủ/thức phù hợp tạng phủ bị ảnh hưởng
- Hoạt động thể chất cụ thể (loại, thời gian, cường độ)
- Tư thế làm việc, nghỉ ngơi
- Môi trường sống (nhiệt độ, ánh sáng)
- 4-5 lời khuyên cụ thể

【TIÊN LƯỢNG & HỒI PHỤC】
- Tiên lượng tổng quan (từ quan hệ Thể-Dụng: ${diagnostic.expertAnalysis.tiDung.relation})
- Thời gian hồi phục ước tính (cá nhân hóa theo tuổi ${patientContext.age})
- 2–3 dấu hiệu cải thiện cụ thể
- 2–3 dấu hiệu cảnh báo cần khám ngay
- Yếu tố mùa (nếu có ảnh hưởng):
  Đánh giá mức độ thuận hoặc nghịch mùa đối với Ngũ hành Thể (${diagnostic.expertAnalysis.tiDung.ti.element}),
  từ đó điều chỉnh tiên lượng (nhanh hơn / chậm hơn), giải thích ngắn gọn 2–3 câu.

【KẾT LUẬN: BỆNH TỪ TẠNG NÀO PHÁT SINH】
Dựa trên quan hệ Thể-Dụng và quy luật NGŨ HÀNH TƯƠNG SINH:
- Mộc (Gan) sinh từ Thủy (Thận) → Thận là mẹ của Gan
- Hỏa (Tim) sinh từ Mộc (Gan) → Gan là mẹ của Tim
- Thổ (Tỳ/Lách) sinh từ Hỏa (Tim) → Tim là mẹ của Tỳ
- Kim (Phổi) sinh từ Thổ (Tỳ) → Tỳ là mẹ của Phổi
- Thủy (Thận) sinh từ Kim (Phổi) → Phổi là mẹ của Thận

Viết kết luận theo format:
1. TẠNG BỆNH PHÁT SINH: [Tên tạng bị bệnh] (${diagnostic.expertAnalysis.tiDung.ti.element})
2. TẠNG MẸ CẦN BỔ TRỢ: [Tên tạng mẹ theo ngũ hành tương sinh]
3. GIẢI THÍCH: Tại sao cần bổ trợ tạng mẹ? (VD: Bệnh từ tạng Gan phát sinh, cần bổ Thận vì Thủy sinh Mộc - Thận nuôi dưỡng Gan)
4. HƯỚNG ĐIỀU TRỊ: Điều trị cả tạng bệnh và bổ trợ tạng mẹ để đạt hiệu quả tối ưu

【GỢI Ý DỊCH VỤ CHUYÊN SÂU】
Đánh giá và gợi ý (có lý do cụ thể từ quẻ):

1. BÀI THUỐC ĐÔNG Y:
   - Gợi ý nếu: Quan hệ Thể-Dụng là "khắc"/"bị-khắc" HOẶC Hào động ở vị trí 2-3-4 (nội tạng)
   - Nêu lý do từ quẻ

2. HUYỆT VỊ BẤM/CHÂM:
   - Gợi ý nếu: Hào động ở vị trí 1, 5, 6 (đầu, tay chân) HOẶC có triệu chứng đau nhức
   - Nêu lý do từ quẻ

3. NĂNG LƯỢNG SỐ:
   - Gợi ý nếu: Quan hệ Thể-Dụng "trung-hòa" HOẶC cảm xúc ảnh hưởng mạnh
   - Nêu lý do từ quẻ

Viết rõ ràng, có cấu trúc. Không cần JSON.`;
}

export const CLINICAL_CONFIG = {
  temperature: 0.5,
  maxTokens: 2000,
};
