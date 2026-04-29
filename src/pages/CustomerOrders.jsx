import { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { add, update, remove, STORES } from '../database/db';
import { Modal, Table, Field, Input, Select, Btn, PageHeader, Confirm } from '../components/UI';
import { Plus } from 'lucide-react';
import { searchMatch, formatDate } from '../utils/helpers';

const PLATFORMS = ['Shopify', 'Etsy', 'eBay'];
const EMPTY = { customerName: '', orderDate: '', platformSoldOn: 'Etsy' };

export default function CustomerOrders() {
  const { data, settings, refresh, showNotification, searchQuery } = useApp();
  const de = settings.language === 'de';
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const enriched = useMemo(() => data.customerOrders.map(co => ({
    ...co,
    itemCount: data.orderItems.filter(oi => oi.customerOrderId === co.id).length,
  })), [data]);

  const filtered = useMemo(() => enriched.filter(co =>
    searchMatch(co.customerName, searchQuery) || searchMatch(co.platformSoldOn, searchQuery)
  ), [enriched, searchQuery]);

  function openNew() { setForm({ ...EMPTY, orderDate: new Date().toISOString().split('T')[0] }); setEditing(null); setModal(true); }
  function openEdit(row) {
    const co = data.customerOrders.find(c => c.id === row.id);
    setForm({ customerName: co.customerName, orderDate: co.orderDate, platformSoldOn: co.platformSoldOn });
    setEditing(co); setModal(true);
  }
  function close() { setModal(false); }

  async function save() {
    if (!form.customerName.trim()) return;
    if (editing) {
      await update(STORES.CUSTOMER_ORDERS, { ...editing, ...form });
      showNotification(de ? 'Bestellung aktualisiert' : 'Order updated');
    } else {
      await add(STORES.CUSTOMER_ORDERS, form);
      showNotification(de ? 'Bestellung hinzugefügt' : 'Order added');
    }
    await refresh(STORES.CUSTOMER_ORDERS);
    close();
  }

  async function del() {
    await remove(STORES.CUSTOMER_ORDERS, confirm.id);
    await refresh(STORES.CUSTOMER_ORDERS);
    setConfirm(null);
  }

  const columns = [
    { key: 'id', label: 'ID', render: v => <span className="font-mono text-xs text-surface-500">#{v}</span> },
    { key: 'customerName', label: de ? 'Kunde' : 'Customer' },
    { key: 'orderDate', label: de ? 'Bestelldatum' : 'Order Date', render: v => formatDate(v) },
    { key: 'platformSoldOn', label: de ? 'Plattform' : 'Platform', render: v => (
      <span className="text-xs px-2 py-0.5 rounded-md bg-surface-700 text-surface-300">{v}</span>
    )},
    { key: 'itemCount', label: de ? 'Artikel' : 'Items', render: v => <span className="font-mono">{v}</span> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={de ? 'Kundenbestellungen' : 'Customer Orders'}
        sub={`${filtered.length} ${de ? 'Bestellungen' : 'orders'}`}
        action={<Btn onClick={openNew}><Plus size={14} className="inline mr-1.5" />{de ? 'Hinzufügen' : 'Add'}</Btn>}
      />
      <div className="bg-surface-800/40 border border-surface-700/40 rounded-xl overflow-hidden">
        <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={setConfirm} emptyMsg={de ? 'Keine Bestellungen gefunden' : 'No orders found'} />
      </div>

      <Modal open={modal} onClose={close} title={editing ? (de ? 'Bestellung bearbeiten' : 'Edit Order') : (de ? 'Bestellung hinzufügen' : 'Add Order')}>
        <div className="space-y-4">
          <Field label={de ? 'Kundenname' : 'Customer Name'} required>
            <Input value={form.customerName} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} placeholder="Max Mustermann" />
          </Field>
          <Field label={de ? 'Bestelldatum' : 'Order Date'} required>
            <Input type="date" value={form.orderDate} onChange={e => setForm(p => ({ ...p, orderDate: e.target.value }))} />
          </Field>
          <Field label={de ? 'Verkaufsplattform' : 'Platform Sold On'}>
            <Select value={form.platformSoldOn} onChange={e => setForm(p => ({ ...p, platformSoldOn: e.target.value }))}>
              {PLATFORMS.map(pl => <option key={pl} value={pl}>{pl}</option>)}
            </Select>
          </Field>
          <div className="flex gap-3 pt-2">
            <Btn onClick={save}>{de ? 'Speichern' : 'Save'}</Btn>
            <Btn variant="secondary" onClick={close}>{de ? 'Abbrechen' : 'Cancel'}</Btn>
          </div>
        </div>
      </Modal>

      <Confirm open={!!confirm} onConfirm={del} onCancel={() => setConfirm(null)} />
    </div>
  );
}
