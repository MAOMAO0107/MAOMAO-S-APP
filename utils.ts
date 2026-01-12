
import { Language } from './types';

export const formatCurrency = (amount: number, lang: Language = 'zh') => {
  return new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    style: 'currency',
    currency: lang === 'zh' ? 'CNY' : 'USD',
  }).format(amount);
};

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_ZH = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

export const getMonthName = (monthIndex: number, lang: Language = 'zh') => {
  return lang === 'zh' ? MONTHS_ZH[monthIndex] : MONTHS_EN[monthIndex];
};

export interface CalendarDay {
  day: number | null;
  isToday: boolean;
}

export const getMonthGrid = (year: number, month: number): CalendarDay[] => {
  const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const grid: CalendarDay[] = [];
  
  // Padding for start of month
  for (let i = 0; i < firstDay; i++) {
    grid.push({ day: null, isToday: false });
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({ 
      day: d, 
      isToday: isCurrentMonth && today.getDate() === d 
    });
  }

  return grid;
};

export const exportToJson = (data: any, fileName: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const QUOTES = [
  { zh: "节俭是穷人的财富，是富人的智慧。", en: "Thrift is the wealth of the poor and the wisdom of the rich." },
  { zh: "省下一分钱，就是赚了一分钱。", en: "A penny saved is a penny earned." },
  { zh: "防微杜渐，小洞不补大洞吃苦。", en: "Beware of little expenses; a small leak will sink a great ship." },
  { zh: "艺术不在于赚钱，而在于留钱。", en: "The art is not in making money, but in keeping it." },
  { zh: "买不需要的东西就是在偷自己的钱。", en: "He who buys what he does not need, steals from himself." },
  { zh: "成功的秘诀在于开始。", en: "The secret of getting ahead is getting started." },
  { zh: "追求进步，而非完美。", en: "Strive for progress, not perfection." },
  { zh: "天才是一分灵感加九十九分汗水。", en: "Genius is one percent inspiration and ninety-nine percent perspiration." },
  { zh: "理财就是理人生。", en: "Managing finances is managing life." },
  { zh: "克制是通往自由的必经之路。", en: "Restraint is the necessary path to freedom." }
];

export const getDailyQuote = (lang: Language) => {
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const quote = QUOTES[dayOfYear % QUOTES.length];
  return lang === 'zh' ? quote.zh : quote.en;
};
