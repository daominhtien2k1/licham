/**
 * Thư viện tính Âm Lịch Việt Nam
 * Dựa trên thuật toán của Hồ Ngọc Đức (www.informatik.uni-leipzig.de/~duc)
 * Múi giờ Việt Nam: UTC+7
 */

const TIMEZONE = 7; // UTC+7

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  leap: boolean;
  jd: number;
}

export interface CanChiInfo {
  canNam: string;
  chiNam: string;
  canThang: string;
  chiThang: string;
  canNgay: string;
  chiNgay: string;
  tenNam: string;
  tenThang: string;
  tenNgay: string;
}

export interface TietKhi {
  name: string;
  date: Date;
}

const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const TIET_KHI = [
  "Tiểu Hàn", "Đại Hàn", "Lập Xuân", "Vũ Thủy", "Kinh Trập", "Xuân Phân",
  "Thanh Minh", "Cốc Vũ", "Lập Hạ", "Tiểu Mãn", "Mang Chủng", "Hạ Chí",
  "Tiểu Thử", "Đại Thử", "Lập Thu", "Xử Thử", "Bạch Lộ", "Thu Phân",
  "Hàn Lộ", "Sương Giáng", "Lập Đông", "Tiểu Tuyết", "Đại Tuyết", "Đông Chí"
];

const GIO_HOANG_DAO: Record<string, string[]> = {
  "Tý": ["23-01", "07-09", "13-15"],
  "Sửu": ["01-03", "09-11", "15-17"],
  "Dần": ["01-03", "07-09", "11-13", "17-19"],
  "Mão": ["03-05", "09-11", "13-15", "19-21"],
  "Thìn": ["05-07", "09-11", "15-17", "19-21"],
  "Tỵ": ["05-07", "11-13", "15-17", "21-23"],
  "Ngọ": ["07-09", "11-13", "17-19", "21-23"],
  "Mùi": ["01-03", "07-09", "13-15", "17-19"],
  "Thân": ["01-03", "05-07", "09-11", "15-17"],
  "Dậu": ["03-05", "05-07", "11-13", "17-19"],
  "Tuất": ["03-05", "07-09", "13-15", "19-21"],
  "Hợi": ["01-03", "05-07", "11-13", "21-23"],
};

function INT(d: number): number {
  return Math.floor(d);
}

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
}

function jdToDate(jd: number): [number, number, number] {
  let a, b, c;
  if (jd > 2299160) {
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

function newMoon(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 -= 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 -= 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 += 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (M + 2 * Mpr));
  let deltat;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  return Jd1 + C1 - deltat;
}

function sunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
  const DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  const DL2 = (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  const L = L0 + DL + DL2;
  const theta = L - 0.00569 - 0.00478 * Math.sin(dr * (125.04 - 1934.136 * T));
  return theta - 360 * INT(theta / 360);
}

function getSunLongitude(dayNumber: number, timeZone: number): number {
  return INT(sunLongitude(dayNumber - 0.5 - timeZone / 24) / 30);
}

function getNewMoonDay(k: number, timeZone: number): number {
  return INT(newMoon(k) + 0.5 + timeZone / 24);
}

function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021.076998695;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

export function solarToLunar(dd: number, mm: number, yy: number): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, TIMEZONE);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, TIMEZONE);
  }
  let a11 = getLunarMonth11(yy, TIMEZONE);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, TIMEZONE);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, TIMEZONE);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, TIMEZONE);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = true;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    leap: lunarLeap,
    jd: dayNumber,
  };
}

export function lunarToSolar(lunarDay: number, lunarMonth: number, lunarYear: number, lunarLeap: boolean): [number, number, number] {
  let a11, b11;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, TIMEZONE);
    b11 = getLunarMonth11(lunarYear, TIMEZONE);
  } else {
    a11 = getLunarMonth11(lunarYear, TIMEZONE);
    b11 = getLunarMonth11(lunarYear + 1, TIMEZONE);
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  let leapOff = 0;
  if (b11 - a11 > 365) {
    leapOff = getLeapMonthOffset(a11, TIMEZONE);
    const leapMonth = leapOff - 2;
    const lm = leapMonth < 0 ? leapMonth + 12 : leapMonth;
    if (lunarLeap && lunarMonth !== lm) return [0, 0, 0];
    if (lunarLeap || off >= leapOff) off++;
  }
  const monthStart = getNewMoonDay(k + off, TIMEZONE);
  return jdToDate(monthStart + lunarDay - 1);
}

export function getCanChiNam(year: number): { can: string; chi: string; name: string } {
  const can = CAN[(year + 6) % 10];
  const chi = CHI[(year + 8) % 12];
  return { can, chi, name: `${can} ${chi}` };
}

export function getCanChiThang(lunarMonth: number, lunarYear: number): { can: string; chi: string; name: string } {
  const canIndex = (lunarYear * 12 + lunarMonth + 3) % 10;
  const chiIndex = (lunarMonth + 1) % 12;
  return { can: CAN[canIndex], chi: CHI[chiIndex], name: `${CAN[canIndex]} ${CHI[chiIndex]}` };
}

export function getCanChiNgay(jd: number): { can: string; chi: string; name: string } {
  const canIndex = (jd + 9) % 10;
  const chiIndex = (jd + 1) % 12;
  return { can: CAN[canIndex], chi: CHI[chiIndex], name: `${CAN[canIndex]} ${CHI[chiIndex]}` };
}

export function getTietKhi(date: Date): string {
  const jd = jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const sl = INT(sunLongitude(jd - 0.5 - TIMEZONE / 24));
  const idx = INT(sl / 15);
  return TIET_KHI[idx % 24];
}

export function getGioHoangDao(chiNgay: string): string[] {
  return GIO_HOANG_DAO[chiNgay] || [];
}

export function getDayName(day: number): string {
  const names = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  return names[day];
}

export function getLunarMonthName(month: number): string {
  if (month === 1) return "Tháng Giêng";
  if (month === 12) return "Tháng Chạp";
  return `Tháng ${month}`;
}

export function isSpecialLunarDay(lunarDay: number, lunarMonth: number): { isMung1: boolean; isRam: boolean; isMung8: boolean; isMung23: boolean } {
  return {
    isMung1: lunarDay === 1,
    isRam: lunarDay === 15,
    isMung8: lunarDay === 8,
    isMung23: lunarDay === 23,
  };
}

/** Lấy thông tin âm lịch đầy đủ cho một ngày dương lịch */
export function getFullLunarInfo(date: Date) {
  const dd = date.getDate();
  const mm = date.getMonth() + 1;
  const yy = date.getFullYear();
  const lunar = solarToLunar(dd, mm, yy);
  const canChiNam = getCanChiNam(lunar.year);
  const canChiThang = getCanChiThang(lunar.month, lunar.year);
  const canChiNgay = getCanChiNgay(lunar.jd);
  const gioHoangDao = getGioHoangDao(canChiNgay.chi);
  const tietKhi = getTietKhi(date);
  const special = isSpecialLunarDay(lunar.day, lunar.month);

  return {
    lunar,
    canChiNam,
    canChiThang,
    canChiNgay,
    gioHoangDao,
    tietKhi,
    special,
  };
}

/** Tính ngày dương lịch của Mùng 1 và Rằm trong tháng âm lịch sắp tới */
export function getUpcomingLunarEvents(daysAhead = 90): Array<{ type: "mung1" | "ram"; lunarDate: LunarDate; solarDate: Date; label: string }> {
  const events: Array<{ type: "mung1" | "ram"; lunarDate: LunarDate; solarDate: Date; label: string }> = [];
  const today = new Date();

  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const lunar = solarToLunar(d.getDate(), d.getMonth() + 1, d.getFullYear());

    if (lunar.day === 1) {
      events.push({
        type: "mung1",
        lunarDate: lunar,
        solarDate: d,
        label: `Mùng Một tháng ${lunar.month} năm ${getCanChiNam(lunar.year).name}`,
      });
    } else if (lunar.day === 15) {
      events.push({
        type: "ram",
        lunarDate: lunar,
        solarDate: d,
        label: `Rằm tháng ${lunar.month} năm ${getCanChiNam(lunar.year).name}`,
      });
    }
  }
  return events;
}
