/**
 * Ma trận Đối ứng Bát Quái (Eight Trigrams Matrix)
 * Ánh xạ 8 quẻ đơn với các bộ phận cơ thể, nguyên tố và bệnh lý
 */

export interface BaguaTrigram {
  id: string
  name: string
  chineseName: string
  symbol: string
  element: string
  elementChinese: string
  nature: string
  direction: string
  season: string
  anatomy: string[]
  primaryOrgans: string[]
  relatedSymptoms: string[]
  primaryDiseases: string[]
  personality: string
  yinYang: 'Yang' | 'Yin'
  familyPosition: string
}

export const BAGUA_MATRIX: BaguaTrigram[] = [
  {
    id: 'qian',
    name: 'Càn',
    chineseName: '乾',
    symbol: '☰',
    element: 'Kim',
    elementChinese: '金',
    nature: 'Trời, cứng rắn, sáng tạo',
    direction: 'Tây Bắc',
    season: 'Thu - Đông',
    anatomy: ['Đầu', 'Xương', 'Phổi', 'Đại tràng'],
    primaryOrgans: ['Phổi', 'Đại tràng'],
    relatedSymptoms: ['Đau đầu', 'Chóng mặt', 'Khó thở', 'Ho khan'],
    primaryDiseases: [
      'Cao huyết áp',
      'Đau nửa đầu',
      'Bệnh hô hấp',
      'Viêm xoang',
      'Loãng xương',
      'Gai cột sống',
      'Viêm đại tràng'
    ],
    personality: 'Cương quyết, chủ động, lãnh đạo',
    yinYang: 'Yang',
    familyPosition: 'Phụ thân (Cha)'
  },
  {
    id: 'kun',
    name: 'Khôn',
    chineseName: '坤',
    symbol: '☷',
    element: 'Thổ',
    elementChinese: '土',
    nature: 'Đất, nhu nhược, nuôi dưỡng',
    direction: 'Tây Nam',
    season: 'Cuối hạ - Đầu thu',
    anatomy: ['Bụng', 'Dạ dày', 'Lá lách', 'Tử cung', 'Da'],
    primaryOrgans: ['Tỳ', 'Vị', 'Tử cung'],
    relatedSymptoms: ['Đầy bụng', 'Khó tiêu', 'Buồn nôn', 'Mệt mỏi'],
    primaryDiseases: [
      'Viêm loét dạ dày',
      'Yếu tỳ vị',
      'Tiêu chảy mãn tính',
      'Bệnh phụ khoa',
      'U xơ tử cung',
      'Bệnh da liễu',
      'Chán ăn'
    ],
    personality: 'Hiền lành, chịu đựng, nuôi dưỡng',
    yinYang: 'Yin',
    familyPosition: 'Mẫu thân (Mẹ)'
  },
  {
    id: 'zhen',
    name: 'Chấn',
    chineseName: '震',
    symbol: '☳',
    element: 'Mộc',
    elementChinese: '木',
    nature: 'Sấm, chấn động, khởi đầu',
    direction: 'Đông',
    season: 'Xuân',
    anatomy: ['Gan', 'Mật', 'Bàn chân', 'Thần kinh', 'Cơ'],
    primaryOrgans: ['Gan', 'Túi mật'],
    relatedSymptoms: ['Dễ nổi giận', 'Mất ngủ', 'Co giật', 'Đau cơ'],
    primaryDiseases: [
      'Viêm gan',
      'Mật ứ đọng',
      'Sỏi mật',
      'Rối loạn thần kinh',
      'Động kinh',
      'Co cứng cơ',
      'Suy nhược thần kinh'
    ],
    personality: 'Năng động, hăng hái, bốc đồng',
    yinYang: 'Yang',
    familyPosition: 'Trưởng nam (Con trai cả)'
  },
  {
    id: 'xun',
    name: 'Tốn',
    chineseName: '巽',
    symbol: '☴',
    element: 'Mộc',
    elementChinese: '木',
    nature: 'Gió, thâm nhập, linh hoạt',
    direction: 'Đông Nam',
    season: 'Xuân - Hạ',
    anatomy: ['Cổ', 'Họng', 'Khí quản', 'Thần kinh tự chủ', 'Mông đùi'],
    primaryOrgans: ['Gan', 'Túi mật', 'Khí quản'],
    relatedSymptoms: ['Nghẹt thở', 'Ho có đờm', 'Đau cổ', 'Lo âu'],
    primaryDiseases: [
      'Hen suyễn',
      'Viêm khí phế quản',
      'Bệnh cổ vai gáy',
      'Rối loạn lo âu',
      'Viêm xoang mãn tính',
      'Dị ứng đường hô hấp'
    ],
    personality: 'Mềm mỏng, khéo léo, dao động',
    yinYang: 'Yin',
    familyPosition: 'Trưởng nữ (Con gái cả)'
  },
  {
    id: 'kan',
    name: 'Khảm',
    chineseName: '坎',
    symbol: '☵',
    element: 'Thủy',
    elementChinese: '水',
    nature: 'Nước, hiểm trở, lưu chuyển',
    direction: 'Bắc',
    season: 'Đông',
    anatomy: ['Thận', 'Bàng quang', 'Tai', 'Sinh dục', 'Máu', 'Tủy'],
    primaryOrgans: ['Thận', 'Bàng quang'],
    relatedSymptoms: ['Mệt mỏi', 'Đau lưng', 'Ù tai', 'Tiểu nhiều'],
    primaryDiseases: [
      'Suy thận',
      'Viêm bàng quang',
      'Tiểu đường',
      'Sỏi thận',
      'Rối loạn sinh dục',
      'Ù tai - Điếc',
      'Thiếu máu',
      'Loãng xương'
    ],
    personality: 'Thận trọng, bền bỉ, ẩn sâu',
    yinYang: 'Yang',
    familyPosition: 'Trung nam (Con trai giữa)'
  },
  {
    id: 'li',
    name: 'Ly',
    chineseName: '離',
    symbol: '☲',
    element: 'Hỏa',
    elementChinese: '火',
    nature: 'Lửa, sáng sủa, bừng cháy',
    direction: 'Nam',
    season: 'Hạ',
    anatomy: ['Tim', 'Ruột non', 'Mắt', 'Mạch máu', 'Lưỡi'],
    primaryOrgans: ['Tim', 'Ruột non'],
    relatedSymptoms: ['Hồi hộp', 'Mất ngủ', 'Mờ mắt', 'Nóng trong người'],
    primaryDiseases: [
      'Bệnh tim mạch',
      'Cao huyết áp',
      'Loạn nhịp tim',
      'Thiếu máu não',
      'Viêm ruột non',
      'Bệnh về mắt',
      'Rối loạn tuần hoàn'
    ],
    personality: 'Nhiệt tình, rõ ràng, cảm xúc',
    yinYang: 'Yin',
    familyPosition: 'Trung nữ (Con gái giữa)'
  },
  {
    id: 'gen',
    name: 'Cấn',
    chineseName: '艮',
    symbol: '☶',
    element: 'Thổ',
    elementChinese: '土',
    nature: 'Núi, trầm tĩnh, dừng lại',
    direction: 'Đông Bắc',
    season: 'Đông - Xuân',
    anatomy: ['Lưng', 'Xương sống', 'Mũi', 'Ngón tay', 'Khớp'],
    primaryOrgans: ['Tỳ', 'Vị', 'Xương'],
    relatedSymptoms: ['Đau lưng', 'Viêm mũi', 'Cứng khớp', 'Khó vận động'],
    primaryDiseases: [
      'Thoát vị đĩa đệm',
      'Đau cột sống',
      'Viêm xoang',
      'Viêm khớp',
      'Thoái hóa khớp',
      'Gout',
      'Loãng xương'
    ],
    personality: 'Vững chãi, kiên định, chậm rãi',
    yinYang: 'Yang',
    familyPosition: 'Thiếu nam (Con trai út)'
  },
  {
    id: 'dui',
    name: 'Đoài',
    chineseName: '兌',
    symbol: '☱',
    element: 'Kim',
    elementChinese: '金',
    nature: 'Đầm lầy, vui vẻ, giao tiếp',
    direction: 'Tây',
    season: 'Thu',
    anatomy: ['Miệng', 'Răng', 'Lưỡi', 'Cổ họng', 'Phổi'],
    primaryOrgans: ['Phổi', 'Đại tràng'],
    relatedSymptoms: ['Đau họng', 'Ho', 'Răng nhức', 'Khàn tiếng'],
    primaryDiseases: [
      'Viêm họng',
      'Viêm amidan',
      'Sâu răng',
      'Viêm lợi',
      'Viêm phổi',
      'Ho lao',
      'Bệnh đường hô hấp'
    ],
    personality: 'Vui vẻ, hòa đồng, hùng biện',
    yinYang: 'Yin',
    familyPosition: 'Thiếu nữ (Con gái út)'
  }
]

/**
 * Helper function: Tìm quẻ theo ID
 */
export function getBaguaById(id: string): BaguaTrigram | undefined {
  return BAGUA_MATRIX.find(trigram => trigram.id === id)
}

/**
 * Helper function: Tìm quẻ theo nguyên tố
 */
export function getBaguaByElement(element: string): BaguaTrigram[] {
  return BAGUA_MATRIX.filter(trigram => trigram.element === element)
}

/**
 * Helper function: Tìm quẻ liên quan đến cơ quan
 */
export function getBaguaByOrgan(organ: string): BaguaTrigram[] {
  return BAGUA_MATRIX.filter(trigram => 
    trigram.primaryOrgans.some(o => o.includes(organ)) ||
    trigram.anatomy.some(a => a.includes(organ))
  )
}
