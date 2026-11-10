import { Hotspot, PuneEvent, ScoringWeights, ShiftType } from '../types';

export const DEFAULT_WEIGHTS: ScoringWeights = {
  commercial: 0.40,
  population: 0.30,
  events: 0.20,
  feedback: 0.10,
};

/**
 * Calculates raw score using Commercial 40%, Population 30%, Events 20%, Feedback 10%
 * Formats every score with one decimal place.
 */
export function calculateHotspotScore(
  hotspot: {
    commercialFactor: number;
    populationFactor: number;
    eventsFactor: number;
    feedbackFactor: number;
  },
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  const score =
    hotspot.commercialFactor * weights.commercial +
    hotspot.populationFactor * weights.population +
    hotspot.eventsFactor * weights.events +
    hotspot.feedbackFactor * weights.feedback;

  return Number(score.toFixed(1));
}

/**
 * Formats a score number with guaranteed single decimal place (e.g. 80.0, 74.5)
 */
export function formatScore(score: number): string {
  return Number(score).toFixed(1);
}

/**
 * Computes shift multiplier & day-of-week factor to dynamically adjust hotspot factors & yield.
 * Shift multipliers:
 * - Morning: high commercial opening, wholesale restock (comm x1.12, pop x1.05)
 * - Afternoon: moderate (comm x0.95, pop x0.90)
 * - Evening: heavy street food, night bazaar (comm x1.18, events x1.25, pop x1.10)
 * Day-of-week:
 * - Weekend (Sat/Sun): surge in events & residential packaging (+15%)
 */
export function computeDynamicFactors(
  baseHotspot: Hotspot,
  shift: ShiftType,
  dateString: string,
  eventsList: PuneEvent[]
): {
  commercialFactor: number;
  populationFactor: number;
  eventsFactor: number;
  feedbackFactor: number;
  estimatedKgPerDay: number;
} {
  const dateObj = new Date(dateString);
  const dayOfWeek = isNaN(dateObj.getTime()) ? 1 : dateObj.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let shiftCommMult = 1.0;
  let shiftPopMult = 1.0;
  let shiftEventsMult = 1.0;
  let shiftYieldMult = 1.0;

  if (shift.startsWith('Morning')) {
    shiftCommMult = 1.15;
    shiftPopMult = 1.08;
    shiftEventsMult = 0.95;
    shiftYieldMult = 1.12;
  } else if (shift.startsWith('Afternoon')) {
    shiftCommMult = 0.92;
    shiftPopMult = 0.88;
    shiftEventsMult = 0.90;
    shiftYieldMult = 0.90;
  } else if (shift.startsWith('Evening')) {
    shiftCommMult = 1.20;
    shiftPopMult = 1.05;
    shiftEventsMult = 1.30;
    shiftYieldMult = 1.22;
  }

  const weekendFactor = isWeekend ? 1.15 : 1.0;

  // Check matching events on this date for this hotspot
  const matchingEvents = eventsList.filter(
    (e) => e.hotspotId === baseHotspot.id && e.date === dateString
  );
  let eventBoost = 0;
  if (matchingEvents.length > 0) {
    const maxImpact = Math.max(...matchingEvents.map((e) => e.impactScore));
    eventBoost = Math.min(25, maxImpact * 0.25);
  }

  const commercialFactor = Math.min(
    100,
    Math.max(10, Math.round(baseHotspot.baseCommercialFactor * shiftCommMult))
  );
  const populationFactor = Math.min(
    100,
    Math.max(10, Math.round(baseHotspot.basePopulationFactor * shiftPopMult * (isWeekend ? 1.1 : 1.0)))
  );
  const eventsFactor = Math.min(
    100,
    Math.max(10, Math.round(baseHotspot.baseEventsFactor * shiftEventsMult * weekendFactor + eventBoost))
  );
  const feedbackFactor = Math.min(100, Math.max(10, baseHotspot.feedbackFactor));

  const estimatedKgPerDay = Math.round(
    baseHotspot.baseEstimatedKgPerDay * shiftYieldMult * weekendFactor
  );

  return {
    commercialFactor,
    populationFactor,
    eventsFactor,
    feedbackFactor,
    estimatedKgPerDay,
  };
}

/**
 * Relative quantile color tiering:
 * Divides the current dataset into 3 equal parts (top third, middle third, bottom third)
 * so that colors always meaningfully separate the hotspots in any view.
 */
export function getRelativeScoreTier(
  score: number,
  allScores: number[]
): {
  tier: 'High' | 'Medium' | 'Low';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
} {
  if (allScores.length === 0) {
    return {
      tier: 'High',
      label: 'Top 33% High',
      color: '#16a34a',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-300 dark:border-emerald-700',
      textColor: 'text-emerald-700 dark:text-emerald-300',
    };
  }

  const sorted = [...allScores].sort((a, b) => a - b);
  const lowThreshold = sorted[Math.floor(sorted.length * 0.33)];
  const highThreshold = sorted[Math.floor(sorted.length * 0.67)];

  if (score >= highThreshold) {
    return {
      tier: 'High',
      label: 'Top 33% High',
      color: '#16a34a', // Emerald
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-300 dark:border-emerald-700',
      textColor: 'text-emerald-700 dark:text-emerald-300',
    };
  } else if (score >= lowThreshold) {
    return {
      tier: 'Medium',
      label: 'Mid 33% Medium',
      color: '#ea580c', // Orange
      bgColor: 'bg-orange-50 dark:bg-orange-950/40',
      borderColor: 'border-orange-300 dark:border-orange-700',
      textColor: 'text-orange-700 dark:text-orange-300',
    };
  } else {
    return {
      tier: 'Low',
      label: 'Bottom 33% Low',
      color: '#64748b', // Slate/Grey
      bgColor: 'bg-slate-50 dark:bg-slate-800/60',
      borderColor: 'border-slate-300 dark:border-slate-700',
      textColor: 'text-slate-700 dark:text-slate-300',
    };
  }
}
