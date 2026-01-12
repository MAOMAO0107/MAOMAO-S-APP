
import React, { useState } from 'react';
import { Transaction, Language } from '../types';
import { classifyTransaction } from '../services/geminiService';

interface Props {
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  initialDate?: string;
  language: Language;
}

const TransactionModal: React.FC<Props> = ({ onClose, onSave, initialDate, language }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  const t = (zh: string, en: string) => (language === 'zh' ? zh : en);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    setIsLoading(true);
    try {
      const classification = await classifyTransaction(description, parseFloat(amount));
      onSave({
        description,
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
        category: classification.category,
        type: classification.type,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white text-black w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-200">
        <h2 className="text-2xl font-light mb-8 tracking-tight">{t('记账记录', 'Record Transaction')}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">{t('物品或事件', 'Item or Event')}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('例如：星巴克咖啡', 'e.g., Starbucks Coffee')}
              className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">{t('金额', 'Amount')}</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">{t('日期', 'Date')}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-b border-gray-200 py-2 focus:border-black outline-none transition-colors"
              required
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-black py-3 rounded-lg hover:bg-black hover:text-white transition-all text-sm uppercase tracking-widest"
            >
              {t('取消', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-all text-sm uppercase tracking-widest disabled:bg-gray-400"
            >
              {isLoading ? t('AI 分析中...', 'Analyzing...') : t('保存', 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
