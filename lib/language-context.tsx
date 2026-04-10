import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n, { type SupportedLanguage } from "./i18n";

const LANGUAGE_KEY = "@risegrind_language";

interface LanguageContextValue {
  language: SupportedLanguage | null; // null = not yet selected
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  isLanguageLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage | null>(null);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((saved) => {
        if (saved && (saved === "en" || saved === "fr" || saved === "pt")) {
          setLanguageState(saved as SupportedLanguage);
          i18n.changeLanguage(saved);
        }
      })
      .finally(() => setIsLanguageLoaded(true));
  }, []);

  const setLanguage = async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLanguageLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
