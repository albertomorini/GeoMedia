import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { en, it } from "./i18n";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState("IT");

    useEffect(() => {
        loadLang();
    }, [lang]);

    const loadLang = async () => {
        const saved = await SecureStore.getItemAsync("lang");
        if (saved) setLang(saved);
    };

    const changeLang = async (newLang) => {
        setLang(newLang);
        await SecureStore.setItemAsync("lang", newLang);
    };

    const t = lang === "EN" ? en : it;

    return (
        <LanguageContext.Provider value={{ lang, t, changeLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);