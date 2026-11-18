import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';

const defaultSettings = {
  showroomName: 'Ranaji Udaipur',
  tagline: 'Royal Rajasthani Wedding Wardrobe & Tailoring',
  phone: '+91 98765 43210',
  whatsappNumber: '919876543210',
  email: 'contact@ranaji.com',
  customerServiceEmail: 'info@ranajiudaipur.com',
  address: '24/451, 1st Floor, Near Udaipur Suzuki Bike Showroom, Sec-5, Surajpole, Udaipur – 313001',
  openingHours: 'Mon – Sun: 10:00 AM – 9:00 PM',
  googleMapsUrl: 'https://maps.app.goo.gl/X6WTs63sTx9NGqje9',
  gstNumber: '08AAAAA0000A1Z5',
  stateCode: '08',
  invoicePrefix: 'RNJ',
  instagramUrl: 'https://www.instagram.com/ranaji_udaipur',
  facebookUrl: 'https://www.facebook.com/share/18PhEG4c3J/'
};

const SettingsContext = createContext({
  settings: defaultSettings,
  loading: false,
  refreshSettings: () => {}
});

export const useSettings = () => {
  return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchPublicSettings = useCallback(async () => {
    try {
      const res = await settingsAPI.getPublic();
      if (res && res.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data
        }));
      }
    } catch (err) {
      console.warn('Using default showroom settings (public API unavailable):', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicSettings();
  }, [fetchPublicSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchPublicSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
