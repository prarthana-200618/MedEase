import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const savedLang = localStorage.getItem('medease_lang') || 'en';

const resources = {
  en: {
    translation: {
      appName: 'MedEase',
      tagline: 'YOUR HEALTH. BETTER UNDERSTOOD.',
      heroHeadline: 'Understand Your Medical Documents. With Confidence.',
      subTagline: 'MedEase transforms complex prescriptions, lab results, and discharge summaries into clear, simple explanations in English and Malayalam.',
      getStarted: 'Get Started',
      login: 'Log In',
      register: 'Create Account',
      logout: 'Sign Out',
      dashboard: 'Dashboard',
      myDocuments: 'Medical Documents',
      uploadDocument: 'Upload Medical Document',
      prescriptionTranslation: 'Prescription Translation',
      medicineReminders: 'Medicine Reminders',
      aiAssistant: 'AI Medical Assistant',
      caregiverAccess: 'Caregiver Access',
      profile: 'Profile & Settings',
      welcomeGreeting: 'Hello',
      dashboardSubtitle: 'Your health documents, simplified.',
      documentsInLibrary: 'Documents in your library',
      explanationsCount: 'Explanations',
      activeRemindersCount: 'Active reminders',
      recentDocument: 'Recent document',
      processed: 'Processed',
      processing: 'Processing',
      pending: 'Pending',
      failed: 'Failed',
      malayalamAvailable: 'Malayalam explanation available',
      medicalDisclaimer: 'Notice: MedEase is an information-understanding platform. It is NOT a doctor, diagnostic system, or replacement for qualified healthcare professionals.',
    }
  },
  ml: {
    translation: {
      appName: 'MedEase',
      tagline: 'നിങ്ങളുടെ ആരോഗ്യം. കൂടുതൽ വ്യക്തമായി.',
      heroHeadline: 'നിങ്ങളുടെ മെഡിക്കൽ രേഖകൾ ലളിതമായി മനസ്സിലാക്കാം',
      subTagline: 'ഡോക്ടർമാരുടെ കുറിപ്പടികളും ടെസ്റ്റ് റിപ്പോർട്ടുകളും ലളിതമായ മലയാളത്തിലും ഇംഗ്ലീഷിലും മനസ്സിലാക്കാൻ MedEase സഹായിക്കുന്നു.',
      getStarted: 'തുടങ്ങാം',
      login: 'ലോഗിൻ',
      register: 'അക്കൗണ്ട് നിർമ്മിക്കുക',
      logout: 'ലോഗ് ഔട്ട്',
      dashboard: 'ഡാഷ്‌ബോർഡ്',
      myDocuments: 'മെഡിക്കൽ രേഖകൾ',
      uploadDocument: 'രേഖ അപ്‌ലോഡ് ചെയ്യുക',
      prescriptionTranslation: 'കുറിപ്പടി വിവരണം',
      medicineReminders: 'മരുന്ന് ഓർമ്മപ്പെടുത്തലുകൾ',
      aiAssistant: 'AI അസിസ്റ്റന്റ്',
      caregiverAccess: 'കെയർഗിവർ അനുമതി',
      profile: 'പ്രൊഫൈൽ & ക്രമീകരണങ്ങൾ',
      welcomeGreeting: 'നമസ്കാരം',
      dashboardSubtitle: 'നിങ്ങളുടെ മെഡിക്കൽ രേഖകൾ ലളിതമായി.',
      documentsInLibrary: 'നിങ്ങളുടെ ലൈബ്രറിയിലെ രേഖകൾ',
      explanationsCount: 'വിവരണങ്ങൾ',
      activeRemindersCount: 'സജീവ ഓർമ്മപ്പെടുത്തലുകൾ',
      recentDocument: 'ഏറ്റവും പുതിയ രേഖ',
      processed: 'പരിശോധിച്ചു',
      processing: 'പരിശോധിക്കുന്നു',
      pending: 'കാത്തിരിക്കുന്നു',
      failed: 'പരാജയപ്പെട്ടു',
      malayalamAvailable: 'മലയാളം വിവരണം ലഭ്യമാണ്',
      medicalDisclaimer: 'ശ്രദ്ധിക്കുക: MedEase മെഡിക്കൽ രേഖകൾ വ്യക്തമായി മനസ്സിലാക്കാനുള്ള ഒരു സാങ്കേതിക സഹായം മാത്രമാണ്. ഇത് ഡോക്ടർമാർക്ക് പകരമല്ല.',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export const changeLanguage = (lang: string) => {
  localStorage.setItem('medease_lang', lang);
  i18n.changeLanguage(lang);
};

export default i18n;
