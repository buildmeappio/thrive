"use client";
import { useState, useEffect } from "react";
import getLanguages from "../actions/getLanguages";

interface LanguageOption {
  value: string;
  label: string;
}

/**
 * Hook for fetching languages from database
 */
export function useLanguages() {
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        const languagesData = await getLanguages();
        const languageOptions = languagesData.map(
          (lang: { id: string; name: string }) => ({
            value: lang.id,
            label: lang.name,
          }),
        );
        setLanguages(languageOptions);
      } catch (error) {
        console.error("Failed to fetch languages:", error);
        setLanguages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  return { languages, loading };
}
