export interface CardBackground {
  bg: string;
  isDark: boolean;
}

const RAIN_CODES = new Set([
  1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198,
  1201, 1240, 1243, 1246,
]);
const SNOW_CODES = new Set([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258]);
const SLEET_CODES = new Set([1072, 1204, 1207, 1249, 1252]);
const THUNDER_CODES = new Set([1087, 1273, 1276, 1279, 1282]);
const CLOUDY_CODES = new Set([1006, 1009, 1030, 1135, 1147]);

export function getCardBackground(code: number, isDay: number): CardBackground {
  if (isDay === 0) return { bg: "from-slate-900 to-blue-950", isDark: true };
  if (code === 1000) return { bg: "from-amber-300 to-yellow-200", isDark: false };
  if (code === 1003) return { bg: "from-sky-400 to-blue-200", isDark: false };
  if (CLOUDY_CODES.has(code)) return { bg: "from-slate-400 to-slate-300", isDark: false };
  if (RAIN_CODES.has(code)) return { bg: "from-blue-700 to-indigo-400", isDark: true };
  if (SNOW_CODES.has(code)) return { bg: "from-sky-200 to-slate-100", isDark: false };
  if (SLEET_CODES.has(code)) return { bg: "from-cyan-600 to-slate-400", isDark: true };
  if (THUNDER_CODES.has(code)) return { bg: "from-slate-800 to-violet-700", isDark: true };
  return { bg: "from-sky-400 to-blue-200", isDark: false };
}

export function getMoonEmoji(phase: string): string {
  const map: Record<string, string> = {
    "New Moon": "🌑",
    "Waxing Crescent": "🌒",
    "First Quarter": "🌓",
    "Waxing Gibbous": "🌔",
    "Full Moon": "🌕",
    "Waning Gibbous": "🌖",
    "Last Quarter": "🌗",
    "Waning Crescent": "🌘",
  };
  return map[phase] ?? "🌙";
}

export function getUvColor(uv: number): string {
  if (uv <= 2) return "bg-green-500";
  if (uv <= 5) return "bg-yellow-400";
  if (uv <= 7) return "bg-orange-500";
  if (uv <= 10) return "bg-red-500";
  return "bg-violet-600";
}

export function getUvLabel(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}
