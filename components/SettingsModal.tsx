
import React from 'react';
import { Language, Theme, AppSettings } from '../types';
import { exportToJson } from '../utils';

interface Props {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  transactions: any[];
  onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({ settings, updateSettings, transactions, onClose }) => {
  const t = (zh: string, en: string) => (settings.language === 'zh' ? zh : en);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className={`w-full max-w-md rounded-2xl p-8 shadow-2xl transition-colors duration-300 ${
        settings.theme === 'dark' ? 'bg-[#1a1a1a] text-white border border-gray-800' : 
        settings.theme === 'gray' ? 'bg-gray-100 text-gray-900 border border-gray-200' : 
        'bg-white text-black'
      }`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-light tracking-tight">{t('设置', 'Settings')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="space-y-8">
          {/* Language Selection */}
          <section>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-3">{t('语言', 'Language')}</label>
            <div className="flex gap-2">
              {(['zh', 'en'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => updateSettings({ language: l })}
                  className={`flex-1 py-2 text-sm border rounded-lg transition-all ${
                    settings.language === l 
                      ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' 
                      : 'border-gray-200 hover:border-gray-400 text-gray-500'
                  }`}
                >
                  {l === 'zh' ? '中文' : 'English'}
                </button>
              ))}
            </div>
          </section>

          {/* Theme Selection */}
          <section>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-3">{t('配色方案', 'Color Scheme')}</label>
            <div className="flex gap-2">
              {(['light', 'dark', 'gray'] as Theme[]).map((th) => (
                <button
                  key={th}
                  onClick={() => updateSettings({ theme: th })}
                  className={`flex-1 py-2 text-sm border rounded-lg transition-all capitalize ${
                    settings.theme === th 
                      ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' 
                      : 'border-gray-200 hover:border-gray-400 text-gray-500'
                  }`}
                >
                  {t(
                    th === 'light' ? '极简白' : th === 'dark' ? '深邃黑' : '沉稳灰',
                    th.charAt(0).toUpperCase() + th.slice(1)
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Data Export */}
          <section className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => exportToJson(transactions, `zenledger_backup_${new Date().toISOString().split('T')[0]}`)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm uppercase tracking-widest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
              </svg>
              {t('导出数据 (JSON)', 'Export Data (JSON)')}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
