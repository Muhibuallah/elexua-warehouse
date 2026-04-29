import { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { add, update, remove, STORES } from '../database/db';
import { Modal, Table, Field, Input, Textarea, Btn, PageHeader, Confirm } from '../components/UI';
import { Plus } from 'lucide-react';
import { searchMatch } from '../utils/helpers';

const EMPTY = { platformName: '', website: '', notes: '' };

export default function Platforms() {
  const { data, settings, refresh, showNotification, searchQuery } = useApp();
  const de = settings.language === 'de';
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const filtered = useMemo(() => data.platforms.filter(p =>
    searchMatch(p.platformName, searchQuery) || searchMatch(p.website, searchQuery)
  ), [data.platforms, searchQuery]);

  function openNew() { setForm(EMPTY); setEditing(null); setModal(true); }
  function openEdit(row) { setForm({ platformName: row.platformName, website: row.website, notes: row.notes }); setEditing(row); setModal(true); }
  function close() { setModal(false); }

  async function save() {
    if (!form.platformName.trim()) return;
    if (editing) {
      await update(STORES.PLATFORMS, { ...editing, ...form });
      showNotification(de ? 'Plattform aktualisiert' : 'Platform updated');
    } else {
      await add(STORES.PLATFORMS, form);
      showNotification(de ? 'Plattform hinzugefügt' : 'Platform added');
    }
    await refresh(STORES.PLATFORMS);
    close();
  }

  async function del() {
    await remove(STORES.PLATFORMS, confirm.id);
    await refresh(STORES.PLATFORMS);
    showNotification(de ? 'Gelöscht' : 'Deleted', 'info');
    setConfirm(null);
  }

  const columns = [
    { key: 'platformName', label: de ? 'Name' : 'Platform Name' },
    { key: 'website', label: 'Website', render: v => v ? <a href={v} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">{v}</a> : '—' },
    { key: 'notes', label: de ? 'Notizen' : 'Notes', render: v => v || '—' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={de ? 'Plattformen' : 'Platforms'}
        sub={`${filtered.length} ${de ? 'Plattformen' : 'platforms'}`}
        action={<Btn onClick={openNew}><Plus size={14} className="inline mr-1.5" />{de ? 'Hinzufügen' : 'Add'}</Btn>}
      />
      <div className="bg-surface-800/40 border border-surface-700/40 rounded-xl overflow-hidden">
        <Table columns={columns} data={filtered} onEdit={openEdit} onDelete={setConfirm} />
      </div>

      <Modal open={modal} onClose={close} title={editing ? (de ? 'Plattform bearbeiten' : 'Edit Platform') : (de ? 'Plattform hinzufügen' : 'Add Platform')}>
        <div className="space-y-4">
          <Field label={de ? 'Name' : 'Platform Name'} required>
            <Input value={form.platformName} onChange={e => setForm(p => ({ ...p, platformName: e.target.value }))} placeholder="e.g. Temu" />
          </Field>
          <Field label="Website">
            <Input type="url" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://" />
          </Field>
          <Field label={de ? 'Notizen' : 'Notes'}>
            <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
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
