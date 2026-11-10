import { Language } from '../types';

export const TRANSLATIONS = {
  en: {
    // Navigation Tabs
    tabHome: 'Home',
    tabMap: 'Map',
    tabRoute: 'Route',
    tabSpots: 'Spots',
    tabFeedback: 'Feedback',
    
    // Top Bar
    brandName: 'Waste-Picker Route Helper',
    tagline: 'Pune Municipal Corporation & SWaCH Network',
    demoPicker: 'Demo Picker',
    beginnerGuide: 'Guide',
    sampleDataNotice: 'Sample data · Pune Municipal Corporation & SWaCH cooperative model',
    dataLastUpdated: 'Data last updated: Today, 08:30 AM',
    
    // Home Dashboard KPIs
    kpiMonitoredHotspots: 'Monitored Spots',
    kpiAcrossZones: 'Across 4 Pune Zones',
    kpiAvgScore: 'Avg Spot Score',
    kpiScoreScale: 'out of 100.0',
    kpiRecyclablePool: 'Est. Recyclables Pool',
    kpiKgPerDay: 'kg / day (sample)',
    kpiTopSpot: 'Top Scoring Hub',
    kpiPts: 'pts',
    
    // Live Occupancy section on Home
    liveOccupancyTitle: 'Live Spot Occupancy (No Overcrowding)',
    liveOccupancyDesc: 'Prevents multiple pickers arriving at the same spot at once. Dispatched routes reserve 1 slot per picker.',
    slotsAvailable: 'slots open',
    slotsFull: 'Occupied',
    slotsAlmostFull: 'Almost full',
    filterAllZones: 'All Zones',
    
    // Route Times & Numbers
    routeSummaryTitle: 'Walking Route & Time Calculation',
    walkingTimeLabel: 'Walking Time',
    collectionTimeLabel: 'Collection Time',
    totalShiftTimeLabel: 'Total Shift Time',
    walkingTimeTooltip: 'Walking time = Total walking distance (km) ÷ Walking speed with cart (default 3.8 km/h).',
    collectionTimeTooltip: 'Collection time per stop = (Stop kg ÷ Loading rate [10 kg/min]) + 5 minutes sorting & negotiating.',
    totalShiftTimeTooltip: 'Total shift time = Walking time + Collection time. Warns if longer than the 4-hour shift window.',
    shiftWindowWarning: 'Warning: Total route time ({time}) exceeds the 4-hour shift window ({maxTime}). Reduce stops or load.',
    
    // Assumptions & Capacity
    collectionAssumptionsBtn: 'Collection Assumptions',
    collectionAssumptionsTitle: 'Collection & Revenue Assumptions',
    walkingSpeed: 'Walking Speed (km/h)',
    loadingRate: 'Loading Rate (kg/min)',
    sortingMins: 'Sorting & Negotiating per Stop (min)',
    collectionEfficiency: 'Collection Efficiency (%)',
    cartCapacity: 'Cart Capacity (kg)',
    scrapRateTable: 'Recyclable Rates Table (₹/kg)',
    resetAssumptions: 'Reset to Defaults',
    saveAssumptions: 'Save Assumptions',
    
    expectedRecyclables: 'Expected Recyclables',
    cartCapWarning: 'Cart capacity reached! Yield capped at {cap} kg (uncapped expected: {expected} kg). Plan a depot drop-off or use a second cart.',
    projectedRevenue: 'Projected Revenue',
    revenueTooltip: 'Revenue = Sum of (estimated kg of each recyclable material × scrap rate ₹/kg).',
    
    // Routing Controls
    orderModeAuto: 'Auto Order (Nearest First)',
    orderModeManual: 'Manual Order',
    returnToHub: 'Return to Start Hub',
    autoTop3: 'Auto Top 3 Available',
    autoTop5: 'Auto Top 5 Available',
    clearQueue: 'Clear Route',
    startHub: 'Start Hub / Sorting Shed',
    collectionShift: 'Shift Window',
    collectionDate: 'Collection Date',
    stopsQueue: 'Stops Queue',
    stepList: 'Turn-by-Turn Leg Steps',
    optimizeBtn: 'Optimize Walking Route',
    optimizingBtn: 'Calculating Street Path via OpenStreetMap...',
    osrmFallbackNotice: 'Notice: OpenStreetMap routing server unavailable. Displaying straight walking lines.',
    dispatchWhatsApp: 'Dispatch Route via WhatsApp',
    
    // Map & Bottom Sheet
    mapTitle: 'Pune Hotspot Explorer',
    mapSub: 'Pins show relative potential tiers. Tap any spot to view bottom sheet.',
    colorHigh: 'Top 33% High',
    colorMed: 'Mid 33% Medium',
    colorLow: 'Bottom 33% Low',
    toggleDepots: 'Show Collection Depots',
    centerPune: 'Center Pune',
    bottomSheetTitle: 'Spot Details & Slot Availability',
    addToRoute: 'Add to Route',
    removeFromRoute: 'Remove from Route',
    spotOccupiedMsg: 'This spot is full for this shift ({booked}/{max} pickers). Please choose another location.',
    suggestedAlternatives: 'Suggested nearby spots with open slots:',
    addInstead: 'Add Instead',
    occupiedBadge: 'Occupied',
    openBadge: 'Open',
    almostFullBadge: 'Almost Full',
    pickersCount: '{booked}/{max} pickers',
    
    // Spots Directory
    directoryTitle: 'Pune Waste Hotspots Directory',
    searchPlaceholder: 'Search by spot name, locality, or scrap type...',
    filterOnlyAvailable: 'Show only available slots',
    colHotspot: 'Hotspot & Locality',
    colScore: 'Score',
    colBreakdown: 'C / P / E / F Factors',
    colYield: 'Est. Yield',
    colOccupancy: 'Slot Occupancy',
    colActions: 'Action',
    
    // Feedback & Logs
    feedbackTitle: 'Collection Feedback Form',
    feedbackSub: 'Log actual weight collected to update spot score & release your slot.',
    formSpot: 'Hotspot Locality',
    formPickerName: 'Picker Name',
    formMemberId: 'SWaCH Member ID',
    formShift: 'Shift',
    formWeight: 'Actual Recyclables Collected (kg)',
    formPredictedCompare: 'Predicted: {pred} kg',
    formAccuracy: 'Yield Accuracy',
    formWasteTypes: 'Recyclables Collected (select all)',
    formSegregation: 'Segregation Quality (1 - 5)',
    formCondition: 'Spot Clearance Condition',
    formRating: 'Experience Rating (1 - 5)',
    formNotes: 'Ground Field Notes',
    submitFeedback: 'Submit Log & Release Slot',
    feedbackSavedToast: 'Log saved! Feedback score updated from {oldScore} to {newScore}.',
    
    collectionLogsTitle: 'Collection Logs',
    loadMoreLogs: 'Load More Logs',
    noMoreLogs: 'All logs displayed',
    
    // Events Manager
    eventsTitle: 'Pune Events & Festivals Manager',
    eventsSub: 'Events directly influence the 20% Events factor for their corresponding date and area.',
    addEvent: 'Add Event',
    eventName: 'Event Name',
    eventDate: 'Date',
    eventPlace: 'Hotspot Locality',
    eventImpact: 'Footfall / Waste Surge Score (0-100)',
    saveEvent: 'Save Event',
    
    // Scoring Weights
    adjustWeightsTitle: 'Adjust Scoring Weights',
    weightsSumMustBe100: 'Weights must sum exactly to 100%. Currently: {sum}%',
    commercialWeight: 'Commercial (Markets, Cafes, Retail) 40%',
    populationWeight: 'Population (Residential Societies) 30%',
    eventsWeight: 'Events (Mandis, Festivals, Rush) 20%',
    feedbackWeight: 'Field Feedback (Collector Logs) 10%',
    applyWeights: 'Apply Weights Live',
    resetWeights: 'Reset (40/30/20/10)',
    
    // WhatsApp modal
    whatsappTitle: 'WhatsApp Route Dispatch',
    whatsappSub: 'Send confirmed route to waste picker or supervisor',
    copyMessage: 'Copy Message',
    messageCopied: 'Message Copied!',
    openWhatsApp: 'Share via WhatsApp',
    slotConfirmedTag: 'Slot confirmed',
  },
  
  mr: {
    // Navigation Tabs
    tabHome: 'मुख्यपृष्ठ',
    tabMap: 'नकाशा',
    tabRoute: 'मार्ग',
    tabSpots: 'ठिकाणे',
    tabFeedback: 'अभिप्राय',
    
    // Top Bar
    brandName: 'कचरा-वेचक मार्ग साहाय्यक',
    tagline: 'पुणे महानगरपालिका व स्वच्छ संस्था',
    demoPicker: 'डेमो वेचक',
    beginnerGuide: 'मार्गदर्शक',
    sampleDataNotice: 'नमुना माहिती · पुणे महानगरपालिका व स्वच्छ मॉडेल',
    dataLastUpdated: 'शेवटचे अद्यतन: आज, सकाळी ०८:३०',
    
    // Home Dashboard KPIs
    kpiMonitoredHotspots: 'नोंदणीकृत ठिकाणे',
    kpiAcrossZones: 'पुण्यातील ४ विभागांमध्ये',
    kpiAvgScore: 'सरासरी गुण',
    kpiScoreScale: '१०० पैकी',
    kpiRecyclablePool: 'अपेक्षित भंगार कचरा',
    kpiKgPerDay: 'किलो / दिवस (नमुना)',
    kpiTopSpot: 'सर्वाधिक संभाव्य ठिकाण',
    kpiPts: 'गुण',
    
    // Live Occupancy section on Home
    liveOccupancyTitle: 'थेट जागा उपलब्धता (गर्दी टाळा)',
    liveOccupancyDesc: 'एकाच ठिकाणी अनेक वेचक येणे टाळण्यासाठी मार्ग निश्चित केल्यावर जागा राखीव होते.',
    slotsAvailable: 'जागा उपलब्ध',
    slotsFull: 'पूर्ण भरलेले',
    slotsAlmostFull: 'जवळपास पूर्ण',
    filterAllZones: 'सर्व विभाग',
    
    // Route Times & Numbers
    routeSummaryTitle: 'पायी अंतर व वेळ हिशोब',
    walkingTimeLabel: 'पायी चालण्याची वेळ',
    collectionTimeLabel: 'संकलनाची वेळ',
    totalShiftTimeLabel: 'एकूण शिफ्ट वेळ',
    walkingTimeTooltip: 'चालण्याची वेळ = एकूण पायी अंतर (किमी) ÷ हातगाडी चालण्याचा वेग (३.८ किमी/तास).',
    collectionTimeTooltip: 'संकलन वेळ = (अपेक्षित वजन ÷ भरण्याचा दर [१० किलो/मि.]) + ५ मिनिटे वर्गीकरण व व्यवहार.',
    totalShiftTimeTooltip: 'एकूण शिफ्ट वेळ = चालण्याची वेळ + संकलन वेळ. ४ तासांपेक्षा जास्त असल्यास इशारा दिला जातो.',
    shiftWindowWarning: 'इशारा: एकूण मार्ग वेळ ({time}) ४ तासांच्या शिफ्टपेक्षा ({maxTime}) जास्त आहे. थांबे कमी करा.',
    
    // Assumptions & Capacity
    collectionAssumptionsBtn: 'संकलन गृहीतके',
    collectionAssumptionsTitle: 'संकलन व कमाई गृहीतके',
    walkingSpeed: 'चालण्याचा वेग (किमी/तास)',
    loadingRate: 'भरण्याचा वेग (किलो/मिनिट)',
    sortingMins: 'प्रति थांबा वर्गीकरण वेळ (मिनिटे)',
    collectionEfficiency: 'संकलन कार्यक्षमता (%)',
    cartCapacity: 'हातगाडी क्षमता (किलो)',
    scrapRateTable: 'भंगार दर तक्ता (₹/किलो)',
    resetAssumptions: 'मूळ मूल्ये ठेवा',
    saveAssumptions: 'जतन करा',
    
    expectedRecyclables: 'अपेक्षित पुनर्वापर भंगार',
    cartCapWarning: 'हातगाडी क्षमता पूर्ण! संकलन {cap} किलो मर्यादित (एकूण अपेक्षित: {expected} किलो). डेपोमध्ये माल उतरवा.',
    projectedRevenue: 'अपेक्षित कमाई',
    revenueTooltip: 'कमाई = प्रत्येक भंगार प्रकाराचे किलो × दर ₹/किलो.',
    
    // Routing Controls
    orderModeAuto: 'स्वयंचलित क्रम (जवळचे प्रथम)',
    orderModeManual: 'स्वतः ठरवलेला क्रम',
    returnToHub: 'सुरुवातीच्या डेपोवर परत या',
    autoTop3: 'उपलब्ध सर्वोत्तम ३ ठिकाणे',
    autoTop5: 'उपलब्ध सर्वोत्तम ५ ठिकाणे',
    clearQueue: 'मार्ग रिकामे करा',
    startHub: 'सुरुवात शेड / कचरा डेपो',
    collectionShift: 'संकलन वेळ (शिफ्ट)',
    collectionDate: 'संकलन तारीख',
    stopsQueue: 'निवडलेले थांबे',
    stepList: 'मार्ग टप्पे व तपशील',
    optimizeBtn: 'पायी मार्ग अनुकूलित करा',
    optimizingBtn: 'ओपनस्ट्रीटमॅपवरून रस्ता शोधत आहे...',
    osrmFallbackNotice: 'सूचना: ओपनस्ट्रीटमॅप सर्व्हर अनुपलब्ध. सरळ रेषीय अंदाजित मार्ग दाखवत आहे.',
    dispatchWhatsApp: 'व्हॉट्सॲपवर मार्ग पाठवा',
    
    // Map & Bottom Sheet
    mapTitle: 'पुणे कचरा हॉटस्पॉट नकाशा',
    mapSub: 'रंगानुसार ठिकाणे विभागलेली आहेत. माहिती पाहण्यासाठी ठिकाणावर टॅप करा.',
    colorHigh: 'उच्च संभाव्यता (वरचे ३३%)',
    colorMed: 'मध्यम संभाव्यता (मधले ३३%)',
    colorLow: 'कमी संभाव्यता (खालचे ३३%)',
    toggleDepots: 'कचरा संकलन शेड दाखवा',
    centerPune: 'पुणे केंद्रस्थानी आणा',
    bottomSheetTitle: 'ठिकाण तपशील व जागा स्थिती',
    addToRoute: 'मार्गामध्ये जोडा',
    removeFromRoute: 'मार्गातून काढा',
    spotOccupiedMsg: 'हे ठिकाण या शिफ्टसाठी भरलेले आहे ({booked}/{max} वेचक). कृपया दुसरे ठिकाण निवडा.',
    suggestedAlternatives: 'जवळचे इतर मोकळे पर्याय:',
    addInstead: 'हे जोडा',
    occupiedBadge: 'पूर्ण भरलेले',
    openBadge: 'उपलब्ध',
    almostFullBadge: 'जवळपास पूर्ण',
    pickersCount: '{booked}/{max} वेचक',
    
    // Spots Directory
    directoryTitle: 'पुणे कचरा हॉटस्पॉट सूची',
    searchPlaceholder: 'ठिकाणाचे नाव किंवा भंगार प्रकार शोधा...',
    filterOnlyAvailable: 'फक्त उपलब्ध जागा दाखवा',
    colHotspot: 'ठिकाण व परिसर',
    colScore: 'गुण',
    colBreakdown: 'घटक (व्यापार/लोक/कार्यक्रम/नोंदी)',
    colYield: 'अपेक्षित वजन',
    colOccupancy: 'जागा स्थिती',
    colActions: 'कृती',
    
    // Feedback & Logs
    feedbackTitle: 'संकलन अभिप्राय नोंद',
    feedbackSub: 'खरे वजन नोंदवून गुण अद्यतनित करा आणि तुमची जागा मोकळी करा.',
    formSpot: 'हॉटस्पॉट ठिकाण',
    formPickerName: 'वेचक नाव',
    formMemberId: 'स्वच्छ सदस्य आयडी',
    formShift: 'शिफ्ट',
    formWeight: 'गोळा केलेले खरे वजन (किलो)',
    formPredictedCompare: 'अपेक्षित: {pred} किलो',
    formAccuracy: 'अंदाज अचूकता',
    formWasteTypes: 'मिळालेले भंगार प्रकार (निवडा)',
    formSegregation: 'वर्गीकरण दर्जा (१ ते ५)',
    formCondition: 'ठिकाणाची स्थिती',
    formRating: 'अनुभव रेटिंग (१ ते ५)',
    formNotes: 'महत्त्वाच्या नोंदी',
    submitFeedback: 'नोंद जतन करा व जागा सोडा',
    feedbackSavedToast: 'नोंद जतन झाली! अभिप्राय गुण {oldScore} वरून {newScore} झाले.',
    
    collectionLogsTitle: 'संकलन नोंदी (Collection Logs)',
    loadMoreLogs: 'आणखी नोंदी दाखवा',
    noMoreLogs: 'सर्व नोंदी दाखवल्या आहेत',
    
    // Events Manager
    eventsTitle: 'पुणे कार्यक्रम व जत्रा व्यवस्थापन',
    eventsSub: 'कार्यक्रमांमुळे संबंधित परिसराचा २०% कार्यक्रम गुण थेट वाढतो.',
    addEvent: 'कार्यक्रम जोडा',
    eventName: 'कार्यक्रमाचे नाव',
    eventDate: 'तारीख',
    eventPlace: 'ठिकाण',
    eventImpact: 'गर्दी / कचरा प्रमाण (०-१००)',
    saveEvent: 'कार्यक्रम जतन करा',
    
    // Scoring Weights
    adjustWeightsTitle: 'गुणांकन पद्धत बदला',
    weightsSumMustBe100: 'एकूण बेरीज १००% असणे आवश्यक आहे. सध्या: {sum}%',
    commercialWeight: 'व्यापारी घनता (बाजार, दुकाने, कॅफे) ४०%',
    populationWeight: 'लोकसंख्या घनता (सोसायटी) ३०%',
    eventsWeight: 'कार्यक्रम / जत्रा / आठवडे बाजार २०%',
    feedbackWeight: 'वेचक अभिप्राय १०%',
    applyWeights: 'बदल लागू करा',
    resetWeights: 'मूळ पद्धत (४०/३०/२०/१०)',
    
    // WhatsApp modal
    whatsappTitle: 'व्हॉट्सॲप मार्ग वाटप',
    whatsappSub: 'निश्चित मार्ग वेचक किंवा ग्रुपला त्वरित पाठवा',
    copyMessage: 'मेसेज कॉपी करा',
    messageCopied: 'मेसेज कॉपी झाला!',
    openWhatsApp: 'व्हॉट्सॲपवर पाठवा',
    slotConfirmedTag: 'जागा निश्चित',
  },
  
  hi: {
    // Navigation Tabs
    tabHome: 'होम',
    tabMap: 'मानचित्र',
    tabRoute: 'मार्ग',
    tabSpots: 'स्थान',
    tabFeedback: 'फीडबैक',
    
    // Top Bar
    brandName: 'कचरा वेचक मार्ग सहायक',
    tagline: 'पुणे नगर निगम एवं स्वच्छ नेटवर्क',
    demoPicker: 'डेमो वेचक',
    beginnerGuide: 'मार्गदर्शिका',
    sampleDataNotice: 'नमूना डेटा · पुणे नगर निगम एवं स्वच्छ मॉडल',
    dataLastUpdated: 'अंतिम अपडेट: आज, सुबह ०८:३०',
    
    // Home Dashboard KPIs
    kpiMonitoredHotspots: 'निगरानी क्षेत्र',
    kpiAcrossZones: 'पुणे के ४ प्रमुख क्षेत्रों में',
    kpiAvgScore: 'औसत अंक',
    kpiScoreScale: '१००.० में से',
    kpiRecyclablePool: 'अनुमानित कबाड़ पूल',
    kpiKgPerDay: 'किग्रा / दिन (नमूना)',
    kpiTopSpot: 'शीर्ष संभावित क्षेत्र',
    kpiPts: 'अंक',
    
    // Live Occupancy section on Home
    liveOccupancyTitle: 'लाइव स्थान उपलब्धता (भीड़ से बचें)',
    liveOccupancyDesc: 'एक ही स्थान पर कई वेचकों को जाने से रोकने के लिए स्लॉट बुक किया जाता है।',
    slotsAvailable: 'स्लॉट उपलब्ध',
    slotsFull: 'पूर्ण',
    slotsAlmostFull: 'लगभग पूर्ण',
    filterAllZones: 'सभी क्षेत्र',
    
    // Route Times & Numbers
    routeSummaryTitle: 'पैदल दूरी एवं समय गणना',
    walkingTimeLabel: 'पैदल चलने का समय',
    collectionTimeLabel: 'संग्रहण समय',
    totalShiftTimeLabel: 'कुल शिफ्ट समय',
    walkingTimeTooltip: 'चलने का समय = कुल पैदल दूरी (किमी) ÷ गाड़ी के साथ गति (३.८ किमी/घंटा)।',
    collectionTimeTooltip: 'संग्रहण समय = (अनुमानित वजन ÷ लोडिंग गति [१० किग्रा/मिनट]) + ५ मिनट छंटाई और बातचीत।',
    totalShiftTimeTooltip: 'कुल समय = चलने का समय + संग्रहण समय। ४ घंटे से अधिक होने पर चेतावनी दी जाती है।',
    shiftWindowWarning: 'चेतावनी: कुल मार्ग समय ({time}) ४ घंटे की शिफ्ट ({maxTime}) से अधिक है। स्टॉप कम करें।',
    
    // Assumptions & Capacity
    collectionAssumptionsBtn: 'संग्रहण मान्यताएं',
    collectionAssumptionsTitle: 'संग्रहण एवं आय मान्यताएं',
    walkingSpeed: 'चलने की गति (किमी/घंटा)',
    loadingRate: 'लोडिंग गति (किग्रा/मिनट)',
    sortingMins: 'प्रति स्टॉप छंटाई समय (मिनट)',
    collectionEfficiency: 'संग्रहण दक्षता (%)',
    cartCapacity: 'हाथगाड़ी क्षमता (किग्रा)',
    scrapRateTable: 'कबाड़ मूल्य तालिका (₹/किग्रा)',
    resetAssumptions: 'डिफ़ॉल्ट पर रीसेट करें',
    saveAssumptions: 'सहेजें',
    
    expectedRecyclables: 'अनुमानित कबाड़',
    cartCapWarning: 'हाथगाड़ी क्षमता पूर्ण! वजन {cap} किग्रा पर सीमित (कुल अनुमानित: {expected} किग्रा)। डिपो में माल खाली करें।',
    projectedRevenue: 'अनुमानित आय',
    revenueTooltip: 'आय = प्रत्येक कबाड़ का वजन × मूल्य ₹/किग्रा का योग।',
    
    // Routing Controls
    orderModeAuto: 'स्वचालित क्रम (निकटतम पहले)',
    orderModeManual: 'मैनुअल क्रम',
    returnToHub: 'प्रारंभिक डिपो पर वापस लौटें',
    autoTop3: 'उपलब्ध शीर्ष ३ स्थान',
    autoTop5: 'उपलब्ध शीर्ष ५ स्थान',
    clearQueue: 'मार्ग साफ करें',
    startHub: 'शुरुआती शेड / डिपो',
    collectionShift: 'शिफ्ट समय',
    collectionDate: 'संग्रहण तिथि',
    stopsQueue: 'चयनित स्टॉप',
    stepList: 'मार्ग चरण व विवरण',
    optimizeBtn: 'पैदल मार्ग अनुकूलित करें',
    optimizingBtn: 'ओपनस्ट्रीटमैप से सड़क खोजी जा रही है...',
    osrmFallbackNotice: 'सूचना: ओपनस्ट्रीटमैप सर्वर अनुपलब्ध। सीधी रेखा पैदल मार्ग दिखाया जा रहा है।',
    dispatchWhatsApp: 'व्हाट्सएप पर मार्ग भेजें',
    
    // Map & Bottom Sheet
    mapTitle: 'पुणे कचरा हॉटस्पॉट मानचित्र',
    mapSub: 'रंग के आधार पर स्थान विभाजित हैं। जानकारी देखने के लिए स्थान पर टैप करें।',
    colorHigh: 'उच्च संभावना (शीर्ष ३३%)',
    colorMed: 'मध्यम संभावना (मध्य ३३%)',
    colorLow: 'कम संभावना (निचला ३३%)',
    toggleDepots: 'संग्रहण डिपो दिखाएं',
    centerPune: 'पुणे केंद्र में लाएं',
    bottomSheetTitle: 'स्थान विवरण व स्लॉट उपलब्धता',
    addToRoute: 'मार्ग में जोड़ें',
    removeFromRoute: 'मार्ग से हटाएं',
    spotOccupiedMsg: 'यह स्थान इस शिफ्ट के लिए भर चुका है ({booked}/{max} कचरा वेचक)। कृपया दूसरा स्थान चुनें।',
    suggestedAlternatives: 'निकटतम उपलब्ध वैकल्पिक स्थान:',
    addInstead: 'इसे जोड़ें',
    occupiedBadge: 'पूर्ण',
    openBadge: 'उपलब्ध',
    almostFullBadge: 'लगभग पूर्ण',
    pickersCount: '{booked}/{max} वेचक',
    
    // Spots Directory
    directoryTitle: 'पुणे कचरा हॉटस्पॉट सूची',
    searchPlaceholder: 'स्थान का नाम या कबाड़ का प्रकार खोजें...',
    filterOnlyAvailable: 'केवल उपलब्ध स्लॉट दिखाएं',
    colHotspot: 'स्थान एवं क्षेत्र',
    colScore: 'अंक',
    colBreakdown: 'घटक (व्यापार/जनसंख्या/इवेंट/फीडबैक)',
    colYield: 'अनुमानित वजन',
    colOccupancy: 'स्लॉट स्थिति',
    colActions: 'कार्रवाई',
    
    // Feedback & Logs
    feedbackTitle: 'संग्रहण फीडबैक फॉर्म',
    feedbackSub: 'वास्तविक वजन दर्ज कर स्कोर अपडेट करें और अपना स्लॉट खाली करें।',
    formSpot: 'हॉटस्पॉट स्थान',
    formPickerName: 'वेचक का नाम',
    formMemberId: 'स्वच्छ सदस्य आईडी',
    formShift: 'शिफ्ट',
    formWeight: 'वास्तविक कबाड़ वजन (किग्रा)',
    formPredictedCompare: 'अनुमानित: {pred} किग्रा',
    formAccuracy: 'सटीकता प्रतिशत',
    formWasteTypes: 'प्राप्त कबाड़ के प्रकार (चुनें)',
    formSegregation: 'वर्गीकरण गुणवत्ता (१ से ५)',
    formCondition: 'स्थान की स्थिति',
    formRating: 'अनुभव रेटिंग (१ से ५)',
    formNotes: 'फील्ड नोट्स',
    submitFeedback: 'लॉग सहेजें एवं स्लॉट खाली करें',
    feedbackSavedToast: 'लॉग सहेजा गया! फीडबैक स्कोर {oldScore} से बढ़कर {newScore} हुआ।',
    
    collectionLogsTitle: 'संग्रहण लॉग (Collection Logs)',
    loadMoreLogs: 'और लॉग दिखाएं',
    noMoreLogs: 'सभी लॉग प्रदर्शित हैं',
    
    // Events Manager
    eventsTitle: 'पुणे कार्यक्रम व महोत्सव प्रबंधक',
    eventsSub: 'आयोजनों से संबंधित क्षेत्र का २०% इवेंट स्कोर सीधे बढ़ता है।',
    addEvent: 'कार्यक्रम जोड़ें',
    eventName: 'कार्यक्रम का नाम',
    eventDate: 'तिथि',
    eventPlace: 'स्थान',
    eventImpact: 'भीड़ / कबाड़ स्कोर (०-१००)',
    saveEvent: 'कार्यक्रम सहेजें',
    
    // Scoring Weights
    adjustWeightsTitle: 'स्कोरिंग वजन समायोजित करें',
    weightsSumMustBe100: 'कुल योग १००% होना चाहिए। वर्तमान: {sum}%',
    commercialWeight: 'व्यावसायिक घनत्व (बाजार, दुकानें) ४०%',
    populationWeight: 'जनसंख्या घनत्व (सोसायटी) ३०%',
    eventsWeight: 'इवेंट्स / हाट / मेले २०%',
    feedbackWeight: 'कलेक्टर फीडबैक १०%',
    applyWeights: 'लागू करें',
    resetWeights: 'रीसेट करें (४०/३०/२०/१०)',
    
    // WhatsApp modal
    whatsappTitle: 'व्हाट्सएप मार्ग प्रेषण',
    whatsappSub: 'पुष्ट मार्ग कचरा वेचक या ग्रुप को भेजें',
    copyMessage: 'संदेश कॉपी करें',
    messageCopied: 'संदेश कॉपी हुआ!',
    openWhatsApp: 'व्हाट्सएप पर साझा करें',
    slotConfirmedTag: 'स्लॉट पुष्ट',
  }
};

export function t(lang: Language, key: keyof typeof TRANSLATIONS['en'], params?: Record<string, string | number>): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  let text = dict[key] || TRANSLATIONS['en'][key] || String(key);
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}
