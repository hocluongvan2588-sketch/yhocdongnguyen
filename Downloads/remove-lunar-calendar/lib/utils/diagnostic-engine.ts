/**
 * Module 3 & 4: Ma trận Ánh xạ Chẩn đoán & Hệ Chuyên gia
 * Diagnostic Mapping & Expert Logic System
 */

import { BAGUA_MATRIX, type BaguaTrigram } from '../data/bagua-matrix';
import { YAO_SYSTEM, type YaoPosition } from '../data/yao-system';
import type { MaiHuaResult } from './maihua-engine';

/**
 * Ngũ hành (Five Elements)
 */
export const WU_XING = {
  KIM: 'Kim',
  MỘC: 'Mộc',
  THỦY: 'Thủy',
  HỎA: 'Hỏa',
  THỔ: 'Thổ'
} as const;

/**
 * Ma trận Ngũ hành sinh khắc
 */
export const WU_XING_RELATIONS = {
  // Sinh: A sinh B
  generating: {
    Kim: 'Thủy',   // Kim sinh Thủy
    Thủy: 'Mộc',   // Thủy sinh Mộc
    Mộc: 'Hỏa',    // Mộc sinh Hỏa
    Hỏa: 'Thổ',    // Hỏa sinh Thổ
    Thổ: 'Kim'     // Thổ sinh Kim
  },
  // Khắc: A khắc B
  controlling: {
    Kim: 'Mộc',    // Kim khắc Mộc
    Mộc: 'Thổ',    // Mộc khắc Thổ
    Thổ: 'Thủy',   // Thổ khắc Thủy
    Thủy: 'Hỏa',   // Thủy khắc Hỏa
    Hỏa: 'Kim'     // Hỏa khắc Kim
  }
};

/**
 * Phân tích quan hệ Ngũ hành
 */
export type ElementRelation = 
  | 'sinh' // A sinh B - tốt
  | 'khắc' // A khắc B - xấu
  | 'bị-sinh' // B được A sinh - tốt
  | 'bị-khắc' // B bị A khắc - xấu
  | 'trung-hòa'; // Không sinh không khắc

export function analyzeElementRelation(elementA: string, elementB: string): ElementRelation {
  // A sinh B
  if (WU_XING_RELATIONS.generating[elementA as keyof typeof WU_XING_RELATIONS.generating] === elementB) {
    return 'sinh';
  }
  
  // B được A sinh (A là mẹ của B)
  if (WU_XING_RELATIONS.generating[elementB as keyof typeof WU_XING_RELATIONS.generating] === elementA) {
    return 'bị-sinh';
  }
  
  // A khắc B
  if (WU_XING_RELATIONS.controlling[elementA as keyof typeof WU_XING_RELATIONS.controlling] === elementB) {
    return 'khắc';
  }
  
  // B bị A khắc
  if (WU_XING_RELATIONS.controlling[elementB as keyof typeof WU_XING_RELATIONS.controlling] === elementA) {
    return 'bị-khắc';
  }
  
  return 'trung-hòa';
}

/**
 * Interface cho kết quả chẩn đoán
 */
export interface DiagnosticResult {
  // Module 3: Diagnostic Mapping
  mapping: {
    upperTrigram: BaguaTrigram;
    lowerTrigram: BaguaTrigram;
    movingYao: YaoPosition;
    affectedAnatomy: string[];
    affectedOrgans: string[];
    relatedDiseases: string[];
  };
  
  // Module 4: Expert Logic
  expertAnalysis: {
    tiDung: {
      ti: { trigram: number; element: string }; // Quẻ Thể (không chứa hào động)
      dung: { trigram: number; element: string }; // Quẻ Dụng (chứa hào động)
      relation: ElementRelation;
      severity: 'nặng' | 'trung-bình' | 'nhẹ';
      prognosis: string;
    };
    diseaseFlags: {
      isCritical: boolean;
      isChronicRisk: boolean;
      needsAttention: string[];
    };
  };
  
  // Tổng hợp chẩn đoán
  summary: {
    mainIssue: string;
    affectedSystems: string[];
    severity: string;
    recommendation: string;
  };
}

/**
 * Lấy thông tin Bát Quái theo số thứ tự (1-8)
 */
function getBaguaByNumber(num: number): BaguaTrigram {
  const mapping = {
    1: 'qian',  // Càn
    2: 'dui',   // Đoài
    3: 'li',    // Ly
    4: 'zhen',  // Chấn
    5: 'xun',   // Tốn
    6: 'kan',   // Khảm
    7: 'gen',   // Cấn
    8: 'kun'    // Khôn
  };
  
  const id = mapping[num as keyof typeof mapping];
  const trigram = BAGUA_MATRIX.find(t => t.id === id);
  
  if (!trigram) {
    throw new Error(`Không tìm thấy quẻ với số ${num}`);
  }
  
  return trigram;
}

/**
 * Module 3: Mapping chẩn đoán
 */
export function performDiagnosticMapping(result: MaiHuaResult): DiagnosticResult['mapping'] {
  // Lấy thông tin quẻ thượng và quẻ hạ
  const upperTrigram = getBaguaByNumber(result.upperTrigram);
  const lowerTrigram = getBaguaByNumber(result.lowerTrigram);
  
  // Lấy thông tin hào động
  const movingYao = YAO_SYSTEM.find(yao => yao.position === result.movingLine);
  
  if (!movingYao) {
    throw new Error(`Không tìm thấy hào ${result.movingLine}`);
  }
  
  // Tổng hợp các bộ phận bị ảnh hưởng (đảm bảo là array)
  const affectedAnatomy = [
    ...(upperTrigram.anatomy || []),
    ...(lowerTrigram.anatomy || []),
    ...(movingYao.anatomy || [])
  ];
  
  const affectedOrgans = [
    ...(upperTrigram.primaryOrgans || []),
    ...(lowerTrigram.primaryOrgans || []),
    ...(movingYao.organs || [])
  ];
  
  const relatedDiseases = [
    ...(upperTrigram.primaryDiseases || []),
    ...(lowerTrigram.primaryDiseases || []),
    ...(movingYao.diseases || [])
  ];
  
  // Loại bỏ trùng lặp
  return {
    upperTrigram,
    lowerTrigram,
    movingYao,
    affectedAnatomy: [...new Set(affectedAnatomy)],
    affectedOrgans: [...new Set(affectedOrgans)],
    relatedDiseases: [...new Set(relatedDiseases)]
  };
}

/**
 * Module 4: Expert Logic - Phân tích Thể Dụng
 */
export function analyzeTheVaDung(result: MaiHuaResult): DiagnosticResult['expertAnalysis'] {
  // Xác định Thể và Dụng
  // Quẻ KHÔNG chứa hào động = Thể (người bệnh)
  // Quẻ CÓ chứa hào động = Dụng (tác nhân gây bệnh)
  
  let tiTrigram: number;
  let dungTrigram: number;
  
  // Hào động nằm ở quẻ nào?
  // Hào 1-3: Quẻ Hạ, Hào 4-6: Quẻ Thượng
  if (result.movingLine <= 3) {
    dungTrigram = result.lowerTrigram; // Quẻ Hạ chứa hào động
    tiTrigram = result.upperTrigram;   // Quẻ Thượng là Thể
  } else {
    dungTrigram = result.upperTrigram; // Quẻ Thượng chứa hào động
    tiTrigram = result.lowerTrigram;   // Quẻ Hạ là Thể
  }
  
  const tiBagua = getBaguaByNumber(tiTrigram);
  const dungBagua = getBaguaByNumber(dungTrigram);
  
  // Phân tích quan hệ Ngũ hành: Dụng với Thể
  const relation = analyzeElementRelation(dungBagua.element, tiBagua.element);
  
  // Đánh giá mức độ nghiêm trọng
  let severity: 'nặng' | 'trung-bình' | 'nhẹ';
  let prognosis: string;
  
  if (relation === 'khắc') {
    // Dụng khắc Thể => Bệnh nặng, khó chữa
    severity = 'nặng';
    prognosis = `Dụng (${dungBagua.name} - ${dungBagua.element}) khắc Thể (${tiBagua.name} - ${tiBagua.element}). Tác nhân gây bệnh mạnh, ức chế cơ thể. Bệnh nặng, khó chữa, cần can thiệp sớm.`;
  } else if (relation === 'bị-khắc') {
    // Thể khắc Dụng => Bệnh nhẹ, nhanh khỏi
    severity = 'nhẹ';
    prognosis = `Thể (${tiBagua.name} - ${tiBagua.element}) khắc Dụng (${dungBagua.name} - ${dungBagua.element}). Cơ thể có khả năng tự chống lại bệnh. Bệnh nhẹ, nhanh khỏi.`;
  } else if (relation === 'sinh' || relation === 'bị-sinh') {
    // Dụng sinh Thể hoặc Thể sinh Dụng => Trung bình
    severity = 'trung-bình';
    if (relation === 'sinh') {
      prognosis = `Dụng (${dungBagua.name} - ${dungBagua.element}) sinh Thể (${tiBagua.name} - ${tiBagua.element}). Tác nhân bệnh không gây hại nghiêm trọng, có thể tự hồi phục.`;
    } else {
      prognosis = `Thể (${tiBagua.name} - ${tiBagua.element}) sinh Dụng (${dungBagua.name} - ${dungBagua.element}). Cơ thể đang tiêu hao năng lượng để chống bệnh, cần nghỉ ngơi.`;
    }
  } else {
    // Trung hòa
    severity = 'trung-bình';
    prognosis = `Thể và Dụng ở trạng thái trung hòa. Tình trạng bệnh ổn định, cần theo dõi.`;
  }
  
  // Xác định cờ hiệu cảnh báo
  const diseaseFlags = {
    isCritical: false,
    isChronicRisk: false,
    needsAttention: [] as string[]
  };
  
  // Cảnh báo nghiêm trọng nếu:
  // 1. Dụng khắc Thể
  if (relation === 'khắc') {
    diseaseFlags.isCritical = true;
    diseaseFlags.needsAttention.push('Quan hệ Ngũ hành bất lợi (Dụng khắc Thể)');
  }
  
  // 2. Hào động ở vị trí 6 (Não bộ)
  if (result.movingLine === 6) {
    diseaseFlags.isCritical = true;
    diseaseFlags.needsAttention.push('Hào động ở Thượng Hào - nguy cơ bệnh não bộ, thần kinh');
  }
  
  // 3. Hào động ở vị trí 4 (Tim phổi)
  if (result.movingLine === 4) {
    diseaseFlags.isChronicRisk = true;
    diseaseFlags.needsAttention.push('Hào động ở Tứ Hào - cần chú ý tim phổi');
  }
  
  // 4. Quẻ liên quan đến cơ quan quan trọng
  const criticalOrgans = ['Tim', 'Não', 'Phổi', 'Thận', 'Gan'];
  const hasChronicOrgan = [...tiBagua.primaryOrgans, ...dungBagua.primaryOrgans].some(
    organ => criticalOrgans.some(critical => organ.includes(critical))
  );
  
  if (hasChronicOrgan) {
    diseaseFlags.isChronicRisk = true;
  }
  
  return {
    tiDung: {
      ti: { trigram: tiTrigram, element: tiBagua.element },
      dung: { trigram: dungTrigram, element: dungBagua.element },
      relation,
      severity,
      prognosis
    },
    diseaseFlags
  };
}

/**
 * Hàm chính: Thực hiện chẩn đoán đầy đủ
 */
export function performDiagnosis(
  result: MaiHuaResult,
  patientContext?: {
    age: number;
    gender: string;
    subject: string;
    question: string;
  }
): DiagnosticResult {
  // Module 3: Mapping
  const mapping = performDiagnosticMapping(result);
  
  // Module 4: Expert Analysis
  const expertAnalysis = analyzeTheVaDung(result);
  
  // Tạo summary
  const mainIssue = mapping.movingYao.clinicalSignificance;
  const affectedSystems = [
    mapping.upperTrigram.name,
    mapping.lowerTrigram.name,
    mapping.movingYao.bodyLevel
  ];
  
  let recommendation = '';
  
  if (expertAnalysis.tiDung.severity === 'nặng') {
    recommendation = 'Khuyến nghị khám bác sĩ chuyên khoa ngay. Cần theo dõi chặt chẽ và có phương án điều trị tích cực.';
  } else if (expertAnalysis.tiDung.severity === 'trung-bình') {
    recommendation = 'Nên theo dõi tình trạng sức khỏe. Có thể tham khảo ý kiến bác sĩ để được tư vấn cụ thể.';
  } else {
    recommendation = 'Tình trạng nhẹ, có thể tự hồi phục. Chú ý nghỉ ngơi, ăn uống điều độ.';
  }
  
  // Điều chỉnh theo giới tính và tuổi tác nếu có
  if (patientContext) {
    const { age, gender } = patientContext;
    
    // Điều chỉnh theo giới tính
    if (gender === 'Nữ' && mapping.lowerTrigram.id === 'kun') {
      recommendation += ' Đặc biệt chú ý đến sức khỏe phụ khoa và tiêu hóa.';
    }
    
    if (gender === 'Nam' && mapping.upperTrigram.id === 'qian') {
      recommendation += ' Chú ý theo dõi huyết áp và hệ hô hấp.';
    }
    
    // Điều chỉnh theo tuổi
    if (age > 60) {
      recommendation += ' Ở độ tuổi này, cần đặc biệt chú ý đến các bệnh mãn tính.';
    }
  }
  
  return {
    mapping,
    expertAnalysis,
    summary: {
      mainIssue,
      affectedSystems,
      severity: expertAnalysis.tiDung.severity,
      recommendation
    }
  };
}
