import { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { add, update, remove, STORES } from '../database/db';
import { Modal, Table, Field, Input, Select, Btn, PageHeader, Confirm, Badge } from '../components/UI';
import { Plus } from 'lucide-react';
import {
  searchMatch, formatDate, calcReturnDeadline, calcDaysLeft, calcReturnStatus,
  generateCustomerBarcode, generateStorageBarcode, daysLeftColor
} from '../utils/helpers';
import BarcodeDisplay from '../components/BarcodeDisplay';

const COURIERS = ['Deutsche Post', 'DHL', 'DPD', 'UPS', 'FedEx', 'Hermes', 'GLS'];
const EMPTY = { customerOrderId: '', inventoryId: '', shippingDate: '', trackingNumber: '', courierService: 'Deutsche Post' };

export default function OrderItems() {
  const { data, settings, refresh, showNotification, searchQuery } = useApp();
  const de = settings.language === 'de';
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [barcodeItem, setBarcodeItem] = useState(null);
  const [barcodeType, setBarcodeType] = useState('customer');

  const enriched = useMemo(() => data.orderItems.map(oi => {
    const returnDeadline = calcReturnDeadline(oi.shippingDate, settings.customerReturnDays);
    const daysLeft = calcDaysLeft(returnDeadline);
    const returnStatus = calcReturnStatus(daysLeft);
    const co = data.customerOrders.find(c => c.id === oi.customerOrderId);
    const inv = data.inventory.find(i => i.id === oi.inventoryId);
    const product = inv ? data.products.find(p => p.id === inv.productId) : null;
    const box = inv ? data.boxes.find(b => b.id === inv.boxId) : null;
    const customerBarcode = generateCustomerBarcode(product?.secretCode, product?.supplierArticleId, box?.boxLabel, oi.shippingDate);
    const storageBarcode = generateStorageBarcode(product?.secretCode, product?.supplierArticleId, box?.boxLabel);
    return {
      ...oi,
      returnDeadline,
      daysLeft,
      returnStatus,
      customerName: co?.customerName,
      platformSoldOn: co?.platformSoldOn,
      productName: product?.productName,
      boxLabel: box?.boxLabel,
      customerBarcode,
      storageBarcode,
      product,
      box,
    };
  }), [data, settings]);

  const filtered = useMemo(() => enriched.filter(oi =>
    searchMatch(oi.customerName, searchQuery) ||
    searchMatch(oi.productName, searchQuery) ||
    searchMatch(oi.customerBarcode, searchQuery) ||
    searchMatch(oi.trackingNumber, searchQuery)
  ), [enriched, searchQuery]);

  function openNew() {
    setForm({ ...EMPTY, shippingDate: new Date().toISOString().split('T')[0] });
    setEditing(null); setModal(true);
  }
  function openEdit(row) {
    const oi = data.orderItems.find(o => o.id === row.id);
    setForm({
      customerOrderId: oi.customerOrderId,
      inventoryId: oi.inventoryId,
      shippingDate: oi.shippingDate,
      trackingNumber: oi.trackingNumber || '',
      courierService: oi.courierService || 'Deutsche Post',
    });
    setEditing(oi); setModal(true);
  }
  function close() { setModal(false); }

  async function save() {
    if (!form.customerOrderId || !form.inventoryId) return;
    const payload = {
      ...form,
      customerOrderId: Number(form.customerOrderId),
      inventoryId: Number(form.inventoryId),
    };
    if (editing) {
      await update(STORES.ORDER_ITEMS, { ...editing, ...payload });
      showNotification(de ? 'Bestellposition aktualisiert' : 'Order item updated');
    } else {
      await add(STORES.ORDER_ITEMS, payload);
      // Also update inventory status to sent_to_customer
      const inv = data.inventory.find(i => i.id === Number(form.inventoryId));
      if (inv) await update(STORES.INVENTORY, { ...inv, status: 'sent_to_customer' });
      await refresh(STORES.INVENTORY);
      showNotification(de ? 'Bestellposition hinzugefügt' : 'Order item added');
    }
    await refresh(STORES.ORDER_ITEMS);
    close();
  }

  async function del() {
    await remove(STORES.ORDER_ITEMS, confirm.id);
    await refresh(STORES.ORDER_ITEMS);
    setConfirm(null);
  }

  function openBarcode(row, type) {
    setBarcodeItem(row);
    setBarcodeType(type);
  }

  const columns = [
    { key: 'id', label: 'ID', render: v => <span className="font-mono text-xs text-surface-500">#{v}</span> },
    { key: 'customerName', label: de ? 'Kunde' : 'Customer' },
    { key: 'productName', label: de ? 'Produkt' : 'Product', render: v => <span className="text-sm text-surface-300">{v || '—'}</span> },
    { key: 'shippingDate', label: de ? 'Versanddatum' : 'Shipped', render: v => formatDate(v) },
    { key: 'returnDeadline', label: de ? 'Rückgabefrist' : 'Return Deadline', render: v => formatDate(v) },
    { key: 'daysLeft', label: de ? 'Tage übrig' : 'Days Left', render: v => (
      <span className={`font-mono font-bold text-sm ${daysLeftColor(v)}`}>{v ?? '—'}</span>
    )},
    { key: 'returnStatus', label: de ? 'Status' : 'Status', render: v => <Badge label={v} status={v} /> },
    { key: 'trackingNumber', label: de ? 'Tracking' : 'Tracking', render: v => v ? <span className="font-mono text-xs text-surface-400">{v}</span> : '—' },
    { key: 'id', label: de ? 'Barcodes' : 'Barcodes', render: (_, row) => (
      <div className="flex gap-1.5">
        <button onClick={() => openBarcode(row, 'customer')} className="text-xs px-2 py-0.5 bg-brand-600/20 hover:bg-brand-600/40 text-brand-300 rounded transition-colors">
          {de ? 'Kunde' : 'Customer'}
        </button>
        <button onClick={() => openBarcode(row, 'storage')} className="text-xs px-2 py-0.5 bg-surface-700 hover:bg-surface-600 text-surface-300 rounded transition-colors">
          {de ? 'Lager' : 'Storage'}
        </button>
      </div>
    )},
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={de ? 'Bestellpositionen' : 'Order Items'}
        sub={`${filtered.length} ${de ? 'Positionen' : 'items'}`}
        action={<Btn onClick={openNew}><Plus size={14} className="inline mr-1.5" />{de ? 'Hinzufügen' : 'Add'}</Btn>}
      />
      <div className="bg-surface-800/40 border border-surface-700/40 rounded-xl overflow-x-auto">
        <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={setConfirm} emptyMsg={de ? 'Keine Positionen gefunden' : 'No order items found'} />
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={close} title={editing ? (de ? 'Position bearbeiten' : 'Edit Order Item') : (de ? 'Position hinzufügen' : 'Add Order Item')}>
        <div className="space-y-4">
          <Field label={de ? 'Kundenbestellung' : 'Customer Order'} required>
            <Select value={form.customerOrderId} onChange={e => setForm(p => ({ ...p, customerOrderId: Number(e.target.value) }))}>
              <option value="">-- {de ? 'Auswählen' : 'Select'} --</option>
              {data.customerOrders.map(co => (
                <option key={co.id} value={co.id}>{co.customerName} ({formatDate(co.orderDate)})</option>
              ))}
            </Select>
          </Field>
          <Field label={de ? 'Inventarartikel' : 'Inventory Item'} required>
            <Select value={form.inventoryId} onChange={e => setForm(p => ({ ...p, inventoryId: Number(e.target.value) }))}>
              <option value="">-- {de ? 'Auswählen' : 'Select'} --</option>
              {data.inventory.filter(i => i.status === 'stored' || i.id === form.inventoryId).map(i => {
                const prod = data.products.find(p => p.id === i.productId);
                const box = data.boxes.find(b => b.id === i.boxId);
                return <option key={i.id} value={i.id}>{prod?.productName} (Box {box?.boxLabel})</option>;
              })}
            </Select>
          </Field>
          <Field label={de ? 'Versanddatum' : 'Shipping Date'} required>
            <Input type="date" value={form.shippingDate} onChange={e => setForm(p => ({ ...p, shippingDate: e.target.value }))} />
          </Field>
          <Field label={de ? 'Trackingnummer' : 'Tracking Number'}>
            <Input value={form.trackingNumber} onChange={e => setForm(p => ({ ...p, trackingNumber: e.target.value }))} placeholder="4154458544" />
          </Field>
          <Field label={de ? 'Kurierdienst' : 'Courier Service'}>
            <Select value={form.courierService} onChange={e => setForm(p => ({ ...p, courierService: e.target.value }))}>
              {COURIERS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <div className="flex gap-3 pt-2">
            <Btn onClick={save}>{de ? 'Speichern' : 'Save'}</Btn>
            <Btn variant="secondary" onClick={close}>{de ? 'Abbrechen' : 'Cancel'}</Btn>
          </div>
        </div>
      </Modal>

      {/* Barcode Modal */}
      <Modal open={!!barcodeItem} onClose={() => setBarcodeItem(null)} title={barcodeType === 'customer' ? (de ? 'Kunden-Barcode' : 'Customer Barcode') : (de ? 'Lager-Barcode' : 'Storage Barcode')} size="md">
        {barcodeItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-surface-500 text-xs">{de ? 'Kunde' : 'Customer'}</span>
                <p className="text-white font-medium">{barcodeItem.customerName}</p>
              </div>
              <div>
                <span className="text-surface-500 text-xs">{de ? 'Produkt' : 'Product'}</span>
                <p className="text-white font-medium">{barcodeItem.productName}</p>
              </div>
              <div>
                <span className="text-surface-500 text-xs">{de ? 'Versand' : 'Shipped'}</span>
                <p className="text-surface-300">{formatDate(barcodeItem.shippingDate)}</p>
              </div>
              <div>
                <span className="text-surface-500 text-xs">{de ? 'Rückgabefrist' : 'Return By'}</span>
                <p className={daysLeftColor(barcodeItem.daysLeft)}>{formatDate(barcodeItem.returnDeadline)}</p>
              </div>
            </div>

            {/* Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setBarcodeType('customer')}
                className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${barcodeType === 'customer' ? 'bg-brand-600 border-brand-500 text-white' : 'bg-surface-800 border-surface-700 text-surface-400'}`}
              >
                {de ? 'Kunden-Barcode' : 'Customer Barcode'}
              </button>
              <button
                onClick={() => setBarcodeType('storage')}
                className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${barcodeType === 'storage' ? 'bg-brand-600 border-brand-500 text-white' : 'bg-surface-800 border-surface-700 text-surface-400'}`}
              >
                {de ? 'Lager-Barcode' : 'Storage Barcode'}
              </button>
            </div>

            <BarcodeDisplay
              value={barcodeType === 'customer' ? barcodeItem.customerBarcode : barcodeItem.storageBarcode}
              label={barcodeType === 'customer' ? `Customer: ${barcodeItem.customerBarcode}` : `Storage: ${barcodeItem.storageBarcode}`}
            />
          </div>
        )}
      </Modal>

      <Confirm open={!!confirm} onConfirm={del} onCancel={() => setConfirm(null)} />
    </div>
  );
}
