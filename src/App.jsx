import { useState } from 'react';
import { AppProvider, useApp } from './hooks/useApp';
import Sidebar from './components/Sidebar';
import { Notification } from './components/UI';
import Dashboard from './pages/Dashboard';
import Platforms from './pages/Platforms';
import Suppliers from './pages/Suppliers';
import PlatformOrders from './pages/PlatformOrders';
import Boxes from './pages/Boxes';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import CustomerOrders from './pages/CustomerOrders';
import OrderItems from './pages/OrderItems';
import Settings from './pages/Settings';
import { Menu } from 'lucide-react';

const PAGES = {
  dashboard: Dashboard,
  platforms: Platforms,
  suppliers: Suppliers,
  platformOrders: PlatformOrders,
  boxes: Boxes,
  products: Products,
  inventory: Inventory,
  customerOrders: CustomerOrders,
  orderItems: OrderItems,
  settings: Settings,
};

function AppLayout() {
  const { currentPage, notification, loading } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const PageComponent = PAGES[currentPage] || Dashboard;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="font-display text-3xl font-bold text-white tracking-tight">ELEXUA</div>
          <div className="flex items-center gap-2 text-surface-500 text-sm justify-center">
            <span className="inline-block w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            Loading warehouse data…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-surface-900 border-b border-surface-700/50 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-surface-400 hover:text-white p-1">
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-white">ELEXUA</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <PageComponent />
        </main>
      </div>

      <Notification notification={notification} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
