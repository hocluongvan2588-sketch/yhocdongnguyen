/**
 * Hệ thống Hào vị Chi tiết (Yao Position System)
 * 6 hào tương ứng với các tầng cơ thể từ chân đến đầu
 */

export interface YaoPosition {
  position: number
  name: string
  chineseName: string
  bodyLevel: string
  anatomy: string[]
  organs: string[]
  diseases: string[]
  yinYang: 'Yin' | 'Yang'
  importance: string
  clinicalSignificance: string
}

export const YAO_SYSTEM: YaoPosition[] = [
  {
    position: 1,
    name: 'Sơ Hào',
    chineseName: '初爻',
    bodyLevel: 'Tầng dưới - Chân đất',
    anatomy: ['Bàn chân', 'Mắt cá chân', 'Cẳng chân'],
    organs: ['Xương chân', 'Khớp cổ chân', 'Bàng quang (phần dưới)'],
    diseases: [
      'Đau nhức chân',
      'Viêm khớp cổ chân',
      'Gout',
      'Phù chân',
      'Suy giãn tĩnh mạch'
    ],
    yinYang: 'Yang',
    importance: 'Nền tảng, khởi đầu',
    clinicalSignificance: 'Bệnh mới phát, triệu chứng nhẹ, bệnh ngoại cảm giai đoạn đầu'
  },
  {
    position: 2,
    name: 'Nhị Hào',
    chineseName: '二爻',
    bodyLevel: 'Tầng dưới - Đùi',
    anatomy: ['Đùi', 'Khớp háng', 'Sinh dục'],
    organs: ['Thận', 'Bàng quang', 'Tử cung', 'Tiền liệt tuyến'],
    diseases: [
      'Bệnh thận',
      'Viêm bàng quang',
      'Bệnh phụ khoa',
      'Bệnh tiền liệt tuyến',
      'Sỏi thận',
      'Rối loạn sinh dục'
    ],
    yinYang: 'Yin',
    importance: 'Cốt lõi dưới',
    clinicalSignificance: 'Bệnh lý thận, sinh dục, tiết niệu; bệnh mãn tính đã vào sâu'
  },
  {
    position: 3,
    name: 'Tam Hào',
    chineseName: '三爻',
    bodyLevel: 'Tầng giữa - Bụng',
    anatomy: ['Bụng', 'Lưng dưới', 'Hông'],
    organs: ['Dạ dày', 'Tỳ', 'Đại tràng', 'Ruột non', 'Gan'],
    diseases: [
      'Viêm dạ dày',
      'Loét dạ dày tá tràng',
      'Viêm đại tràng',
      'Viêm gan',
      'Bệnh tỳ vị',
      'Táo bón',
      'Tiêu chảy'
    ],
    yinYang: 'Yang',
    importance: 'Trung tâm tiêu hóa',
    clinicalSignificance: 'Bệnh tiêu hóa, gan mật; ranh giới giữa nội và ngoại'
  },
  {
    position: 4,
    name: 'Tứ Hào',
    chineseName: '四爻',
    bodyLevel: 'Tầng giữa - Ngực',
    anatomy: ['Ngực', 'Vú', 'Lưng giữa'],
    organs: ['Phổi', 'Tim', 'Vú', 'Dạ dày (phần trên)'],
    diseases: [
      'Bệnh phổi',
      'Hen suyễn',
      'Viêm phế quản',
      'Bệnh tim',
      'U vú',
      'Đau ngực'
    ],
    yinYang: 'Yin',
    importance: 'Cốt lõi trên',
    clinicalSignificance: 'Bệnh tim phổi, tuần hoàn; bệnh nội tạng quan trọng'
  },
  {
    position: 5,
    name: 'Ngũ Hào',
    chineseName: '五爻',
    bodyLevel: 'Tầng trên - Ngũ quan',
    anatomy: ['Cổ', 'Họng', 'Miệng', 'Mũi', 'Mắt', 'Tai'],
    organs: ['Họng', 'Thanh quản', 'Giáp', 'Amidan'],
    diseases: [
      'Viêm họng',
      'Viêm amidan',
      'Bệnh giáp',
      'Viêm tai',
      'Viêm xoang',
      'Bệnh về mắt',
      'Rối loạn giọng nói'
    ],
    yinYang: 'Yang',
    importance: 'Vị tôn, quan trọng',
    clinicalSignificance: 'Bệnh ngũ quan, đầu mặt; bệnh cấp tính biểu hiện rõ'
  },
  {
    position: 6,
    name: 'Thượng Hào',
    chineseName: '上爻',
    bodyLevel: 'Tầng trên - Đầu não',
    anatomy: ['Đầu', 'Não', 'Mặt'],
    organs: ['Não', 'Hệ thần kinh trung ương'],
    diseases: [
      'Đau đầu',
      'Chóng mặt',
      'Đột quỵ',
      'Rối loạn thần kinh',
      'Bệnh Alzheimer',
      'Động kinh',
      'Tăng áp lực nội sọ'
    ],
    yinYang: 'Yin',
    importance: 'Tối cao, nhưng dễ quá mức',
    clinicalSignificance: 'Bệnh não bộ, thần kinh; bệnh giai đoạn cuối, nguy hiểm'
  }
]

/**
 * Helper: Lấy hào theo vị trí
 */
export function getYaoByPosition(position: number): YaoPosition | undefined {
  return YAO_SYSTEM.find(yao => yao.position === position)
}

/**
 * Helper: Tìm hào liên quan đến cơ quan
 */
export function getYaoByOrgan(organ: string): YaoPosition[] {
  return YAO_SYSTEM.filter(yao =>
    yao.organs.some(o => o.includes(organ)) ||
    yao.anatomy.some(a => a.includes(organ))
  )
}

/**
 * Helper: Phân tích bệnh theo hào
 */
export function analyzeDiseaseByYao(disease: string): YaoPosition[] {
  return YAO_SYSTEM.filter(yao =>
    yao.diseases.some(d => d.toLowerCase().includes(disease.toLowerCase()))
  )
}

/**
 * Phân tích tầng cơ thể theo quẻ 6 hào
 */
export interface HexagramYaoAnalysis {
  hexagramName: string
  yaoAnalysis: {
    position: number
    yaoData: YaoPosition
    status: 'healthy' | 'warning' | 'sick'
    note: string
  }[]
}

/**
 * Helper: Tạo phân tích tổng quát cho 6 hào trong một quẻ
 */
export function createHexagramYaoAnalysis(
  hexagramName: string,
  affectedPositions: number[]
): HexagramYaoAnalysis {
  return {
    hexagramName,
    yaoAnalysis: YAO_SYSTEM.map(yao => ({
      position: yao.position,
      yaoData: yao,
      status: affectedPositions.includes(yao.position) ? 'sick' : 'healthy',
      note: affectedPositions.includes(yao.position)
        ? `Có triệu chứng bệnh ở ${yao.bodyLevel}`
        : `Bình thường`
    }))
  }
}
