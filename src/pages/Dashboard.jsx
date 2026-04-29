import { useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { StatCard, Card, Badge } from '../components/UI';
import { calcReturnDeadline, calcDaysLeft, calcKeepUntilDate, calcSupplierDaysLeft, formatDate, daysLeftColor } from '../utils/helpers';
import { Archive, ShoppingCart, AlertTriangle, Clock, Package } from 'lucide-react';

export default function Dashboard() {
  const { data, settings, setCurrentPage } = useApp();
  const de = settings.language === 'de';

  const stats = useMemo(() => {
    const totalInventory = data.inventory.length;
    const stored = data.inventory.filter(i => i.status === 'stored').length;

    // Active customer returns (daysLeft >= 0)
    const activeReturns = data.orderItems.filter(oi => {
      const deadline = calcReturnDeadline(oi.shippingDate, settings.customerReturnDays);
      return calcDaysLeft(deadline) >= 0;
    });

    // Urgent (≤ 3 days)
    const urgent = activeReturns.filter(oi => {
      const deadline = calcReturnDeadline(oi.shippingDate, settings.customerReturnDays);
      return calcDaysLeft(deadline) <= 3;
    });

    // Supplier return warnings
    const supplierWarnings = data.platformOrders.filter(po => {
      const until = calcKeepUntilDate(po.orderDate, po.supplierReturnDays || settings.supplierReturnDays);
      const left = calcSupplierDaysLeft(until);
      return left !== null && left >= 0 && left <= 14;
    });

    return { totalInventory, stored, activeReturns: activeReturns.length, urgent: urgent.length, supplierWarnings: supplierWarnings.length };
  }, [data, settings]);

  // Recent inventory (last 5)
  const recentInventory = useMemo(() => {
    return [...data.inventory]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(inv => {
        const product = data.products.find(p => p.id === inv.productId);
        const box = data.boxes.find(b => b.id === inv.boxId);
        return { ...inv, productName: product?.productName, boxLabel: box?.boxLabel };
      });
  }, [data]);

  const urgentItems = useMemo(() => {
    return data.orderItems
      .map(oi => {
        const deadline = calcReturnDeadline(oi.shippingDate, settings.customerReturnDays);
        const daysLeft = calcDaysLeft(deadline);
        const co = data.customerOrders.find(c => c.id === oi.customerOrderId);
        const inv = data.inventory.find(i => i.id === oi.inventoryId);
        const prod = data.products.find(p => p.id === inv?.productId);
        return { ...oi, daysLeft, customerName: co?.customerName, productName: prod?.productName, deadline };
      })
      .filter(i => i.daysLeft !== null && i.daysLeft <= 10 && i.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [data, settings]);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{de ? 'Dashboard' : 'Dashboard'}</h1>
        <p className="text-surface-400 text-sm mt-0.5">{de ? 'Übersicht des Lagersystems' : 'Warehouse system overview'}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={de ? 'Gesamtbestand' : 'Total Inventory'}
          value={stats.totalInventory}
          sub={`${stats.stored} stored`}
          icon={Archive}
          onClick={() => setCurrentPage('inventory')}
        />
        <StatCard
          label={de ? 'Aktive Retouren' : 'Active Returns'}
          value={stats.activeReturns}
          sub={de ? 'Kunden' : 'Customer'}
          icon={ShoppingCart}
          onClick={() => setCurrentPage('orderItems')}
        />
        <StatCard
          label={de ? 'Dringende Retouren' : 'Urgent Returns'}
          value={stats.urgent}
          sub="≤ 3 days"
          accent={stats.urgent > 0 ? 'text-red-400' : 'text-white'}
          icon={AlertTriangle}
          onClick={() => setCurrentPage('orderItems')}
        />
        <StatCard
          label={de ? 'Lieferanten-Warnungen' : 'Supplier Warnings'}
          value={stats.supplierWarnings}
          sub="≤ 14 days"
          accent={stats.supplierWarnings > 0 ? 'text-amber-400' : 'text-white'}
          icon={Clock}
          onClick={() => setCurrentPage('platformOrders')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Urgent returns */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-400" />
            <h2 className="font-display font-semibold text-white text-sm uppercase tracking-wide">
              {de ? 'Dringende Retouren' : 'Urgent Returns'}
            </h2>
          </div>
          {urgentItems.length === 0 ? (
            <p className="text-surface-500 text-sm">{de ? 'Keine dringenden Retouren' : 'No urgent returns'} 🎉</p>
          ) : (
            <div className="space-y-3">
              {urgentItems.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-surface-700/30 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{item.customerName}</p>
                    <p className="text-surface-400 text-xs">{item.productName}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-mono font-bold ${daysLeftColor(item.daysLeft)}`}>
                      {item.daysLeft}d
                    </p>
                    <p className="text-surface-500 text-xs">{formatDate(item.deadline)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent inventory */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} className="text-brand-400" />
            <h2 className="font-display font-semibold text-white text-sm uppercase tracking-wide">
              {de ? 'Letzte Inventarbewegungen' : 'Recent Inventory Activity'}
            </h2>
          </div>
          {recentInventory.length === 0 ? (
            <p className="text-surface-500 text-sm">{de ? 'Keine Einträge' : 'No entries yet'}</p>
          ) : (
            <div className="space-y-2">
              {recentInventory.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-surface-700/30 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{item.productName}</p>
                    <p className="text-surface-400 text-xs">Box {item.boxLabel}</p>
                  </div>
                  <Badge label={item.status?.replace(/_/g, ' ')} status={item.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
