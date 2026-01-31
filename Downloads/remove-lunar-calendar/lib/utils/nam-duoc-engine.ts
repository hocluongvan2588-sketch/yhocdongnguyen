/**
 * NAM DƯỢC THẦN HIỆU ENGINE
 * Engine tích hợp kiến thức Nam Dược Thần Hiệu của Đại Danh Y Tuệ Tĩnh
 * vào hệ thống Mai Hoa Tâm Pháp
 */

import { createClient } from '@/lib/supabase/client';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface ViThuoc {
  id: string;
  ten_thuoc: string;
  ten_khoa_hoc: string | null;
  ten_khac: string[];
  tho_nom: string | null;
  ngu_hanh: 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';
  gua_tuong_ung: number[];
  tang_phu: string[];
  tinh: 'han' | 'luong' | 'on' | 'nhiet' | 'binh';
  vi: string[];
  quy_kinh: string[];
  cong_dung: string;
  chu_tri: string[];
  cach_dung: string;
  lieu_luong: string;
  kieng_ky: string[];
  bo_phan_dung: string[];
}

export interface PhuongThuoc {
  id: string;
  ten_phuong: string;
  ten_han: string | null;
  khoa_id: number;
  loai_benh: string[];
  gua_ap_dung: number[];
  ngu_hanh_chinh: 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';
  tang_phu_chinh: string[];
  thanh_phan: ThanhPhan[];
  cach_bao_che: string;
  cach_dung: string;
  lieu_trinh: string;
  chi_dinh: string[];
  chong_chi_dinh: string[];
  luu_y: string | null;
  muc_do_benh: string[];
  do_uu_tien: number;
}

export interface ThanhPhan {
  ten: string;
  lieu_luong: string;
  vai_tro: 'quan' | 'than' | 'ta' | 'su'; // Quân, Thần, Tá, Sứ
}

export interface GuaMapping {
  gua_so: number;
  gua_ten: string;
  tang_phu: string[];
  benh_ly_pho_bien: string[];
  phuong_thuoc_ids: string[];
  vi_thuoc_uu_tien: string[];
}

export interface NamDuocRecommendation {
  phuong_thuoc: PhuongThuoc[];
  vi_thuoc_bo_sung: ViThuoc[];
  ly_do_chon: string;
  luu_y_dac_biet: string[];
}

// =====================================================
// NGŨ HÀNH - BÁT QUÁI MAPPING
// =====================================================

const NGU_HANH_MAP: Record<number, 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho'> = {
  1: 'kim',  // Càn - Kim
  2: 'kim',  // Đoài - Kim
  3: 'hoa',  // Ly - Hỏa
  4: 'moc',  // Chấn - Mộc
  5: 'moc',  // Tốn - Mộc
  6: 'thuy', // Khảm - Thủy
  7: 'tho',  // Cấn - Thổ
  8: 'tho',  // Khôn - Thổ
};

const TANG_PHU_MAP: Record<number, string[]> = {
  1: ['Đại tràng', 'Đầu', 'Phổi'],
  2: ['Phế', 'Miệng', 'Da'],
  3: ['Tâm', 'Mắt', 'Tiểu tràng'],
  4: ['Can', 'Chân', 'Gân'],
  5: ['Đởm', 'Đùi', 'Túi mật'],
  6: ['Thận', 'Tai', 'Xương'],
  7: ['Vị', 'Tay', 'Cơ'],
  8: ['Tỳ', 'Bụng', 'Cơ nhục'],
};

// Ngũ hành sinh khắc
const NGU_HANH_SINH: Record<string, string> = {
  'kim': 'thuy',  // Kim sinh Thủy
  'thuy': 'moc',  // Thủy sinh Mộc
  'moc': 'hoa',   // Mộc sinh Hỏa
  'hoa': 'tho',   // Hỏa sinh Thổ
  'tho': 'kim',   // Thổ sinh Kim
};

const NGU_HANH_KHAC: Record<string, string> = {
  'kim': 'moc',   // Kim khắc Mộc
  'moc': 'tho',   // Mộc khắc Thổ
  'tho': 'thuy',  // Thổ khắc Thủy
  'thuy': 'hoa',  // Thủy khắc Hỏa
  'hoa': 'kim',   // Hỏa khắc Kim
};

// =====================================================
// MAIN ENGINE CLASS
// =====================================================

export class NamDuocEngine {
  private supabase = createClient();

  /**
   * Gợi ý bài thuốc Nam dược dựa trên quẻ và tình trạng bệnh
   */
  async recommendPhuongThuoc(
    guaSo: number,
    guaBienSo: number | null,
    symptoms: string[],
    severity: 'nhe' | 'trung-binh' | 'nang' = 'trung-binh'
  ): Promise<NamDuocRecommendation> {
    const nguHanhChinh = NGU_HANH_MAP[guaSo];
    const tangPhuChinh = TANG_PHU_MAP[guaSo];

    // 1. Query phương thuốc phù hợp với quẻ
    const { data: phuongThuocData, error } = await this.supabase
      .from('nam_duoc_phuong_thuoc')
      .select('*')
      .contains('gua_ap_dung', [guaSo])
      .contains('muc_do_benh', [severity])
      .eq('is_active', true)
      .order('do_uu_tien', { ascending: false })
      .limit(5);

    if (error) {
      console.error('[v0] Error fetching phuong thuoc:', error);
      return this.getDefaultRecommendation(nguHanhChinh, tangPhuChinh);
    }

    // 2. Nếu không tìm thấy, tìm theo ngũ hành
    let phuongThuoc = phuongThuocData || [];
    if (phuongThuoc.length === 0) {
      const { data: fallbackData } = await this.supabase
        .from('nam_duoc_phuong_thuoc')
        .select('*')
        .eq('ngu_hanh_chinh', nguHanhChinh)
        .contains('muc_do_benh', [severity])
        .eq('is_active', true)
        .order('do_uu_tien', { ascending: false })
        .limit(3);

      phuongThuoc = fallbackData || [];
    }

    // 3. Query vị thuốc bổ sung
    const { data: viThuocData } = await this.supabase
      .from('nam_duoc_vi_thuoc')
      .select('*')
      .eq('ngu_hanh', nguHanhChinh)
      .eq('is_active', true)
      .limit(5);

    // 4. Xác định lý do chọn
    const lyDoChon = this.buildReasoningText(guaSo, nguHanhChinh, tangPhuChinh, symptoms);

    // 5. Xác định lưu ý đặc biệt
    const luuYDacBiet = this.buildSpecialNotes(guaSo, guaBienSo, severity);

    return {
      phuong_thuoc: phuongThuoc as PhuongThuoc[],
      vi_thuoc_bo_sung: (viThuocData || []) as ViThuoc[],
      ly_do_chon: lyDoChon,
      luu_y_dac_biet: luuYDacBiet,
    };
  }

  /**
   * Lấy thông tin chi tiết một bài thuốc
   */
  async getPhuongThuocDetail(id: string): Promise<PhuongThuoc | null> {
    const { data, error } = await this.supabase
      .from('nam_duoc_phuong_thuoc')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[v0] Error fetching phuong thuoc detail:', error);
      return null;
    }

    return data as PhuongThuoc;
  }

  /**
   * Lấy thông tin chi tiết một vị thuốc
   */
  async getViThuocDetail(id: string): Promise<ViThuoc | null> {
    const { data, error } = await this.supabase
      .from('nam_duoc_vi_thuoc')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[v0] Error fetching vi thuoc detail:', error);
      return null;
    }

    return data as ViThuoc;
  }

  /**
   * Tìm kiếm bài thuốc theo triệu chứng
   */
  async searchBySymptoms(symptoms: string[]): Promise<PhuongThuoc[]> {
    // Build search query
    const searchTerms = symptoms.join(' | ');
    
    const { data, error } = await this.supabase
      .from('nam_duoc_phuong_thuoc')
      .select('*')
      .or(`loai_benh.cs.{${symptoms.join(',')}},chi_dinh.cs.{${symptoms.join(',')}}`)
      .eq('is_active', true)
      .order('do_uu_tien', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[v0] Error searching phuong thuoc:', error);
      return [];
    }

    return (data || []) as PhuongThuoc[];
  }

  /**
   * Lấy tất cả bài thuốc theo khoa
   */
  async getPhuongThuocByKhoa(khoaId: number): Promise<PhuongThuoc[]> {
    const { data, error } = await this.supabase
      .from('nam_duoc_phuong_thuoc')
      .select('*')
      .eq('khoa_id', khoaId)
      .eq('is_active', true)
      .order('do_uu_tien', { ascending: false });

    if (error) {
      console.error('[v0] Error fetching phuong thuoc by khoa:', error);
      return [];
    }

    return (data || []) as PhuongThuoc[];
  }

  /**
   * Format bài thuốc thành text cho AI prompt
   */
  formatForAIPrompt(recommendation: NamDuocRecommendation): string {
    let text = `\n══════════════════════════════════════════════════════════════════════════
NAM DƯỢC THẦN HIỆU - PHƯƠNG THUỐC GỢI Ý
(Theo kiến thức của Đại Danh Y Tuệ Tĩnh)
══════════════════════════════════════════════════════════════════════════

📋 LÝ DO GỢI Ý:
${recommendation.ly_do_chon}

`;

    if (recommendation.phuong_thuoc.length > 0) {
      text += `\n📜 CÁC BÀI THUỐC PHÙ HỢP:\n`;
      
      recommendation.phuong_thuoc.forEach((pt, index) => {
        text += `
┌─────────────────────────────────────────────────────────────────────────
│ ${index + 1}. ${pt.ten_phuong} ${pt.ten_han ? `(${pt.ten_han})` : ''}
├─────────────────────────────────────────────────────────────────────────
│ • Ngũ hành: ${pt.ngu_hanh_chinh.toUpperCase()}
│ • Tạng phủ: ${pt.tang_phu_chinh.join(', ')}
│ • Chỉ định: ${pt.chi_dinh.join(', ')}
│
│ 📦 THÀNH PHẦN:
${pt.thanh_phan.map(tp => `│   - ${tp.ten}: ${tp.lieu_luong} (${this.getVaiTroLabel(tp.vai_tro)})`).join('\n')}
│
│ 📝 CÁCH DÙNG: ${pt.cach_dung}
│ ⏱️ LIỆU TRÌNH: ${pt.lieu_trinh}
│
│ ⚠️ CHỐNG CHỈ ĐỊNH: ${pt.chong_chi_dinh.join(', ')}
${pt.luu_y ? `│ 💡 LƯU Ý: ${pt.luu_y}` : ''}
└─────────────────────────────────────────────────────────────────────────
`;
      });
    }

    if (recommendation.vi_thuoc_bo_sung.length > 0) {
      text += `\n\n🌿 VỊ THUỐC BỔ SUNG (có thể dùng đơn lẻ hoặc phối hợp):\n`;
      recommendation.vi_thuoc_bo_sung.forEach(vt => {
        text += `
• ${vt.ten_thuoc} (${vt.tinh.toUpperCase()}, ${vt.vi.join('-')})
  Công dụng: ${vt.cong_dung}
  Liều lượng: ${vt.lieu_luong}
${vt.tho_nom ? `  📜 "${vt.tho_nom}"` : ''}
`;
      });
    }

    if (recommendation.luu_y_dac_biet.length > 0) {
      text += `\n\n⚠️ LƯU Ý ĐẶC BIỆT:\n`;
      recommendation.luu_y_dac_biet.forEach(note => {
        text += `• ${note}\n`;
      });
    }

    text += `
══════════════════════════════════════════════════════════════════════════
KHUYẾN CÁO: Đây là gợi ý dựa trên y học cổ truyền Việt Nam.
Vui lòng tham khảo ý kiến thầy thuốc trước khi sử dụng.
"Nam dược trị Nam nhân" - Tuệ Tĩnh
══════════════════════════════════════════════════════════════════════════
`;

    return text;
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private getVaiTroLabel(vaiTro: string): string {
    const labels: Record<string, string> = {
      'quan': 'Quân - Vị chính',
      'than': 'Thần - Hỗ trợ',
      'ta': 'Tá - Điều hòa',
      'su': 'Sứ - Dẫn thuốc',
    };
    return labels[vaiTro] || vaiTro;
  }

  private buildReasoningText(
    guaSo: number,
    nguHanh: string,
    tangPhu: string[],
    symptoms: string[]
  ): string {
    const guaNames = ['', 'Càn', 'Đoài', 'Ly', 'Chấn', 'Tốn', 'Khảm', 'Cấn', 'Khôn'];
    const nguHanhViet: Record<string, string> = {
      'kim': 'Kim',
      'moc': 'Mộc',
      'thuy': 'Thủy',
      'hoa': 'Hỏa',
      'tho': 'Thổ',
    };

    return `Dựa trên quẻ ${guaNames[guaSo]} (${nguHanhViet[nguHanh]}), tạng phủ liên quan là ${tangPhu.join(', ')}. ` +
      `Theo nguyên tắc "Nam dược trị Nam nhân" của Tuệ Tĩnh, các bài thuốc được chọn có ngũ hành ${nguHanhViet[nguHanh]} ` +
      `để thuận theo khí của quẻ và tạng phủ bị ảnh hưởng.` +
      (symptoms.length > 0 ? ` Triệu chứng được ghi nhận: ${symptoms.join(', ')}.` : '');
  }

  private buildSpecialNotes(
    guaSo: number,
    guaBienSo: number | null,
    severity: string
  ): string[] {
    const notes: string[] = [];

    // Lưu ý theo mức độ
    if (severity === 'nang') {
      notes.push('Bệnh ở mức độ nặng, nên kết hợp với y học hiện đại và theo dõi chặt chẽ.');
    }

    // Lưu ý theo quẻ biến
    if (guaBienSo) {
      const nguHanhGoc = NGU_HANH_MAP[guaSo];
      const nguHanhBien = NGU_HANH_MAP[guaBienSo];
      
      if (NGU_HANH_KHAC[nguHanhGoc] === nguHanhBien) {
        notes.push('Quẻ biến tương khắc với quẻ gốc, cần thận trọng khi dùng thuốc, nên điều chỉnh liều lượng.');
      }
    }

    // Lưu ý chung
    notes.push('Thuốc Nam cần kiên trì sử dụng, không nên kỳ vọng hiệu quả tức thì.');
    notes.push('Nếu triệu chứng không cải thiện sau 7-10 ngày, nên tham khảo ý kiến thầy thuốc.');

    return notes;
  }

  private getDefaultRecommendation(
    nguHanh: string,
    tangPhu: string[]
  ): NamDuocRecommendation {
    return {
      phuong_thuoc: [],
      vi_thuoc_bo_sung: [],
      ly_do_chon: `Dựa trên ngũ hành ${nguHanh.toUpperCase()} và tạng phủ ${tangPhu.join(', ')}, hiện chưa có bài thuốc cụ thể trong cơ sở dữ liệu. Vui lòng tham khảo thêm.`,
      luu_y_dac_biet: [
        'Cơ sở dữ liệu đang được cập nhật thêm các bài thuốc.',
        'Vui lòng tham khảo ý kiến thầy thuốc Đông y để được tư vấn chi tiết.',
      ],
    };
  }
}

// Export singleton instance
export const namDuocEngine = new NamDuocEngine();
