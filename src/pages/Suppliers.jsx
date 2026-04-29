import { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { add, update, remove, STORES } from '../database/db';
import { Modal, Table, Field, Input, Select, Btn, PageHeader, Confirm } from '../components/UI';
import { Plus } from 'lucide-react';
import { searchMatch } from '../utils/helpers';

const EMPTY = { supplierName: '', platformId: '', contactInfo: '' };

export default function Suppliers() {
  const { data, settings, refresh, showNotification, searchQuery } = useApp();
  const de = settings.language === 'de';
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const filtered = useMemo(() => data.suppliers.filter(s =>
    searchMatch(s.supplierName, searchQuery) || searchMatch(s.contactInfo, searchQuery)
  ), [data.suppliers, searchQuery]);

  const enriched = useMemo(() => filtered.map(s => ({
    ...s,
    platformName: data.platforms.find(p => p.id === s.platformId)?.platformName,
  })), [filtered, data.platforms]);

  function openNew() { setForm({ ...EMPTY, platformId: data.platforms[0]?.id || '' }); setEditing(null); setModal(true); }
  function openEdit(row) { setForm({ supplierName: row.supplierName, platformId: row.platformId, contactInfo: row.contactInfo }); setEditing(row); setModal(true); }
  function close() { setModal(false); }

  async function save() {
    if (!form.supplierName.trim()) return;
    const payload = { ...form, platformId: Number(form.platformId) };
    if (editing) {
      await update(STORES.SUPPLIERS, { ...editing, ...payload });
      showNotification(de ? 'Lieferant aktualisiert' : 'Supplier updated');
    } else {
      await add(STORES.SUPPLIERS, payload);
      showNotification(de ? 'Lieferant hinzugefügt' : 'Supplier added');
    }
    await refresh(STORES.SUPPLIERS);
    close();
  }

  async function del() {
    await remove(STORES.SUPPLIERS, confirm.id);
    await refresh(STORES.SUPPLIERS);
    showNotification(de ? 'Gelöscht' : 'Deleted', 'info');
    setConfirm(null);
  }

  const columns = [
    { key: 'supplierName', label: de ? 'Lieferant' : 'Supplier' },
    { key: 'platformName', label: de ? 'Plattform' : 'Platform' },
    { key: 'contactInfo', label: de ? 'Kontakt' : 'Contact', render: v => v ? <a href={`mailto:${v}`} className="text-brand-400 hover:underline font-mono text-xs">{v}</a> : '—' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={de ? 'Lieferanten' : 'Suppliers'}
        sub={`${enriched.length} ${de ? 'Lieferanten' : 'suppliers'}`}
        action={<Btn onClick={openNew}><Plus size={14} className="inline mr-1.5" />{de ? 'Hinzufügen' : 'Add'}</Btn>}
      />
      <div className="bg-surface-800/40 border border-surface-700/40 rounded-xl overflow-hidden">
        <Table columns={columns} data={enriched} onEdit={r => openEdit(data.suppliers.find(s => s.id === r.id))} onDelete={setConfirm} />
      </div>

      <Modal open={modal} onClose={close} title={editing ? (de ? 'Lieferant bearbeiten' : 'Edit Supplier') : (de ? 'Lieferant hinzufügen' : 'Add Supplier')}>
        <div className="space-y-4">
          <Field label={de ? 'Name' : 'Supplier Name'} required>
            <Input value={form.supplierName} onChange={e => setForm(p => ({ ...p, supplierName: e.target.value }))} />
          </Field>
          <Field label={de ? 'Plattform' : 'Platform'}>
            <Select value={form.platformId} onChange={e => setForm(p => ({ ...p, platformId: Number(e.target.value) }))}>
              <option value="">-- {de ? 'Auswählen' : 'Select'} --</option>
              {data.platforms.map(pl => <option key={pl.id} value={pl.id}>{pl.platformName}</option>)}
            </Select>
          </Field>
          <Field label={de ? 'Kontaktinfo' : 'Contact Info'}>
            <Input value={form.contactInfo} onChange={e => setForm(p => ({ ...p, contactInfo: e.target.value }))} placeholder="email / phone" />
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
