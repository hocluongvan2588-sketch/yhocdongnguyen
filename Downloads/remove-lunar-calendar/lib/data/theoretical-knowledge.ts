/**
 * Cơ sở Lý luận và Kiến thức Nền tảng
 * Mai Hoa Dịch Số - Hệ thống Chẩn đoán Sức khỏe
 * 
 * File này tổng hợp các kiến thức lý thuyết cốt lõi từ tài liệu nghiên cứu
 * "Kiến trúc Hệ thống và Cơ sở Lý luận trong Xây dựng Website Chẩn đoán Sức khỏe qua Mai Hoa Dịch Số"
 */

export interface TheoreticalFoundation {
  id: string;
  category: string;
  title: string;
  description: string;
  keyPrinciples: string[];
  applications: string[];
  references: string[];
}

/**
 * 1. NỀN TẢNG TRIẾT HỌC VÀ LỊCH SỬ
 */
export const philosophicalFoundation: TheoreticalFoundation = {
  id: 'philosophical-foundation',
  category: 'Nền tảng Triết học',
  title: 'Mai Hoa Dịch Số - Nguồn gốc và Triết lý',
  description: 'Phương pháp chiêm bốc dựa trên Kinh Dịch do Thiệu Khang Tiết (Thiệu Ung) sáng tạo thời Bắc Tống',
  keyPrinciples: [
    'Vạn vật đều có số - mọi hiện tượng đều có thể định lượng',
    'Con người là tiểu vũ trụ - nằm trong vận động của âm dương và ngũ hành',
    'Đắc số từ mọi hiện tượng: âm thanh, hình ảnh, thời gian',
    'Tính linh hoạt cao hơn phương pháp gieo quẻ truyền thống'
  ],
  applications: [
    'Chẩn đoán sức khỏe qua thời gian khởi niệm',
    'Phân tích mối quan hệ giữa thiên nhiên và con người',
    'Dự đoán xu hướng bệnh lý dựa trên chu kỳ tự nhiên'
  ],
  references: ['docs/mai-hoa-theoretical-foundation.md']
};

/**
 * 2. QUY TRÌNH TOÁN HỌC LẬP QUẺ
 */
export const mathematicalProcess = {
  id: 'mathematical-process',
  category: 'Toán học Lập quẻ',
  title: 'Các Phương pháp Lập quẻ trong Mai Hoa Dịch Số',
  
  methods: [
    {
      name: 'Niên Nguyệt Nhật Thời Khởi Quẻ',
      description: 'Lập quẻ theo thời gian - phương pháp phổ biến nhất',
      formula: {
        upper: '(Năm + Tháng + Ngày) % 8',
        lower: '(Năm + Tháng + Ngày + Giờ) % 8',
        changingLine: '(Năm + Tháng + Ngày + Giờ) % 6'
      },
      example: 'Năm Giáp Thân (9), tháng 12, ngày 17, giờ Thìn (5) → Thượng quẻ: (9+12+17)%8 = 6 (Khảm), Hạ quẻ: (9+12+17+5)%8 = 3 (Ly)'
    },
    {
      name: 'Thanh Âm Khởi Quẻ',
      description: 'Lập quẻ từ âm thanh và số lượng chữ',
      application: 'Phân tích ngôn ngữ, giọng điệu của bệnh nhân'
    },
    {
      name: 'Phương Vị Khởi Quẻ',
      description: 'Dựa trên hướng và vị trí không gian',
      application: 'Phong thủy y học, định vị cơ quan bệnh lý'
    }
  ],
  
  keyFormulas: [
    'Thượng quẻ = (Năm + Tháng + Ngày) mod 8',
    'Hạ quẻ = (Năm + Tháng + Ngày + Giờ) mod 8',
    'Động hào = (Tổng) mod 6 (nếu = 0 thì là hào 6)',
    'Biến quẻ = Đảo ngược động hào của bản quẻ'
  ]
};

/**
 * 3. HỆ THỐNG CHẨN ĐOÁN Y HỌC CỔ TRUYỀN
 */
export const medicalDiagnosisSystem = {
  id: 'medical-diagnosis',
  category: 'Chẩn đoán Y học',
  title: 'Hệ thống Chẩn đoán qua Bát Quái, Lục Thân, Lục Thần',
  
  components: {
    baguaMapping: {
      description: 'Ma trận ánh xạ 8 quẻ với các bộ phận cơ thể',
      principles: [
        'Càn (☰) - Đầu, Phổi, Xương, Não → Cao huyết áp, bệnh hô hấp',
        'Khôn (☷) - Bụng, Lá lách, Dạ dày → Bệnh tiêu hóa, u bướu',
        'Chấn (☳) - Chân, Gan, Thần kinh → Kinh phong, động kinh',
        'Tốn (☴) - Đùi, Gan, Mật → Bệnh gan mật, gió tà',
        'Khảm (☵) - Tai, Thận, Huyết → Bệnh thận, tai biến mạch máu',
        'Ly (☲) - Mắt, Tim, Huyết → Bệnh tim mạch, nhãn khoa',
        'Cấn (☶) - Tay, Lá lách, Dạ dày → Tiêu hóa, cơ xương khớp',
        'Đoài (☱) - Miệng, Phổi, Hô hấp → Bệnh phổi, răng miệng'
      ]
    },
    
    liushenSystem: {
      description: 'Lục Thần - 6 thần linh xác định tính chất bệnh',
      spirits: [
        'Thanh Long - Bệnh kinh niên, mãn tính',
        'Chu Tước - Viêm nhiễm, sốt cao, bệnh cấp tính',
        'Câu Trần - U bướu, ung thư, khối bất thường',
        'Đằng Xà - Bệnh tâm thần, quái bệnh, khó chẩn đoán',
        'Bạch Hổ - Chấn thương, xuất huyết, tai nạn',
        'Huyền Vũ - Bệnh âm tính, nội tiết, sinh dục'
      ]
    },
    
    liuqinSystem: {
      description: 'Lục Thân - 6 mối quan hệ năng lượng',
      relations: [
        'Phụ Mẫu - Nguyên khí gốc, đầu não, hệ tiêu hóa chính',
        'Huynh Đệ - Tứ chi, cơ bắp, xương khớp',
        'Tử Tôn - Y dược thần, đường hô hấp, khả năng hồi phục',
        'Thê Tài - Năng lượng duy trì, lá lách, máu huyết',
        'Quan Quỷ - Bệnh tà, vi khuẩn, virus, yếu tố gây bệnh'
      ]
    },
    
    yaoPositionSystem: {
      description: 'Hệ thống 6 hào - Định vị cơ thể theo chiều dọc',
      positions: [
        'Sơ Hào (Hào 1) - Chân, bàn chân',
        'Nhị Hào (Hào 2) - Đùi, chân dưới',
        'Tam Hào (Hào 3) - Bụng, dạ dày, sinh dục',
        'Tứ Hào (Hào 4) - Ngực, tim phổi',
        'Ngũ Hào (Hào 5) - Ngũ quan (mắt, tai, mũi, miệng)',
        'Thượng Hào (Hào 6) - Đầu, não bộ'
      ]
    }
  },
  
  diagnosticRules: [
    'Thế Quẻ yếu + Quan Quỷ động → Bệnh nặng, khó điều trị',
    'Tử Tôn động → Y dược có hiệu quả, khả năng hồi phục cao',
    'Bạch Hổ lâm Quan Quỷ → Xuất huyết, chấn thương nghiêm trọng',
    'Câu Trần lâm Phụ Mẫu động → Nguy cơ u bướu, ung thư',
    'Thê Tài vượng + Tử Tôn xuất hiện → Thể trạng tốt, bệnh nhẹ',
    'Động hào ở hào nào → Vị trí cơ quan bệnh tương ứng'
  ]
};

/**
 * 4. KIẾN TRÚC HỆ THỐNG WEBSITE
 */
export const systemArchitecture = {
  id: 'system-architecture',
  category: 'Kiến trúc Hệ thống',
  title: 'Thiết kế Website Chẩn đoán Mai Hoa Dịch Số',
  
  technicalStack: {
    frontend: [
      'React/Next.js - Giao diện người dùng',
      'TypeScript - Type safety cho logic phức tạp',
      'Tailwind CSS - Styling hệ thống',
      'SWR - Data fetching và caching'
    ],
    backend: [
      'Next.js API Routes - Xử lý logic nghiệp vụ',
      'Database (Supabase/Neon) - Lưu trữ dữ liệu người dùng và lịch sử',
      'Authentication - Quản lý người dùng'
    ],
    aiIntegration: [
      'AI SDK 6 - Tích hợp AI phân tích y lý',
      'OpenAI GPT-4o - Phân tích chẩn đoán chuyên sâu',
      'Groq Llama - Format JSON tốc độ cao'
    ]
  },
  
  coreModules: [
    {
      name: 'Mô-đun Lập Quẻ (Hexagram Generator)',
      functions: [
        'Nhập thời gian: năm, tháng, ngày, giờ',
        'Tính toán quẻ bản và quẻ biến',
        'Xác định động hào và các yếu tố liên quan',
        'Hiển thị hình ảnh quẻ trực quan'
      ]
    },
    {
      name: 'Mô-đun Phân Tích Y Lý (Medical Analysis Engine)',
      functions: [
        'Ánh xạ quẻ → cơ quan (Bát Quái)',
        'Phân tích Lục Thần → tính chất bệnh',
        'Phân tích Lục Thân → mức độ nghiêm trọng',
        'Xác định vị trí bệnh qua Hào vị',
        'Kết hợp các quy tắc chẩn đoán phức tạp'
      ]
    },
    
    {
      name: 'Mô-đun Quản lý Lịch sử',
      functions: [
        'Lưu trữ các lần khởi quẻ',
        'So sánh kết quả theo thời gian',
        'Theo dõi tiến triển sức khỏe',
        'Xuất báo cáo PDF'
      ]
    }
  ],
  
  userFlow: [
    '1. Người dùng nhập thông tin thời gian (hoặc hệ thống tự động lấy)',
    '2. Hệ thống tính toán và hiển thị quẻ bản, quẻ biến',
    '3. Engine phân tích y lý dựa trên ma trận tri thức',
    '4. AI GPT-4o phân tích và đưa ra kết luận chuyên sâu',
    '5. Hiển thị kết quả chẩn đoán với giải thích chi tiết',
    '6. Người dùng có thể lưu kết quả hoặc xuất báo cáo'
  ]
};

/**
 * 5. RÀO CẢN PHÁP LÝ VÀ ĐẠO ĐỨC
 */
export const legalAndEthicalConsiderations = {
  id: 'legal-ethical',
  category: 'Pháp lý và Đạo đức',
  title: 'Khung Pháp lý và Đạo đức trong Tham vấn Y tế Tâm linh',
  
  legalConstraints: [
    'KHÔNG tự nhận là "chẩn đoán y khoa" - chỉ là "tham vấn tâm linh"',
    'Tuân thủ quy định về bảo mật thông tin cá nhân (GDPR, PDPA)',
    'Không thay thế ý kiến bác sĩ - luôn khuyến cáo khám chuyên khoa',
    'Tránh khẳng định tuyệt đối về bệnh tật hoặc tiên lượng'
  ],
  
  ethicalPrinciples: [
    'Minh bạch về phương pháp: Giải thích rõ đây là dịch học, không phải y học hiện đại',
    'Bảo vệ người dùng dễ tổn thương: Không gây hoảng loạn với các bệnh nặng',
    'Khuyến khích kết hợp: Y học cổ truyền và hiện đại bổ trợ cho nhau',
    'Trách nhiệm với thông tin: Đảm bảo tính chính xác của cơ sở tri thức'
  ],
  
  disclaimers: [
    'Hệ thống này chỉ mang tính chất tham khảo tâm linh và văn hóa',
    'Không thay thế cho việc khám, chữa bệnh tại các cơ sở y tế',
    'Mọi quyết định về sức khỏe cần tham vấn bác sĩ chuyên khoa',
    'Kết quả có thể khác nhau tùy theo cách diễn giải của người thực hành'
  ]
};

/**
 * 6. XU HƯỚNG CÔNG NGHỆ TƯƠNG LAI
 */
export const futureTrends = {
  id: 'future-trends',
  category: 'Xu hướng Tương lai',
  title: 'Định hướng Phát triển và Công nghệ Mới',
  
  trends: [
    {
      name: 'AI & Machine Learning',
      description: 'Huấn luyện mô hình AI từ hàng ngàn ca bệnh lịch sử',
      applications: [
        'Nhận dạng pattern phức tạp trong quẻ',
        'Dự đoán độ chính xác dựa trên feedback người dùng',
        'Tự động điều chỉnh ma trận tri thức'
      ]
    },
    {
      name: 'Kết hợp Wearable Devices',
      description: 'Tích hợp dữ liệu từ thiết bị đeo thông minh',
      applications: [
        'So sánh dự đoán Mai Hoa với nhịp tim, huyết áp thực tế',
        'Xác minh độ chính xác của phương pháp',
        'Cá nhân hóa khuyến nghị sức khỏe'
      ]
    },
    {
      name: 'Blockchain & Traceability',
      description: 'Lưu trữ phi tập trung lịch sử chẩn đoán',
      applications: [
        'Bảo mật thông tin y tế cá nhân',
        'Tính minh bạch trong quy trình phân tích',
        'Chia sẻ an toàn với chuyên gia'
      ]
    },
    {
      name: 'Multimodal AI Analysis',
      description: 'Phân tích đa phương thức: giọng nói, hình ảnh, text',
      applications: [
        'Thanh âm khởi quẻ tự động qua phân tích giọng nói',
        'Nhận diện hình ảnh từ khuôn mặt, lưỡi → chẩn đoán',
        'Kết hợp nhiều phương pháp lập quẻ cùng lúc'
      ]
    }
  ]
};

/**
 * TÀI LIỆU THAM KHẢO CHÍNH
 */
export const mainReferences = [
  {
    title: 'Kinh Dịch (I Ching / Book of Changes)',
    description: 'Kinh điển gốc về triết học âm dương và 64 quẻ'
  },
  {
    title: 'Mai Hoa Dịch Số - Thiệu Khang Tiết',
    description: 'Tác phẩm gốc về phương pháp Mai Hoa Dịch Số'
  },
  {
    title: 'Hoàng Đế Nội Kinh',
    description: 'Y thư cổ điển về y học cổ truyền Trung Quốc'
  },
  {
    title: 'Research: Kiến trúc Hệ thống và Cơ sở Lý luận',
    description: 'Tài liệu nghiên cứu tổng hợp về xây dựng website chẩn đoán 2025-2026',
    path: 'docs/mai-hoa-theoretical-foundation.md'
  }
];

/**
 * KNOWLEDGE BASE INDEX
 * Index tổng hợp tất cả kiến thức cho hệ thống
 */
export const knowledgeBaseIndex = {
  philosophical: philosophicalFoundation,
  mathematical: mathematicalProcess,
  medical: medicalDiagnosisSystem,
  architecture: systemArchitecture,
  legal: legalAndEthicalConsiderations,
  future: futureTrends,
  references: mainReferences
};

export default knowledgeBaseIndex;
