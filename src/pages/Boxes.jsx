import { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { add, update, remove, STORES } from '../database/db';
import { Modal, Table, Field, Input, Select, Btn, PageHeader, Confirm } from '../components/UI';
import { Plus } from 'lucide-react';
import { searchMatch, formatDate } from '../utils/helpers';

const EMPTY = { boxLabel: '', platformOrderId: '', receivedDate: '' };

export default function Boxes() {
  const { data, settings, refresh, showNotification, searchQuery } = useApp();
  const de = settings.language === 'de';
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const enriched = useMemo(() => data.boxes.map(b => ({
    ...b,
    orderNumber: data.platformOrders.find(po => po.id === b.platformOrderId)?.platformOrderNumber,
    itemCount: data.inventory.filter(i => i.boxId === b.id).length,
  })), [data]);

  const filtered = useMemo(() => enriched.filter(b =>
    searchMatch(b.boxLabel, searchQuery) || searchMatch(b.orderNumber, searchQuery)
  ), [enriched, searchQuery]);

  function openNew() { setForm({ ...EMPTY, receivedDate: new Date().toISOString().split('T')[0] }); setEditing(null); setModal(true); }
  function openEdit(row) {
    const box = data.boxes.find(b => b.id === row.id);
    setForm({ boxLabel: box.boxLabel, platformOrderId: box.platformOrderId, receivedDate: box.receivedDate });
    setEditing(box); setModal(true);
  }
  function close() { setModal(false); }

  async function save() {
    if (!form.boxLabel.trim()) return;
    const payload = { ...form, platformOrderId: Number(form.platformOrderId) };
    if (editing) {
      await update(STORES.BOXES, { ...editing, ...payload });
      showNotification('Box updated');
    } else {
      await add(STORES.BOXES, payload);
      showNotification('Box added');
    }
    await refresh(STORES.BOXES);
    close();
  }

  async function del() {
    await remove(STORES.BOXES, confirm.id);
    await refresh(STORES.BOXES);
    setConfirm(null);
  }

  const columns = [
    { key: 'boxLabel', label: de ? 'Box-Bezeichnung' : 'Box Label', render: v => <span className="font-mono text-brand-300 font-bold">{v}</span> },
    { key: 'orderNumber', label: de ? 'Bestellnummer' : 'Platform Order', render: v => <span className="font-mono text-xs text-surface-300">{v || '—'}</span> },
    { key: 'receivedDate', label: de ? 'Eingangsdatum' : 'Received Date', render: v => formatDate(v) },
    { key: 'itemCount', label: de ? 'Artikel' : 'Items', render: v => <span className="font-mono">{v}</span> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={de ? 'Boxen' : 'Boxes'}
        sub={`${filtered.length} ${de ? 'Boxen' : 'boxes'}`}
        action={<Btn onClick={openNew}><Plus size={14} className="inline mr-1.5" />{de ? 'Hinzufügen' : 'Add'}</Btn>}
      />
      <div className="bg-surface-800/40 border border-surface-700/40 rounded-xl overflow-hidden">
        <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={setConfirm} />
      </div>

      <Modal open={modal} onClose={close} title={editing ? 'Edit Box' : 'Add Box'}>
        <div className="space-y-4">
          <Field label="Box Label" required>
            <Input value={form.boxLabel} onChange={e => setForm(p => ({ ...p, boxLabel: e.target.value.toUpperCase() }))} placeholder="A, B, AA, AAZ…" />
          </Field>
          <Field label="Platform Order">
            <Select value={form.platformOrderId} onChange={e => setForm(p => ({ ...p, platformOrderId: Number(e.target.value) }))}>
              <option value="">-- Select --</option>
              {data.platformOrders.map(po => <option key={po.id} value={po.id}>{po.platformOrderNumber}</option>)}
            </Select>
          </Field>
          <Field label="Received Date">
            <Input type="date" value={form.receivedDate} onChange={e => setForm(p => ({ ...p, receivedDate: e.target.value }))} />
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
