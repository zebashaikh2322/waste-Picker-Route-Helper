import React, { useState, useEffect, useMemo } from 'react';
import {
  AuthUser,
  CollectionAssumptions,
  CollectionFeedback,
  DemoPicker,
  Hotspot,
  Language,
  OptimizedRoute,
  PuneEvent,
  ScoringWeights,
  ShiftType,
} from './types';
import {
  INITIAL_PUNE_HOTSPOTS,
  INITIAL_FEEDBACK_DATA,
  INITIAL_PUNE_EVENTS,
  PUNE_STARTING_HUBS,
} from './data/puneHotspots';
import { DEFAULT_WEIGHTS, calculateHotspotScore, computeDynamicFactors } from './utils/scoring';
import { DEFAULT_COLLECTION_ASSUMPTIONS, loadSavedAssumptions, saveAssumptions } from './utils/assumptions';
import { getAvailability, getBookings, releaseSlot, reserveSlot } from './utils/booking';
import {
  clearAuthenticatedUser,
  loadAuthenticatedUser,
  saveAuthenticatedUser,
  seedDemoUsers,
} from './utils/auth';
import { buildOptimizedRoute } from './utils/routing';
import { t } from './utils/translations';
import { Navbar } from './components/Navbar';
import { BottomTabBar, TabKey } from './components/BottomTabBar';
import { DashboardStats } from './components/DashboardStats';
import { LiveOccupancySection } from './components/LiveOccupancySection';
import { HotspotExplorerMap } from './components/HotspotExplorerMap';
import { HotspotsTable } from './components/HotspotsTable';
import { RouteOptimizer } from './components/RouteOptimizer';
import { BottomSheet } from './components/BottomSheet';
import { WhatsAppRouteModal } from './components/WhatsAppRouteModal';
import { FeedbackForm } from './components/FeedbackForm';
import { AssumptionsModal } from './components/AssumptionsModal';
import { EventsModal } from './components/EventsModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { WeightSettingsModal } from './components/WeightSettingsModal';
import { AuthScreen } from './components/AuthScreen';

const STORAGE_KEYS = {
  LANG: 'swach_pune_lang_v3',
  THEME: 'swach_pune_theme_v3',
  EVENTS: 'swach_pune_events_v3',
  FEEDBACK: 'swach_pune_feedback_v3',
  WEIGHTS: 'swach_pune_weights_v3',
  HOTSPOTS: 'swach_pune_hotspots_v3',
};

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [bookingRevision, setBookingRevision] = useState(0);
  const bookings = useMemo(() => getBookings(), [bookingRevision]);

  useEffect(() => {
    let active = true;
    seedDemoUsers()
      .then((users) => {
        if (active) setAuthUser(loadAuthenticatedUser(users));
      })
      .catch((error) => {
        if (active) setAuthError(error instanceof Error ? error.message : 'Unable to load local user data.');
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activePicker: DemoPicker | null = authUser
    ? {
        id: authUser.id,
        name: authUser.fullName,
        badgeId: authUser.memberId,
        phone: authUser.mobile,
      }
    : null;

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.THEME) === 'dark';
  });

  // Language state (English, Marathi, Hindi)
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    return (localStorage.getItem(STORAGE_KEYS.LANG) as Language) || 'en';
  });

  // Tab key
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  // Dynamic Shift & Date states (changing these recalculates all yields & scores)
  const [shift, setShift] = useState<ShiftType>('Morning (6 AM - 10 AM)');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Assumptions
  const [assumptions, setAssumptions] = useState<CollectionAssumptions>(() => loadSavedAssumptions());

  // Weights
  const [weights, setWeights] = useState<ScoringWeights>(() => {
    if (typeof window === 'undefined') return DEFAULT_WEIGHTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WEIGHTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_WEIGHTS;
  });

  // Events list (feeds 20% events factor)
  const [events, setEvents] = useState<PuneEvent[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PUNE_EVENTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_PUNE_EVENTS;
  });

  // Base Hotspots list
  const [baseHotspots, setBaseHotspots] = useState<Hotspot[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PUNE_HOTSPOTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HOTSPOTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_PUNE_HOTSPOTS;
  });

  // Collection Feedback logs
  const [feedbacks, setFeedbacks] = useState<CollectionFeedback[]>(() => {
    if (typeof window === 'undefined') return INITIAL_FEEDBACK_DATA;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_FEEDBACK_DATA;
  });

  const feedbackBookings = useMemo(() => {
    if (!activePicker) return [];
    return bookings.filter((booking) =>
      booking.pickerId === activePicker.id &&
      booking.date === date &&
      booking.shift === shift &&
      booking.status === 'confirmed' &&
      !feedbacks.some((feedback) => feedback.bookingId === booking.id)
    );
  }, [activePicker?.id, bookings, date, shift, feedbacks]);

  const userFeedbacks = useMemo(
    () => (authUser ? feedbacks.filter((feedback) => feedback.userId === authUser.id) : []),
    [authUser?.id, feedbacks]
  );

  // DYNAMIC RECOMPUTATION OF ALL HOTSPOTS WHEN SHIFT, DATE, EVENTS, OR WEIGHTS CHANGE
  const hotspots: Hotspot[] = useMemo(() => {
    return baseHotspots.map((base) => {
      const dynamic = computeDynamicFactors(base, shift, date, events);
      const totalScore = calculateHotspotScore(dynamic, weights);
      return {
        ...base,
        ...dynamic,
        totalScore,
      };
    });
  }, [baseHotspots, shift, date, events, weights]);

  // Queue of selected hotspots for the route optimizer
  const [selectedHotspots, setSelectedHotspots] = useState<Hotspot[]>([
    hotspots[1], // Laxmi Road
    hotspots[6], // Kasba Peth
  ]);

  // Active Optimized Route
  const [activeRoute, setActiveRoute] = useState<OptimizedRoute | null>(null);
  const [selectedHubIndex, setSelectedHubIndex] = useState(0);
  const [returnToStartHub, setReturnToStartHub] = useState(false);
  const [isManualRouteOrder, setIsManualRouteOrder] = useState(false);
  const [routeRequestVersion, setRouteRequestVersion] = useState(0);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [queueOwnerId, setQueueOwnerId] = useState<string | null>(null);

  // Map Filter State
  const [selectedZone, setSelectedZone] = useState<string>('All');

  // Bottom Sheet State
  const [tappedHotspot, setTappedHotspot] = useState<Hotspot | null>(null);

  // Modal States
  const [selectedHotspotForFeedback, setSelectedHotspotForFeedback] = useState<Hotspot | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isAssumptionsModalOpen, setIsAssumptionsModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const handleAuthenticated = (user: AuthUser) => {
    try {
      saveAuthenticatedUser(user.id);
      setAuthUser(user);
      setAuthError('');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to save login session.');
    }
  };

  const handleLogout = () => {
    clearAuthenticatedUser();
    setAuthUser(null);
    setQueueOwnerId(null);
    setActiveRoute(null);
    setSelectedHotspots([]);
    setActiveTab('dashboard');
  };

  // Sync Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDarkMode]);

  // Sync Language
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  }, [lang]);

  // Sync Events
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  // Sync Feedback
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbacks));
  }, [feedbacks]);

  // Sync Weights
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(weights));
  }, [weights]);

  // Keep selectedHotspots synchronized when baseHotspots, shift, date, events, or weights update
  useEffect(() => {
    setSelectedHotspots((prev) =>
      prev.map((s) => hotspots.find((h) => h.id === s.id) || s)
    );
  }, [hotspots]);

  useEffect(() => {
    if (!authUser) return;
    try {
      const saved = localStorage.getItem(`swach_pune_route_queue_${authUser.id}`);
      const savedIds: unknown = saved ? JSON.parse(saved) : null;
      const savedQueue = Array.isArray(savedIds)
        ? savedIds
            .map((id) => hotspots.find((spot) => spot.id === id))
            .filter((spot): spot is Hotspot => Boolean(spot))
        : [];
      setSelectedHotspots(savedQueue.length > 0 ? savedQueue : [hotspots[1], hotspots[6]].filter(Boolean));
      setActiveRoute(null);
      setQueueOwnerId(authUser.id);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to load this user’s route queue.');
      setQueueOwnerId(authUser.id);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (!authUser || queueOwnerId !== authUser.id) return;
    localStorage.setItem(
      `swach_pune_route_queue_${authUser.id}`,
      JSON.stringify(selectedHotspots.map((spot) => spot.id))
    );
  }, [authUser?.id, queueOwnerId, selectedHotspots]);

  // Rebuild route metrics and geometry whenever route inputs change.
  useEffect(() => {
    if (!authUser || selectedHotspots.length === 0) {
      setActiveRoute(null);
      setIsRouteLoading(false);
      return;
    }

    let isMounted = true;
    setActiveRoute(null);
    setRouteError('');
    setIsRouteLoading(true);
    buildOptimizedRoute(
        PUNE_STARTING_HUBS[selectedHubIndex] || PUNE_STARTING_HUBS[0],
        selectedHotspots,
        shift,
        date,
        returnToStartHub,
        isManualRouteOrder,
        assumptions
      ).then((r) => {
        if (isMounted) setActiveRoute(r);
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setRouteError(error instanceof Error ? error.message : 'Unable to calculate this route.');
        }
      })
      .finally(() => {
        if (isMounted) setIsRouteLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [
    authUser?.id,
    selectedHotspots,
    shift,
    date,
    assumptions,
    selectedHubIndex,
    returnToStartHub,
    isManualRouteOrder,
    routeRequestVersion,
  ]);

  // Toggle selection of a hotspot
  const handleToggleSelectHotspot = (hotspot: Hotspot) => {
    setSelectedHotspots((prev) => {
      const exists = prev.some((h) => h.id === hotspot.id);
      if (exists) {
        return prev.filter((h) => h.id !== hotspot.id);
      } else {
        return [...prev, hotspot];
      }
    });
  };

  // Replace a full hotspot with an alternative available hotspot
  const handleReplaceQueuedSpot = (oldSpot: Hotspot, newSpot: Hotspot) => {
    setSelectedHotspots((prev) =>
      prev.map((s) => (s.id === oldSpot.id ? newSpot : s))
    );
  };

  // Auto Top N spots (skips full spots!)
  const handleSelectTopHotspots = (count: number) => {
    // Filter out spots that are full for this shift and date
    const availableSpots = hotspots.filter((h) => {
      const avail = getAvailability(h, shift, date);
      return !avail.isFull;
    });

    const sorted = [...availableSpots].sort((a, b) => b.totalScore - a.totalScore);
    const topN = sorted.slice(0, count);
    setSelectedHotspots(topN);
  };

  // Clear selected stops
  const handleClearSelectedHotspots = () => {
    setSelectedHotspots([]);
    setActiveRoute(null);
  };

  // Submit Feedback handler: updates feedback factor, releases slot, calculates accuracy
  const handleSubmitFeedback = (
    newFeedbackData: Omit<CollectionFeedback, 'id' | 'submittedAt'>
  ) => {
    const booking = bookings.find((candidate) =>
      candidate.id === newFeedbackData.bookingId &&
      candidate.pickerId === activePicker?.id &&
      candidate.hotspotId === newFeedbackData.hotspotId &&
      candidate.date === date &&
      candidate.shift === shift &&
      candidate.status === 'confirmed'
    );
    if (!authUser || !booking) {
      return { oldScore: 0, newScore: 0, error: 'You need an active booking for this spot, date, and shift.' };
    }
    if (feedbacks.some((entry) => entry.bookingId === booking.id)) {
      return { oldScore: 0, newScore: 0, error: 'Feedback has already been submitted for this booking.' };
    }

    const targetHotspot = hotspots.find((h) => h.id === newFeedbackData.hotspotId);
    const oldScore = targetHotspot ? targetHotspot.totalScore : 75;

    const newEntry: CollectionFeedback = {
      ...newFeedbackData,
      userId: authUser.id,
      bookingId: booking.id,
      id: `fb-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };

    setFeedbacks((prev) => [newEntry, ...prev]);

    releaseSlot(booking.hotspotId, booking.pickerId, booking.shift, booking.date, 'collected');
    setBookingRevision((revision) => revision + 1);

    // Update hotspot's feedbackFactor
    let updatedSpot: Hotspot | undefined;
    setBaseHotspots((prev) =>
      prev.map((spot) => {
        if (spot.id === newFeedbackData.hotspotId) {
          const ratingBoost = (newFeedbackData.rating / 5) * 15;
          const updatedFeedbackFactor = Math.min(
            100,
            Math.max(20, Math.round(spot.baseFeedbackFactor * 0.75 + ratingBoost * 2))
          );
          updatedSpot = {
            ...spot,
            baseFeedbackFactor: updatedFeedbackFactor,
            feedbackFactor: updatedFeedbackFactor,
          };
          return updatedSpot;
        }
        return spot;
      })
    );

    const newScore = updatedSpot ? calculateHotspotScore(updatedSpot, weights) : oldScore;
    return { oldScore, newScore };
  };

  // Open WhatsApp modal and reserve slots for all stops in route
  const handleOpenWhatsAppModal = () => {
    if (!activeRoute || !activePicker) return;

    // Reserve slots for activePicker
    activeRoute.stops.forEach((stop) => {
      reserveSlot(stop.hotspot, activePicker, shift, date);
    });

    setBookingRevision((revision) => revision + 1);
    setIsWhatsAppModalOpen(true);
  };

  const currentHub = PUNE_STARTING_HUBS[selectedHubIndex] || PUNE_STARTING_HUBS[0];
  const routeIsCurrent = Boolean(
    activeRoute &&
    activeRoute.startLocation.name === currentHub.name &&
    activeRoute.date === date &&
    activeRoute.shift === shift &&
    activeRoute.returnToStart === returnToStartHub &&
    activeRoute.stops.length === selectedHotspots.length &&
    activeRoute.stops.every((stop) => selectedHotspots.some((spot) => spot.id === stop.hotspot.id))
  );
  const visibleRoute = routeIsCurrent ? activeRoute : null;

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <p role="status" className="text-sm font-semibold">Loading secure local account…</p>
      </main>
    );
  }
  if (!authUser || !activePicker) {
    return <AuthScreen onAuthenticated={handleAuthenticated} initialError={authError} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors pb-20">
      {/* Top Bar with Brand, Language Switcher, Demo Picker Switcher, Guide ?, Theme */}
      <Navbar
        lang={lang}
        onSelectLang={setLang}
        activePicker={activePicker}
        onLogout={handleLogout}
        onOpenGuide={() => setIsGuideOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* Global Shift & Date Bar (Visible on all tabs to calibrate numbers) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t(lang, 'collectionShift')}:
            </span>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as ShiftType)}
              className="px-2.5 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer min-h-[38px]"
            >
              <option value="Morning (6 AM - 10 AM)">Morning (6:00 AM - 10:00 AM)</option>
              <option value="Afternoon (11 AM - 3 PM)">Afternoon (11:00 AM - 3:00 PM)</option>
              <option value="Evening (4 PM - 8 PM)">Evening (4:00 PM - 8:00 PM)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {t(lang, 'collectionDate')}:
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer min-h-[38px]"
            />
          </div>
        </div>

        {/* TAB 1: HOME (Dashboard KPIs, Live Occupancy, Map & Directory Preview) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Editorial Title Banner (ONLY ON HOME) */}
            <div className="pb-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {t(lang, 'brandName')} · Pune
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Smart pedestrian route optimizer using OpenStreetMap foot network, capacity slot booking to prevent overcrowding, and instant bilingual WhatsApp dispatch.
              </p>
            </div>

            {/* Dashboard KPIs Strip (ONLY ON HOME) */}
            <DashboardStats
              hotspots={hotspots}
              weights={weights}
              onOpenWeightsModal={() => setIsWeightsModalOpen(true)}
              onOpenEventsModal={() => setIsEventsModalOpen(true)}
              lang={lang}
            />

            {/* Live Occupancy Section (ONLY ON HOME) */}
            <LiveOccupancySection
              hotspots={hotspots}
              shift={shift}
              date={date}
              lang={lang}
              onSelectHotspot={(h) => setTappedHotspot(h)}
            />

            {/* Map Preview on Home */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {t(lang, 'mapTitle')}
                </h3>
                <button
                  onClick={() => setActiveTab('map')}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Full Map →
                </button>
              </div>

              <HotspotExplorerMap
                hotspots={hotspots}
                selectedHotspots={selectedHotspots}
                onToggleSelectHotspot={handleToggleSelectHotspot}
                activeRoute={visibleRoute}
                onTapHotspot={(h) => setTappedHotspot(h)}
                selectedZone={selectedZone}
                onSelectZone={setSelectedZone}
                lang={lang}
                shift={shift}
                date={date}
              />
            </div>
          </div>
        )}

        {/* TAB 2: MAP (Dedicated Map View, NO duplicated headers/empty space) */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <HotspotExplorerMap
              hotspots={hotspots}
              selectedHotspots={selectedHotspots}
              onToggleSelectHotspot={handleToggleSelectHotspot}
              activeRoute={visibleRoute}
              onTapHotspot={(h) => setTappedHotspot(h)}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
              lang={lang}
              shift={shift}
              date={date}
            />
          </div>
        )}

        {/* TAB 3: ROUTE (OSRM Walking Route, Three Labelled Times, Queue) */}
        {activeTab === 'router' && (
          <div className="space-y-6">
            <RouteOptimizer
              allHotspots={hotspots}
              selectedHotspots={selectedHotspots}
              onToggleSelectHotspot={handleToggleSelectHotspot}
              onClearSelectedHotspots={handleClearSelectedHotspots}
              onSelectTopHotspots={handleSelectTopHotspots}
              activeRoute={visibleRoute}
              onOpenWhatsAppModal={handleOpenWhatsAppModal}
              onOpenAssumptionsModal={() => setIsAssumptionsModalOpen(true)}
              shift={shift}
              date={date}
              lang={lang}
              assumptions={assumptions}
              onReplaceQueuedSpot={handleReplaceQueuedSpot}
              onReorderHotspots={setSelectedHotspots}
              selectedHubIndex={selectedHubIndex}
              onSelectedHubIndexChange={setSelectedHubIndex}
              returnToHub={returnToStartHub}
              onReturnToHubChange={setReturnToStartHub}
              isManualOrder={isManualRouteOrder}
              onManualOrderChange={setIsManualRouteOrder}
              isOptimizing={isRouteLoading}
              routeError={routeError}
              onRequestOptimize={() => setRouteRequestVersion((version) => version + 1)}
            />

            {/* Route Map Preview */}
            <HotspotExplorerMap
              hotspots={hotspots}
              selectedHotspots={selectedHotspots}
              onToggleSelectHotspot={handleToggleSelectHotspot}
              activeRoute={visibleRoute}
              onTapHotspot={(h) => setTappedHotspot(h)}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
              lang={lang}
              shift={shift}
              date={date}
            />
          </div>
        )}

        {/* TAB 4: SPOTS (Directory, Show Only Available filter, C/P/E/F) */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <HotspotsTable
              hotspots={hotspots}
              selectedHotspots={selectedHotspots}
              onToggleSelectHotspot={handleToggleSelectHotspot}
              onOpenFeedbackModal={(h) => {
                setSelectedHotspotForFeedback(h);
                setActiveTab('feedback');
              }}
              onTapHotspot={(h) => setTappedHotspot(h)}
              shift={shift}
              date={date}
              lang={lang}
            />
          </div>
        )}

        {/* TAB 5: FEEDBACK (Form & Collection Logs) */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <FeedbackForm
              hotspots={hotspots}
              selectedHotspotForFeedback={selectedHotspotForFeedback}
              feedbacks={userFeedbacks}
              onSubmitFeedback={handleSubmitFeedback}
              lang={lang}
              shift={shift}
              currentPickerName={activePicker.name}
              currentPickerBadge={activePicker.badgeId}
              bookings={feedbackBookings}
              date={date}
            />
          </div>
        )}
      </main>

      {/* Mobile-First Bottom Tab Bar (Home, Map, Route, Spots, Feedback) */}
      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        selectedStopsCount={selectedHotspots.length}
      />

      {/* Bottom Sheet for Tapped Hotspot */}
      {tappedHotspot && (
        <BottomSheet
          hotspot={tappedHotspot}
          onClose={() => setTappedHotspot(null)}
          selectedHotspots={selectedHotspots}
          onToggleSelectHotspot={handleToggleSelectHotspot}
          onSelectAlternative={handleReplaceQueuedSpot}
          allHotspots={hotspots}
          shift={shift}
          date={date}
          lang={lang}
          allScores={hotspots.map((h) => h.totalScore)}
        />
      )}

      {/* Modals */}
      {isGuideOpen && <SetupGuideModal onClose={() => setIsGuideOpen(false)} />}
      {isWeightsModalOpen && (
        <WeightSettingsModal
          weights={weights}
          onUpdateWeights={setWeights}
          onClose={() => setIsWeightsModalOpen(false)}
          lang={lang}
        />
      )}
      {isEventsModalOpen && (
        <EventsModal
          events={events}
          hotspots={hotspots}
          onSaveEvents={setEvents}
          onClose={() => setIsEventsModalOpen(false)}
          lang={lang}
        />
      )}
      {isAssumptionsModalOpen && (
        <AssumptionsModal
          assumptions={assumptions}
          onSaveAssumptions={(newAssump) => {
            setAssumptions(newAssump);
            saveAssumptions(newAssump);
          }}
          onClose={() => setIsAssumptionsModalOpen(false)}
          lang={lang}
        />
      )}
      {isWhatsAppModalOpen && visibleRoute && (
        <WhatsAppRouteModal
          route={visibleRoute}
          picker={activePicker}
          onClose={() => setIsWhatsAppModalOpen(false)}
          lang={lang}
        />
      )}
    </div>
  );
}
