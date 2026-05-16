import * as i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh_CN_translation from './i18n/zh-CN';
import zh_TW_translation from './i18n/zh-TW';
import en_translation from './i18n/en';
import ru_translation from './i18n/ru';
import ja_translation from './i18n/ja';
import ko_translation from './i18n/ko';
import de_translation from './i18n/de';
import fr_translation from './i18n/fr';
import es_translation from './i18n/es';
import it_translation from './i18n/it';
import pt_translation from './i18n/pt';
import ar_translation from './i18n/ar';

export function langParser() {
	if (process.env.LANG !== undefined) {
		// Bypass mocha, where lang-detect don't works
		return 'en';
	}

	const lang = Intl.DateTimeFormat().resolvedOptions().locale;

	switch (lang.substr(0, 2)) {
		case 'zh':
			if (lang === 'zh-CN' || lang === 'zh-SG') {
				return 'zh-CN';
			} // Simplified Chinese
			else {
				return 'zh-TW';
			} // Traditional Chinese
		default:
			return lang.substr(0, 2);
	}
}

i18next.use(initReactI18next).init({
	lng: langParser(),
	fallbackLng: 'en',
	nonExplicitSupportedLngs: true,
	interpolation: {
		escapeValue: false,
	},
	resources: {
		'zh-CN': zh_CN_translation,
		'zh-TW': zh_TW_translation,
		en: en_translation,
		ru: ru_translation,
		ja: ja_translation,
		ko: ko_translation,
		de: de_translation,
		fr: fr_translation,
		es: es_translation,
		it: it_translation,
		pt: pt_translation,
		ar: ar_translation,
	},
});

export const supportedLocales = ['en', 'zh', 'ru', 'ja', 'ko', 'de', 'fr', 'es', 'it', 'pt', 'ar'];

export default i18next;
