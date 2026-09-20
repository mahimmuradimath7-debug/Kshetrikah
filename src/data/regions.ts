import type { Region } from './types';

// 28 Indian states + 8 UTs, with English and Hindi names.
// IDs are stable slugs; do not rename once shipped.
export const regions: Region[] = [
  { id: 'IN-AN', nameEn: 'Andaman & Nicobar Islands', nameHi: 'अंडमान और निकोबार द्वीपसमूह', nameMr: 'अंदमान आणि निकोबार बेटे' },
  { id: 'IN-AP', nameEn: 'Andhra Pradesh', nameHi: 'आंध्र प्रदेश', nameMr: 'आंध्र प्रदेश' },
  { id: 'IN-AR', nameEn: 'Arunachal Pradesh', nameHi: 'अरुणाचल प्रदेश', nameMr: 'अरुणाचल प्रदेश' },
  { id: 'IN-AS', nameEn: 'Assam', nameHi: 'असम', nameMr: 'आसाम' },
  { id: 'IN-BR', nameEn: 'Bihar', nameHi: 'बिहार', nameMr: 'बिहार' },
  { id: 'IN-CH', nameEn: 'Chandigarh', nameHi: 'चंडीगढ़', nameMr: 'चंदिगढ' },
  { id: 'IN-CG', nameEn: 'Chhattisgarh', nameHi: 'छत्तीसगढ़', nameMr: 'छत्तीसगड' },
  { id: 'IN-DN', nameEn: 'Dadra & Nagar Haveli and Daman & Diu', nameHi: 'दादरा और नगर हवेली और दमन और दीव', nameMr: 'दादरा आणि नगर हवेली आणि दमण आणि दीव' },
  { id: 'IN-DL', nameEn: 'Delhi', nameHi: 'दिल्ली', nameMr: 'दिल्ली' },
  { id: 'IN-GA', nameEn: 'Goa', nameHi: 'गोवा', nameMr: 'गोवा' },
  { id: 'IN-GJ', nameEn: 'Gujarat', nameHi: 'गुजरात', nameMr: 'गुजरात' },
  { id: 'IN-HR', nameEn: 'Haryana', nameHi: 'हरियाणा', nameMr: 'हरियाणा' },
  { id: 'IN-HP', nameEn: 'Himachal Pradesh', nameHi: 'हिमाचल प्रदेश', nameMr: 'हिमाचल प्रदेश' },
  { id: 'IN-JK', nameEn: 'Jammu & Kashmir', nameHi: 'जम्मू और कश्मीर', nameMr: 'जम्मू आणि काश्मीर' },
  { id: 'IN-JH', nameEn: 'Jharkhand', nameHi: 'झारखंड', nameMr: 'झारखंड' },
  { id: 'IN-KA', nameEn: 'Karnataka', nameHi: 'कर्नाटक', nameMr: 'कर्नाटक' },
  { id: 'IN-KL', nameEn: 'Kerala', nameHi: 'केरल', nameMr: 'केरळ' },
  { id: 'IN-LA', nameEn: 'Ladakh', nameHi: 'लद्दाख', nameMr: 'लडाख' },
  { id: 'IN-LD', nameEn: 'Lakshadweep', nameHi: 'लक्षद्वीप', nameMr: 'लक्षद्वीप' },
  { id: 'IN-MP', nameEn: 'Madhya Pradesh', nameHi: 'मध्य प्रदेश', nameMr: 'मध्य प्रदेश' },
  { id: 'IN-MH', nameEn: 'Maharashtra', nameHi: 'महाराष्ट्र', nameMr: 'महाराष्ट्र (गृह राज्य)' },
  { id: 'IN-MN', nameEn: 'Manipur', nameHi: 'मणिपुर', nameMr: 'मणिपूर' },
  { id: 'IN-ML', nameEn: 'Meghalaya', nameHi: 'मेघालय', nameMr: 'मेघालय' },
  { id: 'IN-MZ', nameEn: 'Mizoram', nameHi: 'मिज़ोरम', nameMr: 'मिझोराम' },
  { id: 'IN-NL', nameEn: 'Nagaland', nameHi: 'नागालैंड', nameMr: 'नागालँड' },
  { id: 'IN-OD', nameEn: 'Odisha', nameHi: 'ओडिशा', nameMr: 'ओडिशा' },
  { id: 'IN-PY', nameEn: 'Puducherry', nameHi: 'पुडुचेरी', nameMr: 'पुडुचेरी' },
  { id: 'IN-PB', nameEn: 'Punjab', nameHi: 'पंजाब', nameMr: 'पंजाब' },
  { id: 'IN-RJ', nameEn: 'Rajasthan', nameHi: 'राजस्थान', nameMr: 'राजस्थान' },
  { id: 'IN-SK', nameEn: 'Sikkim', nameHi: 'सिक्किम', nameMr: 'सिक्कीम' },
  { id: 'IN-TN', nameEn: 'Tamil Nadu', nameHi: 'तमिलनाडु', nameMr: 'तमिळनाडू' },
  { id: 'IN-TS', nameEn: 'Telangana', nameHi: 'तेलंगाना', nameMr: 'तेलंगणा' },
  { id: 'IN-TR', nameEn: 'Tripura', nameHi: 'त्रिपुरा', nameMr: 'त्रिपुरा' },
  { id: 'IN-UP', nameEn: 'Uttar Pradesh', nameHi: 'उत्तर प्रदेश', nameMr: 'उत्तर प्रदेश' },
  { id: 'IN-UT', nameEn: 'Uttarakhand', nameHi: 'उत्तराखंड', nameMr: 'उत्तराखंड' },
  { id: 'IN-WB', nameEn: 'West Bengal', nameHi: 'पश्चिम बंगाल', nameMr: 'पश्चिम बंगाल' },
];

export const regionMap: Record<string, Region> = regions.reduce(
  (acc, r) => ({ ...acc, [r.id]: r }),
  {} as Record<string, Region>
);
