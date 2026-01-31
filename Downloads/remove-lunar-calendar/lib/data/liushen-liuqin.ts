/**
 * Thư viện Lục Thần & Lục Thân (Six Spirits & Six Relations)
 * Lưu trữ ý nghĩa định tính của các đại diện năng lượng
 */

export interface LiuShen {
  id: string
  name: string
  chineseName: string
  nature: string
  medicalMeaning: string
  diseases: string[]
  symptoms: string[]
  psychology: string
  treatment: string
}

export interface LiuQin {
  id: string
  name: string
  chineseName: string
  nature: string
  medicalMeaning: string
  bodyParts: string[]
  energy: string
  functions: string[]
}

/**
 * LỤC THẦN (六神) - Six Spirits
 * Xác định tính chất bệnh lý
 */
export const LIUSHEN_LIBRARY: LiuShen[] = [
  {
    id: 'qinglong',
    name: 'Thanh Long',
    chineseName: '青龍',
    nature: 'Mộc - Xuân - Đông',
    medicalMeaning: 'Đại diện cho sinh khí, phát triển, hồi phục',
    diseases: [
      'Bệnh lý gan mật',
      'Rối loạn thần kinh',
      'Bệnh về mắt'
    ],
    symptoms: [
      'Phát triển u bướu nhanh',
      'Co giật thần kinh',
      'Mất ngủ, mơ mộng'
    ],
    psychology: 'Lo lắng, căng thẳng tinh thần, suy nghĩ nhiều',
    treatment: 'Cần dưỡng gan, an thần, thư giãn tinh thần'
  },
  {
    id: 'zhuque',
    name: 'Chu Tước',
    chineseName: '朱雀',
    nature: 'Hỏa - Hạ - Nam',
    medicalMeaning: 'Đại diện cho viêm nhiễm, nóng trong, tâm hỏa',
    diseases: [
      'Viêm nhiễm cấp tính',
      'Bệnh tim mạch',
      'Sốt cao',
      'Rối loạn tâm thần'
    ],
    symptoms: [
      'Sốt, nóng trong người',
      'Viêm họng, loét miệng',
      'Hồi hộp, tim đập nhanh',
      'Mất ngủ, ác mộng'
    ],
    psychology: 'Bồn chồn, dễ nổi nóng, tranh cãi, bất an',
    treatment: 'Thanh nhiệt, giải độc, an thần dưỡng tâm'
  },
  {
    id: 'gouchen',
    name: 'Câu Trần',
    chineseName: '勾陳',
    nature: 'Thổ - Trung tâm',
    medicalMeaning: 'Đại diện cho khối u, bướu, ung thư, bệnh mãn tính',
    diseases: [
      'U bướu, ung thư',
      'Bệnh tỳ vị mãn tính',
      'Xơ hóa, cứng khớp',
      'Tắc nghẽn'
    ],
    symptoms: [
      'Khối u cứng, phát triển chậm',
      'Đầy bụng, khó tiêu kéo dài',
      'Cứng khớp, khó vận động',
      'Táo bón, ứ đọng'
    ],
    psychology: 'Bế tắc, ám ảnh, suy nghĩ tiêu cực lặp đi lặp lại',
    treatment: 'Hóa ứ, tiêu tán, lưu thông kinh lạc'
  },
  {
    id: 'tengshe',
    name: 'Đằng Xà',
    chineseName: '騰蛇',
    nature: 'Hỏa - Biến động',
    medicalMeaning: 'Đại diện cho bệnh quái, tinh thần, giật mình, sợ hãi',
    diseases: [
      'Rối loạn tâm thần',
      'Động kinh',
      'Mê tín',
      'Bệnh lạ, khó chẩn đoán'
    ],
    symptoms: [
      'Giật mình dễ dàng',
      'Ảo giác, hoang tưởng',
      'Sợ hãi vô cớ',
      'Triệu chứng đa dạng, thay đổi'
    ],
    psychology: 'Lo âu quá mức, sợ hãi, nghi ngờ, thiếu an toàn',
    treatment: 'Trấn tĩnh, an thần, ổn định tinh thần'
  },
  {
    id: 'baihu',
    name: 'Bạch Hổ',
    chineseName: '白虎',
    nature: 'Kim - Thu - Tây',
    medicalMeaning: 'Đại diện cho máu huyết, ngoại thương, phẫu thuật, đau đớn',
    diseases: [
      'Chấn thương ngoại khoa',
      'Xuất huyết',
      'Bệnh máu',
      'Đau cấp tính'
    ],
    symptoms: [
      'Chảy máu (cam, tiêu hóa, phụ khoa)',
      'Đau đớn dữ dội',
      'Vết thương khó lành',
      'Cần phẫu thuật'
    ],
    psychology: 'Hung hãn, bạo lực, tức giận, mất kiểm soát',
    treatment: 'Cầm máu, chỉ thống, kháng viêm, cẩn trọng phẫu thuật'
  },
  {
    id: 'xuanwu',
    name: 'Huyền Vũ',
    chineseName: '玄武',
    nature: 'Thủy - Đông - Bắc',
    medicalMeaning: 'Đại diện cho bệnh âm, mãn tính, ẩn náu, độc tố',
    diseases: [
      'Bệnh thận, tiết niệu',
      'Bệnh sinh dục',
      'Độc tố tích tụ',
      'Bệnh ẩn, khó phát hiện'
    ],
    symptoms: [
      'Mệt mỏi kéo dài',
      'Đau lưng âm ỉ',
      'Tiểu không thông',
      'Triệu chứng mơ hồ'
    ],
    psychology: 'Trầm cảm, bi quan, giấu giếm, bí mật',
    treatment: 'Bổ thận, giải độc, tăng cường miễn dịch'
  }
]

/**
 * LỤC THÂN (六親) - Six Relations
 * Thể hiện mối quan hệ năng lượng trong cơ thể
 */
export const LIUQIN_LIBRARY: LiuQin[] = [
  {
    id: 'fumu',
    name: 'Phụ Mẫu',
    chineseName: '父母',
    nature: 'Sinh - Nuôi dưỡng - Bảo vệ',
    medicalMeaning: 'Nguyên khí, hệ thống bảo vệ, đầu và bụng',
    bodyParts: ['Đầu', 'Não', 'Ngực', 'Tỳ vị', 'Phổi'],
    energy: 'Nguồn gốc sinh mệnh, bảo vệ cơ thể',
    functions: [
      'Miễn dịch',
      'Hô hấp',
      'Tiêu hóa thức ăn',
      'Tư duy và nhận thức'
    ]
  },
  {
    id: 'xiongdi',
    name: 'Huynh Đệ',
    chineseName: '兄弟',
    nature: 'Đồng - Cạnh tranh - Hỗ trợ',
    medicalMeaning: 'Khí huyết, tứ chi, cơ bắp',
    bodyParts: ['Tay', 'Chân', 'Cơ bắp', 'Xương khớp'],
    energy: 'Sức mạnh thể chất, vận động',
    functions: [
      'Hoạt động vận động',
      'Sức mạnh cơ bắp',
      'Tuần hoàn ngoại vi',
      'Khả năng lao động'
    ]
  },
  {
    id: 'zisun',
    name: 'Tử Tôn',
    chineseName: '子孫',
    nature: 'Diễn - Phát triển - Tương lai',
    medicalMeaning: 'Y dược thần, đường hô hấp, sinh sản',
    bodyParts: ['Khí quản', 'Phế', 'Sinh dục', 'Ruột'],
    energy: 'Khả năng tự phục hồi, đáp ứng thuốc',
    functions: [
      'Hô hấp',
      'Sinh sản',
      'Đào thải',
      'Phản ứng với điều trị'
    ]
  },
  {
    id: 'qicai',
    name: 'Thê Tài',
    chineseName: '妻財',
    nature: 'Dưỡng - Nuôi sống - Vật chất',
    medicalMeaning: 'Tinh huyết, dưỡng chất, tài nguyên cơ thể',
    bodyParts: ['Máu', 'Tủy', 'Tỳ', 'Thận', 'Gan'],
    energy: 'Nguồn dinh dưỡng, dự trữ năng lượng',
    functions: [
      'Tạo máu',
      'Dự trữ dinh dưỡng',
      'Cung cấp năng lượng',
      'Nuôi dưỡng cơ thể'
    ]
  },
  {
    id: 'guangui',
    name: 'Quan Quỷ',
    chineseName: '官鬼',
    nature: 'Khắc - Bệnh lý - Tà khí',
    medicalMeaning: 'Bệnh tật, tà khí, virus, vi khuẩn',
    bodyParts: ['Nơi bị bệnh', 'Điểm yếu cơ thể'],
    energy: 'Nguồn gốc bệnh tật, tà khí xâm nhập',
    functions: [
      'Chỉ ra nguyên nhân bệnh',
      'Vị trí bệnh tật',
      'Mức độ nghiêm trọng',
      'Loại bệnh (ngoại/nội cảm)'
    ]
  }
]

/**
 * Helper functions
 */
export function getLiuShenById(id: string): LiuShen | undefined {
  return LIUSHEN_LIBRARY.find(spirit => spirit.id === id)
}

export function getLiuQinById(id: string): LiuQin | undefined {
  return LIUQIN_LIBRARY.find(relation => relation.id === id)
}

export function getLiuShenByDisease(disease: string): LiuShen[] {
  return LIUSHEN_LIBRARY.filter(spirit =>
    spirit.diseases.some(d => d.includes(disease))
  )
}
