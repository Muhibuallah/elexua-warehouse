import { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { add, update, remove, STORES } from '../database/db';
import { Modal, Table, Field, Input, Select, Btn, PageHeader, Confirm, Badge } from '../components/UI';
import { Plus } from 'lucide-react';
import { searchMatch, calcKeepUntilDate, calcSupplierDaysLeft, calcSupplierReturnStatus, formatDate, daysLeftColor } from '../utils/helpers';

const EMPTY = { platformOrderNumber: '', platformId: '', orderDate: '', supplierReturnDays: 80 };

export default function PlatformOrders() {
  const { data, settings, refresh, showNotification, searchQuery } = useApp();
  const de = settings.language === 'de';
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const enriched = useMemo(() => data.platformOrders.map(po => {
    const keepUntil = calcKeepUntilDate(po.orderDate, po.supplierReturnDays || settings.supplierReturnDays);
    const daysLeft = calcSupplierDaysLeft(keepUntil);
    return {
      ...po,
      platformName: data.platforms.find(p => p.id === po.platformId)?.platformName,
      keepUntil, daysLeft,
      returnStatus: calcSupplierReturnStatus(daysLeft),
    };
  }), [data, settings]);

  const filtered = useMemo(() => enriched.filter(po =>
    searchMatch(po.platformOrderNumber, searchQuery) || searchMatch(po.platformName, searchQuery)
  ), [enriched, searchQuery]);

  function openNew() { setForm({ ...EMPTY, orderDate: new Date().toISOString().split('T')[0], supplierReturnDays: settings.supplierReturnDays }); setEditing(null); setModal(true); }
  function openEdit(row) {
    setForm({ platformOrderNumber: row.platformOrderNumber, platformId: row.platformId, orderDate: row.orderDate, supplierReturnDays: row.supplierReturnDays });
    setEditing(data.platformOrders.find(p => p.id === row.id));
    setModal(true);
  }
  function close() { setModal(false); }

  async function save() {
    if (!form.platformOrderNumber.trim()) return;
    const payload = { ...form, platformId: Number(form.platformId), supplierReturnDays: Number(form.supplierReturnDays) };
    if (editing) {
      await update(STORES.PLATFORM_ORDERS, { ...editing, ...payload });
      showNotification('Platform order updated');
    } else {
      await add(STORES.PLATFORM_ORDERS, payload);
      showNotification('Platform order added');
    }
    await refresh(STORES.PLATFORM_ORDERS);
    close();
  }

  async function del() {
    await remove(STORES.PLATFORM_ORDERS, confirm.id);
    await refresh(STORES.PLATFORM_ORDERS);
    setConfirm(null);
  }

  const columns = [
    { key: 'platformOrderNumber', label: de ? 'Bestellnummer' : 'Order Number', render: v => <span className="font-mono text-xs text-brand-300">{v}</span> },
    { key: 'platformName', label: de ? 'Plattform' : 'Platform' },
    { key: 'orderDate', label: de ? 'Bestelldatum' : 'Order Date', render: v => formatDate(v) },
    { key: 'supplierReturnDays', label: de ? 'Rückgabetage' : 'Return Days' },
    { key: 'keepUntil', label: de ? 'Behalten bis' : 'Keep Until', render: v => formatDate(v) },
    { key: 'daysLeft', label: de ? 'Tage übrig' : 'Days Left', render: (v) => <span className={`font-mono font-bold ${daysLeftColor(v)}`}>{v ?? '—'}</span> },
    { key: 'returnStatus', label: de ? 'Status' : 'Status', render: v => <Badge label={v} status={v} /> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={de ? 'Plattform-Bestellungen' : 'Platform Orders'}
        sub={`${filtered.length} ${de ? 'Bestellungen' : 'orders'}`}
        action={<Btn onClick={openNew}><Plus size={14} className="inline mr-1.5" />{de ? 'Hinzufügen' : 'Add'}</Btn>}
      />
      <div className="bg-surface-800/40 border border-surface-700/40 rounded-xl overflow-hidden">
        <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={setConfirm} emptyMsg={de ? 'Keine Bestellungen gefunden' : 'No orders found'} />
      </div>

      <Modal open={modal} onClose={close} title={editing ? 'Edit Platform Order' : 'Add Platform Order'}>
        <div className="space-y-4">
          <Field label="Order Number" required>
            <Input value={form.platformOrderNumber} onChange={e => setForm(p => ({ ...p, platformOrderNumber: e.target.value }))} placeholder="PO-076-..." />
          </Field>
          <Field label="Platform">
            <Select value={form.platformId} onChange={e => setForm(p => ({ ...p, platformId: Number(e.target.value) }))}>
              <option value="">-- Select --</option>
              {data.platforms.map(pl => <option key={pl.id} value={pl.id}>{pl.platformName}</option>)}
            </Select>
          </Field>
          <Field label="Order Date" required>
            <Input type="date" value={form.orderDate} onChange={e => setForm(p => ({ ...p, orderDate: e.target.value }))} />
          </Field>
          <Field label={`Supplier Return Days (default ${settings.supplierReturnDays})`}>
            <Input type="number" value={form.supplierReturnDays} onChange={e => setForm(p => ({ ...p, supplierReturnDays: e.target.value }))} />
          </Field>
          <div className="flex gap-3 pt-2">
            <Btn onClick={save}>Save</Btn>
            <Btn variant="secondary" onClick={close}>Cancel</Btn>
          </div>
        </div>
      </Modal>

      <Confirm open={!!confirm} onConfirm={del} onCancel={() => setConfirm(null)} />
    </div>
  );
}
