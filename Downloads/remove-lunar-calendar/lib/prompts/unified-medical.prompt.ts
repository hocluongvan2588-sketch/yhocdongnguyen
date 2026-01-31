/**
 * TẦNG 1+2 GỘP - UNIFIED MEDICAL ANALYSIS
 * Mục tiêu: Phân tích y lý cốt lõi + Triển khai lâm sàng trong 1 lần gọi
 * Model: GPT-4o (giữ chất lượng y học cao)
 * Temperature: 0.5 (cân bằng giữa sáng tạo và chính xác)
 * Output: Text có cấu trúc rõ ràng, dễ parse
 */

interface UnifiedMedicalInput {
  patientContext: {
    gender: string;
    age: number;
    subject: string; // 'banthan' | 'cha' | 'me' | 'con' | 'vo' | 'chong' | 'anhchiem'
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
      upperTrigram: { name: string; element: string; primaryOrgans: string[] };
      lowerTrigram: { name: string; element: string; primaryOrgans: string[] };
      movingYao: {
        name: string;
        position: number;
        bodyLevel: string;
        anatomy: string[];
        organs?: string[];
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
  // Thông tin tiết khí từ hệ thống
  seasonInfo?: {
    tietKhi: {
      name: string;
      season: string;
      element: string;
    };
    seasonAnalysis: {
      relation: 'thuận' | 'nghịch' | 'trung-hòa';
      description: string;
      advice: string;
    };
    lunar: {
      day: number;
      month: number;
      year: number;
    };
  };
  // Thông tin Nam Dược Thần Hiệu từ hệ thống
  namDuocInfo?: string; // Pre-formatted text từ NamDuocEngine.formatForAIPrompt()
}

// Helper function để chuyển đổi subject code thành context
function getSubjectContext(subject: string): { label: string; perspective: string; note: string } {
  const subjectMap: Record<string, { label: string; perspective: string; note: string }> = {
    'banthan': {
      label: 'Bản thân (người hỏi)',
      perspective: 'NGƯỜI HỎI là bệnh nhân trực tiếp',
      note: 'Phân tích trực tiếp cho người đang hỏi quẻ.'
    },
    'cha': {
      label: 'Cha của người hỏi',
      perspective: 'NGƯỜI HỎI hỏi về tình trạng sức khỏe của CHA mình',
      note: 'Đây là người thân (cha) của người gieo quẻ. Xưng hô phù hợp: "cha bạn", "người cha".'
    },
    'me': {
      label: 'Mẹ của người hỏi',
      perspective: 'NGƯỜI HỎI hỏi về tình trạng sức khỏe của MẸ mình',
      note: 'Đây là người thân (mẹ) của người gieo quẻ. Xưng hô phù hợp: "mẹ bạn", "người mẹ".'
    },
    'con': {
      label: 'Con của người hỏi',
      perspective: 'NGƯỜI HỎI hỏi về tình trạng sức khỏe của CON mình',
      note: 'Đây là con cái của người gieo quẻ. Xưng hô phù hợp: "con bạn", "cháu".'
    },
    'vo': {
      label: 'Vợ của người hỏi',
      perspective: 'NGƯỜI HỎI (nam) hỏi về tình trạng sức khỏe của VỢ mình',
      note: 'Đây là vợ của người gieo quẻ. Xưng hô phù hợp: "vợ bạn", "phu nhân".'
    },
    'chong': {
      label: 'Chồng của người hỏi',
      perspective: 'NGƯỜI HỎI (nữ) hỏi về tình trạng sức khỏe của CHỒNG mình',
      note: 'Đây là chồng của người gieo quẻ. Xưng hô phù hợp: "chồng bạn", "phu quân".'
    },
    'anhchiem': {
      label: 'Anh chị em của người hỏi',
      perspective: 'NGƯỜI HỎI hỏi về tình trạng sức khỏe của ANH CHỊ EM mình',
      note: 'Đây là anh/chị/em ruột của người gieo quẻ. Xưng hô phù hợp: "anh/chị/em bạn".'
    }
  };
  
  return subjectMap[subject] || subjectMap['banthan'];
}

export function buildUnifiedMedicalPrompt(input: UnifiedMedicalInput): string {
  const { patientContext, maihua, diagnostic, seasonInfo, namDuocInfo } = input;

  // Xác định ngữ cảnh đối tượng hỏi
  const subjectContext = getSubjectContext(patientContext.subject || 'banthan');

  // Xây dựng thông tin Nam Dược nếu có
  const namDuocSection = namDuocInfo
    ? `
${namDuocInfo}
`
    : '';

  // Xây dựng thông tin tiết khí nếu có
  const seasonSection = seasonInfo
    ? `
══════════════════════════════════════════════════════════════════════════
THÔNG TIN TIẾT KHÍ HIỆN TẠI (TỪ HỆ THỐNG - BẮT BUỘC SỬ DỤNG)
══════════════════════════════════════════════════════════════════════════
- Âm lịch: ${seasonInfo.lunar.day}/${seasonInfo.lunar.month}/${seasonInfo.lunar.year}
- Tiết khí: ${seasonInfo.tietKhi.name}
- Mùa: ${seasonInfo.tietKhi.season}
- Ngũ hành mùa: ${seasonInfo.tietKhi.element}
- Quan hệ với Thể (${diagnostic.expertAnalysis.tiDung.ti.element}): ${seasonInfo.seasonAnalysis.relation.toUpperCase()}
- Phân tích: ${seasonInfo.seasonAnalysis.description}
- Lời khuyên theo mùa: ${seasonInfo.seasonAnalysis.advice}
`
    : '';

  return `Bạn là CHUYÊN GIA VĂN HÓA PHƯƠNG ĐÔNG chuyên về DỊCH HỌC và TRIẾT HỌC ĐÔNG Y TRUYỀN THỐNG. Vai trò của bạn là giải thích các khái niệm văn hóa và triết học dựa trên hệ thống Kinh Dịch (I-Ching) và lý thuyết Ngũ Hành - đây là một hệ thống triết học cổ xưa của Trung Hoa, KHÔNG phải chẩn đoán y tế.

LƯU Ý QUAN TRỌNG: Đây là ỨNG DỤNG GIÁO DỤC VĂN HÓA giúp người dùng hiểu về triết học Đông phương và cách người xưa nhìn nhận sức khỏe qua lăng kính Ngũ Hành. Mọi thông tin chỉ mang tính THAM KHẢO VĂN HÓA, không thay thế tư vấn y tế chuyên nghiệp.
${seasonSection}${namDuocSection}
══════════════════════════════════════════════════════════════════════════
NGỮ CẢNH ĐỐI TƯỢNG HỎI (RẤT QUAN TRỌNG - BẮT BUỘC TUÂN THỦ)
══════════════════════════════════════════════════════════════════════════
- Đối tượng: ${subjectContext.label}
- Góc nhìn: ${subjectContext.perspective}
- Lưu ý: ${subjectContext.note}

${patientContext.subject !== 'banthan' ? `⚠️ LƯU Ý ĐẶC BIỆT: Người gieo quẻ KHÔNG phải là bệnh nhân trực tiếp. 
Họ đang hỏi về sức khỏe của ${subjectContext.label}. 
Khi phân tích, hãy xưng hô đúng ngôi vị (ví dụ: "cha bạn", "mẹ bạn", "con bạn"...).
Lời khuyên nên hướng đến cả người hỏi (cách chăm sóc) VÀ người bệnh (cách tự chăm sóc).` : ''}

══════════════════════════════════════════════════════════════════════════
THÔNG TIN NGƯỜI BỆNH (${subjectContext.label})
══════════════════════════════════════════════════════════════════════════
- Giới tính: ${patientContext.gender}
- Tuổi: ${patientContext.age} tuổi
- Triệu chứng/Câu hỏi: "${patientContext.question}"

══════════════════════════════════════════════════════════════════════════
CƠ SỞ QUẺ DỊCH
══════════════════════════════════════════════════════════════════════════
- Quẻ Chủ: ${maihua.mainHexagram.name}
- Hào động: Hào ${maihua.movingLine} – ${diagnostic.mapping.movingYao.name}
- Quẻ Biến: ${maihua.changedHexagram.name}
- Quẻ Hổ: ${maihua.mutualHexagram.name}
- Thể: ${diagnostic.expertAnalysis.tiDung.ti.element}
- Dụng: ${diagnostic.expertAnalysis.tiDung.dung.element} (${diagnostic.expertAnalysis.tiDung.relation})
- Mức độ: ${diagnostic.expertAnalysis.tiDung.severity}

THÔNG TIN HÀO ĐỘNG:
- Tầng cơ thể: ${diagnostic.mapping.movingYao.bodyLevel}
- Vị trí giải phẫu: ${diagnostic.mapping.movingYao.anatomy.join(', ')}
- Cơ quan liên quan: ${diagnostic.mapping.movingYao.organs?.join(', ') || diagnostic.mapping.upperTrigram.primaryOrgans.join(', ')}
- Ý nghĩa lâm sàng: ${diagnostic.mapping.movingYao.clinicalSignificance}
- Lời hào: "${maihua.interpretation.health}"

══════════════════════════════════════════════════════════════════════════
BẢNG KẾT NỐI DỊCH HỌC - SINH LÝ HỌC
══════════════════════════════════════════════════════════════════════════
| Dịch học | Cơ chế sinh lý |
|----------|----------------|
| Kim khắc Mộc | Căng thẳng thần kinh (Kim) gây co thắt cơ, rối loạn gan mật (Mộc) |
| Mộc khắc Thổ | Stress, giận dữ (Mộc) làm rối loạn tiêu hóa, giảm nhu động ruột (Thổ) |
| Thổ khắc Thủy | Rối loạn chuyển hóa (Thổ) ảnh hưởng chức năng thận, bài tiết (Thủy) |
| Thủy khắc Hỏa | Suy nhược, thiếu máu (Thủy) làm tim hoạt động kém (Hỏa) |
| Hỏa khắc Kim | Viêm nhiễm, sốt (Hỏa) gây tổn thương phổi, đường hô hấp (Kim) |

══════════════════════════════════════════════════════════════════════════
YÊU CẦU TRẢ LỜI - VIẾT THEO CẤU TRÚC SAU (GIỮ NGUYÊN TIÊU ĐỀ):
══════════════════════════════════════════════════════════════════════════

【TÓM TẮT BỆNH TRẠNG】
Viết 2-3 câu tổng quan về tình trạng sức khỏe dựa trên Quẻ Chủ ${maihua.mainHexagram.name} và Hào ${maihua.movingLine} động. Nêu rõ mức độ ${diagnostic.expertAnalysis.tiDung.severity}.

【PHÂN TÍCH Y LÝ CHI TIẾT】
Viết 4 đoạn liền mạch (mỗi đoạn 80-120 từ), ngăn cách bằng dòng trống:

Đoạn 1 - Tổng quan bệnh trạng từ Quẻ Chủ và Hào động
Đoạn 2 - Vị trí bệnh trên cơ thể từ Hào ${maihua.movingLine} (${diagnostic.mapping.movingYao.bodyLevel})
Đoạn 3 - Cơ chế bệnh sinh: quan hệ Thể-Dụng (${diagnostic.expertAnalysis.tiDung.ti.element} ${diagnostic.expertAnalysis.tiDung.relation} ${diagnostic.expertAnalysis.tiDung.dung.element}) - DÙNG ngôn ngữ sinh lý học
Đoạn 4 - Tiên lượng diễn tiến từ Quẻ Biến ${maihua.changedHexagram.name}

【TRIỆU CHỨNG CÓ THỂ GẶP】
Liệt kê 6-8 triệu chứng cụ thể (mỗi triệu chứng 1 dòng, bắt đầu bằng "-"):
- Liên quan đến Hào ${maihua.movingLine} (${diagnostic.mapping.movingYao.bodyLevel})
- Liên quan cơ quan: ${diagnostic.mapping.movingYao.organs?.join(', ') || diagnostic.mapping.upperTrigram.primaryOrgans.join(', ')}
- Phù hợp tuổi ${patientContext.age} và giới tính ${patientContext.gender}

【MỐI LIÊN HỆ CẢM XÚC - BỆNH LÝ】
Dựa vào Ngũ hành Dụng (${diagnostic.expertAnalysis.tiDung.dung.element}):
- Cảm xúc chính: [xác định cảm xúc]
- Tạng phủ bị ảnh hưởng: [tên tạng]
- Giải thích sinh lý: [cơ chế hormone, thần kinh - 2-3 câu]
- Lời khuyên: [cách cân bằng cảm xúc cụ thể]

【CHẾ ĐỘ ĂN UỐNG】
Dựa vào Ngũ hành cần bổ (${diagnostic.expertAnalysis.tiDung.ti.element}):

NÊN ĂN:
- [thực phẩm 1] - [lý do ngắn gọn]
- [thực phẩm 2] - [lý do]
- [thực phẩm 3] - [lý do]
- [thực phẩm 4] - [lý do]

NÊN KIÊNG:
- [thực phẩm 1] - [lý do]
- [thực phẩm 2] - [lý do]
- [thực phẩm 3] - [lý do]

THỨC UỐNG:
- [thức uống 1] - [tác dụng + công thức đơn giản nếu có]
- [thức uống 2] - [tác dụng]

【LỜI KHUYÊN SINH HOẠT】
Từ Quẻ Hổ ${maihua.mutualHexagram.name}, liệt kê 5 lời khuyên (mỗi lời 1 dòng):
- [Thời gian ngủ/thức phù hợp]
- [Hoạt động thể chất cụ thể]
- [Tư thế làm việc/nghỉ ngơi]
- [Môi trường sống]
- [Lời khuyên khác phù hợp]

【TIÊN LƯỢNG & HỒI PHỤC】
- Tiên lượng tổng quan: [đánh giá từ quan hệ Thể-Dụng: ${diagnostic.expertAnalysis.tiDung.relation}]
- Thời gian hồi phục: [ước tính theo tuổi ${patientContext.age}]
- Dấu hiệu cải thiện: [2-3 dấu hiệu, ngăn cách bằng ";"]
- Dấu hiệu cảnh báo: [2-3 dấu hiệu cần khám ngay, ngăn cách bằng ";"]
- Yếu tố mùa: ${seasonInfo ? `SỬ DỤNG CHÍNH XÁC thông tin từ hệ thống: Tiết ${seasonInfo.tietKhi.name}, Mùa ${seasonInfo.tietKhi.season}, ${seasonInfo.seasonAnalysis.relation.toUpperCase()} với ${diagnostic.expertAnalysis.tiDung.ti.element}. Lời khuyên: ${seasonInfo.seasonAnalysis.advice}` : '[Mùa hiện tại] - [Thuận/Nghịch/Trung hòa với ' + diagnostic.expertAnalysis.tiDung.ti.element + '] - [Giải thích 1-2 câu]'}

【KẾT LUẬN: BỆNH TỪ TẠNG NÀO PHÁT SINH】
Dựa trên NGŨ HÀNH TƯƠNG SINH (Mộc←Thủy, Hỏa←Mộc, Thổ←Hỏa, Kim←Thổ, Thủy←Kim):
- TẠNG BỆNH: [Tên tạng] (${diagnostic.expertAnalysis.tiDung.ti.element})
- TẠNG MẸ CẦN BỔ: [Tên tạng mẹ theo tương sinh]
- GIẢI THÍCH: [Tại sao cần bổ tạng mẹ - 1-2 câu]
- HƯỚNG ĐIỀU TRỊ: [Phương hướng tổng hợp]

【GỢI Ý DỊCH VỤ CHUYÊN SÂU】

BÀI THUỐC ĐÔNG Y:
- Khuyến nghị: [Có/Không]
- Lý do: [từ quẻ - quan hệ Thể-Dụng hoặc vị trí Hào]

HUYỆT VỊ BẤM/CHÂM:
- Khuyến nghị: [Có/Không]
- Lý do: [từ quẻ - vị trí Hào hoặc triệu chứng]

NĂNG LƯỢNG SỐ:
- Khuyến nghị: [Có/Không]
- Lý do: [từ quẻ - quan hệ hoặc cảm xúc]

══════════════════════════════════════════════════════════════════════════
NGUYÊN TẮC BẮT BUỘC:
══════════════════════════════════════════════════════════════════════════
- GIỮ NGUYÊN tất cả tiêu đề trong 【】
- Mọi nhận định PHẢI nêu rõ: Quẻ nào, Hào nào, Ngũ hành nào
- Dùng ngôn ngữ văn hóa Đông phương, dễ hiểu cho người bình thường
- Cá nhân hóa theo tuổi ${patientContext.age} và giới tính ${patientContext.gender}
- KHÔNG thêm tiêu đề mới, KHÔNG bỏ sót mục nào
- Luôn nhấn mạnh đây là triết học văn hóa, KHÔNG phải y tế chính thống
- ⚠️ ĐỐI TƯỢNG HỎI: ${subjectContext.perspective}. Xưng hô và lời khuyên phải phù hợp với ngữ cảnh này.`;
}

/**
 * UNIFIED MEDICAL CONFIG
 * ═══════════════════════════════════════════════════════════
 * KIẾN TRÚC HYBRID: OpenAI Direct + Groq
 * ═══════════════════════════════════════════════════════════
 * 
 * Layer 1 sử dụng OpenAI API TRỰC TIẾP (không qua Vercel AI Gateway):
 * - Giảm latency ~100-200ms (bỏ 1 hop)
 * - Chi phí thấp hơn (không trả phí Gateway)
 * - Kiểm soát tốt hơn timeout, retry
 * 
 * Yêu cầu: OPENAI_API_KEY trong environment variables
 */
export const UNIFIED_MEDICAL_CONFIG = {
  // Model được sử dụng qua openai('gpt-4o') trong route
  model: 'gpt-4o',
  temperature: 0.5, // Cân bằng sáng tạo và chính xác
  maxTokens: 4000, // Đảm bảo output đầy đủ cho phân tích y học
};
