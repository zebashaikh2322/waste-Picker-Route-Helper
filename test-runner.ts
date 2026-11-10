import { INITIAL_PUNE_HOTSPOTS, PUNE_STARTING_HUBS, INITIAL_PUNE_EVENTS } from './src/data/puneHotspots';
import { calculateHotspotScore, computeDynamicFactors, DEFAULT_WEIGHTS } from './src/utils/scoring';
import { calculateHaversineDistance, optimizeStopSequence, buildOptimizedRoute } from './src/utils/routing';
import {
  DEFAULT_COLLECTION_ASSUMPTIONS,
  DEFAULT_SCRAP_RATES,
  calculateHaulCapacity,
  calculateProjectedRevenue,
  calculateStopCollectionTimeMins,
  calculateWalkingTimeMins,
  formatDurationHoursMins
} from './src/utils/assumptions';
import { DEMO_PICKERS, getAvailability, reserveSlot, releaseSlot } from './src/utils/booking';
import { t } from './src/utils/translations';
import { generateWhatsAppMessage, createWhatsAppShareUrl } from './src/utils/whatsapp';

let passed = 0;
let failed = 0;

function assert(desc: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`  ✓ ${desc}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${desc} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('--- TEST 1: Pune Hotspots & Geographic Coordinates Integrity ---');
  assert('Hotspots dataset is loaded and not empty', INITIAL_PUNE_HOTSPOTS.length >= 10, `Count: ${INITIAL_PUNE_HOTSPOTS.length}`);
  INITIAL_PUNE_HOTSPOTS.forEach((h) => {
    // Pune coordinates check (approx Lat: 18.0 to 19.0, Lng: 73.0 to 75.0)
    const validLat = h.lat >= 18.0 && h.lat <= 19.0;
    const validLng = h.lng >= 73.0 && h.lng <= 75.0;
    assert(`Hotspot "${h.name}" has valid Pune coordinates (${h.lat}, ${h.lng})`, validLat && validLng);
    assert(`Hotspot "${h.name}" base score factors are 0-100`, 
      h.baseCommercialFactor >= 0 && h.baseCommercialFactor <= 100 &&
      h.basePopulationFactor >= 0 && h.basePopulationFactor <= 100 &&
      h.baseEventsFactor >= 0 && h.baseEventsFactor <= 100 &&
      h.feedbackFactor >= 0 && h.feedbackFactor <= 100
    );
  });

  console.log('\n--- TEST 2: Scoring Formula & Dynamic Adjustments ---');
  const sampleFactors = {
    commercialFactor: 80,
    populationFactor: 70,
    eventsFactor: 90,
    feedbackFactor: 60,
  };
  // 80*0.4 + 70*0.3 + 90*0.2 + 60*0.1 = 32 + 21 + 18 + 6 = 77.0
  const score = calculateHotspotScore(sampleFactors, DEFAULT_WEIGHTS);
  assert('Scoring correctly applies 40/30/20/10 weighting', Math.abs(score - 77.0) < 0.01, `Got: ${score}, Expected: 77.0`);

  // Custom weights
  const customScore = calculateHotspotScore(sampleFactors, { commercial: 0.5, population: 0.2, events: 0.2, feedback: 0.1 });
  // 80*0.5 + 70*0.2 + 90*0.2 + 60*0.1 = 40 + 14 + 18 + 6 = 78.0
  assert('Scoring supports customized weights', Math.abs(customScore - 78.0) < 0.01, `Got: ${customScore}, Expected: 78.0`);

  // Dynamic Shift Multipliers
  const baseH = INITIAL_PUNE_HOTSPOTS[0];
  const morningFactors = computeDynamicFactors(baseH, 'Morning (6 AM - 10 AM)', '2026-11-10', INITIAL_PUNE_EVENTS);
  const eveningFactors = computeDynamicFactors(baseH, 'Evening (4 PM - 8 PM)', '2026-11-10', INITIAL_PUNE_EVENTS);
  assert('Evening shift reflects higher commercial multiplier than Morning', eveningFactors.commercialFactor >= morningFactors.commercialFactor);

  console.log('\n--- TEST 3: Routing & TSP Nearest-Neighbor ---');
  const distPune = calculateHaversineDistance(18.5204, 73.8567, 18.5304, 73.8667);
  assert('Haversine distance returns reasonable km for Pune', distPune > 0.5 && distPune < 3.0, `Got: ${distPune.toFixed(2)} km`);

  const startHub = PUNE_STARTING_HUBS[0];
  const testHotspots = INITIAL_PUNE_HOTSPOTS.slice(0, 4);
  const sequenced = optimizeStopSequence({ lat: startHub.lat, lng: startHub.lng }, testHotspots);
  assert('Sequence contains all requested hotspots without loss', sequenced.length === 4);

  const optimizedRoute = await buildOptimizedRoute(
    { name: startHub.name, lat: startHub.lat, lng: startHub.lng },
    testHotspots,
    'Morning (6 AM - 10 AM)',
    '2026-11-10',
    true,
    false,
    DEFAULT_COLLECTION_ASSUMPTIONS
  );
  assert('Optimized route builds valid steps and summaries', optimizedRoute.stops.length === 4);
  assert('Optimized route calculates positive total distance and time', optimizedRoute.totalDistanceKm > 0 && optimizedRoute.totalShiftTimeMins > 0);
  assert('Optimized route computes projected revenue and kg', optimizedRoute.estimatedEarningsInr > 0 && optimizedRoute.totalEstimatedKg > 0);
  assert('Optimized route includes distinct walking and collection times', 
    optimizedRoute.walkingTimeMins > 0 && 
    optimizedRoute.collectionTimeMins > 0 &&
    optimizedRoute.totalShiftTimeMins === (optimizedRoute.walkingTimeMins + optimizedRoute.collectionTimeMins)
  );

  console.log('\n--- TEST 4: Assumptions & Capacity Limits ---');
  const sampleWeights = [100, 150, 80]; // total 330kg
  const haul = calculateHaulCapacity(sampleWeights, 28, 150);
  // 330 * 0.28 = 92.4 => 92 kg
  assert('Haul capacity calculates uncapped correctly', haul.uncappedKg === 92, `Got: ${haul.uncappedKg}`);
  assert('Under cart capacity (150kg), isCapped is false', !haul.isCapped && haul.cappedKg === 92);
  const cappedHaul = calculateHaulCapacity([300, 400], 50, 150); // 700 * 0.5 = 350kg > 150kg
  assert('Exceeding cart capacity triggers isCapped', cappedHaul.isCapped && cappedHaul.cappedKg === 150);

  const walkTime = calculateWalkingTimeMins(3.8, 3.8);
  assert('Walking time for 3.8km at 3.8km/h is 60 minutes', walkTime === 60, `Got: ${walkTime}`);
  const stopColTime = calculateStopCollectionTimeMins(50, 10, 5); // (50/10) + 5 = 10 mins
  assert('Stop collection time: 50kg at 10kg/min + 5min sort = 10 mins', stopColTime === 10, `Got: ${stopColTime}`);
  assert('Duration format: 75 mins is "1h 15m"', formatDurationHoursMins(75) === '1h 15m');

  const projectedRev = calculateProjectedRevenue([
    { primaryWasteTypes: ['Cardboard'], estimatedHaulKg: 10 }
  ], DEFAULT_SCRAP_RATES);
  assert('Projected revenue computes 10kg * Rs 16 = Rs 160', projectedRev === 160, `Got: Rs. ${projectedRev}`);

  console.log('\n--- TEST 5: Slot Reservation & Occupancy Booking ---');
  const testHotspot = INITIAL_PUNE_HOTSPOTS[2]; // Use Kothrud (not pre-seeded)
  const initialAvail = getAvailability(testHotspot, 'Morning (6 AM - 10 AM)', '2026-11-10');
  assert('Initial availability has positive maxPickers', initialAvail.maxPickers > 0);
  assert('Initial spot has open slots', initialAvail.availableCount > 0);
  const reserveRes = reserveSlot(testHotspot, DEMO_PICKERS[0], 'Morning (6 AM - 10 AM)', '2026-11-10');
  assert('Slot reservation succeeds when capacity exists', reserveRes.success);
  const newAvail = getAvailability(testHotspot, 'Morning (6 AM - 10 AM)', '2026-11-10');
  assert('Remaining slots decrement after reservation', newAvail.availableCount === initialAvail.availableCount - 1);
  const releaseRes = releaseSlot(testHotspot.id, DEMO_PICKERS[0].id, 'Morning (6 AM - 10 AM)', '2026-11-10');
  assert('Slot release succeeds', releaseRes === true);

  console.log('\n--- TEST 6: Multilingual Translations ---');
  const appTitleEn = t('en', 'brandName');
  const appTitleMr = t('mr', 'brandName');
  const appTitleHi = t('hi', 'brandName');
  assert('English translation is present', appTitleEn.length > 0 && appTitleEn.includes('Waste-Picker'));
  assert('Marathi translation is present', appTitleMr.length > 0);
  assert('Hindi translation is present', appTitleHi.length > 0);
  assert('Translations differ across languages', appTitleEn !== appTitleMr && appTitleMr !== appTitleHi);

  console.log('\n--- TEST 7: WhatsApp Route Sharing ---');
  const waMsg = generateWhatsAppMessage({
    route: optimizedRoute,
    pickerName: DEMO_PICKERS[0].name,
    pickerBadge: DEMO_PICKERS[0].badgeId,
    notes: 'Please wear gloves at stop 2.'
  });
  assert('WhatsApp message contains picker name', waMsg.includes(DEMO_PICKERS[0].name));
  assert('WhatsApp message contains stops count', waMsg.includes('4'));
  assert('WhatsApp message contains Marathi section', waMsg.includes('मराठी'));
  assert('WhatsApp message contains Hindi section', waMsg.includes('हिंदी'));
  const waUrl = createWhatsAppShareUrl(waMsg, DEMO_PICKERS[0].phone);
  assert('WhatsApp share URL is well-formed wa.me link', waUrl.startsWith('https://wa.me/'));

  console.log(`\n========================================`);
  console.log(`TEST RUN COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test error:', err);
  process.exit(1);
});
