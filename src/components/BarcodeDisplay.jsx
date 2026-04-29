import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Btn } from './UI';
import { Printer } from 'lucide-react';

export default function BarcodeDisplay({ value, label, showPrint = true }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format: 'CODE128',
        width: 1.8,
        height: 60,
        displayValue: true,
        fontSize: 11,
        fontOptions: 'bold',
        background: 'transparent',
        lineColor: '#e2e8f0',
        textColor: '#94a3b8',
        margin: 8,
      });
    } catch (e) {
      console.error('Barcode error:', e);
    }
  }, [value]);

  function handlePrint() {
    const win = window.open('', '_blank', 'width=500,height=400');
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode - ${value}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: monospace; background: white; }
            svg { max-width: 400px; }
            p { font-size: 11px; color: #666; margin-top: 8px; }
          </style>
        </head>
        <body>
          <svg id="bc"></svg>
          <p>${label || value}</p>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
          <script>
            JsBarcode('#bc', ${JSON.stringify(value)}, {
              format: 'CODE128', width: 2, height: 80,
              displayValue: true, fontSize: 12, background: 'white', lineColor: '#000', textColor: '#333', margin: 10
            });
            window.onload = function() { window.print(); window.close(); }
          <\/script>
        </body>
      </html>
    `);
    win.document.close();
  }

  if (!value) return <div className="text-surface-500 text-sm">No barcode data</div>;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-surface-900/50 rounded-xl p-4 border border-surface-700/30">
        <svg ref={ref} className="max-w-full" />
      </div>
      <div className="font-mono text-xs text-surface-400">{value}</div>
      {showPrint && (
        <Btn variant="secondary" size="sm" onClick={handlePrint}>
          <Printer size={13} className="inline mr-1.5" />
          Print Barcode
        </Btn>
      )}
    </div>
  );
}
