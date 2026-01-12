
import React, { useMemo } from 'react';
import { Transaction, AppSettings } from '../types';
import { formatCurrency, getMonthName } from '../utils';

interface Props {
  monthIndex: number;
  year: number;
  transactions: Transaction[];
  onBack: () => void;
  onDelete: (id: string) => void;
  settings: AppSettings;
}

const PieChart: React.FC<{ data: { name: string; amount: number }[]; total: number; theme: string }> = ({ data, total, theme }) => {
  let cumulativePercent = 0;

  function getCoordinatesForPercent(percent: number) {
    const x = Math.cos(2 * Math.PI * (percent - 0.25));
    const y = Math.sin(2 * Math.PI * (percent - 0.25));
    return [x, y];
  }

  const paths = data.map((slice, i) => {
    const startPercent = cumulativePercent;
    const slicePercent = slice.amount / total;
    cumulativePercent += slicePercent;
    const endPercent = cumulativePercent;

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);
    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L 0 0`,
    ].join(' ');

    const intensity = 0.9 - (i * (0.8 / Math.max(1, data.length - 1)));
    const fill = theme === 'dark' ? `rgba(255,255,255,${intensity})` : `rgba(0,0,0,${intensity})`;

    return <path key={slice.name} d={pathData} fill={fill} stroke={theme === 'dark' ? '#0a0a0a' : '#fff'} strokeWidth="0.02" />;
  });

  return (
    <svg viewBox="-1.1 -1.1 2.2 2.2" className="w-full h-full">
      {paths}
      <circle cx="0" cy="0" r="0.65" fill={theme === 'dark' ? '#0a0a0a' : '#fff'} />
    </svg>
  );
};

const MonthDetail: React.FC<Props> = ({ monthIndex, year, transactions, onBack, onDelete, settings }) => {
  const lang = settings.language;
  const theme = settings.theme;

  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en);

  const filtered = useMemo(() => transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === monthIndex && d.getFullYear() === year;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [transactions, monthIndex, year]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalSavings = filtered.filter(t => t.type === 'savings').reduce((sum, t) => sum + t.amount, 0);

  const categorySummary = useMemo(() => {
    const summary: Record<string, number> = {};
    filtered.filter(t => t.type === 'expense').forEach(t => {
      summary[t.category] = (summary[t.category] || 0) + t.amount;
    });
    return Object.entries(summary)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  return (
    <div className="min-h-screen p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="mb-8 text-sm uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="group-hover:-translate-x-1 transition-transform">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
        </svg>
        {t('返回年度', 'Back to Year')}
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-gray-100 dark:border-gray-800 pb-10">
        <div>
          <h1 className="text-5xl font-extralight mb-3 tracking-tight">{getMonthName(monthIndex, lang)} {year}</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">{filtered.length} {t('条交易记录', 'Total Transactions')}</p>
        </div>
        <div className="flex gap-10 mt-8 md:mt-0 text-right">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">{t('月收入', 'Monthly Income')}</div>
            <div className="text-xl text-green-600 font-light">{formatCurrency(totalIncome, lang)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">{t('月支出', 'Monthly Expense')}</div>
            <div className="text-xl text-red-600 font-light">{formatCurrency(totalExpense, lang)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">{t('月储蓄', 'Monthly Savings')}</div>
            <div className="text-xl text-amber-500 font-light">{formatCurrency(totalSavings, lang)}</div>
          </div>
        </div>
      </div>

      {categorySummary.length > 0 && (
        <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-gray-50/30 dark:bg-white/5 p-8 md:p-12 rounded-[2rem] border border-gray-100 dark:border-gray-800">
          <div className="flex justify-center">
            <div className="w-64 h-64 md:w-80 md:h-80 relative">
              <PieChart data={categorySummary} total={totalExpense} theme={theme} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-widest text-gray-400">{t('总支出', 'Total')}</span>
                <span className="text-xl font-light">{formatCurrency(totalExpense, lang)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold mb-8">{t('花费占比 (大类)', 'Expense Distribution')}</h2>
            <div className="grid grid-cols-1 gap-5">
              {categorySummary.map((cat, i) => {
                const percentage = totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0;
                const intensity = 0.9 - (i * (0.8 / Math.max(1, categorySummary.length - 1)));
                const barColor = theme === 'dark' ? `rgba(255,255,255,${intensity})` : `rgba(0,0,0,${intensity})`;
                
                return (
                  <div key={cat.name} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium truncate">{cat.name}</div>
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000 ease-out" 
                        style={{ width: `${percentage}%`, backgroundColor: barColor }}
                      />
                    </div>
                    <div className="w-24 text-right">
                      <div className="text-xs font-semibold">{percentage.toFixed(1)}%</div>
                      <div className="text-[10px] text-gray-400">{formatCurrency(cat.amount, lang)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 max-w-4xl mx-auto">
        <h2 className="text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold mb-8 text-center">{t('收支明细', 'Transaction Log')}</h2>
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-300 italic font-extralight text-lg">{t('虚位以待', 'Silence... no records yet')}</div>
        ) : (
          filtered.map(t_item => (
            <div key={t_item.id} className="group flex items-center justify-between py-5 border-b border-gray-50 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-white/5 px-6 -mx-6 rounded-2xl transition-all duration-300">
              <div className="flex gap-6 items-center">
                <div className="w-12 h-12 bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center text-xs font-mono shadow-sm group-hover:rotate-6 transition-transform">
                  {new Date(t_item.date).getDate()}
                </div>
                <div>
                  <div className="font-medium text-base mb-0.5">{t_item.description}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest">{t_item.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className={`text-xl font-light tracking-tight ${
                  t_item.type === 'income' ? 'text-green-600' : 
                  t_item.type === 'expense' ? 'text-red-600' : 
                  'text-amber-500'
                }`}>
                  {t_item.type === 'expense' ? '-' : '+'}{formatCurrency(t_item.amount, lang)}
                </div>
                <button 
                  onClick={() => onDelete(t_item.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all scale-90 hover:scale-110"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MonthDetail;
