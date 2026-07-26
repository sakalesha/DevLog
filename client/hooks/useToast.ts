import { useState, useCallback } from 'react';
import { ToastData, ToastVariant } from '../components/ui/Toast';

let _nextId = 0;

/**
 * useToast — lightweight hook to trigger toast notifications.
 *
 * Usage:
 *   const { toasts, toast, dismissToast } = useToast();
 *
 *   // Render:
 *   <ToastContainer toasts={toasts} onDismiss={dismissToast} />
 *
 *   // Trigger:
 *   toast('Saved!', 'success');
 *   toast('Failed to save', 'error');
 *   toast('Loading...', 'info', 0); // 0 = no auto-dismiss
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration?: number) => {
      const id = String(++_nextId);
      setToasts(prev => [...prev, { id, message, variant, duration }]);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, toast, dismissToast };
}
