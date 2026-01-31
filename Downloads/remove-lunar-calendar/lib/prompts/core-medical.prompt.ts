/**
 * @deprecated Đã gộp vào unified-medical.prompt.ts
 * File này được giữ lại để tham khảo.
 * 
 * TẦNG 1 CŨ - CORE MEDICAL ANALYSIS
 * Mục tiêu: Phân tích y lý cốt lõi từ quẻ dịch
 * Temperature: 0.5-0.6 (cân bằng giữa sáng tạo và chính xác)
 * Output: Text thuần, không JSON
 */

interface CoreMedicalInput {
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
    interpretation: {
      health: string;
      trend: string;
      mutual: string;
    };
  };
  diagnostic: {
    mapping: {
      upperTrigram: { name: string; element: string };
      lowerTrigram: { name: string; element: string };
      movingYao: {
        name: string;
        bodyLevel: string;
        anatomy: string[];
        clinicalSignificance: string;
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

export function buildCoreMedicalPrompt(input: CoreMedicalInput): string {
  const { patientContext, maihua, diagnostic } = input;

  return `Bạn là BÁC SĨ ĐÔNG Y chuyên sâu DỊCH HỌC Y LÝ.

NHIỆM VỤ DUY NHẤT:
Phân tích tình trạng bệnh của người bệnh dựa trên QUẺ DỊCH, HÀO ĐỘNG và QUAN HỆ THỂ–DỤNG.

NGUYÊN TẮC BẮT BUỘC:
- Mọi nhận định đều PHẢI nêu rõ: Quẻ nào, Hào nào, Ngũ hành nào
- Không đưa lời khuyên ăn uống, sinh hoạt, điều trị
- Không định dạng JSON
- Viết rõ ràng, logic, mạch lạc
- Giải thích thuật ngữ Dịch học bằng ngôn ngữ sinh lý học dễ hiểu

BẢNG KẾT NỐI DỊCH HỌC - SINH LÝ HỌC:
| Dịch học | Cơ chế sinh lý |
|----------|----------------|
| Kim khắc Mộc | Căng thẳng thần kinh (Kim) gây co thắt cơ, rối loạn gan mật (Mộc) |
| Mộc khắc Thổ | Stress, giận dữ (Mộc) làm rối loạn tiêu hóa, giảm nhu động ruột (Thổ) |
| Thổ khắc Thủy | Rối loạn chuyển hóa (Thổ) ảnh hưởng chức năng thận, bài tiết (Thủy) |
| Thủy khắc Hỏa | Suy nhược, thiếu máu (Thủy) làm tim hoạt động kém (Hỏa) |
| Hỏa khắc Kim | Viêm nhiễm, sốt (Hỏa) gây tổn thương phổi, đường hô hấp (Kim) |

THÔNG TIN NGƯỜI BỆNH:
- Giới tính: ${patientContext.gender}
- Tuổi: ${patientContext.age} tuổi
- Triệu chứng: "${patientContext.question}"

CƠ SỞ QUẺ:
- Quẻ Chủ: ${maihua.mainHexagram.name}
- Hào động: Hào ${maihua.movingLine} – ${diagnostic.mapping.movingYao.name}
- Quẻ Biến: ${maihua.changedHexagram.name}
- Quẻ Hổ: ${maihua.mutualHexagram.name}
- Thể: ${diagnostic.expertAnalysis.tiDung.ti.element}
- Dụng: ${diagnostic.expertAnalysis.tiDung.dung.element} (${diagnostic.expertAnalysis.tiDung.relation})

THÔNG TIN HÀO ĐỘNG:
- Tầng cơ thể: ${diagnostic.mapping.movingYao.bodyLevel}
- Vị trí giải phẫu: ${diagnostic.mapping.movingYao.anatomy.join(', ')}
- Ý nghĩa lâm sàng: ${diagnostic.mapping.movingYao.clinicalSignificance}
- Lời hào: "${maihua.interpretation.health}"

YÊU CẦU TRẢ LỜI:
Viết 4 đoạn văn liền mạch (mỗi đoạn 100-150 từ):

ĐOẠN 1 - TÓM TẮT BỆNH TRẠNG:
Dựa trên Quẻ Chủ ${maihua.mainHexagram.name} và Hào ${maihua.movingLine} động, mô tả tổng quan tình trạng sức khỏe. Nêu rõ mức độ ${diagnostic.expertAnalysis.tiDung.severity}.

ĐOẠN 2 - VỊ TRÍ & BẢN CHẤT BỆNH:
Từ Hào ${maihua.movingLine} (${diagnostic.mapping.movingYao.bodyLevel}), giải thích vị trí bệnh trên cơ thể. Liên hệ với triệu chứng "${patientContext.question}" mà người bệnh mô tả.

ĐOẠN 3 - CƠ CHẾ BỆNH SINH:
Giải thích quan hệ Thể-Dụng: ${diagnostic.expertAnalysis.tiDung.ti.element} ${diagnostic.expertAnalysis.tiDung.relation} ${diagnostic.expertAnalysis.tiDung.dung.element}. 
PHẢI dùng ngôn ngữ sinh lý học để giải thích (VD: nếu Kim khắc Mộc = căng thẳng thần kinh gây co thắt cơ).

ĐOẠN 4 - TIÊN LƯỢNG DIỄN TIẾN:
Từ Quẻ Biến ${maihua.changedHexagram.name}, đánh giá xu hướng bệnh. Cá nhân hóa theo tuổi ${patientContext.age} và giới tính ${patientContext.gender}.

Không đánh số, không gạch đầu dòng. Viết thành văn bản liền mạch.`;
}

export const CORE_MEDICAL_CONFIG = {
  temperature: 0.5,
  maxTokens: 1500,
};
