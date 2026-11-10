import React, { useState } from 'react';
import { CollectionFeedback, Hotspot, Language, ShiftType, SlotBooking } from '../types';
import { SHARED_WASTE_TYPES } from '../utils/assumptions';
import { t } from '../utils/translations';
import {
  MessageSquarePlus,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Scale,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface FeedbackFormProps {
  hotspots: Hotspot[];
  selectedHotspotForFeedback: Hotspot | null;
  feedbacks: CollectionFeedback[];
  onSubmitFeedback: (feedback: Omit<CollectionFeedback, 'id' | 'submittedAt'>) => {
    oldScore: number;
    newScore: number;
    error?: string;
  };
  lang: Language;
  shift: ShiftType;
  currentPickerName: string;
  currentPickerBadge: string;
  bookings: SlotBooking[];
  date: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  hotspots,
  selectedHotspotForFeedback,
  feedbacks,
  onSubmitFeedback,
  lang,
  shift,
  currentPickerName,
  currentPickerBadge,
  bookings,
  date,
}) => {
  const [selectedBookingId, setSelectedBookingId] = useState(
    bookings.find((booking) => booking.hotspotId === selectedHotspotForFeedback?.id)?.id || bookings[0]?.id || ''
  );
  const [collectedKg, setCollectedKg] = useState<number>(85);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([
    'Cardboard',
    'PET bottles',
  ]);
  const [segregationQuality, setSegregationQuality] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [spotCondition, setSpotCondition] = useState<
    CollectionFeedback['spotCondition']
  >('Cleared');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  
  const [successInfo, setSuccessInfo] = useState<{
    oldScore: number;
    newScore: number;
    accuracy: number;
  } | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Pagination for logs ("Load more" button, no inner scrolling cut-off)
  const [visibleLogsCount, setVisibleLogsCount] = useState(4);

  // Sync if selectedHotspotForFeedback prop changes
  React.useEffect(() => {
    if (selectedHotspotForFeedback) {
      const booking = bookings.find((item) => item.hotspotId === selectedHotspotForFeedback.id);
      if (booking) setSelectedBookingId(booking.id);
    }
  }, [selectedHotspotForFeedback, bookings]);

  React.useEffect(() => {
    if (!bookings.some((booking) => booking.id === selectedBookingId)) {
      setSelectedBookingId(bookings[0]?.id || '');
    }
  }, [bookings, selectedBookingId]);

  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId);
  const currentSpot = selectedBooking ? hotspots.find((h) => h.id === selectedBooking.hotspotId) : undefined;
  const predictedKg = currentSpot ? Math.round(currentSpot.estimatedKgPerDay * 0.28) : 80;

  const toggleWasteType = (type: string) => {
    if (selectedWasteTypes.includes(type)) {
      setSelectedWasteTypes(selectedWasteTypes.filter((t) => t !== type));
    } else {
      setSelectedWasteTypes([...selectedWasteTypes, type]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSpot) return;

    if (!collectedKg || collectedKg <= 0) {
      alert('Please enter a valid collected weight in kg.');
      return;
    }

    if (selectedWasteTypes.length === 0) {
      alert('Please select at least one collected recyclable waste type.');
      return;
    }

    // Compute accuracy %
    const accuracy = Math.max(
      10,
      Math.min(100, Math.round((1 - Math.abs(collectedKg - predictedKg) / Math.max(predictedKg, 1)) * 100))
    );

    const result = onSubmitFeedback({
      hotspotId: currentSpot.id,
      hotspotName: currentSpot.name,
      bookingId: selectedBooking?.id,
      pickerName: currentPickerName,
      swachMemberId: currentPickerBadge,
      collectionDate: date,
      shift: shift.split(' ')[0],
      predictedKg,
      collectedKg: Number(collectedKg),
      accuracyPct: accuracy,
      wasteTypesFound: selectedWasteTypes,
      segregationQuality,
      spotCondition,
      rating,
      comments: comments.trim(),
    });

    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    setSubmitError('');
    setSuccessInfo({
      oldScore: result.oldScore,
      newScore: result.newScore,
      accuracy,
    });
    setTimeout(() => setSuccessInfo(null), 5000);

    setComments('');
  };

  // Helper to format name as first name and member ID as last 2 digits: "Sunita (..92)"
  const formatPickerDisplay = (fullName: string, memberId?: string) => {
    const firstName = fullName.split(' ')[0] || fullName;
    const cleanId = (memberId || '').replace(/[^0-9]/g, '');
    const last2Digits = cleanId.length >= 2 ? cleanId.slice(-2) : '..';
    return `${firstName} (..${last2Digits})`;
  };

  const displayedFeedbacks = feedbacks.slice(0, visibleLogsCount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Form Column (7 cols) */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-emerald-600" />
              <span>{t(lang, 'feedbackTitle')}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t(lang, 'feedbackSub')}
            </p>
          </div>
        </div>

        {/* Success toast showing old -> new score & accuracy */}
        {successInfo && (
          <div className="mx-4 sm:mx-5 mt-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {t(lang, 'feedbackSavedToast', {
                  oldScore: successInfo.oldScore.toFixed(1),
                  newScore: successInfo.newScore.toFixed(1),
                })}
              </span>
            </div>
            <span className="font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300">
              {successInfo.accuracy}% accuracy
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-sm">
          {submitError && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              {submitError}
            </p>
          )}
          {/* Target Hotspot */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t(lang, 'formSpot')} *
            </label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              required={bookings.length > 0}
              disabled={bookings.length === 0}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm min-h-[48px]"
            >
              {bookings.length === 0 ? (
                <option value="">Book a spot first</option>
              ) : bookings.map((booking) => {
                const spot = hotspots.find((item) => item.id === booking.hotspotId);
                if (!spot) return null;
                return (
                <option key={booking.id} value={booking.id}>
                  {lang === 'mr' ? spot.marathiName : lang === 'hi' ? spot.hindiName : spot.name} ({spot.zone})
                </option>
                );
              })}
            </select>
            {bookings.length === 0 && (
              <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">Book a spot first for {date} and the selected shift.</p>
            )}
          </div>

          {/* Picker Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t(lang, 'formPickerName')} *
              </label>
              <input
                type="text"
                readOnly
                value={currentPickerName}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t(lang, 'formMemberId')} *
              </label>
              <input
                type="text"
                readOnly
                value={currentPickerBadge}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono min-h-[44px]"
              />
            </div>
          </div>

          {/* Weight & Comparison to Predicted */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t(lang, 'formWeight')} *
                </label>
                <span className="text-[11px] text-slate-400">
                  {t(lang, 'formPredictedCompare', { pred: predictedKg })}
                </span>
              </div>
              <input
                type="number"
                required
                min={1}
                max={500}
                value={collectedKg}
                onChange={(e) => setCollectedKg(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-base min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t(lang, 'formCondition')}
              </label>
              <select
                value={spotCondition}
                onChange={(e) =>
                  setSpotCondition(e.target.value as CollectionFeedback['spotCondition'])
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm min-h-[48px]"
              >
                <option value="Cleared">Cleared Completely</option>
                <option value="Partially Cleared">Partially Cleared</option>
                <option value="Overflowing">Still Overflowing</option>
                <option value="Inaccessible">Inaccessible / Blocked</option>
              </select>
            </div>
          </div>

          {/* ONE SHARED WASTE TYPES LIST (9 categories) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t(lang, 'formWasteTypes')} *
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SHARED_WASTE_TYPES.map((type) => {
                const isChecked = selectedWasteTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleWasteType(type)}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors min-h-[40px] cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t(lang, 'formSegregation')}
              </label>
              <div className="flex items-center gap-1 mt-1">
                {([1, 2, 3, 4, 5] as const).map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSegregationQuality(star)}
                    className="p-1.5 text-amber-500 hover:scale-110 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= segregationQuality
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t(lang, 'formRating')}
              </label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1.5 text-emerald-500 hover:scale-110 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-emerald-500 text-emerald-500'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t(lang, 'formNotes')}
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Cardboard bundles placed neatly behind retail stores..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={bookings.length === 0 || !currentSpot}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 text-white font-extrabold text-sm min-h-[48px] flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{t(lang, 'submitFeedback')}</span>
          </button>
        </form>
      </div>

      {/* Collection Logs Column (5 cols, normal list with Load More) */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t(lang, 'collectionLogsTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing first name and member ID (..92) with haul accuracy %
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {feedbacks.length} logs
          </span>
        </div>

        {/* Normal unclipped list */}
        <div className="p-4 sm:p-5 space-y-3 flex-1">
          {displayedFeedbacks.map((fb) => (
            <div
              key={fb.id}
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                    {fb.hotspotName}
                  </span>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    {/* First name and last 2 digits */}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatPickerDisplay(fb.pickerName, fb.swachMemberId)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{fb.shift} Shift</span>
                    <span aria-hidden="true">·</span>
                    <span>{fb.collectionDate}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400 block">
                    {fb.collectedKg} kg
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {fb.accuracyPct}% accuracy
                  </span>
                </div>
              </div>

              {/* Shared waste types badges */}
              <div className="flex flex-wrap gap-1">
                {fb.wasteTypesFound.map((wt) => (
                  <span
                    key={wt}
                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-400 font-medium"
                  >
                    {wt}
                  </span>
                ))}
              </div>

              {fb.comments && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  "{fb.comments}"
                </p>
              )}
            </div>
          ))}

          {/* Load More Button */}
          {visibleLogsCount < feedbacks.length ? (
            <button
              onClick={() => setVisibleLogsCount((prev) => prev + 4)}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors min-h-[44px] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
              <span>{t(lang, 'loadMoreLogs')} ({feedbacks.length - visibleLogsCount} remaining)</span>
            </button>
          ) : (
            <p className="text-center text-xs text-slate-400 py-2">
              {t(lang, 'noMoreLogs')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
