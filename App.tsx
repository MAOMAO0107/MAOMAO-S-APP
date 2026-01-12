
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, MonthlyStats, AppSettings, Language, Theme } from './types';
import { formatCurrency, getDailyQuote } from './utils';
import TransactionModal from './components/TransactionModal';
import MonthDetail from './components/MonthDetail';
import MonthGrid from './components/MonthGrid';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [year] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('zen_ledger_txs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('zen_ledger_settings');
    return saved ? JSON.parse(saved) : { language: 'zh', theme: 'light' };
  });

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('zen_ledger_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('zen_ledger_settings', JSON.stringify(settings));
    document.body.className = settings.theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 
                               settings.theme === 'gray' ? 'bg-gray-100 text-gray-900' : 
                               'bg-white text-black';
  }, [settings]);

  const monthlySummaries = useMemo(() => {
    const summaries: Record<number, MonthlyStats> = {};
    for (let i = 0; i < 12; i++) {
      summaries[i] = { income: 0, expense: 0, savings: 0 };
    }

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getFullYear() === year) {
        const m = d.getMonth();
        if (t.type === 'income') summaries[m].income += t.amount;
        if (t.type === 'expense') summaries[m].expense += t.amount;
        if (t.type === 'savings') summaries[m].savings += t.amount;
      }
    });

    return summaries;
  }, [transactions, year]);

  const handleSaveTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setTransactions(prev => [...prev, { ...newTx, id }]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const months = Array.from({ length: 12 }, (_, i) => i);
  const t = (zh: string, en: string) => (settings.language === 'zh' ? zh : en);
  const dailyQuote = useMemo(() => getDailyQuote(settings.language), [settings.language]);

  return (
    <div className={`min-h-screen relative font-light transition-colors duration-500 overflow-x-hidden ${
      settings.theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 
      settings.theme === 'gray' ? 'bg-gray-100 text-gray-900' : 
      'bg-white text-black'
    }`}>
      <div className="max-w-7xl mx-auto">
        {selectedMonth === null ? (
          <div className="p-8 md:p-12 pb-32 animate-in fade-in duration-1000">
            <header className="mb-20 flex justify-between items-start">
              <div className="max-w-2xl">
                <h1 className="text-7xl font-extralight tracking-tighter">{year}</h1>
                <div className="text-gray-400 italic tracking-wide text-sm mt-3 border-l-2 border-gray-200 dark:border-gray-800 pl-4 py-1">
                  "{dailyQuote}"
                </div>
              </div>
              
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                aria-label={t('设置', 'Settings')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-16">
              {months.map((m) => (
                <MonthGrid 
                  key={m}
                  monthIndex={m}
                  year={year}
                  stats={monthlySummaries[m]}
                  onClick={() => setSelectedMonth(m)}
                  language={settings.language}
                  theme={settings.theme}
                />
              ))}
            </div>

            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40">
              <button
                onClick={() => setIsModalOpen(true)}
                className={`px-12 py-5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-[0.3em] font-semibold ${
                  settings.theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                }`}
              >
                {t('开始记账', 'Start Recording')}
              </button>
            </div>
          </div>
        ) : (
          <MonthDetail 
            monthIndex={selectedMonth}
            year={year}
            transactions={transactions}
            onBack={() => setSelectedMonth(null)}
            onDelete={handleDeleteTransaction}
            settings={settings}
          />
        )}
      </div>

      {isModalOpen && (
        <TransactionModal
          language={settings.language}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTransaction}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          updateSettings={updateSettings}
          transactions={transactions}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
