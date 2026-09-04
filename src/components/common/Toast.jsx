import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const bgColors = {
    success: 'bg-emerald-600 text-white border-emerald-500',
    warning: 'bg-amber-600 text-white border-amber-500',
    error: 'bg-rose-600 text-white border-rose-500',
    info: 'bg-brand-600 text-white border-brand-500',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-bounce-short">
      <div className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl border ${bgColors[toast.type] || bgColors.info}`}>
        {icons[toast.type] || icons.info}
        <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
      </div>
    </div>
  );
};
