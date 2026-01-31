/**
 * Thuật toán chuyển đổi giữa ngày dương và âm lịch
 * Dựa trên thuật toán của Hồ Ngọc Đức
 * Sử dụng số ngày Julius (Julian Day Number) làm trung gian
 */

const PI = Math.PI;

/**
 * Hàm lấy phần nguyên (tương đương INT trong tài liệu)
 */
function INT(x: number): number {
  return Math.floor(x);
}

/**
 * Đổi ngày dương lịch dd/mm/yyyy ra số ngày Julius (JD)
 */
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  
  if (jd < 2299161) {
    // Lịch Julius (trước 5/10/1582)
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  
  return jd;
}

/**
 * Đổi số ngày Julius (JD) ra ngày dương lịch [dd, mm, yyyy]
 */
export function jdToDate(jd: number): [number, number, number] {
  let a: number, b: number, c: number;
  
  if (jd > 2299160) {
    // Lịch Gregory (sau 5/10/1582)
    a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  
  const d = INT((4 * c + 3) / 1461);
  const e = c - INT((1461 * d) / 4);
  const m = INT((5 * e + 2) / 153);
  
  const day = e - INT((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * INT(m / 10);
  const year = b * 100 + d - 4800 + INT(m / 10);
  
  return [day, month, year];
}

/**
 * Tính ngày Sóc (ngày trăng non) thứ k kể từ 1/1/1900
 * Trả về số ngày Julius của ngày Sóc
 */
export function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85; // Time in Julian centuries from 1900 January 0.5
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr); // Mean new moon
  
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3; // Sun's mean anomaly
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3; // Moon's mean anomaly
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3; // Moon's argument of latitude
  
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  
  let deltat: number;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  
  const JdNew = Jd1 + C1 - deltat;
  return INT(JdNew + 0.5 + timeZone / 24);
}

/**
 * Tính tọa độ mặt trời (vị trí trên hoàng đạo)
 * Trả về số cung (0-11): 0 = Xuân phân đến Cốc vũ, 1 = Cốc vũ đến Tiểu mãn, ...
 */
export function getSunLongitude(jdn: number, timeZone: number): number {
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525; // Time in Julian centuries from 2000-01-01 12:00:00 GMT
  const T2 = T * T;
  const dr = PI / 180; // degree to radian
  
  const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2; // mean anomaly, degree
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2; // mean longitude, degree
  
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
  
  let L = L0 + DL; // true longitude, degree
  L = L * dr;
  L = L - PI * 2 * INT(L / (PI * 2)); // Normalize to (0, 2*PI)
  
  return INT(L / PI * 6);
}

/**
 * Tìm ngày bắt đầu tháng 11 âm lịch (tháng có Đông chí)
 */
export function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  let k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  
  return nm;
}

/**
 * Xác định vị trí tháng nhuận
 * Trả về vị trí tháng nhuận sau tháng 11
 */
export function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  
  return i - 1;
}

/**
 * Đổi ngày dương lịch dd/mm/yyyy sang ngày âm lịch
 * Trả về: { day, month, year, isLeap }
 */
export function convertSolar2Lunar(dd: number, mm: number, yy: number, timeZone: number = 7.0) {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear = yy;
  
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = true;
      }
    }
  }
  
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  
  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeap: lunarLeap
  };
}

/**
 * Đổi ngày âm lịch sang dương lịch
 * Trả về: [dd, mm, yyyy]
 */
export function convertLunar2Solar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  lunarLeap: boolean,
  timeZone: number = 7.0
): [number, number, number] {
  let a11: number, b11: number;
  
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }
  
  let off = lunarMonth - 11;
  if (off < 0) {
    off += 12;
  }
  
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) {
      leapMonth += 12;
    }
    if (lunarLeap && lunarMonth !== leapMonth) {
      return [0, 0, 0];
    }
    if (lunarLeap || off >= leapOff) {
      off += 1;
    }
  }
  
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  const monthStart = getNewMoonDay(k + off, timeZone);
  
  return jdToDate(monthStart + lunarDay - 1);
}

/**
 * Tính Can của năm (Giáp, Ất, Bính, ...)
 */
export function getYearCan(year: number): number {
  return (year + 6) % 10;
}

/**
 * Tính Chi của năm (Tý, Sửu, Dần, ...)
 */
export function getYearChi(year: number): number {
  return (year + 8) % 12;
}

/**
 * Tính Can của ngày
 */
export function getDayCan(jd: number): number {
  return (jd + 9) % 10;
}

/**
 * Tính Chi của ngày
 */
export function getDayChi(jd: number): number {
  return (jd + 1) % 12;
}

/**
 * Tính Can của tháng âm lịch
 */
export function getMonthCan(month: number, year: number): number {
  return (year * 12 + month + 3) % 10;
}

/**
 * Tên các Can
 */
export const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
export const CAN = CAN_NAMES; // Alias

/**
 * Tên các Chi
 */
export const CHI_NAMES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
export const CHI = CHI_NAMES; // Alias

/**
 * Lấy tên Can Chi
 */
export function getCanChiName(can: number, chi: number): string {
  return `${CAN_NAMES[can]} ${CHI_NAMES[chi]}`;
}

/**
 * Lấy Can Chi của năm (âm lịch)
 */
export function getCanChiYear(year: number): { can: number; chi: number } {
  const can = (year + 6) % 10;
  const chi = (year + 8) % 12;
  return { can, chi };
}

/**
 * Lấy Can Chi của tháng (âm lịch)
 */
export function getCanChiMonth(month: number, year: number): { can: number; chi: number } {
  const yearCan = (year + 6) % 10;
  // Tháng Giêng (1) là Dần (2)
  const chi = (month + 1) % 12;
  // Can tháng dựa vào Can năm
  const can = (yearCan * 2 + month) % 10;
  return { can, chi };
}

/**
 * Lấy Can Chi của ngày (dương lịch)
 */
export function getCanChiDay(dd: number, mm: number, yy: number): { can: number; chi: number } {
  const jd = jdFromDate(dd, mm, yy);
  const can = getDayCan(jd);
  const chi = getDayChi(jd);
  return { can, chi };
}

/**
 * Lấy Can Chi của giờ
 */
export function getCanChiHour(hour: number, dayCan: number): { can: number; chi: number } {
  // Chi giờ: 23-1h = Tý (0), 1-3h = Sửu (1), ...
  const chi = Math.floor((hour + 1) / 2) % 12;
  // Can giờ dựa vào Can ngày
  const can = (dayCan * 2 + chi) % 10;
  return { can, chi };
}

/**
 * Tính Chi giờ từ giờ (0-23)
 */
export function getHourChi(hour: number): number {
  // 23-1h: Tý (0), 1-3h: Sửu (1), 3-5h: Dần (2), ...
  return Math.floor((hour + 1) / 2) % 12;
}

/**
 * 24 Tiết khí theo thứ tự (Xuân Phân = 0)
 * Mỗi tiết khí tương ứng với một cung hoàng đạo (30 độ)
 */
export const TIET_KHI = [
  { name: 'Xuân Phân', season: 'Xuân', element: 'Mộc', startDegree: 0 },
  { name: 'Thanh Minh', season: 'Xuân', element: 'Mộc', startDegree: 15 },
  { name: 'Cốc Vũ', season: 'Xuân', element: 'Mộc', startDegree: 30 },
  { name: 'Lập Hạ', season: 'Hạ', element: 'Hỏa', startDegree: 45 },
  { name: 'Tiểu Mãn', season: 'Hạ', element: 'Hỏa', startDegree: 60 },
  { name: 'Mang Chủng', season: 'Hạ', element: 'Hỏa', startDegree: 75 },
  { name: 'Hạ Chí', season: 'Hạ', element: 'Hỏa', startDegree: 90 },
  { name: 'Tiểu Thử', season: 'Hạ', element: 'Hỏa', startDegree: 105 },
  { name: 'Đại Thử', season: 'Hạ', element: 'Hỏa', startDegree: 120 },
  { name: 'Lập Thu', season: 'Thu', element: 'Kim', startDegree: 135 },
  { name: 'Xử Thử', season: 'Thu', element: 'Kim', startDegree: 150 },
  { name: 'Bạch Lộ', season: 'Thu', element: 'Kim', startDegree: 165 },
  { name: 'Thu Phân', season: 'Thu', element: 'Kim', startDegree: 180 },
  { name: 'Hàn Lộ', season: 'Thu', element: 'Kim', startDegree: 195 },
  { name: 'Sương Giáng', season: 'Thu', element: 'Kim', startDegree: 210 },
  { name: 'Lập Đông', season: 'Đông', element: 'Thủy', startDegree: 225 },
  { name: 'Tiểu Tuyết', season: 'Đông', element: 'Thủy', startDegree: 240 },
  { name: 'Đại Tuyết', season: 'Đông', element: 'Thủy', startDegree: 255 },
  { name: 'Đông Chí', season: 'Đông', element: 'Thủy', startDegree: 270 },
  { name: 'Tiểu Hàn', season: 'Đông', element: 'Thủy', startDegree: 285 },
  { name: 'Đại Hàn', season: 'Đông', element: 'Thủy', startDegree: 300 },
  { name: 'Lập Xuân', season: 'Xuân', element: 'Mộc', startDegree: 315 },
  { name: 'Vũ Thủy', season: 'Xuân', element: 'Mộc', startDegree: 330 },
  { name: 'Kinh Trập', season: 'Xuân', element: 'Mộc', startDegree: 345 },
] as const;

/**
 * Tính tọa độ mặt trời chính xác (độ)
 * Khác với getSunLongitude trả về cung, hàm này trả về độ chính xác
 */
export function getSunLongitudeDegree(jdn: number, timeZone: number): number {
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  
  const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
  
  let L = L0 + DL;
  L = L - 360 * INT(L / 360); // Normalize to 0-360
  
  return L;
}

/**
 * Lấy tiết khí hiện tại từ ngày dương lịch
 */
export function getCurrentTietKhi(dd: number, mm: number, yy: number, timeZone: number = 7.0) {
  const jdn = jdFromDate(dd, mm, yy);
  const sunLongitude = getSunLongitudeDegree(jdn, timeZone);
  
  // Tìm tiết khí tương ứng
  // Xuân Phân = 0 độ, mỗi tiết cách nhau 15 độ
  const tietKhiIndex = INT(sunLongitude / 15);
  const tietKhi = TIET_KHI[tietKhiIndex];
  
  return {
    ...tietKhi,
    sunLongitude: Math.round(sunLongitude * 100) / 100, // Làm tròn 2 số thập phân
    index: tietKhiIndex
  };
}

/**
 * Phân tích quan hệ mùa với Ngũ hành của Thể
 */
export function analyzeSeasonRelation(seasonElement: string, tiElement: string): {
  relation: 'thuận' | 'nghịch' | 'trung-hòa';
  description: string;
  advice: string;
} {
  // Ma trận sinh khắc
  const generating: Record<string, string> = {
    'Kim': 'Thủy',
    'Thủy': 'Mộc',
    'Mộc': 'Hỏa',
    'Hỏa': 'Thổ',
    'Thổ': 'Kim'
  };
  
  const controlling: Record<string, string> = {
    'Kim': 'Mộc',
    'Mộc': 'Thổ',
    'Thổ': 'Thủy',
    'Thủy': 'Hỏa',
    'Hỏa': 'Kim'
  };
  
  // Mùa sinh Thể hoặc cùng hành => Thuận
  if (generating[seasonElement] === tiElement || seasonElement === tiElement) {
    return {
      relation: 'thuận',
      description: `Mùa ${seasonElement} thuận lợi cho người mang hành ${tiElement}`,
      advice: 'Thời điểm tốt để điều trị và phục hồi. Cơ thể dễ hấp thu và đáp ứng điều trị.'
    };
  }
  
  // Thể sinh Mùa => Tiêu hao, trung hòa
  if (generating[tiElement] === seasonElement) {
    return {
      relation: 'trung-hòa',
      description: `Người hành ${tiElement} sinh cho mùa ${seasonElement}, có thể tiêu hao khí lực`,
      advice: 'Cần chú ý bồi bổ, nghỉ ngơi đầy đủ. Tránh làm việc quá sức trong thời điểm này.'
    };
  }
  
  // Mùa khắc Thể => Nghịch, bất lợi
  if (controlling[seasonElement] === tiElement) {
    return {
      relation: 'nghịch',
      description: `Mùa ${seasonElement} khắc chế người mang hành ${tiElement}`,
      advice: 'Thời điểm cần đặc biệt chú ý sức khỏe. Giữ ấm, tránh gió lạnh, ăn uống điều độ và nghỉ ngơi đầy đủ.'
    };
  }
  
  // Thể khắc Mùa => Thuận lợi nhẹ
  if (controlling[tiElement] === seasonElement) {
    return {
      relation: 'thuận',
      description: `Người hành ${tiElement} có sức đề kháng tốt trong mùa ${seasonElement}`,
      advice: 'Cơ thể có khả năng chống lại các tác nhân gây bệnh theo mùa. Duy trì lối sống lành mạnh.'
    };
  }
  
  // Không có quan hệ trực tiếp
  return {
    relation: 'trung-hòa',
    description: `Mùa ${seasonElement} và người hành ${tiElement} ở trạng thái trung hòa`,
    advice: 'Không có ảnh hưởng đặc biệt từ yếu tố mùa. Duy trì chế độ sinh hoạt bình thường.'
  };
}

/**
 * Lấy thông tin mùa đầy đủ cho ngày hiện tại
 */
export function getSeasonInfo(date: Date = new Date(), timeZone: number = 7.0) {
  const dd = date.getDate();
  const mm = date.getMonth() + 1;
  const yy = date.getFullYear();
  
  const tietKhi = getCurrentTietKhi(dd, mm, yy, timeZone);
  const lunar = convertSolar2Lunar(dd, mm, yy, timeZone);
  
  return {
    solar: { day: dd, month: mm, year: yy },
    lunar: lunar,
    tietKhi: {
      name: tietKhi.name,
      season: tietKhi.season,
      element: tietKhi.element,
      sunLongitude: tietKhi.sunLongitude
    },
    analyzeWithTi: (tiElement: string) => analyzeSeasonRelation(tietKhi.element, tiElement)
  };
}
