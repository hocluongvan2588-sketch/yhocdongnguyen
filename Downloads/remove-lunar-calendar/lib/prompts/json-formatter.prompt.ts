/**
 * TẦNG 2 - JSON FORMATTER (OPTIMIZED)
 * Model: GPT-4o-mini (nhẹ, nhanh, chỉ format không sáng tạo)
 * Mục tiêu: Chuyển đổi text từ Unified Layer thành JSON chuẩn
 * Temperature: 0.1 (rất thấp, tối đa tính deterministic)
 * Output: JSON thuần túy, không text bên ngoài
 */

export function buildJsonFormatterPrompt(unifiedContent: string): string {
  return `Bạn là hệ thống FORMAT DỮ LIỆU. KHÔNG sáng tạo, CHỈ trích xuất và format.

NHIỆM VỤ: Chuyển nội dung thành JSON THEO ĐÚNG SCHEMA.

═══════════════════════════════════════════════════════════
NỘI DUNG CẦN CHUYỂN ĐỔI:
═══════════════════════════════════════════════════════════

${unifiedContent}

═══════════════════════════════════════════════════════════
SCHEMA JSON (TUÂN THỦ CHÍNH XÁC):
═══════════════════════════════════════════════════════════

{
  "summary": "string - Lấy từ đoạn đầu tiên của PHÂN TÍCH Y LÝ, 2-3 câu",
  "explanation": "string - Ghép 4 đoạn PHÂN TÍCH Y LÝ thành 1 chuỗi, ngăn cách bằng \\n\\n",
  "symptoms": ["string", "string", ...] - Lấy từ mục TRIỆU CHỨNG, 5-8 items,
  "emotionalConnection": {
    "emotion": "string - Cảm xúc chính từ mục CẢM XÚC - BỆNH LÝ",
    "organ": "string - Tạng phủ bị ảnh hưởng",
    "westernExplanation": "string - Giải thích sinh lý học",
    "advice": "string - Lời khuyên cân bằng cảm xúc"
  },
  "diet": {
    "shouldEat": ["string - Thực phẩm + lý do", ...] - 4-5 items,
    "shouldAvoid": ["string - Thực phẩm kiêng + lý do", ...] - 3-4 items,
    "drinks": ["string - Thức uống + tác dụng", ...] - 2-3 items
  },
  "lifestyle": ["string - Lời khuyên sinh hoạt", ...] - 4-5 items,
  "prognosis": {
    "outlook": "string - Tiên lượng tổng quan",
    "recoveryTime": "string - Thời gian hồi phục ước tính",
    "improvementSigns": ["string", ...] - 2-3 items,
    "warningSigns": ["string", ...] - 2-3 items,
    "seasonalFactor": {
      "currentSeason": "string - Mùa hiện tại (Xuân/Hạ/Thu/Đông)",
      "compatibility": "string - Thuận mùa/Nghịch mùa/Trung hòa",
      "explanation": "string - Giải thích ảnh hưởng của mùa đến tiên lượng (2-3 câu)"
    }
  },
  "treatmentOrigin": {
    "affectedOrgan": "string - Tạng bệnh phát sinh (VD: Gan, Tim, Tỳ, Phổi, Thận)",
    "motherOrgan": "string - Tạng mẹ cần bổ trợ theo ngũ hành tương sinh",
    "explanation": "string - Giải thích tại sao cần bổ trợ tạng mẹ",
    "treatmentDirection": "string - Hướng điều trị tổng hợp"
  },
  "serviceRecommendations": {
    "herbalMedicine": {
      "recommended": boolean,
      "reason": "string - Lý do từ quẻ"
    },
    "acupressure": {
      "recommended": boolean,
      "reason": "string - Lý do từ quẻ"
    },
    "energyNumber": {
      "recommended": boolean,
      "reason": "string - Lý do từ quẻ"
    }
  }
}

═══════════════════════════════════════════════════════════
QUY TẮC CHUYỂN ĐỔI:
═══════════════════════════════════════════════════════════

1. "summary": Lấy từ mục 【TÓM TẮT BỆNH TRẠNG】
2. "explanation": Ghép toàn bộ nội dung từ mục 【PHÂN TÍCH Y LÝ CHI TIẾT】 thành 1 STRING, ngăn cách đoạn bằng "\\n\\n"
3. "symptoms": Trích xuất từng triệu chứng từ mục 【TRIỆU CHỨNG CÓ THỂ GẶP】
4. "emotionalConnection": Trích xuất từ mục 【MỐI LIÊN HỆ CẢM XÚC - BỆNH LÝ】
5. "diet": Trích xuất từ mục 【CHẾ ĐỘ ĂN UỐNG】
6. "lifestyle": Trích xuất từ mục 【LỜI KHUYÊN SINH HOẠT】
7. "prognosis": Trích xuất từ mục 【TIÊN LƯỢNG & HỒI PHỤC】
8. "treatmentOrigin": Trích xuất từ mục 【KẾT LUẬN: BỆNH TỪ TẠNG NÀO PHÁT SINH】
9. "serviceRecommendations": Trích xuất từ mục 【GỢI Ý DỊCH VỤ CHUYÊN SÂU】
   - recommended = true nếu "Khuyến nghị: Có"
   - recommended = false nếu "Khuyến nghị: Không"

QUY TẮC NGHIÊM NGẶT:
- Output CHỈ CHỨA JSON thuần túy, KHÔNG có text giải thích trước/sau
- "explanation" PHẢI là STRING, KHÔNG phải object
- Tất cả giá trị boolean: true hoặc false (không viết hoa)
- Không thêm field mới ngoài schema
- Nếu thiếu thông tin, dùng giá trị mặc định hợp lý`;
}

/**
 * JSON FORMATTER CONFIG
 * ═══════════════════════════════════════════════════════════
 * HYBRID ARCHITECTURE: GPT-4o (Quality) + Groq (Speed)
 * ═══════════════════════════════════════════════════════════
 * 
 * Layer 2 sử dụng Groq Llama-3.3-70B thay vì GPT-4o-mini vì:
 * 1. Groq LPU (Language Processing Unit) nhanh 6-10x so với GPU
 * 2. Task format JSON đơn giản, không cần sáng tạo
 * 3. Llama-3.3-70B đủ tốt cho việc parse và format text
 * 
 * Kết quả ước tính:
 * - Trước (GPT-4o-mini): 3-6 giây
 * - Sau (Groq): 0.5-1.5 giây
 * - Tiết kiệm: 2-5 giây mỗi request
 */
export const JSON_FORMATTER_CONFIG = {
  // Config này giữ để reference, thực tế dùng Groq trực tiếp trong route
  model: 'groq/llama-3.3-70b-versatile',
  temperature: 0.05,
  maxTokens: 2000,
};
