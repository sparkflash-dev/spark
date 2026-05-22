/**
 * Extended locale fallback chain — handles edge cases in locale detection.
 */

const LOCALE_ALIASES: Record<string, string> = {
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
  'zh-SG': 'zh-CN',
  'zh-HK': 'zh-TW',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  'es-419': 'es', // Latin American Spanish
  'es-MX': 'es',
  'fr-CA': 'fr',
  'fr-BE': 'fr',
  'de-AT': 'de',
  'de-CH': 'de',
  'ar-SA': 'ar',
  'ar-EG': 'ar',
  'ar-AE': 'ar',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'tr-TR': 'tr',
  'pl-PL': 'pl',
  'it-IT': 'it',
  'it-CH': 'it',
  'ru-RU': 'ru',
  'en-US': 'en',
  'en-GB': 'en',
  'en-AU': 'en',
  'en-CA': 'en',
  'en-NZ': 'en',
  'en-IN': 'en',
};

export function resolveLocaleAlias(locale: string): string {
  return LOCALE_ALIASES[locale] || locale;
}

export function getLanguageFromLocale(locale: string): string {
  return locale.split('-')[0].split('_')[0].toLowerCase();
}

export function isRTL(locale: string): boolean {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ckb'];
  return rtlLanguages.includes(getLanguageFromLocale(locale));
}

export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

export function getWritingSystem(locale: string): string {
  const lang = getLanguageFromLocale(locale);
  const systems: Record<string, string> = {
    'zh': 'CJK',
    'ja': 'CJK',
    'ko': 'CJK',
    'ar': 'Arabic',
    'he': 'Hebrew',
    'ru': 'Cyrillic',
    'pl': 'Latin',
    'tr': 'Latin',
    'de': 'Latin',
    'fr': 'Latin',
    'es': 'Latin',
    'it': 'Latin',
    'pt': 'Latin',
    'en': 'Latin',
  };
  return systems[lang] || 'Latin';
}

export function getFontRecommendation(locale: string): string {
  const system = getWritingSystem(locale);
  switch (system) {
    case 'CJK': return 'Noto Sans CJK, Source Han Sans, sans-serif';
    case 'Arabic': return 'Noto Sans Arabic, Amiri, sans-serif';
    case 'Hebrew': return 'Noto Sans Hebrew, sans-serif';
    case 'Cyrillic': return 'Inter, Noto Sans, sans-serif';
    default: return 'Inter, -apple-system, sans-serif';
  }
}
