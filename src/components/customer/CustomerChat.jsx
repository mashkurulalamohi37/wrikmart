import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, Image, MessageSquare, PhoneCall } from 'lucide-react';

export const CustomerChat = () => {
  const { chatMessages, sendChatMessage } = useApp();
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText, false);
    setInputText('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card flex flex-col h-[550px] overflow-hidden my-2">
      {/* Top Chat Header */}
      <div className="bg-navy-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center font-bold">
            WM
          </div>
          <div>
            <h3 className="font-bold text-sm">WrikMart Support & Agents</h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Available 24/7
            </span>
          </div>
        </div>

        <a 
          href="https://wa.me/8801700000000"
          target="_blank"
          rel="noreferrer"
          className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-200 transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">WhatsApp Help</span>
        </a>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.senderRole === 'customer' ? 'items-end' : 'items-start'
            }`}
          >
            <span className="text-[10px] text-slate-400 px-1 mb-0.5">{msg.senderName} • {msg.time}</span>
            <div
              className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                msg.senderRole === 'customer'
                  ? 'bg-brand-500 text-white rounded-br-none'
                  : 'bg-white text-navy-900 border border-slate-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about your pre-order, pricing or timing..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          className="bg-brand-500 hover:bg-brand-600 text-white p-2.5 rounded-xl transition-colors shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
