
import React from 'react';
import { getMonthGrid, getMonthName, formatCurrency } from '../utils';
import { MonthlyStats, Language, Theme } from '../types';

interface Props {
  monthIndex: number;
  year: number;
  stats: MonthlyStats;
  onClick: () => void;
  language: Language;
  theme: Theme;
}

const MonthGrid: React.FC<Props> = ({ monthIndex, year, stats, onClick, language, theme }) => {
  const grid = getMonthGrid(year, monthIndex);
  const weekDays = language === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const hasData = stats.income > 0 || stats.expense > 0 || stats.savings > 0;

  const getBorderColor = () => {
    if (theme === 'dark') return 'border-gray-800 hover:border-white';
    if (theme === 'gray') return 'border-gray-200 hover:border-gray-600';
    return 'border-gray-50 hover:border-black';
  };

  const getMonthNameColor = () => {
    if (theme === 'dark') return 'text-white';
    return 'text-black';
  };

  const getTodayColor = () => {
    if (theme === 'dark') return 'text-white font-bold';
    return 'text-black font-bold';
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative cursor-pointer border-t pt-6 transition-all duration-500 ${getBorderColor()}`}
    >
      <div className="flex justify-between items-baseline mb-4">
        <h3 className={`font-medium text-sm tracking-tight ${getMonthNameColor()}`}>
          {getMonthName(monthIndex, language)}
        </h3>
        <span className="text-[10px] text-gray-300 font-mono">{(monthIndex + 1).toString().padStart(2, '0')}</span>
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center mb-4">
        {weekDays.map((wd, i) => (
          <div key={i} className="text-[8px] text-gray-200 font-bold uppercase">{wd}</div>
        ))}
        {grid.map((cell, i) => (
          <div 
            key={i} 
            className={`text-[9px] h-4 flex items-center justify-center ${
              cell.day === null ? 'invisible' : cell.isToday ? getTodayColor() : 'text-gray-300'
            }`}
          >
            {cell.day}
          </div>
        ))}
      </div>

      {/* Floating Stats Overlay */}
      {hasData && (
        <div className="absolute top-12 left-0 right-0 pointer-events-none flex flex-col items-center justify-center space-y-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
          {stats.income > 0 && (
            <div className={`text-[10px] font-semibold text-green-600 px-1 rounded backdrop-blur-[2px] ${theme === 'dark' ? 'bg-black/50' : 'bg-white/80'}`}>
              +{formatCurrency(stats.income, language)}
            </div>
          )}
          {stats.expense > 0 && (
            <div className={`text-[10px] font-semibold text-red-600 px-1 rounded backdrop-blur-[2px] ${theme === 'dark' ? 'bg-black/50' : 'bg-white/80'}`}>
              -{formatCurrency(stats.expense, language)}
            </div>
          )}
          {stats.savings > 0 && (
            <div className={`text-[10px] font-semibold text-amber-500 px-1 rounded backdrop-blur-[2px] ${theme === 'dark' ? 'bg-black/50' : 'bg-white/80'}`}>
              ★ {formatCurrency(stats.savings, language)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthGrid;
