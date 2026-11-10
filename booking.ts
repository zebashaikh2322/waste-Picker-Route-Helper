import { DemoPicker, Hotspot, ShiftType, SlotBooking } from '../types';
import { calculateHaversineDistance } from './routing';

export const DEMO_PICKERS: DemoPicker[] = [
  { id: 'picker-1', name: 'Sunita Kamble', badgeId: 'SW-4192', phone: '+91 98231 44192' },
  { id: 'picker-2', name: 'Babasaheb Jadhav', badgeId: 'SW-2104', phone: '+91 98220 22104' },
  { id: 'picker-3', name: 'Kavita Thorat', badgeId: 'SW-1190', phone: '+91 97654 31190' },
  { id: 'picker-4', name: 'Rahul Shinde', badgeId: 'SW-3321', phone: '+91 99215 53321' },
];

const BOOKINGS_STORAGE_KEY = 'swach_pune_slot_bookings_v2';

/**
 * Generates initial seed bookings with at least one Full hotspot and one Almost-full hotspot
 */
function getInitialSeedBookings(): SlotBooking[] {
  const today = new Date().toISOString().split('T')[0];
  const shift: ShiftType = 'Morning (6 AM - 10 AM)';

  return [
    // Seed FC Road (pune-01) as FULL (3/3)
    {
      id: 'seed-1',
      hotspotId: 'pune-01', // FC Road
      pickerId: 'picker-2',
      pickerName: 'Babasaheb Jadhav',
      shift,
      date: today,
      status: 'confirmed',
      bookedAt: 'Today, 06:15 AM',
    },
    {
      id: 'seed-2',
      hotspotId: 'pune-01',
      pickerId: 'picker-3',
      pickerName: 'Kavita Thorat',
      shift,
      date: today,
      status: 'confirmed',
      bookedAt: 'Today, 06:30 AM',
    },
    {
      id: 'seed-3',
      hotspotId: 'pune-01',
      pickerId: 'picker-4',
      pickerName: 'Rahul Shinde',
      shift,
      date: today,
      status: 'confirmed',
      bookedAt: 'Today, 06:45 AM',
    },
    // Seed Laxmi Road (pune-02) as ALMOST FULL (2/3)
    {
      id: 'seed-4',
      hotspotId: 'pune-02', // Laxmi Road
      pickerId: 'picker-2',
      pickerName: 'Babasaheb Jadhav',
      shift,
      date: today,
      status: 'confirmed',
      bookedAt: 'Today, 07:00 AM',
    },
    {
      id: 'seed-5',
      hotspotId: 'pune-02',
      pickerId: 'picker-3',
      pickerName: 'Kavita Thorat',
      shift,
      date: today,
      status: 'confirmed',
      bookedAt: 'Today, 07:10 AM',
    },
  ];
}

let memoryBookings: SlotBooking[] | null = null;

/**
 * Returns all stored bookings from localStorage (or memory in SSR/tests)
 */
export function getBookings(): SlotBooking[] {
  if (typeof window === 'undefined') {
    if (!memoryBookings) {
      memoryBookings = getInitialSeedBookings();
    }
    return memoryBookings;
  }
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load bookings from storage', e);
  }
  const initial = getInitialSeedBookings();
  saveBookings(initial);
  return initial;
}

/**
 * Saves bookings to localStorage and notifies listeners
 */
export function saveBookings(bookings: SlotBooking[]): void {
  if (typeof window === 'undefined') {
    memoryBookings = [...bookings];
    return;
  }
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.warn('Failed to save bookings', e);
  }
}

/**
 * Gets availability stats for a hotspot on a given shift and date
 */
export function getAvailability(
  hotspot: Hotspot,
  shift: ShiftType,
  date: string,
  currentPickerId?: string
): {
  bookedCount: number;
  maxPickers: number;
  availableCount: number;
  isFull: boolean;
  isAlmostFull: boolean;
  isBookedByCurrentPicker: boolean;
  status: 'Open' | 'Almost Full' | 'Full';
} {
  const allBookings = getBookings();
  const activeBookings = allBookings.filter(
    (b) =>
      b.hotspotId === hotspot.id &&
      b.shift === shift &&
      b.date === date &&
      b.status === 'confirmed'
  );

  const bookedCount = activeBookings.length;
  const maxPickers = hotspot.maxPickersPerShift || 3;
  const availableCount = Math.max(0, maxPickers - bookedCount);
  const isFull = availableCount === 0;
  const isAlmostFull = availableCount === 1 && maxPickers > 1;
  const isBookedByCurrentPicker = currentPickerId
    ? activeBookings.some((b) => b.pickerId === currentPickerId)
    : false;

  let status: 'Open' | 'Almost Full' | 'Full' = 'Open';
  if (isFull) {
    status = 'Full';
  } else if (isAlmostFull) {
    status = 'Almost Full';
  }

  return {
    bookedCount,
    maxPickers,
    availableCount,
    isFull,
    isAlmostFull,
    isBookedByCurrentPicker,
    status,
  };
}

/**
 * Reserves a slot for a picker at a hotspot for a given shift and date.
 * Returns true if successful, false if full or already booked.
 */
export function reserveSlot(
  hotspot: Hotspot,
  picker: DemoPicker,
  shift: ShiftType,
  date: string
): { success: boolean; message?: string } {
  const current = getAvailability(hotspot, shift, date, picker.id);
  
  if (current.isBookedByCurrentPicker) {
    return { success: true, message: 'Slot already reserved by you' };
  }

  if (current.isFull) {
    return {
      success: false,
      message: `This spot is full for this shift (${current.bookedCount}/${current.maxPickers} pickers). Please choose another location.`,
    };
  }

  const allBookings = getBookings();
  const newBooking: SlotBooking = {
    id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    hotspotId: hotspot.id,
    pickerId: picker.id,
    pickerName: picker.name,
    shift,
    date,
    status: 'confirmed',
    bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  saveBookings([...allBookings, newBooking]);
  return { success: true };
}

/**
 * Releases a slot held by a picker at a hotspot for a given shift and date
 */
export function releaseSlot(
  hotspotId: string,
  pickerId: string,
  shift: ShiftType,
  date: string,
  status: 'collected' | 'cancelled' = 'collected'
): boolean {
  const allBookings = getBookings();
  let found = false;

  const updated = allBookings.map((b) => {
    if (
      b.hotspotId === hotspotId &&
      b.pickerId === pickerId &&
      b.shift === shift &&
      b.date === date &&
      b.status === 'confirmed'
    ) {
      found = true;
      return { ...b, status };
    }
    return b;
  });

  if (found) {
    saveBookings(updated);
  }
  return found;
}

/**
 * Finds the top 3 nearest alternative hotspots that have open slots
 */
export function getNearestAvailableAlternatives(
  targetHotspot: Hotspot,
  allHotspots: Hotspot[],
  shift: ShiftType,
  date: string,
  excludeIds: string[] = []
): { hotspot: Hotspot; distanceKm: number; availableSlots: number }[] {
  const candidates: { hotspot: Hotspot; distanceKm: number; availableSlots: number }[] = [];

  allHotspots.forEach((h) => {
    if (h.id === targetHotspot.id || excludeIds.includes(h.id)) return;
    const avail = getAvailability(h, shift, date);
    if (!avail.isFull) {
      const dist = calculateHaversineDistance(targetHotspot.lat, targetHotspot.lng, h.lat, h.lng);
      candidates.push({
        hotspot: h,
        distanceKm: Math.round(dist * 10) / 10,
        availableSlots: avail.availableCount,
      });
    }
  });

  // Sort by nearest distance
  candidates.sort((a, b) => a.distanceKm - b.distanceKm);
  return candidates.slice(0, 3);
}
