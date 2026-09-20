import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const ALL_INDIAN_LOCALES = [
  'en',  // English (Official Language)
  'hi',  // हिन्दी (Hindi)
  'mr',  // मराठी (Marathi - Maharashtra)
  'bn',  // বাংলা (Bengali)
  'te',  // తెలుగు (Telugu)
  'ta',  // தமிழ் (Tamil)
  'gu',  // ગુજરાતી (Gujarati)
  'kn',  // ಕನ್ನಡ (Kannada)
  'ml',  // മലയാളം (Malayalam)
  'pa',  // ਪੰਜਾਬੀ (Punjabi)
  'or',  // ଓଡ଼ିଆ (Odia)
  'as',  // অসমীয়া (Assamese)
  'ur',  // اردو (Urdu)
  'sa',  // संस्कृतम् (Sanskrit)
  'kok', // कोंकणी (Konkani)
  'mai', // मैथिली (Maithili)
  'ne',  // नेपाली (Nepali)
  'sat', // ᱥᱟᱱᱛᱟᱲᱤ (Santali)
  'ks',  // کٲشُر / कॉशुर (Kashmiri)
  'sd',  // سنڌي / सिंधी (Sindhi)
  'doi', // डोगरी (Dogri)
  'mni', // মৈতৈলোন্ (Manipuri)
  'brx', // बड़ो (Bodo)
] as const;

export const routing = defineRouting({
  locales: ALL_INDIAN_LOCALES,
  defaultLocale: 'en',
  localePrefix: 'always',
});

export type Locale = (typeof ALL_INDIAN_LOCALES)[number];

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
