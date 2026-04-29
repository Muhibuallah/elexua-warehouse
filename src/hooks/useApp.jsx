import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAll, getSetting, setSetting, STORES, seedDemoData } from '../database/db';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [data, setData] = useState({
    platforms: [], suppliers: [], platformOrders: [], boxes: [],
    products: [], inventory: [], customerOrders: [], orderItems: [],
  });
  const [settings, setSettings] = useState({
    customerReturnDays: 20, supplierReturnDays: 80, theme: 'dark', language: 'en',
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [notification, setNotification] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await seedDemoData();
      const [platforms, suppliers, platformOrders, boxes, products, inventory, customerOrders, orderItems] =
        await Promise.all([
          getAll(STORES.PLATFORMS), getAll(STORES.SUPPLIERS), getAll(STORES.PLATFORM_ORDERS),
          getAll(STORES.BOXES), getAll(STORES.PRODUCTS), getAll(STORES.INVENTORY),
          getAll(STORES.CUSTOMER_ORDERS), getAll(STORES.ORDER_ITEMS),
        ]);
      setData({ platforms, suppliers, platformOrders, boxes, products, inventory, customerOrders, orderItems });

      const [crd, srd, theme, language] = await Promise.all([
        getSetting('customerReturnDays', 20), getSetting('supplierReturnDays', 80),
        getSetting('theme', 'dark'), getSetting('language', 'en'),
      ]);
      setSettings({ customerReturnDays: crd, supplierReturnDays: srd, theme, language });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const refresh = useCallback(async (store) => {
    const storeMap = {
      [STORES.PLATFORMS]: 'platforms', [STORES.SUPPLIERS]: 'suppliers',
      [STORES.PLATFORM_ORDERS]: 'platformOrders', [STORES.BOXES]: 'boxes',
      [STORES.PRODUCTS]: 'products', [STORES.INVENTORY]: 'inventory',
      [STORES.CUSTOMER_ORDERS]: 'customerOrders', [STORES.ORDER_ITEMS]: 'orderItems',
    };
    const items = await getAll(store);
    setData(prev => ({ ...prev, [storeMap[store]]: items }));
  }, []);

  const updateSetting = useCallback(async (key, value) => {
    await setSetting(key, value);
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const showNotification = useCallback((msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  return (
    <AppContext.Provider value={{
      data, settings, loading, searchQuery, setSearchQuery,
      currentPage, setCurrentPage, refresh, updateSetting,
      notification, showNotification, reloadAll: loadAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
