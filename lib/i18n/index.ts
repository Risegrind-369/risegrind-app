import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import fr from "./fr.json";
import pt from "./pt.json";

export type SupportedLanguage = "en" | "fr" | "pt";

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string; flag: string; nativeName: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸", nativeName: "English (US)" },
  { code: "fr", label: "Français", flag: "🇫🇷", nativeName: "Français (FR)" },
  { code: "pt", label: "Português", flag: "🇧🇷", nativeName: "Português (BR)" },
];

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    pt: { translation: pt },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
