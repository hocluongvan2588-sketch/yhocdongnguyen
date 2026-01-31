/**
 * Engine lập quẻ Mai Hoa Dịch Số theo phương pháp Thiệu Khang Tiết
 * Module 2: Hexagram Generation Engine
 */

import { convertSolar2Lunar, getHourChi } from './lunar-calendar';

/**
 * Tên 8 quẻ đơn (Bát Quái)
 */
export const BAGUA_NAMES = [
  "Khôn", // 0 (nhưng trong công thức khi dư 0 => 8)
  "Càn",  // 1
  "Đoài", // 2
  "Ly",   // 3
  "Chấn", // 4
  "Tốn",  // 5
  "Khảm", // 6
  "Cấn",  // 7
  "Khôn"  // 8
];

/**
 * Ký hiệu quẻ (3 hào)
 */
export const BAGUA_SYMBOLS = [
  "☷", // Khôn 
  "☰", // Càn
  "☱", // Đoài
  "☲", // Ly
  "☳", // Chấn
  "☴", // Tốn
  "☵", // Khảm
  "☶", // Cấn
  "☷"  // Khôn (index 8)
];

/**
 * Cấu trúc hào của 8 quẻ đơn (true = dương, false = âm)
 * Đọc từ dưới lên
 */
export const BAGUA_LINES: Record<number, [boolean, boolean, boolean]> = {
  1: [true, true, true],      // Càn ☰
  2: [true, true, false],     // Đoài ☱
  3: [true, false, true],     // Ly ☲
  4: [true, false, false],    // Chấn ☳
  5: [false, true, true],     // Tốn ☴
  6: [false, true, false],    // Khảm ☵
  7: [false, false, true],    // Cấn ☶
  8: [false, false, false]    // Khôn ☷
};

/**
 * Bảng 64 quẻ (index bằng upper * 10 + lower)
 * Format: "Tên quẻ|Ý nghĩa y lý"
 */
export const HEXAGRAM_64 = {
  11: "Càn|Đầu, phổi, xương - Năng lượng dương cực thịnh",
  12: "Đoài|Phổi, miệng, hô hấp - Vấn đề phế kim",
  13: "Ly|Tim, mắt - Huyết áp, tuần hoàn",
  14: "Chấn|Gan, chân - Thần kinh, cơ bắp",
  15: "Tốn|Gan, mật - Gió, khí hư",
  16: "Khảm|Thận, tai - Thủy, tiết niệu",
  17: "Cấn|Dạ dày, lưng - Tiêu hóa, xương khớp",
  18: "Khôn|Lá lách, bụng - Thổ, tiêu hóa",
  
  21: "Thiên Trạch Lý|Tranh chấp, viêm nhiễm",
  22: "Đoài|Phổi, miệng - Kim thuộc tính",
  23: "Trạch Hỏa Cách|Cách mạng, biến đổi đột ngột",
  24: "Trạch Lôi Tuỳ|Theo đuổi, mất máu",
  25: "Trạch Phong Đại Quá|Quá độ, suy yếu nghiêm trọng",
  26: "Trạch Thủy Khốn|Khốn đốn, thận hư",
  27: "Trạch Sơn Hàm|Nhai, dạ dày",
  28: "Trạch Địa Tụy|Tụ tập, u bướu",
  
  31: "Thiên Hỏa Đồng Nhân|Cộng đồng, tim phế",
  32: "Hỏa Trạch Khuê|Chia ly, nhãn khoa",
  33: "Ly|Hỏa - Tim, mắt",
  34: "Hỏa Lôi Phệ Hạp|Cắn gặp, viêm gan",
  35: "Hỏa Phong Đỉnh|Nấu nướng, tiêu hóa mạnh",
  36: "Hỏa Thủy Vị Tế|Chưa hoàn thành, thận tim bất giao",
  37: "Hỏa Sơn Lữ|Du lịch, bất an",
  38: "Hỏa Địa Tấn|Tiến bộ, sốt nhẹ",
  
  41: "Thiên Lôi Vô Vọng|Không vọng, gan phổi",
  42: "Lôi Trạch Quy Muội|Về nhà, hôn nhân - phụ khoa",
  43: "Lôi Hỏa Phong|Phong phú, huyết khí tốt",
  44: "Chấn|Lôi - Gan, chấn động",
  45: "Lôi Phong Hằng|Thường hằng, gan mật ổn định",
  46: "Lôi Thủy Giải|Giải thoát, gan thận",
  47: "Lôi Sơn Tiểu Quá|Nhỏ vượt, gan tỳ",
  48: "Lôi Địa Dự|An nhàn, lạc quan - Khí huyết thông suốt",
  
  51: "Thiên Phong Cấu|Gặp gỡ, phong hàn",
  52: "Phong Trạch Trung Phu|Trung thành, phổi gan",
  53: "Phong Hỏa Gia Nhân|Gia đình, nội tạng",
  54: "Phong Lôi Ích|Lợi ích, tăng cường",
  55: "Tốn|Phong - Gan mật, gió",
  56: "Phong Thủy Hoán|Tán loạn, khí huyết rối",
  57: "Phong Sơn Tiệm|Tiệm tiến, từ từ cải thiện",
  58: "Phong Địa Quán|Quan sát, chậm tiến triển",
  
  61: "Thiên Thủy Tụng|Tranh tụng, phổi thận",
  62: "Thủy Trạch Tiết|Tiết chế, thận phế",
  63: "Thủy Hỏa Ký Tế|Đã hoàn thành, thận tim cân bằng",
  64: "Thủy Lôi Truân|Gian nan, thận gan",
  65: "Thủy Phong Tỉnh|Giếng nước, thận gan",
  66: "Khảm|Thủy - Thận, tiết niệu",
  67: "Thủy Sơn Kiển|Khập khiễng, thận tỳ",
  68: "Thủy Địa Tỷ|So sánh, phù thũng",
  
  71: "Thiên Sơn Độn|Ẩn náu, phổi tỳ",
  72: "Sơn Trạch Tổn|Tổn thất, tỳ phế",
  73: "Sơn Hỏa Bí|Trang trí, tỳ tim",
  74: "Sơn Lôi Di|Nuôi dưỡng, dạ dày gan",
  75: "Sơn Phong Cổ|Rối loạn, tỳ gan",
  76: "Sơn Thủy Mông|Mù mờ, tỳ thận",
  77: "Cấn|Sơn - Dạ dày, lưng",
  78: "Sơn Địa Bác|Bóc lột, tiêu hóa kém",
  
  81: "Thiên Địa Bĩ|Tắc nghẽn, phế tỳ",
  82: "Địa Trạch Lâm|Đến gần, tỳ phế",
  83: "Địa Hỏa Minh Di|Ánh sáng bị tổn, tỳ tim",
  84: "Địa Lôi Phục|Phục hồi, tỳ gan",
  85: "Địa Phong Thăng|Thăng tiến, tỳ gan tốt",
  86: "Địa Thủy Sư|Quân đội, tỳ thận",
  87: "Địa Sơn Khiêm|Khiêm tốn, tỳ vị",
  88: "Khôn|Địa - Lá lách, bụng, tiêu hóa"
};

/**
 * Interface kết quả lập quẻ
 */
export interface MaiHuaResult {
  // Input đã chuẩn hóa
  solarDate: { day: number; month: number; year: number; hour: number };
  lunarDate: { day: number; month: number; year: number; hour: number; isLeap: boolean };
  
  // Quẻ
  upperTrigram: number;      // Quẻ Thượng (1-8)
  lowerTrigram: number;      // Quẻ Hạ (1-8)
  movingLine: number;        // Hào động (1-6)
  
  // Quẻ Chủ (Bản quái)
  mainHexagram: {
    upper: number;
    lower: number;
    name: string;
    symbol: string;
    lines: boolean[];        // 6 hào từ dưới lên
  };
  
  // Quẻ Biến
  changedHexagram: {
    upper: number;
    lower: number;
    name: string;
    symbol: string;
    lines: boolean[];
  };
  
  // Quẻ Hổ (Mutual/Intermediate)
  mutualHexagram: {
    upper: number;
    lower: number;
    name: string;
    symbol: string;
    lines: boolean[];
  };
  
  // Diễn giải y lý
  interpretation: {
    mainMeaning: string;
    changedMeaning: string;
    health: string;
  };
}

/**
 * Lấy 6 hào của một quẻ hoàn chỉnh
 */
function getHexagramLines(upper: number, lower: number): boolean[] {
  const lowerLines = BAGUA_LINES[lower];
  const upperLines = BAGUA_LINES[upper];
  return [...lowerLines, ...upperLines];
}

/**
 * Đổi một hào (dương <-> âm)
 */
function flipLine(lines: boolean[], position: number): boolean[] {
  const newLines = [...lines];
  newLines[position - 1] = !newLines[position - 1];
  return newLines;
}

/**
 * Chuyển 6 hào thành 2 quẻ đơn
 */
function linesToTrigrams(lines: boolean[]): { upper: number; lower: number } {
  const lowerLines: [boolean, boolean, boolean] = [lines[0], lines[1], lines[2]];
  const upperLines: [boolean, boolean, boolean] = [lines[3], lines[4], lines[5]];
  
  let lower = 0;
  let upper = 0;
  
  // Tìm quẻ khớp
  for (let i = 1; i <= 8; i++) {
    const l = BAGUA_LINES[i];
    if (l[0] === lowerLines[0] && l[1] === lowerLines[1] && l[2] === lowerLines[2]) {
      lower = i;
    }
    if (l[0] === upperLines[0] && l[1] === upperLines[1] && l[2] === upperLines[2]) {
      upper = i;
    }
  }
  
  return { upper, lower };
}

/**
 * Lấy tên và ý nghĩa quẻ
 */
function getHexagramInfo(upper: number, lower: number): { name: string; meaning: string } {
  const key = upper * 10 + lower;
  const info = HEXAGRAM_64[key as keyof typeof HEXAGRAM_64] || "Chưa có thông tin|";
  const [name, meaning] = info.split("|");
  return { name, meaning };
}

/**
 * Tính Quẻ Hổ (Mutual Hexagram)
 * Lấy hào 2,3,4 làm Hổ Hạ và hào 3,4,5 làm Hổ Thượng
 */
function getMutualHexagram(lines: boolean[]): { upper: number; lower: number } {
  const mutualLower: [boolean, boolean, boolean] = [lines[1], lines[2], lines[3]];
  const mutualUpper: [boolean, boolean, boolean] = [lines[2], lines[3], lines[4]];
  
  let lower = 0;
  let upper = 0;
  
  for (let i = 1; i <= 8; i++) {
    const l = BAGUA_LINES[i];
    if (l[0] === mutualLower[0] && l[1] === mutualLower[1] && l[2] === mutualLower[2]) {
      lower = i;
    }
    if (l[0] === mutualUpper[0] && l[1] === mutualUpper[1] && l[2] === mutualUpper[2]) {
      upper = i;
    }
  }
  
  return { upper, lower };
}

/**
 * Hàm chính: Lập quẻ Mai Hoa từ ngày dương lịch
 * 
 * @param day - Ngày (1-31)
 * @param month - Tháng (1-12)
 * @param year - Năm
 * @param hour - Giờ (0-23)
 * @returns Kết quả lập quẻ đầy đủ
 */
export function calculateMaiHua(
  day: number,
  month: number,
  year: number,
  hour: number
): MaiHuaResult {
  // Module 1: Chuẩn hóa dữ liệu đầu vào
  let lunar = convertSolar2Lunar(day, month, year);
  const hourChi = getHourChi(hour);
  
  // QUY TẮC QUAN TRỌNG: Sau 23h đêm (Giờ Tý) được tính là ngày hôm sau
  // Giờ Tý (23h-01h sáng) thuộc về ngày mới trong Dịch học
  if (hour >= 23) {
    // Chuyển sang ngày hôm sau
    const nextDay = new Date(year, month - 1, day);
    nextDay.setDate(nextDay.getDate() + 1);
    lunar = convertSolar2Lunar(nextDay.getDate(), nextDay.getMonth() + 1, nextDay.getFullYear());
    
    console.log('[v0] Hour >= 23, advancing to next lunar day:', {
      originalDay: day,
      newDay: lunar.day,
      hour,
      hourChi: 'Tý'
    });
  }
  
  // Công thức lấy số năm: (năm + 8) % 12 => Địa chi năm
  // Ất Tỵ: Chi = Tỵ = 5 (Tý=0,Sửu=1,Dần=2,Mão=3,Thìn=4,Tỵ=5...)
  // Cộng thêm 1 để có 1-12: 5+1=6 ✓
  const yearChi = (lunar.year + 8) % 12; // 0-11: Tý đến Hợi
  const Y = yearChi + 1; // 1-12 (nhưng sẽ dùng để tính mod 8)
  const M = lunar.month;
  const D = lunar.day;
  const H = hourChi + 1; // Chi giờ (1-12)
  
  console.log('[v0] Mai Hoa Calculation Input:', { Y, M, D, H, lunarYear: lunar.year, yearChi });
  
  // Module 2: Engine lập quẻ
  
  // 2.1: Xác định Quẻ Thượng và Quẻ Hạ
  let upperValue = (Y + M + D) % 8;
  if (upperValue === 0) upperValue = 8;
  
  let lowerValue = (Y + M + D + H) % 8;
  if (lowerValue === 0) lowerValue = 8;
  
  // 2.2: Xác định Hào động
  let movingLineValue = (Y + M + D + H) % 6;
  if (movingLineValue === 0) movingLineValue = 6;
  
  console.log('[v0] Mai Hoa Trigrams:', { 
    sum1: Y + M + D, 
    upperValue, 
    upperName: BAGUA_NAMES[upperValue],
    sum2: Y + M + D + H, 
    lowerValue,
    lowerName: BAGUA_NAMES[lowerValue],
    movingLineValue 
  });
  
  // Tạo Quẻ Chủ
  const mainLines = getHexagramLines(upperValue, lowerValue);
  const mainInfo = getHexagramInfo(upperValue, lowerValue);
  
  // Tạo Quẻ Biến (đổi hào động)
  const changedLines = flipLine(mainLines, movingLineValue);
  const changedTrigrams = linesToTrigrams(changedLines);
  const changedInfo = getHexagramInfo(changedTrigrams.upper, changedTrigrams.lower);
  
  // 2.3: Tính Quẻ Hổ
  const mutualTrigrams = getMutualHexagram(mainLines);
  const mutualLines = getHexagramLines(mutualTrigrams.upper, mutualTrigrams.lower);
  const mutualInfo = getHexagramInfo(mutualTrigrams.upper, mutualTrigrams.lower);
  
  // Diễn giải y lý cơ bản
  const interpretation = {
    mainMeaning: mainInfo.meaning || "Trạng thái hiện tại của cơ thể",
    changedMeaning: changedInfo.meaning || "Xu hướng diễn biến của bệnh",
    health: `Quẻ chủ ${mainInfo.name} cho thấy tình trạng sức khỏe liên quan đến ${mainInfo.meaning}. Hào động ở vị trí ${movingLineValue} và quẻ biến ${changedInfo.name} cho thấy xu hướng ${changedInfo.meaning}.`
  };
  
  return {
    solarDate: { day, month, year, hour },
    lunarDate: {
      day: lunar.day,
      month: lunar.month,
      year: lunar.year,
      hour: hourChi,
      isLeap: lunar.isLeap
    },
    upperTrigram: upperValue,
    lowerTrigram: lowerValue,
    movingLine: movingLineValue,
    mainHexagram: {
      upper: upperValue,
      lower: lowerValue,
      name: mainInfo.name,
      symbol: `${BAGUA_SYMBOLS[upperValue]}${BAGUA_SYMBOLS[lowerValue]}`,
      lines: mainLines
    },
    changedHexagram: {
      upper: changedTrigrams.upper,
      lower: changedTrigrams.lower,
      name: changedInfo.name,
      symbol: `${BAGUA_SYMBOLS[changedTrigrams.upper]}${BAGUA_SYMBOLS[changedTrigrams.lower]}`,
      lines: changedLines
    },
    mutualHexagram: {
      upper: mutualTrigrams.upper,
      lower: mutualTrigrams.lower,
      name: mutualInfo.name,
      symbol: `${BAGUA_SYMBOLS[mutualTrigrams.upper]}${BAGUA_SYMBOLS[mutualTrigrams.lower]}`,
      lines: mutualLines
    },
    interpretation
  };
}
