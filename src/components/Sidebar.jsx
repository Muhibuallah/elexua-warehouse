import { useApp } from '../hooks/useApp';
import {
  LayoutDashboard, Globe, Users, Package, Box, Layers,
  Archive, ShoppingCart, List, Settings, Menu, X, Search
} from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', labelDe: 'Dashboard', icon: LayoutDashboard },
  { id: 'platforms', label: 'Platforms', labelDe: 'Plattformen', icon: Globe },
  { id: 'suppliers', label: 'Suppliers', labelDe: 'Lieferanten', icon: Users },
  { id: 'platformOrders', label: 'Platform Orders', labelDe: 'Plattform-Bestellungen', icon: Package },
  { id: 'boxes', label: 'Boxes', labelDe: 'Boxen', icon: Box },
  { id: 'products', label: 'Products', labelDe: 'Produkte', icon: Layers },
  { id: 'inventory', label: 'Inventory', labelDe: 'Inventar', icon: Archive },
  { id: 'customerOrders', label: 'Customer Orders', labelDe: 'Kundenbestellungen', icon: ShoppingCart },
  { id: 'orderItems', label: 'Order Items', labelDe: 'Bestellpositionen', icon: List },
  { id: 'settings', label: 'Settings', labelDe: 'Einstellungen', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { currentPage, setCurrentPage, settings, searchQuery, setSearchQuery } = useApp();
  const de = settings.language === 'de';

  function nav(id) { setCurrentPage(id); onClose?.(); }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        w-64 bg-surface-900 border-r border-surface-700/50
        transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-surface-700/50">
          <div>
            <div className="font-display text-xl font-bold text-white tracking-tight">ELEXUA</div>
            <div className="text-[10px] text-surface-400 font-mono uppercase tracking-widest mt-0.5">
              Warehouse System
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-surface-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 bg-surface-800 border border-surface-700/50 rounded-lg px-3 py-2">
            <Search size={14} className="text-surface-400 flex-shrink-0" />
            <input
              type="text"
              placeholder={de ? 'Suchen…' : 'Search…'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-surface-500 flex-1 outline-none"
            />
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {NAV.map(({ id, label, labelDe, icon: Icon }) => {
            const active = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => nav(id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group text-left
                  ${active
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800'
                  }
                `}
              >
                <Icon size={16} className={active ? 'text-white' : 'text-surface-500 group-hover:text-surface-300'} />
                <span>{de ? labelDe : label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-surface-700/50">
          <div className="text-[10px] text-surface-600 font-mono">v1.0.0 · Offline Ready</div>
        </div>
      </aside>
    </>
  );
}
