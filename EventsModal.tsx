import React, { useState } from 'react';
import { Hotspot, Language, PuneEvent } from '../types';
import { t } from '../utils/translations';
import { X, Calendar, Plus, Trash2, Check, Sparkles } from 'lucide-react';

interface EventsModalProps {
  events: PuneEvent[];
  hotspots: Hotspot[];
  onSaveEvents: (events: PuneEvent[]) => void;
  onClose: () => void;
  lang: Language;
}

export const EventsModal: React.FC<EventsModalProps> = ({
  events,
  hotspots,
  onSaveEvents,
  onClose,
  lang,
}) => {
  const [eventList, setEventList] = useState<PuneEvent[]>([...events]);
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hotspotId, setHotspotId] = useState(hotspots[0]?.id || '');
  const [impactScore, setImpactScore] = useState(85);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newEvt: PuneEvent = {
      id: `evt-${Date.now()}`,
      name: name.trim(),
      marathiName: name.trim(),
      hindiName: name.trim(),
      date,
      hotspotId,
      impactScore: Number(impactScore) || 75,
    };

    const updated = [newEvt, ...eventList];
    setEventList(updated);
    onSaveEvents(updated);

    setName('');
  };

  const handleDelete = (id: string) => {
    const updated = eventList.filter((e) => e.id !== id);
    setEventList(updated);
    onSaveEvents(updated);
  };

  return (
    <div className="fixed inset-0 z-[1250] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t(lang, 'eventsTitle')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            {t(lang, 'eventsSub')}
          </p>

          {/* Add Event Form */}
          <form onSubmit={handleAdd} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
              + {t(lang, 'addEvent')}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t(lang, 'eventName')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Tech Fest / Mandi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t(lang, 'eventDate')}
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t(lang, 'eventPlace')}
                </label>
                <select
                  value={hotspotId}
                  onChange={(e) => setHotspotId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md"
                >
                  {hotspots.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t(lang, 'eventImpact')}
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={impactScore}
                  onChange={(e) => setImpactScore(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs min-h-[40px] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t(lang, 'saveEvent')}</span>
            </button>
          </form>

          {/* Existing Events List */}
          <div className="space-y-2">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
              Active Events ({eventList.length})
            </span>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
              {eventList.map((evt) => {
                const targetSpot = hotspots.find((h) => h.id === evt.hotspotId);
                return (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {evt.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {evt.date} · {targetSpot?.name || evt.hotspotId} · Impact: {evt.impactScore}/100
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(evt.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold min-h-[44px] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
