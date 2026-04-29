import { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { add, update, remove, STORES } from '../database/db';
import { Modal, Table, Field, Input, Select, Btn, PageHeader, Confirm } from '../components/UI';
import { Plus } from 'lucide-react';
import { searchMatch, generateStorageBarcode } from '../utils/helpers';
import BarcodeDisplay from '../components/BarcodeDisplay';

const EMPTY = { productName: '', supplierId: '', supplierArticleId: '', secretCode: '' };

export default function Products() {
  const { data, settings, refresh, showNotification, searchQuery } = useApp();
  const de = settings.language === 'de';
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [barcodeItem, setBarcodeItem] = useState(null);

  const enriched = useMemo(() => data.products.map(p => ({
    ...p,
    supplierName: data.suppliers.find(s => s.id === p.supplierId)?.supplierName,
    inventoryCount: data.inventory.filter(i => i.productId === p.id).length,
  })), [data]);

  const filtered = useMemo(() => enriched.filter(p =>
    searchMatch(p.productName, searchQuery) || searchMatch(p.secretCode, searchQuery) || searchMatch(p.supplierArticleId, searchQuery)
  ), [enriched, searchQuery]);

  function openNew() { setForm(EMPTY); setEditing(null); setModal(true); }
  function openEdit(row) {
    const prod = data.products.find(p => p.id === row.id);
    setForm({ productName: prod.productName, supplierId: prod.supplierId, supplierArticleId: prod.supplierArticleId, secretCode: prod.secretCode });
    setEditing(prod); setModal(true);
  }
  function close() { setModal(false); }

  async function save() {
    if (!form.productName.trim()) return;
    const payload = { ...form, supplierId: Number(form.supplierId), secretCode: Number(form.secretCode) };
    if (editing) {
      await update(STORES.PRODUCTS, { ...editing, ...payload });
      showNotification('Product updated');
    } else {
      await add(STORES.PRODUCTS, payload);
      showNotification('Product added');
    }
    await refresh(STORES.PRODUCTS);
    close();
  }

  async function del() {
    await remove(STORES.PRODUCTS, confirm.id);
    await refresh(STORES.PRODUCTS);
    setConfirm(null);
  }

  function showBarcode(row) {
    // Find first inventory item for this product to get box label
    const inv = data.inventory.find(i => i.productId === row.id);
    const box = inv ? data.boxes.find(b => b.id === inv.boxId) : null;
    const barcode = generateStorageBarcode(row.secretCode, row.supplierArticleId, box?.boxLabel || 'X');
    setBarcodeItem({ ...row, barcode, boxLabel: box?.boxLabel });
  }

  const columns = [
    { key: 'productName', label: de ? 'Produkt' : 'Product' },
    { key: 'supplierName', label: de ? 'Lieferant' : 'Supplier', render: v => <span className="text-surface-300 text-xs">{v || '—'}</span> },
    { key: 'supplierArticleId', label: de ? 'Art.-Nr.' : 'Article ID', render: v => <span className="font-mono text-xs text-brand-300">{v}</span> },
    { key: 'secretCode', label: de ? 'Geheimcode' : 'Secret Code', render: v => <span className="font-mono text-xs">{v}</span> },
    { key: 'inventoryCount', label: de ? 'Bestand' : 'Stock', render: v => <span className="font-mono">{v}</span> },
    { key: 'id', label: 'Barcode', render: (_, row) => (
      <button onClick={() => showBarcode(row)} className="text-xs px-2 py-1 bg-brand-600/20 hover:bg-brand-600/40 text-brand-300 rounded-md transition-colors">
        View
      </button>
    )},
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={de ? 'Produkte' : 'Products'}
        sub={`${filtered.length} ${de ? 'Produkte' : 'products'}`}
        action={<Btn onClick={openNew}><Plus size={14} className="inline mr-1.5" />{de ? 'Hinzufügen' : 'Add'}</Btn>}
      />
      <div className="bg-surface-800/40 border border-surface-700/40 rounded-xl overflow-hidden">
        <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={setConfirm} emptyMsg={de ? 'Keine Produkte' : 'No products found'} />
      </div>

      <Modal open={modal} onClose={close} title={editing ? 'Edit Product' : 'Add Product'}>
        <div className="space-y-4">
          <Field label="Product Name" required>
            <Input value={form.productName} onChange={e => setForm(p => ({ ...p, productName: e.target.value }))} />
          </Field>
          <Field label="Supplier">
            <Select value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: Number(e.target.value) }))}>
              <option value="">-- Select --</option>
              {data.suppliers.map(s => <option key={s.id} value={s.id}>{s.supplierName}</option>)}
            </Select>
          </Field>
          <Field label="Supplier Article ID">
            <Input value={form.supplierArticleId} onChange={e => setForm(p => ({ ...p, supplierArticleId: e.target.value }))} placeholder="EE53332" />
          </Field>
          <Field label="Secret Code">
            <Input type="number" value={form.secretCode} onChange={e => setForm(p => ({ ...p, secretCode: e.target.value }))} placeholder="1025" />
          </Field>
          <div className="flex gap-3 pt-2">
            <Btn onClick={save}>Save</Btn>
            <Btn variant="secondary" onClick={close}>Cancel</Btn>
          </div>
        </div>
      </Modal>

      <Modal open={!!barcodeItem} onClose={() => setBarcodeItem(null)} title="Storage Barcode">
        {barcodeItem && (
          <div className="space-y-3">
            <p className="text-surface-400 text-sm">{barcodeItem.productName}</p>
            <BarcodeDisplay value={barcodeItem.barcode} label={`Storage: ${barcodeItem.barcode}`} />
          </div>
        )}
      </Modal>

      <Confirm open={!!confirm} onConfirm={del} onCancel={() => setConfirm(null)} />
    </div>
  );
}
