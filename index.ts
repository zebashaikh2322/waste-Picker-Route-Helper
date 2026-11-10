export type Language = 'en' | 'mr' | 'hi';

export type ShiftType = 'Morning (6 AM - 10 AM)' | 'Afternoon (11 AM - 3 PM)' | 'Evening (4 PM - 8 PM)';

export interface PuneEvent {
  id: string;
  name: string;
  marathiName: string;
  hindiName: string;
  date: string; // YYYY-MM-DD
  hotspotId: string;
  impactScore: number; // 0 to 100
  notes?: string;
}

export interface Hotspot {
  id: string;
  name: string;
  marathiName: string;
  hindiName: string;
  zone: 'Central Pune' | 'East Pune' | 'West Pune' | 'South Pune' | 'North Pune';
  address: string;
  lat: number;
  lng: number;
  
  // Base factor scores (0 to 100)
  baseCommercialFactor: number; // 40%
  basePopulationFactor: number; // 30%
  baseEventsFactor: number;     // 20%
  baseFeedbackFactor: number;   // 10%
  
  // Dynamic factors for current shift/date
  commercialFactor: number;
  populationFactor: number;
  eventsFactor: number;
  feedbackFactor: number;
  
  // Total weighted score
  totalScore: number;
  
  // Waste generation & capacity
  primaryWasteTypes: string[];
  baseEstimatedKgPerDay: number;
  estimatedKgPerDay: number; // adjusted for shift and day
  bestCollectionTime: string;
  nearestScrapCenter: string;
  scrapCenterDistanceKm: number;
  avgScrapRatePerKg: number;
  lastUpdated: string;
  notes: string;
  
  // Capacity & Booking (Slot management)
  maxPickersPerShift: number; // e.g. 1 per 150 kg, min 1, max 5
}

export interface ScoringWeights {
  commercial: number; // default 0.40
  population: number; // default 0.30
  events: number;     // default 0.20
  feedback: number;   // default 0.10
}

export interface CollectionAssumptions {
  walkingSpeedKmH: number; // default 3.8 km/h
  loadingRateKgPerMin: number; // default 10 kg/min
  sortingMinsPerStop: number; // default 5 min
  collectionEfficiencyPct: number; // default 28%
  cartCapacityKg: number; // default 150 kg
  scrapRates: Record<string, number>; // material -> Rs/kg
}

export interface SlotBooking {
  id: string;
  hotspotId: string;
  pickerId: string;
  pickerName: string;
  shift: ShiftType;
  date: string;
  status: 'confirmed' | 'collected' | 'cancelled';
  bookedAt: string;
}

export interface DemoPicker {
  id: string;
  name: string;
  badgeId: string;
  phone: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  mobile: string;
  zone?: Hotspot['zone'];
  memberId: string;
  pinHash: string;
  status: 'verified';
}

export interface RouteStop {
  hotspot: Hotspot;
  stopOrder: number;
  estimatedWeightKg: number;
  walkingDistanceKm: number;
  walkingTimeMins: number;
  collectionTimeMins: number;
  legDistanceKm: number;
  legDurationMins: number;
  isBookedByMe?: boolean;
  isFull?: boolean;
}

export interface RouteStep {
  fromName: string;
  toName: string;
  distanceKm: number;
  durationMins: number;
}

export interface OptimizedRoute {
  id: string;
  name: string;
  date: string;
  shift: ShiftType;
  startLocation: {
    name: string;
    lat: number;
    lng: number;
  };
  stops: RouteStop[];
  returnToStart: boolean;
  totalDistanceKm: number;
  // Three distinct labelled times
  walkingTimeMins: number;
  collectionTimeMins: number;
  totalShiftTimeMins: number;
  
  totalEstimatedKg: number;
  isCappedAtCapacity: boolean;
  uncappedEstimatedKg: number;
  estimatedEarningsInr: number;
  routeGeometry?: [number, number][]; // LatLng points along street
  turnInstructions?: string[];
  steps?: RouteStep[];
  isRoutingFallback?: boolean;
}

export interface CollectionFeedback {
  id: string;
  userId?: string;
  bookingId?: string;
  hotspotId: string;
  hotspotName: string;
  pickerName: string;
  swachMemberId?: string;
  collectionDate: string;
  shift: string;
  predictedKg: number;
  collectedKg: number;
  accuracyPct: number;
  wasteTypesFound: string[];
  segregationQuality: 1 | 2 | 3 | 4 | 5;
  spotCondition: 'Cleared' | 'Partially Cleared' | 'Overflowing' | 'Inaccessible';
  rating: number; // 1 to 5
  comments: string;
  submittedAt: string;
}
