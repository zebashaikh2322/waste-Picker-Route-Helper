import { OptimizedRoute } from '../types';
import { formatDurationHoursMins } from './assumptions';

export interface WhatsAppMessageOptions {
  route: OptimizedRoute;
  pickerName?: string;
  pickerBadge?: string;
  notes?: string;
}

export function generateWhatsAppMessage(options: WhatsAppMessageOptions): string {
  const { route, pickerName = 'Sunita Kamble', pickerBadge = 'SW-4192', notes } = options;

  const dateFormatted = new Date(route.date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const walkingFormatted = formatDurationHoursMins(route.walkingTimeMins);
  const collectionFormatted = formatDurationHoursMins(route.collectionTimeMins);
  const totalFormatted = formatDurationHoursMins(route.totalShiftTimeMins);

  // English section
  let msg = `♻️ *WASTE-PICKER ROUTE DISPATCH — PUNE*\n`;
  msg += `📍 *Platform:* SWaCH & KKPKP Route Helper\n`;
  msg += `👤 *Collector:* ${pickerName} (${pickerBadge})\n`;
  msg += `📅 *Date:* ${dateFormatted} | ⏰ *Shift:* ${route.shift}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `🚶 *STARTING HUB:*\n`;
  msg += `🚩 ${route.startLocation.name}\n`;
  msg += `🔗 Maps: https://maps.google.com/?q=${route.startLocation.lat},${route.startLocation.lng}\n\n`;

  msg += `📋 *CONFIRMED COLLECTION STOPS (${route.stops.length}):*\n`;
  route.stops.forEach((stop, index) => {
    const h = stop.hotspot;
    msg += `\n*${index + 1}. ${h.name}* [✅ Slot confirmed]\n`;
    msg += `   • Marathi: ${h.marathiName}\n`;
    msg += `   • Waste Types: ${h.primaryWasteTypes.slice(0, 3).join(', ')}\n`;
    msg += `   • Est. Haul: ~${stop.estimatedWeightKg} kg\n`;
    msg += `   • Walk Leg: ${stop.walkingDistanceKm} km (~${formatDurationHoursMins(stop.walkingTimeMins)})\n`;
    msg += `   • Est. Collection: ~${formatDurationHoursMins(stop.collectionTimeMins)}\n`;
    msg += `   • Nearest Depot: ${h.nearestScrapCenter}\n`;
    msg += `   • Walk Directions: https://maps.google.com/?q=${h.lat},${h.lng}\n`;
  });

  if (route.returnToStart) {
    msg += `\n🚩 *Return to Start Hub:* ${route.startLocation.name}\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📊 *ROUTE SUMMARY & TIMES:*\n`;
  msg += `• Total Walk Distance: *${route.totalDistanceKm} km*\n`;
  msg += `• 🚶 Walking Time: *${walkingFormatted}* (@ 3.8 km/h)\n`;
  msg += `• 📦 Collection Time: *${collectionFormatted}*\n`;
  msg += `• ⏱️ Total Shift Time: *${totalFormatted}*\n`;
  msg += `• Expected Recyclables: *~${route.totalEstimatedKg} kg*${route.isCappedAtCapacity ? ' (Capped at 150 kg cart capacity)' : ''}\n`;
  msg += `• Projected Revenue: *₹${route.estimatedEarningsInr.toLocaleString('en-IN')}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;

  if (notes) {
    msg += `\n⚠️ *FIELD NOTE:* ${notes}\n`;
  }

  // Marathi translation section below
  msg += `\n\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🇮🇳 *मराठी संदेश (MARATHI):*\n`;
  msg += `कचरा वेचक: *${pickerName}* (${pickerBadge})\n`;
  msg += `एकूण पायी अंतर: *${route.totalDistanceKm} किमी*\n`;
  msg += `• चालण्याची वेळ: *${walkingFormatted}*\n`;
  msg += `• संकलन वेळ: *${collectionFormatted}*\n`;
  msg += `• एकूण वेळ: *${totalFormatted}*\n`;
  msg += `• अपेक्षित भंगार: *~${route.totalEstimatedKg} किलो*\n`;
  msg += `• अंदाजे कमाई: *₹${route.estimatedEarningsInr.toLocaleString('en-IN')}*\n`;
  msg += `थांबे:\n`;
  route.stops.forEach((stop, idx) => {
    msg += `${idx + 1}. ${stop.hotspot.marathiName} [✅ जागा निश्चित] (~${stop.estimatedWeightKg} किलो)\n`;
  });

  // Hindi translation section below
  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🇮🇳 *हिंदी संदेश (HINDI):*\n`;
  msg += `वेचक: *${pickerName}* (${pickerBadge})\n`;
  msg += `कुल पैदल दूरी: *${route.totalDistanceKm} किमी*\n`;
  msg += `• चलने का समय: *${walkingFormatted}*\n`;
  msg += `• संग्रहण समय: *${collectionFormatted}*\n`;
  msg += `• कुल शिफ्ट समय: *${totalFormatted}*\n`;
  msg += `• अनुमानित कबाड़: *~${route.totalEstimatedKg} किग्रा*\n`;
  msg += `• संभावित आय: *₹${route.estimatedEarningsInr.toLocaleString('en-IN')}*\n`;
  msg += `स्टॉप सूची:\n`;
  route.stops.forEach((stop, idx) => {
    msg += `${idx + 1}. ${stop.hotspot.hindiName || stop.hotspot.name} [✅ स्लॉट पुष्ट] (~${stop.estimatedWeightKg} किग्रा)\n`;
  });

  msg += `\n📞 *Helpline / मदत क्रमांक:* SWaCH Care: 1800 233 0008\n`;
  return msg;
}

export function createWhatsAppShareUrl(text: string, phoneNumber?: string): string {
  const encodedText = encodeURIComponent(text);
  if (phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
