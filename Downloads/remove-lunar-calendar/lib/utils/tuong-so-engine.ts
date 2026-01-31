/**
 * TƯỢNG SỐ BÁT QUÁI ENGINE
 * Liệu pháp số học kết hợp Bát Quái và Ngũ Hành
 * Dựa trên phương pháp Thiệu Khang Tiết
 */

// Bát Quái - 8 Quẻ với thuộc tính
export const BAT_QUAI = {
  1: { name: 'Càn', element: 'Kim', organ: 'Đại tràng', bodyPart: 'Đầu', nature: 'Dương', direction: 'Tây Bắc' },
  2: { name: 'Đoài', element: 'Kim', organ: 'Phế', bodyPart: 'Miệng', nature: 'Âm', direction: 'Tây' },
  3: { name: 'Ly', element: 'Hoa', organ: 'Tâm', bodyPart: 'Mắt', nature: 'Dương', direction: 'Nam' },
  4: { name: 'Chấn', element: 'Mộc', organ: 'Can', bodyPart: 'Chân', nature: 'Dương', direction: 'Đông' },
  5: { name: 'Tốn', element: 'Mộc', organ: 'Đởm', bodyPart: 'Đùi', nature: 'Âm', direction: 'Đông Nam' },
  6: { name: 'Khảm', element: 'Thủy', organ: 'Thận', bodyPart: 'Tai', nature: 'Dương', direction: 'Bắc' },
  7: { name: 'Cấn', element: 'Thổ', organ: 'Vị', bodyPart: 'Tay', nature: 'Dương', direction: 'Đông Bắc' },
  8: { name: 'Khôn', element: 'Thổ', organ: 'Tỳ', bodyPart: 'Bụng', nature: 'Âm', direction: 'Tây Nam' },
} as const;

// Ngũ Hành quan hệ sinh khắc
export const NGU_HANH = {
  Kim: { sinh: 'Thủy', khac: 'Mộc', biKhac: 'Hỏa', duocSinh: 'Thổ', color: '#C0C0C0' },
  Mộc: { sinh: 'Hỏa', khac: 'Thổ', biKhac: 'Kim', duocSinh: 'Thủy', color: '#228B22' },
  Thủy: { sinh: 'Mộc', khac: 'Hỏa', biKhac: 'Thổ', duocSinh: 'Kim', color: '#1E90FF' },
  Hỏa: { sinh: 'Thổ', khac: 'Kim', biKhac: 'Thủy', duocSinh: 'Mộc', color: '#FF4500' },
  Thổ: { sinh: 'Kim', khac: 'Thủy', biKhac: 'Mộc', duocSinh: 'Hỏa', color: '#DAA520' },
  // Alias for 'Hoa' used in database
  Hoa: { sinh: 'Thổ', khac: 'Kim', biKhac: 'Thủy', duocSinh: 'Mộc', color: '#FF4500' },
} as const;

// Công thức Tượng Số chuẩn cho từng quẻ
export const TUONG_SO_FORMULAS: Record<number, {
  formula: string;
  elementRelation: string;
  description: string;
  usage: string;
}> = {
  1: {
    formula: '10.60',
    elementRelation: 'Kim-Thủy',
    description: 'Càn Kim sinh Khảm Thủy - Điều hòa đại tràng và đầu',
    usage: 'Đọc hoặc viết chuỗi số 10.60 nhiều lần trong ngày để kích hoạt năng lượng'
  },
  2: {
    formula: '20.60',
    elementRelation: 'Kim-Thủy',
    description: 'Đoài Kim sinh Khảm Thủy - Hỗ trợ phế và miệng',
    usage: 'Thích hợp cho các vấn đề hô hấp, da, mũi họng'
  },
  3: {
    formula: '30.820',
    elementRelation: 'Hỏa-Thổ',
    description: 'Ly Hỏa sinh Khôn Thổ - Điều hòa tâm và mắt',
    usage: 'Tốt cho tim mạch, huyết áp, thị lực'
  },
  4: {
    formula: '40.30',
    elementRelation: 'Mộc-Hỏa',
    description: 'Chấn Mộc sinh Ly Hỏa - Hỗ trợ can và chân',
    usage: 'Điều hòa gan, gân cơ, khớp chân'
  },
  5: {
    formula: '50.30',
    elementRelation: 'Mộc-Hỏa',
    description: 'Tốn Mộc sinh Ly Hỏa - Hỗ trợ đởm và đùi',
    usage: 'Hỗ trợ túi mật, tiêu hóa chất béo'
  },
  6: {
    formula: '60.40',
    elementRelation: 'Thủy-Mộc',
    description: 'Khảm Thủy sinh Chấn Mộc - Bổ thận và tai',
    usage: 'Tăng cường thận, thính giác, xương khớp'
  },
  7: {
    formula: '70.20',
    elementRelation: 'Thổ-Kim',
    description: 'Cấn Thổ sinh Đoài Kim - Kiện vị và tay',
    usage: 'Hỗ trợ tiêu hóa, dạ dày, cánh tay'
  },
  8: {
    formula: '80.20',
    elementRelation: 'Thổ-Kim',
    description: 'Khôn Thổ sinh Đoài Kim - Bổ tỳ và bụng',
    usage: 'Bổ tỳ, điều hòa tiêu hóa, vùng bụng'
  },
};

// Interface cho kết quả phân tích
export interface TuongSoAnalysis {
  guaNumber: number;
  gua: typeof BAT_QUAI[keyof typeof BAT_QUAI];
  formula: string;
  elementRelation: string;
  relatedOrgans: string[];
  recommendation: string;
  balancingFormula: string;
  explanation: string;
}

/**
 * Tính số quẻ chủ đạo từ ngày sinh
 * Công thức: (Ngày + Tháng + Năm) mod 8, nếu = 0 thì = 8
 */
export function calculateMainGua(birthDate: Date): number {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();
  
  // Tính tổng các chữ số
  const sumDigits = (n: number): number => {
    return n.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  };
  
  const total = sumDigits(day) + sumDigits(month) + sumDigits(year);
  let gua = total % 8;
  return gua === 0 ? 8 : gua;
}

/**
 * Tính quẻ theo giờ sinh (Chi - 12 giờ)
 */
export function calculateHourGua(hour: number): number {
  // Giờ Tý (23-1) = 1, Sửu (1-3) = 2, ...
  const chi = Math.floor(((hour + 1) % 24) / 2) + 1;
  let gua = chi % 8;
  return gua === 0 ? 8 : gua;
}

/**
 * Phân tích Tượng Số từ quẻ chủ đạo
 */
export function analyzeTuongSo(guaNumber: number): TuongSoAnalysis {
  const gua = BAT_QUAI[guaNumber as keyof typeof BAT_QUAI];
  const formulaData = TUONG_SO_FORMULAS[guaNumber];
  
  // Tìm các cơ quan liên quan theo ngũ hành
  const relatedOrgans: string[] = [gua.organ];
  Object.entries(BAT_QUAI).forEach(([, g]) => {
    if (g.element === gua.element && g.organ !== gua.organ) {
      relatedOrgans.push(g.organ);
    }
  });
  
  // Tạo công thức cân bằng dựa trên quan hệ sinh
  const element = gua.element as keyof typeof NGU_HANH;
  const nguHanh = NGU_HANH[element];
  const balancingElement = nguHanh.sinh;
  
  // Tìm quẻ tương ứng với hành được sinh
  let balancingGua = 1;
  Object.entries(BAT_QUAI).forEach(([num, g]) => {
    if (g.element === balancingElement || (balancingElement === 'Hỏa' && g.element === 'Hoa')) {
      balancingGua = parseInt(num);
    }
  });
  
  return {
    guaNumber,
    gua,
    formula: formulaData.formula,
    elementRelation: formulaData.elementRelation,
    relatedOrgans,
    recommendation: formulaData.usage,
    balancingFormula: `${guaNumber}0.${balancingGua}0`,
    explanation: formulaData.description,
  };
}

/**
 * Tạo công thức Tượng Số cá nhân hóa
 * Kết hợp quẻ sinh và quẻ giờ
 */
export function generatePersonalFormula(birthDate: Date, birthHour?: number): {
  mainFormula: string;
  supportFormula: string;
  analysis: TuongSoAnalysis;
  hourAnalysis?: TuongSoAnalysis;
} {
  const mainGua = calculateMainGua(birthDate);
  const mainAnalysis = analyzeTuongSo(mainGua);
  
  let hourAnalysis: TuongSoAnalysis | undefined;
  let supportFormula = mainAnalysis.balancingFormula;
  
  if (birthHour !== undefined) {
    const hourGua = calculateHourGua(birthHour);
    hourAnalysis = analyzeTuongSo(hourGua);
    
    // Kết hợp công thức chính và phụ
    supportFormula = `${mainAnalysis.formula}.${hourAnalysis.formula}`;
  }
  
  return {
    mainFormula: mainAnalysis.formula,
    supportFormula,
    analysis: mainAnalysis,
    hourAnalysis,
  };
}

/**
 * Phân tích triệu chứng và đề xuất công thức
 */
export function analyzeSymptomAndSuggest(symptoms: string[]): {
  suggestedGua: number[];
  formulas: string[];
  explanation: string;
} {
  const symptomToOrgan: Record<string, string[]> = {
    'đau đầu': ['Đại tràng', 'Can'],
    'mất ngủ': ['Tâm', 'Thận'],
    'khó thở': ['Phế'],
    'đau bụng': ['Tỳ', 'Vị'],
    'đau lưng': ['Thận'],
    'mờ mắt': ['Can', 'Tâm'],
    'ù tai': ['Thận'],
    'chân tay lạnh': ['Thận', 'Tỳ'],
    'tiêu hóa kém': ['Tỳ', 'Vị', 'Đởm'],
  };
  
  const affectedOrgans = new Set<string>();
  symptoms.forEach(symptom => {
    const lowerSymptom = symptom.toLowerCase();
    Object.entries(symptomToOrgan).forEach(([key, organs]) => {
      if (lowerSymptom.includes(key)) {
        organs.forEach(o => affectedOrgans.add(o));
      }
    });
  });
  
  // Tìm quẻ tương ứng với các cơ quan bị ảnh hưởng
  const suggestedGua: number[] = [];
  const formulas: string[] = [];
  
  Object.entries(BAT_QUAI).forEach(([num, gua]) => {
    if (affectedOrgans.has(gua.organ)) {
      const guaNum = parseInt(num);
      suggestedGua.push(guaNum);
      formulas.push(TUONG_SO_FORMULAS[guaNum].formula);
    }
  });
  
  return {
    suggestedGua,
    formulas,
    explanation: `Dựa trên triệu chứng, các cơ quan cần điều hòa: ${Array.from(affectedOrgans).join(', ')}`,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOGIC MAPPING DỊCH VỤ DỰA TRÊN TIÊN LƯỢNG VÀ TÌNH TRẠNG BỆNH
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * THỨ TỰ ƯU TIÊN THEO TÌNH TRẠNG:
 * 
 * | Tình trạng           | Ưu tiên 1  | Ưu tiên 2  | Ưu tiên 3  |
 * |----------------------|------------|------------|------------|
 * | Cấp tính             | Huyệt      | Thuốc      | Số         |
 * | Nghịch mùa           | Thuốc      | Huyệt      | Số         |
 * | Cơ xương khớp        | Huyệt      | Thuốc      | Số         |
 * | Mãn tính             | Huyệt      | Số         | Thuốc      |
 * | Cảm xúc/Stress       | Số         | Huyệt      | Thuốc      |
 * | Mãn tính/Phòng ngừa  | Số         | Huyệt      | Thuốc      |
 * | Thuận mùa            | Số         | Huyệt      | Thuốc      |
 */

export interface AIAnalysisData {
  prognosis?: {
    outlook: string;
    recoveryTime: string;
    improvementSigns: string[];
    warningSigns: string[];
    seasonalFactor?: {
      currentSeason: string;
      compatibility: string;
      explanation: string;
    };
  };
  treatmentOrigin?: {
    affectedOrgan: string;
    motherOrgan: string;
    explanation: string;
    treatmentDirection: string;
  };
  emotionalConnection?: {
    emotion: string;
    organ: string;
    westernExplanation: string;
    advice: string;
  };
  symptoms?: string[];
}

export interface ServiceRecommendation {
  recommended: boolean;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  detailedReason: string;
}

/**
 * Đánh giá mức độ nghiêm trọng của bệnh từ tiên lượng
 */
function evaluateSeverity(prognosis?: AIAnalysisData['prognosis']): 'acute' | 'chronic' | 'preventive' {
  if (!prognosis) return 'preventive';
  
  const recoveryTime = prognosis.recoveryTime || '';
  const warningSigns = prognosis.warningSigns || [];
  const outlook = prognosis.outlook || '';
  
  // Kiểm tra dấu hiệu cấp tính
  const acuteKeywords = ['ngay', 'cấp', 'khẩn', 'sốt', 'đau dữ dội', 'viêm cấp', 'nhiễm trùng'];
  const hasAcuteSigns = warningSigns.some(sign => 
    acuteKeywords.some(kw => sign.toLowerCase().includes(kw))
  );
  
  if (hasAcuteSigns) return 'acute';
  
  // Kiểm tra thời gian hồi phục
  const shortTermKeywords = ['tuần', '1 tháng', '2 tuần', 'vài ngày'];
  const longTermKeywords = ['tháng', 'năm', 'dài hạn', 'lâu dài', '3 tháng', '6 tháng'];
  
  const isShortTerm = shortTermKeywords.some(kw => recoveryTime.toLowerCase().includes(kw));
  const isLongTerm = longTermKeywords.some(kw => recoveryTime.toLowerCase().includes(kw));
  
  if (isShortTerm && hasAcuteSigns) return 'acute';
  if (isLongTerm || outlook.toLowerCase().includes('mạn tính')) return 'chronic';
  
  return 'preventive';
}

/**
 * Kiểm tra ảnh hưởng cảm xúc
 */
function hasEmotionalFactor(analysis: AIAnalysisData): boolean {
  const emotionalKeywords = ['stress', 'lo âu', 'trầm cảm', 'căng thẳng', 'giận', 'sợ', 
    'buồn', 'lo lắng', 'mất ngủ', 'tâm lý', 'tinh thần', 'cảm xúc'];
  
  const emotionalConnection = analysis.emotionalConnection;
  const symptoms = analysis.symptoms || [];
  
  // Kiểm tra cảm xúc chính
  if (emotionalConnection?.emotion && 
      emotionalKeywords.some(kw => emotionalConnection.emotion.toLowerCase().includes(kw))) {
    return true;
  }
  
  // Kiểm tra trong triệu chứng
  return symptoms.some(symptom => 
    emotionalKeywords.some(kw => symptom.toLowerCase().includes(kw))
  );
}

/**
 * Kiểm tra triệu chứng cơ xương khớp
 */
function hasMusculoskeletalSymptoms(symptoms: string[]): boolean {
  const keywords = ['đau', 'tê', 'co cứng', 'khớp', 'gân', 'cơ', 'lưng', 'vai', 'cổ', 
    'đầu gối', 'tay chân', 'nhức mỏi', 'chuột rút'];
  return symptoms.some(symptom => 
    keywords.some(kw => symptom.toLowerCase().includes(kw))
  );
}

/**
 * Hàm chính: Đánh giá và mapping dịch vụ phù hợp
 * Theo thứ tự ưu tiên đã định nghĩa ở trên
 */
export function evaluateServiceRecommendations(analysis: AIAnalysisData): {
  herbalMedicine: ServiceRecommendation;
  acupressure: ServiceRecommendation;
  energyNumber: ServiceRecommendation;
} {
  const severity = evaluateSeverity(analysis.prognosis);
  const hasEmotional = hasEmotionalFactor(analysis);
  const hasMusculoskeletal = hasMusculoskeletalSymptoms(analysis.symptoms || []);
  const seasonCompatibility = analysis.prognosis?.seasonalFactor?.compatibility || '';
  const affectedOrgan = analysis.treatmentOrigin?.affectedOrgan || 'cơ thể';
  
  // Khởi tạo mặc định
  const herbalMedicine: ServiceRecommendation = {
    recommended: false,
    priority: 'low',
    reason: '',
    detailedReason: ''
  };
  
  const acupressure: ServiceRecommendation = {
    recommended: false,
    priority: 'low',
    reason: '',
    detailedReason: ''
  };
  
  const energyNumber: ServiceRecommendation = {
    recommended: false,
    priority: 'low',
    reason: '',
    detailedReason: ''
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CASE 1: CẤP TÍNH → Huyệt > Thuốc > Số
  // ═══════════════════════════════════════════════════════════════════════════
  if (severity === 'acute') {
    // Huyệt - Ưu tiên 1
    acupressure.recommended = true;
    acupressure.priority = 'high';
    acupressure.reason = `Cấp tính tại ${affectedOrgan}, châm cứu giúp giảm đau và thông kinh lạc nhanh`;
    acupressure.detailedReason = 'Trong trường hợp cấp tính, châm cứu/bấm huyệt có tác dụng giảm đau nhanh, thông kinh hoạt lạc, giúp khí huyết lưu thông.';
    
    // Thuốc - Ưu tiên 2
    herbalMedicine.recommended = true;
    herbalMedicine.priority = 'medium';
    herbalMedicine.reason = `Hỗ trợ điều trị ${affectedOrgan} bằng thảo dược`;
    herbalMedicine.detailedReason = `Bài thuốc Đông y có thể hỗ trợ điều hòa ${affectedOrgan}, kết hợp với châm cứu để tăng hiệu quả điều trị.`;
    
    // Số - Ưu tiên 3
    energyNumber.recommended = false;
    energyNumber.priority = 'low';
    energyNumber.reason = 'Nên ưu tiên châm cứu và thảo dược trước';
    energyNumber.detailedReason = 'Trong trường hợp cấp tính, nên ưu tiên can thiệp trực tiếp. Tượng Số có thể bổ sung sau khi tình trạng ổn định.';
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CASE 2: NGHỊCH MÙA → Thuốc > Huyệt > Số
  // ═══════════════════════════════════════════════════════════════════════════
  else if (seasonCompatibility.toLowerCase().includes('nghịch')) {
    // Thuốc - Ưu tiên 1
    herbalMedicine.recommended = true;
    herbalMedicine.priority = 'high';
    herbalMedicine.reason = `Nghịch mùa ảnh hưởng ${affectedOrgan}, cần bổ trợ bằng thảo dược`;
    herbalMedicine.detailedReason = `Mùa hiện tại không thuận lợi cho ${affectedOrgan}. Thảo dược giúp bổ khí, điều hòa và tăng cường sức đề kháng.`;
    
    // Huyệt - Ưu tiên 2
    acupressure.recommended = true;
    acupressure.priority = 'medium';
    acupressure.reason = 'Hỗ trợ lưu thông khí huyết trong mùa nghịch';
    acupressure.detailedReason = 'Châm cứu giúp điều hòa khí huyết, hỗ trợ cơ thể thích ứng với thời tiết nghịch mùa.';
    
    // Số - Ưu tiên 3
    energyNumber.recommended = false;
    energyNumber.priority = 'low';
    energyNumber.reason = 'Chưa phù hợp khi nghịch mùa';
    energyNumber.detailedReason = 'Khi nghịch mùa, nên ưu tiên thảo dược và châm cứu để can thiệp trực tiếp trước.';
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CASE 3: CƠ XƯƠNG KHỚP → Huyệt > Thuốc > Số
  // ═══════════════════════════════════════════════════════════════════════════
  else if (hasMusculoskeletal) {
    // Huyệt - Ưu tiên 1
    acupressure.recommended = true;
    acupressure.priority = 'high';
    acupressure.reason = 'Triệu chứng cơ xương khớp, châm cứu là phương pháp hiệu quả nhất';
    acupressure.detailedReason = 'Châm cứu/bấm huyệt có tác dụng trực tiếp lên hệ cơ xương khớp, giảm đau, giảm tê, thông kinh lạc và tăng tuần hoàn.';
    
    // Thuốc - Ưu tiên 2
    herbalMedicine.recommended = true;
    herbalMedicine.priority = 'medium';
    herbalMedicine.reason = `Thảo dược bổ trợ ${affectedOrgan}, tăng hiệu quả châm cứu`;
    herbalMedicine.detailedReason = 'Kết hợp thảo dược với châm cứu giúp bổ khí huyết, nuôi dưỡng gân cơ và tăng cường hiệu quả điều trị.';
    
    // Số - Ưu tiên 3
    energyNumber.recommended = false;
    energyNumber.priority = 'low';
    energyNumber.reason = 'Nên ưu tiên châm cứu cho triệu chứng cơ xương khớp';
    energyNumber.detailedReason = 'Tượng Số có thể hỗ trợ cân bằng năng lượng sau khi các triệu chứng cơ xương khớp đã được cải thiện.';
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CASE 4: CẢM XÚC/STRESS → Số > Huyệt > Thuốc
  // ═══════════════════════════════════════════════════════════════════════════
  else if (hasEmotional) {
    // Số - Ưu tiên 1
    energyNumber.recommended = true;
    energyNumber.priority = 'high';
    energyNumber.reason = `Cảm xúc ảnh hưởng ${affectedOrgan}, Tượng Số giúp cân bằng năng lượng`;
    energyNumber.detailedReason = `Theo Đông y, cảm xúc và tạng phủ có mối liên hệ chặt chẽ. Tượng Số tác động vào trường năng lượng, giúp điều hòa tâm trí và hỗ trợ ${affectedOrgan} hồi phục.`;
    
    // Huyệt - Ưu tiên 2
    acupressure.recommended = true;
    acupressure.priority = 'medium';
    acupressure.reason = 'Châm cứu giúp an thần, giải tỏa căng thẳng';
    acupressure.detailedReason = 'Bấm huyệt các điểm an thần như Nội Quan, Thần Môn giúp ổn định cảm xúc và cải thiện giấc ngủ.';
    
    // Thuốc - Ưu tiên 3
    herbalMedicine.recommended = false;
    herbalMedicine.priority = 'low';
    herbalMedicine.reason = 'Có thể bổ sung sau nếu cần';
    herbalMedicine.detailedReason = 'Thảo dược an thần như Tâm Sen, Hoa Cúc có thể bổ sung khi các phương pháp khác chưa đủ hiệu quả.';
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CASE 5: MÃN TÍNH → Huyệt > Số > Thuốc
  // ═══════════════════════════════════════════════════════════════════════════
  else if (severity === 'chronic') {
    // Huyệt - Ưu tiên 1
    acupressure.recommended = true;
    acupressure.priority = 'high';
    acupressure.reason = `Mãn tính tại ${affectedOrgan}, châm cứu định kỳ giúp điều hòa`;
    acupressure.detailedReason = 'Bệnh mãn tính cần can thiệp đều đặn. Châm cứu định kỳ giúp duy trì khí huyết lưu thông và ngăn ngừa tái phát.';
    
    // Số - Ưu tiên 2
    energyNumber.recommended = true;
    energyNumber.priority = 'medium';
    energyNumber.reason = `Hỗ trợ cân bằng ngũ hành cho ${affectedOrgan} lâu dài`;
    energyNumber.detailedReason = 'Tượng Số là phương pháp nhẹ nhàng, phù hợp cho việc duy trì cân bằng năng lượng hàng ngày và phòng ngừa tái phát.';
    
    // Thuốc - Ưu tiên 3
    herbalMedicine.recommended = false;
    herbalMedicine.priority = 'low';
    herbalMedicine.reason = 'Sử dụng khi cần điều trị đợt cấp';
    herbalMedicine.detailedReason = 'Thảo dược có thể bổ sung trong các đợt bệnh tái phát hoặc khi cần tăng cường điều trị.';
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CASE 6: THUẬN MÙA / PHÒNG NGỪA → Số > Huyệt > Thuốc
  // ═══════════════════════════════════════════════════════════════════════════
  else if (seasonCompatibility.toLowerCase().includes('thuận') || severity === 'preventive') {
    // Số - Ưu tiên 1
    energyNumber.recommended = true;
    energyNumber.priority = 'high';
    energyNumber.reason = 'Thuận mùa, Tượng Số giúp duy trì và tăng cường năng lượng';
    energyNumber.detailedReason = 'Mùa hiện tại thuận lợi cho sức khỏe. Tượng Số giúp duy trì cân bằng năng lượng và tối ưu hóa khả năng tự hồi phục của cơ thể.';
    
    // Huyệt - Ưu tiên 2
    acupressure.recommended = true;
    acupressure.priority = 'medium';
    acupressure.reason = 'Bấm huyệt duy trì sức khỏe định kỳ';
    acupressure.detailedReason = 'Bấm huyệt định kỳ giúp thông kinh lạc, tăng cường tuần hoàn và duy trì sức khỏe tổng quát.';
    
    // Thuốc - Ưu tiên 3
    herbalMedicine.recommended = false;
    herbalMedicine.priority = 'low';
    herbalMedicine.reason = 'Chưa cần thiết khi thuận mùa và phòng ngừa';
    herbalMedicine.detailedReason = 'Khi mùa thuận lợi và mục tiêu là phòng ngừa, nên ưu tiên Tượng Số và bấm huyệt. Thảo dược có thể bổ sung khi cần.';
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CASE MẶC ĐỊNH: Cân bằng
  // ═══════════════════════════════════════════════════════════════════════════
  else {
    acupressure.recommended = true;
    acupressure.priority = 'medium';
    acupressure.reason = 'Duy trì sức khỏe bằng bấm huyệt';
    acupressure.detailedReason = 'Bấm huyệt là phương pháp an toàn, phù hợp cho mọi tình trạng sức khỏe.';
    
    energyNumber.recommended = true;
    energyNumber.priority = 'medium';
    energyNumber.reason = 'Cân bằng năng lượng ngũ hành';
    energyNumber.detailedReason = 'Tượng Số giúp cân bằng và hài hòa năng lượng trong cơ thể.';
    
    herbalMedicine.reason = 'Theo dõi thêm, có thể sử dụng khi cần';
    herbalMedicine.detailedReason = 'Tình trạng hiện tại chưa cần can thiệp bằng thảo dược.';
  }
  
  return { herbalMedicine, acupressure, energyNumber };
}

/**
 * Mapping từ tên tạng (tiếng Việt) sang số quẻ
 * Dùng để ánh xạ kết quả AI chẩn đoán → Tượng Số
 */
const ORGAN_TO_GUA: Record<string, number> = {
  // Tạng chính
  'Gan': 4,      // Can = Chấn
  'Can': 4,
  'Tim': 3,      // Tâm = Ly
  'Tâm': 3,
  'Tỳ': 8,       // Tỳ = Khôn
  'Lách': 8,
  'Phổi': 2,     // Phế = Đoài
  'Phế': 2,
  'Thận': 6,     // Thận = Khảm
  // Phủ
  'Đởm': 5,      // Đởm = Tốn
  'Túi mật': 5,
  'Ruột non': 3, // Tiểu tràng liên hệ Tâm
  'Tiểu tràng': 3,
  'Dạ dày': 7,   // Vị = Cấn
  'Vị': 7,
  'Đại tràng': 1, // Đại tràng = Càn
  'Ruột già': 1,
  'Bàng quang': 6, // Bàng quang liên hệ Thận
  // Bộ phận cơ thể
  'Đầu': 1,
  'Mắt': 3,
  'Tai': 6,
  'Miệng': 2,
  'Bụng': 8,
  'Tay': 7,
  'Chân': 4,
  'Đùi': 5,
  'Lưng': 6,
};

/**
 * Từ tạng bệnh (AI chẩn đoán) → Sinh ra Tượng Số phù hợp
 * Logic: Tìm quẻ tương ứng với tạng → Lấy công thức Tượng Số
 */
export function generateTuongSoFromDiagnosis(affectedOrgan: string): {
  guaNumber: number;
  guaName: string;
  formula: string;
  element: string;
  explanation: string;
  usage: string;
  balancingFormula: string;
  motherOrgan: string;
} | null {
  // Tìm số quẻ từ tạng bệnh
  let guaNumber: number | undefined;
  
  // Tìm chính xác
  for (const [organ, gua] of Object.entries(ORGAN_TO_GUA)) {
    if (affectedOrgan.toLowerCase().includes(organ.toLowerCase())) {
      guaNumber = gua;
      break;
    }
  }
  
  // Nếu không tìm thấy, thử tìm trong BAT_QUAI
  if (!guaNumber) {
    for (const [num, gua] of Object.entries(BAT_QUAI)) {
      if (affectedOrgan.toLowerCase().includes(gua.organ.toLowerCase())) {
        guaNumber = parseInt(num);
        break;
      }
    }
  }
  
  if (!guaNumber) {
    return null;
  }
  
  const gua = BAT_QUAI[guaNumber as keyof typeof BAT_QUAI];
  const formulaData = TUONG_SO_FORMULAS[guaNumber];
  
  // Tìm tạng mẹ (tạng sinh ra hành của tạng bệnh)
  const element = gua.element as keyof typeof NGU_HANH;
  const nguHanh = NGU_HANH[element];
  const motherElement = nguHanh.duocSinh; // Hành sinh ra hành hiện tại
  
  // Tìm tạng có hành mẹ
  let motherOrgan = '';
  for (const [, g] of Object.entries(BAT_QUAI)) {
    if (g.element === motherElement || (motherElement === 'Hỏa' && g.element === 'Hoa')) {
      motherOrgan = g.organ;
      break;
    }
  }
  
  // Tạo công thức cân bằng: Bổ tạng mẹ để sinh tạng con (tạng bệnh)
  const motherGuaNum = ORGAN_TO_GUA[motherOrgan] || 1;
  const balancingFormula = `${motherGuaNum}0.${guaNumber}0`;
  
  return {
    guaNumber,
    guaName: gua.name,
    formula: formulaData.formula,
    element: gua.element,
    explanation: `${gua.name} (${gua.element}) - ${formulaData.description}`,
    usage: formulaData.usage,
    balancingFormula,
    motherOrgan,
  };
}

/**
 * Tính toán ngũ hành tương sinh/tương khắc
 */
export function calculateElementRelation(element1: string, element2: string): {
  relation: 'sinh' | 'khac' | 'biKhac' | 'duocSinh' | 'neutral';
  description: string;
} {
  const e1 = element1 as keyof typeof NGU_HANH;
  const e2 = element2 as keyof typeof NGU_HANH;
  
  if (!NGU_HANH[e1] || !NGU_HANH[e2]) {
    return { relation: 'neutral', description: 'Không xác định quan hệ' };
  }
  
  const nguHanh1 = NGU_HANH[e1];
  
  if (nguHanh1.sinh === e2 || (e2 === 'Hoa' && nguHanh1.sinh === 'Hỏa')) {
    return { relation: 'sinh', description: `${element1} sinh ${element2} - Hỗ trợ tích cực` };
  }
  if (nguHanh1.khac === e2) {
    return { relation: 'khac', description: `${element1} khắc ${element2} - Cần điều hòa` };
  }
  if (nguHanh1.biKhac === e2 || (e2 === 'Hoa' && nguHanh1.biKhac === 'Hỏa')) {
    return { relation: 'biKhac', description: `${element1} bị ${element2} khắc - Cần bổ sung` };
  }
  if (nguHanh1.duocSinh === e2) {
    return { relation: 'duocSinh', description: `${element1} được ${element2} sinh - Năng lượng tốt` };
  }
  
  return { relation: 'neutral', description: 'Quan hệ trung tính' };
}
