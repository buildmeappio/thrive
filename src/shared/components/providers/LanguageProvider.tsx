'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  isEnglish: boolean;
  isFrench: boolean;
  isSpanish: boolean;
  isMandarin: boolean;
  isCantonese: boolean;
  isArabic: boolean;
  isPunjabi: boolean;
  isUrdu: boolean;
  isHindi: boolean;
  isTagalog: boolean;
  isOther: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Basic translations for Canadian compliance
const translations = {
  EN: {
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'privacy.consent': 'I agree to the Privacy Policy',
    'privacy.marketing': 'I agree to receive marketing communications',
    'compliance.pipeda': 'This platform complies with Canadian privacy laws (PIPEDA)',
  },
  FR: {
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.submit': 'Soumettre',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'auth.login': 'Connexion',
    'auth.logout': 'Déconnexion',
    'auth.register': "S'inscrire",
    'privacy.consent': "J'accepte la politique de confidentialité",
    'privacy.marketing': "J'accepte de recevoir des communications marketing",
    'compliance.pipeda':
      'Cette plateforme respecte les lois canadiennes sur la vie privée (LPRPDE)',
  },
} as const;

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

export function LanguageProvider({ children, defaultLanguage = 'EN' }: LanguageProviderProps) {
  const { data: session, update } = useSession();
  const [language, setLanguageState] = useState<string>(defaultLanguage);

  // Initialize language from session or localStorage
  useEffect(() => {
    const stored = localStorage.getItem('thrive-language') as string;
    if (stored && (stored === 'EN' || stored === 'FR')) {
      setLanguageState(stored);
    }
  }, [session]);

  const setLanguage = async (newLanguage: string) => {
    setLanguageState(newLanguage);
    localStorage.setItem('thrive-language', newLanguage);

    // Update session if user is authenticated
    if (session?.user) {
      try {
        await update({
          ...session,
          user: {
            ...session.user,
            preferredLanguage: newLanguage,
          },
        });

        // Also update in database via API
        await fetch('/api/user/language', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: newLanguage }),
        });
      } catch (error) {
        console.error('Failed to update language preference:', error);
      }
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language as keyof typeof translations];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key; // Return key if translation not found
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    isEnglish: language === 'EN',
    isFrench: language === 'FR',
    isSpanish: language === 'ES',
    isMandarin: language === 'ZH',
    isCantonese: language === 'YUE',
    isArabic: language === 'AR',
    isPunjabi: language === 'PA',
    isUrdu: language === 'UR',
    isHindi: language === 'HI',
    isTagalog: language === 'TL',
    isOther: language === 'OTHER',
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      <div lang={language === 'EN' ? 'en-CA' : language === 'FR' ? 'fr-CA' : language === 'ES' ? 'es-CA' : language === 'ZH' ? 'zh-CA' : language === 'YUE' ? 'yue-CA' : language === 'AR' ? 'ar-CA' : language === 'PA' ? 'pa-CA' : language === 'UR' ? 'ur-CA' : language === 'HI' ? 'hi-CA' : language === 'TL' ? 'tl-CA' : language === 'OTHER' ? 'other-CA' : 'en-CA'}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Language switcher component
export function LanguageSwitcher() {
  const { setLanguage, isEnglish, isFrench } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLanguage('EN')}
        className={`rounded px-2 py-1 text-sm ${isEnglish
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('FR')}
        className={`rounded px-2 py-1 text-sm ${isFrench
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
      >
        FR
      </button>
    </div>
  );
}
