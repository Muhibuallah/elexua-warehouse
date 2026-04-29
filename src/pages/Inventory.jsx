import { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { add, update, remove, STORES } from '../database/db';
import { Modal, Table, Field, Input, Select, Btn, PageHeader, Confirm, Badge } from '../components/UI';
import { Plus } from 'lucide-react';
import { searchMatch, generateStorageBarcode } from '../utils/helpers';
import BarcodeDisplay from '../components/BarcodeDisplay';

const STATUSES = ['stored', 'sent_to_customer', 'returned_to_supplier', 'sold'];
const EMPTY = { productId: '', boxId: '', quantity: 1, status: 'stored' };

export default function Inventory() {
  const { data, settings, refresh, showNotification, searchQuery } = useApp();
  const de = settings.language === 'de';
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [barcodeItem, setBarcodeItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const enriched = useMemo(() => data.inventory.map(inv => {
    const product = data.products.find(p => p.id === inv.productId);
    const box = data.boxes.find(b => b.id === inv.boxId);
    const barcode = generateStorageBarcode(product?.secretCode, product?.supplierArticleId, box?.boxLabel);
    return {
      ...inv,
      productName: product?.productName,
      secretCode: product?.secretCode,
      supplierArticleId: product?.supplierArticleId,
      boxLabel: box?.boxLabel,
      barcode,
      product,
      box,
    };
  }), [data]);

  const filtered = useMemo(() => enriched.filter(i => {
    const matchSearch = searchMatch(i.productName, searchQuery) ||
      searchMatch(i.barcode, searchQuery) ||
      searchMatch(i.boxLabel, searchQuery) ||
      searchMatch(i.secretCode, searchQuery) ||
      searchMatch(i.supplierArticleId, searchQuery);
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  }), [enriched, searchQuery, statusFilter]);

  function openNew() { setForm(EMPTY); setEditing(null); setModal(true); }
  function openEdit(row) {
    const inv = data.inventory.find(i => i.id === row.id);
    setForm({ productId: inv.productId, boxId: inv.boxId, quantity: inv.quantity, status: inv.status });
    setEditing(inv); setModal(true);
  }
  function close() { setModal(false); }

  async function save() {
    const payload = { ...form, productId: Number(form.productId), boxId: Number(form.boxId), quantity: Number(form.quantity) };
    if (editing) {
      await update(STORES.INVENTORY, { ...editing, ...payload });
      showNotification('Inventory updated');
    } else {
      await add(STORES.INVENTORY, payload);
      showNotification('Inventory item added');
    }
    await refresh(STORES.INVENTORY);
    close();
  }

  async function del() {
    await remove(STORES.INVENTORY, confirm.id);
    await refresh(STORES.INVENTORY);
    setConfirm(null);
  }

  const statusLabels = { stored: de ? 'Eingelagert' : 'Stored', sent_to_customer: de ? 'Versandt' : 'Sent', returned_to_supplier: de ? 'Retourniert' : 'Returned', sold: de ? 'Verkauft' : 'Sold' };

  const columns = [
    { key: 'id', label: 'ID', render: v => <span className="font-mono text-xs text-surface-500">#{v}</span> },
    { key: 'productName', label: de ? 'Produkt' : 'Product' },
    { key: 'boxLabel', label: de ? 'Box' : 'Box', render: v => <span className="font-mono text-brand-300 font-bold">{v || '—'}</span> },
    { key: 'quantity', label: de ? 'Menge' : 'Qty', render: v => <span className="font-mono">{v}</span> },
    { key: 'barcode', label: de ? 'Strichcode' : 'Barcode', render: v => <span className="font-mono text-xs text-surface-400">{v || '—'}</span> },
    { key: 'status', label: de ? 'Status' : 'Status', render: (v) => <Badge label={statusLabels[v] || v} status={v} /> },
    { key: 'id', label: '', render: (_, row) => (
      <button onClick={() => setBarcodeItem(row)} className="text-xs px-2 py-1 bg-brand-600/20 hover:bg-brand-600/40 text-brand-300 rounded-md transition-colors">
        {de ? 'Barcode' : 'Barcode'}
      </button>
    )},
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={de ? 'Inventar' : 'Inventory'}
        sub={`${filtered.length} ${de ? 'Artikel' : 'items'}`}
        action={<Btn onClick={openNew}><Plus size={14} className="inline mr-1.5" />{de ? 'Hinzufügen' : 'Add'}</Btn>}
      />

      {/* Status filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${statusFilter === s ? 'bg-brand-600 border-brand-500 text-white' : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white'}`}
          >
            {s === 'all' ? (de ? 'Alle' : 'All') : (statusLabels[s] || s)}
          </button>
        ))}
      </div>

      <div className="bg-surface-800/40 border border-surface-700/40 rounded-xl overflow-hidden">
        <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={setConfirm} emptyMsg={de ? 'Keine Artikel gefunden' : 'No inventory items found'} />
      </div>

      <Modal open={modal} onClose={close} title={editing ? (de ? 'Artikel bearbeiten' : 'Edit Item') : (de ? 'Artikel hinzufügen' : 'Add Item')}>
        <div className="space-y-4">
          <Field label={de ? 'Produkt' : 'Product'} required>
            <Select value={form.productId} onChange={e => setForm(p => ({ ...p, productId: Number(e.target.value) }))}>
              <option value="">-- {de ? 'Auswählen' : 'Select'} --</option>
              {data.products.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
            </Select>
          </Field>
          <Field label="Box" required>
            <Select value={form.boxId} onChange={e => setForm(p => ({ ...p, boxId: Number(e.target.value) }))}>
              <option value="">-- {de ? 'Auswählen' : 'Select'} --</option>
              {data.boxes.map(b => <option key={b.id} value={b.id}>{b.boxLabel}</option>)}
            </Select>
          </Field>
          <Field label={de ? 'Menge' : 'Quantity'}>
            <Input type="number" min="1" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
          </Field>
          <Field label={de ? 'Status' : 'Status'}>
            <Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s} value={s}>{statusLabels[s] || s}</option>)}
            </Select>
          </Field>
          <div className="flex gap-3 pt-2">
            <Btn onClick={save}>{de ? 'Speichern' : 'Save'}</Btn>
            <Btn variant="secondary" onClick={close}>{de ? 'Abbrechen' : 'Cancel'}</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={!!barcodeItem} onClose={() => setBarcodeItem(null)} title={de ? 'Lager-Barcode' : 'Storage Barcode'}>
        {barcodeItem && (
          <div className="space-y-3">
            <p className="text-surface-300 text-sm font-medium">{barcodeItem.productName}</p>
            <p className="text-surface-500 text-xs">Box: <span className="text-brand-300 font-mono">{barcodeItem.boxLabel}</span></p>
            <BarcodeDisplay value={barcodeItem.barcode} label={`Storage: ${barcodeItem.barcode}`} />
          </div>
        )}
      </Modal>

      <Confirm open={!!confirm} onConfirm={del} onCancel={() => setConfirm(null)} />
    </div>
  );
}
