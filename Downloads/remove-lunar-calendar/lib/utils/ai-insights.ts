import type { MaiHuaResult } from './maihua-engine';
import type { DiagnosticResult } from './diagnostic-engine';

interface PatientContext {
  age: number;
  gender: string;
  subject: string;
  question: string;
}

interface AIInsights {
  summary: string;
  explanation: string;
  relevantSymptoms: string[];
  recommendations: string[];
  cautionNote?: string;
}

/**
 * Tạo insights từ kết quả chẩn đoán (Placeholder cho AI sau này)
 * Hiện tại sử dụng rule-based logic để tạo nội dung dễ hiểu
 */
export function generateAIInsights(
  maihua: MaiHuaResult,
  diagnostic: DiagnosticResult,
  context: PatientContext
): AIInsights {
  const { mapping, expertAnalysis } = diagnostic;
  const { question, gender, age } = context;
  
  // Phân tích câu hỏi để lọc bệnh lý liên quan
  const questionLower = question.toLowerCase();
  const isHeadache = questionLower.includes('đau đầu') || questionLower.includes('đau nửa đầu');
  const isDigestive = questionLower.includes('đau bụng') || questionLower.includes('tiêu hóa');
  const isRespiratory = questionLower.includes('ho') || questionLower.includes('khó thở');
  
  // Tạo tóm tắt dựa trên mức độ nghiêm trọng
  let summary = '';
  if (expertAnalysis.tiDung.severity === 'nặng') {
    summary = `Quẻ cho thấy tình trạng sức khỏe cần được quan tâm đặc biệt. Có dấu hiệu mất cân bằng năng lượng trong cơ thể.`;
  } else if (expertAnalysis.tiDung.severity === 'nhẹ') {
    summary = `Quẻ cho thấy tình trạng sức khỏe tương đối ổn định. Cơ thể đang trong giai đoạn tự phục hồi.`;
  } else {
    summary = `Quẻ cho thấy tình trạng sức khỏe đang ở trạng thái cân bằng. Cần theo dõi để duy trì.`;
  }
  
  // Giải thích mối liên hệ với câu hỏi
  let explanation = '';
  const upperOrgan = mapping.upperTrigram.primaryOrgans.join(', ');
  const lowerOrgan = mapping.lowerTrigram.primaryOrgans.join(', ');
  const yaoLevel = mapping.movingYao.bodyLevel;
  
  if (isHeadache) {
    explanation = `Triệu chứng đau đầu của bạn có thể liên quan đến hệ thống ${upperOrgan.includes('Gan') ? 'Can (Gan)' : upperOrgan}. Trong y học cổ truyền, ${upperOrgan} ảnh hưởng trực tiếp đến vùng đầu và ngũ quan. Hào động ở ${yaoLevel.toLowerCase()} cho thấy vấn đề tập trung ở vùng ${mapping.movingYao.anatomy.slice(0, 3).join(', ')}.`;
  } else {
    explanation = `Dựa trên quẻ tượng, hệ thống ${upperOrgan} và ${lowerOrgan} đang cần được chú ý. Hào động ở ${yaoLevel.toLowerCase()} cho thấy vấn đề có thể liên quan đến ${mapping.movingYao.anatomy.slice(0, 2).join(', ')}.`;
  }
  
  // Lọc triệu chứng liên quan
  let relevantSymptoms: string[] = [];
  if (isHeadache) {
    relevantSymptoms = mapping.relatedDiseases.filter(d => 
      d.includes('đầu') || d.includes('thần kinh') || d.includes('cao huyết áp')
    ).slice(0, 4);
  } else if (isDigestive) {
    relevantSymptoms = mapping.relatedDiseases.filter(d =>
      d.includes('dạ dày') || d.includes('tiêu hóa') || d.includes('gan')
    ).slice(0, 4);
  } else {
    relevantSymptoms = mapping.relatedDiseases.slice(0, 4);
  }
  
  if (relevantSymptoms.length === 0) {
    relevantSymptoms = ['Cần theo dõi tình trạng sức khỏe tổng quát'];
  }
  
  // Khuyến nghị cụ thể
  const recommendations: string[] = [];
  
  // Dựa vào nguyên tố
  if (mapping.upperTrigram.element === 'Mộc' || mapping.lowerTrigram.element === 'Mộc') {
    recommendations.push('Tránh thức khuya, đảm bảo ngủ đủ giấc từ 23h-3h (giờ Can - Đảm hoạt động)');
    recommendations.push('Hạn chế đồ cay, nóng, rượu bia để giảm Can hỏa');
  }
  
  if (mapping.upperTrigram.element === 'Hỏa' || mapping.lowerTrigram.element === 'Hỏa') {
    recommendations.push('Ăn nhiều rau xanh, uống đủ nước để thanh nhiệt');
    recommendations.push('Tránh căng thẳng, stress');
  }
  
  if (mapping.upperTrigram.element === 'Thủy' || mapping.lowerTrigram.element === 'Thủy') {
    recommendations.push('Giữ ấm cơ thể, tránh lạnh');
    recommendations.push('Bổ sung thực phẩm bổ thận như hạt, các loại đậu');
  }
  
  // Khuyến nghị chung
  recommendations.push('Duy trì chế độ ăn uống cân bằng, tập luyện vừa phải');
  recommendations.push('Khám sức khỏe định kỳ để phát hiện sớm các vấn đề');
  
  // Cảnh báo nếu cần
  let cautionNote: string | undefined;
  if (expertAnalysis.diseaseFlags.isCritical) {
    cautionNote = 'Nên đi khám bác sĩ càng sớm càng tốt để được chẩn đoán chính xác và điều trị kịp thời.';
  } else if (expertAnalysis.tiDung.severity === 'nặng') {
    cautionNote = 'Nên tham khảo ý kiến bác sĩ để có phương pháp điều trị phù hợp.';
  }
  
  return {
    summary,
    explanation,
    relevantSymptoms,
    recommendations: recommendations.slice(0, 4),
    cautionNote
  };
}
