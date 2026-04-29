import { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { exportAllData, importAllData } from '../database/db';
import { Card, Field, Input, Select, Btn, PageHeader } from '../components/UI';
import { downloadJSON } from '../utils/helpers';
import BarcodeDisplay from '../components/BarcodeDisplay';
import { Download, Upload, Moon, Sun, Globe } from 'lucide-react';

export default function Settings() {
  const { settings, updateSetting, showNotification, reloadAll } = useApp();
  const de = settings.language === 'de';
  const [importing, setImporting] = useState(false);

  async function handleExport() {
    const data = await exportAllData();
    const filename = `elexua-backup-${new Date().toISOString().split('T')[0]}.json`;
    downloadJSON(data, filename);
    showNotification(de ? 'Daten exportiert' : 'Data exported');
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllData(data);
      await reloadAll();
      showNotification(de ? 'Daten importiert' : 'Data imported successfully');
    } catch (err) {
      showNotification(de ? 'Import fehlgeschlagen' : 'Import failed', 'error');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  const sampleBarcode = `10001-EE53332-AAZ`;
  const sampleCustomerBarcode = `10001-EE53332-AAZ-220426`;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={de ? 'Einstellungen' : 'Settings'} sub={de ? 'System konfigurieren' : 'Configure your warehouse system'} />

      {/* Return Days */}
      <Card>
        <h2 className="font-display font-semibold text-white mb-4">{de ? 'Rückgabefristen' : 'Return Periods'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={de ? 'Kunden-Rückgabetage' : 'Customer Return Days'}>
            <Input
              type="number"
              min="1"
              value={settings.customerReturnDays}
              onChange={e => updateSetting('customerReturnDays', Number(e.target.value))}
            />
            <p className="text-surface-500 text-xs mt-1">
              {de ? 'Standard: 20 Tage' : 'Default: 20 days'}
            </p>
          </Field>
          <Field label={de ? 'Lieferanten-Rückgabetage' : 'Supplier Return Days'}>
            <Input
              type="number"
              min="1"
              value={settings.supplierReturnDays}
              onChange={e => updateSetting('supplierReturnDays', Number(e.target.value))}
            />
            <p className="text-surface-500 text-xs mt-1">
              {de ? 'Standard: 80 Tage' : 'Default: 80 days'}
            </p>
          </Field>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h2 className="font-display font-semibold text-white mb-4">{de ? 'Erscheinungsbild' : 'Appearance'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={de ? 'Farbschema' : 'Theme'}>
            <div className="flex gap-2">
              <button
                onClick={() => updateSetting('theme', 'dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-colors ${settings.theme === 'dark' ? 'bg-brand-600 border-brand-500 text-white' : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white'}`}
              >
                <Moon size={14} />
                {de ? 'Dunkel' : 'Dark'}
              </button>
              <button
                onClick={() => updateSetting('theme', 'light')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-colors ${settings.theme === 'light' ? 'bg-brand-600 border-brand-500 text-white' : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white'}`}
              >
                <Sun size={14} />
                {de ? 'Hell' : 'Light'}
              </button>
            </div>
          </Field>
          <Field label={de ? 'Sprache' : 'Language'}>
            <div className="flex gap-2">
              <button
                onClick={() => updateSetting('language', 'en')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-colors ${settings.language === 'en' ? 'bg-brand-600 border-brand-500 text-white' : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white'}`}
              >
                <Globe size={14} />
                English
              </button>
              <button
                onClick={() => updateSetting('language', 'de')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-colors ${settings.language === 'de' ? 'bg-brand-600 border-brand-500 text-white' : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white'}`}
              >
                <Globe size={14} />
                Deutsch
              </button>
            </div>
          </Field>
        </div>
      </Card>

      {/* Barcode Preview */}
      <Card>
        <h2 className="font-display font-semibold text-white mb-1">{de ? 'Barcode-Vorschau' : 'Barcode Preview'}</h2>
        <p className="text-surface-500 text-xs mb-5">{de ? 'So sehen generierte Barcodes aus' : 'Preview of generated barcode formats'}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-surface-400 text-xs font-medium uppercase tracking-wider mb-3">
              {de ? 'Lager-Barcode' : 'Storage Barcode'}
            </p>
            <p className="text-surface-600 text-xs font-mono mb-3">Format: SecretCode-ArticleID-BoxLabel</p>
            <BarcodeDisplay value={sampleBarcode} showPrint={false} />
          </div>
          <div>
            <p className="text-surface-400 text-xs font-medium uppercase tracking-wider mb-3">
              {de ? 'Kunden-Barcode' : 'Customer Barcode'}
            </p>
            <p className="text-surface-600 text-xs font-mono mb-3">Format: SecretCode-ArticleID-BoxLabel-DDMMYY</p>
            <BarcodeDisplay value={sampleCustomerBarcode} showPrint={false} />
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <h2 className="font-display font-semibold text-white mb-1">{de ? 'Datenverwaltung' : 'Data Management'}</h2>
        <p className="text-surface-500 text-xs mb-5">
          {de ? 'Exportieren Sie Ihre Daten als JSON-Sicherungsdatei oder importieren Sie eine vorhandene Sicherung.' : 'Export your data as a JSON backup file or import an existing backup.'}
        </p>
        <div className="flex flex-wrap gap-3">
          <Btn onClick={handleExport} variant="secondary">
            <Download size={14} className="inline mr-2" />
            {de ? 'Daten exportieren' : 'Export Data'}
          </Btn>
          <label className="cursor-pointer">
            <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
            <span className={`inline-flex items-center font-medium rounded-lg transition-all duration-150 px-4 py-2 text-sm bg-surface-700 hover:bg-surface-600 text-surface-200 ${importing ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={14} className="inline mr-2" />
              {importing ? (de ? 'Importieren…' : 'Importing…') : (de ? 'Daten importieren' : 'Import Data')}
            </span>
          </label>
        </div>
        <p className="text-surface-600 text-xs mt-4">
          {de
            ? '⚠️ Der Import überschreibt alle vorhandenen Daten. Erstellen Sie zuerst eine Sicherungskopie.'
            : '⚠️ Importing will overwrite all existing data. Create a backup first.'}
        </p>
      </Card>

      {/* App Info */}
      <Card>
        <h2 className="font-display font-semibold text-white mb-3">ELEXUA Warehouse System</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Storage', value: 'IndexedDB' },
            { label: de ? 'Modus' : 'Mode', value: de ? 'Offline-Fähig' : 'Offline Ready' },
            { label: de ? 'Nutzer' : 'Users', value: de ? 'Einzelbenutzer' : 'Single User' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-900/50 rounded-lg p-3 border border-surface-700/30">
              <p className="text-surface-500 mb-1">{label}</p>
              <p className="text-surface-200 font-mono">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-surface-600 text-xs mt-4">
          {de
            ? 'Zukünftige Version: Multi-Benutzer mit Cloud-Synchronisation geplant.'
            : 'Future version: Multi-user with cloud synchronization planned.'}
        </p>
      </Card>
    </div>
  );
}
