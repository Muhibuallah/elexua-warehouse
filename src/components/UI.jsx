import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { statusColor } from '../utils/helpers';

// Modal
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-surface-900 border border-surface-700/60 rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700/50 flex-shrink-0">
          <h2 className="font-display font-semibold text-white text-lg">{title}</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-800">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// Badge
export function Badge({ label, status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusColor(status || label)}`}>
      {label}
    </span>
  );
}

// Card
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface-800/60 border border-surface-700/40 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

// Stat Card
export function StatCard({ label, value, sub, accent, icon: Icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-800/60 border border-surface-700/40 rounded-xl p-5 ${onClick ? 'cursor-pointer hover:border-brand-500/50 transition-colors' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-surface-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-display font-bold mt-1 ${accent || 'text-white'}`}>{value}</p>
          {sub && <p className="text-surface-500 text-xs mt-1">{sub}</p>}
        </div>
        {Icon && <div className="p-2 bg-surface-700/50 rounded-lg"><Icon size={18} className="text-surface-300" /></div>}
      </div>
    </div>
  );
}

// Table
export function Table({ columns, data, onEdit, onDelete, emptyMsg = 'No records found' }) {
  if (!data?.length) {
    return <div className="text-center py-12 text-surface-500 text-sm">{emptyMsg}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-700/50">
            {columns.map(col => (
              <th key={col.key} className="text-left px-3 py-3 text-surface-400 font-medium text-xs uppercase tracking-wider whitespace-nowrap">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-3 py-3 text-surface-400 font-medium text-xs uppercase tracking-wider text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id ?? i} className="border-b border-surface-700/20 hover:bg-surface-700/20 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-3 py-3 text-surface-200 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button onClick={() => onEdit(row)} className="text-xs px-2.5 py-1 rounded-md bg-surface-700 hover:bg-surface-600 text-surface-300 hover:text-white transition-colors">
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row)} className="text-xs px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Form field
export function Field({ label, children, required }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-surface-300 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

// Input
export function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full bg-surface-800 border border-surface-600/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-colors"
    />
  );
}

// Select
export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full bg-surface-800 border border-surface-600/60 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-colors"
    >
      {children}
    </select>
  );
}

// Textarea
export function Textarea({ ...props }) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full bg-surface-800 border border-surface-600/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-colors resize-none"
    />
  );
}

// Button
export function Btn({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm shadow-brand-600/30',
    secondary: 'bg-surface-700 hover:bg-surface-600 text-surface-200',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30',
    ghost: 'hover:bg-surface-700 text-surface-400 hover:text-white',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };
  return (
    <button
      {...props}
      className={`font-medium rounded-lg transition-all duration-150 disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

// Page header
export function PageHeader({ title, sub, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
        {sub && <p className="text-surface-400 text-sm mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// Notification toast
export function Notification({ notification }) {
  if (!notification) return null;
  const colors = {
    success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    error: 'bg-red-500/20 border-red-500/40 text-red-300',
    info: 'bg-brand-500/20 border-brand-500/40 text-brand-300',
  };
  return (
    <div className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl border text-sm font-medium animate-slide-up ${colors[notification.type]}`}>
      {notification.msg}
    </div>
  );
}

// Confirm dialog
export function Confirm({ open, onConfirm, onCancel, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-surface-900 border border-surface-700 rounded-2xl p-6 max-w-sm w-full animate-slide-up">
        <p className="text-white text-sm mb-5">{message || 'Are you sure you want to delete this record?'}</p>
        <div className="flex gap-3 justify-end">
          <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
          <Btn variant="danger" onClick={onConfirm}>Delete</Btn>
        </div>
      </div>
    </div>
  );
}
