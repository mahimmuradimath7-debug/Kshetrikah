import type { CropId } from './types';

// Monthly advisory: which diseases to watch for each crop, by month
export interface MonthAdvisory {
  crop: CropId;
  month: number; // 1-12
  tipEn: string;
  tipHi: string;
}

export const monthlyAdvisory: MonthAdvisory[] = [
  // RICE (kharif)
  { crop: 'rice', month: 6, tipEn: 'Monitor nursery for blast and sheath blight in humid weather. Treat seed with carbendazim.', tipHi: 'नर्सरी में ब्लास्ट और शीथ ब्लाइट पर नज़र रखें। बीज को कार्बेन्डाजिम से उपचारित करें।' },
  { crop: 'rice', month: 7, tipEn: 'Watch for stem borer and brown plant hopper. Maintain field sanitation.', tipHi: 'तना छेदक और भूरा फुदका पर नज़र रखें। खेत की सफ़ाई रखें।' },
  { crop: 'rice', month: 8, tipEn: 'Peak season for bacterial leaf blight and sheath blight — scout weekly.', tipHi: 'बैक्टीरियल लीफ ब्लाइट और शीथ ब्लाइट का चरम मौसम — साप्ताहिक निरीक्षण करें।' },
  { crop: 'rice', month: 9, tipEn: 'Grain filling stage — protect against neck blast and false smut.', tipHi: 'दाना भरने का समय — नेक ब्लास्ट और फॉल्स स्मट से बचाव करें।' },

  // WHEAT (rabi)
  { crop: 'wheat', month: 11, tipEn: 'Sowing time. Treat seed with carboxin for loose smut prevention.', tipHi: 'बुवाई का समय। लूज़ स्मट की रोकथाम के लिए बीज को कार्बोक्सिन से उपचारित करें।' },
  { crop: 'wheat', month: 12, tipEn: 'Crown root initiation stage — first irrigation critical; watch for termites.', tipHi: 'क्राउन रूट बनने का समय — पहली सिंचाई महत्वपूर्ण; दीमक पर नज़र रखें।' },
  { crop: 'wheat', month: 1, tipEn: 'Tillering stage — watch for yellow rust if fog and cool weather persist.', tipHi: 'कल्ले निकलने का समय — कोहरा और ठंड रहने पर येलो रस्ट पर नज़र रखें।' },
  { crop: 'wheat', month: 2, tipEn: 'Jointing stage — high risk for rusts; spray propiconazole if first pustules seen.', tipHi: 'गांठ बनने का समय — रस्ट का उच्च जोखिम; पहले पस्ट्यूल दिखने पर प्रोपिकोनाज़ोल का छिड़काव करें।' },
  { crop: 'wheat', month: 3, tipEn: 'Heading/flowering — critical for Karnal bunt and loose smut; protect with spray.', tipHi: 'बाली/फूल आने का समय — करनाल बंट और लूज़ स्मट के लिए महत्वपूर्ण; छिड़काव से सुरक्षित रखें।' },

  // MAIZE (kharif)
  { crop: 'maize', month: 6, tipEn: 'Sowing time. Install pheromone traps for fall armyworm from day 1.', tipHi: 'बुवाई का समय। पहले दिन से फॉल आर्मीवर्म के लिए फेरोमोन ट्रैप लगाएं।' },
  { crop: 'maize', month: 7, tipEn: 'Vulnerable whorl stage — scout daily for fall armyworm damage.', tipHi: 'कमज़ोर व्होर्ल अवस्था — फॉल आर्मीवर्म क्षति के लिए रोज़ जाँचें।' },
  { crop: 'maize', month: 8, tipEn: 'Watch for turcicum leaf blight during humid weather; spray mancozeb if needed.', tipHi: 'नम मौसम में टर्सिकम लीफ ब्लाइट पर नज़र रखें; ज़रूरत हो तो मैंकोज़ेब का छिड़काव करें।' },

  // COTTON (kharif)
  { crop: 'cotton', month: 5, tipEn: 'Sowing time. Treat seed with imidacloprid for sucking pest protection.', tipHi: 'बुवाई का समय। चूसक कीटों से सुरक्षा के लिए बीज को इमिडाक्लोप्रिड से उपचारित करें।' },
  { crop: 'cotton', month: 6, tipEn: 'Monitor for whitefly and CLCuV; install yellow sticky traps.', tipHi: 'व्हाइटफ्लाई और CLCuV पर नज़र रखें; पीले स्टिकी ट्रैप लगाएं।' },
  { crop: 'cotton', month: 8, tipEn: 'Flowering stage — start pink bollworm pheromone traps.', tipHi: 'फूल आने का समय — पिंक बॉलवर्म फेरोमोन ट्रैप लगाना शुरू करें।' },
  { crop: 'cotton', month: 10, tipEn: 'Boll formation — peak pink bollworm and boll rot risk; plan sprays.', tipHi: 'गोखरू बनने का समय — पिंक बॉलवर्म और बॉल रॉट का चरम जोखिम; छिड़काव की योजना बनाएं।' },

  // SUGARCANE
  { crop: 'sugarcane', month: 2, tipEn: 'Spring planting. Sett treatment with carbendazim essential for red rot prevention.', tipHi: 'बसंत रोपाई। रेड रॉट रोकथाम के लिए कार्बेन्डाजिम से सेट उपचार ज़रूरी।' },
  { crop: 'sugarcane', month: 6, tipEn: 'Early growth — start top borer management with Trichogramma releases.', tipHi: 'प्रारंभिक वृद्धि — ट्राइकोग्रामा रिलीज़ से टॉप बोरर प्रबंधन शुरू करें।' },
  { crop: 'sugarcane', month: 7, tipEn: 'Monsoon peak — top borer and red rot active; ensure drainage.', tipHi: 'मानसून का चरम — टॉप बोरर और रेड रॉट सक्रिय; जल निकास सुनिश्चित करें।' },

  // TOMATO (year-round)
  { crop: 'tomato', month: 6, tipEn: 'Transplanting time. Drip irrigation and staking essential to prevent blight.', tipHi: 'रोपाई का समय। ब्लाइट रोकने के लिए ड्रिप सिंचाई और सहारा ज़रूरी।' },
  { crop: 'tomato', month: 7, tipEn: 'Peak humidity — late blight and early blight high risk. Weekly sprays needed.', tipHi: 'चरम नमी — लेट ब्लाइट और अर्ली ब्लाइट का उच्च जोखिम। साप्ताहिक छिड़काव ज़रूरी।' },
  { crop: 'tomato', month: 9, tipEn: 'Watch for fruit borer and leaf curl virus — install pheromone traps.', tipHi: 'फ्रूट बोरर और लीफ कर्ल वायरस पर नज़र रखें — फेरोमोन ट्रैप लगाएं।' },
  { crop: 'tomato', month: 12, tipEn: 'Cool weather — late blight risk in low tunnels. Reduce humidity.', tipHi: 'ठंड मौसम — लो टनल में लेट ब्लाइट का जोखिम। नमी कम करें।' },

  // POTATO (rabi)
  { crop: 'potato', month: 10, tipEn: 'Main planting. Use certified seed only. Apply ridomil at first blight sign.', tipHi: 'मुख्य बुवाई। केवल प्रमाणित बीज का उपयोग करें। पहले ब्लाइट संकेत पर रिडोमिल डालें।' },
  { crop: 'potato', month: 11, tipEn: 'Tuber initiation — first spray against late blight if weather turns humid.', tipHi: 'कंद बनने की शुरुआत — मौसम नम होने पर लेट ब्लाइट के खिलाफ़ पहला छिड़काव।' },
  { crop: 'potato', month: 1, tipEn: 'Tuber bulking — peak late blight risk; weekly sprays essential.', tipHi: 'कंद बढ़ने का समय — लेट ब्लाइट का चरम जोखिम; साप्ताहिक छिड़काव ज़रूरी।' },
  { crop: 'potato', month: 2, tipEn: 'Pre-harvest — destroy haulms 10 days before to protect tubers from blight.', tipHi: 'कटाई से पहले — कंदों को ब्लाइट से बचाने के लिए 10 दिन पहले तने नष्ट करें।' },

  // CHILI (year-round)
  { crop: 'chili', month: 5, tipEn: 'Nursery stage — cover with 50-mesh net against whitefly and thrips.', tipHi: 'नर्सरी अवस्था — व्हाइटफ्लाई और थ्रिप्स से बचाव के लिए 50-मेश जाली से ढकें।' },
  { crop: 'chili', month: 7, tipEn: 'Vegetative stage — watch for thrips during dry spells; spray neem oil.', tipHi: 'वानस्पतिक अवस्था — सूखे दौर में थ्रिप्स पर नज़र रखें; नीम तेल का छिड़काव करें।' },
  { crop: 'chili', month: 9, tipEn: 'Flowering and fruit set — critical for anthracnose. Preventive spray needed.', tipHi: 'फूल और फल बनने का समय — एंथ्रेक्नोज़ के लिए महत्वपूर्ण। निवारक छिड़काव ज़रूरी।' },
  { crop: 'chili', month: 10, tipEn: 'Fruit ripening — high anthracnose risk during rain. Spray before forecast rain.', tipHi: 'फल पकना — बारिश में एंथ्रेक्नोज़ का उच्च जोखिम। बारिश पूर्वानुमान से पहले छिड़काव करें।' },
];

export function advisoryForCrop(crop: CropId): MonthAdvisory[] {
  return monthlyAdvisory
    .filter((a) => a.crop === crop)
    .sort((a, b) => a.month - b.month);
}
