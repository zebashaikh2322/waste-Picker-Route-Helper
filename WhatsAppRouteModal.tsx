import React, { useState } from 'react';
import { DemoPicker, Language, OptimizedRoute } from '../types';
import { t } from '../utils/translations';
import { createWhatsAppShareUrl, generateWhatsAppMessage } from '../utils/whatsapp';
import {
  X,
  Copy,
  Check,
  Send,
  ExternalLink,
  MessageSquare,
  Smartphone,
} from 'lucide-react';

interface WhatsAppRouteModalProps {
  route: OptimizedRoute;
  picker: DemoPicker;
  onClose: () => void;
  lang: Language;
}

export const WhatsAppRouteModal: React.FC<WhatsAppRouteModalProps> = ({
  route,
  picker,
  onClose,
  lang,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(picker.phone || '');
  const [notes, setNotes] = useState('Carry heavy bags for cardboard and sorting gloves. Report to depot after shift.');
  const [copied, setCopied] = useState(false);

  const messageText = generateWhatsAppMessage({
    route,
    pickerName: picker.name,
    pickerBadge: picker.badgeId,
    notes,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleOpenWhatsApp = () => {
    const url = createWhatsAppShareUrl(messageText, phoneNumber);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                {t(lang, 'whatsappTitle')}
              </h3>
              <p className="text-[11px] text-emerald-100">
                English with Marathi & Hindi included · Google Maps walk links per stop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Dispatch Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Recipient Collector:
              </label>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                {picker.name} ({picker.badgeId})
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Phone Number:
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98231 44192"
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Field Advisory / Note:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional advisory to picker..."
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
              />
            </div>
          </div>

          {/* Live Smartphone Chat Mockup */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Message Preview
              </span>
              <span>All 3 Languages Included</span>
            </div>

            <div className="bg-[#e5ddd5] dark:bg-[#111b21] p-3 sm:p-4 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden font-sans">
              <div className="bg-white dark:bg-[#202c33] text-slate-900 dark:text-[#e9edef] rounded-lg p-3.5 shadow-sm border border-slate-200 dark:border-slate-700/50 space-y-2">
                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed select-all">
                  {messageText}
                </pre>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                  <span>Just now</span>
                  <span className="text-blue-500 font-bold">✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Copy fallback & WhatsApp share) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Slots are confirmed in the system when dispatched.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Copy message fallback */}
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 min-h-[48px] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">{t(lang, 'messageCopied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span>{t(lang, 'copyMessage')}</span>
                </>
              )}
            </button>

            {/* Share via WhatsApp */}
            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black min-h-[48px] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{t(lang, 'openWhatsApp')}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
