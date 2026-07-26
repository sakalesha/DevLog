import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  /** Auto-dismiss after ms. Defaults to 3500. Set to 0 to persist. */
  duration?: number;
}

interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
}

// ─── Single Toast ─────────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success:
    'bg-emerald-600/95 text-white border-emerald-500 shadow-emerald-600/25',
  error:
    'bg-red-600/95 text-white border-red-500 shadow-red-600/25',
  info:
    'bg-slate-800/95 text-white border-slate-700 shadow-slate-900/25',
};

const VARIANT_ICONS: Record<ToastVariant, React.FC<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export const Toast: React.FC<ToastProps> = ({ id, message, variant, duration = 3500, onDismiss }) => {
  const Icon = VARIANT_ICONS[variant];

  useEffect(() => {
    if (duration === 0) return;
    const t = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md
        animate-in slide-in-from-right-10 duration-300
        ${VARIANT_STYLES[variant]}
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="font-bold text-sm flex-1">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── Toast Container (portal) ─────────────────────────────────────────────────

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast {...t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body,
  );
};
