import { openDB } from 'idb';

const DB_NAME = 'elexua-warehouse';
const DB_VERSION = 1;

export const STORES = {
  PLATFORMS: 'platforms',
  SUPPLIERS: 'suppliers',
  PLATFORM_ORDERS: 'platformOrders',
  BOXES: 'boxes',
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  CUSTOMER_ORDERS: 'customerOrders',
  ORDER_ITEMS: 'orderItems',
  SETTINGS: 'settings',
};

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Platforms
        if (!db.objectStoreNames.contains(STORES.PLATFORMS)) {
          const s = db.createObjectStore(STORES.PLATFORMS, { keyPath: 'id', autoIncrement: true });
          s.createIndex('platformName', 'platformName');
        }
        // Suppliers
        if (!db.objectStoreNames.contains(STORES.SUPPLIERS)) {
          const s = db.createObjectStore(STORES.SUPPLIERS, { keyPath: 'id', autoIncrement: true });
          s.createIndex('platformId', 'platformId');
          s.createIndex('supplierName', 'supplierName');
        }
        // Platform Orders
        if (!db.objectStoreNames.contains(STORES.PLATFORM_ORDERS)) {
          const s = db.createObjectStore(STORES.PLATFORM_ORDERS, { keyPath: 'id', autoIncrement: true });
          s.createIndex('platformId', 'platformId');
          s.createIndex('platformOrderNumber', 'platformOrderNumber');
        }
        // Boxes
        if (!db.objectStoreNames.contains(STORES.BOXES)) {
          const s = db.createObjectStore(STORES.BOXES, { keyPath: 'id', autoIncrement: true });
          s.createIndex('platformOrderId', 'platformOrderId');
          s.createIndex('boxLabel', 'boxLabel');
        }
        // Products
        if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
          const s = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id', autoIncrement: true });
          s.createIndex('supplierId', 'supplierId');
          s.createIndex('secretCode', 'secretCode');
          s.createIndex('supplierArticleId', 'supplierArticleId');
        }
        // Inventory
        if (!db.objectStoreNames.contains(STORES.INVENTORY)) {
          const s = db.createObjectStore(STORES.INVENTORY, { keyPath: 'id', autoIncrement: true });
          s.createIndex('productId', 'productId');
          s.createIndex('boxId', 'boxId');
          s.createIndex('status', 'status');
        }
        // Customer Orders
        if (!db.objectStoreNames.contains(STORES.CUSTOMER_ORDERS)) {
          const s = db.createObjectStore(STORES.CUSTOMER_ORDERS, { keyPath: 'id', autoIncrement: true });
          s.createIndex('customerName', 'customerName');
          s.createIndex('orderDate', 'orderDate');
        }
        // Order Items
        if (!db.objectStoreNames.contains(STORES.ORDER_ITEMS)) {
          const s = db.createObjectStore(STORES.ORDER_ITEMS, { keyPath: 'id', autoIncrement: true });
          s.createIndex('customerOrderId', 'customerOrderId');
          s.createIndex('inventoryId', 'inventoryId');
        }
        // Settings
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// Generic CRUD
export async function getAll(store) {
  const db = await getDB();
  return db.getAll(store);
}

export async function getById(store, id) {
  const db = await getDB();
  return db.get(store, id);
}

export async function add(store, data) {
  const db = await getDB();
  const id = await db.add(store, { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  return { ...data, id };
}

export async function update(store, data) {
  const db = await getDB();
  const updated = { ...data, updatedAt: new Date().toISOString() };
  await db.put(store, updated);
  return updated;
}

export async function remove(store, id) {
  const db = await getDB();
  return db.delete(store, id);
}

export async function getByIndex(store, indexName, value) {
  const db = await getDB();
  return db.getAllFromIndex(store, indexName, value);
}

// Settings
export async function getSetting(key, defaultValue = null) {
  const db = await getDB();
  const record = await db.get(STORES.SETTINGS, key);
  return record ? record.value : defaultValue;
}

export async function setSetting(key, value) {
  const db = await getDB();
  return db.put(STORES.SETTINGS, { key, value });
}

// Export all data
export async function exportAllData() {
  const db = await getDB();
  const result = {};
  for (const store of Object.values(STORES)) {
    result[store] = await db.getAll(store);
  }
  return result;
}

// Import all data
export async function importAllData(data) {
  const db = await getDB();
  const tx = db.transaction(Object.values(STORES), 'readwrite');
  for (const store of Object.values(STORES)) {
    if (data[store]) {
      await tx.objectStore(store).clear();
      for (const item of data[store]) {
        await tx.objectStore(store).put(item);
      }
    }
  }
  await tx.done;
}

// Seed demo data
export async function seedDemoData() {
  const existing = await getAll(STORES.PLATFORMS);
  if (existing.length > 0) return;

  const db = await getDB();

  // Settings
  await db.put(STORES.SETTINGS, { key: 'customerReturnDays', value: 20 });
  await db.put(STORES.SETTINGS, { key: 'supplierReturnDays', value: 80 });
  await db.put(STORES.SETTINGS, { key: 'theme', value: 'dark' });
  await db.put(STORES.SETTINGS, { key: 'language', value: 'en' });

  // Platform
  const platformId = await db.add(STORES.PLATFORMS, {
    platformName: 'Temu',
    website: 'https://www.temu.com',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Suppliers
  const sup1Id = await db.add(STORES.SUPPLIERS, {
    supplierName: 'Yiwushixigushipin Co., Ltd.',
    platformId,
    contactInfo: '193424674@qq.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const sup2Id = await db.add(STORES.SUPPLIERS, {
    supplierName: 'Yiwushilanchaodianzishangwushangxing',
    platformId,
    contactInfo: '1056874046@qq.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const sup3Id = await db.add(STORES.SUPPLIERS, {
    supplierName: 'Best Jewelery',
    platformId,
    contactInfo: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Platform Order
  const poId = await db.add(STORES.PLATFORM_ORDERS, {
    platformOrderNumber: 'PO-076-11949720146554007',
    platformId,
    orderDate: '2026-03-21',
    supplierReturnDays: 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Box
  const boxId = await db.add(STORES.BOXES, {
    boxLabel: 'A',
    platformOrderId: poId,
    receivedDate: '2026-03-31',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Products
  const products = [
    { productName: 'Silver Earing – Gedreht Wellen', supplierId: sup1Id, supplierArticleId: 'EE53332', secretCode: 1025 },
    { productName: 'Gold Earing – Gedrehte Wellen', supplierId: sup1Id, supplierArticleId: 'EE53332', secretCode: 1027 },
    { productName: 'Silver Drop Earing', supplierId: sup2Id, supplierArticleId: 'UL4239692', secretCode: 1045 },
    { productName: 'Gold Drop Earing', supplierId: sup2Id, supplierArticleId: 'UL4239692', secretCode: 1041 },
    { productName: 'Gold Earing – Gedreht', supplierId: sup1Id, supplierArticleId: 'EE53332', secretCode: 1021 },
    { productName: 'Silver Earing – Gedreht', supplierId: sup1Id, supplierArticleId: 'EE53332', secretCode: 1023 },
    { productName: 'Weiße Strohhut – Welle', supplierId: sup2Id, supplierArticleId: 'FX1281970', secretCode: 10110 },
  ];

  const productIds = [];
  for (const p of products) {
    const id = await db.add(STORES.PRODUCTS, { ...p, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    productIds.push(id);
  }

  // Inventory
  const inventoryStatuses = ['stored','stored','stored','stored','stored','sold','stored'];
  const invIds = [];
  for (let i = 0; i < products.length; i++) {
    const id = await db.add(STORES.INVENTORY, {
      productId: productIds[i],
      boxId,
      quantity: 1,
      status: inventoryStatuses[i],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    invIds.push(id);
  }

  // Customer Order
  const coId = await db.add(STORES.CUSTOMER_ORDERS, {
    customerName: 'Nadine Kolb',
    orderDate: '2026-04-07',
    platformSoldOn: 'Etsy',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Order Item (Silver Earing – Gedreht = index 5, invIds[5])
  await db.add(STORES.ORDER_ITEMS, {
    customerOrderId: coId,
    inventoryId: invIds[5],
    shippingDate: '2026-04-08',
    trackingNumber: '4154458544',
    courierService: 'Deutsche Post',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
